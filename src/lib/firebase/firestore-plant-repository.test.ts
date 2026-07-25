import { describe, expect, it } from "vitest";

import type { PlantRecord } from "../domain/models";
import { sanitizePlantForFirestore } from "./firestore-plant-repository";

describe("Firestore plant repository", () => {
  it("removes undefined optional fields before persistence", () => {
    const plant = sanitizePlantForFirestore<PlantRecord>({
      id: "plant-1",
      ownerId: "owner-1",
      sellerName: "Pink Princess",
      suspectedSpecies: "Pink Princess",
      identificationConfidence: "High",
      source: "ร้าน",
      receivedAt: "2026-07-25",
      health: "Healthy",
      baselineNote: "",
      taxonId: undefined,
      createdAt: "2026-07-25T00:00:00.000Z",
      updatedAt: "2026-07-25T00:00:00.000Z",
    });

    expect(plant).not.toHaveProperty("taxonId");
    expect(Object.values(plant)).not.toContain(undefined);
  });
});
