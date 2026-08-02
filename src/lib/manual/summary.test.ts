import { describe, expect, it } from "vitest";
import { manualSummary } from "./summary";

describe("manualSummary", () => {
  it("นับจำนวนขั้นแยกตามที่มาและตามระดับหลักฐาน", () => {
    const summary = manualSummary("pink-princess")!;

    expect(summary.stepCount).toBe(14);
    expect(summary.byOrigin.core + summary.byOrigin.override + summary.byOrigin.pack).toBe(14);
    expect(summary.byOrigin.override).toBe(4);
    expect(summary.byEvidence["species-direct"]).toBe(3);
  });

  it("ชี้ขั้นที่ยังไม่มีงานรองรับให้ตรวจได้ง่าย", () => {
    const summary = manualSummary("pink-princess")!;

    expect(summary.unsupportedStepIds).toContain("sterilize");
  });

  it("คืนค่า null เมื่อไม่รู้จัก slug", () => {
    expect(manualSummary("ไม่มีต้นนี้")).toBeNull();
  });
});
