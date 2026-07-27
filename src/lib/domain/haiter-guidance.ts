import {
  calculateHaiterDose,
  planHaiterWorkingDilution,
} from "./haiter-calculations";

export type HaiterGuidanceInput = {
  labelPercent: number | null;
  targetPercent: number;
  mediumVolumeMl: number;
  minimumToolVolumeMl: number;
  permittedDiluent: string;
};

export type HaiterActionPlan =
  | {
      state: "blocked";
      reason: string;
      safeAction: string;
    }
  | {
      state: "direct";
      primaryInstruction: string;
      directDoseMl: number;
      actions: string[];
      scienceNote: string;
    }
  | {
      state: "working-dilution";
      primaryInstruction: string;
      directDoseMl: number;
      workingPercent: number;
      actions: string[];
      label: string;
      scienceNote: string;
    };

const formatMl = (value: number) => value.toFixed(2);

export function createHaiterActionPlan(
  input: HaiterGuidanceInput,
): HaiterActionPlan {
  if (input.labelPercent === null || input.labelPercent <= 0) {
    return {
      state: "blocked",
      reason: "ยังไม่มีเปอร์เซ็นต์คลอรีนจากฉลาก",
      safeAction: "หยุดไว้ก่อน ถ่ายรูปฉลากหน้า–หลัง แล้วค้นคำว่า sodium hypochlorite, NaOCl หรือ active chlorine หากไม่มีตัวเลขเปอร์เซ็นต์ให้งดใช้ผลิตภัณฑ์นี้และเลือกขวดที่มีฉลากระบุชัด",
    };
  }

  try {
    const direct = calculateHaiterDose({
      sourcePercent: input.labelPercent,
      targetPercent: input.targetPercent,
      finalVolumeMl: input.mediumVolumeMl,
      minimumMeasurableMl: input.minimumToolVolumeMl,
    });

    if (!direct.needsWorkingDilution) {
      return {
        state: "direct",
        primaryInstruction: `ตวงไฮเตอร์จากขวด ${formatMl(direct.sourceVolumeMl)} mL`,
        directDoseMl: direct.sourceVolumeMl,
        actions: [
          "สวมถุงมือและแว่นตา แล้วทำงานในที่อากาศถ่ายเท",
          `ตวงไฮเตอร์จากขวด ${formatMl(direct.sourceVolumeMl)} mL`,
          `เติมลงในอาหารที่เย็นตามเงื่อนไขของคู่มือ ปริมาตรรวม ${input.mediumVolumeMl} mL`,
          "คนให้ทั่วและติดป้ายชื่อ batch วันเวลา และผู้เตรียม",
        ],
        scienceNote: direct.formula,
      };
    }

    const working = planHaiterWorkingDilution({
      sourcePercent: input.labelPercent,
      dilutionFactor: 10,
      workingVolumeMl: 10,
      targetPercent: input.targetPercent,
      finalVolumeMl: input.mediumVolumeMl,
      minimumMeasurableMl: input.minimumToolVolumeMl,
    });

    if (
      working.sourceVolumeMl < input.minimumToolVolumeMl
      || !working.isMeasurable
    ) {
      return {
        state: "blocked",
        reason: "อุปกรณ์ที่ระบุยังตวงปริมาตรในสูตรเจือจางได้ไม่แม่นยำ",
        safeAction: `หยุดไว้ก่อน ใช้อุปกรณ์ที่ตวงได้ต่ำกว่า ${formatMl(input.minimumToolVolumeMl)} mL หรือเพิ่มปริมาตรอาหารเป็นอย่างน้อย ${Math.ceil((input.minimumToolVolumeMl * input.labelPercent / input.targetPercent) / 10) * 10} mL แล้วให้ระบบคำนวณใหม่`,
      };
    }

    return {
      state: "working-dilution",
      primaryInstruction: "เตรียมสารไฮเตอร์เจือจาง 10 เท่าก่อน",
      directDoseMl: direct.sourceVolumeMl,
      workingPercent: working.workingPercent,
      label: `ไฮเตอร์เจือจาง ${working.workingPercent}% · เตรียมใหม่`,
      actions: [
        "สวมถุงมือและแว่นตา แล้วทำงานในที่อากาศถ่ายเท",
        `ตวงไฮเตอร์จากขวด ${formatMl(working.sourceVolumeMl)} mL`,
        `เติม${input.permittedDiluent} ${formatMl(working.diluentVolumeMl)} mL`,
        "คนเบา ๆ ให้เข้ากัน แล้วติดป้ายว่าเป็นสารเจือจาง ห้ามเข้าใจว่าเป็นไฮเตอร์จากขวด",
        `ตวงสารที่เจือจางแล้ว ${formatMl(working.workingDoseMl)} mL ไปใช้กับอาหาร ${input.mediumVolumeMl} mL`,
      ],
      scienceNote: `ระบบลดความเข้มข้นจาก ${input.labelPercent}% เป็น ${working.workingPercent}% เพื่อให้ปริมาตรที่ต้องตวงอยู่ในช่วงของอุปกรณ์`,
    };
  } catch {
    return {
      state: "blocked",
      reason: "ค่าที่กรอกยังใช้สร้างคำสั่งตวงที่ปลอดภัยไม่ได้",
      safeAction: "ตรวจตัวเลขจากฉลาก ปริมาตรอาหาร และค่าต่ำสุดของอุปกรณ์อีกครั้ง ห้ามประมาณค่าเอง",
    };
  }
}
