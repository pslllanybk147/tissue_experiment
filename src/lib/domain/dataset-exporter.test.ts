import { describe, expect, it } from "vitest";
import type { ObservationMedia } from "./models";
import { generateMLDatasetManifest } from "./dataset-exporter";

describe("Dataset Exporter", () => {
  it("generates a valid ML dataset JSON manifest from observation media", () => {
    const mediaItems: ObservationMedia[] = [
      {
        id: "media-1",
        ownerId: "owner-1",
        lotId: "lot-101",
        observationId: "obs-1",
        cloudinaryPublicId: "pub-1",
        secureUrl: "https://res.cloudinary.com/demo/image/upload/sample1.jpg",
        width: 1200,
        height: 800,
        format: "jpg",
        bytes: 250000,
        caption: "Pink Princess leaf variegation test",
        capturedAt: "2026-07-23T10:00:00Z",
        createdBy: "owner-1",
        createdAt: "2026-07-23T10:00:00Z",
        updatedAt: "2026-07-23T10:00:00Z",
        deletedAt: null,
      },
    ];

    const manifest = generateMLDatasetManifest(mediaItems, "Pink Princess");

    expect(manifest.version).toBe("1.0.0");
    expect(manifest.datasetName).toContain("Pink Princess");
    expect(manifest.totalImages).toBe(1);
    expect(manifest.images[0]).toHaveProperty("id", "media-1");
    expect(manifest.images[0]).toHaveProperty("license", "CC-BY 4.0 Verified Provenance");
    expect(manifest.images[0]).toHaveProperty("annotations");
  });
});
