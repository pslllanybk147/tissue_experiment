import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

/** บั๊กจริงที่เจอตอนใช้งาน: ติ๊กช่องยืนยันเกณฑ์ผ่านแล้วทั้งหน้าพังเป็นจอดำ
 *
 *  สาเหตุคือ handler เรียก setState แบบ updater ฟังก์ชัน แล้วไปอ่าน event.currentTarget
 *  ข้างในตัว updater ซึ่ง React เรียกตอน render ถัดไป ตอนนั้น currentTarget ถูกล้างเป็น null แล้ว
 *  จึงได้ TypeError: Cannot read properties of null (reading 'checked')
 *
 *  ทดสอบด้วยการอ่านซอร์สเพราะเป็นข้อผิดพลาดเชิงรูปแบบโค้ด ไม่ใช่ผลลัพธ์ของฟังก์ชัน
 *  และ render แบบ static markup ไม่ยิง event จึงจับไม่ได้ */
describe("handler ของ checkbox ในหน้าขั้นตอน", () => {
  it("ห้ามอ่าน event.currentTarget ข้างใน state updater แบบฟังก์ชัน", () => {
    const source = readFileSync(new URL("./step-runner.tsx", import.meta.url), "utf8");
    const lazyUpdaterReadingEvent = /set[A-Z]\w*\(\s*\([^)]*\)\s*=>[^;]{0,400}?event\.currentTarget/;

    expect(lazyUpdaterReadingEvent.test(source)).toBe(false);
  });
});
