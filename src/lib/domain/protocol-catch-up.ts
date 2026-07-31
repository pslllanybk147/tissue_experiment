import type { ProtocolStep, ProtocolStepRun } from "./models";

export type ProtocolCatchUpInput = {
  lotId: string;
  protocolId: string;
  versionId: string;
  steps: ProtocolStep[];
  runs: ProtocolStepRun[];
  targetStepId: string;
  confirmedTimedStepIds: string[];
  recordedAt: string;
  approximateDate?: string;
};

export type CatchUpStepRun = Omit<
  ProtocolStepRun,
  "id" | "ownerId" | "updatedAt"
>;

export type ProtocolCatchUpPlan =
  | {
      state: "ready";
      targetIndex: number;
      runs: CatchUpStepRun[];
    }
  | { state: "invalid-target"; reason: string }
  | { state: "blocked-existing-result"; stepId: string; reason: string }
  | { state: "timer-confirmation-required"; stepId: string; reason: string };

export function planProtocolCatchUp({
  lotId,
  protocolId,
  versionId,
  steps,
  runs,
  targetStepId,
  confirmedTimedStepIds,
  recordedAt,
  approximateDate,
}: ProtocolCatchUpInput): ProtocolCatchUpPlan {
  const targetIndex = steps.findIndex((step) => step.id === targetStepId);
  if (targetIndex < 0) {
    return { state: "invalid-target", reason: "ไม่พบขั้นที่เลือกใน Protocol นี้" };
  }

  const runByStepId = new Map(runs.map((run) => [run.stepId, run]));
  const confirmedTimers = new Set(confirmedTimedStepIds);
  const skippedSteps = steps.slice(0, targetIndex);

  for (const step of skippedSteps) {
    const existing = runByStepId.get(step.id);
    if (existing?.status === "Needs review" || existing?.status === "Failed") {
      return {
        state: "blocked-existing-result",
        stepId: step.id,
        reason: `ขั้น ${step.order} มีผลเดิมที่ต้องจัดการก่อน`,
      };
    }
    if (
      existing?.status !== "Passed"
      && step.durationMinutes
      && !confirmedTimers.has(step.id)
    ) {
      return {
        state: "timer-confirmation-required",
        stepId: step.id,
        reason: `ยืนยันก่อนว่าขั้น ${step.order} ครบเวลาที่กำหนดแล้ว`,
      };
    }
  }

  const catchUpRuns = skippedSteps.flatMap<CatchUpStepRun>((step) => {
    if (runByStepId.get(step.id)?.status === "Passed") return [];
    return [{
      lotId,
      protocolId,
      versionId,
      stepId: step.id,
      status: "Passed",
      note: "",
      measurements: {},
      mediaIds: [],
      completionMode: "carried-forward",
      carryForwardRecordedAt: recordedAt,
      carryForwardTargetStepId: targetStepId,
      carryForwardApproximateDate: approximateDate,
      observedAt: recordedAt,
    }];
  });

  return { state: "ready", targetIndex, runs: catchUpRuns };
}
