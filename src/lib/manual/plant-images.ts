import { existsSync } from "node:fs";
import path from "node:path";

/** ภาพต้นไม้ที่การ์ดเลือกต้นใช้ เป็นไฟล์ static ธรรมดาที่วางไว้ใน public/plants/<slug>.png เอง
 *  (สร้างจาก AI ให้พื้นหลังโปร่งใส ไม่มีปัญหาลิขสิทธิ์แบบภาพถ่ายจริง จึงไม่ต้องมี credit/license
 *  แบบ FormImage) เช็คว่าไฟล์มีอยู่จริงตอน build/request แทนการเก็บทะเบียนแยก เพื่อให้วางไฟล์เพิ่ม
 *  เมื่อไหร่ก็ขึ้นเองทันทีโดยไม่ต้องแก้โค้ด ต้นที่ยังไม่มีไฟล์จะได้ placeholder แทนแทนที่จะพังหรือว่างเปล่า */
export function plantImageUrl(slug: string): string | null {
  const file = `${slug}.png`;
  const absolutePath = path.join(process.cwd(), "public", "plants", file);
  return existsSync(absolutePath) ? `/plants/${file}` : null;
}
