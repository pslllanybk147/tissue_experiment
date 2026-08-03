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
const tools = { scaleMinimumMg: 10, pipetteMinimumMl: 0.2, msLabelRateGPerL: 4.43 };

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

  it("บอกวิธีทำน้ำยาแม่ตั้งต้นด้วย เพราะผู้ใช้ที่บ้านยังไม่มีของชิ้นนั้น", () => {
    const plan = planMediumBatch(recipe, jars, tools);
    const bap = plan.lines.find((line) => line.name === "BAP") as { sourceStock: { massMg: number; volumeMl: number; concentrationMgPerMl: number } };

    expect(bap.sourceStock.concentrationMgPerMl).toBe(1);
    expect(bap.sourceStock.massMg).toBe(bap.sourceStock.volumeMl);
    // มวลที่สั่งให้ชั่งต้องสูงกว่าที่เครื่องชั่งอ่านได้อย่างมีระยะเผื่อ ไม่ใช่พอดีเป๊ะ
    expect(bap.sourceStock.massMg).toBeGreaterThanOrEqual(tools.scaleMinimumMg * 2);
  });

  it("เตือนเมื่อไม่มีกระปุกเปล่าคุม", () => {
    const plan = planMediumBatch(recipe, { ...jars, blankJars: 0 }, tools);

    expect(plan.warnings.join(" ")).toContain("Blank");
  });
});
