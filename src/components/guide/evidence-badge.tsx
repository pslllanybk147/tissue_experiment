import type { EvidenceLevel } from "@/lib/manual/types";

export const evidenceLabel: Record<EvidenceLevel, string> = {
  "species-direct": "ตรงพันธุ์",
  adapted: "ประยุกต์",
  unsupported: "ยังไม่มีงานรองรับ",
  "botanical-fact": "ข้อมูลจากตำรา",
};

export function EvidenceBadge({ level }: { level: EvidenceLevel }) {
  return <span className="cl-evidence-badge" data-level={level}>ระดับหลักฐาน {evidenceLabel[level]}</span>;
}
