import type { EquipmentKit } from "@/lib/equipment/resolve-path";
import { demoStorageKey, readDemoState, writeDemoState } from "./demo-storage";
import type { EquipmentRepository } from "./equipment-repository";

// เก็บผ่าน demo storage เหมือน repository ตัวอื่นของโหมดสาธิต ไม่งั้นค่าจะหายทุกครั้งที่โหลดหน้าใหม่
// ซึ่งทำให้พฤติกรรมไม่เหมือนกับส่วนอื่นของระบบและทดสอบไม่ได้
export function createMemoryEquipmentRepository(ownerId: string): EquipmentRepository {
  const storageKey = demoStorageKey(ownerId, "equipment");
  let kit: EquipmentKit | null = readDemoState<EquipmentKit | null>(storageKey, null);

  return {
    async get() {
      return kit ? structuredClone(kit) : null;
    },
    async save(_owner, next) {
      kit = structuredClone(next);
      writeDemoState(storageKey, kit);
      return structuredClone(kit);
    },
  };
}
