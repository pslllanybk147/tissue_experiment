import type { DatasetItem, DatasetLabel, DatasetProvenance } from "./models";

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
};

export type DatasetManifest = {
  schemaVersion: "image-dataset-v1";
  generatedAt: string;
  itemCount: number;
  items: DatasetManifestEntry[];
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
  const entries = items.filter(isExportable).map(item => ({
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
  }));
  return { schemaVersion: "image-dataset-v1", generatedAt, itemCount: entries.length, items: entries };
}
