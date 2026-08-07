import { describe, expect, it } from "vitest";

import { cropStyle } from "./crop";

const square = { width: 1000, height: 1000 };
const wide = { width: 1200, height: 600 };

describe("การครอปภาพซูมของการ์ด", () => {
  it("ภาพถูกขยายเป็นสามเท่าของช่องซูมตามค่าเริ่มต้น", () => {
    expect(cropStyle({ x: 0.5, y: 0.5 }, square).backgroundSize).toBe("216px 216px");
  });

  it("ภาพแนวนอนคงสัดส่วนเดิมไว้ ไม่ยืดบิด", () => {
    expect(cropStyle({ x: 0.5, y: 0.5 }, wide).backgroundSize).toBe("216px 108px");
  });

  it("จุดกึ่งกลางภาพถูกวางไว้กลางช่องซูมพอดี", () => {
    // ช่อง 72px กึ่งกลางอยู่ที่ 36px ภาพกว้าง 216px จุด 0.5 อยู่ที่ 108px จากขอบซ้ายภาพ
    // จึงต้องเลื่อนภาพไปทางซ้าย 108 - 36 = 72px
    expect(cropStyle({ x: 0.5, y: 0.5 }, square).backgroundPosition).toBe("-72px -72px");
  });

  it("จุดที่มุมซ้ายบนก็ยังถูกวางไว้กลางช่อง ไม่ใช่ชิดขอบ", () => {
    // นี่คือเคสที่ background-position แบบเปอร์เซ็นต์ทำผิด
    expect(cropStyle({ x: 0, y: 0 }, square).backgroundPosition).toBe("36px 36px");
  });

  it("จุดที่มุมขวาล่างถูกวางไว้กลางช่องเช่นกัน", () => {
    expect(cropStyle({ x: 1, y: 1 }, square).backgroundPosition).toBe("-180px -180px");
  });

  it("เปลี่ยนขนาดช่องและระดับซูมได้", () => {
    const style = cropStyle({ x: 0.5, y: 0.5 }, square, 100, 2);
    expect(style.backgroundSize).toBe("200px 200px");
    expect(style.backgroundPosition).toBe("-50px -50px");
  });
});
