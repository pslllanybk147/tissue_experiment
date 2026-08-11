import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { CalculatorOverlayProvider } from "./calculator-overlay-context";
import { PrimaryNav } from "./primary-nav";

vi.mock("next/navigation", () => ({
  usePathname: () => "/my/equipment",
}));

describe("PrimaryNav", () => {
  it("แสดงลิงก์หน้าแรก รอบเพาะ แก้ปัญหา อุปกรณ์ของฉัน และปุ่มเครื่องคำนวณ", () => {
    const html = renderToStaticMarkup(
      <CalculatorOverlayProvider>
        <PrimaryNav />
      </CalculatorOverlayProvider>,
    );

    expect(html).toContain('href="/"');
    expect(html).toContain('href="/problem"');
    expect(html).toContain('href="/my/rounds"');
    expect(html).toContain('href="/my/equipment"');
    expect(html).toContain("หน้าแรก");
    expect(html).toContain("แก้ปัญหา");
    expect(html).toContain("อุปกรณ์ของฉัน");
    expect(html).toContain("เครื่องคำนวณ");
    expect(html).toContain("<button");
  });

  it("ทำเครื่องหมาย aria-current ให้รายการที่ตรงกับ pathname ปัจจุบัน", () => {
    const html = renderToStaticMarkup(
      <CalculatorOverlayProvider>
        <PrimaryNav />
      </CalculatorOverlayProvider>,
    );

    expect(html).toContain('aria-current="page"');
  });

  it("แยกเมนูเดสก์ท็อปและมือถือโดยยังคงรายการและปลายทางเดิม", () => {
    const html = renderToStaticMarkup(
      <CalculatorOverlayProvider>
        <PrimaryNav />
      </CalculatorOverlayProvider>,
    );

    expect(html).toContain("cl-primary-nav-desktop");
    expect(html).toContain("cl-primary-nav-mobile");
    expect((html.match(/href="\/"/g) ?? [])).toHaveLength(2);
  });

  it("ให้แต่ละรายการมือถือมีโครงสร้าง target เต็มพื้นที่และชื่อเมนูภาษาไทย", () => {
    const html = renderToStaticMarkup(
      <CalculatorOverlayProvider>
        <PrimaryNav variant="mobile" />
      </CalculatorOverlayProvider>,
    );

    expect(html).toContain('aria-label="เมนูหลักสำหรับมือถือ"');
    expect(html).toContain("cl-primary-nav-item");
    expect(html).toContain("หน้าแรก");
    expect(html).not.toMatch(/Primary|Keyboard focus|Destructive|Disabled/);
  });
});
