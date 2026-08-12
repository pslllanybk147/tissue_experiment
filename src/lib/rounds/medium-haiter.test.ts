import { describe, expect, it } from "vitest";
import { mediumHaiterTargetPpmFor } from "./medium-haiter";

describe("mediumHaiterTargetPpmFor", () => {
  it("แปลง w/w เป็น w/v ก่อนคูณอัตรา 2 mL/L", () => {
    // 6% w/w × ความหนาแน่น 1.08 = 6.48% w/v → 2 mL/L ได้ 129.6 ppm
    // เดิมคูณ 20 กับเลขบนฉลากตรง ๆ จนได้ 120 ppm ซึ่งต่ำกว่าที่ตั้งใจ 7.4%
    expect(mediumHaiterTargetPpmFor(6, "w/w")).toBe(129.6);
  });

  it("ฉลากที่เป็น w/v อยู่แล้วไม่ต้องแปลง", () => {
    expect(mediumHaiterTargetPpmFor(6, "w/v")).toBe(120);
  });

  it("ไม่มีค่าฉลากให้ใช้ค่ากลาง 6% แต่ยังเคารพฐานฉลากที่ล็อกไว้", () => {
    expect(mediumHaiterTargetPpmFor(undefined, undefined)).toBe(120);
    expect(mediumHaiterTargetPpmFor(0, "w/w")).toBe(129.6);
  });
});
