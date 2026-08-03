import { calculateMediumBatchPlan } from "@/lib/domain/medium-batch-calculations";
import { calculateWorkingStock, type WorkingStockResult } from "@/lib/domain/working-stock-calculator";
import type { MediaRecipe } from "@/lib/manual/types";

export type ToolLimits = {
  /** เครื่องชั่งอ่านได้ต่ำสุดกี่มิลลิกรัม */
  scaleMinimumMg: number;
  /** อุปกรณ์ตวงอ่านได้ต่ำสุดกี่มิลลิลิตร */
  pipetteMinimumMl: number;
  /** อัตรากรัมต่อลิตรที่พิมพ์อยู่บนถุง MS ที่ผู้ใช้ซื้อมา ต่างยี่ห้อต่างกัน */
  msLabelRateGPerL: number;
};

export type JarPlanInput = {
  cultureJars: number;
  blankJars: number;
  spareJars: number;
  mlPerJar: number;
  lossPercent: number;
};

export type IngredientLine =
  & { name: string; note?: string }
  & (
    | { kind: "weigh"; amount: number; unit: "g" }
    | { kind: "measure"; amount: number; unit: "mL" }
    | {
      kind: "working-stock";
      requiredMg: number;
      /** วิธีทำน้ำยาแม่ตั้งต้น เพราะผู้ใช้ที่บ้านยังไม่มีของชิ้นนี้ ระบบจึงต้องบอกให้ครบ */
      sourceStock: { massMg: number; volumeMl: number; concentrationMgPerMl: number };
      plan: WorkingStockResult;
    }
    | { kind: "needs-label-rate"; message: string }
  );

export type MediumPlan = {
  totalJars: number;
  totalVolumeMl: number;
  baseVolumeMl: number;
  lossAllowanceMl: number;
  warnings: string[];
  lines: IngredientLine[];
};

/** ปริมาตรน้ำที่ใช้ทำน้ำยาแม่ ตั้งไว้พอทำได้จริงและเหลือใช้หลายรอบ */
const WORKING_SOLUTION_VOLUME_ML = 50;

/** ความเข้มข้นของน้ำยาแม่ตั้งต้น เลือก 1 mg/mL เพราะคำนวณต่อในหัวง่ายที่สุด */
const SOURCE_STOCK_MG_PER_ML = 1;

/**
 * มวลที่สั่งให้ชั่งทำน้ำยาแม่ ต้องสูงกว่าที่เครื่องชั่งอ่านได้หลายเท่า ไม่ใช่พอดีเป๊ะ
 * เพราะการชั่งที่ขีดต่ำสุดของเครื่องมีความคลาดเคลื่อนสูงมาก
 */
function sourceStockPlan(scaleMinimumMg: number) {
  const massMg = Math.max(25, Math.ceil(scaleMinimumMg * 5));
  return { massMg, volumeMl: massMg / SOURCE_STOCK_MG_PER_ML, concentrationMgPerMl: SOURCE_STOCK_MG_PER_ML };
}

export function planMediumBatch(recipe: MediaRecipe, jars: JarPlanInput, tools: ToolLimits): MediumPlan {
  const batch = calculateMediumBatchPlan({
    explantCount: Math.max(1, jars.cultureJars),
    cultureJarCount: jars.cultureJars,
    blankJarCount: jars.blankJars,
    spareJarCount: jars.spareJars,
    mediumPerJarMl: jars.mlPerJar,
    lossPercent: jars.lossPercent,
  });

  const litres = batch.totalVolumeMl / 1000;

  const lines: IngredientLine[] = recipe.ingredients.map((ingredient) => {
    const base = { name: ingredient.name, note: ingredient.note };

    if (ingredient.unit === "×") {
      if (!(tools.msLabelRateGPerL > 0)) {
        return {
          ...base,
          kind: "needs-label-rate",
          message: "กรอกอัตรากรัมต่อลิตรที่พิมพ์บนถุงที่คุณซื้อมาก่อน ระบบจะไม่เดาให้เพราะแต่ละยี่ห้อไม่เท่ากัน",
        };
      }
      return { ...base, kind: "weigh", unit: "g", amount: tools.msLabelRateGPerL * ingredient.amountPerLiter * litres };
    }

    const milligrams = ingredient.unit === "g/L"
      ? ingredient.amountPerLiter * litres * 1000
      : ingredient.amountPerLiter * litres;

    if (milligrams >= tools.scaleMinimumMg) {
      return { ...base, kind: "weigh", unit: "g", amount: milligrams / 1000 };
    }

    // ต่ำกว่าที่เครื่องชั่งอ่านได้ ห้ามปัดเศษให้ดูสวย ต้องพาไปทำน้ำยาแม่แทน
    return {
      ...base,
      kind: "working-stock",
      requiredMg: milligrams,
      sourceStock: sourceStockPlan(tools.scaleMinimumMg),
      plan: calculateWorkingStock({
        requiredMassMg: milligrams,
        sourceConcentrationMgPerMl: SOURCE_STOCK_MG_PER_ML,
        minimumToolVolumeMl: tools.pipetteMinimumMl,
        workingSolutionVolumeMl: WORKING_SOLUTION_VOLUME_ML,
      }),
    };
  });

  return {
    totalJars: batch.totalJarCount,
    totalVolumeMl: batch.totalVolumeMl,
    baseVolumeMl: batch.baseVolumeMl,
    lossAllowanceMl: batch.lossAllowanceMl,
    warnings: batch.warnings,
    lines,
  };
}
