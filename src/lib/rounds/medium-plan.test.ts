import { describe, expect, it } from "vitest";
import type { MediaRecipe } from "@/lib/manual/types";
import { planMediumBatch } from "./medium-plan";

const recipe: MediaRecipe = {
  id: "multiplication",
  title: "ระยะเพิ่มจำนวนยอด",
  pH: "5.7 ถึง 5.8",
  ingredients: [
    { name: "MS basal salts", amountPerLiter: 1, unit: "×" },
    { name: "Sucrose", amountPerLiter: 30, unit: "g/L" },
    { name: "Agar", amountPerLiter: 7.5, unit: "g/L" },
    { name: "BAP", amountPerLiter: 1, unit: "mg/L" },
  ],
  evidence: { level: "species-direct", sourceIds: ["source-pp-2023"] },
};

const jars = { cultureJars: 4, blankJars: 1, spareJars: 1, mlPerJar: 25, lossPercent: 15 };
const tools = {
  scaleMinimumMg: 10,
  pipetteMinimumMl: 0.2,
  msLabelRateGPerL: 4.43,
  bcdLabelRateGPerL: 1.2,
  naaStockMgPerMl: 1,
  baStockMgPerMl: 1,
  bapStockMgPerMl: 3,
  ibaStockMgPerMl: 1,
};

describe("planMediumBatch", () => {
  it("รวมกระปุกทุกชนิดแล้วเผื่อสูญเสียตามที่ตั้งไว้", () => {
    const plan = planMediumBatch(recipe, jars, tools);

    expect(plan.totalJars).toBe(6);
    expect(plan.totalVolumeMl).toBe(173);
  });

  it("สารที่ชั่งได้จะบอกเป็นกรัม", () => {
    const plan = planMediumBatch(recipe, jars, tools);
    const sucrose = plan.lines.find((line) => line.name === "Sucrose");

    expect(sucrose).toMatchObject({ kind: "weigh", unit: "g" });
    expect((sucrose as { amount: number }).amount).toBeCloseTo(5.19, 2);
  });

  it("MS ที่หน่วยเป็นเท่า คำนวณจากอัตราบนฉลากที่ผู้ใช้กรอก", () => {
    const plan = planMediumBatch(recipe, jars, tools);
    const ms = plan.lines.find((line) => line.name === "MS basal salts");

    expect(ms).toMatchObject({ kind: "weigh", unit: "g" });
    expect((ms as { amount: number }).amount).toBeCloseTo(0.766, 3);
  });

  it("BCD ที่หน่วยเป็นเท่าใช้ค่า BCD ของตัวเอง ไม่ใช้ค่า MS เป็น fallback", () => {
    const bcdRecipe: MediaRecipe = {
      ...recipe,
      ingredients: [{ name: "BCD basal salts", base: "BCD", amountPerLiter: 1, unit: "×" }],
    };
    const plan = planMediumBatch(bcdRecipe, jars, tools);
    const bcd = plan.lines.find((line) => line.name === "BCD basal salts");

    expect(bcd).toMatchObject({ kind: "weigh", unit: "g" });
    expect((bcd as { amount: number }).amount).toBeCloseTo(0.2076, 4);
  });

  it("ถ้ายังไม่กรอกอัตราบนฉลาก ต้องขอค่านั้นก่อน ห้ามเดา", () => {
    const plan = planMediumBatch(recipe, jars, { ...tools, msLabelRateGPerL: 0 });
    const ms = plan.lines.find((line) => line.name === "MS basal salts");

    expect(ms?.kind).toBe("needs-label-rate");
  });

  it("ฮอร์โมนที่มวลต่ำกว่าที่เครื่องชั่งอ่านได้ ต้องไม่ปัดเศษ แต่พาไปทำน้ำยาแม่", () => {
    const plan = planMediumBatch(recipe, jars, tools);
    const bap = plan.lines.find((line) => line.name === "BAP");

    expect(bap?.kind).toBe("working-stock");
    expect((bap as { requiredMg: number }).requiredMg).toBeCloseTo(0.173, 3);
  });

  it("BAP ใช้ BAP stock เท่านั้น ไม่ยืมค่า BA", () => {
    const plan = planMediumBatch(recipe, jars, { ...tools, baStockMgPerMl: 2, bapStockMgPerMl: 4 });
    const bap = plan.lines.find((line) => line.name === "BAP") as { plan: { state: string; workingDoseMl?: number } };

    expect(bap.plan.state).toBe("working-dilution");
    expect(bap.plan.workingDoseMl).toBeCloseTo(0.4325, 3);
  });

  it("ถ้าไม่มี stock ของฮอร์โมนตรงตัว ต้องบอกว่าคำนวณต่อไม่ได้", () => {
    const plan = planMediumBatch(recipe, jars, { ...tools, bapStockMgPerMl: 0 });
    const bap = plan.lines.find((line) => line.name === "BAP") as { plan: { state: string } };

    expect(bap.plan.state).toBe("blocked");
  });

  it("ฮอร์โมนที่ผู้ใช้ไม่มี stock ห้ามตกไปเป็นผงชั่ง แม้มวลรวมจะชั่งได้", () => {
    const tdzRecipe: MediaRecipe = {
      ...recipe,
      ingredients: [{ name: "TDZ", amountPerLiter: 4, unit: "mg/L" }],
    };
    const plan = planMediumBatch(tdzRecipe, jars, tools);
    const tdz = plan.lines[0] as { kind: string; plan: { state: string } };

    expect(tdz.kind).toBe("working-stock");
    expect(tdz.plan.state).toBe("blocked");
  });

  it("หน่วย mM แปลงเป็นมวลตาม molecular weight ไม่ใช่ตีความเป็น mg/L", () => {
    const saltRecipe: MediaRecipe = {
      ...recipe,
      ingredients: [{ name: "KNO3", amountPerLiter: 10, unit: "mM", molecularWeightGPerMol: 101.10 }],
    };
    const plan = planMediumBatch(saltRecipe, jars, tools);
    const salt = plan.lines[0] as { kind: string; amount: number };

    expect(salt.kind).toBe("weigh");
    expect(salt.amount).toBeCloseTo(0.175, 3);
  });

  it("บอกความเข้มข้น stock ที่ใช้จริง ไม่สมมติผงตั้งต้น 1 mg/mL", () => {
    const plan = planMediumBatch(recipe, jars, tools);
    const bap = plan.lines.find((line) => line.name === "BAP") as { stockConcentrationMgPerMl: number; plan: { state: string; workingDoseMl?: number } };

    expect(bap.stockConcentrationMgPerMl).toBe(3);
    expect(bap.plan.state).toBe("working-dilution");
    expect(bap.plan.workingDoseMl).toBeCloseTo(0.577, 3);
  });

  it("เตือนเมื่อไม่มีกระปุกเปล่าคุม", () => {
    const plan = planMediumBatch(recipe, { ...jars, blankJars: 0 }, tools);

    expect(plan.warnings.join(" ")).toContain("Blank");
  });
});
