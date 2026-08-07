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

const photos = {
  observationId: "obs-1",
  media: [],
  canAttach: true,
  reason: "",
  onUploaded: noop,
};

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

  it("แสดงส่วนหลักฐานภาพของขั้น", () => {
    const html = renderToStaticMarkup(<StepRunner view={view} step={sterilize} onSave={noop} photos={photos} />);

    expect(html).toContain("หลักฐานภาพของขั้นนี้");
  });

  it("เมื่อแนบรูปไม่ได้ ต้องอธิบายเหตุผล ไม่ใช่ซ่อนไปเฉย ๆ", () => {
    const html = renderToStaticMarkup(
      <StepRunner
        view={view}
        step={sterilize}
        onSave={noop}
        photos={{ ...photos, canAttach: false, reason: "ตอนนี้ออฟไลน์จึงแนบรูปไม่ได้" }}
      />,
    );

    expect(html).toContain("ตอนนี้ออฟไลน์จึงแนบรูปไม่ได้");
    expect(html).not.toContain('type="file"');
  });

  it("ขั้นทำอาหารมีเครื่องคำนวณอยู่ในหน้าเดียวกับที่ลงมือ", () => {
    const prep = view.steps.find((item) => item.id === "prep-media")!;
    const html = renderToStaticMarkup(<StepRunner view={view} step={prep} onSave={noop} photos={photos} />);

    expect(html).toContain("จะทำอาหารเท่าไหร่");
  });

  it("ขั้นแรกไม่มีปุ่มย้อนกลับ", () => {
    const html = renderToStaticMarkup(<StepRunner view={view} step={receive} onSave={noop} />);

    expect(html).not.toContain("/step/0");
  });

  it("บอกว่ากำลังทำขั้นที่เท่าไรจากทั้งหมดกี่ขั้น", () => {
    const html = renderToStaticMarkup(<StepRunner view={view} step={sterilize} onSave={noop} />);

    expect(html).toContain("ขั้นที่ 8 จาก 15");
  });
});

describe("ตารางทดสอบช่วงต้องอยู่ในฟอร์ม", () => {
  // บั๊กจริงที่เจอตอนเปิดดูของจริง ตารางเคยถูกวางนอก <form> ทำให้ FormData มองไม่เห็นช่อง
  // ค่าที่ผู้ใช้กรอกจึงถูกบันทึกเป็น null เงียบ ๆ ทั้งที่ช่องแสดงผลถูกต้องทุกอย่าง
  const withDose = {
    ...sterilize,
    doses: {
      "sterilize.dose": {
        form: "น้ำยาซักผ้าขาว NaOCl 6%",
        low: 0.8,
        high: 2,
        unit: "%" as const,
        durationMin: [10, 20] as [number, number],
        movesLowerWhen: [],
        movesHigherWhen: [],
        evidence: { level: "adapted" as const, sourceIds: ["source-pp-2023"] },
      },
    },
  };

  it("ช่องกรอกของตารางอยู่ระหว่างแท็กเปิดและปิดของฟอร์ม", () => {
    const html = renderToStaticMarkup(<StepRunner view={view} step={withDose} onSave={noop} />);
    const formStart = html.indexOf("<form");
    const formEnd = html.indexOf("</form>");
    const input = html.indexOf('name="bracket-b-usable"');

    expect(formStart, "ไม่พบฟอร์ม").toBeGreaterThan(-1);
    expect(input, "ไม่พบช่องกรอกของตาราง").toBeGreaterThan(-1);
    expect(input, "ช่องกรอกอยู่ก่อนฟอร์ม").toBeGreaterThan(formStart);
    expect(input, "ช่องกรอกอยู่หลังฟอร์ม").toBeLessThan(formEnd);
  });

  it("ขั้นที่ไม่มีค่าช่วง ไม่มีตาราง", () => {
    const html = renderToStaticMarkup(<StepRunner view={view} step={receive} onSave={noop} />);
    expect(html).not.toContain('name="bracket-b-usable"');
  });
});
