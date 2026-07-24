import type { DatasetItem } from "./models";

export const IMAGE_PREPROCESSING_CONTRACT = {
  version: "image-preprocess-v1",
  targetWidth: 224,
  targetHeight: 224,
  resize: "contain" as const,
  colorSpace: "sRGB" as const,
  orientation: "exif-rotate" as const,
  normalization: "0..1" as const,
  acceptedFormats: ["jpg", "jpeg", "png", "webp"] as const,
  maxBytes: 10_000_000,
};

export type ImagePreprocessingContract = typeof IMAGE_PREPROCESSING_CONTRACT;
export type PreprocessingValidation = { ready: boolean; errors: string[] };

export function validatePreprocessingMetadata(item: Pick<DatasetItem, "width" | "height" | "format" | "bytes">): PreprocessingValidation {
  const errors: string[] = [];
  if (!Number.isInteger(item.width) || (item.width ?? 0) < 1) errors.push("width ต้องเป็นจำนวนเต็มมากกว่า 0");
  if (!Number.isInteger(item.height) || (item.height ?? 0) < 1) errors.push("height ต้องเป็นจำนวนเต็มมากกว่า 0");
  if (!Number.isInteger(item.bytes) || (item.bytes ?? 0) < 1 || (item.bytes ?? 0) > IMAGE_PREPROCESSING_CONTRACT.maxBytes) errors.push("bytes ไม่อยู่ในช่วงที่รองรับ");
  if (!IMAGE_PREPROCESSING_CONTRACT.acceptedFormats.includes(item.format as typeof IMAGE_PREPROCESSING_CONTRACT.acceptedFormats[number])) errors.push("format ไม่รองรับ");
  return { ready: errors.length === 0, errors };
}
