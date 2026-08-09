import type { CreateLotInput, LotSterilizationSnapshot, TrialArmRole } from "@/lib/domain/models";
import {
  CHLORINATED_RINSE_TARGET_PERCENT,
  buildLowDoseRinseWaterSnapshot,
  buildNaDccRinseWaterSnapshot,
} from "@/lib/domain/rinse-water-planning";
import { MANUAL_VERSION_ID } from "@/lib/rounds/round-adapter";
import type { ResolvedManual } from "@/lib/manual/types";

/** ชุดทดลองตาม new_idea.md หัวข้อ 15 เปรียบเทียบ NaDCC กับ Haiter เป็นน้ำ rinse คลอรีนต่ำ
 *  หลังฟอกฆ่าเชื้อหลัก บวก T3 ที่ตัด Haiter ออกทั้งขั้น แม่แบบนี้ล็อกตายตัวเป็น 5 แขนง
 *  ไม่ใช่ตัวสร้างชุดทดลองทั่วไป */
export const NADCC_VS_HAITER_TRIAL_TEMPLATE_ID = "nadcc-vs-haiter-v1";

export const NADCC_VS_HAITER_TRIAL_CAVEAT =
  "การเปรียบเทียบนี้เป็นการติดตามเชิงคุณภาพ (บันทึก + รูป) จากรอบเดียว ไม่ใช่การทดลองเชิงสถิติ " +
  "จำนวนกระปุกระดับนี้ไม่พอสรุปเป็นข้อพิสูจน์ ใช้เป็นจุดสังเกตเบื้องต้นเพื่อตัดสินใจรอบถัดไปเท่านั้น";

/** T3 เสี่ยงกว่าแขนงอื่นเพราะตัดขั้นฟอกด้วย Haiter ออกทั้งขั้น ควรทำหลัง T1/T2 ให้ผลที่เข้าใจแล้ว
 *  ตามที่ new_idea.md หัวข้อ 15 แนะนำไว้ ข้อความนี้แสดงเฉพาะตอนดูรายละเอียดแขนง T3 */
export const T3_RISK_NOTE =
  "T3 เสี่ยงกว่าแขนงอื่นเพราะตัดขั้นฟอกด้วย Haiter ออกทั้งขั้น แนะนำให้เริ่มหลังจาก T1/T2 ให้ผลที่เข้าใจแล้ว " +
  "ไม่ใช่แขนงแรกที่ควรลอง";

type SterilizationOverride = "sterile-water" | "naclo-rinse" | "nadcc-rinse" | "nadcc-soak";

type TrialArmDef = {
  armRole: TrialArmRole;
  label: string;
  isBlank: boolean;
  sterilizationOverride: SterilizationOverride;
};

const arms: TrialArmDef[] = [
  { armRole: "control-a", label: "Control-A · พื้นฐานเดิม (Haiter + น้ำปลอดเชื้อ)", isBlank: false, sterilizationOverride: "sterile-water" },
  { armRole: "control-b", label: "Control-B · กระปุกเปล่า ไม่มี explant", isBlank: true, sterilizationOverride: "sterile-water" },
  { armRole: "t1", label: "T1 · Haiter + น้ำ rinse NaClO 300 ppm", isBlank: false, sterilizationOverride: "naclo-rinse" },
  { armRole: "t2", label: "T2 · Haiter + น้ำ rinse NaDCC 300 ppm", isBlank: false, sterilizationOverride: "nadcc-rinse" },
  { armRole: "t3", label: "T3 · NaDCC เดี่ยว 300 ppm นาน 24-48 ชม. แทน Haiter ทั้งขั้น", isBlank: false, sterilizationOverride: "nadcc-soak" },
];

/** จำนวนแขนงของแม่แบบนี้ ใช้ตรวจความครบถ้วนตอนสร้างชุดทดลองโดยไม่ต้องนับ arms.length ตรง ๆ ทุกที่ */
export const NADCC_VS_HAITER_TRIAL_ARM_COUNT = arms.length;

function buildTrialId(): string {
  return `trial-${Date.now().toString(36)}`;
}

function buildSterilization(
  override: SterilizationOverride,
  volumePerContainerMl: number,
): LotSterilizationSnapshot | undefined {
  if (override === "sterile-water") return undefined;

  if (override === "naclo-rinse") {
    return {
      profileId: "haiter-chemical-v1",
      profileVersion: "1.0.0",
      method: "haiter-chemical",
      rinseWater: buildLowDoseRinseWaterSnapshot(volumePerContainerMl),
    };
  }

  if (override === "nadcc-rinse") {
    return {
      profileId: "haiter-chemical-v1",
      profileVersion: "1.0.0",
      method: "haiter-chemical",
      rinseWater: buildNaDccRinseWaterSnapshot(volumePerContainerMl),
    };
  }

  // nadcc-soak (T3): แทนขั้น Haiter ทั้งขั้น ไม่ใช่ rinse เสริมหลัง Haiter จึงไม่มี rinseWater
  // ระยะเวลาแช่ 24-48 ชม. เป็นข้อความในคู่มือ/แบนเนอร์ ไม่ใช่ตัวเลขในโครงสร้างนี้ เพราะไม่มีช่องเก็บระยะเวลา
  return {
    profileId: "nadcc-soak-v1",
    profileVersion: "1.0.0",
    method: "nadcc-soak",
    targetChlorinePercent: CHLORINATED_RINSE_TARGET_PERCENT,
  };
}

/** สร้าง CreateLotInput ของทุกแขนง ใช้ trialId เดียวกันทุกใบเพื่อให้หน้าภาพรวมค้นกลุ่มได้
 *  volumePerContainerMl คือปริมาตรน้ำ rinse ต่อภาชนะของ T1/T2 ค่าเริ่มต้นอิงจากขนาดกระปุกเพาะทั่วไปในระบบ */
export function buildNaDccVsHaiterTrialLotInputs(
  manual: ResolvedManual,
  startedAt: string,
  volumePerContainerMl = 50,
): CreateLotInput[] {
  const trialId = buildTrialId();

  return arms.map((arm) => {
    const sterilization = buildSterilization(arm.sterilizationOverride, volumePerContainerMl);

    return {
      id: `${trialId}-${arm.armRole}`,
      plant: manual.commonName,
      protocolId: manual.slug,
      protocolTitle: manual.scientificName,
      protocolVersionId: MANUAL_VERSION_ID,
      stage: manual.steps[0]?.id ?? "",
      status: "Healthy",
      startedAt,
      workflowVersion: "v2",
      trialId,
      armRole: arm.armRole,
      armLabel: arm.label,
      isBlank: arm.isBlank,
      templateId: NADCC_VS_HAITER_TRIAL_TEMPLATE_ID,
      ...(sterilization ? { sterilization } : {}),
    };
  });
}
