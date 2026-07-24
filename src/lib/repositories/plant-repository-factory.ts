import { createFirestorePlantRepository } from "../firebase/firestore-plant-repository";
import { createMemoryPlantRepository } from "./memory-plant-repository";
import type { PlantRepository } from "./plant-repository";

const demos = new Map<string, PlantRepository>();
export function getPlantRepository(ownerId: string, authenticated: boolean): PlantRepository {
  if (authenticated) return createFirestorePlantRepository(ownerId);
  const existing = demos.get(ownerId); if (existing) return existing;
  const repository = createMemoryPlantRepository(ownerId); demos.set(ownerId, repository); return repository;
}
