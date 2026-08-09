import { describe, expect, it } from "vitest";

import { allTermIds, contextualTermById, parseContextualTerms, parseTerms, plainText, termIdsIn } from "./terms";

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

  it("ถอดเครื่องหมายห่อออกเหลือข้อความล้วน", () => {
    expect(plainText("หา[[node|ข้อ]]ที่มี[[axillary-bud|ตาข้าง]]สมบูรณ์")).toBe("หาข้อที่มีตาข้างสมบูรณ์");
    expect(plainText("ไม่มีคำห่อ")).toBe("ไม่มีคำห่อ");
  });

  it("ถอดเครื่องหมายห่อของคำที่ชี้ไปสารในคลังสารได้เหมือนกับ landmark เพราะ plainText ไม่แยกชนิด", () => {
    expect(plainText("จุ่ม[[ascorbic-acid|กรดแอสคอร์บิก]]แล้ววาง")).toBe("จุ่มกรดแอสคอร์บิกแล้ววาง");
  });

  it("ทะเบียนคำศัพท์มาจาก landmarks ของทุกทรงและสารในคลังสาร", () => {
    expect(allTermIds().has("node")).toBe(true);
    expect(allTermIds().has("axillary-bud")).toBe(true);
    expect(allTermIds().has("ascorbic-acid")).toBe(true);
    expect(allTermIds().has("ไม่มีคำนี้")).toBe(false);
  });

  it("แยกศัพท์บริบทที่ไม่ได้ห่อด้วยมือได้โดยไม่จับข้อความรอบข้าง", () => {
    expect(parseContextualTerms("เตรียมน้ำปลอดเชื้อ 300 ppm")).toEqual([
      { kind: "text", text: "เตรียม" },
      { kind: "term", termId: "sterile-water", text: "น้ำปลอดเชื้อ" },
      { kind: "text", text: " 300 " },
      { kind: "term", termId: "ppm", text: "ppm" },
    ]);
    expect(contextualTermById("blank-control")?.practicalCue).toContain("Control-B");
  });
});
