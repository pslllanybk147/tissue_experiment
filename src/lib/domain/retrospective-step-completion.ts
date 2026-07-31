export type RetrospectiveCompletionPlan =
  | {
      state: "invalid";
      reason: string;
    }
  | {
      state: "waiting";
      timerStartedAt: string;
      timerEndsAt: string;
      remainingMinutes: number;
    }
  | {
      state: "complete";
      timerStartedAt?: string;
      timerEndsAt?: string;
      completedAt?: string;
    };

type RetrospectiveCompletionInput = {
  startedAt?: string;
  completedAt?: string;
  durationMinutes?: number | null;
  elapsedConfirmed?: boolean;
  now?: string;
};

function validDate(value: string): number | null {
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) ? timestamp : null;
}

export function planRetrospectiveCompletion({
  startedAt,
  completedAt,
  durationMinutes,
  elapsedConfirmed = false,
  now = new Date().toISOString(),
}: RetrospectiveCompletionInput): RetrospectiveCompletionPlan {
  const nowTimestamp = validDate(now);
  if (nowTimestamp == null) {
    return { state: "invalid", reason: "วันที่หรือเวลาไม่ถูกต้อง" };
  }
  if (durationMinutes != null && durationMinutes > 0 && elapsedConfirmed) {
    return { state: "complete" };
  }
  if (!durationMinutes && !startedAt && !completedAt) {
    return { state: "complete" };
  }
  if (!startedAt && completedAt) {
    const completedTimestamp = validDate(completedAt);
    if (completedTimestamp == null) {
      return { state: "invalid", reason: "วันที่หรือเวลาไม่ถูกต้อง" };
    }
    if (completedTimestamp > nowTimestamp) {
      return { state: "invalid", reason: "เวลาที่ทำเสร็จต้องไม่อยู่ในอนาคต" };
    }
    return {
      state: "complete",
      completedAt: new Date(completedTimestamp).toISOString(),
    };
  }
  const startedTimestamp = startedAt ? validDate(startedAt) : null;
  if (startedTimestamp == null) {
    return { state: "invalid", reason: "กรอกเวลาที่เริ่มทำจริง" };
  }
  if (startedTimestamp > nowTimestamp) {
    return { state: "invalid", reason: "เวลาเริ่มต้องไม่อยู่ในอนาคต" };
  }

  if (durationMinutes != null && durationMinutes > 0) {
    const timerEndsTimestamp = startedTimestamp + durationMinutes * 60_000;
    const timerStartedAt = new Date(startedTimestamp).toISOString();
    const timerEndsAt = new Date(timerEndsTimestamp).toISOString();
    if (timerEndsTimestamp <= nowTimestamp) {
      return {
        state: "complete",
        timerStartedAt,
        timerEndsAt,
        completedAt: timerEndsAt,
      };
    }
    return {
      state: "waiting",
      timerStartedAt,
      timerEndsAt,
      remainingMinutes: Math.ceil((timerEndsTimestamp - nowTimestamp) / 60_000),
    };
  }

  if (!completedAt) {
    return { state: "invalid", reason: "กรอกเวลาที่ทำเสร็จ" };
  }
  const completedTimestamp = validDate(completedAt);
  if (completedTimestamp == null) {
    return { state: "invalid", reason: "วันที่หรือเวลาไม่ถูกต้อง" };
  }
  if (completedTimestamp > nowTimestamp) {
    return { state: "invalid", reason: "เวลาที่ทำเสร็จต้องไม่อยู่ในอนาคต" };
  }
  if (completedTimestamp < startedTimestamp) {
    return { state: "invalid", reason: "เวลาที่ทำเสร็จต้องอยู่หลังเวลาเริ่ม" };
  }
  return {
    state: "complete",
    completedAt: new Date(completedTimestamp).toISOString(),
  };
}
