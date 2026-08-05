import type { EvidenceLevel } from "@/lib/manual/types";

export const evidenceLabel: Record<EvidenceLevel, string> = {
  "species-direct": "ตรงพันธุ์",
  adapted: "ประยุกต์",
  unsupported: "ยังไม่มีงานรองรับ",
  "botanical-fact": "ข้อมูลจากตำรา",
};

const evidenceClass: Record<EvidenceLevel, string> = {
  "species-direct": "pl-chip pl-chip-direct",
  adapted: "pl-chip pl-chip-adapted",
  unsupported: "pl-chip pl-chip-unsupported",
  "botanical-fact": "pl-chip pl-chip-fact",
};

export function EvidenceBadge({ level }: { level: EvidenceLevel }) {
  return <span className={evidenceClass[level]}>ระดับหลักฐาน {evidenceLabel[level]}</span>;
}
