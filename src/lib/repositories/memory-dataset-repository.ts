import type { DatasetItem, DatasetLabel, DatasetReviewStatus } from "../domain/models";
import { validateDatasetItemInput, validateDatasetLabel } from "../domain/dataset-intake";
import type { DatasetItemInput, DatasetRepository } from "./dataset-repository";

export function createMemoryDatasetRepository(ownerId: string, initial: DatasetItem[] = []): DatasetRepository {
  const records = new Map(initial.map(item => [item.id, structuredClone(item)]));
  const guard = (id: string) => { if (id !== ownerId) throw new Error("Owner mismatch"); };
  const required = (id: string) => {
    const item = records.get(id);
    if (!item) throw new Error("Dataset item not found");
    return item;
  };
  return {
    async list(requestOwnerId, status) {
      guard(requestOwnerId);
      return structuredClone([...records.values()].filter(item => !status || item.reviewStatus === status));
    },
    async get(requestOwnerId, id) {
      guard(requestOwnerId);
      const item = records.get(id);
      return item ? structuredClone(item) : null;
    },
    async create(requestOwnerId, input: DatasetItemInput) {
      guard(requestOwnerId);
      const errors = validateDatasetItemInput(input);
      if (Object.keys(errors).length) throw new Error(Object.values(errors).join(" · "));
      const now = new Date().toISOString();
      const item: DatasetItem = { id: `dataset-${crypto.randomUUID()}`, ownerId, ...structuredClone(input), label: null, reviewStatus: "Pending review", includedInTraining: false, createdAt: now, updatedAt: now };
      records.set(item.id, item);
      return structuredClone(item);
    },
    async reviewProvenance(requestOwnerId, id, status: DatasetReviewStatus, reviewerId, note) {
      guard(requestOwnerId);
      const current = required(id);
      const now = new Date().toISOString();
      const provenanceStatus = status === "Approved" ? "Approved" : status;
      const updated: DatasetItem = { ...current, provenance: { ...current.provenance, status: provenanceStatus, reviewedBy: reviewerId, reviewedAt: now, note }, reviewStatus: status, includedInTraining: false, updatedAt: now };
      records.set(id, updated);
      return structuredClone(updated);
    },
    async setLabel(requestOwnerId, id, label: DatasetLabel) {
      guard(requestOwnerId);
      const current = required(id);
      const labelError = validateDatasetLabel(label);
      if (labelError) throw new Error(labelError);
      if (current.provenance.status !== "Approved") throw new Error("ต้อง approve provenance ก่อนบันทึก label");
      const now = new Date().toISOString();
      const updated: DatasetItem = { ...current, label: { ...structuredClone(label), reviewedAt: label.reviewedAt ?? now }, reviewStatus: "Approved", includedInTraining: true, updatedAt: now };
      records.set(id, updated);
      return structuredClone(updated);
    },
  };
}
