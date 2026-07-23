import type { DatasetItem, DatasetLabel, DatasetProvenance, DatasetReviewStatus } from "../domain/models";

export type DatasetItemInput = Pick<DatasetItem, "mediaId" | "lotId" | "observationId" | "assetUrl"> & { provenance: DatasetProvenance };

export interface DatasetRepository {
  list(ownerId: string, status?: DatasetReviewStatus): Promise<DatasetItem[]>;
  get(ownerId: string, id: string): Promise<DatasetItem | null>;
  create(ownerId: string, input: DatasetItemInput): Promise<DatasetItem>;
  reviewProvenance(ownerId: string, id: string, status: DatasetReviewStatus, reviewerId: string, note: string): Promise<DatasetItem>;
  setLabel(ownerId: string, id: string, label: DatasetLabel): Promise<DatasetItem>;
}
