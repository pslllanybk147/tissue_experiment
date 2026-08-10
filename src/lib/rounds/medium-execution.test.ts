import { describe, expect, it } from "vitest";
import type { MediaRecipe } from "@/lib/manual/types";
import { planMediumBatch } from "./medium-plan";
import { mediumInstructionOverride, type MediumExecutionContext } from "./medium-execution";

const recipe: MediaRecipe = {
  id: "establishment",
  title: "ระยะตั้งต้น",
  pH: "5.7 ถึง 5.8",
  ingredients: [
    { name: "MS basal salts", amountPerLiter: 1, unit: "×" },
    { name: "Sucrose", amountPerLiter: 30, unit: "g/L" },
    { name: "Agar", amountPerLiter: 7.5, unit: "g/L" },
  ],
  evidence: { level: "unsupported", sourceIds: [] },
};

const context: MediumExecutionContext = {
  recipe,
  plan: planMediumBatch(recipe, { cultureJars: 4, blankJars: 1, spareJars: 1, mlPerJar: 25, lossPercent: 15 }, {
    scaleMinimumMg: 10,
    pipetteMinimumMl: 0.2,
    msLabelRateGPerL: 4.43,
  }),
  mlPerJar: 25,
};

describe("mediumInstructionOverride", () => {
  it("แปลงผลคำนวณเป็นปริมาณจริงในข้อทำงาน ไม่ทิ้งคำว่า ตามสูตรที่เลือก", () => {
    const main = mediumInstructionOverride("ละลายส่วนผสมหลัก", context);
    const agar = mediumInstructionOverride("เติมผงวุ้น", context);
    const jars = mediumInstructionOverride("แบ่งและติดป้าย", context);

    expect(main.quantity).toContain("MS basal salts 0.766 g");
    expect(main.quantity).toContain("Sucrose 5.19 g");
    expect(agar.action).toContain("Agar 1.298 g");
    expect(jars.quantity).toContain("6 กระปุก");
    expect(jars.quantity).toContain("25 mL ต่อกระปุก");
    expect(JSON.stringify({ main, agar, jars })).not.toContain("ตามสูตรที่เลือก");
  });

  it("แสดงชื่อสูตร ปริมาตรรวม และค่า pH จริงของสูตรที่ผู้ใช้เลือก", () => {
    expect(mediumInstructionOverride("เลือกสูตรและคำนวณ batch", context).quantity)
      .toContain("ระยะตั้งต้น · 173 mL");
    expect(mediumInstructionOverride("ปรับ pH", context).quantity)
      .toBe("ระยะตั้งต้น: pH 5.7 ถึง 5.8");
  });
});
