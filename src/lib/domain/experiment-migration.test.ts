import { describe, expect, it } from "vitest";
import { normalizeExperimentLot } from "./experiment-migration";

describe("normalizeExperimentLot", () => {
  it("maps legacy dashboard lot fields to the current schema", () => {
    const lot = normalizeExperimentLot({ id: "PPP-001", ownerId: "u1", plant: "Pink Princess", protocol: "Nodal v0.1", stage: "Establishment", status: "Healthy", day: 12 }, new Date("2026-07-22T00:00:00Z"));
    expect(lot).toMatchObject({ protocolTitle: "Nodal v0.1", protocolId: "protocol-nodal-v01", startedAt: "2026-07-10" });
  });

  it("preserves newer Plant and Taxon links when normalizing a lot", () => {
    const lot = normalizeExperimentLot({ id: "PPP-002", ownerId: "u1", plant: "Pink Princess", protocol: "Nodal", stage: "Establishment", status: "Healthy", plantId: "plant-1", taxonId: "cultivar-pink-princess", templateId: "template-pink-princess-nodal", method: "nodal" });
    expect(lot).toMatchObject({ plantId: "plant-1", taxonId: "cultivar-pink-princess", templateId: "template-pink-princess-nodal", method: "nodal" });
  });

  it("preserves the locked sterilization snapshot and protocol version", () => {
    const lot = normalizeExperimentLot({
      id: "LOT-20260725-043801",
      ownerId: "u1",
      plant: "Pink Princess",
      protocolId: "protocol-1",
      protocolTitle: "Pink Princess · Nodal culture",
      protocolVersionId: "version-1",
      stage: "Establishment",
      status: "Healthy",
      sterilization: {
        profileId: "haiter-chemical-v1",
        profileVersion: "1.0.0",
        method: "haiter-chemical",
        activeChlorinePercent: 6,
        targetChlorinePercent: 0.003,
        mediumVolumeMl: 1000,
        calculatedDoseMl: 0.5,
      },
    });

    expect(lot.protocolVersionId).toBe("version-1");
    expect(lot.sterilization).toMatchObject({
      profileId: "haiter-chemical-v1",
      method: "haiter-chemical",
      calculatedDoseMl: 0.5,
    });
  });

  it("preserves the guided workflow version when Firebase reads a v2 lot", () => {
    const lot = normalizeExperimentLot({
      id: "LOT-V2",
      ownerId: "u1",
      plant: "Pink Princess",
      protocolId: "protocol-1",
      protocolTitle: "Pink Princess · Nodal culture",
      stage: "Establishment",
      status: "Healthy",
      taxonId: "cultivar-pink-princess",
      workflowVersion: "v2",
    });

    expect(lot.workflowVersion).toBe("v2");
  });
});
