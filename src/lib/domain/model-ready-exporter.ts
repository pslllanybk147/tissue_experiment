import type { DatasetItem } from "./models";
import type { PreprocessingArtifact, PreprocessingJob } from "../image/preprocessing-job";
import { buildDatasetManifest, type DatasetManifest, type DatasetManifestEntry } from "./dataset-exporter";

export type ModelReadyManifestEntry = DatasetManifestEntry & {
  sourceAssetUrl: string;
  artifactUrl: string;
  artifactPublicId: string;
  artifactSha256: string;
};

export type ModelReadyManifest = Omit<DatasetManifest, "schemaVersion" | "items"> & {
  schemaVersion: "image-dataset-model-ready-v1";
  sourceJobId: string;
  items: ModelReadyManifestEntry[];
};

function readyArtifact(artifact: PreprocessingArtifact | undefined): artifact is PreprocessingArtifact & { status: "ready"; secureUrl: string; publicId: string; sha256: string } {
  return artifact?.status === "ready" && Boolean(artifact.secureUrl && artifact.publicId && artifact.sha256);
}

export function buildModelReadyManifest(items: DatasetItem[], job: PreprocessingJob, generatedAt = new Date().toISOString()): ModelReadyManifest {
  const base = buildDatasetManifest(items, generatedAt);
  const artifacts = new Map(job.artifacts.map(artifact => [artifact.datasetItemId, artifact]));
  const entries = base.items.map(entry => {
    const artifact = artifacts.get(entry.id);
    if (!readyArtifact(artifact)) throw new Error(`Preprocessed artifact missing for ${entry.id}`);
    return { ...entry, sourceAssetUrl: entry.assetUrl, artifactUrl: artifact.secureUrl, artifactPublicId: artifact.publicId, artifactSha256: artifact.sha256 };
  });
  if (job.status !== "completed" || entries.length !== base.itemCount || job.itemIds.length !== base.itemCount) throw new Error("Preprocessing job is not complete for the current dataset");
  return { ...base, schemaVersion: "image-dataset-model-ready-v1", sourceJobId: job.id, items: entries };
}
