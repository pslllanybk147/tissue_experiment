import { describe, expect, it } from "vitest";
import { buildRoundSterilizationSnapshot } from "./round-setup";

const chemistry = {
  bleachPercentWw: 6,
  nadccAvailableChlorinePercent: 60,
  nadccTabletMassG: 5.4,
  nadccMassGPerTablet: 2.97,
};

describe("round setup chemistry snapshot", () => {
  it("เก็บข้อมูลสารทั้งสองตัวไว้ใน snapshot แม้เลือกใช้เพียงตัวเดียวในแต่ละขั้น", () => {
    const snapshot = buildRoundSterilizationSnapshot({
      mediumMethod: "nadcc-chemical",
      surfaceMethod: "haiter-chemical",
      rinseMethod: "nadcc",
    }, chemistry);

    expect(snapshot.mediumSterilizationMethod).toBe("nadcc-chemical");
    expect(snapshot.method).toBe("haiter-chemical");
    expect(snapshot.rinseWater?.method).toBe("nadcc");
    expect(snapshot.chemistry).toEqual(chemistry);
  });

  it("ไม่สร้าง snapshot ที่ยืนยันไม่ได้เมื่อยังไม่เลือกวิธีฟอกผิว", () => {
    expect(() => buildRoundSterilizationSnapshot({
      mediumMethod: "haiter-chemical",
      surfaceMethod: null,
      rinseMethod: "commercial-sterile",
    }, chemistry)).toThrow("ต้องเลือกวิธีฟอกผิวชิ้นพืชก่อนสร้างรอบ");
  });
});
