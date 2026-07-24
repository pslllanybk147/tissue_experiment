export type IntermediateStockDilutionInput = {
  sourceStockMgPerMl: number;
  workingStockMgPerMl: number;
  workingStockVolumeMl: number;
  targetMgPerL: number;
  finalMediumVolumeMl: number;
  minimumPipetteUl?: number;
};

export type IntermediateStockDilutionResult = {
  sourceStockVolumeMl: number;
  diluentVolumeMl: number;
  workingStockVolumeMl: number;
  workingStockVolumeUl: number;
  warning?: string;
};

/**
 * Plans an intermediate stock dilution using C1V1 = C2V2, then calculates
 * the volume of that working stock needed in the final medium batch.
 */
export function calculateIntermediateStockDilution(input: IntermediateStockDilutionInput): IntermediateStockDilutionResult {
  const values = [
    input.sourceStockMgPerMl,
    input.workingStockMgPerMl,
    input.workingStockVolumeMl,
    input.targetMgPerL,
    input.finalMediumVolumeMl,
  ];

  if (values.some((value) => !Number.isFinite(value) || value < 0)) {
    throw new Error("ความเข้มข้นและปริมาตรต้องเป็นตัวเลขที่ไม่ติดลบ");
  }
  if (input.sourceStockMgPerMl === 0 || input.workingStockMgPerMl === 0 || input.workingStockVolumeMl === 0 || input.finalMediumVolumeMl === 0) {
    throw new Error("ความเข้มข้น stock และปริมาตรต้องมากกว่า 0");
  }
  if (input.workingStockMgPerMl > input.sourceStockMgPerMl) {
    throw new Error("working stock ต้องมีความเข้มข้นไม่สูงกว่า source stock");
  }

  const sourceStockVolumeMl = round(input.workingStockMgPerMl * input.workingStockVolumeMl / input.sourceStockMgPerMl);
  const diluentVolumeMl = round(input.workingStockVolumeMl - sourceStockVolumeMl);
  const activeIngredientMg = input.targetMgPerL * input.finalMediumVolumeMl / 1000;
  const workingStockVolumeMl = round(activeIngredientMg / input.workingStockMgPerMl);
  const workingStockVolumeUl = round(workingStockVolumeMl * 1000);
  const minimumPipetteUl = input.minimumPipetteUl ?? 10;

  return {
    sourceStockVolumeMl,
    diluentVolumeMl,
    workingStockVolumeMl,
    workingStockVolumeUl,
    warning: workingStockVolumeUl < minimumPipetteUl
      ? `ปริมาตรที่ต้องดูด (${workingStockVolumeUl} µL) เล็กกว่าเกณฑ์แนะนำ ${minimumPipetteUl} µL ควรทำ working stock ที่เจือจางกว่า หรือเพิ่ม batch`
      : undefined,
  };
}

function round(value: number): number {
  return Number(value.toFixed(6));
}
