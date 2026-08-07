import { calibrationKey, type CalibrationEntry } from "@/lib/domain/calibration";
import { demoStorageKey, readDemoState, writeDemoState } from "./demo-storage";
import type { CalibrationRepository } from "./calibration-repository";

// เก็บผ่าน demo storage เหมือน repository ตัวอื่นของโหมดสาธิต ไม่งั้นค่าจะหายทุกครั้งที่โหลดหน้าใหม่
// ซึ่งเป็นข้อผิดพลาดเดียวกับที่ newplant_protocol.md ส่วนที่ 6 บันทึกไว้ว่าเคยเกิดกับชุดอุปกรณ์
export function createMemoryCalibrationRepository(ownerId: string): CalibrationRepository {
  const storageKey = demoStorageKey(ownerId, "calibration");
  let entries = readDemoState<Record<string, CalibrationEntry>>(storageKey, {});

  return {
    async list() {
      return Object.values(entries).map((entry) => structuredClone(entry));
    },
    async save(_owner, entry) {
      entries = { ...entries, [calibrationKey(entry.slug, entry.stepId, entry.doseKey)]: structuredClone(entry) };
      writeDemoState(storageKey, entries);
      return structuredClone(entry);
    },
  };
}
