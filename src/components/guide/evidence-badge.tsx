import type { EvidenceLevel } from "@/lib/manual/types";

export const evidenceLabel: Record<EvidenceLevel, string> = {
  "species-direct": "ตรงพันธุ์",
  adapted: "ประยุกต์",
  unsupported: "ยังไม่มีงานรองรับ",
};

const evidenceClass: Record<EvidenceLevel, string> = {
  "species-direct": "pl-chip pl-chip-direct",
  adapted: "pl-chip pl-chip-adapted",
  unsupported: "pl-chip pl-chip-unsupported",
};

export function EvidenceBadge({ level }: { level: EvidenceLevel }) {
  return <span className={evidenceClass[level]}>ระดับหลักฐาน {evidenceLabel[level]}</span>;
}
