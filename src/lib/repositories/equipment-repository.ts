import type { EquipmentProfileV2 } from "@/lib/equipment/equipment-profile";
import type { EquipmentKit } from "@/lib/equipment/resolve-path";

export interface EquipmentRepository {
  get(ownerId: string): Promise<EquipmentProfileV2 | null>;
  save(ownerId: string, kit: EquipmentKit | EquipmentProfileV2): Promise<EquipmentProfileV2>;
}
