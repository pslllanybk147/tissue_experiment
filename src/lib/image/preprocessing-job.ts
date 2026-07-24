import type { DatasetItem } from "@/lib/domain/models";
import type { PreprocessedImage } from "./image-preprocessor";

export type PreprocessingArtifact = { datasetItemId: string; status: "ready" | "failed"; format: "png" | null; width: number | null; height: number | null; bytes: number | null; sha256: string | null; publicId: string | null; secureUrl: string | null; error: string | null };
export type PreprocessingJob = { id: string; ownerId: string; exportId: string; retryOf: string | null; status: "queued" | "processing" | "completed" | "failed"; itemIds: string[]; processedCount: number; artifacts: PreprocessingArtifact[]; createdAt: string; updatedAt: string };

export async function runPreprocessingJob(input: Omit<PreprocessingJob, "status" | "processedCount" | "artifacts" | "updatedAt">, items: DatasetItem[], process: (item: DatasetItem) => Promise<PreprocessedImage & { publicId?: string; secureUrl?: string }>, now = () => new Date().toISOString()): Promise<PreprocessingJob> {
  const artifacts: PreprocessingArtifact[] = [];
  for (const item of items) {
    try {
      const result = await process(item);
      artifacts.push({ datasetItemId: item.id, status: "ready", format: result.format, width: result.width, height: result.height, bytes: result.bytes, sha256: result.sha256, publicId: result.publicId ?? null, secureUrl: result.secureUrl ?? null, error: null });
    } catch (error) {
      artifacts.push({ datasetItemId: item.id, status: "failed", format: null, width: null, height: null, bytes: null, sha256: null, publicId: null, secureUrl: null, error: error instanceof Error ? error.message : "Preprocessing failed" });
    }
  }
  const failed = artifacts.some(item => item.status === "failed");
  const timestamp = now();
  return { ...input, status: failed ? "failed" : "completed", processedCount: artifacts.length, artifacts, updatedAt: timestamp };
}
