import { describe, expect, it } from "vitest";

import { appendPin, pinSnippet, toFraction, type Picked } from "./pin-picker-logic";

const landmarks = [{ id: "node" }, { id: "internode" }, { id: "axillary-bud" }];

describe("เครื่องมือปักหมุด", () => {
  it("แปลงพิกเซลเป็นสัดส่วนของภาพ ปัดสามตำแหน่ง", () => {
    expect(toFraction(400, 800)).toBe(0.5);
    expect(toFraction(200, 800)).toBe(0.25);
    expect(toFraction(1, 3)).toBe(0.333);
  });

  it("ภาพที่ยังวัดขนาดไม่ได้ ต้องไม่ทำให้ได้ค่า Infinity หรือ NaN", () => {
    expect(toFraction(400, 0)).toBe(0);
  });

  it("ปักหมุดเรียงตามลำดับจุดสังเกตของทรง", () => {
    let picked: Picked[] = [];
    picked = appendPin(picked, landmarks, 0.5, 0.5);
    picked = appendPin(picked, landmarks, 0.25, 0.25);
    expect(picked.map((item) => item.landmarkId)).toEqual(["node", "internode"]);
  });

  // นี่คือบั๊กที่เจอตอนตรวจด้วยเบราว์เซอร์จริง โค้ดเดิมอ่าน picked จาก closure
  // สองคลิกในจังหวะเดียวกันจึงเห็นรายการชุดเดียวกัน แล้วปักทับจุดเดิม
  // ผลคือหมุดหายไปหนึ่งจุด และจุดที่เหลือผูกกับ landmark ผิดตัวโดยไม่มีอะไรฟ้อง
  it("คลิกรัวในจังหวะเดียวกัน ต้องได้ครบทุกจุดและไม่สลับตัว", () => {
    const start: Picked[] = [];
    const clicks: Array<[number, number]> = [
      [0.5, 0.5],
      [0.25, 0.25],
      [0.75, 0.75],
    ];
    // ต่อกันแบบเดียวกับที่ React เรียก updater ซ้อนกันในรอบ batch เดียว
    const result = clicks.reduce(
      (current, [x, y]) => appendPin(current, landmarks, x, y),
      start,
    );
    expect(result.map((item) => item.landmarkId)).toEqual([
      "node",
      "internode",
      "axillary-bud",
    ]);
    expect(result.map((item) => item.x)).toEqual([0.5, 0.25, 0.75]);
  });

  it("ปักครบแล้วคลิกต่อ ต้องคืนรายการเดิมทั้งก้อน ไม่ใช่ก้อนใหม่ที่เหมือนกัน", () => {
    const full: Picked[] = landmarks.map((item) => ({ landmarkId: item.id, x: 0, y: 0 }));
    expect(appendPin(full, landmarks, 0.9, 0.9)).toBe(full);
  });

  it("โค้ดที่คัดลอกมีชื่อจุดกำกับทุกบรรทัด เพื่อไม่ให้วางผิดที่", () => {
    const snippet = pinSnippet([{ landmarkId: "node", x: 0.5, y: 0.4 }]);
    expect(snippet).toBe("// node\n  point: { x: 0.5, y: 0.4 },");
  });
});
