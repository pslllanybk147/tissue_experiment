import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import type { ProtocolStep } from "@/lib/domain/models";
import { GuidedProtocolRunner } from "./guided-protocol-runner";

const step: ProtocolStep = {
  id: "step-1",
  order: 1,
  title: "บันทึก baseline",
  instruction: "ถ่ายภาพต้นแม่",
  durationMinutes: null,
  criticalControls: [],
  safetyNotes: [],
  referenceIds: [],
  evidenceState: "Adapted",
  objective: "เก็บภาพก่อนทดลอง",
  allowPhoto: true,
};

describe("GuidedProtocolRunner photo evidence", () => {
  it("separates the readable manual from the step record", () => {
    const html = renderToStaticMarkup(
      <GuidedProtocolRunner
        lotId="LOT-1"
        protocolId="P-1"
        versionId="V-1"
        steps={[step]}
        runs={[]}
        onSave={vi.fn(async () => undefined)}
      />,
    );
    expect(html).toContain("1. อ่านคู่มือ");
    expect(html).toContain("2. บันทึกผลขั้นนี้");
    expect(html).toContain("อ่านจบแล้ว ไปบันทึกผลขั้นนี้");
  });

  it("shows a do-not-cut warning while the readiness gate is ahead", () => {
    const html = renderToStaticMarkup(
      <GuidedProtocolRunner
        lotId="LOT-1"
        protocolId="P-1"
        versionId="V-1"
        steps={[
          step,
          { ...step, id: "ready", workflowPhase: "readiness", title: "ตรวจความพร้อม" },
          { ...step, id: "cut", workflowPhase: "explant-cut", title: "ตัด explant" },
        ]}
        runs={[]}
        onSave={vi.fn(async () => undefined)}
      />,
    );
    expect(html).toContain("อย่าเพิ่งตัดต้นไม้");
    expect(html).toContain("อาหารและพื้นที่พร้อม");
  });

  it("renders Thai completion state labels", () => {
    const html = renderToStaticMarkup(
      <GuidedProtocolRunner
        lotId="LOT-1"
        protocolId="P-1"
        versionId="V-1"
        steps={[step]}
        runs={[]}
        onSave={vi.fn(async () => undefined)}
      />,
    );
    expect(html).toContain('aria-label="ผ่าน"');
    expect(html).toContain('aria-label="ต้องตรวจเพิ่ม"');
    expect(html).toContain('aria-label="ไม่ผ่าน"');
  });

  it("gates the next step until the current step is saved", () => {
    const html = renderToStaticMarkup(<GuidedProtocolRunner lotId="LOT-1" protocolId="P-1" versionId="V-1" steps={[step, { ...step, id: "step-2", title: "ขั้นถัดไป" }]} runs={[]} onSave={vi.fn(async () => undefined)} />);
    expect(html).toContain("บันทึกผลขั้นนี้ก่อน จึงจะไปขั้นถัดไปได้");
    expect(html).toMatch(/disabled=""[^>]*>ไปขั้นถัดไป/);
  });

  it("does not recommend the next step for Needs review", () => {
    const html = renderToStaticMarkup(<GuidedProtocolRunner lotId="LOT-1" protocolId="P-1" versionId="V-1" steps={[step, { ...step, id: "step-2", title: "ขั้นถัดไป" }]} runs={[{ id: "run-1", ownerId: "owner-1", lotId: "LOT-1", protocolId: "P-1", versionId: "V-1", stepId: "step-1", status: "Needs review", note: "ยังไม่ชัดเจน", measurements: {}, mediaIds: [], observedAt: "2026-07-24T00:00:00.000Z", updatedAt: "2026-07-24T00:00:00.000Z" }]} onSave={vi.fn(async () => undefined)} />);
    expect(html).toContain("ขั้นนี้ต้องตรวจเพิ่มหรือแก้ไขก่อน");
    expect(html).toMatch(/disabled=""[^>]*>ไปขั้นถัดไป/);
  });

  it("shows photo evidence controls after the step has an evidence observation", () => {
    const html = renderToStaticMarkup(<GuidedProtocolRunner lotId="LOT-1" protocolId="P-1" versionId="V-1" steps={[step]} runs={[{ id: "run-1", ownerId: "owner-1", lotId: "LOT-1", protocolId: "P-1", versionId: "V-1", stepId: "step-1", status: "Passed", note: "พร้อม", measurements: {}, mediaIds: [], evidenceObservationId: "OBS-STEP-1", observedAt: "2026-07-24T00:00:00.000Z", updatedAt: "2026-07-24T00:00:00.000Z" }]} onSave={vi.fn(async () => undefined)} mediaByStep={{ "step-1": [] }} onMediaUploaded={vi.fn(async () => undefined)} />);
    expect(html).toContain("หลักฐานภาพของขั้นนี้");
    expect(html).toContain("เลือกหรือถ่ายรูปของขั้นนี้");
    expect(html).toContain("อัปโหลดรูปที่เลือก");
  });

  it("renders the Haiter calculator beside the calculation instruction", () => {
    const html = renderToStaticMarkup(
      <GuidedProtocolRunner
        haiterDefaults={{
          labelPercent: 6,
          targetPercent: 0.003,
          mediumVolumeMl: 100,
          minimumToolVolumeMl: 0.1,
        }}
        lotId="LOT-1"
        protocolId="P-1"
        versionId="V-1"
        steps={[{
          ...step,
          id: "calculate-haiter-dose",
          title: "ให้ระบบหาปริมาตร Haiter ที่ต้องใช้",
          measurements: [
            { id: "haiter-source-percent", label: "เปอร์เซ็นต์จากฉลาก Haiter", unit: "%", required: true },
            { id: "medium-volume-ml", label: "ปริมาตรอาหารทั้งหมด", unit: "mL", required: true },
            { id: "minimum-tool-volume-ml", label: "ปริมาตรต่ำสุดที่อุปกรณ์ตวงได้", unit: "mL", required: true },
          ],
        }]}
        runs={[]}
        onSave={vi.fn(async () => undefined)}
      />,
    );

    expect(html).toContain("กรอกตัวเลข 3 ช่องนี้");
    expect(html).toContain("เปอร์เซ็นต์จากฉลาก Haiter");
    expect(html).toContain("ปริมาตรอาหารทั้งหมด");
    expect(html).toContain("ปริมาตรต่ำสุดที่อุปกรณ์ตวงได้");
    expect(html).toContain("เตรียมสารไฮเตอร์เจือจาง 10 เท่าก่อน");
  });
});
