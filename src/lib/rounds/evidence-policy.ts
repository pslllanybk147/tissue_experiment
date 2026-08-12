import type { RoundStep } from "./round-adapter";

export type EvidenceMedia = { caption: string };

export type EvidenceGateResult = {
  canPass: boolean;
  missingFieldIds: string[];
  missingPhotoCount: number;
  missingCaptionCount: number;
  /** เกณฑ์ "ผ่านเมื่อ" ที่ยังไม่ได้ยืนยัน */
  missingCriteriaCount: number;
};

/** เดิม "ผ่านเมื่อ" เป็นข้อความอ่านอย่างเดียว ระบบบังคับแค่ช่องตัวเลขที่ required
 *  ขั้นที่เกณฑ์เป็นรูปถ่ายหรือการสังเกต (เช่น "มีรูปต้นทั้งต้นอย่างน้อย 1 รูป") จึงกดผ่านได้
 *  โดยไม่ทำอะไรเลย ตอนนี้ทุกเกณฑ์มีช่องติ๊กยืนยันที่เก็บเป็นข้อมูลจริงและบังคับก่อนผ่าน */
export function passCriterionKey(index: number): string {
  return `pass-criterion-${index}`;
}

function isEmpty(value: unknown): boolean {
  return value === null || value === undefined || (typeof value === "string" && value.trim() === "");
}

export function evaluateStepEvidence(
  step: RoundStep,
  values: Record<string, unknown>,
  media: EvidenceMedia[],
): EvidenceGateResult {
  const missingFieldIds = step.measurements
    .filter((field) => field.required && (field.kind === "checkbox" ? values[field.id] !== true : isEmpty(values[field.id])))
    .map((field) => field.id);
  const missingCriteriaCount = step.passCriteria.filter((_, index) => values[passCriterionKey(index)] !== true).length;
  const requirement = step.evidenceRequirement ?? "none";
  const missingPhotoCount = requirement !== "none" && media.length === 0 ? 1 : 0;
  const missingCaptionCount = requirement === "photo-with-caption" && media.length > 0 && !media.some((item) => item.caption.trim())
    ? 1
    : 0;

  return {
    canPass: missingFieldIds.length === 0 && missingPhotoCount === 0 && missingCaptionCount === 0 && missingCriteriaCount === 0,
    missingFieldIds,
    missingPhotoCount,
    missingCaptionCount,
    missingCriteriaCount,
  };
}
