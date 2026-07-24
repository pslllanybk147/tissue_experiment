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
});
