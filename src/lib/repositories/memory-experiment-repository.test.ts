import { describe, expect, it } from "vitest";

import type { CreateLotInput, ObservationInput } from "@/lib/domain/models";
import { createMemoryExperimentRepository } from "./memory-experiment-repository";

const lot: CreateLotInput = {
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

const observation: ObservationInput = {
  observedAt: "2026-07-22T09:30",
  status: "Review",
  stage: "Establishment",
  note: "ตาข้างเริ่มบวม",
  shootCount: 1,
  rootCount: null,
  contaminationCount: 0,
};

function repository() {
  let id = 0;
  let tick = 0;
  return createMemoryExperimentRepository("owner-1", {
    createId: () => `id-${++id}`,
    now: () => `2026-07-22T10:00:0${tick++}.000Z`,
  });
}

describe("memory experiment repository", () => {
  it("rejects owner mismatch before every operation", async () => {
    const repo = repository();
    await expect(repo.listLots("other")).rejects.toThrow("Owner mismatch");
    await expect(repo.createLot("other", lot)).rejects.toThrow("Owner mismatch");
  });

  it("creates, retrieves, and rejects duplicate lots", async () => {
    const repo = repository();
    const created = await repo.createLot("owner-1", lot);
    expect(created.ownerId).toBe("owner-1");
    expect((await repo.getLot("owner-1", "PPP-001"))?.plant).toBe("Pink Princess");
    await expect(repo.createLot("owner-1", lot)).rejects.toThrow("Lot already exists");
  });

  it("soft deletes, hides, and restores lots", async () => {
    const repo = repository();
    await repo.createLot("owner-1", lot);
    const deleted = await repo.softDeleteLot("owner-1", lot.id);
    expect(deleted.deletedAt).not.toBeNull();
    expect(await repo.listLots("owner-1")).toEqual([]);
    expect((await repo.listLots("owner-1", true))[0].deletedAt).not.toBeNull();
    const restored = await repo.restoreLot("owner-1", lot.id);
    expect(restored.deletedAt).toBeNull();
    expect((await repo.listLots("owner-1"))[0].id).toBe(lot.id);
  });

  it("adds a missing rinse-water plan to an existing lot without recreating it", async () => {
    const repo = repository();
    await repo.createLot("owner-1", lot);
    const updated = await repo.updateRinseWater("owner-1", lot.id, {
      method: "low-dose-hypochlorite",
      containerCount: 3,
      volumePerContainerMl: 50,
      preparationVolumeMl: 1000,
      targetChlorinePercent: 0.003,
      minimumWaitMinutes: 60,
    });
    expect(updated.sterilization?.rinseWater?.targetChlorinePercent).toBe(0.003);
    expect((await repo.getLot("owner-1", lot.id))?.sterilization?.rinseWater?.method).toBe("low-dose-hypochlorite");
    expect((await repo.listAuditEvents("owner-1", lot.id)).at(-1)).toMatchObject({ action: "updated" });
  });

  it("audits a complete sterilization snapshot update", async () => {
    const repo = repository();
    await repo.createLot("owner-1", lot);
    const current = (await repo.getLot("owner-1", lot.id))!.sterilization!;
    const updated = await repo.updateSterilization("owner-1", lot.id, {
      ...current,
      mediumPreparation: {
        method: "haiter-chemical",
        protocolVersion: "haiter-medium-v1",
        status: "verified",
        productName: "Haiter",
        batchOrLot: "H-42",
        labelConcentration: 6,
        labelBasis: "w/w",
        targetPpm: 30,
        actualPpm: 29,
        calculatedDose: { value: 0.5, unit: "mL" },
        actualDose: { value: 0.5, unit: "mL" },
        finalVolumeMl: 1000,
        preparedAt: "2026-08-10T09:00:00.000Z",
        confirmedAt: "2026-08-10T09:10:00.000Z",
        lockedAt: "2026-08-10T08:00:00.000Z",
      },
    });

    expect(updated.sterilization?.mediumPreparation?.actualDose).toEqual({ value: 0.5, unit: "mL" });
    expect((await repo.getLot("owner-1", lot.id))?.sterilization?.mediumPreparation?.batchOrLot).toBe("H-42");
    expect((await repo.listAuditEvents("owner-1", lot.id)).at(-1)?.action).toBe("updated");
  });

  it("บันทึก T3 override พร้อม audit โดยไม่แก้แขนงอื่น", async () => {
    const repo = repository();
    await repo.createLot("owner-1", { ...lot, armRole: "t3", trialId: "trial-1" });
    const override = {
      reason: "ต้องการทดสอบหลังประเมินความเสี่ยงครบถ้วนแล้ว",
      acknowledged: true,
      recordedAt: "2026-08-09T10:00:00.000Z",
      mode: "risk-override" as const,
    };

    const updated = await repo.saveT3Override("owner-1", lot.id, override);

    expect(updated.t3Override).toEqual(override);
    expect((await repo.listAuditEvents("owner-1", lot.id)).at(-1)).toMatchObject({
      action: "updated",
      after: { t3Override: override },
    });
  });

  it("creates an observation and matching audit event", async () => {
    const repo = repository();
    await repo.createLot("owner-1", lot);
    const created = await repo.createObservation("owner-1", lot.id, observation);
    const events = await repo.listAuditEvents("owner-1", lot.id);
    expect(created.id).toBe("id-2");
    expect(events.at(-1)).toMatchObject({
      action: "created",
      entityId: created.id,
      before: null,
      after: { note: "ตาข้างเริ่มบวม" },
    });
  });

  it("updates with before and after audit snapshots", async () => {
    const repo = repository();
    await repo.createLot("owner-1", lot);
    const created = await repo.createObservation("owner-1", lot.id, observation);
    const updated = await repo.updateObservation("owner-1", lot.id, created.id, { ...observation, note: "เกิดใบใหม่" });
    const events = await repo.listAuditEvents("owner-1", lot.id);
    expect(updated.note).toBe("เกิดใบใหม่");
    expect(events.at(-1)).toMatchObject({
      action: "updated",
      before: { note: "ตาข้างเริ่มบวม" },
      after: { note: "เกิดใบใหม่" },
    });
  });

  it("soft deletes, hides, includes, and restores observations", async () => {
    const repo = repository();
    await repo.createLot("owner-1", lot);
    const created = await repo.createObservation("owner-1", lot.id, observation);
    await repo.softDeleteObservation("owner-1", lot.id, created.id);
    expect(await repo.listObservations("owner-1", lot.id)).toEqual([]);
    expect((await repo.listObservations("owner-1", lot.id, true))[0].deletedAt).not.toBeNull();
    await repo.restoreObservation("owner-1", lot.id, created.id);
    expect(await repo.listObservations("owner-1", lot.id)).toHaveLength(1);
    expect((await repo.listAuditEvents("owner-1", lot.id)).map((event) => event.action)).toEqual([
      "created",
      "created",
      "deleted",
      "restored",
    ]);
  });

  it("does not create duplicate audit events for repeated delete or restore", async () => {
    const repo = repository();
    await repo.createLot("owner-1", lot);
    const created = await repo.createObservation("owner-1", lot.id, observation);
    await repo.softDeleteObservation("owner-1", lot.id, created.id);
    await repo.softDeleteObservation("owner-1", lot.id, created.id);
    await repo.restoreObservation("owner-1", lot.id, created.id);
    await repo.restoreObservation("owner-1", lot.id, created.id);
    const actions = (await repo.listAuditEvents("owner-1", lot.id)).map((event) => event.action);
    expect(actions.filter((action) => action === "deleted")).toHaveLength(1);
    expect(actions.filter((action) => action === "restored")).toHaveLength(1);
  });

  it("rejects missing lots and observations", async () => {
    const repo = repository();
    await expect(repo.createObservation("owner-1", "missing", observation)).rejects.toThrow("Lot not found");
    await repo.createLot("owner-1", lot);
    await expect(repo.softDeleteObservation("owner-1", lot.id, "missing")).rejects.toThrow("Observation not found");
  });
});
