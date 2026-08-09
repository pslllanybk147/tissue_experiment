import { describe, expect, it } from "vitest";
import { formatDurationMinutes } from "./duration";

describe("formatDurationMinutes", () => {
  it("ต่ำกว่าหนึ่งชั่วโมงแสดงเป็นนาที", () => {
    expect(formatDurationMinutes(20)).toBe("20 นาที");
  });

  it("ลงตัวเป็นชั่วโมงแสดงเป็นชั่วโมง", () => {
    expect(formatDurationMinutes(60)).toBe("1 ชั่วโมง");
  });

  it("ลงตัวเป็นวันแสดงเป็นวัน (ใช้กับขั้นที่ต้องรอเป็นสัปดาห์/เดือน)", () => {
    expect(formatDurationMinutes(1440)).toBe("1 วัน");
    expect(formatDurationMinutes(10080)).toBe("7 วัน");
    expect(formatDurationMinutes(20160)).toBe("14 วัน");
    expect(formatDurationMinutes(43200)).toBe("30 วัน");
  });

  it("ไม่ลงตัวแสดงทั้งชั่วโมงและนาที", () => {
    expect(formatDurationMinutes(90)).toBe("1 ชั่วโมง 30 นาที");
  });
});
