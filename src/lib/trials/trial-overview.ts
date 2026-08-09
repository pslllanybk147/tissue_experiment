import type { ExperimentLot, Observation, RinseWaterMethod, TrialArmRole } from "@/lib/domain/models";

export type TrialArmSummary = {
  lotId: string;
  armRole: TrialArmRole | null;
  armLabel: string;
  isBlank: boolean;
  stage: string;
  status: ExperimentLot["status"];
  /** อธิบายวิธีฆ่าเชื้อ/rinse ของแขนงนี้ทั้งหมด ไม่ใช่แค่ rinse เพราะ T3 เปลี่ยนวิธีฆ่าเชื้อหลักเอง ไม่ใช่แค่เสริม rinse */
  methodLabel: string;
  latestObservationNote: string | null;
  latestObservationAt: string | null;
};

const armOrder: Record<TrialArmRole, number> = { "control-a": 0, "control-b": 1, t1: 2, t2: 3, t3: 4 };

const rinseMethodLabel: Record<RinseWaterMethod, string> = {
  "low-dose-hypochlorite": "Haiter + น้ำ rinse NaClO 300 ppm",
  nadcc: "Haiter + น้ำ rinse NaDCC 300 ppm",
  "commercial-sterile": "น้ำปลอดเชื้อสำเร็จรูป",
  "pressure-steam": "น้ำนึ่งฆ่าเชื้อ",
};

/** lot ที่ไม่ได้ตั้งค่าฆ่าเชื้อพิเศษ (Control-A/B) ใช้เส้นทางเดิมของระบบ คือ Haiter + น้ำปลอดเชื้อธรรมดา
 *  T3 เปลี่ยนวิธีฆ่าเชื้อหลักเป็น NaDCC เดี่ยว ไม่ใช่แค่เสริม rinse จึงต้องเช็ค method ก่อนเช็ค rinseWater */
function describeMethod(lot: ExperimentLot): string {
  if (lot.sterilization?.method === "nadcc-soak") {
    return "NaDCC เดี่ยว 300 ppm นาน 24-48 ชม. (แทน Haiter ทั้งขั้น)";
  }
  const rinseMethod = lot.sterilization?.rinseWater?.method;
  if (!rinseMethod) return "Haiter + น้ำปลอดเชื้อธรรมดา (ค่าเริ่มต้นของระบบ)";
  return rinseMethodLabel[rinseMethod];
}

/** สร้างมุมมองเปรียบเทียบแขนงของชุดทดลองจาก lot + ประวัติสังเกตของแต่ละ lot
 *  ไม่คำนวณสถิติใด ๆ เอง แค่เรียงและดึงค่าล่าสุดมาแสดงเทียบกัน ตามที่ตกลงไว้ว่าไม่สร้างสถิติใหม่ */
export function buildTrialOverview(
  lots: ExperimentLot[],
  observationsByLotId: Map<string, Observation[]>,
): TrialArmSummary[] {
  return [...lots]
    .sort((a, b) => (armOrder[a.armRole ?? "t3"] ?? 99) - (armOrder[b.armRole ?? "t3"] ?? 99))
    .map((lot) => {
      // listObservations ของ repository เรียงจากใหม่ไปเก่าอยู่แล้ว รายการแรกจึงเป็นล่าสุด
      const latest = observationsByLotId.get(lot.id)?.[0] ?? null;
      return {
        lotId: lot.id,
        armRole: lot.armRole ?? null,
        armLabel: lot.armLabel ?? lot.plant,
        isBlank: Boolean(lot.isBlank),
        stage: lot.stage,
        status: lot.status,
        methodLabel: describeMethod(lot),
        latestObservationNote: latest?.note || null,
        latestObservationAt: latest?.observedAt ?? null,
      };
    });
}
