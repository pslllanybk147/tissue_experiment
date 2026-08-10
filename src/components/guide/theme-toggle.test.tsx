import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ThemeScript } from "./theme-script";
import { ThemeToggle } from "./theme-toggle";

describe("ThemeScript", () => {
  it("อ่านค่าที่เคยเลือกไว้และตั้ง data-theme ก่อนหน้าจะวาด", () => {
    const html = renderToStaticMarkup(<ThemeScript />);

    expect(html).toContain("localStorage");
    expect(html).toContain("data-theme");
  });
});

describe("ThemeToggle", () => {
  it("เป็นปุ่มจริงที่บอกหน้าที่ตัวเองให้โปรแกรมอ่านหน้าจอ", () => {
    const html = renderToStaticMarkup(<ThemeToggle />);

    expect(html).toContain("<button");
    expect(html).toContain('type="button"');
    expect(html).toContain("aria-label");
    expect(html).toContain("pl-toggle");
  });
});
