import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { resolveBySlug } from "@/lib/manual/registry";
import { StepSections } from "./step-section";

describe("StepSections", () => {
  it("เรียงหัวข้อสำหรับมือใหม่เหมือนกันทุกหน้า และใช้ ol กับคำสั่ง", () => {
    const step = resolveBySlug("violin-variegated")!.steps.find((item) => item.id === "sterilize")!;
    const html = renderToStaticMarkup(<StepSections step={step} />);
    const headings = [...html.matchAll(/<h2[^>]*>(.*?)<\/h2>/g)].map((match) => match[1]);

    expect(headings).toEqual(["ขั้นนี้ต้องได้อะไร", "เตรียมของ", "ทำทีละข้อ", "ทำไปทำไม", "ผ่านเมื่อ", "หยุดเมื่อ"]);
    expect(html).toContain("<ol");
    expect((html.match(/<li/g) ?? []).length).toBeGreaterThanOrEqual(step.actions.length);
  });

  it("แสดงความปลอดภัยเป็น alert แต่ไม่สลับลำดับหัวข้อหลัก", () => {
    const step = resolveBySlug("violin-variegated")!.steps.find((item) => item.id === "sterilize")!;
    const html = renderToStaticMarkup(<StepSections step={step} />);
    expect(html).toContain('role="alert"');
    expect(html).toContain("ความปลอดภัย");
  });
});
