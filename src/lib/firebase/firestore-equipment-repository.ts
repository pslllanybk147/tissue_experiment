import { doc, getDoc, setDoc } from "firebase/firestore";
import type { EquipmentKit } from "@/lib/equipment/resolve-path";
import type { EquipmentRepository } from "@/lib/repositories/equipment-repository";
import { getFirebaseServices } from "./client";

// เก็บที่ users/{ownerId}/settings/equipment ซึ่ง security rules เดิมอนุญาตอยู่แล้ว
export function createFirestoreEquipmentRepository(ownerId: string): EquipmentRepository {
  void ownerId;
  return {
    async get(owner) {
      const services = getFirebaseServices();
      if (!services) return null;
      const snapshot = await getDoc(doc(services.firestore, `users/${owner}/settings/equipment`));
      return snapshot.exists() ? (snapshot.data() as EquipmentKit) : null;
    },
    async save(owner, kit) {
      const services = getFirebaseServices();
      if (!services) return kit;
      await setDoc(doc(services.firestore, `users/${owner}/settings/equipment`), { ...kit, ownerId: owner });
      return kit;
    },
  };
}
