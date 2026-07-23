import { collection, doc, getDoc, getDocs, setDoc, type Firestore } from "firebase/firestore";
import { validateDatasetItemInput, validateDatasetLabel } from "../domain/dataset-intake";
import type { DatasetItem, DatasetLabel, DatasetReviewStatus } from "../domain/models";
import type { DatasetItemInput, DatasetRepository } from "../repositories/dataset-repository";
import { getFirebaseServices } from "./client";

export type DatasetPersistenceAdapter = {
  list(): Promise<DatasetItem[]>;
  get(id: string): Promise<DatasetItem | null>;
  save(item: DatasetItem): Promise<void>;
};

function createRepository(uid: string, persistence: DatasetPersistenceAdapter): DatasetRepository {
  const guard = (ownerId: string) => { if (ownerId !== uid) throw new Error("Owner mismatch"); };
  const required = async (id: string) => {
    const item = await persistence.get(id);
    if (!item) throw new Error("Dataset item not found");
    return item;
  };
  return {
    async list(ownerId, status) {
      guard(ownerId);
      return (await persistence.list()).filter(item => !status || item.reviewStatus === status);
    },
    async get(ownerId, id) {
      guard(ownerId);
      return persistence.get(id);
    },
    async create(ownerId, input: DatasetItemInput) {
      guard(ownerId);
      const errors = validateDatasetItemInput(input);
      if (Object.keys(errors).length) throw new Error(Object.values(errors).join(" · "));
      const now = new Date().toISOString();
      const item: DatasetItem = { id: `dataset-${crypto.randomUUID()}`, ownerId: uid, ...structuredClone(input), label: null, reviewStatus: "Pending review", includedInTraining: false, createdAt: now, updatedAt: now };
      await persistence.save(item);
      return item;
    },
    async reviewProvenance(ownerId, id, status: DatasetReviewStatus, reviewerId, note) {
      guard(ownerId);
      const current = await required(id);
      const now = new Date().toISOString();
      const updated: DatasetItem = { ...current, provenance: { ...current.provenance, status, reviewedBy: reviewerId, reviewedAt: now, note }, reviewStatus: status, includedInTraining: false, updatedAt: now };
      await persistence.save(updated);
      return updated;
    },
    async setLabel(ownerId, id, label: DatasetLabel) {
      guard(ownerId);
      const current = await required(id);
      const labelError = validateDatasetLabel(label);
      if (labelError) throw new Error(labelError);
      if (current.provenance.status !== "Approved") throw new Error("ต้อง approve provenance ก่อนบันทึก label");
      const updated: DatasetItem = { ...current, label: structuredClone(label), reviewStatus: "Approved", includedInTraining: true, updatedAt: new Date().toISOString() };
      await persistence.save(updated);
      return updated;
    },
  };
}

function createFirestoreAdapter(db: Firestore, uid: string): DatasetPersistenceAdapter {
  const ref = (id: string) => doc(db, "users", uid, "datasetItems", id);
  return {
    async list() { return (await getDocs(collection(db, "users", uid, "datasetItems"))).docs.map(item => item.data() as DatasetItem); },
    async get(id) { const snapshot = await getDoc(ref(id)); return snapshot.exists() ? snapshot.data() as DatasetItem : null; },
    async save(item) { await setDoc(ref(item.id), item); },
  };
}

export function createFirestoreDatasetRepository(uid: string, options: { adapter?: DatasetPersistenceAdapter } = {}): DatasetRepository {
  const services = options.adapter ? null : getFirebaseServices();
  if (!options.adapter && !services) throw new Error("Firebase is not configured");
  return createRepository(uid, options.adapter ?? createFirestoreAdapter(services!.firestore, uid));
}
