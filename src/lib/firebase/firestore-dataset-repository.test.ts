import { describe, expect, it } from "vitest";
import type { DatasetLabel, DatasetProvenance } from "../domain/models";
import { createFirestoreDatasetRepository, type DatasetPersistenceAdapter } from "./firestore-dataset-repository";

const provenance: DatasetProvenance = { kind: "user-captured", sourceUrl: null, license: null, attribution: null, provenanceId: "capture-1", status: "Pending review", reviewedBy: null, reviewedAt: null, note: "เจ้าของถ่ายเอง" };
const label: DatasetLabel = { scientificName: "Philodendron erubescens", cultivarName: "Pink Princess", confidence: "Medium", source: "owner", reviewedBy: null, reviewedAt: null, note: "ตรวจจากต้นแม่" };

describe("Firestore dataset repository", () => {
  it("persists an item and gates labels behind provenance approval", async () => {
    const records = new Map();
    const adapter: DatasetPersistenceAdapter = { list: async () => [...records.values()], get: async id => records.get(id) ?? null, save: async item => { records.set(item.id, structuredClone(item)); } };
    const repository = createFirestoreDatasetRepository("dataset-test-owner", { adapter });
    const item = await repository.create("dataset-test-owner", { mediaId: "media-1", lotId: "lot-1", observationId: "obs-1", assetUrl: "https://example.com/leaf.jpg", provenance });
    expect(item.reviewStatus).toBe("Pending review");
    await expect(repository.setLabel("dataset-test-owner", item.id, label)).rejects.toThrow("approve provenance");
    await repository.reviewProvenance("dataset-test-owner", item.id, "Approved", "reviewer-1", "checked");
    const approved = await repository.setLabel("dataset-test-owner", item.id, label);
    expect(approved.includedInTraining).toBe(true);
    expect((await repository.get("dataset-test-owner", item.id))?.label?.cultivarName).toBe("Pink Princess");
  });
});
