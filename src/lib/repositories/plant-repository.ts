import type { PlantRecord } from "../domain/models";

export type PlantInput = Omit<PlantRecord, "id" | "ownerId" | "createdAt" | "updatedAt">;

export interface PlantRepository {
  list(ownerId: string): Promise<PlantRecord[]>;
  get(ownerId: string, plantId: string): Promise<PlantRecord | null>;
  create(ownerId: string, input: PlantInput): Promise<PlantRecord>;
  update(ownerId: string, plantId: string, input: PlantInput): Promise<PlantRecord>;
}
