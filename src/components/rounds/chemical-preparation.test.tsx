import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import type { LotSterilizationSnapshot } from "@/lib/domain/models";
import { ChemicalPreparation, estimatePpmFromDose } from "./chemical-preparation";

const base: LotSterilizationSnapshot = {
  profileId: "locked-v1",
  profileVersion: "1.0.0",
  method: "haiter-chemical",
  mediumSterilizationMethod: "nadcc-chemical",
  rinseMethod: "commercial-sterile",
  mediumPreparation: {
    method: "nadcc-chemical",
    protocolVersion: "nadcc-medium-v1",
    status: "planned",
    productName: "NaDCC tablet",
    batchOrLot: "N-42",
    labelConcentration: 60,
    labelBasis: "available-chlorine",
    targetPpm: 300,
    finalVolumeMl: 1000,
    lockedAt: "2026-08-10T08:00:00.000Z",
  },
};

describe("ChemicalPreparation", () => {
  it("คำนวณ ppm โดยประมาณจากปริมาตรที่ตวงจริงโดยไม่เรียกว่าเป็นค่าตรวจ", () => {
    const estimated = estimatePpmFromDose(
      {
        mode: "working-dilution",
        dilutionFactor: 4,
        workingPercent: 1.62,
        workingVolumeMl: 20,
        sourceVolumeMl: 5,
        diluentVolumeMl: 15,
        workingDoseMl: 1.259259,
      },
      { labelConcentration: 6, labelBasis: "w/w" },
      1.3,
      170,
    );

    expect(estimated).toBe(123.882);
  });

  it("shows only the calculator required by the locked medium method", () => {
    const html = renderToStaticMarkup(
      <ChemicalPreparation stepId="prep-media" sterilization={base} onConfirm={async () => {}} />,
    );

    expect(html).toContain("NaDCC (เม็ดคลอรีน)");
    expect(html).not.toContain("ไฮเตอร์ / สารฟอกฆ่าเชื้อ");
    expect(html).toContain("N-42");
    expect(html).toContain("cl-chemical-preparation");
    expect(html).not.toContain("pl-card");
    expect(html).not.toContain("pl-soft-card");
  });

  it("renders no preparation editor for pressure sterilization", () => {
    const html = renderToStaticMarkup(
      <ChemicalPreparation
        stepId="prep-media"
        sterilization={{
          ...base,
          mediumSterilizationMethod: "pressure-sterilization",
          mediumPreparation: {
            method: "pressure-sterilization",
            protocolVersion: "pressure-medium-v1",
            status: "planned",
            lockedAt: "2026-08-10T08:00:00.000Z",
          },
        }}
        onConfirm={async () => {}}
      />,
    );

    expect(html).toBe("");
  });

  it("prefills protocol target and batch volume when the round supplies beginner defaults", () => {
    const html = renderToStaticMarkup(
      <ChemicalPreparation
        stepId="prep-media"
        sterilization={{
          ...base,
          method: "haiter-chemical",
          mediumSterilizationMethod: "haiter-chemical",
          mediumPreparation: {
            method: "haiter-chemical",
            protocolVersion: "haiter-medium-v1",
            status: "planned",
            productName: "Haiter",
            labelConcentration: 6,
            labelBasis: "w/w",
            lockedAt: "2026-08-10T08:00:00.000Z",
          },
        }}
        defaultTargetPpm={120}
        defaultFinalVolumeMl={170}
        onConfirm={async () => {}}
      />,
    );

    expect(html).toContain('value="120"');
    expect(html).toContain('value="170"');
    expect(html).toContain("อัตรา Haiter 2 mL/L");
  });

  it("explains where the actual dose value comes from", () => {
    const html = renderToStaticMarkup(
      <ChemicalPreparation
        stepId="prep-media"
        sterilization={{
          ...base,
          method: "haiter-chemical",
          mediumSterilizationMethod: "haiter-chemical",
          mediumPreparation: {
            method: "haiter-chemical",
            protocolVersion: "haiter-medium-v1",
            status: "planned",
            productName: "Haiter",
            labelConcentration: 6,
            labelBasis: "w/w",
            lockedAt: "2026-08-10T08:00:00.000Z",
          },
        }}
        defaultTargetPpm={120}
        defaultFinalVolumeMl={170}
        onConfirm={async () => {}}
      />,
    );

    expect(html).toContain("ผลคำนวณ");
    expect(html).toContain("กรอกค่าที่ตวงจริง");
  });

  it("แปลผลคำนวณเป็นวิธีอ่านขีดเครื่องมือสำหรับมือใหม่", () => {
    const html = renderToStaticMarkup(
      <ChemicalPreparation
        stepId="prep-media"
        sterilization={{
          ...base,
          method: "haiter-chemical",
          mediumSterilizationMethod: "haiter-chemical",
          mediumPreparation: {
            method: "haiter-chemical",
            protocolVersion: "haiter-medium-v1",
            status: "planned",
            productName: "Haiter",
            labelConcentration: 6,
            labelBasis: "w/w",
            lockedAt: "2026-08-10T08:00:00.000Z",
          },
        }}
        defaultTargetPpm={120}
        defaultFinalVolumeMl={170}
        onConfirm={async () => {}}
      />,
    );

    expect(html).toContain("ค่าทางสูตร");
    expect(html).toContain("ขีดละเอียด 0.1 mL");
    expect(html).toContain("ชุดทดสอบคลอรีน");
    expect(html).toContain("ค่าที่อ่านได้จากเครื่อง");
    expect(html).toContain("TDS/EC");
    expect(html).toContain("ห้ามกรอกแทนค่าคลอรีน");
    expect(html).toContain("ยังไม่เลือก verified");
  });

  it("groups preparation fields and distinguishes calculated ppm from a measured value", () => {
    const html = renderToStaticMarkup(
      <ChemicalPreparation
        stepId="prep-media"
        sterilization={{
          ...base,
          method: "haiter-chemical",
          mediumSterilizationMethod: "haiter-chemical",
          mediumPreparation: {
            method: "haiter-chemical",
            protocolVersion: "haiter-medium-v1",
            status: "planned",
            productName: "Haiter",
            labelConcentration: 6,
            labelBasis: "w/w",
            lockedAt: "2026-08-10T08:00:00.000Z",
          },
        }}
        defaultTargetPpm={120}
        defaultFinalVolumeMl={170}
        onConfirm={async () => {}}
      />,
    );

    expect(html).toContain("cl-atlas-form-section");
    expect(html).toContain("cl-atlas-field-grid");
    expect(html).toContain('aria-live="polite"');
    expect(html).toContain('aria-label="ผลการคำนวณไฮเตอร์"');
    expect(html).not.toContain("<output");
    expect(html).toContain("ค่าจากสูตร ยังไม่ใช่ค่าตรวจ");
    expect(html).toContain("TDS/EC");
    expect(html).not.toMatch(/Primary|Keyboard focus|Destructive|Disabled/);
  });
});
