import type { DatasetItem, DatasetLabel, DatasetProvenance } from "./models";

export type DatasetSplit = "train" | "validation" | "test";

export type DatasetManifestEntry = {
  id: string;
  mediaId: string;
  lotId: string;
  observationId: string;
  assetUrl: string;
  scientificName: string;
  cultivarName: string;
  confidence: Exclude<DatasetLabel["confidence"], "Unknown">;
  labelSource: DatasetLabel["source"];
  provenanceKind: DatasetProvenance["kind"];
  provenanceId: string;
  sourceUrl: string | null;
  license: string | null;
  split: DatasetSplit;
};

export type DatasetManifest = {
  schemaVersion: "image-dataset-v1";
  generatedAt: string;
  itemCount: number;
  items: DatasetManifestEntry[];
  splitCounts: Record<DatasetSplit, number>;
};

export type DatasetExportRecord = {
  id: string;
  ownerId: string;
  schemaVersion: DatasetManifest["schemaVersion"];
  generatedAt: string;
  itemCount: number;
  itemIds: string[];
  splitCounts: DatasetManifest["splitCounts"];
  splitStrategy: "lot-hash-v1";
};

type ExportableDatasetItem = DatasetItem & { label: DatasetLabel & { confidence: Exclude<DatasetLabel["confidence"], "Unknown"> } };

function isExportable(item: DatasetItem): item is ExportableDatasetItem {
  return item.reviewStatus === "Approved"
    && item.includedInTraining
    && item.provenance.status === "Approved"
    && item.label !== null
    && item.label.confidence !== "Unknown"
    && Boolean(item.label.scientificName.trim())
    && Boolean(item.label.cultivarName.trim());
}

export function buildDatasetManifest(items: DatasetItem[], generatedAt = new Date().toISOString()): DatasetManifest {
  const exportable = items.filter(isExportable);
  const groups = new Map<string, DatasetSplit>();
  for (const item of exportable) groups.set(item.lotId, splitForGroup(item.lotId));
  const entries = exportable.map(item => ({
    id: item.id,
    mediaId: item.mediaId,
    lotId: item.lotId,
    observationId: item.observationId,
    assetUrl: item.assetUrl,
    scientificName: item.label.scientificName,
    cultivarName: item.label.cultivarName,
    confidence: item.label.confidence,
    labelSource: item.label.source,
    provenanceKind: item.provenance.kind,
    provenanceId: item.provenance.provenanceId,
    sourceUrl: item.provenance.sourceUrl,
    license: item.provenance.license,
    split: groups.get(item.lotId) as DatasetSplit,
  }));
  const splitCounts: Record<DatasetSplit, number> = { train: 0, validation: 0, test: 0 };
  for (const entry of entries) splitCounts[entry.split] += 1;
  return { schemaVersion: "image-dataset-v1", generatedAt, itemCount: entries.length, items: entries, splitCounts };
}

function splitForGroup(group: string): DatasetSplit {
  let hash = 2166136261;
  for (const character of `lot-hash-v1:${group}`) hash = Math.imul(hash ^ character.charCodeAt(0), 16777619);
  const bucket = (hash >>> 0) % 100;
  return bucket < 70 ? "train" : bucket < 90 ? "validation" : "test";
}
