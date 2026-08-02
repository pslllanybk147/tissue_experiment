import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import type { ExperimentLot, ProtocolStepRun } from "@/lib/domain/models";
import { resolveBySlug } from "@/lib/manual/registry";
import { buildRoundView } from "@/lib/rounds/round-adapter";
import { RoundProgress } from "./round-progress";

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

const passedReceive: ProtocolStepRun = {
  id: "run-1",
  ownerId: "owner-1",
  lotId: "round-1",
  protocolId: manual.slug,
  versionId: "manual-v1",
  stepId: "receive",
  status: "Passed",
  note: "ถ่ายรูปครบแล้ว",
  measurements: {},
  mediaIds: [],
  observedAt: "2026-08-01T01:00:00.000Z",
  updatedAt: "2026-08-01T01:00:00.000Z",
};

const view = buildRoundView(lot, [passedReceive], manual);

describe("RoundProgress", () => {
  it("แสดงความคืบหน้ารวมของรอบ", () => {
    const html = renderToStaticMarkup(<RoundProgress view={view} />);

    expect(html).toContain("ผ่านแล้ว 1 จาก 14 ขั้น");
  });

  it("ลิงก์แต่ละขั้นด้วยหมายเลขที่เริ่มจาก 1", () => {
    const html = renderToStaticMarkup(<RoundProgress view={view} />);

    expect(html).toContain('href="/my/rounds/round-1/step/1"');
    expect(html).toContain('href="/my/rounds/round-1/step/14"');
  });

  it("บอกว่าขั้นไหนผ่านแล้วและขั้นไหนกำลังทำอยู่", () => {
    const html = renderToStaticMarkup(<RoundProgress view={view} />);

    expect(html).toContain("ผ่านแล้ว");
    expect(html).toContain("ทำต่อตรงนี้");
  });

  it("แสดงบันทึกที่จดไว้ของขั้นที่ผ่านแล้ว", () => {
    const html = renderToStaticMarkup(<RoundProgress view={view} />);

    expect(html).toContain("ถ่ายรูปครบแล้ว");
  });
});
