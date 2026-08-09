import { describe, expect, it } from "vitest";
import { USER_REPORTED_PROFILE } from "./equipment-profile";
import { resolveTrialReadiness } from "./trial-readiness";
import { resolveTrialArmReadiness } from "@/lib/trials/trial-readiness";

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

  it("แยก T1/T2 ออกจากน้ำปลอดเชื้อและไม่ถือว่าแผน rinse เป็นการเตรียมจริง", () => {
    const t1 = resolveTrialArmReadiness(USER_REPORTED_PROFILE, "t1");
    const t2 = resolveTrialArmReadiness(USER_REPORTED_PROFILE, "t2");

    expect(t1.status).toBe("blocked");
    expect(t2.status).toBe("blocked");
    expect(t1.blockers.join(" ")).toMatch(/เตรียม|rinse/);
    expect(t2.blockers.join(" ")).toMatch(/เตรียม|rinse/);
  });

  it("ยัง block Control-A และ T3 เมื่อไม่มี sterile water แม้ T1/T2 เตรียมน้ำ rinse แล้ว", () => {
    const profile = {
      ...USER_REPORTED_PROFILE,
      medium: { ...USER_REPORTED_PROFILE.medium, sterilizationMethod: "haiter-chemical" as const },
      rinseWater: {
        lowDoseHypochlorite: {
          method: "low-dose-hypochlorite" as const,
          status: "prepared" as const,
          containerCount: 3 as const,
          volumePerContainerMl: 50,
          productName: "Haiter",
          batchOrLot: "HAITER-1",
          actualChlorinePpm: 300,
          stockVolumeMl: 5,
          finalVolumeMl: 1000,
          preparedAt: "2026-08-09T10:00:00Z",
        },
        nadcc: {
          method: "nadcc" as const,
          status: "prepared" as const,
          containerCount: 3 as const,
          volumePerContainerMl: 50,
          productName: "NaDCC",
          batchOrLot: "NADCC-1",
          actualChlorinePpm: 300,
          stockVolumeMl: 1,
          finalVolumeMl: 1000,
          preparedAt: "2026-08-09T10:00:00Z",
        },
      },
    };
    const readiness = resolveTrialReadiness(profile);

    expect(readiness.arms.find((arm) => arm.armRole === "t1")?.status).toBe("experimental");
    expect(readiness.arms.find((arm) => arm.armRole === "t2")?.status).toBe("experimental");
    expect(readiness.arms.find((arm) => arm.armRole === "control-a")?.status).toBe("blocked");
    expect(readiness.arms.find((arm) => arm.armRole === "t3")?.status).toBe("blocked");
    expect(readiness.armBlockers.map((arm) => arm.armRole)).toEqual(expect.arrayContaining(["control-a", "t3"]));
    expect(readiness.overall).toBe("blocked");
  });
});
