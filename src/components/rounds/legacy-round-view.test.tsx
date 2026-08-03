import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import type { ExperimentLot, Observation, ProtocolStepRun } from "@/lib/domain/models";
import { LegacyRoundView } from "./legacy-round-view";

const lot: ExperimentLot = {
  id: "old-1",
  ownerId: "owner-1",
  plant: "Pink Princess",
  protocolId: "protocol-pink-princess-nodal",
  protocolTitle: "Pink Princess · Nodal culture",
  stage: "sterilize",
  status: "Healthy",
  startedAt: "2026-07-10",
  createdAt: "2026-07-10T00:00:00.000Z",
  updatedAt: "2026-07-12T00:00:00.000Z",
};

const observations: Observation[] = [{
  id: "obs-1",
  lotId: "old-1",
  ownerId: "owner-1",
  createdBy: "owner-1",
  createdAt: "2026-07-11T00:00:00.000Z",
  updatedAt: "2026-07-11T00:00:00.000Z",
  deletedAt: null,
  observedAt: "2026-07-11",
  status: "Healthy",
  stage: "initiate",
  note: "ตายังเขียวดี",
  shootCount: 2,
  rootCount: null,
  contaminationCount: 0,
}];

const runs: ProtocolStepRun[] = [{
  id: "run-1",
  ownerId: "owner-1",
  lotId: "old-1",
  protocolId: "protocol-pink-princess-nodal",
  versionId: "v1",
  stepId: "guided-step-7",
  status: "Passed",
  note: "ฟอก 12 นาที",
  measurements: { "sterilization-minutes": 12 },
  mediaIds: [],
  observedAt: "2026-07-11T00:00:00.000Z",
  updatedAt: "2026-07-11T00:00:00.000Z",
}];

describe("LegacyRoundView", () => {
  it("บอกชัดว่าเป็นรอบเก่าและอ่านอย่างเดียว", () => {
    const html = renderToStaticMarkup(<LegacyRoundView lot={lot} observations={observations} runs={runs} />);

    expect(html).toContain("รอบเก่า");
    expect(html).toContain("อ่านอย่างเดียว");
  });

  it("แสดงข้อมูลหัวรอบที่ผู้ใช้เคยบันทึกไว้", () => {
    const html = renderToStaticMarkup(<LegacyRoundView lot={lot} observations={observations} runs={runs} />);

    expect(html).toContain("Pink Princess");
    expect(html).toContain("2026-07-10");
  });

  it("แสดงบันทึกการสังเกตพร้อมค่าที่นับไว้", () => {
    const html = renderToStaticMarkup(<LegacyRoundView lot={lot} observations={observations} runs={runs} />);

    expect(html).toContain("ตายังเขียวดี");
    expect(html).toContain("2");
  });

  it("แสดงบันทึกรายขั้นที่เคยทำ", () => {
    const html = renderToStaticMarkup(<LegacyRoundView lot={lot} observations={observations} runs={runs} />);

    expect(html).toContain("ฟอก 12 นาที");
  });

  it("ไม่มีอะไรบันทึกไว้เลยก็ยังบอกได้ ไม่ใช่หน้าว่าง", () => {
    const html = renderToStaticMarkup(<LegacyRoundView lot={lot} observations={[]} runs={[]} />);

    expect(html).toContain("ไม่มีบันทึก");
  });
});
