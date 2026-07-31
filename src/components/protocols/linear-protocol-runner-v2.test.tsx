import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import type { ProtocolStep, ProtocolStepRun } from "@/lib/domain/models";
import { LinearProtocolRunnerV2 } from "./linear-protocol-runner-v2";

const step: ProtocolStep = {
  id: "v2-blank-48h",
  order: 7,
  title: "รอตรวจ Blank 48 ชั่วโมง",
  instruction: "วาง Blank แล้วเริ่มเวลา",
  durationMinutes: 2880,
  criticalControls: ["ห้ามเปิดฝา"],
  safetyNotes: [],
  referenceIds: ["source-1"],
  evidenceState: "Experimental",
  objective: "ตรวจอาหารก่อนตัดต้น",
  requiredEvidence: [],
  allowPhoto: false,
  allowNote: true,
  beginner: {
    currentAction: "ตรวจอาหารก่อนตัดต้น",
    doNotDoYet: ["ห้ามตัดต้น"],
    whatToFind: ["อาหารใส"],
    materials: [],
    actions: ["วางกระปุก Blank โดยไม่เปิดฝา", "กดเริ่มจับเวลา 48 ชั่วโมง"],
    stopConditions: ["พบฝ้าหรือเส้นใย"],
    evidencePrompt: [],
    readyChecklist: ["ครบ 48 ชั่วโมง", "อาหารใส"],
    uncertaintyPaths: [],
    scienceNote: "Blank ใช้แยกปัญหาจากอาหารและภาชนะ",
  },
};

const passedRun: ProtocolStepRun = {
  id: "run-1",
  ownerId: "owner-1",
  lotId: "LOT-1",
  protocolId: "P-1",
  versionId: "V-1",
  stepId: step.id,
  status: "Passed",
  note: "",
  measurements: {},
  mediaIds: [],
  observedAt: "2026-07-31T00:00:00.000Z",
  updatedAt: "2026-07-31T00:00:00.000Z",
  completedAt: "2026-08-02T00:00:00.000Z",
};

describe("LinearProtocolRunnerV2", () => {
  it("shows one numbered task without legacy tabs, photos, or result radios", () => {
    const html = renderToStaticMarkup(
      <LinearProtocolRunnerV2
        lotId="LOT-1"
        protocolId="P-1"
        versionId="V-1"
        steps={[step]}
        runs={[]}
        onSave={vi.fn(async () => undefined)}
        onSaveMany={vi.fn(async () => undefined)}
      />,
    );

    expect(html).toContain("ขั้นที่ 1 จาก 1");
    expect(html).toContain("ทำตามนี้ทีละข้อ");
    expect(html).toContain("ฉันพบปัญหา");
    expect(html).toContain("ทำขั้นนี้เสร็จแล้ว");
    expect(html).toContain("ฉันทำขั้นนี้ไว้แล้ว");
    expect(html).toContain("ตั้งจุดเริ่มต่อ");
    expect(html).not.toContain("อ่านคู่มือ");
    expect(html).not.toContain("บันทึกผลขั้นนี้");
    expect(html).not.toContain("หลักฐานภาพ");
    expect(html).not.toContain('type="radio"');
    expect(html).not.toContain('type="file"');
    expect(html).toContain('aria-expanded="false"');
    expect(html).toMatch(/<ol[^>]*hidden=""[^>]*id="linear-step-list"/);
  });

  it("shows a persistent timer action for timed steps", () => {
    const html = renderToStaticMarkup(
      <LinearProtocolRunnerV2
        lotId="LOT-1"
        protocolId="P-1"
        versionId="V-1"
        steps={[step]}
        runs={[]}
        onSave={vi.fn(async () => undefined)}
        onSaveMany={vi.fn(async () => undefined)}
      />,
    );

    expect(html).toContain("เริ่มจับเวลา 48 ชั่วโมง");
    expect(html).toContain("ยังทำขั้นนี้เสร็จไม่ได้จนกว่า Timer จะครบ");
  });

  it("resumes at the first unfinished step when earlier work is already complete", () => {
    const html = renderToStaticMarkup(
      <LinearProtocolRunnerV2
        lotId="LOT-1"
        protocolId="P-1"
        versionId="V-1"
        steps={[step, { ...step, id: "v2-next", order: 8, title: "ขั้นถัดไป", durationMinutes: null }]}
        runs={[passedRun]}
        onSave={vi.fn(async () => undefined)}
        onSaveMany={vi.fn(async () => undefined)}
      />,
    );

    expect(html).toContain("ขั้นที่ 2 จาก 2");
    expect(html).toContain("ขั้นถัดไป");
  });

  it("keeps evidence details collapsed and out of the action copy", () => {
    const html = renderToStaticMarkup(
      <LinearProtocolRunnerV2
        lotId="LOT-1"
        protocolId="P-1"
        versionId="V-1"
        steps={[step]}
        runs={[]}
        onSave={vi.fn(async () => undefined)}
        onSaveMany={vi.fn(async () => undefined)}
      />,
    );

    expect(html).toContain("ที่มาของคำแนะนำและข้อจำกัด");
    expect(html).toContain("<details");
    expect(html).not.toContain("evidence-label");
  });

  it("shows the saved Lot recipe inside the medium preparation step", () => {
    const html = renderToStaticMarkup(
      <LinearProtocolRunnerV2
        lotId="LOT-1"
        protocolId="P-1"
        versionId="V-1"
        steps={[{ ...step, id: "v2-prepare-medium", title: "เตรียมอาหาร", durationMinutes: null }]}
        runs={[]}
        onSave={vi.fn(async () => undefined)}
        onSaveMany={vi.fn(async () => undefined)}
        recipePlan={{
          title: "Establishment · ตั้งต้น",
          evidenceState: "Adapted",
          volumeMl: 110,
          pH: "5.7–5.8",
          ingredients: [
            { name: "MS basal salts", amount: 1, unit: "×" },
            { name: "Sucrose", amount: 3.3, unit: "g" },
          ],
        }}
      />,
    );

    expect(html).toContain("สูตรที่ใช้จริงใน LOT นี้");
    expect(html).toContain("เตรียมทั้งหมด 110 mL");
    expect(html).toContain("Establishment · ตั้งต้น");
  });
});
