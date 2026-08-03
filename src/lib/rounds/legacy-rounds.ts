import type { ExperimentLot } from "@/lib/domain/models";
import { resolveBySlug } from "@/lib/manual/registry";

/**
 * รอบที่สร้างก่อนระบบคู่มือใหม่เก็บ protocolId เป็นรหัส protocol แบบเดิม
 * ซึ่ง resolve เป็น slug ของคู่มือไม่ได้ ถ้ากรองทิ้งเฉย ๆ ผู้ใช้จะเข้าถึงข้อมูลเก่าไม่ได้เลย
 * จึงต้องแยกออกมาแสดงต่างหาก ไม่ใช่ซ่อน
 */
export function partitionLots(lots: ExperimentLot[]): { current: ExperimentLot[]; legacy: ExperimentLot[] } {
  const current: ExperimentLot[] = [];
  const legacy: ExperimentLot[] = [];
  for (const lot of lots) {
    if (resolveBySlug(lot.protocolId)) current.push(lot);
    else legacy.push(lot);
  }
  return { current, legacy };
}
