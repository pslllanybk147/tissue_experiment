import { describe, expect, it } from "vitest";
import { buildModelReadyManifest } from "./model-ready-exporter";
import type { DatasetItem } from "./models";
import type { PreprocessingJob } from "../image/preprocessing-job";

const item: DatasetItem = { id: "item-1", ownerId: "owner-1", mediaId: "media-1", lotId: "lot-1", observationId: "obs-1", assetUrl: "https://res.cloudinary.com/demo/image/upload/original.jpg", width: 1000, height: 800, format: "jpg", bytes: 1200, provenance: { kind: "user-captured", sourceUrl: null, license: null, attribution: null, provenanceId: "capture-1", status: "Approved", reviewedBy: "owner-1", reviewedAt: "now", note: "checked" }, label: { scientificName: "Philodendron erubescens", cultivarName: "Pink Princess", confidence: "High", source: "owner", reviewedBy: "owner-1", reviewedAt: "now", note: "checked" }, reviewStatus: "Approved", includedInTraining: true, createdAt: "now", updatedAt: "now" };

function job(overrides: Partial<PreprocessingJob> = {}): PreprocessingJob {
  return { id: "job-1", ownerId: "owner-1", exportId: "export-1", retryOf: null, status: "completed", itemIds: [item.id], processedCount: 1, artifacts: [{ datasetItemId: item.id, status: "ready", format: "png", width: 224, height: 224, bytes: 400, sha256: "hash-1", publicId: "preprocessed-item-1", secureUrl: "https://res.cloudinary.com/demo/image/upload/preprocessed-item-1.png", error: null }], createdAt: "now", updatedAt: "now", ...overrides };
}

describe("model-ready exporter", () => {
  it("uses only completed preprocessed artifacts", () => {
    const manifest = buildModelReadyManifest([item], job(), "2026-07-23T00:00:00.000Z");
    expect(manifest).toMatchObject({ schemaVersion: "image-dataset-model-ready-v1", sourceJobId: "job-1", itemCount: 1, items: [{ artifactUrl: expect.stringContaining("preprocessed-item-1"), artifactSha256: "hash-1" }] });
  });

  it("rejects incomplete jobs", () => {
    expect(() => buildModelReadyManifest([item], job({ status: "failed" }))).toThrow("not complete");
  });
});
