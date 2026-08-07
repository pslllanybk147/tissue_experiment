/** ค่าที่ผู้ใช้ทดสอบได้เองจากขั้นทดสอบช่วง
 *
 *  ค่านี้ไม่เปลี่ยนระดับหลักฐานของขั้นนั้น เพราะการทดลองของผู้ใช้คนเดียว
 *  ไม่ใช่งานที่ผ่านการทบทวน ระบบแค่จำสิ่งที่ผู้ใช้พบ ไม่ได้เปลี่ยนสิ่งที่ระบบอ้าง */
export type CalibrationEntry = {
  slug: string;
  stepId: string;
  doseKey: string;
  value: number;
  unit: string;
  jarsPerArm: number;
  usable: number;
  lotId: string;
  decidedAt: string;
};

export function calibrationKey(slug: string, stepId: string, doseKey: string): string {
  return `${slug}:${stepId}:${doseKey}`;
}
