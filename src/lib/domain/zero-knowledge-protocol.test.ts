import { describe, expect, it } from "vitest";

import type { BeginnerInstruction, ProtocolStep } from "./models";
import {
  beginnerInstructionIssues,
  describeBeginnerMaterial,
  defaultUncertaintyPaths,
  isBeginnerReadyStep,
} from "./zero-knowledge-protocol";

const completeInstruction: BeginnerInstruction = {
  currentAction: "ถ่ายรูปด้านข้างของลำต้น",
  doNotDoYet: ["ยังไม่ตัดต้นไม้"],
  whatToFind: ["มองหาจุดที่ใบงอกจากลำต้น จุดนี้เรียกว่า ข้อ"],
  materials: [
    {
      name: "โทรศัพท์ที่มีกล้อง",
      appearance: "เครื่องที่ใช้ถ่ายรูปตามปกติ",
      purpose: "บันทึกสภาพก่อนเริ่ม",
      quantity: "1 เครื่อง",
      specification: "กล้องโฟกัสและเปิดดูภาพย้อนหลังได้",
      allowedSubstitutes: ["กล้องดิจิทัล"],
    },
  ],
  actions: ["วางต้นไม้ในที่สว่าง", "ถ่ายรูปให้เห็นทั้งต้น"],
  stopConditions: ["หยุดถ้าภาพมืดจนมองไม่เห็นลำต้น"],
  evidencePrompt: ["เก็บรูปที่เห็นทั้งต้นอย่างน้อย 1 รูป"],
  readyChecklist: ["ฉันเห็นลำต้นชัดในรูป", "ฉันยังไม่ได้ตัดต้น"],
  uncertaintyPaths: defaultUncertaintyPaths("ถ่ายรูปใหม่ในที่สว่างกว่าเดิม"),
  scienceNote: "ภาพก่อนเริ่มใช้เปรียบเทียบการเปลี่ยนแปลงภายหลัง",
  glossary: [{ term: "ข้อ", plainMeaning: "จุดที่ก้านใบต่อกับลำต้น" }],
  visualAids: [{ id: "baseline", kind: "process-flow-diagram", title: "ภาพลำดับการถ่ายรูป", caption: "ถ่ายทั้งต้นแล้วถ่ายด้านข้าง", evidenceState: "Adapted", labels: ["จัดแสง", "ถ่ายทั้งต้น", "ตรวจภาพ"] }],
};

const completeStep: ProtocolStep = {
  id: "baseline",
  order: 0,
  title: "บันทึกสภาพต้นไม้ก่อนเริ่ม",
  instruction: "ถ่ายรูปต้นไม้ก่อนเริ่ม",
  durationMinutes: 10,
  criticalControls: [],
  safetyNotes: [],
  referenceIds: [],
  evidenceState: "Adapted",
  beginner: completeInstruction,
};

describe("zero-knowledge protocol contract", () => {
  it("describes a magnifying glass as an inspection tool, not safety goggles", () => {
    const material = describeBeginnerMaterial("แว่นขยาย");
    expect(material.purpose).toContain("ขยายจุดเล็ก");
    expect(material.appearance).not.toContain("บังด้านหน้าและด้านข้าง");
  });

  it("accepts a step that explains every beginner-facing section", () => {
    expect(beginnerInstructionIssues(completeInstruction)).toEqual([]);
    expect(isBeginnerReadyStep(completeStep)).toBe(true);
  });

  it("reports missing physical actions and uncertainty routes", () => {
    const incomplete = {
      ...completeInstruction,
      actions: [],
      uncertaintyPaths: [],
    };

    expect(beginnerInstructionIssues(incomplete)).toEqual([
      "ต้องมีวิธีทำแบบทีละข้อ",
      "ต้องมีทางเลือกเมื่อผู้ใช้ไม่แน่ใจ",
    ]);
  });

  it("provides safe routes that never guess or silently continue", () => {
    const paths = defaultUncertaintyPaths("ถ่ายรูปเพิ่มในที่สว่าง แล้วเทียบกับเกณฑ์บนหน้าจอ");

    expect(paths.map((path) => path.label)).toEqual([
      "ฉันหาไม่เจอ",
      "ฉันไม่แน่ใจ",
      "ฉันไม่มีอุปกรณ์นี้",
    ]);
    expect(paths.every((path) => path.blocksCompletion)).toBe(true);
    expect(paths.every((path) => path.safeAction.length > 0)).toBe(true);
    expect(paths.every((path) => path.selfCheck?.checks.length)).toBe(true);
  });

  it("does not classify a legacy step without beginner guidance as ready", () => {
    expect(isBeginnerReadyStep({ ...completeStep, beginner: undefined })).toBe(false);
  });
});
