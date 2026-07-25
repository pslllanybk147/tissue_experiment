import sharp from "sharp";
import { isVariegatedPixel } from "../domain/image-analyzer";

export const BASELINE_MODEL_SCHEMA = "image-baseline-centroid-v1" as const;
export const BASELINE_FEATURE_SCHEMA = "rgb-statistics-v1" as const;

export type BaselineImageExample = {
  id: string;
  lotId: string;
  label: string;
  split: "train" | "validation" | "test";
  buffer: Buffer;
};

export type BaselineFeature = {
  schemaVersion: typeof BASELINE_FEATURE_SCHEMA;
  vector: number[];
};

export type BaselineModel = {
  schemaVersion: typeof BASELINE_MODEL_SCHEMA;
  featureSchema: typeof BASELINE_FEATURE_SCHEMA;
  classes: string[];
  centroids: Record<string, number[]>;
  trainCount: Record<string, number>;
};

export type BaselinePrediction = {
  id: string;
  actual: string;
  predicted: string;
  distance: number;
};

export type BaselineEvaluation = {
  schemaVersion: "image-baseline-evaluation-v1";
  modelSchemaVersion: typeof BASELINE_MODEL_SCHEMA;
  featureSchema: typeof BASELINE_FEATURE_SCHEMA;
  generatedAt: string;
  trainCount: number;
  validation: EvaluationMetrics;
  test: EvaluationMetrics;
  warnings: string[];
};

export type EvaluationMetrics = {
  split: "validation" | "test";
  total: number;
  correct: number;
  accuracy: number | null;
  perClass: Record<string, { total: number; correct: number; accuracy: number | null }>;
  confusionMatrix: Record<string, Record<string, number>>;
  predictions: BaselinePrediction[];
};

const FEATURE_SIZE = 24;

export async function extractBaselineFeature(input: Buffer): Promise<BaselineFeature> {
  const { data, info } = await sharp(input, { limitInputPixels: 40_000_000 })
    .rotate()
    .resize(FEATURE_SIZE, FEATURE_SIZE, { fit: "cover" })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  if (info.channels !== 3) throw new Error("Baseline classifier requires RGB images");

  const sums = [0, 0, 0];
  const squares = [0, 0, 0];
  const histograms = [Array(4).fill(0), Array(4).fill(0), Array(4).fill(0)];
  let variegated = 0;
  const pixelCount = info.width * info.height;
  for (let index = 0; index < data.length; index += 3) {
    const rgb: [number, number, number] = [data[index], data[index + 1], data[index + 2]];
    rgb.forEach((value, channel) => {
      const normalized = value / 255;
      sums[channel] += normalized;
      squares[channel] += normalized * normalized;
      histograms[channel][Math.min(3, Math.floor(value / 64))] += 1;
    });
    if (isVariegatedPixel(...rgb)) variegated += 1;
  }

  const means = sums.map((sum) => sum / pixelCount);
  const deviations = squares.map((sum, channel) => Math.sqrt(Math.max(0, sum / pixelCount - means[channel] ** 2)));
  const normalizedHistograms = histograms.flat().map((count) => count / pixelCount);
  return {
    schemaVersion: BASELINE_FEATURE_SCHEMA,
    vector: [...means, ...deviations, ...normalizedHistograms, variegated / pixelCount],
  };
}

export function trainBaselineModel(features: Array<{ label: string; feature: BaselineFeature }>): BaselineModel {
  const grouped = new Map<string, number[][]>();
  for (const example of features) {
    const vectors = grouped.get(example.label) ?? [];
    vectors.push(example.feature.vector);
    grouped.set(example.label, vectors);
  }
  if (grouped.size < 2) throw new Error("Baseline training requires at least two classes");
  const centroids: Record<string, number[]> = {};
  const trainCount: Record<string, number> = {};
  for (const [label, vectors] of grouped) {
    if (!vectors.length) continue;
    centroids[label] = vectors[0].map((_, index) => vectors.reduce((sum, vector) => sum + vector[index], 0) / vectors.length);
    trainCount[label] = vectors.length;
  }
  return { schemaVersion: BASELINE_MODEL_SCHEMA, featureSchema: BASELINE_FEATURE_SCHEMA, classes: [...grouped.keys()].sort(), centroids, trainCount };
}

export function predictBaseline(model: BaselineModel, feature: BaselineFeature): { label: string; distance: number } {
  if (feature.schemaVersion !== model.featureSchema) throw new Error("Feature schema does not match baseline model");
  return model.classes.reduce<{ label: string; distance: number } | null>((best, label) => {
    const centroid = model.centroids[label];
    const distance = Math.sqrt(centroid.reduce((sum, value, index) => sum + (value - feature.vector[index]) ** 2, 0));
    return !best || distance < best.distance ? { label, distance } : best;
  }, null) as { label: string; distance: number };
}

export async function evaluateBaselineModel(model: BaselineModel, examples: BaselineImageExample[], split: "validation" | "test"): Promise<EvaluationMetrics> {
  const predictions: BaselinePrediction[] = [];
  for (const example of examples.filter((item) => item.split === split)) {
    const feature = await extractBaselineFeature(example.buffer);
    const prediction = predictBaseline(model, feature);
    predictions.push({ id: example.id, actual: example.label, predicted: prediction.label, distance: Number(prediction.distance.toFixed(6)) });
  }
  const perClass: EvaluationMetrics["perClass"] = {};
  const confusionMatrix: EvaluationMetrics["confusionMatrix"] = {};
  for (const label of model.classes) {
    perClass[label] = { total: 0, correct: 0, accuracy: null };
    confusionMatrix[label] = Object.fromEntries(model.classes.map((candidate) => [candidate, 0]));
  }
  for (const prediction of predictions) {
    const row = perClass[prediction.actual] ??= { total: 0, correct: 0, accuracy: null };
    row.total += 1;
    if (prediction.actual === prediction.predicted) row.correct += 1;
    row.accuracy = row.total ? row.correct / row.total : null;
    confusionMatrix[prediction.actual] ??= {};
    confusionMatrix[prediction.actual][prediction.predicted] = (confusionMatrix[prediction.actual][prediction.predicted] ?? 0) + 1;
  }
  const correct = predictions.filter((prediction) => prediction.actual === prediction.predicted).length;
  return { split, total: predictions.length, correct, accuracy: predictions.length ? correct / predictions.length : null, perClass, confusionMatrix, predictions };
}

export async function buildBaselineEvaluation(examples: BaselineImageExample[], generatedAt = new Date().toISOString()): Promise<{ model: BaselineModel; evaluation: BaselineEvaluation }> {
  const trainExamples = examples.filter((example) => example.split === "train");
  const trainLots = new Set(trainExamples.map((example) => example.lotId));
  const evaluationExamples = examples.filter((example) => example.split !== "train");
  if (evaluationExamples.some((example) => trainLots.has(example.lotId))) throw new Error("Baseline evaluation has a Lot shared with train data");
  const trainFeatures = await Promise.all(trainExamples.map(async (example) => ({ label: example.label, feature: await extractBaselineFeature(example.buffer) })));
  const model = trainBaselineModel(trainFeatures);
  const validation = await evaluateBaselineModel(model, examples, "validation");
  const test = await evaluateBaselineModel(model, examples, "test");
  return {
    model,
    evaluation: {
      schemaVersion: "image-baseline-evaluation-v1",
      modelSchemaVersion: BASELINE_MODEL_SCHEMA,
      featureSchema: BASELINE_FEATURE_SCHEMA,
      generatedAt,
      trainCount: trainExamples.length,
      validation,
      test,
      warnings: ["นี่คือ baseline centroid สำหรับตรวจ pipeline ไม่ใช่โมเดลระบุสายพันธุ์ที่พร้อมใช้งานจริง", "ต้องเปรียบเทียบกับวิธีที่ดีกว่าและตรวจภาพที่โมเดลทายผิดโดยมนุษย์"],
    },
  };
}
