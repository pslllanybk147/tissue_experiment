import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { CalculatorOverlayProvider } from "./calculator-overlay-context";
import { PrimaryNav } from "./primary-nav";

vi.mock("next/navigation", () => ({
  usePathname: () => "/my/equipment",
}));

describe("PrimaryNav", () => {
  it("แสดงลิงก์หน้าแรก อุปกรณ์ของฉัน และปุ่มเครื่องคำนวณ", () => {
    const html = renderToStaticMarkup(
      <CalculatorOverlayProvider>
        <PrimaryNav />
      </CalculatorOverlayProvider>,
    );

    expect(html).toContain('href="/"');
    expect(html).toContain('href="/my/equipment"');
    expect(html).toContain("หน้าแรก");
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

  it("มีทั้งเมนูเดสก์ท็อปและมือถือใน markup เดียวกัน (สลับด้วย CSS)", () => {
    const html = renderToStaticMarkup(
      <CalculatorOverlayProvider>
        <PrimaryNav />
      </CalculatorOverlayProvider>,
    );

    expect(html).toContain("pl-nav-desktop");
    expect(html).toContain("pl-nav-mobile");
  });
});
