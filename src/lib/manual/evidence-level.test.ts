import { describe, expect, it } from "vitest";

import { manualEvidenceLevel } from "./evidence-level";
import type { EvidenceLevel, ResolvedManual, ResolvedStep } from "./types";

function step(id: string, level: EvidenceLevel): ResolvedStep {
  return {
    id,
    title: id,
    summary: "",
    why: "",
    materials: [],
    actions: [],
    passCriteria: [],
    stopConditions: [],
    safetyNotes: [],
    measurements: [],
    evidence: { level, sourceIds: level === "unsupported" ? [] : ["source-x"] },
    durationMinutes: null,
    order: 0,
    origin: "core",
  };
}

function manual(steps: ResolvedStep[]): ResolvedManual {
  return {
    slug: "test",
    scientificName: "Test",
    commonName: "ทดสอบ",
    method: "node",
    summary: "",
    durationLabel: "",
    steps,
    mediaRecipes: [],
    sourceIds: [],
  };
}

describe("กฎจุดอ่อนที่สุดของคู่มือ", () => {
  it("เอาระดับของขั้นที่อ่อนที่สุด ไม่ใช่ที่แข็งที่สุด", () => {
    const result = manualEvidenceLevel(manual([step("a", "species-direct"), step("b", "adapted")]));
    expect(result).toBe("adapted");
  });

  it("ขั้นเดียวที่ไม่มีงานรองรับ ลากทั้งเล่มลง", () => {
    const result = manualEvidenceLevel(manual([step("a", "species-direct"), step("b", "unsupported")]));
    expect(result).toBe("unsupported");
  });

  it("ข้อมูลจากตำราไม่ฉุดคะแนนของเล่ม", () => {
    const result = manualEvidenceLevel(manual([step("a", "species-direct"), step("b", "botanical-fact")]));
    expect(result).toBe("species-direct");
  });

  it("คู่มือที่มีแต่ข้อมูลจากตำรา ยังตัดสินไม่ได้", () => {
    expect(manualEvidenceLevel(manual([step("a", "botanical-fact")]))).toBeNull();
  });

  it("คู่มือที่ไม่มีขั้นเลย ยังตัดสินไม่ได้", () => {
    expect(manualEvidenceLevel(manual([]))).toBeNull();
  });

  it("สูตรอาหารนับรวมด้วย ไม่ใช่แค่ขั้นตอน", () => {
    const base = manual([step("a", "species-direct")]);
    base.mediaRecipes = [
      { id: "r1", title: "สูตร", pH: "5.8", ingredients: [], evidence: { level: "unsupported", sourceIds: [] } },
    ];
    expect(manualEvidenceLevel(base)).toBe("unsupported");
  });
});
