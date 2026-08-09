import type { RinseWaterSnapshot, TrialArmRole } from "@/lib/domain/models";
import type { EquipmentProfileV2 } from "@/lib/equipment/equipment-profile";
import type { ReadinessStatus } from "@/lib/equipment/trial-readiness";

export type TrialArmReadiness = {
  armRole: TrialArmRole;
  title: string;
  status: ReadinessStatus;
  requiredResources: string[];
  blockers: string[];
  next: string;
};

export const NADCC_VS_HAITER_ARM_ROLES: TrialArmRole[] = ["control-a", "control-b", "t1", "t2", "t3"];

function hasPreparedRinse(snapshot: RinseWaterSnapshot | null | undefined): boolean {
  return snapshot?.status === "prepared"
    && Boolean(snapshot.productName?.trim())
    && Boolean(snapshot.batchOrLot?.trim())
    && typeof snapshot.actualChlorinePpm === "number"
    && snapshot.actualChlorinePpm > 0
    && typeof snapshot.stockVolumeMl === "number"
    && snapshot.stockVolumeMl > 0
    && typeof snapshot.finalVolumeMl === "number"
    && snapshot.finalVolumeMl > 0
    && Boolean(snapshot.preparedAt);
}

function hasSterileWater(profile: EquipmentProfileV2): boolean {
  return profile.water.sterile && Boolean(profile.water.sterilizationMethod);
}

function hasHaiter(profile: EquipmentProfileV2): boolean {
  return profile.chemicals.bleach.percentWw > 0;
}

function hasNaDcc(profile: EquipmentProfileV2): boolean {
  return profile.chemicals.nadcc.availableChlorinePercent > 0;
}

export function resolveTrialArmReadiness(profile: EquipmentProfileV2, armRole: TrialArmRole): TrialArmReadiness {
  const sterileWater = hasSterileWater(profile);
  const haiter = hasHaiter(profile);
  const nadcc = hasNaDcc(profile);

  if (armRole === "control-b") {
    return {
      armRole,
      title: "Control-B · กระปุกเปล่า",
      status: "ready",
      requiredResources: ["กระปุกเปล่า", "อาหาร batch เดียวกัน"],
      blockers: [],
      next: "เตรียมกระปุกเปล่าควบคุมจากอาหาร batch เดียวกัน",
    };
  }

  if (armRole === "control-a") {
    const blockers = [
      ...(!haiter ? ["ยังไม่มี Haiter สำหรับสารฟอกหลัก"] : []),
      ...(!sterileWater ? ["ยังไม่มีน้ำปลอดเชื้อสำหรับล้าง 3 รอบ"] : []),
    ];
    return {
      armRole,
      title: "Control-A · Haiter + น้ำปลอดเชื้อ",
      status: blockers.length === 0 ? "ready" : "blocked",
      requiredResources: ["Haiter", "น้ำปลอดเชื้อ"],
      blockers,
      next: blockers.length === 0 ? "ใช้เป็นแขนพื้นฐานและบันทึกค่าที่ทำจริง" : "เตรียมรายการที่ขาดก่อนเปิดชุดทดลอง 5 แขน",
    };
  }

  if (armRole === "t1" || armRole === "t2") {
    const rinse = armRole === "t1" ? profile.rinseWater.lowDoseHypochlorite : profile.rinseWater.nadcc;
    const rinseName = armRole === "t1" ? "NaClO 300 ppm" : "NaDCC 300 ppm";
    const blockers = [
      ...(!haiter ? ["ยังไม่มี Haiter สำหรับสารฟอกหลัก"] : []),
      ...(!hasPreparedRinse(rinse) ? [`ยังไม่ได้ยืนยันการเตรียมน้ำ rinse ${rinseName}`] : []),
    ];
    return {
      armRole,
      title: `${armRole.toUpperCase()} · Haiter + น้ำ rinse ${rinseName}`,
      status: blockers.length === 0 ? "experimental" : "blocked",
      requiredResources: ["Haiter", `น้ำ rinse ${rinseName} 3 ภาชนะ`],
      blockers,
      next: blockers.length === 0 ? "ยอมรับว่านี่เป็นวิธีทดลองและบันทึกค่า rinse จริง" : "กรอกและยืนยันบันทึกการเตรียมน้ำ rinse ในหน้าอุปกรณ์",
    };
  }

  const blockers = [
    ...(!nadcc ? ["ยังไม่มี NaDCC สำหรับการแช่หลัก"] : []),
    ...(!sterileWater ? ["ยังไม่มีน้ำปลอดเชื้อสำหรับล้างหลังแช่ 3 รอบ"] : []),
  ];
  return {
    armRole,
    title: "T3 · NaDCC แช่ 24–48 ชั่วโมง",
    status: blockers.length === 0 ? "experimental" : "blocked",
    requiredResources: ["NaDCC 300 ppm", "น้ำปลอดเชื้อ"],
    blockers,
    next: blockers.length === 0 ? "ทำหลัง T1/T2 และบันทึกเวลาแช่จริง" : "เตรียมรายการที่ขาดก่อนเปิด T3",
  };
}

export function resolveTrialArmReadinesses(profile: EquipmentProfileV2): TrialArmReadiness[] {
  return NADCC_VS_HAITER_ARM_ROLES.map((armRole) => resolveTrialArmReadiness(profile, armRole));
}
