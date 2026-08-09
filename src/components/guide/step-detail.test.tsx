import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { CalculatorOverlayProvider } from "@/components/nav/calculator-overlay-context";
import { resolveBySlug } from "@/lib/manual/registry";
import type { ResolvedManual, ResolvedStep } from "@/lib/manual/types";
import { StepDetail } from "./step-detail";

const manual = resolveBySlug("pink-princess")!;
const sterilize = manual.steps.find((step) => step.id === "sterilize")!;
const first = manual.steps[0];
const last = manual.steps[manual.steps.length - 1];

// StepDetail render BracketNotice ซึ่งใช้ useCalculatorOverlay() ตั้งแต่เพิ่มปุ่มเปิดเครื่องคำนวณ
// จึงต้อง render ผ่าน provider เสมอ เหมือนที่ระบบจริง mount ไว้ให้ใน guide-shell.tsx
function renderStep(step: ResolvedStep, forManual: ResolvedManual = manual) {
  return renderToStaticMarkup(
    <CalculatorOverlayProvider>
      <StepDetail manual={forManual} step={step} />
    </CalculatorOverlayProvider>,
  );
}

describe("StepDetail", () => {
  it("แสดงหมายเลขขั้นแบบเริ่มจาก 1 พร้อมชื่อและเหตุผล", () => {
    const html = renderStep(sterilize);

    expect(html).toContain("ขั้นที่ 8 จาก 15");
    expect(html).toContain("ฟอกฆ่าเชื้อ");
    expect(html).toContain("ฟอกอ่อนไปจะมีเชื้อขึ้น");
  });

  it("แสดงสิ่งที่ต้องลงมือ เกณฑ์ผ่าน และจุดที่ต้องหยุด", () => {
    const html = renderStep(sterilize);

    expect(html).toContain("ทำตามลำดับ");
    expect(html).toContain("ผ่านเมื่อ");
    expect(html).toContain("หยุดเมื่อ");
  });

  it("เตือนความปลอดภัยก่อนรายการลงมือทำ", () => {
    const html = renderStep(sterilize);

    expect(html.indexOf("แอมโมเนีย")).toBeLessThan(html.indexOf("ทำตามลำดับ"));
  });

  it("มีภาพประกอบของขั้นนั้น", () => {
    const html = renderStep(sterilize);

    expect(html).toContain("<svg");
  });

  it("แสดงอาการที่อาจเจอ พร้อมวิธีแยกสาเหตุและสิ่งที่ต้องทำต่อ", () => {
    const html = renderStep(sterilize);

    expect(html).toContain("ถ้าเจออาการแบบนี้");
    expect(html).toContain("วิธีแยกจากอาการที่คล้ายกัน");
    expect(html).toContain("ซีดขาว");
    expect(html).toContain("ควิโนน");
  });

  it("ไม่แสดงหัวข้ออาการในขั้นที่ไม่มีอาการผูกไว้", () => {
    const receive = manual.steps.find((step) => step.id === "receive")!;
    const html = renderStep(receive);

    expect(html).not.toContain("ถ้าเจออาการแบบนี้");
  });

  it("ขั้นทำอาหารมีเครื่องคำนวณ ส่วนขั้นอื่นไม่มี", () => {
    const prep = manual.steps.find((item) => item.id === "prep-media")!;
    const withCalculator = renderStep(prep);
    const without = renderStep(sterilize);

    expect(withCalculator).toContain("จะทำอาหารเท่าไหร่");
    expect(without).not.toContain("จะทำอาหารเท่าไหร่");
  });

  it("ขั้นฟอกมีเครื่องคำนวณปริมาณ Haiter อยู่ในหน้าปฏิบัติเดียวกัน", () => {
    const html = renderStep(sterilize);

    expect(html).toContain("ไฮเตอร์ / สารฟอกฆ่าเชื้อ");
    expect(html).toContain("ความเข้มข้นบนฉลากขวด");
    expect(html).toContain("ปริมาณที่ต้องใช้จะแสดงในเครื่องคำนวณ");
  });

  it("ไม่มีปุ่มย้อนกลับที่ขั้นแรก และไม่มีปุ่มถัดไปที่ขั้นสุดท้าย", () => {
    const firstHtml = renderStep(first);
    const lastHtml = renderStep(last);

    expect(firstHtml).not.toContain("/step/0");
    expect(firstHtml).toContain("/step/2");
    expect(lastHtml).toContain("/step/14");
    expect(lastHtml).not.toContain("/step/15");
  });
});
