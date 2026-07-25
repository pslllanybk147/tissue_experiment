import { describe, expect, it } from "vitest";

import { validateProtocolDraft } from "./protocol-validation";

describe("validateProtocolDraft", () => {
  it("requires metadata and at least one step", () => {
    expect(validateProtocolDraft({ title: "", plantScope: "", evidenceState: "Pending review", summary: "", changeNote: "", steps: [] })).toEqual({
      title: "กรุณาระบุชื่อ Protocol",
      plantScope: "กรุณาระบุขอบเขตพืช",
      steps: "ต้องมีอย่างน้อย 1 ขั้นตอน",
    });
  });

  it("rejects invalid step content and duplicate ids", () => {
    const errors = validateProtocolDraft({ title: "Nodal", plantScope: "Philodendron", evidenceState: "Adapted", summary: "", changeNote: "", steps: [
      { id: "s1", order: 0, title: "", instruction: "", durationMinutes: -1, criticalControls: [], safetyNotes: [], referenceIds: [], evidenceState: "Adapted" },
      { id: "s1", order: 0, title: "Two", instruction: "Do", durationMinutes: null, criticalControls: [], safetyNotes: [], referenceIds: [], evidenceState: "Adapted" },
    ] });
    expect(errors.steps).toContain("รหัสขั้นตอนซ้ำ");
    expect(errors.stepFields?.s1).toContain("ระยะเวลา");
  });

  it("rejects a beginner protocol step that omits safe physical guidance", () => {
    const errors = validateProtocolDraft({
      title: "Beginner nodal",
      plantScope: "Philodendron",
      evidenceState: "Adapted",
      summary: "",
      changeNote: "",
      steps: [{
        id: "s1",
        order: 0,
        title: "เลือกข้อ",
        instruction: "เลือก node ที่เหมาะสม",
        durationMinutes: null,
        criticalControls: [],
        safetyNotes: [],
        referenceIds: [],
        evidenceState: "Adapted",
        beginner: {
          currentAction: "เลือกข้อ",
          doNotDoYet: [],
          whatToFind: [],
          materials: [],
          actions: [],
          stopConditions: [],
          evidencePrompt: [],
          readyChecklist: [],
          uncertaintyPaths: [],
          scienceNote: "",
        },
      }],
    });

    expect(errors.stepFields?.s1).toContain("มือใหม่");
  });
});
