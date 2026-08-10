import { DataList } from "@/components/common/data-list";
import { StatusNotice } from "@/components/common/status-notice";
import type { EquipmentProfileV2 } from "@/lib/equipment/equipment-profile";
import type { RoundSetupSelection } from "@/lib/rounds/round-setup";

export type PreparationSummaryValue = {
  manualName: string;
  profile: EquipmentProfileV2;
  selection: RoundSetupSelection;
};

const methodLabels: Record<string, string> = {
  "pressure-sterilization": "หม้อนึ่งแรงดัน",
  "haiter-chemical": "Haiter / NaOCl",
  "nadcc-chemical": "NaDCC",
  "nadcc-soak": "NaDCC แช่ชิ้นพืช",
  "commercial-sterile": "น้ำปลอดเชื้อ",
  nadcc: "NaDCC rinse 300 ppm",
  "low-dose-hypochlorite": "NaOCl / Haiter rinse 300 ppm",
};

function label(value: string | null): string {
  return value ? methodLabels[value] ?? value : "ยังไม่เลือก";
}

export function PreparationSummary({ value }: { value: PreparationSummaryValue }) {
  return (
    <section className="cl-preparation-summary">
      <h2>สรุปสำหรับตรวจทาน</h2>
      <DataList
        density="compact"
        items={[
          { term: "คู่มือ", detail: value.manualName },
          { term: "อาหารและกระปุก", detail: label(value.selection.mediumMethod) },
          { term: "ฟอกผิว", detail: label(value.selection.surfaceMethod) },
          { term: "น้ำล้าง", detail: label(value.selection.rinseMethod) },
          { term: "NaDCC ตามฉลาก", detail: `${value.profile.chemicals.nadcc.availableChlorinePercent}%` },
          { term: "Haiter ตามฉลาก", detail: `${value.profile.chemicals.bleach.percentWw}% w/w` },
        ]}
      />
      <StatusNotice tone="info" title="ค่าที่วางแผน">
        ยังไม่ใช่หลักฐานว่าเตรียมจริง ระบบจะล็อก snapshot เมื่อยืนยันสร้างรอบ
      </StatusNotice>
    </section>
  );
}
