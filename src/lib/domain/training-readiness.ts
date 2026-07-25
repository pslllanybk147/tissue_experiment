import type { DatasetSplit } from "./dataset-exporter";
import type { ModelReadyManifest } from "./model-ready-exporter";

export type TrainingReadinessPolicy = {
  minimumClasses: number;
  minimumTrainPerClass: number;
  minimumValidationPerClass: number;
  minimumTestPerClass: number;
  minimumDistinctLotsPerClass: number;
};

export const PILOT_TRAINING_POLICY: TrainingReadinessPolicy = {
  minimumClasses: 2,
  minimumTrainPerClass: 20,
  minimumValidationPerClass: 5,
  minimumTestPerClass: 5,
  minimumDistinctLotsPerClass: 3,
};

export type ClassSplitCount = Record<DatasetSplit, number> & {
  total: number;
  distinctLots: number;
};

export type TrainingReadinessReport = {
  schemaVersion: "training-readiness-v2";
  generatedAt: string;
  sourceJobId: string;
  itemCount: number;
  splitCounts: ModelReadyManifest["splitCounts"];
  classCounts: Record<string, number>;
  classSplitCounts: Record<string, ClassSplitCount>;
  policy: TrainingReadinessPolicy;
  blockers: string[];
  warnings: string[];
  ready: boolean;
};

const classNameFor = (item: ModelReadyManifest["items"][number]) =>
  `${item.scientificName} · ${item.cultivarName}`;

export function buildTrainingReadinessReport(
  manifest: ModelReadyManifest,
  generatedAt = new Date().toISOString(),
  policy: TrainingReadinessPolicy = PILOT_TRAINING_POLICY,
): TrainingReadinessReport {
  const classCounts: Record<string, number> = {};
  const classSplitCounts: Record<string, ClassSplitCount> = {};
  const classLots = new Map<string, Set<string>>();
  const hashOwners = new Map<string, string>();
  const blockers = new Set<string>();

  for (const item of manifest.items) {
    const className = classNameFor(item);
    classCounts[className] = (classCounts[className] ?? 0) + 1;
    classSplitCounts[className] ??= {
      total: 0,
      train: 0,
      validation: 0,
      test: 0,
      distinctLots: 0,
    };
    classSplitCounts[className].total += 1;
    classSplitCounts[className][item.split] += 1;
    const lots = classLots.get(className) ?? new Set<string>();
    lots.add(item.lotId);
    classLots.set(className, lots);

    const duplicate = hashOwners.get(item.artifactSha256);
    if (duplicate && duplicate !== item.id) {
      blockers.add(`พบ artifact hash ซ้ำระหว่าง ${duplicate} และ ${item.id}`);
    }
    hashOwners.set(item.artifactSha256, item.id);
  }

  const classNames = Object.keys(classCounts);
  if (manifest.itemCount === 0) blockers.add("ยังไม่มีภาพที่พร้อมสำหรับการฝึก");
  if (manifest.splitCounts.train === 0) blockers.add("ไม่มีภาพใน train split");
  if (manifest.splitCounts.validation === 0) blockers.add("ไม่มีภาพใน validation split");
  if (manifest.splitCounts.test === 0) blockers.add("ไม่มีภาพใน test split");
  if (classNames.length < policy.minimumClasses) {
    blockers.add(`ต้องมีอย่างน้อย ${policy.minimumClasses} คลาส แต่ขณะนี้มี ${classNames.length} คลาส`);
  }

  for (const className of classNames) {
    const counts = classSplitCounts[className];
    counts.distinctLots = classLots.get(className)?.size ?? 0;
    if (counts.train < policy.minimumTrainPerClass) {
      blockers.add(`คลาส ${className} ต้องเพิ่มภาพ train อีก ${policy.minimumTrainPerClass - counts.train} ภาพ`);
    }
    if (counts.validation < policy.minimumValidationPerClass) {
      blockers.add(`คลาส ${className} ต้องเพิ่มภาพ validation อีก ${policy.minimumValidationPerClass - counts.validation} ภาพ`);
    }
    if (counts.test < policy.minimumTestPerClass) {
      blockers.add(`คลาส ${className} ต้องเพิ่มภาพ test อีก ${policy.minimumTestPerClass - counts.test} ภาพ`);
    }
    if (counts.distinctLots < policy.minimumDistinctLotsPerClass) {
      blockers.add(`คลาส ${className} ต้องมีอย่างน้อย ${policy.minimumDistinctLotsPerClass} Lot แต่ขณะนี้มี ${counts.distinctLots} Lot`);
    }
  }

  const blockerList = [...blockers];
  return {
    schemaVersion: "training-readiness-v2",
    generatedAt,
    sourceJobId: manifest.sourceJobId,
    itemCount: manifest.itemCount,
    splitCounts: manifest.splitCounts,
    classCounts,
    classSplitCounts,
    policy,
    blockers: blockerList,
    warnings: blockerList,
    ready: blockerList.length === 0,
  };
}
