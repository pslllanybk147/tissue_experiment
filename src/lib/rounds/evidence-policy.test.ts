import { describe, expect, it } from "vitest";
import type { RoundStep } from "./round-adapter";
import { evaluateStepEvidence } from "./evidence-policy";

function step(requirement: "none" | "one-photo" | "photo-with-caption"): RoundStep {
  return {
    id: "test-step",
    title: "ทดสอบ",
    summary: "ทดสอบ",
    why: "ทดสอบ",
    materials: [],
    actions: [],
    passCriteria: [],
    stopConditions: [],
    safetyNotes: [],
    measurements: [
      { id: "required-number", label: "ค่าบังคับ", unit: "count", required: true },
      { id: "optional-number", label: "ค่าไม่บังคับ", unit: "count", required: false },
    ],
    evidenceRequirement: requirement,
    evidence: { level: "adapted", sourceIds: ["source-test"] },
    durationMinutes: 1,
    order: 0,
    origin: "core",
    displayNumber: 1,
    state: { stepId: "test-step", status: "Pending", note: "", measurements: {} },
  };
}

describe("evaluateStepEvidence", () => {
  it("บอกช่องบังคับที่ยังไม่มีค่าโดยไม่นับเลขศูนย์ว่าเป็นค่าว่าง", () => {
    expect(evaluateStepEvidence(step("none"), {}, [])).toMatchObject({
      canPass: false,
      missingFieldIds: ["required-number"],
    });
    expect(evaluateStepEvidence(step("none"), { "required-number": 0 }, []).canPass).toBe(true);
  });

  it("บังคับอย่างน้อยหนึ่งรูปเมื่อกำหนด one-photo", () => {
    expect(evaluateStepEvidence(step("one-photo"), { "required-number": 1 }, [])).toEqual({
      canPass: false,
      missingFieldIds: [],
      missingPhotoCount: 1,
      missingCaptionCount: 0,
    });
    expect(evaluateStepEvidence(step("one-photo"), { "required-number": 1 }, [{ caption: "" }]).canPass).toBe(true);
  });

  it("บังคับคำบรรยายที่ไม่ใช่ช่องว่างเมื่อกำหนด photo-with-caption", () => {
    expect(evaluateStepEvidence(step("photo-with-caption"), { "required-number": 1 }, [{ caption: "   " }])).toEqual({
      canPass: false,
      missingFieldIds: [],
      missingPhotoCount: 0,
      missingCaptionCount: 1,
    });
    expect(evaluateStepEvidence(step("photo-with-caption"), { "required-number": 1 }, [{ caption: "อาหารยังใส" }]).canPass).toBe(true);
  });
});
