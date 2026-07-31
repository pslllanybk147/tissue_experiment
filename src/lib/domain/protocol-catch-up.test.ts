import { describe, expect, it } from "vitest";

import type { ProtocolStep, ProtocolStepRun } from "./models";
import { planProtocolCatchUp } from "./protocol-catch-up";

const makeStep = (order: number, durationMinutes: number | null = null): ProtocolStep => ({
  id: `step-${order}`,
  order,
  title: `ขั้น ${order}`,
  instruction: `ทำขั้น ${order}`,
  durationMinutes,
  criticalControls: [],
  safetyNotes: [],
  referenceIds: [],
  evidenceState: "Adapted",
  objective: `ทำขั้น ${order}`,
  requiredEvidence: [],
  allowPhoto: false,
  allowNote: true,
});

const steps = Array.from({ length: 10 }, (_, index) =>
  makeStep(index + 1, index === 7 ? 2880 : null),
);

const existingRun = (stepId: string, status: ProtocolStepRun["status"]): ProtocolStepRun => ({
  id: `run-${stepId}`,
  ownerId: "owner-1",
  lotId: "LOT-1",
  protocolId: "P-1",
  versionId: "V-1",
  stepId,
  status,
  note: "",
  measurements: {},
  mediaIds: [],
  observedAt: "2026-07-31T09:00:00.000Z",
  updatedAt: "2026-07-31T09:00:00.000Z",
});

const baseInput = {
  lotId: "LOT-1",
  protocolId: "P-1",
  versionId: "V-1",
  steps,
  runs: [] as ProtocolStepRun[],
  targetStepId: "step-9",
  confirmedTimedStepIds: ["step-8"],
  recordedAt: "2026-07-31T10:00:00.000Z",
};

describe("planProtocolCatchUp", () => {
  it("creates one carried-forward run for every unfinished step before the target", () => {
    const result = planProtocolCatchUp(baseInput);

    expect(result).toMatchObject({ state: "ready", targetIndex: 8 });
    if (result.state !== "ready") return;
    expect(result.runs).toHaveLength(8);
    expect(result.runs[7]).toMatchObject({
      stepId: "step-8",
      status: "Passed",
      note: "",
      completionMode: "carried-forward",
      carryForwardRecordedAt: "2026-07-31T10:00:00.000Z",
      carryForwardTargetStepId: "step-9",
    });
    expect(result.runs[7].completedAt).toBeUndefined();
  });

  it("requires confirmation before carrying a completed timer forward", () => {
    expect(planProtocolCatchUp({
      ...baseInput,
      confirmedTimedStepIds: [],
    })).toEqual({
      state: "timer-confirmation-required",
      stepId: "step-8",
      reason: "ยืนยันก่อนว่าขั้น 8 ครบเวลาที่กำหนดแล้ว",
    });
  });

  it("does not create a replacement for a step that already passed", () => {
    const result = planProtocolCatchUp({
      ...baseInput,
      runs: [existingRun("step-1", "Passed")],
    });

    expect(result.state).toBe("ready");
    if (result.state !== "ready") return;
    expect(result.runs.map((run) => run.stepId)).not.toContain("step-1");
    expect(result.runs).toHaveLength(7);
  });

  it.each(["Needs review", "Failed"] as const)(
    "blocks catch-up when an earlier step is %s",
    (status) => {
      expect(planProtocolCatchUp({
        ...baseInput,
        runs: [existingRun("step-3", status)],
      })).toEqual({
        state: "blocked-existing-result",
        stepId: "step-3",
        reason: "ขั้น 3 มีผลเดิมที่ต้องจัดการก่อน",
      });
    },
  );

  it("rejects a target step that is not in the protocol", () => {
    expect(planProtocolCatchUp({
      ...baseInput,
      targetStepId: "missing",
    })).toEqual({
      state: "invalid-target",
      reason: "ไม่พบขั้นที่เลือกใน Protocol นี้",
    });
  });
});
