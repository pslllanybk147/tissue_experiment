import { describe, expect, it } from "vitest";

import type { AuditEvent, CreateLotInput, ExperimentLot, Observation, ObservationInput } from "@/lib/domain/models";
import {
  createFirestoreExperimentRepository,
  type ExperimentPersistenceAdapter,
  type ObservationMutation,
} from "./firestore-experiment-repository";

const lotInput: CreateLotInput = {
  id: "PPP-001",
  plant: "Pink Princess",
  protocolId: "protocol-nodal-v01",
  protocolTitle: "Nodal establishment",
  stage: "Establishment",
  status: "Healthy",
  startedAt: "2026-07-22",
};

const observationInput: ObservationInput = {
  observedAt: "2026-07-22T09:00",
  status: "Review",
  stage: "Establishment",
  note: "ตาข้างเริ่มบวม",
  shootCount: 1,
  rootCount: null,
  contaminationCount: 0,
};

function harness() {
  const lot: ExperimentLot = { ...lotInput, ownerId: "owner-1", createdAt: "t0", updatedAt: "t0" };
  let observation: Observation | null = null;
  const mutations: ObservationMutation[] = [];
  const audits: AuditEvent[] = [];
  const adapter: ExperimentPersistenceAdapter = {
    listLots: async () => [lot],
    getLot: async (lotId) => lotId === lot.id ? lot : null,
    createLotWithAudit: async (created, audit) => { audits.push(audit); return created; },
    listObservations: async () => observation ? [observation] : [],
    getObservation: async (_lotId, observationId) => observation?.id === observationId ? observation : null,
    commitObservationMutation: async (mutation) => {
      mutations.push(mutation);
      observation = mutation.observation;
      audits.push(mutation.audit);
    },
    listAuditEvents: async () => audits,
  };
  let id = 0;
  const repository = createFirestoreExperimentRepository("owner-1", {
    adapter,
    createId: () => `id-${++id}`,
    now: () => `2026-07-22T10:00:0${id}.000Z`,
  });
  return { repository, mutations };
}

describe("Firestore experiment repository contract", () => {
  it("rejects owner mismatch before persistence", async () => {
    const { repository } = harness();
    await expect(repository.listLots("other")).rejects.toThrow("Owner mismatch");
  });

  it("pairs created observation and audit in one adapter mutation", async () => {
    const { repository, mutations } = harness();
    const created = await repository.createObservation("owner-1", "PPP-001", observationInput);
    expect(mutations).toHaveLength(1);
    expect(mutations[0]).toMatchObject({
      observation: { id: created.id, note: "ตาข้างเริ่มบวม" },
      audit: { action: "created", before: null, after: { id: created.id } },
    });
  });

  it("records before and after snapshots for update, delete, and restore", async () => {
    const { repository, mutations } = harness();
    const created = await repository.createObservation("owner-1", "PPP-001", observationInput);
    await repository.updateObservation("owner-1", "PPP-001", created.id, { ...observationInput, note: "เกิดใบใหม่" });
    await repository.softDeleteObservation("owner-1", "PPP-001", created.id);
    await repository.restoreObservation("owner-1", "PPP-001", created.id);

    expect(mutations.map((item) => item.audit.action)).toEqual(["created", "updated", "deleted", "restored"]);
    expect(mutations[1].audit.before).toMatchObject({ note: "ตาข้างเริ่มบวม" });
    expect(mutations[1].audit.after).toMatchObject({ note: "เกิดใบใหม่" });
    expect(mutations[2].observation.deletedAt).not.toBeNull();
    expect(mutations[3].observation.deletedAt).toBeNull();
  });

  it("rejects writes for missing lots and observations", async () => {
    const { repository } = harness();
    await expect(repository.createObservation("owner-1", "missing", observationInput)).rejects.toThrow("Lot not found");
    await expect(repository.softDeleteObservation("owner-1", "PPP-001", "missing")).rejects.toThrow("Observation not found");
  });
});
