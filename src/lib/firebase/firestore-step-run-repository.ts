import { collection, doc, getDocs, setDoc, type Firestore } from "firebase/firestore";
import type { ProtocolStepRun } from "../domain/models";
import type { StepRunRepository } from "../repositories/step-run-repository";
import { getFirebaseServices } from "./client";

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
      const item: ProtocolStepRun = { ...input, id, ownerId: uid, updatedAt: timestamp };
      await setDoc(doc(runs(input.lotId), input.stepId), item, { merge: true });
      await setDoc(doc(db, "users", uid, "lots", input.lotId, "auditEvents", `progress-${input.stepId}`), {
        id: `progress-${input.stepId}`, ownerId: uid, lotId: input.lotId, entityType: "protocol-progress", entityId: input.stepId,
        action: input.status === "Passed" ? "completed" : "updated", occurredAt: timestamp, after: item,
      }, { merge: true });
      return item;
    },
  };
}

export function createFirestoreStepRunRepository(uid: string): StepRunRepository {
  const services = getFirebaseServices();
  if (!services) throw new Error("Firebase is not configured");
  return adapter(services.firestore, uid);
}
