import { describe, expect, it } from "vitest";
import type { DatasetLabel, DatasetProvenance } from "../domain/models";
import { createMemoryDatasetRepository } from "./memory-dataset-repository";

const provenance: DatasetProvenance = { kind: "user-captured", sourceUrl: null, license: null, attribution: null, provenanceId: "capture-1", status: "Pending review", reviewedBy: null, reviewedAt: null, note: "เจ้าของถ่ายเอง" };
const label: DatasetLabel = { scientificName: "Philodendron erubescens", cultivarName: "Pink Princess", confidence: "Medium", source: "owner", reviewedBy: null, reviewedAt: null, note: "ตรวจจากต้นแม่" };

describe("memory dataset repository", () => {
  it("keeps items pending until provenance is approved, then permits a human label", async () => {
    const repo = createMemoryDatasetRepository("owner-1");
    const created = await repo.create("owner-1", { mediaId: "m1", lotId: "l1", observationId: "o1", assetUrl: "https://x/image.jpg", provenance });
    expect(created.reviewStatus).toBe("Pending review");
    await expect(repo.setLabel("owner-1", created.id, label)).rejects.toThrow("approve provenance");
    await repo.reviewProvenance("owner-1", created.id, "Approved", "reviewer-1", "source checked");
    const reviewed = await repo.setLabel("owner-1", created.id, label);
    expect(reviewed.includedInTraining).toBe(true);
    expect(reviewed.label?.cultivarName).toBe("Pink Princess");
  });
  it("rejects cross-owner access", async () => {
    const repo = createMemoryDatasetRepository("owner-1");
    await expect(repo.list("owner-2")).rejects.toThrow("Owner mismatch");
  });
});
