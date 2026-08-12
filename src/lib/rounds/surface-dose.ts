import type { ResolvedStep } from "@/lib/manual/types";

/** ระบบเขียนจุดตั้งต้นของความเข้มข้นสารฟอกไว้ในเนื้อความอยู่แล้ว (เช่น "คลอรีนออกฤทธิ์จุดตั้งต้น 1.0%")
 *  แต่ช่อง "เป้าหมาย ppm" ของฟอร์มยืนยันการเตรียมสารกลับเปิดมาว่าง ทำให้เครื่องคำนวณขึ้นว่า
 *  "ยังคำนวณไม่ได้" ขณะที่คำสั่งข้างล่างสั่งว่า "ใช้ปริมาณที่ระบบแสดงจริง ห้ามกะเอง" — เป็นทางตัน
 *
 *  ฟังก์ชันนี้ดึงตัวเลขที่คู่มือระบุไว้เองมาเติมให้ ไม่ได้สร้างค่าทางวิทยาศาสตร์ขึ้นใหม่
 *  ถ้าคู่มือไม่ได้ระบุไว้ก็คืน undefined แล้วปล่อยให้ผู้ใช้กรอกเอง */

const PERCENT = String.raw`(\d+(?:\.\d+)?)\s*(?:%|เปอร์เซ็นต์)`;

/** "จุดตั้งต้น 1.0%" คือค่าที่คู่มือชี้ให้เริ่ม จึงมาก่อนช่วงกว้างเสมอ */
const startingPointPattern = new RegExp(String.raw`จุดตั้งต้น\s*${PERCENT}`);
/** "คลอรีนออกฤทธิ์ 0.5 ถึง 1.0 เปอร์เซ็นต์" — เริ่มจากปลายต่ำเพราะเสียหายกับเนื้อเยื่อน้อยกว่า */
const rangePattern = new RegExp(String.raw`คลอรีนออกฤทธิ์\s*(\d+(?:\.\d+)?)\s*ถึง\s*\d+(?:\.\d+)?\s*(?:%|เปอร์เซ็นต์)`);

function firstMatch(sources: string[], pattern: RegExp): number | undefined {
  for (const source of sources) {
    const match = source.match(pattern);
    if (match) {
      const value = Number(match[1]);
      if (Number.isFinite(value) && value > 0) return value;
    }
  }
  return undefined;
}

/** คืนความเข้มข้นตั้งต้นของสารฟอกผิวเป็น ppm ตามที่คู่มือของขั้นนั้นเขียนไว้ */
export function surfaceStartingPpm(step: ResolvedStep): number | undefined {
  if (step.id !== "sterilize") return undefined;
  const sources = [
    ...(step.executionInstructions ?? []).flatMap((instruction) => [instruction.quantity ?? "", instruction.action]),
    ...step.actions,
  ].filter(Boolean);

  const percent = firstMatch(sources, startingPointPattern) ?? firstMatch(sources, rangePattern);
  return percent === undefined ? undefined : Math.round(percent * 10_000);
}
