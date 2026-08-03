import type { EquipmentKit } from "@/lib/equipment/resolve-path";

export interface EquipmentRepository {
  get(ownerId: string): Promise<EquipmentKit | null>;
  save(ownerId: string, kit: EquipmentKit): Promise<EquipmentKit>;
}
