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
