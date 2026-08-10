import { describe, expect, it } from "vitest";

import type { AuditEvent, CreateLotInput, ExperimentLot, Observation, ObservationInput, TrialArmRole } from "@/lib/domain/models";
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
  workflowVersion: "v2",
  sterilization: {
    profileId: "haiter-no-pressure-v1",
    profileVersion: "1.0.0",
    method: "haiter-chemical",
    activeChlorinePercent: 6,
    targetChlorinePercent: 0.003,
  },
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

function harness(armRole?: TrialArmRole) {
  let lot: ExperimentLot = { ...lotInput, ownerId: "owner-1", createdAt: "t0", updatedAt: "t0", ...(armRole ? { armRole } : {}) };
  let observation: Observation | null = null;
  const mutations: ObservationMutation[] = [];
  const audits: AuditEvent[] = [];
  const adapter: ExperimentPersistenceAdapter = {
    listLots: async () => [lot],
    getLot: async (lotId) => lotId === lot.id ? lot : null,
    createLotWithAudit: async (created, audit) => { audits.push(audit); return created; },
    commitLotMutation: async (updated, audit) => { lot = updated; audits.push(audit); },
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
  return { repository, mutations, audits };
}

describe("Firestore experiment repository contract", () => {
  it("rejects owner mismatch before persistence", async () => {
    const { repository } = harness();
    await expect(repository.listLots("other")).rejects.toThrow("Owner mismatch");
  });

  it("does not persist undefined optional lot fields", async () => {
    const { repository, audits } = harness();
    await repository.createLot("owner-1", { ...lotInput, id: "AAA-131", plantId: undefined, taxonId: undefined, templateId: undefined, method: undefined });
    const after = audits[0].after ?? {};
    expect(Object.values(after).some((value) => value === undefined)).toBe(false);
    expect(after).not.toHaveProperty("plantId");
    expect(after).not.toHaveProperty("taxonId");
  });

  it("soft deletes and restores a lot with audit snapshots", async () => {
    const { repository } = harness();
    const deleted = await repository.softDeleteLot("owner-1", "PPP-001");
    expect(deleted.deletedAt).not.toBeNull();
    expect(await repository.listLots("owner-1")).toEqual([]);
    expect((await repository.listLots("owner-1", true))[0].deletedAt).not.toBeNull();
    const restored = await repository.restoreLot("owner-1", "PPP-001");
    expect(restored.deletedAt).toBeNull();
    expect((await repository.listLots("owner-1"))[0].id).toBe("PPP-001");
  });

  it("persists a rinse-water repair for an existing lot", async () => {
    const { repository, audits } = harness();
    const updated = await repository.updateRinseWater("owner-1", "PPP-001", {
      method: "low-dose-hypochlorite",
      containerCount: 3,
      volumePerContainerMl: 50,
      preparationVolumeMl: 1000,
      targetChlorinePercent: 0.003,
      minimumWaitMinutes: 60,
    });
    expect(updated.sterilization?.rinseWater?.targetChlorinePercent).toBe(0.003);
    expect(audits.at(-1)).toMatchObject({ action: "updated", after: { id: "PPP-001" } });
  });

  it("audits a complete sterilization snapshot update", async () => {
    const { repository, audits } = harness();
    const current = (await repository.getLot("owner-1", "PPP-001"))!.sterilization!;
    const updated = await repository.updateSterilization("owner-1", "PPP-001", {
      ...current,
      mediumPreparation: {
        method: "nadcc-chemical",
        protocolVersion: "nadcc-medium-v1",
        status: "verified",
        productName: "NaDCC tablet",
        batchOrLot: "N-42",
        labelConcentration: 60,
        labelBasis: "available-chlorine",
        targetPpm: 300,
        actualPpm: 297,
        calculatedDose: { value: 0.1515, unit: "g" },
        actualDose: { value: 0.152, unit: "g" },
        finalVolumeMl: 1000,
        preparedAt: "2026-08-10T09:00:00.000Z",
        confirmedAt: "2026-08-10T09:10:00.000Z",
        lockedAt: "2026-08-10T08:00:00.000Z",
      },
    });

    expect(updated.sterilization?.mediumPreparation?.actualDose).toEqual({ value: 0.152, unit: "g" });
    expect(audits.at(-1)).toMatchObject({ action: "updated" });
  });

  it("persists an audited T3 override", async () => {
    const { repository, audits } = harness("t3");
    const override = {
      reason: "ต้องการทดสอบหลังประเมินความเสี่ยงครบถ้วนแล้ว",
      acknowledged: true,
      recordedAt: "2026-08-09T10:00:00.000Z",
      mode: "risk-override" as const,
    };

    const updated = await repository.saveT3Override("owner-1", "PPP-001", override);

    expect(updated.t3Override).toEqual(override);
    expect(audits.at(-1)).toMatchObject({ action: "updated", after: { t3Override: override } });
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

  it("treats repeated delete and restore requests as idempotent", async () => {
    const { repository, mutations } = harness();
    const created = await repository.createObservation("owner-1", "PPP-001", observationInput);
    await repository.softDeleteObservation("owner-1", "PPP-001", created.id);
    await repository.softDeleteObservation("owner-1", "PPP-001", created.id);
    await repository.restoreObservation("owner-1", "PPP-001", created.id);
    await repository.restoreObservation("owner-1", "PPP-001", created.id);
    expect(mutations.map((item) => item.audit.action)).toEqual(["created", "deleted", "restored"]);
  });

  it("rejects writes for missing lots and observations", async () => {
    const { repository } = harness();
    await expect(repository.createObservation("owner-1", "missing", observationInput)).rejects.toThrow("Lot not found");
    await expect(repository.softDeleteObservation("owner-1", "PPP-001", "missing")).rejects.toThrow("Observation not found");
  });
});
