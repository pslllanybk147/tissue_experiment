import { describe, expect, it } from "vitest";
import type { ExperimentLot } from "@/lib/domain/models";
import { USER_REPORTED_PROFILE } from "@/lib/equipment/equipment-profile";
import { resolveBySlug } from "@/lib/manual/registry";
import { buildRoundView } from "./round-adapter";
import { SIMPLE_MODE_DEFAULT_METHODS, SIMPLE_MODE_REQUIRED_MEASUREMENT_IDS, roundModeOf } from "./round-mode";
import { buildRoundSetupInput, buildRoundSterilizationSnapshot, type RoundSetupSelection } from "./round-setup";

const manual = resolveBySlug("pink-princess")!;

const lot: ExperimentLot = {
  id: "round-1",
  ownerId: "owner-1",
  plant: manual.commonName,
  protocolId: manual.slug,
  protocolTitle: manual.scientificName,
  stage: "receive",
  status: "Healthy",
  startedAt: "2026-08-13",
  createdAt: "2026-08-13T00:00:00.000Z",
  updatedAt: "2026-08-13T00:00:00.000Z",
  workflowVersion: "v2",
};

function viewFor(selection: RoundSetupSelection) {
  const setup = buildRoundSetupInput(selection, USER_REPORTED_PROFILE, "2026-08-13T10:00:00.000Z");
  return buildRoundView({ ...lot, sterilization: buildRoundSterilizationSnapshot(setup) }, [], manual);
}

const simpleSelection: RoundSetupSelection = { mode: "simple", ...SIMPLE_MODE_DEFAULT_METHODS };
const fullSelection: RoundSetupSelection = { mode: "full", ...SIMPLE_MODE_DEFAULT_METHODS };

describe("roundModeOf", () => {
  it("รอบที่สร้างก่อนมีโหมดง่ายอ่านเป็นโหมดเก็บข้อมูลเสมอ", () => {
    expect(roundModeOf(undefined)).toBe("full");
    expect(roundModeOf({ profileId: "haiter-chemical-v1", profileVersion: "1.0.0", method: "haiter-chemical" })).toBe("full");
  });
});

describe("โหมดง่ายในรอบเพาะจริง", () => {
  it("เหลือช่องบังคับเฉพาะตัวเลขที่พลาดแล้วชิ้นพืชตาย", () => {
    const view = viewFor(simpleSelection);
    const required = view.steps.flatMap((step) => step.measurements.filter((item) => item.required).map((item) => item.id));

    expect(required.length).toBeGreaterThan(0);
    for (const id of required) expect(SIMPLE_MODE_REQUIRED_MEASUREMENT_IDS.has(id)).toBe(true);
    // ทั้งสองช่องนี้คือเหตุผลหลักที่ต้องมี pH meter จึงต้องไม่บังคับในโหมดง่าย
    expect(required).not.toContain("medium-ph");
    expect(required).not.toContain("medium-volume");
  });

  it("ยังบังคับค่าของขั้นฟอกที่ระบบใส่ให้ตามวิธีที่ล็อกไว้ ไม่ใช่แค่ค่าที่มากับคู่มือ", () => {
    const view = viewFor(simpleSelection);
    const sterilize = view.steps.find((step) => step.id === "sterilize")!;
    const required = sterilize.measurements.filter((item) => item.required).map((item) => item.id);

    // rinse-actual-ppm ถูกเพิ่มโดย resolveSterilizationStep หลัง resolve คู่มือ
    // ถ้ากรองโหมดก่อนขั้นนั้น ช่องนี้จะหลุดการกรองและกลายเป็นช่องบังคับที่ไม่ได้ตั้งใจ
    expect(required).toContain("rinse-actual-ppm");
    expect(required).toContain("sterilize-minutes");
    expect(required).toContain("active-chlorine-percent");
    // sterile-rinses ถูกถอดออกไปแล้วตั้งแต่ resolveSterilizationStep เพราะวิธีล้างที่ล็อกไว้
    // กำหนดจำนวนรอบให้เองเป็น R1–R3 ไม่ใช่ผลของโหมดง่าย
    expect(sterilize.measurements.map((item) => item.id)).not.toContain("sterile-rinses");
  });

  it("ไม่ลบคำสั่ง เกณฑ์ผ่าน เงื่อนไขให้หยุด หรือคำเตือนความปลอดภัยออกจากขั้นใดเลย", () => {
    const simple = viewFor(simpleSelection);
    const full = viewFor(fullSelection);

    expect(simple.steps.map((step) => step.id)).toEqual(full.steps.map((step) => step.id));
    for (const [index, step] of simple.steps.entries()) {
      const reference = full.steps[index];
      expect(step.actions).toEqual(reference.actions);
      expect(step.executionInstructions).toEqual(reference.executionInstructions);
      expect(step.passCriteria).toEqual(reference.passCriteria);
      expect(step.stopConditions).toEqual(reference.stopConditions);
      expect(step.safetyNotes).toEqual(reference.safetyNotes);
    }
  });

  it("ช่องที่ไม่บังคับแล้วยังอยู่ให้กรอกได้ ไม่ได้ถูกลบทิ้ง", () => {
    const simple = viewFor(simpleSelection);
    const full = viewFor(fullSelection);

    for (const [index, step] of simple.steps.entries()) {
      expect(step.measurements.map((item) => item.id)).toEqual(full.steps[index].measurements.map((item) => item.id));
    }
  });

  it("โหมดเก็บข้อมูลไม่เปลี่ยนพฤติกรรมเดิม", () => {
    const view = viewFor(fullSelection);
    const required = view.steps.flatMap((step) => step.measurements.filter((item) => item.required).map((item) => item.id));

    expect(view.mode).toBe("full");
    expect(required).toContain("medium-ph");
  });

  it("โหมดถูกล็อกไว้กับรอบและอ่านกลับได้จาก view", () => {
    expect(viewFor(simpleSelection).mode).toBe("simple");
  });
});

describe("ค่าตั้งต้นของโหมดง่าย", () => {
  it("เป็นเส้นทางไฮเตอร์ที่ไม่ต้องใช้หม้อนึ่งและไม่ต้องซื้อน้ำปลอดเชื้อ", () => {
    expect(SIMPLE_MODE_DEFAULT_METHODS).toEqual({
      mediumMethod: "haiter-chemical",
      surfaceMethod: "haiter-chemical",
      rinseMethod: "low-dose-hypochlorite",
    });

    const view = viewFor(simpleSelection);
    const prepMedia = view.steps.find((step) => step.id === "prep-media")!;
    const text = JSON.stringify({ actions: prepMedia.actions, executionInstructions: prepMedia.executionInstructions });

    expect(text).not.toContain("121°C");
  });
});
