import type { RinseWaterSnapshot } from "./models";

export const LOW_DOSE_RINSE_TARGET_PERCENT = 0.003;

const pressureSteamMinimums = [
  { maximumVolumeMl: 25, minutes: 20 },
  { maximumVolumeMl: 50, minutes: 25 },
  { maximumVolumeMl: 100, minutes: 28 },
  { maximumVolumeMl: 250, minutes: 31 },
  { maximumVolumeMl: 500, minutes: 35 },
  { maximumVolumeMl: 1000, minutes: 40 },
] as const;

export function minimumPressureSteamMinutes(volumeMl: number): number {
  if (!Number.isFinite(volumeMl) || volumeMl <= 0) {
    throw new Error("ปริมาตรต่อภาชนะต้องมากกว่า 0 mL");
  }
  const cycle = pressureSteamMinimums.find((item) => volumeMl <= item.maximumVolumeMl);
  if (!cycle) {
    throw new Error("ตารางนี้รองรับไม่เกิน 1,000 mL ต่อภาชนะ");
  }
  return cycle.minutes;
}

export function rinseWaterTotalMl(volumePerContainerMl: number): number {
  return volumePerContainerMl * 3;
}

export function buildLowDoseRinseWaterSnapshot(volumePerContainerMl: number): RinseWaterSnapshot {
  if (!Number.isFinite(volumePerContainerMl) || volumePerContainerMl <= 0) {
    throw new Error("ปริมาตรน้ำล้างต่อภาชนะต้องมากกว่า 0 mL");
  }
  return {
    method: "low-dose-hypochlorite",
    containerCount: 3,
    volumePerContainerMl,
    preparationVolumeMl: 1000,
    targetChlorinePercent: LOW_DOSE_RINSE_TARGET_PERCENT,
    minimumWaitMinutes: 60,
  };
}
