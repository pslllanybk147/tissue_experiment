export type MediumBatchInput = {
  explantCount: number;
  cultureJarCount: number;
  blankJarCount: number;
  spareJarCount: number;
  mediumPerJarMl: number;
  lossPercent: number;
};

export type MediumBatchPlan = {
  totalJarCount: number;
  baseVolumeMl: number;
  lossAllowanceMl: number;
  totalVolumeMl: number;
  warnings: string[];
};

export function calculateMediumBatchPlan(input: MediumBatchInput): MediumBatchPlan {
  const values = Object.values(input);
  if (values.some((value) => !Number.isFinite(value) || value < 0)) {
    throw new Error("จำนวนและปริมาตรต้องเป็นตัวเลขตั้งแต่ศูนย์ขึ้นไป");
  }
  if (input.explantCount < 1 || input.cultureJarCount < 1 || input.mediumPerJarMl <= 0) {
    throw new Error("ต้องมี explant กระปุกเพาะ และปริมาตรต่อกระปุกอย่างน้อย 1");
  }
  const totalJarCount = input.cultureJarCount + input.blankJarCount + input.spareJarCount;
  const baseVolumeMl = totalJarCount * input.mediumPerJarMl;
  const lossAllowanceMl = baseVolumeMl * input.lossPercent / 100;
  const warnings: string[] = [];
  if (input.cultureJarCount < input.explantCount) warnings.push("กระปุกเพาะน้อยกว่าจำนวน explant");
  if (input.blankJarCount < 1) warnings.push("ไม่มี Blank control สำหรับตรวจการปนเปื้อนของอาหาร");
  if (input.spareJarCount < 1) warnings.push("ไม่มีกระปุกสำรองสำหรับการย้ายฉุกเฉินหรือภาชนะเสีย");
  return {
    totalJarCount,
    baseVolumeMl,
    lossAllowanceMl,
    totalVolumeMl: Math.ceil(baseVolumeMl + lossAllowanceMl),
    warnings,
  };
}
