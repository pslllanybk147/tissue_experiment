import { describe, expect, it } from "vitest";
import { defaultKit } from "./resolve-path";
import { normalizeEquipmentProfile, USER_REPORTED_PROFILE } from "./equipment-profile";

describe("normalizeEquipmentProfile", () => {
  it("ยกข้อมูลชุดเดิมเป็น schema v2 โดยไม่ทำค่าหลักหาย", () => {
    const profile = normalizeEquipmentProfile({
      ...defaultKit,
      owned: ["bleach"],
      scaleMinimumMg: 25,
      pipetteMinimumMl: 0.2,
      msLabelRateGPerL: 4.43,
    });

    expect(profile).toMatchObject({
      schemaVersion: 2,
      owned: ["bleach"],
      scaleMinimumMg: 25,
      pipetteMinimumMl: 0.2,
      msLabelRateGPerL: 4.43,
      msRateGPerL: 4.43,
    });
    expect(profile.inventory).toHaveLength(25);
    expect(profile.inventory.find((item) => item.id === "forceps")?.quantity).toBe(0);
  });

  it("เก็บค่าจากฉลากและอุปกรณ์ของผู้ใช้ตามที่รายงานจริง", () => {
    const profile = normalizeEquipmentProfile(USER_REPORTED_PROFILE);

    expect(profile.chemicals.alcohol.percent).toBe(75);
    expect(profile.chemicals.bleach.percentWw).toBe(6);
    expect(profile.chemicals.nadcc).toMatchObject({
      availableChlorinePercent: 60,
      tabletMassG: 5.4,
      nadccMassGPerTablet: 2.97,
      tabletCount: 15,
    });
    expect(profile.water).toMatchObject({ sourcePpm: 15, sterile: false, sterilizationMethod: null });
    expect(profile.rinseWater).toEqual({ lowDoseHypochlorite: null, nadcc: null });
    expect(profile.instruments).toMatchObject({ balanceResolutionG: 0.01, foodScaleResolutionG: 0.1, syringeResolutionMl: 0.1, phMeter: true });
    expect(profile.containers).toMatchObject({ cultureJar50Ml: 46, glassJar250Ml: 4 });
    expect(profile.workspace).toMatchObject({ sab: true, plasticRoom: true, openFlameFuelAvailable: false });
    expect(profile.phone.model).toBe("Samsung Galaxy S24 FE");
    expect(profile.medium.sterilizationMethod).toBeNull();
  });

  it("มีรายการของชิ้นจริงครบและไม่ตีความของที่ไม่ได้บอกจำนวนว่าไม่มี", () => {
    const quantities = Object.fromEntries(USER_REPORTED_PROFILE.inventory.map((item) => [item.id, item.quantity]));

    expect(quantities).toMatchObject({
      "plastic-culture-jar-50ml": 46,
      "glass-jar-250ml": 4,
      "syringe-5ml": 1,
      "syringe-1ml": 3,
      "foggy-bottle": 3,
      forceps: 1,
      "phone-s24fe": 1,
      "ph-meter": 1,
    });
  });
});
