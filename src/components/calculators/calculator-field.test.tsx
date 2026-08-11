import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { CalculatorField } from "./calculator-field";

describe("CalculatorField", () => {
  it("แสดง label เชื่อมกับ input ผ่าน htmlFor/id", () => {
    const html = renderToStaticMarkup(
      <CalculatorField id="test-field" label="มวลที่ต้องการ (mg)" value={5} onChange={() => {}} />,
    );

    expect(html).toContain('for="test-field"');
    expect(html).toContain('id="test-field"');
    expect(html).toContain("มวลที่ต้องการ (mg)");
    expect(html).toContain('value="5"');
  });

  it("แสดง hint เมื่อส่งมา และไม่แสดงเมื่อไม่ส่ง", () => {
    const withHint = renderToStaticMarkup(
      <CalculatorField id="a" label="A" value={1} onChange={() => {}} hint="คำอธิบายเพิ่มเติม" />,
    );
    const withoutHint = renderToStaticMarkup(<CalculatorField id="b" label="B" value={1} onChange={() => {}} />);

    expect(withHint).toContain("คำอธิบายเพิ่มเติม");
    expect(withoutHint).not.toContain("pl-meta");
  });

  it("keeps a long label, hint, control, unit, and error in reading order", () => {
    const html = renderToStaticMarkup(
      <CalculatorField
        id="long-field"
        label="ปริมาตร working solution ที่จะเตรียมสำหรับการทดลองรอบนี้"
        hint="อ่านค่าจากอุปกรณ์ที่ใช้จริง"
        unit="mL"
        value={Number.NaN}
        onChange={() => {}}
      />,
    );

    expect(html).toContain("cl-field-group");
    expect(html).toContain("cl-field-control");
    expect(html).toContain("cl-field-unit");
    expect(html.indexOf("cl-field-label")).toBeLessThan(html.indexOf("cl-field-hint"));
    expect(html.indexOf("cl-field-hint")).toBeLessThan(html.indexOf("cl-field-control"));
    expect(html.indexOf("cl-field-control")).toBeLessThan(html.indexOf("cl-field-error"));
    expect(html).toContain('value=""');
  });
});
