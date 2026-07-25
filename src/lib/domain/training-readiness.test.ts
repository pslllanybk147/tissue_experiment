import { describe, expect, it } from "vitest";
import { buildModelReadyManifest } from "./model-ready-exporter";
import { buildTrainingReadinessReport, PILOT_TRAINING_POLICY } from "./training-readiness";
import type { ModelReadyManifest } from "./model-ready-exporter";
import type { DatasetItem } from "./models";
import type { PreprocessingJob } from "../image/preprocessing-job";

const item: DatasetItem = { id: "item-1", ownerId: "owner-1", mediaId: "media-1", lotId: "lot-1", observationId: "obs-1", assetUrl: "https://res.cloudinary.com/demo/image/upload/original.jpg", width: 1000, height: 800, format: "jpg", bytes: 1200, provenance: { kind: "user-captured", sourceUrl: null, license: null, attribution: null, provenanceId: "capture-1", status: "Approved", reviewedBy: "owner-1", reviewedAt: "now", note: "checked" }, label: { scientificName: "Philodendron erubescens", cultivarName: "Pink Princess", confidence: "High", source: "owner", reviewedBy: "owner-1", reviewedAt: "now", note: "checked" }, reviewStatus: "Approved", includedInTraining: true, createdAt: "now", updatedAt: "now" };
const job: PreprocessingJob = { id: "job-1", ownerId: "owner-1", exportId: "export-1", retryOf: null, status: "completed", itemIds: [item.id], processedCount: 1, artifacts: [{ datasetItemId: item.id, status: "ready", format: "png", width: 224, height: 224, bytes: 400, sha256: "hash-1", publicId: "preprocessed-item-1", secureUrl: "https://res.cloudinary.com/demo/image/upload/preprocessed-item-1.png", error: null }], createdAt: "now", updatedAt: "now" };

describe("training readiness report", () => {
  it("reports missing split coverage", () => {
    const report = buildTrainingReadinessReport(buildModelReadyManifest([item], job));
    expect(report.ready).toBe(false);
    expect(report.warnings).toContain("ไม่มีภาพใน validation split");
    expect(report.blockers).toContain(`ต้องมีอย่างน้อย ${PILOT_TRAINING_POLICY.minimumClasses} คลาส แต่ขณะนี้มี 1 คลาส`);
    expect(report.classSplitCounts["Philodendron erubescens · Pink Princess"]).toMatchObject({
      total: 1,
      train: 1,
      validation: 0,
      test: 0,
      distinctLots: 1,
    });
    expect(report.classCounts["Philodendron erubescens · Pink Princess"]).toBe(1);
  });

  it("requires enough independently grouped images for every class and split", () => {
    const classes = [
      ["Philodendron erubescens", "Pink Princess"],
      ["Philodendron bipennifolium", "Violin variegated"],
    ] as const;
    const splits = [
      ["train", PILOT_TRAINING_POLICY.minimumTrainPerClass],
      ["validation", PILOT_TRAINING_POLICY.minimumValidationPerClass],
      ["test", PILOT_TRAINING_POLICY.minimumTestPerClass],
    ] as const;
    const entries: ModelReadyManifest["items"] = [];
    for (const [scientificName, cultivarName] of classes) {
      for (const [split, count] of splits) {
        for (let index = 0; index < count; index += 1) {
          const id = `${cultivarName}-${split}-${index}`;
          entries.push({
            id,
            mediaId: `media-${id}`,
            lotId: `${cultivarName}-lot-${index % PILOT_TRAINING_POLICY.minimumDistinctLotsPerClass}`,
            observationId: `obs-${id}`,
            assetUrl: `https://example.com/${id}.jpg`,
            scientificName,
            cultivarName,
            confidence: "High",
            labelSource: "owner",
            provenanceKind: "user-captured",
            provenanceId: `capture-${id}`,
            sourceUrl: null,
            license: null,
            split,
            width: 224,
            height: 224,
            format: "png",
            bytes: 1000,
            sourceAssetUrl: `https://example.com/source-${id}.jpg`,
            artifactUrl: `https://example.com/${id}.png`,
            artifactPublicId: id,
            artifactSha256: `hash-${id}`,
          });
        }
      }
    }
    const manifest: ModelReadyManifest = {
      schemaVersion: "image-dataset-model-ready-v1",
      generatedAt: "2026-07-25T00:00:00.000Z",
      sourceJobId: "job-ready",
      itemCount: entries.length,
      items: entries,
      splitCounts: {
        train: entries.filter((entry) => entry.split === "train").length,
        validation: entries.filter((entry) => entry.split === "validation").length,
        test: entries.filter((entry) => entry.split === "test").length,
      },
      preprocessing: buildModelReadyManifest([item], job).preprocessing,
    };

    const report = buildTrainingReadinessReport(manifest);

    expect(report.ready).toBe(true);
    expect(report.blockers).toEqual([]);
    expect(report.policy).toEqual(PILOT_TRAINING_POLICY);
  });

  it("blocks duplicated preprocessed images from leaking across records", () => {
    const manifest = buildModelReadyManifest([item], job);
    manifest.items.push({
      ...manifest.items[0],
      id: "item-duplicate",
      mediaId: "media-duplicate",
      artifactPublicId: "preprocessed-duplicate",
    });
    manifest.itemCount = 2;
    manifest.splitCounts.train = 2;

    const report = buildTrainingReadinessReport(manifest);

    expect(report.ready).toBe(false);
    expect(report.blockers.some((message) => message.includes("artifact hash ซ้ำ"))).toBe(true);
  });
});
