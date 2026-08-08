import { describe, expect, it } from "vitest";
import { plantImageUrl } from "./plant-images";

describe("plantImageUrl", () => {
  it("คืน null เมื่อไม่มีไฟล์ภาพของ slug นั้นจริง ไม่ใช่ path ที่เปิดไม่ได้", () => {
    expect(plantImageUrl("ไม่มีต้นนี้แน่ ๆ")).toBeNull();
  });

  it("คืน path ใต้ /plants/ เมื่อมีไฟล์จริงใน public/plants/", () => {
    // pink-princess.png คือหนึ่งในภาพที่ generate ไว้จริงและ commit เข้าระบบแล้ว
    expect(plantImageUrl("pink-princess")).toBe("/plants/pink-princess.png");
  });
});
