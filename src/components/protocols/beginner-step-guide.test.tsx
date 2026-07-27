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
    selfCheck: { title: "ตรวจภาพใหม่", checks: ["เพิ่มแสง", "ถ่ายสองมุม"], passCriteria: ["เห็นลำต้นชัด"], resolutionAction: "กลับไปทำขั้นนี้ใหม่", failAction: "หยุดและถ่ายใหม่", requiredEvidence: ["photo"] },
  }],
  scienceNote: "ภาพนี้ใช้เปรียบเทียบภายหลัง",
  visualAids: [{
    id: "node",
    kind: "node-cut-diagram",
    title: "ภาพจำลองข้อและแนวตัด",
    caption: "ห้ามตัดผ่านตาข้าง",
    evidenceState: "Adapted",
    sourceLabel: "แหล่งอ้างอิง",
    sourceUrl: "https://example.com/reference",
  }],
  glossary: [{ term: "ลำต้น", plainMeaning: "แกนหลักที่ใบและข้อเชื่อมต่ออยู่" }],
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
      "เป้าหมายของขั้นนี้",
      "ก่อนเริ่ม",
      "ข้อมูลหรือผลที่ต้องตรวจ",
      "ภาพประกอบของขั้นนี้",
      "อุปกรณ์และสารที่ใช้",
      "คำศัพท์ที่ใช้ในขั้นนี้",
      "<h4>วิธีทำ</h4>",
      "หยุดและตรวจสอบใหม่เมื่อ",
      "หลักฐานที่ควรบันทึก",
      "ตรวจว่าพร้อมไปต่อหรือยัง",
      "ถ้ายังไม่แน่ใจ",
      "เหตุผลทางวิทยาศาสตร์",
    ];
    const indexes = labels.map((label) => html.indexOf(label));

    expect(indexes.every((index) => index >= 0)).toBe(true);
    expect(indexes).toEqual([...indexes].sort((left, right) => left - right));
  });

  it("shows an original diagram, its limitation, and its reference link", () => {
    const html = renderToStaticMarkup(
      <BeginnerStepGuide
        instruction={instruction}
        onReadinessChange={() => undefined}
        onUncertainty={() => undefined}
      />,
    );

    expect(html).toContain("ภาพจำลองเพื่อช่วยหาตำแหน่ง");
    expect(html).toContain("แนวตัดใต้ข้อ");
    expect(html).toContain("https://example.com/reference");
    expect(html).toContain("Adapted");
  });

  it("presents equipment specifications without the old appearance boilerplate labels", () => {
    const html = renderToStaticMarkup(
      <BeginnerStepGuide
        instruction={instruction}
        onReadinessChange={() => undefined}
        onUncertainty={() => undefined}
      />,
    );

    expect(html).toContain("โทรศัพท์");
    expect(html).not.toContain("หน้าตา:");
    expect(html).not.toContain("ใช้เพื่อ:");
    expect(html).not.toContain("เก็บภาพก่อนเริ่ม");
    expect(html).toContain("เตรียม:");
    expect(html).toContain("1 เครื่อง");
    expect(html).toContain("ต้องเป็นแบบนี้:");
    expect(html).toContain("ใช้แทนได้เฉพาะ");
  });
});
