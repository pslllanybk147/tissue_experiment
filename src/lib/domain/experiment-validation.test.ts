import { describe, expect, it } from "vitest";

import { validateLotInput, validateObservationInput } from "./experiment-validation";

const validLot = {
  id: " ppp-001 ",
  plant: "Pink Princess",
  protocolId: "protocol-nodal-v01",
  protocolTitle: "Nodal establishment",
  stage: "Establishment",
  status: "Healthy" as const,
  startedAt: "2026-07-22",
};

const haiterSnapshot = {
  profileId: "haiter-chemical-v1",
  profileVersion: "1.0.0",
  method: "haiter-chemical" as const,
  activeChlorinePercent: 6,
  targetChlorinePercent: 0.003,
  mediumVolumeMl: 1000,
  calculatedDoseMl: 0.5,
};

const validObservation = {
  observedAt: "2026-07-22T09:30",
  status: "Review" as const,
  stage: "Establishment",
  note: "ตาข้างเริ่มบวม",
  shootCount: 1,
  rootCount: null,
  contaminationCount: 0,
};

describe("validateLotInput", () => {
  it("normalizes a valid lot id to uppercase", () => {
    const result = validateLotInput(validLot);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value.id).toBe("PPP-001");
  });

  it("rejects invalid identifiers and empty required fields", () => {
    const result = validateLotInput({ ...validLot, id: "PPP 001", plant: " " });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.id).toBeDefined();
      expect(result.errors.plant).toBeDefined();
    }
  });

  it("rejects invalid dates and unsupported statuses", () => {
    const result = validateLotInput({ ...validLot, startedAt: "not-a-date", status: "Unknown" as never });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.startedAt).toBeDefined();
      expect(result.errors.status).toBeDefined();
    }
  });

  it("accepts and preserves a valid sterilization snapshot", () => {
    const result = validateLotInput({ ...validLot, sterilization: haiterSnapshot });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.sterilization?.profileId).toBe("haiter-chemical-v1");
      expect(result.value.sterilization?.calculatedDoseMl).toBe(0.5);
    }
  });

  it("accepts a SAB setup and removes nested undefined values before Firestore", () => {
    const result = validateLotInput({
      ...validLot,
      sterilization: {
        ...haiterSnapshot,
        workspace: {
          workspaceType: "still-air-box",
          disinfectant: "alcohol-70",
          applicator: "spray-to-wipe",
          alcoholPercent: 70,
          haiterSourcePercent: undefined,
          contactTimeMinutes: 1,
          customEquipment: ["ขวดสเปรย์"],
        },
      },
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.sterilization?.workspace?.alcoholPercent).toBe(70);
      expect(result.value.sterilization?.workspace).not.toHaveProperty("haiterSourcePercent");
    }
  });

  it("rejects a workspace without contact time or valid disinfectant values", () => {
    const result = validateLotInput({
      ...validLot,
      sterilization: {
        ...haiterSnapshot,
        workspace: {
          workspaceType: "still-air-box",
          disinfectant: "alcohol-70",
          applicator: "wipe",
          alcoholPercent: 50,
          contactTimeMinutes: 0,
          customEquipment: [],
        },
      },
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.workspaceContactTime).toBeDefined();
      expect(result.errors.workspaceAlcoholPercent).toBeDefined();
    }
  });

  it("preserves one consistent medium batch snapshot", () => {
    const result = validateLotInput({
      ...validLot,
      sterilization: {
        ...haiterSnapshot,
        mediumVolumeMl: 110,
        mediumBatch: {
          explantCount: 1,
          cultureJarCount: 1,
          blankJarCount: 1,
          spareJarCount: 2,
          totalJarCount: 4,
          mediumPerJarMl: 25,
          lossPercent: 10,
          baseVolumeMl: 100,
          lossAllowanceMl: 10,
          totalVolumeMl: 110,
        },
      },
    });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value.sterilization?.mediumBatch?.totalVolumeMl).toBe(110);
  });

  it("rejects a medium snapshot that disagrees with the Lot volume", () => {
    const result = validateLotInput({
      ...validLot,
      sterilization: {
        ...haiterSnapshot,
        mediumVolumeMl: 138,
        mediumBatch: {
          explantCount: 1,
          cultureJarCount: 1,
          blankJarCount: 1,
          spareJarCount: 2,
          totalJarCount: 4,
          mediumPerJarMl: 25,
          lossPercent: 10,
          baseVolumeMl: 100,
          lossAllowanceMl: 10,
          totalVolumeMl: 110,
        },
      },
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.mediumBatchTotalVolume).toBeDefined();
  });

  it("rejects skipped blank without a reason", () => {
    const result = validateLotInput({
      ...validLot,
      sterilization: {
        ...haiterSnapshot,
        blankDecision: "skipped",
        blankSkipReason: "",
      },
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.blankSkipReason).toBeDefined();
  });

  it("rejects Haiter snapshot without required concentration values", () => {
    const result = validateLotInput({
      ...validLot,
      sterilization: {
        profileId: "haiter-chemical-v1",
        profileVersion: "1.0.0",
        method: "haiter-chemical",
      },
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.activeChlorinePercent).toBeDefined();
  });

  it("allows a legacy lot without sterilization snapshot", () => {
    const result = validateLotInput(validLot);
    expect(result.ok).toBe(true);
  });
});

describe("validateObservationInput", () => {
  it("accepts structured observations with nullable counts", () => {
    const result = validateObservationInput(validObservation);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value.rootCount).toBeNull();
  });

  it("rejects blank text and invalid date values", () => {
    const result = validateObservationInput({ ...validObservation, note: " ", stage: "", observedAt: "invalid" });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.note).toBeDefined();
      expect(result.errors.stage).toBeDefined();
      expect(result.errors.observedAt).toBeDefined();
    }
  });

  it.each([
    ["shootCount", -1],
    ["rootCount", 1.5],
    ["contaminationCount", -2],
  ] as const)("rejects invalid %s values", (field, value) => {
    const result = validateObservationInput({ ...validObservation, [field]: value });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors[field]).toBeDefined();
  });
});
