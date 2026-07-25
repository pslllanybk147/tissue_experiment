import { describe, expect, it } from "vitest";
import type { DatasetItem, ObservationMedia } from "./models";
import { buildDatasetManifest, generateMLDatasetManifest } from "./dataset-exporter";

describe("legacy ML dataset exporter", () => {
  it("generates a valid manifest from observation media", () => {
    const mediaItems: ObservationMedia[] = [{ id: "media-1", ownerId: "owner-1", lotId: "lot-101", observationId: "obs-1", cloudinaryPublicId: "pub-1", secureUrl: "https://res.cloudinary.com/demo/image/upload/sample1.jpg", width: 1200, height: 800, format: "jpg", bytes: 250000, caption: "Pink Princess leaf variegation test", capturedAt: "2026-07-23T10:00:00Z", createdBy: "owner-1", createdAt: "2026-07-23T10:00:00Z", updatedAt: "2026-07-23T10:00:00Z", deletedAt: null }];
    const manifest = generateMLDatasetManifest(mediaItems, "Pink Princess");
    expect(manifest.version).toBe("1.0.0");
    expect(manifest.datasetName).toContain("Pink Princess");
    expect(manifest.totalImages).toBe(1);
    expect(manifest.images[0]).toHaveProperty("id", "media-1");
    expect(manifest.images[0]).toHaveProperty("license", "CC-BY 4.0 Verified Provenance");
    expect(manifest.images[0]).toHaveProperty("annotations");
  });
});

const base: DatasetItem = {
  id: "dataset-1", ownerId: "owner-1", mediaId: "media-1", lotId: "LOT-1", observationId: "OBS-1", assetUrl: "https://example.com/leaf.jpg", width: 1200, height: 900, format: "jpg", bytes: 200_000,
  provenance: { kind: "user-captured", sourceUrl: null, license: null, attribution: null, provenanceId: "capture-1", status: "Approved", reviewedBy: "reviewer-1", reviewedAt: "2026-07-23T00:00:00.000Z", note: "ตรวจแล้ว" },
  label: { scientificName: "Philodendron erubescens", cultivarName: "Pink Princess", confidence: "High", source: "expert", reviewedBy: "reviewer-1", reviewedAt: "2026-07-23T00:00:00.000Z", note: "ตรวจลักษณะใบและก้าน" },
  reviewStatus: "Approved", includedInTraining: true, createdAt: "2026-07-23T00:00:00.000Z", updatedAt: "2026-07-23T00:00:00.000Z",
};

describe("dataset exporter", () => {
  it("exports only approved, labeled training candidates", () => {
    const manifest = buildDatasetManifest([base, { ...base, id: "pending", reviewStatus: "Pending review", includedInTraining: false }, { ...base, id: "unknown", label: { ...base.label, confidence: "Unknown" } }], "2026-07-23T01:00:00.000Z");
    expect(manifest).toMatchObject({ schemaVersion: "image-dataset-v2", generatedAt: "2026-07-23T01:00:00.000Z", itemCount: 1, splitCounts: { train: 1, validation: 0, test: 0 } });
    expect(manifest.items[0]).toMatchObject({ id: "dataset-1", cultivarName: "Pink Princess", confidence: "High", split: "train" });
  });
  it("keeps items from the same lot in one split", () => {
    const manifest = buildDatasetManifest([base, { ...base, id: "dataset-2", mediaId: "media-2" }]);
    expect(new Set(manifest.items.map((item) => item.split))).toHaveLength(1);
  });
  it("stratifies lots within each class across train, validation, and test", () => {
    const items = ["LOT-A", "LOT-B", "LOT-C"].flatMap((lotId, lotIndex) =>
      Array.from({ length: 2 }, (_, imageIndex) => ({ ...base, id: `item-${lotIndex}-${imageIndex}`, mediaId: `media-${lotIndex}-${imageIndex}`, lotId })),
    );
    const manifest = buildDatasetManifest(items);
    expect(new Map(manifest.items.map((item) => [item.lotId, item.split]))).toEqual(new Map([
      ["LOT-A", expect.any(String)],
      ["LOT-B", expect.any(String)],
      ["LOT-C", expect.any(String)],
    ]));
    expect(new Set(manifest.items.map((item) => item.split))).toEqual(new Set(["train", "validation", "test"]));
  });
});
