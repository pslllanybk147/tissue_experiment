import type { ModelReadyManifest } from "./model-ready-exporter";

export type TrainingReadinessReport = {
  schemaVersion: "training-readiness-v1";
  generatedAt: string;
  sourceJobId: string;
  itemCount: number;
  splitCounts: ModelReadyManifest["splitCounts"];
  classCounts: Record<string, number>;
  warnings: string[];
  ready: boolean;
};

export function buildTrainingReadinessReport(manifest: ModelReadyManifest, generatedAt = new Date().toISOString()): TrainingReadinessReport {
  const classCounts: Record<string, number> = {};
  const hashOwners = new Map<string, string>();
  const warnings = new Set<string>();
  for (const item of manifest.items) {
    const className = `${item.scientificName} · ${item.cultivarName}`;
    classCounts[className] = (classCounts[className] ?? 0) + 1;
    const duplicate = hashOwners.get(item.artifactSha256);
    if (duplicate && duplicate !== item.id) warnings.add(`พบ artifact hash ซ้ำระหว่าง ${duplicate} และ ${item.id}`);
    hashOwners.set(item.artifactSha256, item.id);
  }
  if (manifest.itemCount === 0) warnings.add("ยังไม่มีภาพที่พร้อมสำหรับการฝึก");
  if (manifest.splitCounts.train === 0) warnings.add("ไม่มีภาพใน train split");
  if (manifest.splitCounts.validation === 0) warnings.add("ไม่มีภาพใน validation split");
  if (manifest.splitCounts.test === 0) warnings.add("ไม่มีภาพใน test split");
  const classWithoutTrain = manifest.items.filter(item => item.split !== "train").map(item => `${item.scientificName} · ${item.cultivarName}`).filter((name, index, names) => names.indexOf(name) === index).filter(name => !manifest.items.some(item => item.split === "train" && `${item.scientificName} · ${item.cultivarName}` === name));
  for (const name of classWithoutTrain) warnings.add(`คลาส ${name} ไม่มีตัวอย่างใน train split`);
  return { schemaVersion: "training-readiness-v1", generatedAt, sourceJobId: manifest.sourceJobId, itemCount: manifest.itemCount, splitCounts: manifest.splitCounts, classCounts, warnings: [...warnings], ready: warnings.size === 0 };
}
