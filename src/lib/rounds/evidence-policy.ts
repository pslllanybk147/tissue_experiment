import type { RoundStep } from "./round-adapter";

export type EvidenceMedia = { caption: string };

export type EvidenceGateResult = {
  canPass: boolean;
  missingFieldIds: string[];
  missingPhotoCount: number;
  missingCaptionCount: number;
};

function isEmpty(value: unknown): boolean {
  return value === null || value === undefined || (typeof value === "string" && value.trim() === "");
}

export function evaluateStepEvidence(
  step: RoundStep,
  values: Record<string, unknown>,
  media: EvidenceMedia[],
): EvidenceGateResult {
  const missingFieldIds = step.measurements
    .filter((field) => field.required && isEmpty(values[field.id]))
    .map((field) => field.id);
  const requirement = step.evidenceRequirement ?? "none";
  const missingPhotoCount = requirement !== "none" && media.length === 0 ? 1 : 0;
  const missingCaptionCount = requirement === "photo-with-caption" && media.length > 0 && !media.some((item) => item.caption.trim())
    ? 1
    : 0;

  return {
    canPass: missingFieldIds.length === 0 && missingPhotoCount === 0 && missingCaptionCount === 0,
    missingFieldIds,
    missingPhotoCount,
    missingCaptionCount,
  };
}
