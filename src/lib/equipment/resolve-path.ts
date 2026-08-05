import type { EvidenceLevel } from "@/lib/manual/types";
import { capabilityIds, capabilityMethods, type CapabilityId, type CapabilityMethod, type EquipmentId } from "./capabilities";

export type EquipmentKit = {
  owned: EquipmentId[];
  scaleMinimumMg: number;
  pipetteMinimumMl: number;
  msLabelRateGPerL: number;
};

export type ResolvedCapability = {
  capability: CapabilityId;
  /** วิธีที่ดีที่สุดซึ่งทำได้ด้วยของที่มี หรือ null เมื่อยังทำไม่ได้เลย */
  method: CapabilityMethod | null;
  /** วิธีอื่นที่มีอยู่ในระบบ ใช้กางให้ผู้ใช้เลือกเมื่อยังทำไม่ได้ */
  alternatives: CapabilityMethod[];
};

export type ResolvedPath = {
  capabilities: ResolvedCapability[];
  /** ระดับของเส้นทางทั้งเส้น เท่ากับจุดที่อ่อนที่สุด และเป็น null เมื่อยังมีจุดที่ทำไม่ได้ */
  overallLevel: EvidenceLevel | null;
  blocked: CapabilityId[];
};

// botanical-fact อยู่อันดับสูงสุดเพราะเป็นคำนิยาม ไม่ใช่ข้ออ้างเชิงวิธีการ
// เส้นทางอุปกรณ์ไม่ควรมีค่านี้อยู่แล้ว และถ้ามีก็ไม่ควรไปฉุดวิธีอื่น
const rank: Record<EvidenceLevel, number> = { "botanical-fact": 4, "species-direct": 3, adapted: 2, unsupported: 1 };

export const defaultKit: EquipmentKit = {
  owned: [],
  scaleMinimumMg: 10,
  pipetteMinimumMl: 0.2,
  msLabelRateGPerL: 4.43,
};

export function resolvePath(kit: EquipmentKit): ResolvedPath {
  const owned = new Set(kit.owned);

  const capabilities: ResolvedCapability[] = capabilityIds.map((capability) => {
    const all = capabilityMethods.filter((method) => method.capability === capability);
    const usable = all.filter((method) => method.requires.every((item) => owned.has(item)));
    // เลือกวิธีที่หลักฐานดีที่สุดจากของที่มีจริง
    const method = usable.slice().sort((a, b) => rank[b.evidence.level] - rank[a.evidence.level])[0] ?? null;
    return { capability, method, alternatives: all.filter((item) => item.id !== method?.id) };
  });

  const blocked = capabilities.filter((item) => item.method === null).map((item) => item.capability);

  // ระดับรวมเท่ากับจุดที่อ่อนที่สุด ไม่ใช่จุดที่แข็งที่สุด และยังสรุปไม่ได้ถ้ามีจุดที่ทำไม่ได้เลย
  const overallLevel = blocked.length > 0
    ? null
    : capabilities.reduce<EvidenceLevel>((weakest, item) => {
      const level = item.method!.evidence.level;
      return rank[level] < rank[weakest] ? level : weakest;
    }, "species-direct");

  return { capabilities, overallLevel, blocked };
}
