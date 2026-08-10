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

  it("treats a legacy rinse snapshot without preparation status as planned", () => {
    const lot = normalizeExperimentLot({
      id: "LOT-RINSE-LEGACY",
      ownerId: "u1",
      plant: "Violin ด่าง",
      protocolId: "violin-variegated",
      protocolTitle: "Violin ด่าง",
      stage: "sterilize",
      status: "Healthy",
      sterilization: {
        profileId: "haiter-chemical-v1",
        profileVersion: "1.0.0",
        method: "haiter-chemical",
        rinseWater: {
          method: "nadcc",
          containerCount: 3,
          volumePerContainerMl: 50,
          targetChlorinePercent: 0.03,
        },
      },
    });

    expect(lot.sterilization?.rinseWater?.status).toBe("planned");
  });

  it("preserves complete locked preparation records", () => {
    const lot = normalizeExperimentLot({
      id: "LOT-PREPARATION-COMPLETE",
      ownerId: "u1",
      plant: "Pink Princess",
      protocolId: "pink-princess",
      protocolTitle: "Pink Princess",
      stage: "prep-media",
      status: "Healthy",
      sterilization: {
        profileId: "haiter-chemical-v1",
        profileVersion: "1.0.0",
        method: "haiter-chemical",
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
          lockedAt: "2026-08-10T09:10:00.000Z",
        },
        rinseWater: {
          method: "nadcc",
          status: "verified",
          containerCount: 3,
          volumePerContainerMl: 50,
          protocolVersion: "nadcc-rinse-v1",
          actualDose: { value: 0.05, unit: "g" },
          actualChlorinePpm: 298,
          confirmedAt: "2026-08-10T09:10:00.000Z",
          lockedAt: "2026-08-10T09:10:00.000Z",
        },
      },
    });

    expect(lot.sterilization?.mediumPreparation?.actualPpm).toBe(297);
    expect(lot.sterilization?.mediumPreparation?.status).toBe("verified");
    expect(lot.sterilization?.rinseWater?.status).toBe("verified");
    expect(lot.sterilization?.rinseWater?.actualDose).toEqual({ value: 0.05, unit: "g" });
  });

  it("normalizes legacy rinse data to planned without fabricating timestamps", () => {
    const lot = normalizeExperimentLot({
      id: "LOT-RINSE-NO-EVIDENCE",
      ownerId: "u1",
      plant: "Violin ด่าง",
      protocolId: "violin-variegated",
      protocolTitle: "Violin ด่าง",
      stage: "sterilize",
      status: "Healthy",
      sterilization: {
        profileId: "haiter-chemical-v1",
        profileVersion: "1.0.0",
        method: "haiter-chemical",
        rinseWater: {
          method: "nadcc",
          containerCount: 3,
          volumePerContainerMl: 50,
          targetChlorinePercent: 0.03,
        },
      },
    });

    expect(lot.sterilization?.rinseWater?.status).toBe("planned");
    expect(lot.sterilization?.rinseWater?.confirmedAt).toBeUndefined();
    expect(lot.sterilization?.rinseWater?.lockedAt).toBeUndefined();
    expect(lot.sterilization?.mediumPreparation).toBeUndefined();
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

  it("preserves trial-arm fields, ไม่งั้นทุกครั้งที่ Firestore อ่าน lot กลับมา แขนงของชุดทดลองจะหายเงียบ ๆ", () => {
    const lot = normalizeExperimentLot({
      id: "LOT-TRIAL",
      ownerId: "u1",
      plant: "ฟิโลเดนดรอน ไวโอลิน ด่าง",
      protocolId: "violin-variegated",
      protocolTitle: "Philodendron bipennifolium 'Violin' variegated",
      stage: "sterilize",
      status: "Healthy",
      trialId: "trial-nadcc-vs-haiter-1",
      armRole: "control-b",
      armLabel: "Control-B · กระปุกเปล่า",
      isBlank: true,
    });

    expect(lot).toMatchObject({
      trialId: "trial-nadcc-vs-haiter-1",
      armRole: "control-b",
      armLabel: "Control-B · กระปุกเปล่า",
      isBlank: true,
    });
  });
});
