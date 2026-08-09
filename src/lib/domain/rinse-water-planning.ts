import type { RinseWaterSnapshot } from "./models";

/** 0.03% ไม่ใช่ 0.003% เดิมค่านี้ผิดหลักสิบเท่าและไม่เคยมีจุดใช้งานจริงมาก่อน (dead code)
 *  แก้ให้ตรงกับ 300 ppm available chlorine ที่ new_idea.md หัวข้อ 8, 12, 14 คำนวณและยืนยันไว้
 *  ตรงกับ NaClO 0.03% ของงาน Lilium ที่อ้างถึง และตรงกับ NaDCC 300 ppm ของ Parkinson et al. (1996)
 *  ซึ่งเป็นตัวเลขเดียวกับ bracket ของ sterilize.dose.nadcc ใน violin-variegated.ts (150-450 ppm รอบจุดนี้) */
export const CHLORINATED_RINSE_TARGET_PERCENT = 0.03;

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

function assertVolume(volumePerContainerMl: number) {
  if (!Number.isFinite(volumePerContainerMl) || volumePerContainerMl <= 0) {
    throw new Error("ปริมาตรน้ำล้างต่อภาชนะต้องมากกว่า 0 mL");
  }
}

export function buildLowDoseRinseWaterSnapshot(volumePerContainerMl: number): RinseWaterSnapshot {
  assertVolume(volumePerContainerMl);
  return {
    method: "low-dose-hypochlorite",
    status: "planned",
    containerCount: 3,
    volumePerContainerMl,
    preparationVolumeMl: 1000,
    targetChlorinePercent: CHLORINATED_RINSE_TARGET_PERCENT,
    minimumWaitMinutes: 60,
  };
}

/** เจือจาก NaDCC stock แทน NaClO เป็นน้ำ rinse ความเข้มข้นออกฤทธิ์เท่ากันที่ 300 ppm
 *  ตามหัวข้อ 8 และ 12 ของ new_idea.md วิธีเตรียมสต็อกและอัตราเจือจางเป็นเนื้อหาคู่มือ
 *  (ดู substances.ts รายการ nadcc) ฟังก์ชันนี้คืนแค่ค่าเป้าหมายที่ใช้ตัดสินใจแขนงทดลอง */
export function buildNaDccRinseWaterSnapshot(volumePerContainerMl: number): RinseWaterSnapshot {
  assertVolume(volumePerContainerMl);
  return {
    method: "nadcc",
    status: "planned",
    containerCount: 3,
    volumePerContainerMl,
    preparationVolumeMl: 1000,
    targetChlorinePercent: CHLORINATED_RINSE_TARGET_PERCENT,
    minimumWaitMinutes: 60,
  };
}
