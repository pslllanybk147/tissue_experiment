import { calibrationKey, type CalibrationEntry } from "@/lib/domain/calibration";
import type { CalibrationRepository } from "./calibration-repository";

export function createMemoryCalibrationRepository(): CalibrationRepository {
  const byOwner = new Map<string, Map<string, CalibrationEntry>>();

  return {
    async list(ownerId) {
      return [...(byOwner.get(ownerId)?.values() ?? [])];
    },
    async save(ownerId, entry) {
      const existing = byOwner.get(ownerId) ?? new Map<string, CalibrationEntry>();
      existing.set(calibrationKey(entry.slug, entry.stepId, entry.doseKey), entry);
      byOwner.set(ownerId, existing);
      return entry;
    },
  };
}
