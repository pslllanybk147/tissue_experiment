import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { resolveBySlug } from "@/lib/manual/registry";
import type { DoseValue } from "@/lib/domain/models";
import type { ResolvedStep } from "@/lib/manual/types";
import { StepSections } from "./step-section";

describe("StepSections", () => {
  it("เรียงหัวข้อสำหรับมือใหม่เหมือนกันทุกหน้า และใช้ ol กับคำสั่ง", () => {
    const step = resolveBySlug("violin-variegated")!.steps.find((item) => item.id === "sterilize")!;
    const html = renderToStaticMarkup(<StepSections step={step} />);
    const headings = [...html.matchAll(/<h2[^>]*>(.*?)<\/h2>/g)].map((match) => match[1]);

    expect(headings).toEqual(["ขั้นนี้ต้องได้อะไร", "เตรียมของ", "ทำตามลำดับ", "ทำไปทำไม", "ผ่านเมื่อ", "หยุดเมื่อ"]);
    expect(html).toContain("<ol");
    expect((html.match(/<li/g) ?? []).length).toBeGreaterThanOrEqual(step.actions.length);
    expect(html).toContain("cl-protocol-section");
    expect(html).not.toContain("pl-card");
    expect(html).not.toContain("pl-soft-card");
  });

  it("โหมดทำพับเหตุผลไว้ท้ายสุด แต่ยังเก็บคำสั่งกับเกณฑ์ผ่านไว้กางเหมือนเดิม", () => {
    const step = resolveBySlug("violin-variegated")!.steps.find((item) => item.id === "sterilize")!;
    const html = renderToStaticMarkup(<StepSections step={step} mode="do" />);
    const headings = [...html.matchAll(/<h2[^>]*>(.*?)<\/h2>/g)].map((match) => match[1]);

    expect(headings).toEqual(["ขั้นนี้ต้องได้อะไร", "เตรียมของ", "ทำตามลำดับ", "ผ่านเมื่อ", "หยุดเมื่อ", "ทำไปทำไม"]);
    // เนื้อหายังอยู่ใน DOM ครบ พับไว้เฉย ๆ ไม่ได้ตัดทิ้ง จึงยังค้นในหน้าเจอและอ่านด้วย screen reader ได้
    expect(html).toContain("cl-protocol-section-collapsed");
    expect(html).toContain(step.why.slice(0, 20));
  });

  it("โหมดอ่านกางเหตุผลไว้ตามเดิม ไม่พับ", () => {
    const step = resolveBySlug("violin-variegated")!.steps.find((item) => item.id === "sterilize")!;
    const html = renderToStaticMarkup(<StepSections step={step} mode="read" />);

    expect(html).not.toContain("cl-protocol-section-collapsed");
  });

  it("แสดงความปลอดภัยเป็น alert แต่ไม่สลับลำดับหัวข้อหลัก", () => {
    const step = resolveBySlug("violin-variegated")!.steps.find((item) => item.id === "sterilize")!;
    const html = renderToStaticMarkup(<StepSections step={step} />);
    expect(html).toContain('role="alert"');
    expect(html).toContain("ความปลอดภัย");
  });

  it("แสดงคำสั่งปฏิบัติพร้อมภาชนะ ปริมาณ เวลา และเกณฑ์เสร็จ", () => {
    const step = {
      ...resolveBySlug("violin-variegated")!.steps.find((item) => item.id === "sterilize")!,
      executionInstructions: [
        {
          label: "ล้างรอบที่ 1",
          action: "ย้ายชิ้นพืชจาก S ลงในภาชนะ R1 แล้วเขย่าเบา ๆ",
          quantity: "ภาชนะละ 50 mL",
          container: "R1",
          durationMinutes: 1,
          completion: "ครบ 1 นาทีแล้วเทน้ำทิ้ง",
        },
      ],
    } satisfies ResolvedStep;
    const html = renderToStaticMarkup(<StepSections step={step} />);

    expect(html).toContain("ทำตามลำดับ");
    expect(html).toContain("ล้างรอบที่ 1");
    expect(html).toContain("R1");
    expect(html).toContain("ภาชนะละ 50 mL");
    expect(html).toContain("1 นาที");
    expect(html).toContain("ครบ 1 นาทีแล้วเทน้ำทิ้ง");
  });

  it("เรียง anatomy ของการ์ดปฏิบัติจากเลข หัวข้อ การกระทำ รายละเอียด ผลสำเร็จ และขั้นถัดไป", () => {
    const step = {
      ...resolveBySlug("violin-variegated")!.steps.find((item) => item.id === "sterilize")!,
      executionInstructions: [{
        label: "ล้างภาชนะที่มีชื่อยาวเพื่อทดสอบการตัดบรรทัดภาษาไทยโดยไม่ซ้อนกัน",
        action: "ย้ายชิ้นพืชลงในภาชนะแล้วเขย่าเบา ๆ",
        quantity: "ภาชนะละ 50 mL",
        completion: "ครบเวลาและน้ำล้างใส",
        next: "ย้ายไปล้างรอบถัดไป",
      }],
    } satisfies ResolvedStep;
    const html = renderToStaticMarkup(<StepSections step={step} />);
    const cardStart = html.indexOf("cl-atlas-step-card");
    const numberAt = html.indexOf("execution-instruction-number", cardStart);
    const headingAt = html.indexOf("execution-instruction-title", cardStart);
    const actionAt = html.indexOf("execution-instruction-action", cardStart);
    const detailsAt = html.indexOf("execution-instruction-details", cardStart);
    const completionAt = html.indexOf("execution-instruction-completion", cardStart);
    const nextAt = html.indexOf("execution-instruction-next", cardStart);

    expect(cardStart).toBeGreaterThan(-1);
    expect(numberAt).toBeLessThan(headingAt);
    expect(headingAt).toBeLessThan(actionAt);
    expect(actionAt).toBeLessThan(detailsAt);
    expect(detailsAt).toBeLessThan(completionAt);
    expect(completionAt).toBeLessThan(nextAt);
  });

  it("แยกคำเตือนให้หยุดออกจากการ์ดขั้นตอนเป็น semantic notice", () => {
    const step = resolveBySlug("violin-variegated")!.steps.find((item) => item.id === "sterilize")!;
    const html = renderToStaticMarkup(<StepSections step={step} />);
    const cardsEnd = html.indexOf("ทำไปทำไม");
    const stopNotice = html.indexOf("เงื่อนไขให้หยุดทันที");

    expect(cardsEnd).toBeGreaterThan(-1);
    expect(stopNotice).toBeGreaterThan(cardsEnd);
    expect(html).toContain('role="alert"');
  });

  it("คำสั่ง tone stop แบบ static แสดง note ที่มีสัญลักษณ์และข้อความโดยไม่ประกาศ alert ตอนโหลดหน้า", () => {
    const base = resolveBySlug("violin-variegated")!.steps.find((item) => item.id === "sterilize")!;
    const step = {
      ...base,
      executionInstructions: [{
        label: "หยุดตรวจชิ้นพืช",
        action: "หยุดทันทีเมื่อชิ้นพืชซีดขาว",
        tone: "stop" as const,
        quantity: "หนึ่งชิ้นต่อครั้ง",
        completion: "แยกชิ้นที่ผิดปกติออกแล้ว",
      }],
    } satisfies ResolvedStep;
    const html = renderToStaticMarkup(<StepSections step={step} />);
    const actionStart = html.indexOf('class="execution-instruction-action"');
    const actionEnd = html.indexOf('class="execution-instruction-details"', actionStart);
    const action = html.slice(actionStart, actionEnd);

    expect(action).toContain('role="note"');
    expect(action).not.toContain('role="alert"');
    expect(action).not.toContain("aria-live");
    expect(action).toContain('data-tone="blocked"');
    expect(action).toContain('aria-hidden="true"');
    expect(action).toContain("หยุดก่อน");
    expect(action).toContain("หยุดทันทีเมื่อชิ้นพืชซีดขาว");
  });

  it("แสดงปริมาณสารฆ่าเชื้อที่เครื่องคำนวณเพิ่งคำนวณได้ใน instruction", () => {
    const base = resolveBySlug("pink-princess")!.steps.find((item) => item.id === "prep-media")!;
    const html = renderToStaticMarkup(
      <StepSections
        step={{
          ...base,
          executionInstructions: [{
            label: "ฆ่าเชื้ออาหารด้วย Haiter",
            action: "เติม Haiter ลงในอาหาร",
            materials: ["Haiter"],
          }],
        }}
        chemicalDose={{ value: 4.25, unit: "mL" } satisfies DoseValue}
      />,
    );

    expect(html).toContain("4.25 mL");
  });

  it("ไม่ครอบ term help แบบ block ด้วย paragraph ที่ทำให้ hydration ผิด", () => {
    const base = resolveBySlug("violin-variegated")!.steps.find((item) => item.id === "sterilize")!;
    const html = renderToStaticMarkup(
      <StepSections step={{ ...base, summary: "ล้างด้วย[[sterile-water|น้ำปลอดเชื้อ]]" }} />,
    );

    expect(html).toContain("<details");
    expect(html).toContain('<div class="pl-lede" style="margin-top:8px"><span>ล้างด้วย</span><details');
  });
});
