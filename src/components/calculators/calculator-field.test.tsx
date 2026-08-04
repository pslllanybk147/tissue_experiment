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
});
