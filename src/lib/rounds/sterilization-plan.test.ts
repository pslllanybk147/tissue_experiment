import { describe, expect, it } from "vitest";
import type { LotSterilizationSnapshot, MediumSterilizationMethod, RinseWaterMethod } from "@/lib/domain/models";
import { resolveBySlug } from "@/lib/manual/registry";
import type { ResolvedStep } from "@/lib/manual/types";
import { resolveSterilizationStep } from "./sterilization-plan";

const manual = resolveBySlug("pink-princess")!;
const prepMedia = manual.steps.find((step) => step.id === "prep-media")!;
const sterilize = manual.steps.find((step) => step.id === "sterilize")!;

function snapshot(overrides: Partial<LotSterilizationSnapshot> = {}): LotSterilizationSnapshot {
  return {
    profileId: "locked-test-v1",
    profileVersion: "1.0.0",
    method: "haiter-chemical",
    mediumSterilizationMethod: "haiter-chemical",
    rinseMethod: "commercial-sterile",
    ...overrides,
  };
}

function operationalText(step: ResolvedStep): string {
  return JSON.stringify({
    materials: step.materials,
    actions: step.actions,
    executionInstructions: step.executionInstructions,
    measurements: step.measurements,
    troubleshootingIds: step.troubleshootingIds,
  });
}

describe("resolveSterilizationStep", () => {
  it.each([
    ["haiter-chemical", "Haiter", /NaDCC|121°C/],
    ["nadcc-chemical", "NaDCC", /Haiter|NaOCl|121°C/],
    ["pressure-sterilization", "121°C", /Haiter|NaOCl|NaDCC/],
  ] as const)("prep-media resolves only %s", (method, included, excluded) => {
    const resolved = resolveSterilizationStep(
      prepMedia,
      snapshot({ mediumSterilizationMethod: method as MediumSterilizationMethod }),
    );
    const text = operationalText(resolved);

    expect(text).toContain(included);
    expect(text).not.toMatch(excluded);
  });

  it("แสดงปริมาณ Haiter ที่คำนวณไว้ใน instruction ของการเตรียมอาหาร", () => {
    const resolved = resolveSterilizationStep(
      prepMedia,
      snapshot({
        mediumPreparation: {
          method: "haiter-chemical",
          protocolVersion: "haiter-medium-v1",
          status: "planned",
          calculatedDose: { value: 4.25, unit: "mL" },
          lockedAt: "2026-08-10T10:00:00.000Z",
        },
      }),
    );
    const instruction = resolved.executionInstructions?.find((item) => item.label === "ฆ่าเชื้ออาหารด้วย Haiter");

    expect(instruction?.quantity).toBe("4.25 mL");
  });

  it.each([
    ["nadcc", "น้ำ NaDCC 300 ppm", /NaOCl|น้ำปลอดเชื้อธรรมดา/],
    ["low-dose-hypochlorite", "น้ำ NaOCl 300 ppm", /NaDCC|น้ำปลอดเชื้อธรรมดา/],
  ] as const)("%s rinse has only the selected water in R1-R3 and no R4", (method, included, excluded) => {
    const resolved = resolveSterilizationStep(
      sterilize,
      snapshot({ rinseMethod: method as RinseWaterMethod }),
    );
    const text = operationalText(resolved);

    expect(text).toMatch(/R1/);
    expect(text).toMatch(/R3/);
    expect(text).toContain(included);
    expect(text).not.toMatch(excluded);
    expect(text).not.toMatch(/R4|final rinse/i);
  });

  it("nadcc soak removes every Haiter action, material, measurement, and troubleshooting branch", () => {
    const resolved = resolveSterilizationStep(
      sterilize,
      snapshot({ method: "nadcc-soak", rinseMethod: "commercial-sterile" }),
    );
    const text = operationalText(resolved);

    expect(text).toContain("NaDCC");
    expect(text).toMatch(/24 ถึง 48 ชั่วโมง/);
    expect(text).not.toMatch(/Haiter|NaOCl|active-chlorine-percent|browning-bleach-damage/);
  });

  it("does not mutate the shared manual step", () => {
    const before = structuredClone(sterilize);
    const resolved = resolveSterilizationStep(sterilize, snapshot({ method: "nadcc-soak" }));

    expect(resolved).not.toBe(sterilize);
    expect(sterilize).toEqual(before);
  });
});
