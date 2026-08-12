import { describe, expect, it } from "vitest";
import type { Dose } from "@/lib/manual/forms/types";
import type { ResolvedStep } from "@/lib/manual/types";
import { buildBracketPlan } from "./bracket";

const nadccRinseDose: Dose = {
  method: "nadcc",
  form: "น้ำ rinse NaDCC เจือจาง",
  low: 150,
  high: 450,
  unit: "mg/L",
  durationMin: [1, 1],
  movesLowerWhen: [],
  movesHigherWhen: [],
  evidence: { level: "adapted", sourceIds: ["source-pp-2023"] },
};

function sterilizeStep(): ResolvedStep {
  return {
    id: "sterilize",
    title: "ฟอกฆ่าเชื้อ",
    summary: "",
    why: "",
    materials: [],
    actions: [],
    passCriteria: [],
    stopConditions: [],
    safetyNotes: [],
    measurements: [],
    evidence: { level: "adapted", sourceIds: ["source-pp-2023"] },
    durationMinutes: null,
    order: 0,
    origin: "core",
    doses: { "sterilize.dose.nadcc": nadccRinseDose },
  } as ResolvedStep;
}

describe("buildBracketPlan กับวิธีที่รอบล็อกไว้", () => {
  it("ไม่แสดงช่วงของ NaDCC เมื่อรอบเลือกล้างด้วยน้ำปลอดเชื้อธรรมดาและฟอกด้วย Haiter", () => {
    const plan = buildBracketPlan(sterilizeStep(), {
      surfaceMethod: "haiter-chemical",
      rinseMethod: "commercial-sterile",
    });

    expect(plan).toBeNull();
  });

  it("แสดงช่วงของ NaDCC เมื่อรอบใช้น้ำ rinse NaDCC จริง", () => {
    const plan = buildBracketPlan(sterilizeStep(), {
      surfaceMethod: "haiter-chemical",
      rinseMethod: "nadcc",
    });

    expect(plan?.arms.map((arm) => arm.dose)).toEqual([150, 300, 450]);
  });

  it("แสดงช่วงของ NaDCC เมื่อรอบแช่ด้วย NaDCC ทั้งขั้น (T3)", () => {
    const plan = buildBracketPlan(sterilizeStep(), { surfaceMethod: "nadcc-soak", rinseMethod: null });

    expect(plan?.doseKey).toBe("sterilize.dose.nadcc");
  });

  it("หน้าคู่มืออ่านอย่างเดียวไม่รู้วิธีของรอบ จึงยังแสดงตามเดิม", () => {
    expect(buildBracketPlan(sterilizeStep())?.doseKey).toBe("sterilize.dose.nadcc");
  });
});
