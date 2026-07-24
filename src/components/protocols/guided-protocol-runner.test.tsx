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
  it("shows photo evidence controls after the step has an evidence observation", () => {
    const html = renderToStaticMarkup(<GuidedProtocolRunner lotId="LOT-1" protocolId="P-1" versionId="V-1" steps={[step]} runs={[{ id: "run-1", ownerId: "owner-1", lotId: "LOT-1", protocolId: "P-1", versionId: "V-1", stepId: "step-1", status: "Passed", note: "พร้อม", measurements: {}, mediaIds: [], evidenceObservationId: "OBS-STEP-1", observedAt: "2026-07-24T00:00:00.000Z", updatedAt: "2026-07-24T00:00:00.000Z" }]} onSave={vi.fn(async () => undefined)} mediaByStep={{ "step-1": [] }} onMediaUploaded={vi.fn(async () => undefined)} />);
    expect(html).toContain("หลักฐานภาพของขั้นนี้");
    expect(html).toContain("รูปภาพ");
  });
});
