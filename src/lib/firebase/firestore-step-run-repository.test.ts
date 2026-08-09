import { describe, expect, it } from "vitest";

import { removeUndefinedStepRunFields } from "./firestore-step-run-repository";

describe("Firestore step-run serialization", () => {
  it("removes optional undefined timer fields before writing", () => {
    expect(removeUndefinedStepRunFields({
      stepId: "step-1",
      timerStartedAt: undefined,
      timerEndsAt: undefined,
      completedAt: undefined,
      measurements: { pH: 5.7 },
    })).toEqual({
      stepId: "step-1",
      measurements: { pH: 5.7 },
    });
  });

  it("preserves retrospective audit fields while removing absent optional values", () => {
    expect(removeUndefinedStepRunFields({
      stepId: "step-1",
      completionMode: "retrospective",
      retrospectiveRecordedAt: "2026-07-31T09:00:00.000Z",
      timerStartedAt: "2026-07-29T08:00:00.000Z",
      timerEndsAt: "2026-07-31T08:00:00.000Z",
      completedAt: "2026-07-31T08:00:00.000Z",
      evidenceObservationId: undefined,
    })).toEqual({
      stepId: "step-1",
      completionMode: "retrospective",
      retrospectiveRecordedAt: "2026-07-31T09:00:00.000Z",
      timerStartedAt: "2026-07-29T08:00:00.000Z",
      timerEndsAt: "2026-07-31T08:00:00.000Z",
      completedAt: "2026-07-31T08:00:00.000Z",
    });
  });

  it("preserves carried-forward metadata without inventing completion time", () => {
    expect(removeUndefinedStepRunFields({
      stepId: "step-8",
      completionMode: "carried-forward",
      carryForwardRecordedAt: "2026-07-31T10:00:00.000Z",
      carryForwardTargetStepId: "step-9",
      carryForwardApproximateDate: undefined,
      completedAt: undefined,
    })).toEqual({
      stepId: "step-8",
      completionMode: "carried-forward",
      carryForwardRecordedAt: "2026-07-31T10:00:00.000Z",
      carryForwardTargetStepId: "step-9",
    });
  });

  it("เก็บ typed responses โดยไม่แปลงข้อความ วันที่ หรือ boolean เป็นตัวเลข", () => {
    expect(removeUndefinedStepRunFields({
      stepId: "sterilize",
      measurements: { "actual-ppm": 300 },
      responses: { "actual-ppm": 300, batch: "N60-A", date: "2026-08-09", "final-rinse": false },
    })).toEqual({
      stepId: "sterilize",
      measurements: { "actual-ppm": 300 },
      responses: { "actual-ppm": 300, batch: "N60-A", date: "2026-08-09", "final-rinse": false },
    });
  });
});
