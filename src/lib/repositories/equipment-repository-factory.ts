import { createFirestoreEquipmentRepository } from "@/lib/firebase/firestore-equipment-repository";
import type { EquipmentRepository } from "./equipment-repository";
import { createMemoryEquipmentRepository } from "./memory-equipment-repository";

const demos = new Map<string, EquipmentRepository>();

export function getEquipmentRepository(ownerId: string, authenticated: boolean): EquipmentRepository {
  if (authenticated) return createFirestoreEquipmentRepository(ownerId);
  const existing = demos.get(ownerId);
  if (existing) return existing;
  const repository = createMemoryEquipmentRepository(ownerId);
  demos.set(ownerId, repository);
  return repository;
}
