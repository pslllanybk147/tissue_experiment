import { describe, expect, it } from "vitest";
import sharp from "sharp";
import { buildBaselineEvaluation, extractBaselineFeature, trainBaselineModel } from "./baseline-classifier";

async function image(background: { r: number; g: number; b: number }) {
  return sharp({ create: { width: 64, height: 64, channels: 3, background } }).png().toBuffer();
}

describe("baseline image classifier", () => {
  it("extracts a stable feature vector from an image", async () => {
    const feature = await extractBaselineFeature(await image({ r: 40, g: 150, b: 70 }));
    expect(feature.schemaVersion).toBe("rgb-statistics-v1");
    expect(feature.vector.length).toBe(19);
    expect(feature.vector.every((value) => Number.isFinite(value))).toBe(true);
  });

  it("trains centroids for at least two classes", () => {
    const model = trainBaselineModel([
      { label: "green", feature: { schemaVersion: "rgb-statistics-v1", vector: [1, 0] } },
      { label: "pink", feature: { schemaVersion: "rgb-statistics-v1", vector: [0, 1] } },
    ]);
    expect(model.classes).toEqual(["green", "pink"]);
    expect(model.trainCount).toEqual({ green: 1, pink: 1 });
  });

  it("evaluates validation and test data without Lot leakage", async () => {
    const green = await image({ r: 30, g: 160, b: 60 });
    const pink = await image({ r: 220, g: 80, b: 150 });
    const examples = [
      { id: "g-train", lotId: "g-1", label: "green", split: "train" as const, buffer: green },
      { id: "p-train", lotId: "p-1", label: "pink", split: "train" as const, buffer: pink },
      { id: "g-validation", lotId: "g-2", label: "green", split: "validation" as const, buffer: green },
      { id: "p-validation", lotId: "p-2", label: "pink", split: "validation" as const, buffer: pink },
      { id: "g-test", lotId: "g-3", label: "green", split: "test" as const, buffer: green },
      { id: "p-test", lotId: "p-3", label: "pink", split: "test" as const, buffer: pink },
    ];
    const result = await buildBaselineEvaluation(examples, "2026-07-25T00:00:00.000Z");
    expect(result.evaluation.validation).toMatchObject({ total: 2, accuracy: 1 });
    expect(result.evaluation.test).toMatchObject({ total: 2, accuracy: 1 });
  });

  it("rejects a Lot shared by train and evaluation data", async () => {
    const buffer = await image({ r: 30, g: 160, b: 60 });
    await expect(buildBaselineEvaluation([
      { id: "train", lotId: "same", label: "green", split: "train", buffer },
      { id: "validation", lotId: "same", label: "green", split: "validation", buffer },
      { id: "train-pink", lotId: "pink", label: "pink", split: "train", buffer },
    ])).rejects.toThrow("Lot shared with train data");
  });
});
