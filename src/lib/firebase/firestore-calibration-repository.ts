import { doc, getDoc, setDoc } from "firebase/firestore";
import { calibrationKey, type CalibrationEntry } from "@/lib/domain/calibration";
import type { CalibrationRepository } from "@/lib/repositories/calibration-repository";
import { getFirebaseServices } from "./client";

// เก็บที่ users/{ownerId}/settings/calibration ซึ่ง security rules เดิมอนุญาตอยู่แล้ว
// แพตเทิร์นเดียวกับ settings/equipment จึงไม่ต้องแก้ rules และไม่ต้อง migrate
export function createFirestoreCalibrationRepository(ownerId: string): CalibrationRepository {
  void ownerId;
  const path = (owner: string) => `users/${owner}/settings/calibration`;

  return {
    async list(owner) {
      const services = getFirebaseServices();
      if (!services) return [];
      const snapshot = await getDoc(doc(services.firestore, path(owner)));
      if (!snapshot.exists()) return [];
      const data = snapshot.data() as { entries?: Record<string, CalibrationEntry> };
      return Object.values(data.entries ?? {});
    },
    async save(owner, entry) {
      const services = getFirebaseServices();
      if (!services) return entry;
      const reference = doc(services.firestore, path(owner));
      const snapshot = await getDoc(reference);
      const data = snapshot.exists() ? (snapshot.data() as { entries?: Record<string, CalibrationEntry> }) : {};
      const entries = { ...(data.entries ?? {}) };
      entries[calibrationKey(entry.slug, entry.stepId, entry.doseKey)] = entry;
      await setDoc(reference, { ownerId: owner, entries });
      return entry;
    },
  };
}
