import { describe, expect, it } from "vitest";

import { allTermIds, parseTerms, termIdsIn } from "./terms";

describe("การห่อคำศัพท์ในเนื้อหา", () => {
  it("ข้อความที่ไม่มีคำห่อ คืนชิ้นเดียว", () => {
    expect(parseTerms("ตัดให้ชิดโคน")).toEqual([{ kind: "text", text: "ตัดให้ชิดโคน" }]);
  });

  it("แยกคำที่ห่อไว้ออกจากข้อความรอบ ๆ", () => {
    expect(parseTerms("ตัดใต้[[node|ข้อ]]หนึ่งเซนติเมตร")).toEqual([
      { kind: "text", text: "ตัดใต้" },
      { kind: "term", termId: "node", text: "ข้อ" },
      { kind: "text", text: "หนึ่งเซนติเมตร" },
    ]);
  });

  it("รองรับหลายคำในประโยคเดียว", () => {
    const spans = parseTerms("[[node|ข้อ]]ไม่ใช่[[internode|ปล้อง]]");
    expect(spans.filter((span) => span.kind === "term")).toHaveLength(2);
  });

  it("คำที่อยู่ท้ายสุดไม่ทำให้เกิดชิ้นข้อความว่าง", () => {
    expect(parseTerms("หา[[node|ข้อ]]")).toEqual([
      { kind: "text", text: "หา" },
      { kind: "term", termId: "node", text: "ข้อ" },
    ]);
  });

  it("ข้อความว่างคืน array ว่าง", () => {
    expect(parseTerms("")).toEqual([]);
  });

  it("เก็บ id ของทุกคำที่ถูกห่อ", () => {
    expect(termIdsIn("[[node|ข้อ]]กับ[[node|ข้อ]]และ[[internode|ปล้อง]]")).toEqual([
      "node",
      "node",
      "internode",
    ]);
  });

  it("ทะเบียนคำศัพท์มาจาก landmarks ของทุกทรง", () => {
    expect(allTermIds().has("node")).toBe(true);
    expect(allTermIds().has("axillary-bud")).toBe(true);
    expect(allTermIds().has("ไม่มีคำนี้")).toBe(false);
  });
});
