import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import type { BeginnerInstruction } from "@/lib/domain/models";
import { BeginnerStepGuide } from "./beginner-step-guide";

const instruction: BeginnerInstruction = {
  currentAction: "ถ่ายรูปต้นไม้",
  doNotDoYet: ["ยังไม่ตัดต้นไม้"],
  whatToFind: ["มองหาลำต้นและจุดที่ใบงอก"],
  materials: [{
    name: "โทรศัพท์",
    appearance: "เครื่องที่ใช้ถ่ายรูป",
    purpose: "เก็บภาพก่อนเริ่ม",
  }],
  actions: ["วางต้นไม้ในที่สว่าง", "ถ่ายรูปด้านข้าง"],
  stopConditions: ["หยุดถ้าภาพมืด"],
  evidencePrompt: ["เก็บรูปที่เห็นลำต้น"],
  readyChecklist: ["เห็นลำต้นชัด"],
  uncertaintyPaths: [{
    id: "not-sure",
    label: "ฉันไม่แน่ใจ",
    safeAction: "หยุดและถ่ายรูปเพิ่ม",
    blocksCompletion: true,
  }],
  scienceNote: "ภาพนี้ใช้เปรียบเทียบภายหลัง",
};

describe("BeginnerStepGuide", () => {
  it("renders the physical guidance in the order a new user needs it", () => {
    const html = renderToStaticMarkup(
      <BeginnerStepGuide
        instruction={instruction}
        onReadinessChange={() => undefined}
        onUncertainty={() => undefined}
      />,
    );
    const labels = [
      "ตอนนี้กำลังทำอะไร",
      "ตอนนี้ยังห้ามทำอะไร",
      "สิ่งที่ต้องมองหา",
      "ของที่ต้องหยิบ",
      "ทำทีละข้อ",
      "หยุดทันทีถ้า",
      "บันทึกอะไรไว้",
      "ตรวจว่าพร้อมไปต่อหรือยัง",
      "ถ้ายังไม่แน่ใจ",
      "เหตุผลทางวิทยาศาสตร์",
    ];
    const indexes = labels.map((label) => html.indexOf(label));

    expect(indexes.every((index) => index >= 0)).toBe(true);
    expect(indexes).toEqual([...indexes].sort((left, right) => left - right));
  });

  it("shows appearance and purpose instead of only naming equipment", () => {
    const html = renderToStaticMarkup(
      <BeginnerStepGuide
        instruction={instruction}
        onReadinessChange={() => undefined}
        onUncertainty={() => undefined}
      />,
    );

    expect(html).toContain("เครื่องที่ใช้ถ่ายรูป");
    expect(html).toContain("เก็บภาพก่อนเริ่ม");
  });
});
