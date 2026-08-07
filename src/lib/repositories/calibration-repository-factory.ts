import { createFirestoreCalibrationRepository } from "@/lib/firebase/firestore-calibration-repository";
import type { CalibrationRepository } from "./calibration-repository";
import { createMemoryCalibrationRepository } from "./memory-calibration-repository";

const demos = new Map<string, CalibrationRepository>();

export function getCalibrationRepository(ownerId: string, authenticated: boolean): CalibrationRepository {
  if (authenticated) return createFirestoreCalibrationRepository(ownerId);
  const existing = demos.get(ownerId);
  if (existing) return existing;
  const repository = createMemoryCalibrationRepository(ownerId);
  demos.set(ownerId, repository);
  return repository;
}
