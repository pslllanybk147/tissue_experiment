/** คู่ขนานกับ haiter-calculations.ts แต่ต้นทางเป็นเม็ด NaDCC ไม่ใช่ขวดน้ำยาที่มี % บอกไว้แล้ว
 *  จึงมีขั้นแปลง "เม็ด → stock ppm" ก่อนเข้าสูตรเจือจางเดียวกัน (C1V1 = C2V2 แต่หน่วยเป็น ppm)
 *
 *  ก็อปชุดตัวเลข dilution factor/working volume จาก haiter-calculations.ts มาไว้ในไฟล์นี้แทนการ import
 *  ร่วมกัน เพื่อไม่แตะไฟล์เดิมที่ผ่านการทดสอบแล้ว ถ้ารูปแบบนี้พิสูจน์ตัวเองว่าใช้ได้ดี ค่อยรวมเป็นโมดูล
 *  กลางทีหลัง */

export type NadccStockInput = {
  /** น้ำหนัก NaDCC บริสุทธิ์ต่อเม็ด หน่วยมิลลิกรัม (ไม่ใช่น้ำหนักเม็ดทั้งเม็ด) */
  tabletMg: number;
  /** available chlorine ของ NaDCC บริสุทธิ์ เป็นเปอร์เซ็นต์ ค่ามาตรฐานทั่วไปคือ 60 */
  availableChlorinePercent: number;
  /** ปริมาตรน้ำที่ละลายเม็ดลงไปทำ stock หน่วยมิลลิลิตร */
  stockVolumeMl: number;
};

function round(value: number): number {
  return Number(value.toFixed(6));
}

function requirePositive(entries: Array<[string, number]>): void {
  if (entries.some(([, value]) => !Number.isFinite(value) || value <= 0)) {
    throw new Error("ค่าทุกช่องต้องเป็นตัวเลขที่มากกว่า 0");
  }
}

/** แปลงเม็ด NaDCC ที่ละลายในน้ำปริมาตรหนึ่ง ให้เป็นความเข้มข้น available chlorine หน่วย ppm (≈ mg/L) */
export function nadccStockPpm(input: NadccStockInput): number {
  requirePositive([
    ["tabletMg", input.tabletMg],
    ["availableChlorinePercent", input.availableChlorinePercent],
    ["stockVolumeMl", input.stockVolumeMl],
  ]);
  const availableChlorineMg = input.tabletMg * (input.availableChlorinePercent / 100);
  const stockVolumeL = input.stockVolumeMl / 1000;
  return round(availableChlorineMg / stockVolumeL);
}

export type NadccDoseInput = {
  stockPpm: number;
  targetPpm: number;
  finalVolumeMl: number;
  minimumMeasurableMl: number;
};

export type NadccDoseResult = {
  sourceVolumeMl: number;
  needsWorkingDilution: boolean;
  formula: string;
  warning?: string;
};

export function calculateNadccDose(input: NadccDoseInput): NadccDoseResult {
  requirePositive([
    ["stockPpm", input.stockPpm],
    ["targetPpm", input.targetPpm],
    ["finalVolumeMl", input.finalVolumeMl],
    ["minimumMeasurableMl", input.minimumMeasurableMl],
  ]);
  if (input.targetPpm >= input.stockPpm) {
    throw new Error("target ppm ต้องต่ำกว่า stock ppm");
  }

  const sourceVolumeMl = round((input.targetPpm * input.finalVolumeMl) / input.stockPpm);
  const needsWorkingDilution = sourceVolumeMl < input.minimumMeasurableMl;

  return {
    sourceVolumeMl,
    needsWorkingDilution,
    formula: `C1V1 = C2V2 → ${input.stockPpm} ppm × V1 = ${input.targetPpm} ppm × ${input.finalVolumeMl} mL`,
    warning: needsWorkingDilution
      ? `ต้องใช้ ${sourceVolumeMl} mL ซึ่งวัดไม่ได้อย่างน่าเชื่อถือด้วยเครื่องมือขั้นต่ำ ${input.minimumMeasurableMl} mL ควรทำ working dilution ก่อน`
      : undefined,
  };
}

export type NadccWorkingDilutionInput = {
  stockPpm: number;
  dilutionFactor: number;
  workingVolumeMl: number;
  targetPpm: number;
  finalVolumeMl: number;
  minimumMeasurableMl: number;
};

export type NadccWorkingDilutionResult = {
  workingPpm: number;
  sourceVolumeMl: number;
  diluentVolumeMl: number;
  workingDoseMl: number;
  isMeasurable: boolean;
  warning?: string;
};

export function planNadccWorkingDilution(input: NadccWorkingDilutionInput): NadccWorkingDilutionResult {
  requirePositive([
    ["stockPpm", input.stockPpm],
    ["dilutionFactor", input.dilutionFactor],
    ["workingVolumeMl", input.workingVolumeMl],
    ["targetPpm", input.targetPpm],
    ["finalVolumeMl", input.finalVolumeMl],
    ["minimumMeasurableMl", input.minimumMeasurableMl],
  ]);
  if (input.dilutionFactor <= 1) {
    throw new Error("dilution factor ต้องมากกว่า 1");
  }

  const workingPpm = round(input.stockPpm / input.dilutionFactor);

  if (workingPpm < input.targetPpm) {
    const directMl = round((input.targetPpm * input.finalVolumeMl) / input.stockPpm);
    const enough = directMl >= input.minimumMeasurableMl;
    throw new Error(
      `เจือจาง ${input.dilutionFactor} เท่าแล้วได้ working stock ${workingPpm} ppm ` +
        `ซึ่งอ่อนกว่าเป้าหมาย ${input.targetPpm} ppm จึงผสมยังไงก็ไม่ถึงเป้า` +
        (enough
          ? ` กรณีนี้ไม่ต้องทำ working dilution เลย ใช้แท็บคำนวณตรงแล้วตวงต้นทาง ${directMl} mL ได้เลย`
          : " ให้ลดจำนวนเท่าที่เจือจางลง จนกว่า working stock จะเข้มกว่าเป้าหมาย"),
    );
  }
  const sourceVolumeMl = round(input.workingVolumeMl / input.dilutionFactor);
  const diluentVolumeMl = round(input.workingVolumeMl - sourceVolumeMl);
  const workingDoseMl = round((input.targetPpm * input.finalVolumeMl) / workingPpm);
  const isMeasurable = workingDoseMl >= input.minimumMeasurableMl;

  return {
    workingPpm,
    sourceVolumeMl,
    diluentVolumeMl,
    workingDoseMl,
    isMeasurable,
    warning: isMeasurable
      ? undefined
      : `แม้เจือจาง ${input.dilutionFactor} เท่าแล้ว ปริมาตร ${workingDoseMl} mL ยังต่ำกว่าเครื่องมือขั้นต่ำ ${input.minimumMeasurableMl} mL`,
  };
}

export type NadccAutoInput = {
  tabletMg: number;
  availableChlorinePercent: number;
  stockVolumeMl: number;
  targetPpm: number;
  finalVolumeMl: number;
  minimumMeasurableMl: number;
};

export type NadccAutoResult =
  | { mode: "direct"; stockPpm: number; sourceVolumeMl: number; formula: string }
  | {
      mode: "working-dilution";
      stockPpm: number;
      dilutionFactor: number;
      workingPpm: number;
      workingVolumeMl: number;
      sourceVolumeMl: number;
      diluentVolumeMl: number;
      workingDoseMl: number;
    };

const nadccDilutionFactors = [2, 3, 4, 5, 6, 8, 10, 15, 20, 25, 30, 40, 50, 75, 100, 150, 200, 300, 500, 1000];
const nadccWorkingVolumesMl = [20, 50, 100, 200, 500, 1000];

/** คำนวณให้ครบตั้งแต่เม็ดจนถึงปริมาณที่ตวงจริงในขั้นตอนเดียว เหมือน planHaiterCleaningDose
 *  ต่างกันแค่ต้องแปลง "เม็ด → stock ppm" ก่อนเป็นก้าวแรกเสมอ */
export function planNadccCleaningDose(input: NadccAutoInput): NadccAutoResult {
  const stockPpm = nadccStockPpm({
    tabletMg: input.tabletMg,
    availableChlorinePercent: input.availableChlorinePercent,
    stockVolumeMl: input.stockVolumeMl,
  });
  const dose = calculateNadccDose({
    stockPpm,
    targetPpm: input.targetPpm,
    finalVolumeMl: input.finalVolumeMl,
    minimumMeasurableMl: input.minimumMeasurableMl,
  });
  if (!dose.needsWorkingDilution) {
    return { mode: "direct", stockPpm, sourceVolumeMl: dose.sourceVolumeMl, formula: dose.formula };
  }

  for (const dilutionFactor of nadccDilutionFactors) {
    for (const workingVolumeMl of nadccWorkingVolumesMl) {
      let candidate;
      try {
        candidate = planNadccWorkingDilution({
          stockPpm,
          dilutionFactor,
          workingVolumeMl,
          targetPpm: input.targetPpm,
          finalVolumeMl: input.finalVolumeMl,
          minimumMeasurableMl: input.minimumMeasurableMl,
        });
      } catch {
        continue;
      }

      const sourcePourIsMeasurable = candidate.sourceVolumeMl >= input.minimumMeasurableMl;
      const doseFitsInWorkingStock = candidate.workingDoseMl <= workingVolumeMl;
      if (!candidate.isMeasurable || !sourcePourIsMeasurable || !doseFitsInWorkingStock) {
        continue;
      }

      return {
        mode: "working-dilution",
        stockPpm,
        dilutionFactor,
        workingPpm: candidate.workingPpm,
        workingVolumeMl,
        sourceVolumeMl: candidate.sourceVolumeMl,
        diluentVolumeMl: candidate.diluentVolumeMl,
        workingDoseMl: candidate.workingDoseMl,
      };
    }
  }

  throw new Error(
    "อุปกรณ์ตวงละเอียดไม่พอสำหรับค่านี้ ต้องใช้อุปกรณ์ที่ตวงได้ละเอียดกว่านี้ หรือลดความเข้มข้นเป้าหมายลง",
  );
}
