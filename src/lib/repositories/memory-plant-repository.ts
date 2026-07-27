import type { PlantRecord } from "../domain/models";
import type { PlantInput, PlantRepository } from "./plant-repository";
import { demoStorageKey, readDemoState, writeDemoState } from "./demo-storage";

export function createMemoryPlantRepository(uid: string): PlantRepository {
  const storageKey = demoStorageKey(uid, "plants");
  const records = new Map<string, PlantRecord>(readDemoState<PlantRecord[]>(storageKey, []).map((item) => [item.id, item]));
  const persist = () => writeDemoState(storageKey, [...records.values()]);
  const guard = (ownerId: string) => { if (ownerId !== uid) throw new Error("Owner mismatch"); };
  const now = () => new Date().toISOString();
  return {
    async list(ownerId) { guard(ownerId); return structuredClone([...records.values()]); },
    async get(ownerId, plantId) { guard(ownerId); const item = records.get(plantId); return item ? structuredClone(item) : null; },
    async create(ownerId, input: PlantInput) {
      guard(ownerId); const timestamp = now(); const item: PlantRecord = { ...structuredClone(input), id: "plant-" + crypto.randomUUID(), ownerId: uid, createdAt: timestamp, updatedAt: timestamp };
      records.set(item.id, item); persist(); return structuredClone(item);
    },
    async update(ownerId, plantId, input) {
      guard(ownerId); const current = records.get(plantId); if (!current) throw new Error("Plant not found");
      const item = { ...structuredClone(input), id: plantId, ownerId: uid, createdAt: current.createdAt, updatedAt: now() };
      records.set(plantId, item); persist(); return structuredClone(item);
    },
  };
}
