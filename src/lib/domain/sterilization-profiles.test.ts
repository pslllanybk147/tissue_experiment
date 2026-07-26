import { describe, expect, test } from "vitest";
import type { ProtocolStep } from "./models";
import {
  canUnlockExplantSteps,
  composeGuidedSteps,
  profileById,
  sterilizationProfiles,
} from "./sterilization-profiles";
import { stepsForTemplate } from "./protocol-templates";

const baseSteps: ProtocolStep[] = [
  {
    id: "baseline",
    order: 0,
    title: "รับต้นไม้และบันทึก baseline",
    instruction: "บันทึกต้นแม่",
    durationMinutes: 10,
    criticalControls: [],
    safetyNotes: [],
    referenceIds: [],
    evidenceState: "Adapted",
  },
  {
    id: "select-explant",
    order: 1,
    title: "เลือกตำแหน่ง explant",
    instruction: "เลือกตำแหน่ง",
    durationMinutes: 10,
    criticalControls: [],
    safetyNotes: [],
    referenceIds: [],
    evidenceState: "Adapted",
  },
  {
    id: "cut-explant",
    order: 2,
    title: "ตัดและเตรียมชิ้นพืช",
    instruction: "ตัดชิ้นพืช",
    durationMinutes: 10,
    criticalControls: [],
    safetyNotes: [],
    referenceIds: [],
    evidenceState: "Adapted",
  },
  {
    id: "surface-sterilize",
    order: 3,
    title: "ฟอกฆ่าเชื้อ",
    instruction: "ฟอกผิว explant",
    durationMinutes: 10,
    criticalControls: [],
    safetyNotes: [],
    referenceIds: [],
    evidenceState: "Experimental",
  },
];

describe("sterilization profiles", () => {
  test("provides Haiter and pressure profiles with explicit versions", () => {
    expect(sterilizationProfiles.map((profile) => profile.method)).toEqual([
      "haiter-chemical",
      "pressure-sterilization",
    ]);
    expect(sterilizationProfiles.every((profile) => profile.version.length > 0)).toBe(true);
  });

  test("Haiter profile places medium readiness before explant cutting", () => {
    const steps = composeGuidedSteps(baseSteps, profileById("haiter-chemical-v1"));
    const readinessIndex = steps.findIndex((step) => step.workflowPhase === "readiness");
    const cutIndex = steps.findIndex((step) => step.workflowPhase === "explant-cut");

    expect(readinessIndex).toBeGreaterThan(-1);
    expect(cutIndex).toBeGreaterThan(-1);
    expect(readinessIndex).toBeLessThan(cutIndex);
  });

  test("pressure profile keeps pressure-specific work before readiness", () => {
    const steps = composeGuidedSteps(baseSteps, profileById("pressure-sterilization-v1"));
    const pressureIndex = steps.findIndex((step) => step.id === "pressure-sterilize-medium");
    const readinessIndex = steps.findIndex((step) => step.workflowPhase === "readiness");

    expect(pressureIndex).toBeGreaterThan(-1);
    expect(pressureIndex).toBeLessThan(readinessIndex);
  });

  test("keeps real monograph health and explant marking before readiness, then cuts before surface sterilization", () => {
    const steps = composeGuidedSteps(
      stepsForTemplate("template-pink-princess-nodal"),
      profileById("haiter-chemical-v1"),
    );
    const titles = steps.map((step) => step.title);
    const readinessIndex = titles.indexOf("ตรวจความพร้อมก่อนตัดต้น");

    expect(titles.indexOf("ตรวจสุขภาพและกักต้นแม่")).toBeLessThan(readinessIndex);
    expect(titles.indexOf("ยืนยันชนิดและเลือกวิธีทดลอง")).toBeLessThan(readinessIndex);
    expect(titles.indexOf("ทำเครื่องหมายตำแหน่ง explant (ยังไม่ตัด)")).toBeLessThan(readinessIndex);
    expect(titles.indexOf("ตัดและเตรียม explant")).toBeGreaterThan(readinessIndex);
    expect(titles.indexOf("ตัดและเตรียม explant")).toBeLessThan(
      titles.indexOf("ฟอกฆ่าเชื้อผิว explant"),
    );
  });

  test("includes a beginner-complete working dilution procedure", () => {
    const profile = profileById("haiter-chemical-v1");
    const step = profile.steps.find((item) => item.id === "prepare-haiter-working-dilution");

    expect(step?.instruction).toContain("ตัวอย่าง 1:10");
    expect(step?.instruction).toContain("1 mL");
    expect(step?.instruction).toContain("9 mL");
    expect(step?.instruction).toContain("0.6%");
    expect(step?.instruction).toContain("คำนวณ V1 ใหม่");
    expect(step?.criticalControls).toContain("ใช้สารเจือจางที่ Protocol อนุญาตและติดฉลากทันที");
    expect(step?.measurements?.map((item) => item.unit)).toEqual(
      expect.arrayContaining(["%", "mL"]),
    );
  });

  test("uses medium-specific beginner guidance instead of plant-photo boilerplate", () => {
    const medium = profileById("haiter-chemical-v1").steps.find(
      (item) => item.id === "prepare-haiter-medium",
    );

    expect(medium?.materials).toEqual(expect.arrayContaining([
      "MS basal salts ตามสูตร",
      "เครื่องวัด pH",
      "Haiter ที่อ่านฉลากแล้ว",
    ]));
    expect(medium?.beginner?.actions.join(" ")).toContain("ชั่ง MS");
    expect(medium?.beginner?.evidencePrompt.join(" ")).toContain("ฉลาก batch");
    expect(medium?.beginner?.evidencePrompt.join(" ")).toContain("ไม่ต้องถ่ายต้นไม้");
    expect(medium?.nextActionOnPass).toContain("Blank");
    expect(medium?.nextActionOnFail).toContain("ห้ามใช้กับ explant");
  });
});

describe("readiness gate", () => {
  test("unlocks after the blank is completed and all physical checks pass", () => {
    expect(canUnlockExplantSteps({
      mediumReady: true,
      containersReady: true,
      workspaceReady: true,
      toolsReady: true,
      blankDecision: "completed",
      blankSkipReason: "",
    })).toBe(true);
  });

  test("stays locked when blank is skipped without a reason", () => {
    expect(canUnlockExplantSteps({
      mediumReady: true,
      containersReady: true,
      workspaceReady: true,
      toolsReady: true,
      blankDecision: "skipped",
      blankSkipReason: "",
    })).toBe(false);
  });

  test("unlocks when a skipped blank has a reason and all checks pass", () => {
    expect(canUnlockExplantSteps({
      mediumReady: true,
      containersReady: true,
      workspaceReady: true,
      toolsReady: true,
      blankDecision: "skipped",
      blankSkipReason: "มีอาหารเพียงสามกระปุกและยอมรับความเสี่ยง",
    })).toBe(true);
  });
});
