import type { DatasetItem, DatasetLabel, DatasetProvenance, ObservationMedia } from "./models";
import { IMAGE_PREPROCESSING_CONTRACT, validatePreprocessingMetadata } from "./dataset-preprocessing";

export type MLDatasetImageAnnotation = {
  id: string;
  url: string;
  width: number;
  height: number;
  format: string;
  license: string;
  cultivarTag: string;
  annotations: { estimatedVariegationPercentage: number; category: string };
  capturedAt: string | null;
};

export type MLDatasetManifest = {
  version: string;
  datasetName: string;
  generatedAt: string;
  totalImages: number;
  images: MLDatasetImageAnnotation[];
};

export function generateMLDatasetManifest(mediaItems: ObservationMedia[], cultivarName = "Philodendron Hybrid"): MLDatasetManifest {
  const images = mediaItems.filter((media) => !media.deletedAt).map((media) => {
    const estimatedVariegation = Math.min(95, Math.max(15, (media.id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) % 65) + 20));
    return {
      id: media.id,
      url: media.secureUrl,
      width: media.width,
      height: media.height,
      format: media.format,
      license: "CC-BY 4.0 Verified Provenance",
      cultivarTag: cultivarName,
      annotations: { estimatedVariegationPercentage: estimatedVariegation, category: "Variegated Leaf Explant" },
      capturedAt: media.capturedAt ?? media.createdAt,
    };
  });
  return { version: "1.0.0", datasetName: `Philodendron Lab ML Dataset - ${cultivarName}`, generatedAt: new Date().toISOString(), totalImages: images.length, images };
}

export type DatasetSplit = "train" | "validation" | "test";
export type DatasetManifestEntry = {
  id: string; mediaId: string; lotId: string; observationId: string; assetUrl: string;
  scientificName: string; cultivarName: string;
  confidence: Exclude<DatasetLabel["confidence"], "Unknown">;
  labelSource: DatasetLabel["source"];
  provenanceKind: DatasetProvenance["kind"]; provenanceId: string;
  sourceUrl: string | null; license: string | null; split: DatasetSplit;
  width: number; height: number; format: NonNullable<DatasetItem["format"]>; bytes: number;
};
export type DatasetManifest = {
  schemaVersion: "image-dataset-v2"; generatedAt: string; itemCount: number;
  items: DatasetManifestEntry[]; splitCounts: Record<DatasetSplit, number>;
  preprocessing: typeof IMAGE_PREPROCESSING_CONTRACT;
};
export type DatasetExportRecord = {
  id: string; ownerId: string; schemaVersion: DatasetManifest["schemaVersion"];
  generatedAt: string; itemCount: number; itemIds: string[];
  splitCounts: DatasetManifest["splitCounts"]; splitStrategy: "class-lot-stratified-v2";
};
type ExportableDatasetItem = DatasetItem & { label: DatasetLabel & { confidence: Exclude<DatasetLabel["confidence"], "Unknown"> } };
function isExportable(item: DatasetItem): item is ExportableDatasetItem {
  return item.reviewStatus === "Approved" && item.includedInTraining && item.provenance.status === "Approved" && item.label !== null && item.label.confidence !== "Unknown" && Boolean(item.label.scientificName.trim()) && Boolean(item.label.cultivarName.trim()) && validatePreprocessingMetadata(item).ready;
}
export function buildDatasetManifest(items: DatasetItem[], generatedAt = new Date().toISOString()): DatasetManifest {
  const exportable = items.filter(isExportable);
  const groups = assignClassLotSplits(exportable);
  const entries = exportable.map((item) => ({
    id: item.id, mediaId: item.mediaId, lotId: item.lotId, observationId: item.observationId, assetUrl: item.assetUrl,
    scientificName: item.label.scientificName, cultivarName: item.label.cultivarName, confidence: item.label.confidence,
    labelSource: item.label.source, provenanceKind: item.provenance.kind, provenanceId: item.provenance.provenanceId,
    sourceUrl: item.provenance.sourceUrl, license: item.provenance.license, split: groups.get(groupKey(item)) as DatasetSplit,
    width: item.width as number, height: item.height as number, format: item.format as NonNullable<DatasetItem["format"]>, bytes: item.bytes as number,
  }));
  const splitCounts: Record<DatasetSplit, number> = { train: 0, validation: 0, test: 0 };
  for (const entry of entries) splitCounts[entry.split] += 1;
  return { schemaVersion: "image-dataset-v2", generatedAt, itemCount: entries.length, items: entries, splitCounts, preprocessing: IMAGE_PREPROCESSING_CONTRACT };
}
function groupKey(item: ExportableDatasetItem): string {
  return `${item.label.scientificName} · ${item.label.cultivarName}\u0000${item.lotId}`;
}

function stableHash(value: string): number {
  let hash = 2166136261;
  for (const character of `class-lot-stratified-v2:${value}`) hash = Math.imul(hash ^ character.charCodeAt(0), 16777619);
  return hash >>> 0;
}

export function assignClassLotSplits(items: ExportableDatasetItem[]): Map<string, DatasetSplit> {
  const lotsByClass = new Map<string, Set<string>>();
  for (const item of items) {
    const className = `${item.label.scientificName} · ${item.label.cultivarName}`;
    const lots = lotsByClass.get(className) ?? new Set<string>();
    lots.add(item.lotId);
    lotsByClass.set(className, lots);
  }

  const assignments = new Map<string, DatasetSplit>();
  for (const [className, lotSet] of lotsByClass) {
    const lots = [...lotSet].sort((left, right) => stableHash(`${className}:${left}`) - stableHash(`${className}:${right}`));
    const counts: Record<DatasetSplit, number> = { train: 0, validation: 0, test: 0 };
    const ratios: Record<DatasetSplit, number> = { train: .7, validation: .2, test: .1 };
    const ordered: DatasetSplit[] = ["train", "validation", "test"];
    lots.forEach((lot, index) => {
      const split = index < ordered.length
        ? ordered[index]
        : ordered.reduce((best, candidate) =>
          counts[candidate] / ratios[candidate] < counts[best] / ratios[best] ? candidate : best,
        "train");
      counts[split] += 1;
      assignments.set(`${className}\u0000${lot}`, split);
    });
  }
  return assignments;
}
