import { describe, expect, it } from "vitest";
import { decodeStepValues, encodeStepValues } from "./field-values";

describe("typed step field compatibility", () => {
  it("อ่าน run เก่าที่มีเฉพาะ measurements ได้เหมือนเดิม", () => {
    expect(decodeStepValues({ measurements: { pH: 5.7, rinses: 3 } })).toEqual({ pH: 5.7, rinses: 3 });
  });

  it("responses ใหม่ทับ alias ตัวเลขเดิมและรักษาชนิดข้อมูล", () => {
    expect(decodeStepValues({
      measurements: { ppm: 300 },
      responses: { ppm: 301, date: "2026-08-09", sterile: false, batch: "N60-A" },
    })).toEqual({ ppm: 301, date: "2026-08-09", sterile: false, batch: "N60-A" });
  });

  it("เขียน responses ทุกชนิดและคง measurements เฉพาะตัวเลขเพื่อให้ระบบเก่าอ่านได้", () => {
    expect(encodeStepValues({ ppm: 300, date: "2026-08-09", sterile: false, batch: "N60-A", blank: null })).toEqual({
      measurements: { ppm: 300 },
      responses: { ppm: 300, date: "2026-08-09", sterile: false, batch: "N60-A", blank: null },
    });
  });
});
