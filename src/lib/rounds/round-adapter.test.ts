import { describe, expect, it } from "vitest";
import { resolveBySlug } from "@/lib/manual/registry";
import type { ExperimentLot, ProtocolStepRun } from "@/lib/domain/models";
import { USER_REPORTED_PROFILE } from "@/lib/equipment/equipment-profile";
import { buildRoundSetupInput } from "./round-setup";
import { buildRoundView, newLotInput } from "./round-adapter";

const manual = resolveBySlug("pink-princess")!;

const lot: ExperimentLot = {
  id: "round-1",
  ownerId: "owner-1",
  plant: manual.commonName,
  protocolId: manual.slug,
  protocolTitle: manual.scientificName,
  stage: "receive",
  status: "Healthy",
  startedAt: "2026-08-01",
  createdAt: "2026-08-01T00:00:00.000Z",
  updatedAt: "2026-08-01T00:00:00.000Z",
  workflowVersion: "v2",
};

const run = (stepId: string, status: ProtocolStepRun["status"], measurements: Record<string, number | null> = {}): ProtocolStepRun => ({
  id: `run-${stepId}`,
  ownerId: "owner-1",
  lotId: "round-1",
  protocolId: manual.slug,
  versionId: "manual-v1",
  stepId,
  status,
  note: `บันทึกของ ${stepId}`,
  measurements,
  mediaIds: [],
  observedAt: "2026-08-01T01:00:00.000Z",
  updatedAt: "2026-08-01T01:00:00.000Z",
});

describe("buildRoundView", () => {
  it("ขั้นที่ยังไม่มีบันทึกได้สถานะรอทำ", () => {
    const view = buildRoundView(lot, [], manual);

    expect(view.steps).toHaveLength(15);
    expect(view.steps.every((step) => step.state.status === "Pending")).toBe(true);
    expect(view.passedCount).toBe(0);
  });

  it("ขั้นปัจจุบันคือขั้นแรกที่ยังไม่ผ่าน", () => {
    const view = buildRoundView(lot, [run("receive", "Passed"), run("quarantine", "Passed")], manual);

    expect(view.currentStepNumber).toBe(3);
    expect(view.passedCount).toBe(2);
  });

  it("ขั้นที่ติดปัญหายังนับเป็นขั้นปัจจุบัน ไม่ใช่ข้ามไป", () => {
    const view = buildRoundView(lot, [run("receive", "Passed"), run("quarantine", "Failed")], manual);

    expect(view.currentStepNumber).toBe(2);
  });

  it("เมื่อผ่านครบทุกขั้น ขั้นปัจจุบันคือขั้นสุดท้าย", () => {
    const runs = manual.steps.map((step) => run(step.id, "Passed"));
    const view = buildRoundView(lot, runs, manual);

    expect(view.currentStepNumber).toBe(15);
    expect(view.passedCount).toBe(15);
  });

  it("ดึงค่าที่บันทึกไว้มาแสดงกับขั้นนั้น", () => {
    const view = buildRoundView(lot, [run("sterilize", "Passed", { "sterilize-minutes": 12 })], manual);
    const sterilize = view.steps.find((step) => step.id === "sterilize")!;

    expect(sterilize.state.measurements["sterilize-minutes"]).toBe(12);
    expect(sterilize.state.note).toContain("sterilize");
  });

  it("บันทึกที่อ้างขั้นซึ่งไม่มีในคู่มือแล้ว จะถูกข้ามไปโดยไม่ทำให้พัง", () => {
    const view = buildRoundView(lot, [run("ขั้นที่ถูกลบไปแล้ว", "Passed")], manual);

    expect(view.steps).toHaveLength(15);
    expect(view.passedCount).toBe(0);
  });

  it("กระปุกเปล่าใช้ blank workflow เจ็ดขั้นโดยเฉพาะ", () => {
    const blankLot: ExperimentLot = { ...lot, isBlank: true, armRole: "control-b" };
    const view = buildRoundView(blankLot, [], manual);

    expect(view.steps.map((step) => step.id)).toEqual([
      "blank-prepare",
      "blank-medium",
      "blank-container",
      "blank-pour",
      "blank-seal",
      "blank-incubate",
      "blank-observe",
    ]);
  });

  it("กระปุกเปล่าไม่ฟอกผิวและยังเฝ้าดูการปนเปื้อน", () => {
    const blankLot: ExperimentLot = { ...lot, isBlank: true, armRole: "control-b" };
    const view = buildRoundView(blankLot, [], manual);

    expect(view.steps.some((step) => step.id === "sterilize")).toBe(false);
    expect(view.steps.some((step) => step.id === "blank-observe")).toBe(true);
  });

  it("displayNumber ของกระปุกเปล่าเรียงต่อเนื่องตาม blank workflow", () => {
    const blankLot: ExperimentLot = { ...lot, isBlank: true, armRole: "control-b" };
    const view = buildRoundView(blankLot, [], manual);

    expect(view.steps.map((step) => step.displayNumber)).toEqual(
      Array.from({ length: view.steps.length }, (_, index) => index + 1),
    );
    expect(view.steps.map((step) => step.order)).toEqual([0, 1, 2, 3, 4, 5, 6]);
  });

  it("รอบที่เป็นแขนงของชุดทดลองพก trialArmRole/trialArmLabel/sterilization ติดไปด้วย", () => {
    const trialLot: ExperimentLot = {
      ...lot,
      armRole: "t3",
      armLabel: "T3 · NaDCC เดี่ยว 300 ppm นาน 24-48 ชม. แทน Haiter ทั้งขั้น",
      sterilization: { profileId: "nadcc-soak-v1", profileVersion: "1.0.0", method: "nadcc-soak", targetChlorinePercent: 0.03 },
    };
    const view = buildRoundView(trialLot, [], manual);

    expect(view.trialArmRole).toBe("t3");
    expect(view.trialArmLabel).toBe("T3 · NaDCC เดี่ยว 300 ppm นาน 24-48 ชม. แทน Haiter ทั้งขั้น");
    expect(view.sterilization?.method).toBe("nadcc-soak");
  });

  it("รอบปกติที่ไม่ใช่แขนงของชุดทดลองไม่มี trialArmRole", () => {
    const view = buildRoundView(lot, [], manual);

    expect(view.trialArmRole).toBeUndefined();
    expect(view.sterilization).toBeUndefined();
  });

  it("แนบสถานะล็อก T3 เมื่อส่งบริบทของแขนงพี่น้องมาให้", () => {
    const t1 = { ...lot, id: "lot-t1", trialId: "trial-1", armRole: "t1" as const };
    const t2 = { ...lot, id: "lot-t2", trialId: "trial-1", armRole: "t2" as const };
    const t3 = { ...lot, id: "lot-t3", trialId: "trial-1", armRole: "t3" as const };
    const complete = (trialLot: ExperimentLot) => ({
      ...run("check-contamination", "Passed", {
        "container-total": 8,
        "container-clean": 6,
        "container-usable": 5,
      }),
      id: `run-${trialLot.armRole}`,
      lotId: trialLot.id,
    });

    const locked = buildRoundView(t3, [], manual, { trialLots: [t1, t2, t3], trialRuns: [complete(t1)] });
    const unlocked = buildRoundView(t3, [], manual, {
      trialLots: [t1, t2, t3],
      trialRuns: [complete(t1), complete(t2)],
    });

    expect(locked.t3Eligibility).toMatchObject({ unlocked: false, reason: "missing-results" });
    expect(unlocked.t3Eligibility).toEqual({ unlocked: true, reason: "evidence-complete", missing: [] });
  });
});

describe("newLotInput", () => {
  it("เก็บ slug ของคู่มือไว้ในช่อง protocolId และใช้ workflow รุ่นใหม่", () => {
    const input = newLotInput(manual, "2026-08-02");

    expect(input.protocolId).toBe("pink-princess");
    expect(input.workflowVersion).toBe("v2");
    expect(input.startedAt).toBe("2026-08-02");
    expect(input.stage).toBe(manual.steps[0].id);
    expect(input.status).toBe("Healthy");
  });

  it("ล็อกวิธีและค่าของ NaDCC/Haiter ไว้กับรอบ", () => {
    const setup = buildRoundSetupInput(
      { mediumMethod: "nadcc-chemical", surfaceMethod: "haiter-chemical", rinseMethod: "nadcc" },
      USER_REPORTED_PROFILE,
      "2026-08-10T10:00:00.000Z",
    );
    const input = newLotInput(manual, "2026-08-10", setup);

    expect(input.sterilization?.mediumSterilizationMethod).toBe("nadcc-chemical");
    expect(input.sterilization?.chemistry?.nadccAvailableChlorinePercent).toBe(60);
    expect(input.sterilization?.rinseWater?.method).toBe("nadcc");
  });
});
