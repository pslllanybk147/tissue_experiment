import type { AuditEvent, CreateLotInput, ExperimentLot, Observation, ObservationInput, RinseWaterSnapshot, T3Override } from "@/lib/domain/models";
import type { ExperimentRepository } from "./experiment-repository";
import { demoStorageKey, readDemoState, writeDemoState } from "./demo-storage";

type RepositoryOptions = {
  createId?: () => string;
  now?: () => string;
  lots?: ExperimentLot[];
  observations?: Observation[];
  auditEvents?: AuditEvent[];
};

function clone<T>(value: T): T {
  return structuredClone(value);
}

export function createMemoryExperimentRepository(uid: string, options: RepositoryOptions = {}): ExperimentRepository {
  const storageKey = demoStorageKey(uid, "experiments");
  const stored = readDemoState<{ lots: ExperimentLot[]; observations: Observation[]; auditEvents: AuditEvent[] }>(storageKey, { lots: [], observations: [], auditEvents: [] });
  const initialLots = [...(options.lots ?? []), ...stored.lots.filter((item) => !(options.lots ?? []).some((seed) => seed.id === item.id))];
  const lots = new Map(initialLots.map((lot) => [lot.id, clone(lot)]));
  const observations = new Map([...(options.observations ?? []), ...stored.observations].map((item) => [item.id, clone(item)]));
  const auditEvents: AuditEvent[] = clone([...(options.auditEvents ?? []), ...stored.auditEvents]);
  const createId = options.createId ?? (() => crypto.randomUUID());
  const now = options.now ?? (() => new Date().toISOString());
  const persist = () => writeDemoState(storageKey, { lots: [...lots.values()], observations: [...observations.values()], auditEvents });

  function assertOwner(ownerId: string) {
    if (ownerId !== uid) throw new Error("Owner mismatch");
  }

  function requireLot(lotId: string) {
    const lot = lots.get(lotId);
    if (!lot) throw new Error("Lot not found");
    return lot;
  }

  function requireObservation(lotId: string, observationId: string) {
    const item = observations.get(observationId);
    if (!item || item.lotId !== lotId) throw new Error("Observation not found");
    return item;
  }

  function addAudit(
    lotId: string,
    entityType: AuditEvent["entityType"],
    entityId: string,
    action: AuditEvent["action"],
    before: Record<string, unknown> | null,
    after: Record<string, unknown> | null,
  ) {
    auditEvents.push({
      id: createId(),
      lotId,
      ownerId: uid,
      entityType,
      entityId,
      action,
      actorId: uid,
      occurredAt: now(),
      before: clone(before),
      after: clone(after),
    });
    persist();
  }

  async function listLots(ownerId: string, includeDeleted = false) {
    assertOwner(ownerId);
    return [...lots.values()].filter((lot) => includeDeleted || !lot.deletedAt).map(clone).sort((a, b) => b.startedAt.localeCompare(a.startedAt));
  }

  async function getLot(ownerId: string, lotId: string) {
    assertOwner(ownerId);
    const lot = lots.get(lotId);
    return lot ? clone(lot) : null;
  }

  async function createLot(ownerId: string, input: CreateLotInput) {
    assertOwner(ownerId);
    if (lots.has(input.id)) throw new Error("Lot already exists");
    const timestamp = now();
    const lot: ExperimentLot = { ...clone(input), ownerId: uid, createdAt: timestamp, updatedAt: timestamp, deletedAt: null };
    lots.set(lot.id, lot);
    addAudit(lot.id, "lot", lot.id, "created", null, lot as unknown as Record<string, unknown>);
    return clone(lot);
  }

  async function softDeleteLot(ownerId: string, lotId: string) {
    assertOwner(ownerId);
    const current = requireLot(lotId);
    if (current.deletedAt) return clone(current);
    const timestamp = now();
    const updated = { ...current, deletedAt: timestamp, updatedAt: timestamp };
    lots.set(lotId, updated);
    addAudit(lotId, "lot", lotId, "deleted", current as unknown as Record<string, unknown>, updated as unknown as Record<string, unknown>);
    return clone(updated);
  }

  async function updateRinseWater(ownerId: string, lotId: string, rinseWater: RinseWaterSnapshot) {
    assertOwner(ownerId);
    const current = requireLot(lotId);
    if (!current.sterilization) throw new Error("Lot has no sterilization profile");
    const updated: ExperimentLot = {
      ...current,
      sterilization: { ...current.sterilization, rinseWater: clone(rinseWater) },
      updatedAt: now(),
    };
    lots.set(lotId, updated);
    addAudit(lotId, "lot", lotId, "updated", current as unknown as Record<string, unknown>, updated as unknown as Record<string, unknown>);
    return clone(updated);
  }

  async function saveT3Override(ownerId: string, lotId: string, override: T3Override) {
    assertOwner(ownerId);
    const current = requireLot(lotId);
    if (current.armRole !== "t3") throw new Error("T3 override is only valid for a T3 lot");
    const updated: ExperimentLot = { ...current, t3Override: clone(override), updatedAt: now() };
    lots.set(lotId, updated);
    addAudit(lotId, "lot", lotId, "updated", current as unknown as Record<string, unknown>, updated as unknown as Record<string, unknown>);
    return clone(updated);
  }

  async function restoreLot(ownerId: string, lotId: string) {
    assertOwner(ownerId);
    const current = requireLot(lotId);
    if (!current.deletedAt) return clone(current);
    const updated = { ...current, deletedAt: null, updatedAt: now() };
    lots.set(lotId, updated);
    addAudit(lotId, "lot", lotId, "restored", current as unknown as Record<string, unknown>, updated as unknown as Record<string, unknown>);
    return clone(updated);
  }

  async function listObservations(ownerId: string, lotId: string, includeDeleted = false) {
    assertOwner(ownerId);
    requireLot(lotId);
    return [...observations.values()]
      .filter((item) => item.lotId === lotId && (includeDeleted || item.deletedAt === null))
      .map(clone)
      .sort((a, b) => b.observedAt.localeCompare(a.observedAt));
  }

  async function createObservation(ownerId: string, lotId: string, input: ObservationInput) {
    assertOwner(ownerId);
    requireLot(lotId);
    const timestamp = now();
    const item: Observation = {
      ...clone(input),
      id: createId(),
      lotId,
      ownerId: uid,
      createdBy: uid,
      createdAt: timestamp,
      updatedAt: timestamp,
      deletedAt: null,
    };
    observations.set(item.id, item);
    addAudit(lotId, "observation", item.id, "created", null, item as unknown as Record<string, unknown>);
    return clone(item);
  }

  async function updateObservation(ownerId: string, lotId: string, observationId: string, input: ObservationInput) {
    assertOwner(ownerId);
    requireLot(lotId);
    const current = requireObservation(lotId, observationId);
    const updated: Observation = { ...current, ...clone(input), updatedAt: now() };
    observations.set(observationId, updated);
    addAudit(lotId, "observation", observationId, "updated", current as unknown as Record<string, unknown>, updated as unknown as Record<string, unknown>);
    return clone(updated);
  }

  async function softDeleteObservation(ownerId: string, lotId: string, observationId: string) {
    assertOwner(ownerId);
    requireLot(lotId);
    const current = requireObservation(lotId, observationId);
    if (current.deletedAt !== null) return clone(current);
    const timestamp = now();
    const updated = { ...current, deletedAt: timestamp, updatedAt: timestamp };
    observations.set(observationId, updated);
    addAudit(lotId, "observation", observationId, "deleted", current as unknown as Record<string, unknown>, updated as unknown as Record<string, unknown>);
    return clone(updated);
  }

  async function restoreObservation(ownerId: string, lotId: string, observationId: string) {
    assertOwner(ownerId);
    requireLot(lotId);
    const current = requireObservation(lotId, observationId);
    if (current.deletedAt === null) return clone(current);
    const updated = { ...current, deletedAt: null, updatedAt: now() };
    observations.set(observationId, updated);
    addAudit(lotId, "observation", observationId, "restored", current as unknown as Record<string, unknown>, updated as unknown as Record<string, unknown>);
    return clone(updated);
  }

  async function listAuditEvents(ownerId: string, lotId: string) {
    assertOwner(ownerId);
    requireLot(lotId);
    return auditEvents.filter((event) => event.lotId === lotId).map(clone).sort((a, b) => a.occurredAt.localeCompare(b.occurredAt));
  }

  return {
    listLots,
    getLot,
    createLot,
    updateRinseWater,
    saveT3Override,
    softDeleteLot,
    restoreLot,
    listObservations,
    createObservation,
    updateObservation,
    softDeleteObservation,
    restoreObservation,
    listAuditEvents,
  };
}
