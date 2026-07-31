import { collection, doc, getDocs, setDoc, writeBatch, type Firestore } from "firebase/firestore";
import type { ProtocolStepRun } from "../domain/models";
import type { StepRunRepository } from "../repositories/step-run-repository";
import { getFirebaseServices } from "./client";

export function removeUndefinedStepRunFields<T extends Record<string, unknown>>(value: T): T {
  return Object.fromEntries(
    Object.entries(value)
      .filter(([, item]) => item !== undefined)
      .map(([key, item]) => [
        key,
        item && typeof item === "object" && !Array.isArray(item)
          ? removeUndefinedStepRunFields(item as Record<string, unknown>)
          : item,
      ]),
  ) as T;
}

function adapter(db: Firestore, uid: string): StepRunRepository {
  const runs = (lotId: string) => collection(db, "users", uid, "lots", lotId, "protocolStepRuns");
  return {
    async list(ownerId, lotId) {
      if (ownerId !== uid) throw new Error("Owner mismatch");
      return (await getDocs(runs(lotId))).docs.map((item) => item.data() as ProtocolStepRun).sort((a, b) => a.stepId.localeCompare(b.stepId));
    },
    async save(ownerId, input) {
      if (ownerId !== uid) throw new Error("Owner mismatch");
      const timestamp = new Date().toISOString();
      const id = `${input.lotId}-${input.stepId}`;
      const item = removeUndefinedStepRunFields({
        ...input,
        id,
        ownerId: uid,
        updatedAt: timestamp,
      }) as ProtocolStepRun;
      await setDoc(doc(runs(input.lotId), input.stepId), item, { merge: true });
      await setDoc(doc(db, "users", uid, "lots", input.lotId, "auditEvents", `progress-${input.stepId}`), {
        id: `progress-${input.stepId}`, ownerId: uid, lotId: input.lotId, entityType: "protocol-progress", entityId: input.stepId,
        action: input.status === "Passed"
          ? input.completionMode === "retrospective"
            ? "completed_retrospectively"
            : "completed"
          : input.completionMode === "retrospective"
            ? "recorded_retrospectively"
            : "updated",
        occurredAt: timestamp,
        after: item,
      }, { merge: true });
      return item;
    },
    async saveMany(ownerId, inputs) {
      if (ownerId !== uid) throw new Error("Owner mismatch");
      const timestamp = new Date().toISOString();
      const batch = writeBatch(db);
      const items = inputs.map((input) => {
        const id = `${input.lotId}-${input.stepId}`;
        const item = removeUndefinedStepRunFields({
          ...input,
          id,
          ownerId: uid,
          updatedAt: timestamp,
        }) as ProtocolStepRun;
        batch.set(doc(runs(input.lotId), input.stepId), item, { merge: true });
        batch.set(
          doc(db, "users", uid, "lots", input.lotId, "auditEvents", `progress-${input.stepId}`),
          {
            id: `progress-${input.stepId}`,
            ownerId: uid,
            lotId: input.lotId,
            entityType: "protocol-progress",
            entityId: input.stepId,
            action: input.completionMode === "carried-forward" ? "carried_forward" : "updated",
            occurredAt: timestamp,
            after: item,
          },
          { merge: true },
        );
        return item;
      });
      await batch.commit();
      return items;
    },
  };
}

export function createFirestoreStepRunRepository(uid: string): StepRunRepository {
  const services = getFirebaseServices();
  if (!services) throw new Error("Firebase is not configured");
  return adapter(services.firestore, uid);
}
