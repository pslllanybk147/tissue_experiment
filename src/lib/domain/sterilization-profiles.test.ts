import { describe, expect, test } from "vitest";
import type { ProtocolStep } from "./models";
import {
  canUnlockExplantSteps,
  composeGuidedSteps,
  profileById,
  sterilizationProfiles,
  workspaceStepForSetup,
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
  test("does not delegate agar dissolution to an undefined room method", () => {
    const haiter = sterilizationProfiles.find((profile) => profile.method === "haiter-chemical");
    const medium = haiter?.steps.find((step) => step.id === "prepare-haiter-medium");
    const copy = [
      medium?.instruction,
      ...(medium?.beginner?.actions ?? []),
      ...(medium?.materials ?? []),
    ].join(" ");
    expect(copy).not.toContain("วิธีของห้อง");
    expect(copy).toContain("คนต่อเนื่อง");
    expect(copy).toContain("55–60°C");
    expect(copy).toContain("เทอร์โมมิเตอร์");
  });

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

  test("teaches vessel and lid sterilization before Haiter medium is dispensed", () => {
    const profile = profileById("haiter-chemical-v1");
    const vesselIndex = profile.steps.findIndex((item) => item.id === "sanitize-haiter-vessels");
    const mediumIndex = profile.steps.findIndex((item) => item.id === "prepare-haiter-medium");
    const vessel = profile.steps[vesselIndex];

    expect(vesselIndex).toBeGreaterThan(-1);
    expect(vesselIndex).toBeLessThan(mediumIndex);
    expect(vessel.beginner?.actions.join(" ")).toContain("5% v/v");
    expect(vessel.beginner?.actions.join(" ")).toContain("5 mL");
    expect(vessel.beginner?.actions.join(" ")).toContain("10 นาที");
    expect(vessel.beginner?.actions.join(" ")).toContain("ขอบปาก");
    expect(vessel.requiredEvidence).toEqual(["note", "photo"]);
    expect(vessel.referenceIds).toEqual(expect.arrayContaining([
      "source-csup-2012",
      "source-naocl-vessels-2009",
    ]));
  });

  test("explains that pressure vessels are cleaned first and sterilized with the medium", () => {
    const profile = profileById("pressure-sterilization-v1");
    const vessel = profile.steps.find((item) => item.id === "prepare-pressure-vessels");
    const pressure = profile.steps.find((item) => item.id === "pressure-sterilize-medium");

    expect(vessel?.beginner?.actions.join(" ")).toContain("ยังไม่ถือว่าภาชนะปลอดเชื้อ");
    expect(vessel?.beginner?.actions.join(" ")).toContain("121°C");
    expect(vessel?.nextActionOnPass).toContain("พร้อมกันในรอบหม้อนึ่ง");
    expect(pressure?.beginner?.actions.join(" ")).toContain("บันทึกเวลา");
  });

  test("does not expose generic placeholder guidance in any sterilization step", () => {
    const visibleGuidance = sterilizationProfiles.flatMap((profile) => (
      profile.steps.flatMap((step) => [
        ...(step.beginner?.whatToFind ?? []),
        ...(step.beginner?.actions ?? []),
        ...(step.beginner?.evidencePrompt ?? []),
      ])
    )).join(" ");

    expect(visibleGuidance).not.toContain("ผลที่ขั้นตอนนี้ระบุ");
    expect(visibleGuidance).not.toContain("มองหาผลที่ระบุ");
    expect(visibleGuidance).not.toContain("คำสั่งว่าต้องตวง");
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

describe("workspace setup guidance", () => {
  const workspaceBase = {
    ...baseSteps[0],
    id: "workspace",
    title: "เตรียมพื้นที่ปลอดเชื้อและอุปกรณ์",
    referenceIds: [],
  };

  test("turns SAB plus alcohol inputs into physical beginner actions", () => {
    const step = workspaceStepForSetup(workspaceBase, {
      workspaceType: "still-air-box",
      disinfectant: "alcohol-70",
      applicator: "spray-to-wipe",
      alcoholPercent: 70,
      contactTimeMinutes: 1,
      customEquipment: ["ขวดสเปรย์ 500 mL"],
    });
    const copy = step.beginner?.actions.join(" ") ?? "";

    expect(step.title).toContain("Still-Air Box");
    expect(copy).toContain("ฉีดให้ผ้าชื้น");
    expect(copy).toContain("ห้ามพ่นเป็นละออง");
    expect(copy).toContain("รอให้อากาศนิ่งอย่างน้อย 15 นาที");
    expect(step.criticalControls?.join(" ")).toContain("ห้ามผสม Haiter/bleach กับ alcohol");
    expect(step.materials).toContain("ขวดสเปรย์ 500 mL");
    expect(step.requiredEvidence).toEqual(["note", "photo"]);
  });

  test("uses the entered Haiter surface calculation without mixing it with alcohol", () => {
    const step = workspaceStepForSetup(workspaceBase, {
      workspaceType: "still-air-box",
      disinfectant: "haiter-label",
      applicator: "wipe",
      haiterSourcePercent: 6,
      haiterTargetPercent: 0.1,
      solutionVolumeMl: 500,
      minimumToolVolumeMl: 0.1,
      calculatedHaiterMl: 8.3333,
      contactTimeMinutes: 1,
      customEquipment: [],
    });
    const copy = step.beginner?.actions.join(" ") ?? "";

    expect(copy).toContain("Haiter 8.3333 mL");
    expect(copy).toContain("ห้ามผสมกับ alcohol");
    expect(copy).toContain("contact time บนฉลาก");
    expect(copy).not.toContain("จุดไฟ");
  });

  test("blocks a legacy lot that has no workspace input", () => {
    const step = workspaceStepForSetup(workspaceBase);
    expect(step.title).toContain("เลือกและเตรียมพื้นที่");
    expect(step.beginner?.stopConditions).toContain("ไม่มีข้อมูลพื้นที่ทำงานหรือฉลากสาร");
  });
});
