import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { TermHelp } from "./term-help";

describe("TermHelp", () => {
  it.each(["explant", "node", "stock-solution", "working-dilution", "ppm", "sterile-water", "blank-control", "browning"])(
    "อธิบาย %s พร้อม cue ที่ใช้ดูของจริง",
    (termId) => {
      const html = renderToStaticMarkup(<TermHelp termId={termId}>คำทดสอบ</TermHelp>);
      expect(html).toContain("<details");
      expect(html).toContain("<summary");
      expect(html).toContain('role="definition"');
      expect(html).toContain("หมายถึง");
      expect(html).toContain("ดูจากของจริงอย่างไร");
    },
  );

  it("ให้คำสั้นมีพื้นที่กดกว้างอย่างน้อย 48 พิกเซล", () => {
    const html = renderToStaticMarkup(<TermHelp termId="node">ข้อ</TermHelp>);
    expect(html).toContain("min-width:48px");
  });
});
