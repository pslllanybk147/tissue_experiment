import { describe, expect, it } from "vitest";
import { IMAGE_PREPROCESSING_CONTRACT, validatePreprocessingMetadata } from "./dataset-preprocessing";

describe("dataset preprocessing contract", () => {
  it("accepts valid image metadata", () => {
    expect(validatePreprocessingMetadata({ width: 1200, height: 900, format: "jpg", bytes: 200_000 })).toEqual({ ready: true, errors: [] });
    expect(IMAGE_PREPROCESSING_CONTRACT.targetWidth).toBe(224);
  });

  it("rejects missing or unsafe metadata", () => {
    const result = validatePreprocessingMetadata({ width: 0, height: 0, format: "gif", bytes: 20_000_000 });
    expect(result.ready).toBe(false);
    expect(result.errors).toHaveLength(4);
  });
});
