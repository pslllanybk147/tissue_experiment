import { calculateMediumBatchPlan } from "@/lib/domain/medium-batch-calculations";
import { calculateWorkingStock, type WorkingStockResult } from "@/lib/domain/working-stock-calculator";
import type { MediaIngredient, MediaRecipe } from "@/lib/manual/types";

export type ToolLimits = {
  /** เครื่องชั่งอ่านได้ต่ำสุดกี่มิลลิกรัม */
  scaleMinimumMg: number;
  /** อุปกรณ์ตวงอ่านได้ต่ำสุดกี่มิลลิลิตร */
  pipetteMinimumMl: number;
  /** อัตรากรัมต่อลิตรที่พิมพ์อยู่บนถุง MS ที่ผู้ใช้ซื้อมา ต่างยี่ห้อต่างกัน */
  msLabelRateGPerL: number;
  /** อัตรากรัมต่อลิตรของ BCD สำเร็จรูป ถ้าไม่มีให้ใช้สูตร BCDAT ที่แจกแจงสารทีละตัว */
  bcdLabelRateGPerL?: number;
  naaStockMgPerMl?: number;
  baStockMgPerMl?: number;
  ibaStockMgPerMl?: number;
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
      stockConcentrationMgPerMl: number;
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

/** ปริมาตร working stock ที่ใช้เมื่อ stock เดิมตวงตรงไม่ได้ */
const WORKING_SOLUTION_VOLUME_ML = 50;

function baseLabelRate(ingredient: MediaIngredient, tools: ToolLimits): number {
  const inferredBase = ingredient.base ?? (ingredient.name.toLowerCase().includes("bcd") ? "BCD" : "MS");
  return inferredBase === "BCD" ? tools.bcdLabelRateGPerL ?? 0 : tools.msLabelRateGPerL;
}

function hormoneStockConcentration(name: string, tools: ToolLimits): number {
  const normalized = name.toLowerCase().replace(/[()\s-]/g, "");
  if (normalized.includes("naa")) return tools.naaStockMgPerMl ?? 0;
  if (normalized.includes("iba")) return tools.ibaStockMgPerMl ?? 0;
  if (normalized.includes("ba") || normalized.includes("bap")) return tools.baStockMgPerMl ?? 0;
  return 0;
}

function isHormoneIngredient(name: string): boolean {
  const normalized = name.toLowerCase().replace(/[()\s-]/g, "");
  return ["naa", "iba", "ba", "bap", "6ba", "tdz", "kinetin", "kinetin", "iaa"].some((marker) => normalized.includes(marker));
}

function blockedStockPlan(name: string): WorkingStockResult {
  return {
    state: "blocked",
    reason: `ยังไม่มีน้ำยาแม่ของ ${name} ที่ระบุความเข้มข้นได้`,
    safeAction: `หยุดก่อน อย่าแทน ${name} ด้วยผงหรือสารตัวอื่น จดความเข้มข้นบนฉลากแล้วกลับมาคำนวณใหม่`,
  };
}

function massMgForIngredient(ingredient: MediaIngredient, litres: number): number {
  if (ingredient.unit === "g/L") return ingredient.amountPerLiter * litres * 1000;
  if (ingredient.unit === "mg/L") return ingredient.amountPerLiter * litres;
  if (ingredient.unit === "mM" || ingredient.unit === "µM") {
    if (!(ingredient.molecularWeightGPerMol && ingredient.molecularWeightGPerMol > 0)) {
      throw new Error(`${ingredient.name} ต้องมีมวลโมเลกุลก่อนคำนวณหน่วย ${ingredient.unit}`);
    }
    const molar = ingredient.unit === "mM" ? ingredient.amountPerLiter / 1000 : ingredient.amountPerLiter / 1_000_000;
    return molar * ingredient.molecularWeightGPerMol * litres * 1_000;
  }
  throw new Error(`${ingredient.name} ไม่ใช่สารที่คำนวณเป็นมวลได้โดยตรง`);
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
      const labelRate = baseLabelRate(ingredient, tools);
      if (!(labelRate > 0)) {
        return {
          ...base,
          kind: "needs-label-rate",
          message: `${ingredient.base ?? (ingredient.name.toLowerCase().includes("bcd") ? "BCD" : "MS")} ต้องมีอัตรากรัมต่อลิตรจากฉลากก่อน ระบบจะไม่ใช้ค่า MS แทน`,
        };
      }
      return { ...base, kind: "weigh", unit: "g", amount: labelRate * ingredient.amountPerLiter * litres };
    }

    const milligrams = massMgForIngredient(ingredient, litres);
    const stockConcentrationMgPerMl = hormoneStockConcentration(ingredient.name, tools);

    // สูตรที่ระบุฮอร์โมนหมายถึงสารละลาย stock ในชุดอุปกรณ์นี้ ไม่ใช่ผงบริสุทธิ์
    // ถ้าไม่มี stock ที่ตรงตัว ให้หยุดแทนการชั่งหรือเดาค่า เพราะเป็นจุดที่ทำให้สูตรผิดได้ทั้ง batch
    if (isHormoneIngredient(ingredient.name)) {
      const plan = stockConcentrationMgPerMl > 0
        ? calculateWorkingStock({
            requiredMassMg: milligrams,
            sourceConcentrationMgPerMl: stockConcentrationMgPerMl,
            minimumToolVolumeMl: tools.pipetteMinimumMl,
            workingSolutionVolumeMl: WORKING_SOLUTION_VOLUME_ML,
          })
        : blockedStockPlan(ingredient.name);
      return { ...base, kind: "working-stock", requiredMg: milligrams, stockConcentrationMgPerMl, plan };
    }

    if (milligrams >= tools.scaleMinimumMg) {
      return { ...base, kind: "weigh", unit: "g", amount: milligrams / 1000 };
    }

    // ต่ำกว่าที่เครื่องชั่งอ่านได้ ห้ามปัดเศษให้ดูสวย ต้องพาไปทำน้ำยาแม่แทน
    return {
      ...base,
      kind: "working-stock",
      requiredMg: milligrams,
      stockConcentrationMgPerMl,
      plan: calculateWorkingStock({
        requiredMassMg: milligrams,
        sourceConcentrationMgPerMl: stockConcentrationMgPerMl,
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
