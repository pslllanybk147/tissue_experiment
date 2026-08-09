import { describe, expect, it } from "vitest";

import type { Dose } from "@/lib/manual/forms/types";
import type { ResolvedStep } from "@/lib/manual/types";
import {
  bracketKey,
  buildBracketPlan,
  chooseBracketWinner,
  formatDurationMinRange,
  jarsPerArmKey,
  validateBracket,
  type BracketResult,
} from "./bracket";

const dose: Dose = {
  form: "น้ำยาซักผ้าขาว NaOCl 6%",
  low: 0.8,
  high: 2,
  unit: "%",
  durationMin: [10, 20],
  movesLowerWhen: [],
  movesHigherWhen: [],
  evidence: { level: "adapted", sourceIds: ["source-pp-2023"] },
};

function step(overrides: Partial<ResolvedStep> = {}): ResolvedStep {
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
    ...overrides,
  };
}

describe("แผนการทดสอบช่วง", () => {
  it("ขั้นที่ไม่มีค่าช่วง ไม่มีแผนทดสอบ", () => {
    expect(buildBracketPlan(step())).toBeNull();
  });

  it("ขั้นที่มีงานตรงพันธุ์แล้ว ไม่ต้องทดสอบ", () => {
    const found = buildBracketPlan(
      step({
        doses: { "sterilize.dose": dose },
        evidence: { level: "species-direct", sourceIds: ["source-pp-2023"] },
      }),
    );
    expect(found).toBeNull();
  });

  it("แบ่งช่วงเป็นสามชุด ปลายต่ำ กลาง ปลายสูง", () => {
    const plan = buildBracketPlan(step({ doses: { "sterilize.dose": dose } }))!;
    expect(plan.arms.map((arm) => arm.dose)).toEqual([0.8, 1.4, 2]);
    expect(plan.arms.map((arm) => arm.armId)).toEqual(["a", "b", "c"]);
  });

  it("ปัดค่ากลางให้อ่านง่าย ไม่เอาทศนิยมยาว", () => {
    const odd: Dose = { ...dose, low: 0.5, high: 1.2 };
    const plan = buildBracketPlan(step({ doses: { "sterilize.dose": odd } }))!;
    expect(plan.arms[1].dose).toBe(0.85);
  });

  it("มีค่าช่วงหลายคีย์ ใช้คีย์แรกตามลำดับตัวอักษร เพื่อให้ผลคงที่", () => {
    const plan = buildBracketPlan(
      step({
        doses: { "sterilize.dose": dose, "multiply.cytokinin": { ...dose, low: 1, high: 3 } },
      }),
    )!;
    expect(plan.doseKey).toBe("multiply.cytokinin");
  });

  it("คีย์ของบันทึกสร้างจากฟังก์ชันเดียว และไม่ชนกัน", () => {
    expect(bracketKey("a", "usable")).toBe("bracket-a-usable");
    expect(bracketKey("c", "dose")).toBe("bracket-c-dose");
    expect(jarsPerArmKey()).toBe("bracket-jars-per-arm");
    const all = new Set<string>();
    for (const armId of ["a", "b", "c"] as const) {
      for (const field of ["dose", "clean", "alive", "usable"] as const) all.add(bracketKey(armId, field));
    }
    all.add(jarsPerArmKey());
    expect(all.size).toBe(13);
  });
});

const arm = (
  armId: "a" | "b" | "c",
  doseValue: number,
  clean: number,
  alive: number,
  usable: number,
): BracketResult => ({ armId, dose: doseValue, clean, alive, usable });

describe("การตัดสินผลทดสอบช่วง", () => {
  it("กรอกไม่ครบสามชุด ยังตัดสินไม่ได้", () => {
    expect(chooseBracketWinner([arm("a", 0.8, 3, 3, 3)], 3).kind).toBe("incomplete");
  });

  it("เลือกชุดที่ใช้ได้มากที่สุด", () => {
    const outcome = chooseBracketWinner(
      [arm("a", 0.8, 1, 3, 1), arm("b", 1.4, 3, 3, 3), arm("c", 2, 3, 1, 1)],
      3,
    );
    expect(outcome).toMatchObject({ kind: "winner", armId: "b", dose: 1.4 });
  });

  it("เสมอกันให้เลือกชุดที่เข้มข้นต่ำกว่า เพราะเสียหายกับเนื้อเยื่อน้อยกว่า", () => {
    const outcome = chooseBracketWinner(
      [arm("a", 0.8, 2, 2, 2), arm("b", 1.4, 2, 2, 2), arm("c", 2, 2, 2, 2)],
      3,
    );
    expect(outcome).toMatchObject({ kind: "winner", armId: "a", dose: 0.8 });
  });

  it("ล้มทุกชุดเพราะติดเชื้อ ให้เพิ่มความเข้มข้น", () => {
    const outcome = chooseBracketWinner(
      [arm("a", 0.8, 0, 3, 0), arm("b", 1.4, 0, 3, 0), arm("c", 2, 1, 3, 0)],
      3,
    );
    expect(outcome).toMatchObject({ kind: "all-failed", direction: "up" });
  });

  it("ล้มทุกชุดเพราะชิ้นดำ ให้ลดความเข้มข้น", () => {
    const outcome = chooseBracketWinner(
      [arm("a", 0.8, 3, 0, 0), arm("b", 1.4, 3, 1, 0), arm("c", 2, 3, 0, 0)],
      3,
    );
    expect(outcome).toMatchObject({ kind: "all-failed", direction: "down" });
  });

  it("ล้มทุกชุดจากทั้งสองอาการเท่ากัน ต้องบอกให้แยกอาการก่อน", () => {
    const outcome = chooseBracketWinner(
      [arm("a", 0.8, 1, 1, 0), arm("b", 1.4, 1, 1, 0), arm("c", 2, 1, 1, 0)],
      3,
    );
    expect(outcome).toMatchObject({ kind: "all-failed", direction: "both" });
  });

  it("ผลที่ตัดสินได้ต้องกำกับว่าไม่ใช่ข้อพิสูจน์", () => {
    const outcome = chooseBracketWinner(
      [arm("a", 0.8, 1, 3, 1), arm("b", 1.4, 3, 3, 3), arm("c", 2, 3, 1, 1)],
      3,
    );
    expect(outcome.note).toContain("ไม่ใช่ข้อพิสูจน์");
  });
});

describe("การตรวจตัวเลขที่ขัดกันเอง", () => {
  it("ตัวเลขที่สมเหตุสมผล ไม่มีคำเตือน", () => {
    expect(validateBracket([arm("a", 0.8, 3, 3, 3)], 3)).toEqual([]);
  });

  it("ใช้ได้จริงมากกว่าจำนวนกระปุก เป็นไปไม่ได้", () => {
    expect(validateBracket([arm("a", 0.8, 3, 3, 4)], 3).length).toBeGreaterThan(0);
  });

  it("ใช้ได้จริงมากกว่ากระปุกที่ไม่ติดเชื้อ เป็นไปไม่ได้", () => {
    expect(validateBracket([arm("a", 0.8, 1, 3, 2)], 3).length).toBeGreaterThan(0);
  });

  it("ใช้ได้จริงมากกว่ากระปุกที่ชิ้นยังเขียว เป็นไปไม่ได้", () => {
    expect(validateBracket([arm("a", 0.8, 3, 1, 2)], 3).length).toBeGreaterThan(0);
  });

  it("คำเตือนบอกว่าเป็นชุดไหน", () => {
    expect(validateBracket([arm("c", 2, 3, 3, 9)], 3)[0]).toContain("C");
  });
});

describe("formatDurationMinRange", () => {
  it("ต้น-ปลายต่างกันแสดงเป็นช่วง", () => {
    expect(formatDurationMinRange([10, 20])).toBe("10 ถึง 20");
  });

  it("ต้น-ปลายเท่ากันยุบเหลือค่าเดียว ไม่ใช่ 'X ถึง X' ที่อ่านเหมือนพิมพ์ผิด", () => {
    expect(formatDurationMinRange([1, 1])).toBe("1");
  });
});
