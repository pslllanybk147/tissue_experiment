import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ThemeScript } from "./theme-script";
import { ThemeToggle } from "./theme-toggle";

describe("ThemeScript", () => {
  it("resolves stored preference before system preference and applies color scheme", () => {
    const html = renderToStaticMarkup(<ThemeScript />);

    expect(html).toContain('localStorage.getItem("pl-theme")');
    expect(html).toContain("matchMedia");
    expect(html).toContain("dataset.theme");
    expect(html).toContain("style.colorScheme");
  });
});

describe("ThemeToggle", () => {
  it("renders the same neutral control on server and first client render", () => {
    const html = renderToStaticMarkup(<ThemeToggle />);

    expect(html).toContain("กำลังตรวจสอบธีม");
    expect(html).not.toContain("aria-pressed");
  });
});
