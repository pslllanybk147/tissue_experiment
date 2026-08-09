import type { CreateLotInput, TrialArmRole } from "@/lib/domain/models";
import { buildLowDoseRinseWaterSnapshot, buildNaDccRinseWaterSnapshot } from "@/lib/domain/rinse-water-planning";
import { MANUAL_VERSION_ID } from "@/lib/rounds/round-adapter";
import type { ResolvedManual } from "@/lib/manual/types";

/** ชุดทดลองตาม new_idea.md หัวข้อ 15 เปรียบเทียบ NaDCC กับ Haiter เป็นน้ำ rinse คลอรีนต่ำ
 *  หลังฟอกฆ่าเชื้อหลัก แม่แบบนี้ล็อกตายตัวเป็น 4 แขนง ไม่ใช่ตัวสร้างชุดทดลองทั่วไป
 *  T3 (NaDCC เดี่ยวแทน Haiter ทั้งขั้น) ยังไม่ทำในรุ่นนี้ตามที่ตกลงไว้ */
export const NADCC_VS_HAITER_TRIAL_TEMPLATE_ID = "nadcc-vs-haiter-v1";

export const NADCC_VS_HAITER_TRIAL_CAVEAT =
  "การเปรียบเทียบนี้เป็นการติดตามเชิงคุณภาพ (บันทึก + รูป) จากรอบเดียว ไม่ใช่การทดลองเชิงสถิติ " +
  "จำนวนกระปุกระดับนี้ไม่พอสรุปเป็นข้อพิสูจน์ ใช้เป็นจุดสังเกตเบื้องต้นเพื่อตัดสินใจรอบถัดไปเท่านั้น";

type TrialArmDef = {
  armRole: TrialArmRole;
  label: string;
  isBlank: boolean;
  rinseWater: "sterile-water" | "naclo" | "nadcc";
};

const arms: TrialArmDef[] = [
  { armRole: "control-a", label: "Control-A · พื้นฐานเดิม (Haiter + น้ำปลอดเชื้อ)", isBlank: false, rinseWater: "sterile-water" },
  { armRole: "control-b", label: "Control-B · กระปุกเปล่า ไม่มี explant", isBlank: true, rinseWater: "sterile-water" },
  { armRole: "t1", label: "T1 · Haiter + น้ำ rinse NaClO 300 ppm", isBlank: false, rinseWater: "naclo" },
  { armRole: "t2", label: "T2 · Haiter + น้ำ rinse NaDCC 300 ppm", isBlank: false, rinseWater: "nadcc" },
];

/** จำนวนแขนงของแม่แบบนี้ ใช้ตรวจความครบถ้วนตอนสร้างชุดทดลองโดยไม่ต้องนับ arms.length ตรง ๆ ทุกที่ */
export const NADCC_VS_HAITER_TRIAL_ARM_COUNT = arms.length;

function buildTrialId(): string {
  return `trial-${Date.now().toString(36)}`;
}

/** สร้าง CreateLotInput ของทั้ง 4 แขนง ใช้ trialId เดียวกันทุกใบเพื่อให้หน้าภาพรวมค้นกลุ่มได้
 *  volumePerContainerMl คือปริมาตรน้ำ rinse ต่อภาชนะของ T1/T2 ค่าเริ่มต้นอิงจากขนาดกระปุกเพาะทั่วไปในระบบ */
export function buildNaDccVsHaiterTrialLotInputs(
  manual: ResolvedManual,
  startedAt: string,
  volumePerContainerMl = 50,
): CreateLotInput[] {
  const trialId = buildTrialId();

  return arms.map((arm) => {
    const rinseWater =
      arm.rinseWater === "naclo"
        ? buildLowDoseRinseWaterSnapshot(volumePerContainerMl)
        : arm.rinseWater === "nadcc"
          ? buildNaDccRinseWaterSnapshot(volumePerContainerMl)
          : undefined;

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
      ...(rinseWater
        ? {
            sterilization: {
              profileId: "haiter-chemical-v1",
              profileVersion: "1.0.0",
              method: "haiter-chemical" as const,
              rinseWater,
            },
          }
        : {}),
    };
  });
}
