import { describe, expect, it } from "vitest";
import type { Observation } from "@/lib/domain/models";
import { evidenceObservationInput, findEvidenceObservation } from "./step-evidence";

const observation = (overrides: Partial<Observation>): Observation => ({
  id: "obs-1",
  lotId: "round-1",
  ownerId: "owner-1",
  createdBy: "owner-1",
  createdAt: "2026-08-03T00:00:00.000Z",
  updatedAt: "2026-08-03T00:00:00.000Z",
  deletedAt: null,
  observedAt: "2026-08-03T00:00:00.000Z",
  status: "Healthy",
  stage: "sterilize",
  note: "",
  shootCount: null,
  rootCount: null,
  contaminationCount: null,
  kind: "protocol-step-evidence",
  protocolStepId: "sterilize",
  ...overrides,
});

describe("evidenceObservationInput", () => {
  it("ทำเครื่องหมายว่าเป็นหลักฐานของขั้น ไม่ใช่บันทึกที่ผู้ใช้จดเอง", () => {
    const input = evidenceObservationInput("sterilize", "2026-08-03T10:00:00.000Z");

    expect(input.kind).toBe("protocol-step-evidence");
    expect(input.protocolStepId).toBe("sterilize");
    expect(input.stage).toBe("sterilize");
    expect(input.observedAt).toBe("2026-08-03T10:00:00.000Z");
  });

  it("ไม่ใส่ค่านับใด ๆ เพราะเป็นที่แขวนรูป ไม่ใช่การสังเกตผล", () => {
    const input = evidenceObservationInput("sterilize", "2026-08-03T10:00:00.000Z");

    expect(input.shootCount).toBeNull();
    expect(input.rootCount).toBeNull();
    expect(input.contaminationCount).toBeNull();
    expect(input.note).toBe("");
  });
});

describe("findEvidenceObservation", () => {
  it("หาเจอเฉพาะหลักฐานของขั้นที่ขอ", () => {
    const found = findEvidenceObservation(
      [observation({ id: "obs-a", protocolStepId: "receive" }), observation({ id: "obs-b", protocolStepId: "sterilize" })],
      "sterilize",
    );

    expect(found?.id).toBe("obs-b");
  });

  it("ไม่หยิบบันทึกที่ผู้ใช้จดเองมาใช้เป็นที่แขวนรูป", () => {
    const found = findEvidenceObservation(
      [observation({ id: "obs-manual", kind: "manual", protocolStepId: undefined })],
      "sterilize",
    );

    expect(found).toBeNull();
  });

  it("ไม่หยิบรายการที่ถูกลบไปแล้ว", () => {
    const found = findEvidenceObservation(
      [observation({ id: "obs-deleted", deletedAt: "2026-08-03T01:00:00.000Z" })],
      "sterilize",
    );

    expect(found).toBeNull();
  });

  it("คืนค่า null เมื่อยังไม่มีหลักฐานของขั้นนั้น", () => {
    expect(findEvidenceObservation([], "sterilize")).toBeNull();
  });
});
