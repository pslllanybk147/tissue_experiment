import { describe, expect, it } from "vitest";
import { coreSteps } from "./core-steps";

describe("coreSteps", () => {
  it("มีขั้นครบ 14 ขั้นตามลำดับมาตรฐาน", () => {
    expect(Object.keys(coreSteps)).toEqual([
      "receive",
      "quarantine",
      "identify",
      "select-explant",
      "cut",
      "prep-media",
      "sterilize",
      "initiate",
      "check-contamination",
      "multiply",
      "root",
      "acclimatize",
      "monitor",
      "close-round",
    ]);
  });

  it("ทุกขั้นมีเกณฑ์ผ่านและขั้นลงมือ และขั้นที่มีความเสี่ยงมีเงื่อนไขหยุด", () => {
    for (const [id, step] of Object.entries(coreSteps)) {
      expect(step.passCriteria.length, `${id} ต้องมีเกณฑ์ผ่าน`).toBeGreaterThan(0);
      expect(step.actions.length, `${id} ต้องมีขั้นลงมือ`).toBeGreaterThan(0);
    }
    const mustStop = Object.values(coreSteps).filter((step) => step.id !== "close-round");
    for (const step of mustStop) {
      expect(step.stopConditions.length, `${step.id} ต้องมีเงื่อนไขหยุด`).toBeGreaterThan(0);
    }
  });

  it("ขั้นที่อ้างว่ามีหลักฐานต้องระบุแหล่งอ้างอิง", () => {
    for (const [id, step] of Object.entries(coreSteps)) {
      if (step.evidence.level === "unsupported") continue;
      expect(step.evidence.sourceIds.length, `${id} อ้างว่ามีหลักฐานแต่ไม่ระบุแหล่ง`).toBeGreaterThan(0);
    }
  });

  it("id ของแต่ละขั้นตรงกับ key ที่ใช้เก็บ", () => {
    for (const [key, step] of Object.entries(coreSteps)) {
      expect(step.id).toBe(key);
    }
  });

  it("ขั้นฟอกฆ่าเชื้อเตือนเรื่องการผสมสารและบังคับบันทึกเวลา", () => {
    const sterilize = coreSteps.sterilize;

    expect(sterilize.safetyNotes.join(" ")).toContain("แอมโมเนีย");
    expect(sterilize.measurements.some((item) => item.id === "sterilize-minutes" && item.required)).toBe(true);
  });
});
