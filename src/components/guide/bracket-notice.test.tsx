import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import type { Dose } from "@/lib/manual/forms/types";
import type { ResolvedStep } from "@/lib/manual/types";
import { BracketNotice } from "./bracket-notice";

const dose: Dose = {
  form: "น้ำยาซักผ้าขาว NaOCl 6%",
  low: 0.8,
  high: 2,
  unit: "%",
  durationMin: [10, 20],
  movesLowerWhen: ["เนื้อด่างมาก"],
  movesHigherWhen: ["ต้นกลางแจ้ง"],
  evidence: { level: "adapted", sourceIds: ["source-pp-2023"] },
};

const base: ResolvedStep = {
  id: "sterilize",
  title: "ฟอกฆ่าเชื้อ",
  summary: "",
  why: "",
  materials: [],
  actions: [],
  passCriteria: [],
  stopConditions: [],
  safetyNotes: [],
  measurements: [],
  evidence: { level: "adapted", sourceIds: ["source-pp-2023"] },
  durationMinutes: null,
  order: 0,
  origin: "core",
};

const withDose: ResolvedStep = { ...base, doses: { "sterilize.dose": dose } };

describe("กล่องบอกว่าต้องทดสอบช่วง", () => {
  it("ขั้นที่ไม่มีค่าช่วง ไม่แสดงอะไร", () => {
    expect(renderToStaticMarkup(<BracketNotice step={base} />)).toBe("");
  });

  it("ขั้นที่มีงานตรงพันธุ์ ไม่แสดงอะไร", () => {
    const step: ResolvedStep = {
      ...withDose,
      evidence: { level: "species-direct", sourceIds: ["source-pp-2023"] },
    };
    expect(renderToStaticMarkup(<BracketNotice step={step} />)).toBe("");
  });

  it("แสดงสามชุดพร้อมค่าที่ต้องใช้", () => {
    const html = renderToStaticMarkup(<BracketNotice step={withDose} />);
    expect(html).toContain("0.8");
    expect(html).toContain("1.4");
    expect(html).toContain("2");
  });

  it("บอกชื่อและรูปแบบของสารที่ใช้จริง ไม่ใช่ตัวเลขลอย ๆ", () => {
    expect(renderToStaticMarkup(<BracketNotice step={withDose} />)).toContain("น้ำยาซักผ้าขาว NaOCl 6%");
  });

  it("บอกตัวแปรที่ทำให้ขยับขึ้นและลง", () => {
    const html = renderToStaticMarkup(<BracketNotice step={withDose} />);
    expect(html).toContain("เนื้อด่างมาก");
    expect(html).toContain("ต้นกลางแจ้ง");
  });

  it("ไม่มีช่องกรอกและไม่มีฟอร์ม เพราะหน้านี้ prerender และอ่านได้โดยไม่ล็อกอิน", () => {
    const html = renderToStaticMarkup(<BracketNotice step={withDose} />);
    expect(html).not.toContain("<input");
    expect(html).not.toContain("<form");
  });
});
