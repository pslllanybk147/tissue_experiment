import { createMemoryStepRunRepository } from "./memory-step-run-repository";
import { createFirestoreStepRunRepository } from "../firebase/firestore-step-run-repository";
import type { StepRunRepository } from "./step-run-repository";

const demos = new Map<string, StepRunRepository>();
export function getStepRunRepository(ownerId: string, authenticated: boolean): StepRunRepository {
  if (authenticated) return createFirestoreStepRunRepository(ownerId);
  const existing = demos.get(ownerId); if (existing) return existing;
  const repository = createMemoryStepRunRepository(ownerId); demos.set(ownerId, repository); return repository;
}
