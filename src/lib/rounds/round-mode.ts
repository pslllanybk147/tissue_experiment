import type { LotSterilizationSnapshot, RoundMode } from "@/lib/domain/models";
import type { ResolvedStep } from "@/lib/manual/types";

/** ช่องบันทึกที่ยังบังคับกรอกในโหมดง่าย เพราะไม่ใช่ "ข้อมูลไว้เทียบรอบหน้า"
 *  แต่เป็นตัวเลขที่ถ้าไม่ได้ตั้งใจอ่านก่อนลงมือ ชิ้นพืชรอบนี้ตายหรือคนทำเจอสารเข้มเกินไป
 *
 *  - active-chlorine-percent / rinse-actual-ppm: ความเข้มข้นที่ใช้จริง เข้มไปเนื้อเยื่อตาย อ่อนไปเชื้อขึ้นทั้งกระปุก
 *  - sterilize-minutes / soak-hours: เวลาแช่ ยาวไปเนื้อเยื่อตาย เป็นค่าที่ย้อนกลับไม่ได้เมื่อเลยไปแล้ว
 *  - sterile-rinses: จำนวนรอบล้าง ล้างไม่ครบแปลว่าคลอรีนติดไปกับชิ้นพืชลงอาหาร
 *
 *  ที่ไม่อยู่ในชุดนี้โดยตั้งใจคือ medium-ph กับ medium-volume เพราะพลาดแล้วเสียแค่รอบนั้น
 *  ไม่เป็นอันตราย และเป็นสองช่องที่บังคับให้ต้องมี pH meter ซึ่งเป็นเหตุผลหลักที่คนทำไม่ไหว */
export const SIMPLE_MODE_REQUIRED_MEASUREMENT_IDS = new Set([
  "active-chlorine-percent",
  "rinse-actual-ppm",
  "sterilize-minutes",
  "soak-hours",
  "sterile-rinses",
]);

/** ค่าที่โหมดง่ายตั้งให้ตอนเข้าหน้าตั้งค่ารอบ คือเส้นทางเดียวกับคลิปสาธิตกุหลาบอย่างง่าย
 *  ของทุกอย่างหาซื้อได้ในร้านทั่วไปและไม่ต้องใช้หม้อนึ่งหรือน้ำปลอดเชื้อบรรจุขวด
 *  ผู้ใช้ยังเปลี่ยนได้ทุกหมวด นี่เป็นค่าตั้งต้น ไม่ใช่ข้อจำกัด */
export const SIMPLE_MODE_DEFAULT_METHODS = {
  mediumMethod: "haiter-chemical",
  surfaceMethod: "haiter-chemical",
  rinseMethod: "low-dose-hypochlorite",
} as const;

export function roundModeOf(snapshot?: LotSterilizationSnapshot): RoundMode {
  return snapshot?.mode === "simple" ? "simple" : "full";
}

/** ลดสิ่งที่ "บังคับ" ลงเหลือเท่าที่กันพลาดจริง โดยไม่แตะเนื้อหาที่สั่งให้ทำ
 *
 *  ตั้งใจไม่ลบอะไรออกจากขั้นเลย ทั้ง actions, executionInstructions, passCriteria,
 *  stopConditions และ safetyNotes ยังอยู่ครบเหมือนโหมดเต็ม เพราะโหมดง่ายคือ
 *  "ไม่ต้องกรอกงานวิจัย" ไม่ใช่ "ทำน้อยขั้นกว่า" ถ้าลบคำสั่งออกด้วย คนทำจะขาดข้อมูล
 *  ตรงจุดที่อันตรายที่สุดโดยไม่รู้ตัว
 *
 *  ช่องบันทึกไม่ได้ถูกลบทิ้ง แค่เปลี่ยนเป็นไม่บังคับ คนที่อยากจดยังจดได้และค่าที่จดไว้
 *  ยังไปโผล่ในตารางบันทึกทั้งรอบเหมือนเดิม */
export function applySimpleMode(steps: ResolvedStep[]): ResolvedStep[] {
  return steps.map((step) => ({
    ...step,
    measurements: step.measurements.map((measurement) => ({
      ...measurement,
      required: measurement.required && SIMPLE_MODE_REQUIRED_MEASUREMENT_IDS.has(measurement.id),
    })),
    // การบังคับแนบรูปเป็นงานเก็บหลักฐานสำหรับเทียบรอบ ไม่ใช่สิ่งที่ทำให้รอบนี้สำเร็จ
    evidenceRequirement: "none" as const,
  }));
}

export function applyRoundMode(steps: ResolvedStep[], mode: RoundMode): ResolvedStep[] {
  return mode === "simple" ? applySimpleMode(steps) : steps;
}
