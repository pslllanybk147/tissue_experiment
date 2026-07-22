import { collection, doc, getDoc, getDocs, setDoc, writeBatch } from "firebase/firestore";

import type { ExperimentLot, Protocol, ResearchSource } from "@/lib/domain/models";
import type { LabRepository, LabSnapshot } from "@/lib/repositories/lab-repository";
import { createDemoSnapshot } from "@/lib/repositories/demo-lab-repository";
import { getFirebaseServices } from "./client";

function servicesOrThrow() {
  const services = getFirebaseServices();
  if (!services) throw new Error("Firebase is not configured");
  return services;
}

export function createFirestoreLabRepository(uid: string): LabRepository {
  async function listLots(ownerId: string): Promise<ExperimentLot[]> {
    if (ownerId !== uid) throw new Error("Owner mismatch");
    const { firestore } = servicesOrThrow();
    const snapshot = await getDocs(collection(firestore, "users", uid, "lots"));
    return snapshot.docs.map((item) => item.data() as ExperimentLot);
  }

  async function getSnapshot(ownerId: string): Promise<LabSnapshot> {
    if (ownerId !== uid) throw new Error("Owner mismatch");
    const { firestore } = servicesOrThrow();
    const [ownerLots, protocolDoc, researchDocs] = await Promise.all([
      listLots(ownerId),
      getDoc(doc(firestore, "users", uid, "protocols", "protocol-nodal-v01")),
      getDocs(collection(firestore, "users", uid, "research")),
    ]);
    if (!protocolDoc.exists()) {
      const seed = createDemoSnapshot(uid);
      const batch = writeBatch(firestore);
      batch.set(doc(firestore, "users", uid), { ownerId: uid, initializedAt: new Date().toISOString() }, { merge: true });
      seed.lots.forEach((lot) => batch.set(doc(firestore, "users", uid, "lots", lot.id), lot));
      seed.research.forEach((source) => batch.set(doc(firestore, "users", uid, "research", source.id), source));
      batch.set(doc(firestore, "users", uid, "protocols", seed.protocol.id), seed.protocol);
      await batch.commit();
      return seed;
    }
    return {
      lots: ownerLots,
      protocol: protocolDoc.data() as Protocol,
      research: researchDocs.docs.map((item) => item.data() as ResearchSource),
    };
  }

  async function completeProtocolStep(ownerId: string, protocolId: string, currentIndex: number): Promise<Protocol> {
    if (ownerId !== uid) throw new Error("Owner mismatch");
    const { firestore } = servicesOrThrow();
    const ref = doc(firestore, "users", uid, "protocols", protocolId);
    const snapshot = await getDoc(ref);
    if (!snapshot.exists()) throw new Error("Protocol not found");
    const protocol = snapshot.data() as Protocol;
    const next = { ...protocol, activeStepIndex: Math.min(currentIndex + 1, protocol.stepCount - 1) };
    await setDoc(ref, next, { merge: true });
    return next;
  }

  return { getSnapshot, listLots, completeProtocolStep };
}
