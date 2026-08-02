import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { resolveBySlug } from "@/lib/manual/registry";
import { StepDetail } from "./step-detail";

const manual = resolveBySlug("pink-princess")!;
const sterilize = manual.steps.find((step) => step.id === "sterilize")!;
const first = manual.steps[0];
const last = manual.steps[manual.steps.length - 1];

describe("StepDetail", () => {
  it("แสดงหมายเลขขั้นแบบเริ่มจาก 1 พร้อมชื่อและเหตุผล", () => {
    const html = renderToStaticMarkup(<StepDetail manual={manual} step={sterilize} />);

    expect(html).toContain("ขั้นที่ 7 จาก 14");
    expect(html).toContain("ฟอกฆ่าเชื้อ");
    expect(html).toContain("ฟอกอ่อนไปจะมีเชื้อขึ้น");
  });

  it("แสดงสิ่งที่ต้องลงมือ เกณฑ์ผ่าน และจุดที่ต้องหยุด", () => {
    const html = renderToStaticMarkup(<StepDetail manual={manual} step={sterilize} />);

    expect(html).toContain("ลงมือทำ");
    expect(html).toContain("ผ่านเมื่อ");
    expect(html).toContain("หยุดทันทีถ้า");
  });

  it("เตือนความปลอดภัยก่อนรายการลงมือทำ", () => {
    const html = renderToStaticMarkup(<StepDetail manual={manual} step={sterilize} />);

    expect(html.indexOf("แอมโมเนีย")).toBeLessThan(html.indexOf("ลงมือทำ"));
  });

  it("มีภาพประกอบของขั้นนั้น", () => {
    const html = renderToStaticMarkup(<StepDetail manual={manual} step={sterilize} />);

    expect(html).toContain("<svg");
  });

  it("แสดงอาการที่อาจเจอ พร้อมวิธีแยกสาเหตุและสิ่งที่ต้องทำต่อ", () => {
    const html = renderToStaticMarkup(<StepDetail manual={manual} step={sterilize} />);

    expect(html).toContain("ถ้าเจออาการแบบนี้");
    expect(html).toContain("วิธีแยกจากอาการที่คล้ายกัน");
    expect(html).toContain("ซีดขาว");
    expect(html).toContain("ควิโนน");
  });

  it("ไม่แสดงหัวข้ออาการในขั้นที่ไม่มีอาการผูกไว้", () => {
    const receive = manual.steps.find((step) => step.id === "receive")!;
    const html = renderToStaticMarkup(<StepDetail manual={manual} step={receive} />);

    expect(html).not.toContain("ถ้าเจออาการแบบนี้");
  });

  it("ไม่มีปุ่มย้อนกลับที่ขั้นแรก และไม่มีปุ่มถัดไปที่ขั้นสุดท้าย", () => {
    const firstHtml = renderToStaticMarkup(<StepDetail manual={manual} step={first} />);
    const lastHtml = renderToStaticMarkup(<StepDetail manual={manual} step={last} />);

    expect(firstHtml).not.toContain("/step/0");
    expect(firstHtml).toContain("/step/2");
    expect(lastHtml).toContain("/step/13");
    expect(lastHtml).not.toContain("/step/15");
  });
});
