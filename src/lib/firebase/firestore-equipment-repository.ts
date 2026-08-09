import { doc, getDoc, setDoc } from "firebase/firestore";
import { normalizeEquipmentProfile, type EquipmentProfileV2 } from "@/lib/equipment/equipment-profile";
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
      return snapshot.exists() ? normalizeEquipmentProfile(snapshot.data() as EquipmentKit | EquipmentProfileV2) : null;
    },
    async save(owner, kit) {
      const services = getFirebaseServices();
      const profile = normalizeEquipmentProfile(kit);
      if (!services) return profile;
      await setDoc(doc(services.firestore, `users/${owner}/settings/equipment`), { ...profile, ownerId: owner });
      return profile;
    },
  };
}
