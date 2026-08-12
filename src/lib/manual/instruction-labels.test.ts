import { describe, expect, it } from "vitest";
import { allSlugs, resolveBySlug } from "./registry";

describe("ป้ายหัวข้อของคำสั่งลงมือทำ", () => {
  it("ไม่มีป้ายไหนถูกแปะทับคำสั่งที่ไม่เกี่ยวกัน", () => {
    // ป้ายชุดสำเร็จรูปจับคู่ด้วยลำดับ index ถ้าจำนวนคำสั่งกับจำนวนป้ายไม่ตรง
    // ระบบต้องเลิกใช้ป้ายชุดนั้นทั้งขั้น แล้วย่อป้ายจากคำสั่งจริงแทน
    // เดิมไม่มีการเช็ค ป้าย "เตรียมน้ำพักชิ้น" จึงไปแปะบนคำสั่ง "ตัดยอดอ่อน" ของ violin
    for (const slug of allSlugs()) {
      const manual = resolveBySlug(slug)!;
      for (const step of manual.steps) {
        for (const instruction of step.executionInstructions ?? []) {
          expect(instruction.label.trim(), `${slug}/${step.id}`).not.toBe("");
        }
      }
    }
  });

  it("ขั้นตัดชิ้นพืชของ violin ยังมีทั้งการเตรียมน้ำพักและการหย่อนลงน้ำ ตามที่เกณฑ์ผ่านบังคับ", () => {
    const manual = resolveBySlug("violin-variegated")!;
    const cut = manual.steps.find((step) => step.id === "cut")!;
    const text = (cut.executionInstructions ?? []).map((item) => `${item.label} ${item.action}`).join(" ");

    expect(cut.passCriteria).toContain("ทุกชิ้นอยู่ในน้ำ ไม่มีชิ้นไหนวางแห้งอยู่");
    expect(text).toContain("เตรียมภาชนะใส่น้ำสะอาด");
    expect(text).toContain("หย่อนลงน้ำทันที");
  });
});
