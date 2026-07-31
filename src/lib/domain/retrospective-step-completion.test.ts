import { describe, expect, it } from "vitest";

import { planRetrospectiveCompletion } from "./retrospective-step-completion";

describe("planRetrospectiveCompletion", () => {
  it("completes a timed step when the real elapsed time already exceeds the timer", () => {
    expect(planRetrospectiveCompletion({
      startedAt: "2026-07-29T08:00:00.000Z",
      durationMinutes: 2880,
      now: "2026-07-31T09:00:00.000Z",
    })).toEqual({
      state: "complete",
      timerStartedAt: "2026-07-29T08:00:00.000Z",
      timerEndsAt: "2026-07-31T08:00:00.000Z",
      completedAt: "2026-07-31T08:00:00.000Z",
    });
  });

  it("counts only the remaining time when a timed step has not elapsed", () => {
    expect(planRetrospectiveCompletion({
      startedAt: "2026-07-31T08:00:00.000Z",
      durationMinutes: 2880,
      now: "2026-07-31T09:00:00.000Z",
    })).toEqual({
      state: "waiting",
      timerStartedAt: "2026-07-31T08:00:00.000Z",
      timerEndsAt: "2026-08-02T08:00:00.000Z",
      remainingMinutes: 2820,
    });
  });

  it("rejects a future start time", () => {
    expect(planRetrospectiveCompletion({
      startedAt: "2026-08-01T08:00:00.000Z",
      durationMinutes: 2880,
      now: "2026-07-31T09:00:00.000Z",
    })).toEqual({
      state: "invalid",
      reason: "เวลาเริ่มต้องไม่อยู่ในอนาคต",
    });
  });

  it("completes an untimed step from the recorded start and finish times", () => {
    expect(planRetrospectiveCompletion({
      startedAt: "2026-07-31T07:00:00.000Z",
      completedAt: "2026-07-31T08:00:00.000Z",
      now: "2026-07-31T09:00:00.000Z",
    })).toEqual({
      state: "complete",
      completedAt: "2026-07-31T08:00:00.000Z",
    });
  });

  it("rejects an untimed finish before its start", () => {
    expect(planRetrospectiveCompletion({
      startedAt: "2026-07-31T08:00:00.000Z",
      completedAt: "2026-07-31T07:00:00.000Z",
      now: "2026-07-31T09:00:00.000Z",
    })).toEqual({
      state: "invalid",
      reason: "เวลาที่ทำเสร็จต้องอยู่หลังเวลาเริ่ม",
    });
  });
});
