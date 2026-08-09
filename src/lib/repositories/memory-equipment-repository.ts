import { normalizeEquipmentProfile, type EquipmentProfileV2 } from "@/lib/equipment/equipment-profile";
import type { EquipmentKit } from "@/lib/equipment/resolve-path";
import { demoStorageKey, readDemoState, writeDemoState } from "./demo-storage";
import type { EquipmentRepository } from "./equipment-repository";

// เก็บผ่าน demo storage เหมือน repository ตัวอื่นของโหมดสาธิต ไม่งั้นค่าจะหายทุกครั้งที่โหลดหน้าใหม่
// ซึ่งทำให้พฤติกรรมไม่เหมือนกับส่วนอื่นของระบบและทดสอบไม่ได้
export function createMemoryEquipmentRepository(ownerId: string): EquipmentRepository {
  const storageKey = demoStorageKey(ownerId, "equipment");
  let kit: EquipmentKit | EquipmentProfileV2 | null = readDemoState<EquipmentKit | EquipmentProfileV2 | null>(storageKey, null);

  return {
    async get() {
      return kit ? normalizeEquipmentProfile(kit) : null;
    },
    async save(_owner, next) {
      kit = normalizeEquipmentProfile(next);
      writeDemoState(storageKey, kit);
      return normalizeEquipmentProfile(kit);
    },
  };
}
