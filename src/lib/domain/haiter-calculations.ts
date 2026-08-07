export type HaiterDoseInput = {
  sourcePercent: number;
  targetPercent: number;
  finalVolumeMl: number;
  minimumMeasurableMl: number;
};

export type HaiterDoseResult = {
  sourceVolumeMl: number;
  needsWorkingDilution: boolean;
  formula: string;
  warning?: string;
};

export type HaiterWorkingDilutionInput = {
  sourcePercent: number;
  dilutionFactor: number;
  workingVolumeMl: number;
  targetPercent: number;
  finalVolumeMl: number;
  minimumMeasurableMl: number;
};

export type HaiterWorkingDilutionResult = {
  workingPercent: number;
  sourceVolumeMl: number;
  diluentVolumeMl: number;
  workingDoseMl: number;
  isMeasurable: boolean;
  warning?: string;
};

function round(value: number): number {
  return Number(value.toFixed(6));
}

function requirePositive(entries: Array<[string, number]>): void {
  if (entries.some(([, value]) => !Number.isFinite(value) || value <= 0)) {
    throw new Error("ความเข้มข้นและปริมาตรทุกค่าต้องเป็นตัวเลขที่มากกว่า 0");
  }
}

export function calculateHaiterDose(input: HaiterDoseInput): HaiterDoseResult {
  requirePositive([
    ["sourcePercent", input.sourcePercent],
    ["targetPercent", input.targetPercent],
    ["finalVolumeMl", input.finalVolumeMl],
    ["minimumMeasurableMl", input.minimumMeasurableMl],
  ]);
  if (input.targetPercent >= input.sourcePercent) {
    throw new Error("target concentration ต้องต่ำกว่า source concentration");
  }

  const sourceVolumeMl = round(
    input.targetPercent * input.finalVolumeMl / input.sourcePercent,
  );
  const needsWorkingDilution = sourceVolumeMl < input.minimumMeasurableMl;

  return {
    sourceVolumeMl,
    needsWorkingDilution,
    formula: `C1V1 = C2V2 → ${input.sourcePercent}% × V1 = ${input.targetPercent}% × ${input.finalVolumeMl} mL`,
    warning: needsWorkingDilution
      ? `ต้องใช้ ${sourceVolumeMl} mL ซึ่งวัดไม่ได้อย่างน่าเชื่อถือด้วยเครื่องมือขั้นต่ำ ${input.minimumMeasurableMl} mL ควรทำ working dilution ก่อน`
      : undefined,
  };
}

export function planHaiterWorkingDilution(
  input: HaiterWorkingDilutionInput,
): HaiterWorkingDilutionResult {
  requirePositive([
    ["sourcePercent", input.sourcePercent],
    ["dilutionFactor", input.dilutionFactor],
    ["workingVolumeMl", input.workingVolumeMl],
    ["targetPercent", input.targetPercent],
    ["finalVolumeMl", input.finalVolumeMl],
    ["minimumMeasurableMl", input.minimumMeasurableMl],
  ]);
  if (input.dilutionFactor <= 1) {
    throw new Error("dilution factor ต้องมากกว่า 1");
  }

  const workingPercent = round(input.sourcePercent / input.dilutionFactor);

  // เจือจางแรงเกินไปจน working stock อ่อนกว่าเป้าหมาย ทำให้ไม่มีปริมาตรใดผสมแล้วถึงเป้าได้เลย
  // ถ้าไม่ดักตรงนี้ สูตร C1V1 = C2V2 จะคืนปริมาตรที่มากกว่าปริมาตรสุดท้าย
  // ซึ่งเทลงไปจริงไม่ได้ และผู้ใช้ที่เทตามอาจได้สารอ่อนกว่าที่คิดโดยไม่รู้ตัว แล้วฟอกไม่ขึ้น
  // calculateHaiterDose ดักกรณีคู่ขนานนี้อยู่แล้ว (target ต้องต่ำกว่า source) ตรงนี้เคยตกหล่นไป
  if (workingPercent < input.targetPercent) {
    const directMl = round(input.targetPercent * input.finalVolumeMl / input.sourcePercent);
    const enough = directMl >= input.minimumMeasurableMl;
    throw new Error(
      `เจือจาง ${input.dilutionFactor} เท่าแล้วได้ working stock ${workingPercent}% ` +
        `ซึ่งอ่อนกว่าเป้าหมาย ${input.targetPercent}% จึงผสมยังไงก็ไม่ถึงเป้า` +
        (enough
          ? ` กรณีนี้ไม่ต้องทำ working dilution เลย ใช้แท็บคำนวณตรงแล้วตวงต้นทาง ${directMl} mL ได้เลย`
          : " ให้ลดจำนวนเท่าที่เจือจางลง จนกว่า working stock จะเข้มกว่าเป้าหมาย"),
    );
  }
  const sourceVolumeMl = round(input.workingVolumeMl / input.dilutionFactor);
  const diluentVolumeMl = round(input.workingVolumeMl - sourceVolumeMl);
  const workingDoseMl = round(
    input.targetPercent * input.finalVolumeMl / workingPercent,
  );
  const isMeasurable = workingDoseMl >= input.minimumMeasurableMl;

  return {
    workingPercent,
    sourceVolumeMl,
    diluentVolumeMl,
    workingDoseMl,
    isMeasurable,
    warning: isMeasurable
      ? undefined
      : `แม้เจือจาง ${input.dilutionFactor} เท่าแล้ว ปริมาตร ${workingDoseMl} mL ยังต่ำกว่าเครื่องมือขั้นต่ำ ${input.minimumMeasurableMl} mL`,
  };
}

/** ฉลากน้ำยาฟอกขาวบอกเปอร์เซ็นต์ได้สองแบบ และไม่เท่ากัน
 *
 *  w/v คือกรัมของสารต่อสารละลาย 100 มิลลิลิตร ซึ่งเป็นแบบที่สูตร C1V1 = C2V2 ใช้ได้ตรง
 *  w/w คือกรัมของสารต่อสารละลาย 100 กรัม ซึ่งต้องคูณความหนาแน่นก่อนจึงจะเทียบกันได้
 *
 *  น้ำยาฟอกขาวใช้ในบ้านมีความหนาแน่นราว 1.08 g/mL การกรอกเลข w/w ลงไปตรง ๆ
 *  จึงทำให้ได้คลอรีนสูงกว่าที่ตั้งใจราว 8 เปอร์เซ็นต์ ไม่ถึงกับอันตราย แต่พอจะทำให้
 *  ผลรอบต่อรอบไม่ตรงกันโดยหาสาเหตุไม่เจอ */
export type LabelBasis = "w/v" | "w/w";

/** ความหนาแน่นโดยประมาณของน้ำยาฟอกขาวใช้ในบ้าน หน่วย g/mL
 *  เป็นค่ากลางของช่วงที่พบทั่วไป ไม่ใช่ค่าที่วัดจากขวดใดขวดหนึ่ง */
export const bleachDensityGPerMl = 1.08;

/** แปลงเปอร์เซ็นต์บนฉลากให้เป็น w/v เสมอ ก่อนส่งเข้าสูตรคำนวณ */
export function toWeightPerVolumePercent(labelPercent: number, basis: LabelBasis): number {
  if (!Number.isFinite(labelPercent) || labelPercent <= 0) {
    throw new Error("เปอร์เซ็นต์บนฉลากต้องเป็นตัวเลขที่มากกว่า 0");
  }
  if (basis === "w/v") return labelPercent;
  return round(labelPercent * bleachDensityGPerMl);
}
