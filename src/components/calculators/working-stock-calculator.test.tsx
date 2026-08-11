import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { WorkingStockCalculator } from "./working-stock-calculator";

describe("WorkingStockCalculator", () => {
  it("บล็อกเมื่อกรอกมวลเป็น 0", () => {
    const html = renderToStaticMarkup(<WorkingStockCalculator initialInput={{ requiredMassMg: 0 }} />);

    expect(html).toContain("ตัวเลขทุกช่องต้องมากกว่า 0");
    expect(html).toContain("ตรวจหน่วยบนฉลากและกรอกมวลเป็น mg ส่วนความเข้มข้นเป็น mg/mL");
  });

  it("ตวงตรงได้เมื่อโดสไม่ต่ำกว่าเครื่องมือ (มวล 5mg เข้มข้น 1mg/mL ตวงขั้นต่ำ 0.2mL)", () => {
    const html = renderToStaticMarkup(<WorkingStockCalculator initialInput={{ requiredMassMg: 5 }} />);

    expect(html).toContain("ตวงตรงจาก stock เดิม");
    expect(html).toContain("5 mL");
  });

  it("ต้องทำ working dilution เมื่อโดสตรงต่ำกว่าเครื่องมือ (มวล 0.01mg)", () => {
    const html = renderToStaticMarkup(<WorkingStockCalculator initialInput={{ requiredMassMg: 0.01 }} />);

    expect(html).toContain("อัตราส่วน 1:100");
    expect(html).toContain("0.01 mg/mL");
  });

  it("uses atlas form and result anatomy without legacy soft cards", () => {
    const html = renderToStaticMarkup(<WorkingStockCalculator initialInput={{ requiredMassMg: 5 }} />);

    expect(html).toContain("cl-atlas-form-section");
    expect(html).toContain("cl-atlas-field-grid");
    expect(html).toContain("cl-atlas-result");
    expect(html).toContain('aria-live="polite"');
    expect(html).toContain('aria-label="ผลการคำนวณน้ำยาแม่"');
    expect(html).not.toContain("<output");
    expect(html).toContain("ค่าจากสูตร ยังไม่ใช่ค่าตรวจ");
    expect(html).not.toContain("pl-soft-card");
  });
});
