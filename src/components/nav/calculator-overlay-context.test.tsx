import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { CalculatorOverlayProvider, useCalculatorOverlay } from "./calculator-overlay-context";

function Probe() {
  const { state } = useCalculatorOverlay();
  return <p>{state.isOpen ? "open" : "closed"}:{state.screen}</p>;
}

describe("CalculatorOverlayProvider", () => {
  it("เริ่มต้นปิดอยู่ที่หน้า picker เมื่อไม่ส่ง initialState", () => {
    const html = renderToStaticMarkup(
      <CalculatorOverlayProvider>
        <Probe />
      </CalculatorOverlayProvider>,
    );
    expect(html).toContain("closed:picker");
  });

  it("รับ initialState เพื่อ render จอใดจอหนึ่งตรง ๆ โดยไม่ต้องจำลองคลิก", () => {
    const html = renderToStaticMarkup(
      <CalculatorOverlayProvider initialState={{ isOpen: true, screen: "haiter" }}>
        <Probe />
      </CalculatorOverlayProvider>,
    );
    expect(html).toContain("open:haiter");
  });

  it("throw ถ้าเรียก useCalculatorOverlay นอก Provider", () => {
    expect(() => renderToStaticMarkup(<Probe />)).toThrow(
      "useCalculatorOverlay must be used within CalculatorOverlayProvider",
    );
  });
});
