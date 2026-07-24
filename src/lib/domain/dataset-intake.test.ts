import { describe, expect, it } from "vitest";
import type { DatasetLabel, DatasetProvenance } from "./models";
import { validateDatasetItemInput, validateDatasetLabel } from "./dataset-intake";

const provenance: DatasetProvenance = { kind: "user-captured", sourceUrl: null, license: null, attribution: null, provenanceId: "capture-1", status: "Pending review", reviewedBy: null, reviewedAt: null, note: "เจ้าของถ่ายเอง" };
const label: DatasetLabel = { scientificName: "Philodendron erubescens", cultivarName: "Pink Princess", confidence: "Medium", source: "owner", reviewedBy: null, reviewedAt: null, note: "ตรวจจากต้นแม่" };

describe("dataset intake validation", () => {
  it("requires provenance fields appropriate to the image source", () => {
    expect(validateDatasetItemInput({ mediaId: "m1", lotId: "l1", observationId: "o1", assetUrl: "https://x", provenance })).toEqual({});
    expect(validateDatasetItemInput({ mediaId: "m1", lotId: "l1", observationId: "o1", assetUrl: "https://x", provenance: { ...provenance, kind: "licensed-reference", sourceUrl: null } })).toHaveProperty("sourceUrl");
  });
  it("does not accept Unknown label as training truth", () => {
    expect(validateDatasetLabel({ ...label, confidence: "Unknown" })).toContain("confidence");
    expect(validateDatasetLabel(label)).toBeNull();
  });
});
