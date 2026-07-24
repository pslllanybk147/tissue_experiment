import { createFirestoreDatasetRepository } from "../firebase/firestore-dataset-repository";
import { createMemoryDatasetRepository } from "./memory-dataset-repository";
import type { DatasetRepository } from "./dataset-repository";

const demos = new Map<string, DatasetRepository>();

export function getDatasetRepository(ownerId: string, authenticated: boolean): DatasetRepository {
  if (authenticated) return createFirestoreDatasetRepository(ownerId);
  const existing = demos.get(ownerId);
  if (existing) return existing;
  const repository = createMemoryDatasetRepository(ownerId);
  demos.set(ownerId, repository);
  return repository;
}
