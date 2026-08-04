import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { AuthProvider } from "@/components/auth/auth-provider";
import { CalculatorOverlayProvider } from "@/components/nav/calculator-overlay-context";
import { CalculatorOverlay } from "./calculator-overlay";

function renderOverlay(screen: "picker" | "medium" | "working-stock" | "haiter") {
  return renderToStaticMarkup(
    <AuthProvider>
      <CalculatorOverlayProvider initialState={{ isOpen: true, screen }}>
        <CalculatorOverlay />
      </CalculatorOverlayProvider>
    </AuthProvider>,
  );
}

describe("CalculatorOverlay", () => {
  it("ไม่ render อะไรเลยเมื่อปิดอยู่", () => {
    const html = renderToStaticMarkup(
      <AuthProvider>
        <CalculatorOverlayProvider initialState={{ isOpen: false, screen: "picker" }}>
          <CalculatorOverlay />
        </CalculatorOverlayProvider>
      </AuthProvider>,
    );

    expect(html).toBe("");
  });

  it("หน้า picker แสดงตัวเลือกครบสามเครื่องคำนวณ พร้อมปุ่มปิด", () => {
    const html = renderOverlay("picker");

    expect(html).toContain("สูตรอาหาร");
    expect(html).toContain("น้ำยาแม่ (working stock)");
    expect(html).toContain("ไฮเตอร์ฆ่าเชื้อ");
    expect(html).toContain("pl-overlay-close");
    expect(html).toContain("pl-overlay-backdrop");
  });

  it("หน้า medium มี dropdown เลือกพืชและปุ่มย้อนกลับ", () => {
    const html = renderOverlay("medium");

    expect(html).toContain('id="calc-plant"');
    expect(html).toContain("pl-overlay-back");
    expect(html).toContain("จะทำอาหารเท่าไหร่");
  });

  it("หน้า working-stock render WorkingStockCalculator", () => {
    const html = renderOverlay("working-stock");

    expect(html).toContain("น้ำยาแม่ (working stock)");
  });

  it("หน้า haiter render HaiterCalculator", () => {
    const html = renderOverlay("haiter");

    expect(html).toContain("ไฮเตอร์ / สารฟอกฆ่าเชื้อ");
  });
});
