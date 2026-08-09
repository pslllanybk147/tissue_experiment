import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { CalculatorOverlayProvider } from "@/components/nav/calculator-overlay-context";
import type { Dose } from "@/lib/manual/forms/types";
import type { ResolvedStep } from "@/lib/manual/types";
import { BracketNotice } from "./bracket-notice";

// ใช้ useCalculatorOverlay() ตั้งแต่เพิ่มปุ่มเปิดเครื่องคำนวณ จึงต้อง render ผ่าน provider เสมอ
// เหมือนที่ระบบจริง mount ไว้ให้ใน guide-shell.tsx
function withProvider(step: ResolvedStep) {
  return renderToStaticMarkup(
    <CalculatorOverlayProvider>
      <BracketNotice step={step} />
    </CalculatorOverlayProvider>,
  );
}

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
    expect(withProvider(base)).toBe("");
  });

  it("ขั้นที่มีงานตรงพันธุ์ ไม่แสดงอะไร", () => {
    const step: ResolvedStep = {
      ...withDose,
      evidence: { level: "species-direct", sourceIds: ["source-pp-2023"] },
    };
    expect(withProvider(step)).toBe("");
  });

  it("แสดงสามชุดพร้อมค่าที่ต้องใช้", () => {
    const html = withProvider(withDose);
    expect(html).toContain("0.8");
    expect(html).toContain("1.4");
    expect(html).toContain("2");
  });

  it("บอกชื่อและรูปแบบของสารที่ใช้จริง ไม่ใช่ตัวเลขลอย ๆ", () => {
    expect(withProvider(withDose)).toContain("น้ำยาซักผ้าขาว NaOCl 6%");
  });

  it("บอกตัวแปรที่ทำให้ขยับขึ้นและลง", () => {
    const html = withProvider(withDose);
    expect(html).toContain("เนื้อด่างมาก");
    expect(html).toContain("ต้นกลางแจ้ง");
  });

  it("ไม่มีช่องกรอกและไม่มีฟอร์ม เพราะหน้านี้ prerender และอ่านได้โดยไม่ล็อกอิน", () => {
    const html = withProvider(withDose);
    expect(html).not.toContain("<input");
    expect(html).not.toContain("<form");
  });

  it("dose ที่ไม่ตั้ง method ไม่แสดงปุ่มเปิดเครื่องคำนวณ", () => {
    const html = withProvider(withDose);
    expect(html).not.toContain("เปิดเครื่องคำนวณ");
  });

  it("dose ที่ตั้ง method แสดงปุ่มเปิดเครื่องคำนวณที่ตรงกัน", () => {
    const withMethod: ResolvedStep = {
      ...base,
      doses: { "sterilize.dose.nadcc": { ...dose, method: "nadcc" } },
    };
    const html = withProvider(withMethod);
    expect(html).toContain("เปิดเครื่องคำนวณ");
    expect(html).toContain("NaDCC");
  });

  it("durationMin ต้น-ปลายเท่ากัน (เช่นน้ำ rinse 1 นาทีเป๊ะ) ไม่แสดงเป็น 'X ถึง X' ที่อ่านเหมือนพิมพ์ผิด", () => {
    const oneMinuteRinse: ResolvedStep = {
      ...base,
      doses: { "sterilize.dose.nadcc": { ...dose, durationMin: [1, 1], method: "nadcc" } },
    };
    const html = withProvider(oneMinuteRinse);
    expect(html).toContain("แช่นาน 1 นาที");
    expect(html).not.toContain("1 ถึง 1");
  });
});
