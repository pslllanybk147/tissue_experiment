import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { resolveBySlug } from "@/lib/manual/registry";
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

  it("ไม่ครอบ term help แบบ block ด้วย paragraph ที่ทำให้ hydration ผิด", () => {
    const base = resolveBySlug("violin-variegated")!.steps.find((item) => item.id === "sterilize")!;
    const html = renderToStaticMarkup(
      <StepSections step={{ ...base, summary: "ล้างด้วย[[sterile-water|น้ำปลอดเชื้อ]]" }} />,
    );

    expect(html).toContain("<details");
    expect(html).toContain('<div class="pl-lede" style="margin-top:8px"><span>ล้างด้วย</span><details');
  });
});
