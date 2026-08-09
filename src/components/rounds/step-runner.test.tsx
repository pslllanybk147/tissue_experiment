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
    expect(html).toContain("ทำตามลำดับ");
    expect(html).toContain("ผ่านเมื่อ");
    expect(html).toContain("หยุดเมื่อ");
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

  it("render ช่อง number, text, date, checkbox และ select ตามชนิด ไม่บังคับทุกอย่างเป็นตัวเลข", () => {
    const typedStep = {
      ...receive,
      measurements: [
        { id: "ppm", label: "ppm จริง", unit: "ppm" as const, required: true, kind: "number" as const },
        { id: "batch", label: "batch", unit: "text" as const, required: true, kind: "text" as const },
        { id: "date", label: "วันที่", unit: "date" as const, required: true, kind: "date" as const },
        { id: "confirmed", label: "ยืนยันฉลาก", unit: "boolean" as const, required: true, kind: "checkbox" as const },
        { id: "result", label: "ผล", unit: "text" as const, required: true, kind: "select" as const, options: [{ value: "clean", label: "ใส" }] },
      ],
    };
    const html = renderToStaticMarkup(<StepRunner view={view} step={typedStep} onSave={noop} />);

    expect(html).toContain('name="ppm"');
    expect(html).toContain('type="number"');
    expect(html).toContain('<textarea id="batch"');
    expect(html).toContain('type="date"');
    expect(html).toContain('type="checkbox"');
    expect(html).toContain('<select id="result"');
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

describe("หลักฐานขั้นต่ำก่อนบันทึกว่าผ่าน", () => {
  const requiredPhotoStep = {
    ...sterilize,
    evidenceRequirement: "one-photo" as const,
    state: {
      ...sterilize.state,
      measurements: Object.fromEntries(sterilize.measurements.map((measurement) => [measurement.id, 1])),
    },
  };

  function openingButton(html: string, label: string): string {
    const labelAt = html.indexOf(label);
    const buttonAt = html.lastIndexOf("<button", labelAt);
    return html.slice(buttonAt, labelAt);
  }

  it("ปิดเฉพาะปุ่มผ่านเมื่อยังขาดรูป แต่ปุ่มติดปัญหายังใช้ได้", () => {
    const html = renderToStaticMarkup(
      <StepRunner view={view} step={requiredPhotoStep} onSave={noop} photos={photos} />,
    );

    expect(openingButton(html, "บันทึกว่าผ่าน")).toContain("disabled");
    expect(openingButton(html, "ติดปัญหา")).not.toContain("disabled");
    expect(html).toContain("ต้องแนบอย่างน้อย 1 รูป");
  });

  it("เปิดปุ่มผ่านเมื่อช่องบังคับและรูปครบ", () => {
    const html = renderToStaticMarkup(
      <StepRunner
        view={view}
        step={requiredPhotoStep}
        onSave={noop}
        photos={{ ...photos, media: [{
          id: "media-1",
          ownerId: "owner-1",
          lotId: "round-1",
          observationId: "obs-1",
          cloudinaryPublicId: "evidence/media-1",
          secureUrl: "https://example.com/media-1.jpg",
          width: 800,
          height: 600,
          format: "jpg",
          bytes: 1000,
          caption: "",
          capturedAt: null,
          createdBy: "owner-1",
          createdAt: "2026-08-09T00:00:00.000Z",
          updatedAt: "2026-08-09T00:00:00.000Z",
          deletedAt: null,
        }] }}
      />,
    );

    expect(openingButton(html, "บันทึกว่าผ่าน")).not.toContain("disabled");
  });

  it("โหมดสาธิตมีทางข้ามแยกจากการบันทึกผ่าน และบอกว่าไม่บันทึกผล", () => {
    const html = renderToStaticMarkup(
      <StepRunner
        view={view}
        step={requiredPhotoStep}
        onSave={noop}
        photos={{ ...photos, canAttach: false, reason: "โหมดสาธิตแนบรูปไม่ได้" }}
        demoMode
      />,
    );

    expect(html).toContain("ข้ามเพื่อทดสอบหน้าจอ");
    expect(html).toContain("ไม่บันทึกว่าผ่าน");
    expect(html).toContain(`/my/rounds/${view.lotId}/step/${requiredPhotoStep.displayNumber + 1}`);
  });
});

describe("T3 lock", () => {
  it("ปิดเฉพาะปุ่มผ่านและอธิบายเหตุผล โดยยังบันทึกปัญหาได้", () => {
    const completeStep = {
      ...receive,
      state: {
        ...receive.state,
        measurements: Object.fromEntries(receive.measurements.map((measurement) => [measurement.id, 1])),
      },
    };
    const html = renderToStaticMarkup(
      <StepRunner
        view={view}
        step={completeStep}
        onSave={noop}
        locked
        lockReason="รอผล T1 และ T2 ให้ครบ"
      />,
    );
    const passAt = html.indexOf("บันทึกว่าผ่าน");
    const passButton = html.slice(html.lastIndexOf("<button", passAt), passAt);
    const failAt = html.indexOf("ติดปัญหา", passAt);
    const failButton = html.slice(html.lastIndexOf("<button", failAt), failAt);

    expect(passButton).toContain("disabled");
    expect(failButton).not.toContain("disabled");
    expect(html).toContain("รอผล T1 และ T2 ให้ครบ");
  });
});

describe("rendered trial protocol semantics", () => {
  it("T3 ที่ project แล้วไม่มี corrective banner หรือข้อความ Haiter หลงเหลือ", () => {
    const violin = resolveBySlug("violin-variegated")!;
    const t3Lot: ExperimentLot = {
      ...lot,
      id: "round-t3",
      plant: violin.commonName,
      protocolId: violin.slug,
      protocolTitle: violin.scientificName,
      armRole: "t3",
      sterilization: {
        profileId: "nadcc-soak-v1",
        profileVersion: "1.0.0",
        method: "nadcc-soak",
        targetChlorinePercent: 0.03,
      },
    };
    const t3View = buildRoundView(t3Lot, [], violin);
    const t3Step = t3View.steps.find((item) => item.id === "sterilize")!;
    const html = renderToStaticMarkup(<StepRunner view={t3View} step={t3Step} onSave={noop} />);

    expect(html).toContain("24 ถึง 48 ชั่วโมง");
    expect(html).not.toMatch(/Haiter|ไฮเตอร์|NaOCl|NaClO/);
  });
});
