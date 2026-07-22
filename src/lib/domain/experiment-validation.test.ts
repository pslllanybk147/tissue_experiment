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
