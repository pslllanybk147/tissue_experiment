import { describe, expect, it } from "vitest";
import type { DatasetItem } from "./models";
import { buildDatasetManifest } from "./dataset-exporter";

const base: DatasetItem = {
  id: "dataset-1", ownerId: "owner-1", mediaId: "media-1", lotId: "LOT-1", observationId: "OBS-1", assetUrl: "https://example.com/leaf.jpg",
  provenance: { kind: "user-captured", sourceUrl: null, license: null, attribution: null, provenanceId: "capture-1", status: "Approved", reviewedBy: "reviewer-1", reviewedAt: "2026-07-23T00:00:00.000Z", note: "ตรวจแล้ว" },
  label: { scientificName: "Philodendron erubescens", cultivarName: "Pink Princess", confidence: "High", source: "expert", reviewedBy: "reviewer-1", reviewedAt: "2026-07-23T00:00:00.000Z", note: "ตรวจลักษณะใบและก้าน" },
  reviewStatus: "Approved", includedInTraining: true, createdAt: "2026-07-23T00:00:00.000Z", updatedAt: "2026-07-23T00:00:00.000Z",
};

describe("dataset exporter", () => {
  it("exports only approved, labeled training candidates", () => {
    const manifest = buildDatasetManifest([base, { ...base, id: "pending", reviewStatus: "Pending review", includedInTraining: false }, { ...base, id: "unknown", label: { ...base.label, confidence: "Unknown" } }], "2026-07-23T01:00:00.000Z");
    expect(manifest).toMatchObject({ schemaVersion: "image-dataset-v1", generatedAt: "2026-07-23T01:00:00.000Z", itemCount: 1, splitCounts: { train: 1, validation: 0, test: 0 } });
    expect(manifest.items[0]).toMatchObject({ id: "dataset-1", cultivarName: "Pink Princess", confidence: "High", split: "train" });
  });

  it("keeps items from the same lot in one split", () => {
    const manifest = buildDatasetManifest([base, { ...base, id: "dataset-2", mediaId: "media-2" }]);
    expect(new Set(manifest.items.map(item => item.split))).toHaveLength(1);
  });
});
