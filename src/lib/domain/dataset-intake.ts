import type { DatasetItem, DatasetLabel, DatasetProvenance } from "./models";

export type DatasetItemInput = Pick<DatasetItem, "mediaId" | "lotId" | "observationId" | "assetUrl"> & {
  provenance: DatasetProvenance;
};

export type DatasetValidationErrors = Partial<Record<"mediaId" | "lotId" | "observationId" | "assetUrl" | "provenanceId" | "license" | "sourceUrl" | "label", string>>;

export function validateDatasetItemInput(input: DatasetItemInput): DatasetValidationErrors {
  const errors: DatasetValidationErrors = {};
  if (!input.mediaId.trim()) errors.mediaId = "ต้องมี mediaId";
  if (!input.lotId.trim()) errors.lotId = "ต้องมี lotId";
  if (!input.observationId.trim()) errors.observationId = "ต้องมี observationId";
  if (!input.assetUrl.trim()) errors.assetUrl = "ต้องมี assetUrl";
  if (!input.provenance.provenanceId.trim()) errors.provenanceId = "ต้องมี provenanceId";
  if (input.provenance.status === "Approved" && !input.provenance.license?.trim()) errors.license = "รายการที่ Approved ต้องมี license";
  if (input.provenance.kind === "licensed-reference" && !input.provenance.sourceUrl?.trim()) errors.sourceUrl = "ภาพอ้างอิงต้องมี sourceUrl";
  return errors;
}

export function validateDatasetLabel(label: DatasetLabel | null): string | null {
  if (!label) return "ยังไม่มี label ที่มนุษย์ตรวจสอบ";
  if (!label.scientificName.trim() || !label.cultivarName.trim()) return "label ต้องมี scientificName และ cultivarName";
  if (label.confidence === "Unknown") return "label ที่ใช้ฝึกต้องมี confidence มากกว่า Unknown";
  return null;
}
