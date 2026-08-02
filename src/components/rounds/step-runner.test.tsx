import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import type { ExperimentLot } from "@/lib/domain/models";
import { resolveBySlug } from "@/lib/manual/registry";
import { buildRoundView } from "@/lib/rounds/round-adapter";
import { StepRunner } from "./step-runner";

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

const view = buildRoundView(lot, [], manual);
const sterilize = view.steps.find((step) => step.id === "sterilize")!;
const receive = view.steps[0];
const noop = async () => {};

describe("StepRunner", () => {
  it("แสดงเนื้อหาของขั้นเหมือนที่คู่มือแสดง", () => {
    const html = renderToStaticMarkup(<StepRunner view={view} step={sterilize} onSave={noop} />);

    expect(html).toContain("ฟอกฆ่าเชื้อ");
    expect(html).toContain("ลงมือทำ");
    expect(html).toContain("ผ่านเมื่อ");
    expect(html).toContain("หยุดทันทีถ้า");
  });

  it("แสดงอาการที่อาจเจอ เพื่อให้วินิจฉัยได้ตรงหน้างาน", () => {
    const html = renderToStaticMarkup(<StepRunner view={view} step={sterilize} onSave={noop} />);

    expect(html).toContain("ถ้าเจออาการแบบนี้");
  });

  it("มีช่องกรอกครบทุกค่าที่ขั้นนั้นกำหนด และช่องบังคับบอกให้โปรแกรมอ่านหน้าจอรู้", () => {
    const html = renderToStaticMarkup(<StepRunner view={view} step={sterilize} onSave={noop} />);

    for (const measurement of sterilize.measurements) {
      expect(html, `ขาดช่องกรอก ${measurement.id}`).toContain(`name="${measurement.id}"`);
    }
    expect(html).toContain('aria-required="true"');
  });

  it("มีทั้งปุ่มผ่านและปุ่มติดปัญหา", () => {
    const html = renderToStaticMarkup(<StepRunner view={view} step={sterilize} onSave={noop} />);

    expect(html).toContain("บันทึกว่าผ่าน");
    expect(html).toContain("ติดปัญหา");
  });

  it("ไม่มีปุ่มถ่ายรูปในรุ่นนี้ เพื่อไม่ให้มีปุ่มที่กดแล้วไม่ทำงาน", () => {
    const html = renderToStaticMarkup(<StepRunner view={view} step={sterilize} onSave={noop} />);

    expect(html).not.toContain("ถ่ายรูป");
    expect(html).not.toContain('type="file"');
  });

  it("ขั้นแรกไม่มีปุ่มย้อนกลับ", () => {
    const html = renderToStaticMarkup(<StepRunner view={view} step={receive} onSave={noop} />);

    expect(html).not.toContain("/step/0");
  });

  it("บอกว่ากำลังทำขั้นที่เท่าไรจากทั้งหมดกี่ขั้น", () => {
    const html = renderToStaticMarkup(<StepRunner view={view} step={sterilize} onSave={noop} />);

    expect(html).toContain("ขั้นที่ 7 จาก 14");
  });
});
