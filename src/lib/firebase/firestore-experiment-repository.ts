import { collection, doc, getDoc, getDocs, writeBatch, type Firestore } from "firebase/firestore";

import type { AuditEvent, CreateLotInput, ExperimentLot, Observation, ObservationInput } from "@/lib/domain/models";
import type { ExperimentRepository } from "@/lib/repositories/experiment-repository";
import { getFirebaseServices } from "./client";

export type ObservationMutation = { observation: Observation; audit: AuditEvent };

export interface ExperimentPersistenceAdapter {
  listLots(): Promise<ExperimentLot[]>;
  getLot(lotId: string): Promise<ExperimentLot | null>;
  createLotWithAudit(lot: ExperimentLot, audit: AuditEvent): Promise<ExperimentLot>;
  listObservations(lotId: string): Promise<Observation[]>;
  getObservation(lotId: string, observationId: string): Promise<Observation | null>;
  commitObservationMutation(mutation: ObservationMutation): Promise<void>;
  listAuditEvents(lotId: string): Promise<AuditEvent[]>;
}

type RepositoryOptions = {
  adapter?: ExperimentPersistenceAdapter;
  createId?: () => string;
  now?: () => string;
};

function snapshot(value: object): Record<string, unknown> {
  return structuredClone(value) as Record<string, unknown>;
}

function createFirebaseAdapter(firestore: Firestore, uid: string): ExperimentPersistenceAdapter {
  const lotRef = (lotId: string) => doc(firestore, "users", uid, "lots", lotId);
  const observationRef = (lotId: string, observationId: string) =>
    doc(firestore, "users", uid, "lots", lotId, "observations", observationId);
  const auditRef = (lotId: string, auditId: string) =>
    doc(firestore, "users", uid, "lots", lotId, "auditEvents", auditId);

  return {
    async listLots() {
      const result = await getDocs(collection(firestore, "users", uid, "lots"));
      return result.docs.map((item) => item.data() as ExperimentLot);
    },
    async getLot(lotId) {
      const result = await getDoc(lotRef(lotId));
      return result.exists() ? result.data() as ExperimentLot : null;
    },
    async createLotWithAudit(lot, audit) {
      const batch = writeBatch(firestore);
      batch.set(lotRef(lot.id), lot);
      batch.set(auditRef(lot.id, audit.id), audit);
      await batch.commit();
      return lot;
    },
    async listObservations(lotId) {
      const result = await getDocs(collection(firestore, "users", uid, "lots", lotId, "observations"));
      return result.docs.map((item) => item.data() as Observation);
    },
    async getObservation(lotId, observationId) {
      const result = await getDoc(observationRef(lotId, observationId));
      return result.exists() ? result.data() as Observation : null;
    },
    async commitObservationMutation(mutation) {
      const batch = writeBatch(firestore);
      batch.set(observationRef(mutation.observation.lotId, mutation.observation.id), mutation.observation);
      batch.set(auditRef(mutation.audit.lotId, mutation.audit.id), mutation.audit);
      await batch.commit();
    },
    async listAuditEvents(lotId) {
      const result = await getDocs(collection(firestore, "users", uid, "lots", lotId, "auditEvents"));
      return result.docs.map((item) => item.data() as AuditEvent);
    },
  };
}

export function createFirestoreExperimentRepository(uid: string, options: RepositoryOptions = {}): ExperimentRepository {
  const services = options.adapter ? null : getFirebaseServices();
  if (!options.adapter && !services) throw new Error("Firebase is not configured");
  const adapter = options.adapter ?? createFirebaseAdapter(services!.firestore, uid);
  const createId = options.createId ?? (() => crypto.randomUUID());
  const now = options.now ?? (() => new Date().toISOString());

  function assertOwner(ownerId: string) {
    if (ownerId !== uid) throw new Error("Owner mismatch");
  }

  async function requireLot(lotId: string) {
    const lot = await adapter.getLot(lotId);
    if (!lot) throw new Error("Lot not found");
    return lot;
  }

  async function requireObservation(lotId: string, observationId: string) {
    const observation = await adapter.getObservation(lotId, observationId);
    if (!observation) throw new Error("Observation not found");
    return observation;
  }

  function audit(
    lotId: string,
    entityType: AuditEvent["entityType"],
    entityId: string,
    action: AuditEvent["action"],
    before: Record<string, unknown> | null,
    after: Record<string, unknown> | null,
  ): AuditEvent {
    return { id: createId(), lotId, ownerId: uid, entityType, entityId, action, actorId: uid, occurredAt: now(), before, after };
  }

  async function listLots(ownerId: string) {
    assertOwner(ownerId);
    return (await adapter.listLots()).sort((a, b) => b.startedAt.localeCompare(a.startedAt));
  }

  async function getLot(ownerId: string, lotId: string) {
    assertOwner(ownerId);
    return adapter.getLot(lotId);
  }

  async function createLot(ownerId: string, input: CreateLotInput) {
    assertOwner(ownerId);
    if (await adapter.getLot(input.id)) throw new Error("Lot already exists");
    const timestamp = now();
    const lot: ExperimentLot = { ...input, ownerId: uid, createdAt: timestamp, updatedAt: timestamp };
    return adapter.createLotWithAudit(lot, audit(lot.id, "lot", lot.id, "created", null, snapshot(lot)));
  }

  async function listObservations(ownerId: string, lotId: string, includeDeleted = false) {
    assertOwner(ownerId);
    await requireLot(lotId);
    return (await adapter.listObservations(lotId))
      .filter((item) => includeDeleted || item.deletedAt === null)
      .sort((a, b) => b.observedAt.localeCompare(a.observedAt));
  }

  async function createObservation(ownerId: string, lotId: string, input: ObservationInput) {
    assertOwner(ownerId);
    await requireLot(lotId);
    const timestamp = now();
    const observation: Observation = {
      ...input,
      id: createId(),
      lotId,
      ownerId: uid,
      createdBy: uid,
      createdAt: timestamp,
      updatedAt: timestamp,
      deletedAt: null,
    };
    await adapter.commitObservationMutation({
      observation,
      audit: audit(lotId, "observation", observation.id, "created", null, snapshot(observation)),
    });
    return observation;
  }

  async function updateObservation(ownerId: string, lotId: string, observationId: string, input: ObservationInput) {
    assertOwner(ownerId);
    await requireLot(lotId);
    const before = await requireObservation(lotId, observationId);
    const observation = { ...before, ...input, updatedAt: now() };
    await adapter.commitObservationMutation({
      observation,
      audit: audit(lotId, "observation", observationId, "updated", snapshot(before), snapshot(observation)),
    });
    return observation;
  }

  async function softDeleteObservation(ownerId: string, lotId: string, observationId: string) {
    assertOwner(ownerId);
    await requireLot(lotId);
    const before = await requireObservation(lotId, observationId);
    const timestamp = now();
    const observation = { ...before, deletedAt: timestamp, updatedAt: timestamp };
    await adapter.commitObservationMutation({
      observation,
      audit: audit(lotId, "observation", observationId, "deleted", snapshot(before), snapshot(observation)),
    });
    return observation;
  }

  async function restoreObservation(ownerId: string, lotId: string, observationId: string) {
    assertOwner(ownerId);
    await requireLot(lotId);
    const before = await requireObservation(lotId, observationId);
    const observation = { ...before, deletedAt: null, updatedAt: now() };
    await adapter.commitObservationMutation({
      observation,
      audit: audit(lotId, "observation", observationId, "restored", snapshot(before), snapshot(observation)),
    });
    return observation;
  }

  async function listAuditEvents(ownerId: string, lotId: string) {
    assertOwner(ownerId);
    await requireLot(lotId);
    return (await adapter.listAuditEvents(lotId)).sort((a, b) => b.occurredAt.localeCompare(a.occurredAt));
  }

  return {
    listLots,
    getLot,
    createLot,
    listObservations,
    createObservation,
    updateObservation,
    softDeleteObservation,
    restoreObservation,
    listAuditEvents,
  };
}
