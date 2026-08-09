import { describe, expect, it } from "vitest";
import { USER_REPORTED_PROFILE } from "./equipment-profile";
import { resolveTrialReadiness } from "./trial-readiness";

describe("resolveTrialReadiness", () => {
  it("ไม่ยอมเรียกชุดของผู้ใช้ว่าพร้อมเมื่อยังไม่มีน้ำปลอดเชื้อ", () => {
    const readiness = resolveTrialReadiness(USER_REPORTED_PROFILE);

    expect(readiness.overall).toBe("blocked");
    expect(readiness.blockers).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: "sterile-water" }),
      expect.objectContaining({ id: "sterile-medium" }),
    ]));
    expect(readiness.capabilities.find((item) => item.id === "sterile-water")).toMatchObject({
      status: "blocked",
      have: expect.stringContaining("15 ppm"),
      missing: expect.stringContaining("ยังไม่ผ่านการฆ่าเชื้อ"),
    });
  });

  it("บอกข้อเท็จจริงสำคัญของพื้นที่และของที่มีโดยไม่แนะนำเปลวไฟ", () => {
    const readiness = resolveTrialReadiness(USER_REPORTED_PROFILE);
    const workspace = readiness.capabilities.find((item) => item.id === "clean-workspace");

    expect(workspace?.have).toMatch(/SAB.*46/);
    expect(readiness.cautions.join(" ")).toMatch(/ตะเกียง.*ไม่มีเชื้อเพลิง/);
    expect(readiness.cautions.join(" ")).toMatch(/พลาสติก.*ห้ามใช้เปลวไฟ/);
  });
});
