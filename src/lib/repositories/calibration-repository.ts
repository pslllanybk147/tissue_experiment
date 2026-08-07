import type { CalibrationEntry } from "@/lib/domain/calibration";

export interface CalibrationRepository {
  list(ownerId: string): Promise<CalibrationEntry[]>;
  save(ownerId: string, entry: CalibrationEntry): Promise<CalibrationEntry>;
}
