import { describe, expect, it } from "vitest";
import type { ExperimentLot, ProtocolStepRun, TrialArmRole } from "@/lib/domain/models";
import { evaluateT3Eligibility } from "./t3-eligibility";

function lot(armRole: TrialArmRole): ExperimentLot {
  return {
    id: `lot-${armRole}`,
    ownerId: "owner-1",
    plant: "Violin",
    protocolId: "violin-variegated",
    protocolTitle: "Violin",
    stage: "check-contamination",
    status: "Healthy",
    startedAt: "2026-08-09",
    createdAt: "2026-08-09T00:00:00.000Z",
    updatedAt: "2026-08-09T00:00:00.000Z",
    trialId: "trial-1",
    armRole,
    isBlank: armRole === "control-b",
  };
}

function resultRun(role: "t1" | "t2", missing?: "container-total" | "container-clean" | "container-usable" | "observed-at"): ProtocolStepRun {
  const measurements: Record<string, number | null> = {
    "container-total": 8,
    "container-clean": 6,
    "container-usable": 5,
  };
  if (missing && missing !== "observed-at") measurements[missing] = null;

  return {
    id: `run-${role}`,
    ownerId: "owner-1",
    lotId: `lot-${role}`,
    protocolId: "violin-variegated",
    versionId: "manual-v1",
    stepId: "check-contamination",
    status: "Passed",
    note: "ตรวจครบแล้ว",
    measurements,
    mediaIds: [],
    observedAt: missing === "observed-at" ? "" : "2026-08-16T09:00:00.000Z",
    updatedAt: "2026-08-16T09:00:00.000Z",
  };
}

describe("evaluateT3Eligibility", () => {
  it("ปลดล็อกเมื่อ T1 และ T2 มีผลครบทั้งสี่ค่า", () => {
    const result = evaluateT3Eligibility(
      [lot("t1"), lot("t2"), lot("t3")],
      [resultRun("t1"), resultRun("t2")],
    );

    expect(result).toEqual({ unlocked: true, reason: "evidence-complete", missing: [] });
  });

  it.each([
    ["t1", "container-total"],
    ["t1", "container-clean"],
    ["t2", "container-usable"],
    ["t2", "observed-at"],
  ] as const)("ยังล็อกเมื่อ %s ขาด %s", (role, field) => {
    const runs = [resultRun("t1"), resultRun("t2")].map((run) =>
      run.lotId === `lot-${role}` ? resultRun(role, field) : run,
    );

    expect(evaluateT3Eligibility([lot("t1"), lot("t2"), lot("t3")], runs)).toMatchObject({
      unlocked: false,
      reason: "missing-results",
      missing: [`${role}:${field}`],
    });
  });

  it("ปลดล็อกด้วย override ที่ยืนยันและมีเหตุผลอย่างน้อย 20 ตัวอักษร", () => {
    const t3 = {
      ...lot("t3"),
      t3Override: {
        reason: "ต้องการทดสอบหลังประเมินความเสี่ยงครบถ้วนแล้ว",
        acknowledged: true,
        recordedAt: "2026-08-09T10:00:00.000Z",
        mode: "risk-override" as const,
      },
    };

    expect(evaluateT3Eligibility([lot("t1"), lot("t2"), t3], [])).toEqual({
      unlocked: true,
      reason: "override",
      missing: [],
    });
  });

  it("ไม่รับ override ที่เหตุผลสั้นหรือไม่ได้ยืนยัน", () => {
    const t3 = {
      ...lot("t3"),
      t3Override: {
        reason: "สั้นเกินไป",
        acknowledged: true,
        recordedAt: "2026-08-09T10:00:00.000Z",
        mode: "risk-override" as const,
      },
    };

    expect(evaluateT3Eligibility([lot("t1"), lot("t2"), t3], []).unlocked).toBe(false);
  });
});
