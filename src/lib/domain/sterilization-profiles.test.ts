import { describe, expect, test } from "vitest";
import type { ProtocolStep } from "./models";
import {
  canUnlockExplantSteps,
  composeGuidedSteps,
  profileById,
  sterilizationProfiles,
} from "./sterilization-profiles";

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
