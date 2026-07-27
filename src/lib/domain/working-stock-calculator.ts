export type WorkingStockInput = {
  requiredMassMg: number;
  sourceConcentrationMgPerMl: number;
  minimumToolVolumeMl: number;
  workingSolutionVolumeMl: number;
};

export type WorkingStockResult =
  | { state: "blocked"; reason: string; safeAction: string }
  | {
      state: "direct";
      directDoseMl: number;
      actions: string[];
    }
  | {
      state: "working-dilution";
      directDoseMl: number;
      dilutionFactor: number;
      workingConcentrationMgPerMl: number;
      sourceVolumeMl: number;
      diluentVolumeMl: number;
      workingDoseMl: number;
      actions: string[];
    };

const dilutionFactors = [10, 100, 1000];

function valid(value: number) {
  return Number.isFinite(value) && value > 0;
}

export function calculateWorkingStock(input: WorkingStockInput): WorkingStockResult {
  if (![input.requiredMassMg, input.sourceConcentrationMgPerMl, input.minimumToolVolumeMl, input.workingSolutionVolumeMl].every(valid)) {
    return {
      state: "blocked",
      reason: "ตัวเลขทุกช่องต้องมากกว่า 0",
      safeAction: "ตรวจหน่วยบนฉลากและกรอกมวลเป็น mg ส่วนความเข้มข้นเป็น mg/mL",
    };
  }

  const directDoseMl = input.requiredMassMg / input.sourceConcentrationMgPerMl;
  if (directDoseMl >= input.minimumToolVolumeMl) {
    return {
      state: "direct",
      directDoseMl,
      actions: [
        `ตวง stock เดิม ${formatVolume(directDoseMl)} mL`,
        "เติมลงในอาหารตามลำดับของสูตร แล้วบันทึก batch",
      ],
    };
  }

  const dilutionFactor = dilutionFactors.find((factor) => {
    const sourceVolume = input.workingSolutionVolumeMl / factor;
    const workingDose = directDoseMl * factor;
    return sourceVolume >= input.minimumToolVolumeMl && workingDose >= input.minimumToolVolumeMl;
  });

  if (!dilutionFactor) {
    return {
      state: "blocked",
      reason: "ยังไม่มีสัดส่วน 1:10, 1:100 หรือ 1:1000 ที่ตวงได้ด้วยเครื่องมือนี้",
      safeAction: "เพิ่มปริมาตร working stock ที่จะเตรียม หรือใช้เครื่องมือตวงที่ละเอียดกว่า แล้วให้ระบบคำนวณใหม่",
    };
  }

  const sourceVolumeMl = input.workingSolutionVolumeMl / dilutionFactor;
  const diluentVolumeMl = input.workingSolutionVolumeMl - sourceVolumeMl;
  const workingConcentrationMgPerMl = input.sourceConcentrationMgPerMl / dilutionFactor;
  const workingDoseMl = Number((input.requiredMassMg / workingConcentrationMgPerMl).toFixed(10));

  return {
    state: "working-dilution",
    directDoseMl,
    dilutionFactor,
    workingConcentrationMgPerMl,
    sourceVolumeMl,
    diluentVolumeMl,
    workingDoseMl,
    actions: [
      `ตวง stock เดิม ${formatVolume(sourceVolumeMl)} mL`,
      `เติมตัวทำละลายที่ฉลากอนุญาต ${formatVolume(diluentVolumeMl)} mL`,
      `ผสมให้เข้ากัน จะได้ working stock ${formatNumber(workingConcentrationMgPerMl)} mg/mL ปริมาตรรวม ${formatVolume(input.workingSolutionVolumeMl)} mL`,
      `ตวง working stock ${formatVolume(workingDoseMl)} mL ใส่อาหาร`,
      "ติดฉลากชื่อสาร ความเข้มข้น ตัวทำละลาย วันที่ และผู้เตรียม",
    ],
  };
}

export function formatNumber(value: number) {
  return Number(value.toFixed(6)).toString();
}

export function formatVolume(value: number) {
  return Number(value.toFixed(4)).toString();
}
