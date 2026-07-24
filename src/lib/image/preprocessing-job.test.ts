import { describe, expect, it } from "vitest";
import type { DatasetItem } from "../domain/models";
import { runPreprocessingJob } from "./preprocessing-job";

const item = (id: string): DatasetItem => ({ id, ownerId: "owner-1", mediaId: `media-${id}`, lotId: "LOT-1", observationId: "OBS-1", assetUrl: "https://res.cloudinary.com/demo/image/upload/sample.jpg", width: 100, height: 100, format: "jpg", bytes: 1000, provenance: { kind: "user-captured", sourceUrl: null, license: null, attribution: null, provenanceId: id, status: "Approved", reviewedBy: "reviewer", reviewedAt: "now", note: "checked" }, label: { scientificName: "Philodendron erubescens", cultivarName: "Pink Princess", confidence: "High", source: "expert", reviewedBy: "reviewer", reviewedAt: "now", note: "checked" }, reviewStatus: "Approved", includedInTraining: true, createdAt: "now", updatedAt: "now" });

describe("preprocessing job", () => {
  it("records ready and failed artifacts without stopping the batch", async () => {
    const job = await runPreprocessingJob({ id: "job-1", ownerId: "owner-1", exportId: "export-1", retryOf: null, itemIds: ["a", "b"], createdAt: "now" }, [item("a"), item("b")], async current => current.id === "a" ? { buffer: Buffer.from("x"), format: "png", width: 224, height: 224, bytes: 1, sha256: "hash-a" } : Promise.reject(new Error("decode failed")), () => "later");
    expect(job).toMatchObject({ status: "failed", processedCount: 2, updatedAt: "later" });
    expect(job.artifacts.map(artifact => artifact.status)).toEqual(["ready", "failed"]);
  });
});
