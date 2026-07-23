import { describe, expect, it } from "vitest";
import { createMemoryPlantRepository } from "./memory-plant-repository";
import { createMemoryStepRunRepository } from "./memory-step-run-repository";

describe("guided workflow repositories", () => {
  it("keeps Plant Record ownership and preserves the record", async () => {
    const repository = createMemoryPlantRepository("owner-a");
    const plant = await repository.create("owner-a", { sellerName: "ร้านต้นไม้", suspectedSpecies: "Pink Princess", identificationConfidence: "Low", source: "seller", receivedAt: "2026-07-23", health: "Healthy", notes: "baseline", baselineMediaIds: [] });
    await expect(repository.get("owner-b", plant.id)).rejects.toThrow("Owner mismatch");
    expect(await repository.get("owner-a", plant.id)).toMatchObject({ suspectedSpecies: "Pink Princess", identificationConfidence: "Low" });
  });

  it("upserts a step result per lot and step", async () => {
    const repository = createMemoryStepRunRepository("owner-a");
    await repository.save("owner-a", { lotId: "LOT-1", protocolId: "protocol-1", versionId: "version-1", stepId: "step-1", status: "Needs review", note: "พบสีน้ำตาลเล็กน้อย", measurements: { "medium-ph": 5.8 }, mediaIds: [], observedAt: "2026-07-23T00:00:00.000Z" });
    await repository.save("owner-a", { lotId: "LOT-1", protocolId: "protocol-1", versionId: "version-1", stepId: "step-1", status: "Passed", note: "แก้ไขแล้ว", measurements: { "medium-ph": 5.7 }, mediaIds: [], observedAt: "2026-07-23T01:00:00.000Z" });
    const runs = await repository.list("owner-a", "LOT-1");
    expect(runs).toHaveLength(1);
    expect(runs[0]).toMatchObject({ status: "Passed", measurements: { "medium-ph": 5.7 } });
  });
});
