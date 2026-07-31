import type { CreateLotInput, ExperimentStatus, ObservationInput } from "./models";

export type ValidationResult<T> =
  | { ok: true; value: T; errors: Record<string, never> }
  | { ok: false; value: null; errors: Record<string, string> };

const statuses: ExperimentStatus[] = ["Healthy", "Review", "At risk", "Contaminated"];

function isValidDate(value: string) {
  return value.trim() !== "" && !Number.isNaN(Date.parse(value));
}

function required(errors: Record<string, string>, field: string, value: string) {
  if (!value.trim()) errors[field] = "จำเป็นต้องกรอก";
}

function validateCount(errors: Record<string, string>, field: keyof ObservationInput, value: number | null) {
  if (value !== null && (!Number.isInteger(value) || value < 0)) {
    errors[field] = "ต้องเป็นจำนวนเต็มตั้งแต่ 0 ขึ้นไป";
  }
}

function positiveNumber(
  errors: Record<string, string>,
  field: string,
  value: number | undefined,
) {
  if (value === undefined || !Number.isFinite(value) || value <= 0) {
    errors[field] = "ต้องเป็นตัวเลขที่มากกว่า 0";
  }
}

function cleanUndefined<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.filter((item) => item !== undefined).map(cleanUndefined) as T;
  }
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([, item]) => item !== undefined)
        .map(([key, item]) => [key, cleanUndefined(item)]),
    ) as T;
  }
  return value;
}

export function validateLotInput(input: CreateLotInput): ValidationResult<CreateLotInput> {
  const errors: Record<string, string> = {};
  const id = input.id.trim().toUpperCase();
  required(errors, "id", id);
  required(errors, "plant", input.plant);
  required(errors, "protocolId", input.protocolId);
  required(errors, "protocolTitle", input.protocolTitle);
  required(errors, "stage", input.stage);
  if (id && !/^[A-Z0-9-]+$/.test(id)) errors.id = "ใช้ได้เฉพาะ A-Z, 0-9 และขีดกลาง";
  if (!statuses.includes(input.status)) errors.status = "สถานะไม่ถูกต้อง";
  if (!isValidDate(input.startedAt)) errors.startedAt = "วันที่ไม่ถูกต้อง";
  if (input.sterilization) {
    required(errors, "sterilizationProfileId", input.sterilization.profileId);
    required(errors, "sterilizationProfileVersion", input.sterilization.profileVersion);
    if (input.sterilization.method === "haiter-chemical") {
      positiveNumber(errors, "activeChlorinePercent", input.sterilization.activeChlorinePercent);
      positiveNumber(errors, "targetChlorinePercent", input.sterilization.targetChlorinePercent);
      positiveNumber(errors, "mediumVolumeMl", input.sterilization.mediumVolumeMl);
      positiveNumber(errors, "calculatedDoseMl", input.sterilization.calculatedDoseMl);
      if (input.workflowVersion === "v2") {
        const rinseWater = input.sterilization.rinseWater;
        if (!rinseWater) {
          errors.rinseWaterMethod = "กรุณาเลือกว่าน้ำล้างปลอดเชื้อมาจากไหน";
        } else {
          if (!["low-dose-hypochlorite", "commercial-sterile", "pressure-steam"].includes(rinseWater.method)) {
            errors.rinseWaterMethod = "แหล่งน้ำล้างปลอดเชื้อไม่ถูกต้อง";
          }
          if (rinseWater.containerCount !== 3) {
            errors.rinseWaterContainerCount = "ต้องเตรียมน้ำล้างแยก 3 ภาชนะสำหรับล้าง 3 รอบ";
          }
          positiveNumber(errors, "rinseWaterVolumePerContainerMl", rinseWater.volumePerContainerMl);
          if (rinseWater.method === "low-dose-hypochlorite") {
            positiveNumber(errors, "rinseWaterPreparationVolumeMl", rinseWater.preparationVolumeMl);
            positiveNumber(errors, "rinseWaterTargetChlorinePercent", rinseWater.targetChlorinePercent);
            positiveNumber(errors, "rinseWaterMinimumWaitMinutes", rinseWater.minimumWaitMinutes);
          }
        }
      }
    }
    if (input.sterilization.mediumBatch) {
      const batch = input.sterilization.mediumBatch;
      const expectedJarCount = batch.cultureJarCount + batch.blankJarCount + batch.spareJarCount;
      const expectedBaseVolume = batch.totalJarCount * batch.mediumPerJarMl;
      if (batch.totalJarCount !== expectedJarCount) {
        errors.mediumBatchJarCount = "จำนวนกระปุกรวมไม่ตรงกับกระปุกเพาะ Blank และสำรอง";
      }
      if (Math.abs(batch.baseVolumeMl - expectedBaseVolume) > 0.001) {
        errors.mediumBatchBaseVolume = "ปริมาตรใช้งานไม่ตรงกับจำนวนกระปุก";
      }
      if (input.sterilization.mediumVolumeMl !== batch.totalVolumeMl) {
        errors.mediumBatchTotalVolume = "ปริมาตร Lot ต้องตรงกับ batch ที่คำนวณ";
      }
    }
    if (
      input.sterilization.blankDecision === "skipped"
      && !input.sterilization.blankSkipReason?.trim()
    ) {
      errors.blankSkipReason = "กรุณาบันทึกเหตุผลที่ข้าม Blank test";
    }
    if (input.sterilization.workspace) {
      positiveNumber(errors, "workspaceContactTime", input.sterilization.workspace.contactTimeMinutes);
      if (input.sterilization.workspace.disinfectant === "alcohol-70") {
        const percent = input.sterilization.workspace.alcoholPercent;
        if (percent === undefined || percent < 70 || percent > 90) {
          errors.workspaceAlcoholPercent = "Alcohol ต้องอยู่ในช่วง 70–90% ตาม profile นี้";
        }
      } else {
        positiveNumber(errors, "workspaceHaiterSourcePercent", input.sterilization.workspace.haiterSourcePercent);
        positiveNumber(errors, "workspaceHaiterTargetPercent", input.sterilization.workspace.haiterTargetPercent);
        positiveNumber(errors, "workspaceSolutionVolumeMl", input.sterilization.workspace.solutionVolumeMl);
        positiveNumber(errors, "workspaceCalculatedHaiterMl", input.sterilization.workspace.calculatedHaiterMl);
      }
    }
  }

  if (Object.keys(errors).length) return { ok: false, value: null, errors };
  return {
    ok: true,
    value: {
      ...input,
      id,
      plant: input.plant.trim(),
      protocolId: input.protocolId.trim(),
      protocolTitle: input.protocolTitle.trim(),
      stage: input.stage.trim(),
      sterilization: input.sterilization
        ? cleanUndefined({
            ...input.sterilization,
            blankSkipReason: input.sterilization.blankSkipReason?.trim(),
          })
        : undefined,
    },
    errors: {},
  };
}

export function validateObservationInput(input: ObservationInput): ValidationResult<ObservationInput> {
  const errors: Record<string, string> = {};
  required(errors, "stage", input.stage);
  required(errors, "note", input.note);
  if (!isValidDate(input.observedAt)) errors.observedAt = "วันที่และเวลาไม่ถูกต้อง";
  if (!statuses.includes(input.status)) errors.status = "สถานะไม่ถูกต้อง";
  validateCount(errors, "shootCount", input.shootCount);
  validateCount(errors, "rootCount", input.rootCount);
  validateCount(errors, "contaminationCount", input.contaminationCount);

  if (Object.keys(errors).length) return { ok: false, value: null, errors };
  return {
    ok: true,
    value: { ...input, stage: input.stage.trim(), note: input.note.trim() },
    errors: {},
  };
}
