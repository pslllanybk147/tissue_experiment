import { createDemoSnapshot } from "./demo-lab-repository";
import type { ExperimentRepository } from "./experiment-repository";
import { createMemoryExperimentRepository } from "./memory-experiment-repository";
import { createFirestoreExperimentRepository } from "../firebase/firestore-experiment-repository";

const demoRepositories = new Map<string, ExperimentRepository>();

export function getExperimentRepository(ownerId: string, authenticated: boolean): ExperimentRepository {
  if (authenticated) return createFirestoreExperimentRepository(ownerId);
  const existing = demoRepositories.get(ownerId);
  if (existing) return existing;
  const repository = createMemoryExperimentRepository(ownerId, { lots: createDemoSnapshot(ownerId).lots });
  demoRepositories.set(ownerId, repository);
  return repository;
}
