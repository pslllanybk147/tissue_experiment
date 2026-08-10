import { describe, expect, it } from "vitest";
import { USER_REPORTED_PROFILE } from "@/lib/equipment/equipment-profile";
import { buildRoundSetupInput, buildRoundSterilizationSnapshot } from "./round-setup";

describe("round setup chemistry snapshot", () => {
  it("เก็บข้อมูลสารทั้งสองตัวไว้ใน snapshot แม้เลือกใช้เพียงตัวเดียวในแต่ละขั้น", () => {
    const input = buildRoundSetupInput(
      { mediumMethod: "nadcc-chemical", surfaceMethod: "haiter-chemical", rinseMethod: "nadcc" },
      USER_REPORTED_PROFILE,
      "2026-08-10T10:00:00.000Z",
    );
    const snapshot = buildRoundSterilizationSnapshot(input);

    expect(snapshot.mediumSterilizationMethod).toBe("nadcc-chemical");
    expect(snapshot.method).toBe("haiter-chemical");
    expect(snapshot.rinseWater?.method).toBe("nadcc");
    expect(snapshot.chemistry).toEqual(input.chemistry);
    expect(snapshot.mediumPreparation?.method).toBe("nadcc-chemical");
  });

  it("ไม่สร้าง snapshot ที่ยืนยันไม่ได้เมื่อยังไม่เลือกวิธีฟอกผิว", () => {
    expect(() => buildRoundSetupInput(
      { mediumMethod: "haiter-chemical", surfaceMethod: null, rinseMethod: "commercial-sterile" },
      USER_REPORTED_PROFILE,
      "2026-08-10T10:00:00.000Z",
    )).toThrow("ต้องเลือกวิธีฟอกผิวชิ้นพืชก่อนสร้างรอบ");
  });

  it("copies the selected prepared rinse and locks it to the round", () => {
    const profile = structuredClone(USER_REPORTED_PROFILE);
    profile.rinseWater.nadcc = {
      method: "nadcc",
      status: "prepared",
      containerCount: 3,
      volumePerContainerMl: 60,
      batchOrLot: "N-1",
      actualChlorinePpm: 298,
      preparedAt: "2026-08-10T09:00:00.000Z",
    };

    const input = buildRoundSetupInput(
      { mediumMethod: "nadcc-chemical", surfaceMethod: "haiter-chemical", rinseMethod: "nadcc" },
      profile,
      "2026-08-10T10:00:00.000Z",
    );

    expect(input.rinseWater).toMatchObject({
      status: "prepared",
      batchOrLot: "N-1",
      volumePerContainerMl: 60,
      lockedAt: "2026-08-10T10:00:00.000Z",
    });
    expect(input.mediumPreparation.method).toBe("nadcc-chemical");

    profile.rinseWater.nadcc.batchOrLot = "CHANGED";
    expect(input.rinseWater?.batchOrLot).toBe("N-1");
  });

  it("creates a planned rinse when the selected profile preparation is missing", () => {
    const input = buildRoundSetupInput(
      { mediumMethod: "haiter-chemical", surfaceMethod: "haiter-chemical", rinseMethod: "low-dose-hypochlorite" },
      USER_REPORTED_PROFILE,
      "2026-08-10T10:00:00.000Z",
    );

    expect(input.rinseWater).toMatchObject({
      method: "low-dose-hypochlorite",
      status: "planned",
      lockedAt: "2026-08-10T10:00:00.000Z",
    });
    expect(input.rinseWater?.preparedAt).toBeUndefined();
  });

  it("rejects chlorinated rinse after a NaDCC soak", () => {
    expect(() => buildRoundSetupInput(
      { mediumMethod: "nadcc-chemical", surfaceMethod: "nadcc-soak", rinseMethod: "nadcc" },
      USER_REPORTED_PROFILE,
      "2026-08-10T10:00:00.000Z",
    )).toThrow("NaDCC soak ต้องล้างด้วยน้ำปลอดเชื้อ ไม่ใช้ chlorinated rinse ต่อ");
  });
});
