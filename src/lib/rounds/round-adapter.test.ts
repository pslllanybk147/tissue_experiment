import { describe, expect, it } from "vitest";
import { resolveBySlug } from "@/lib/manual/registry";
import type { ExperimentLot, ProtocolStepRun } from "@/lib/domain/models";
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

    expect(view.steps).toHaveLength(14);
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

    expect(view.currentStepNumber).toBe(14);
    expect(view.passedCount).toBe(14);
  });

  it("ดึงค่าที่บันทึกไว้มาแสดงกับขั้นนั้น", () => {
    const view = buildRoundView(lot, [run("sterilize", "Passed", { "sterilize-minutes": 12 })], manual);
    const sterilize = view.steps.find((step) => step.id === "sterilize")!;

    expect(sterilize.state.measurements["sterilize-minutes"]).toBe(12);
    expect(sterilize.state.note).toContain("sterilize");
  });

  it("บันทึกที่อ้างขั้นซึ่งไม่มีในคู่มือแล้ว จะถูกข้ามไปโดยไม่ทำให้พัง", () => {
    const view = buildRoundView(lot, [run("ขั้นที่ถูกลบไปแล้ว", "Passed")], manual);

    expect(view.steps).toHaveLength(14);
    expect(view.passedCount).toBe(0);
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
});
