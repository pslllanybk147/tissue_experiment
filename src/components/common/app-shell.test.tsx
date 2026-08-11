import fs from "node:fs";
import path from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { AppShell } from "./app-shell";

describe("AppShell", () => {
  it("renders the Botanical Atlas shell in task order with one main landmark", () => {
    const html = renderToStaticMarkup(
      <AppShell navigation={<nav>เดสก์ท็อป</nav>} mobileNavigation={<nav>มือถือ</nav>}>
        เนื้อหา
      </AppShell>,
    );

    expect(html).toContain("cl-atlas-shell");
    expect(html).toContain('href="#main-content"');
    expect(html).toContain('id="main-content"');
    expect((html.match(/<main/g) ?? [])).toHaveLength(1);
    expect(html).toContain("Plantlover Lab");
    expect(html).toContain("cl-mobile-nav");
    expect(html.indexOf("cl-topbar")).toBeLessThan(html.indexOf('id="main-content"'));
    expect(html.indexOf('id="main-content"')).toBeLessThan(html.indexOf("cl-mobile-nav"));
    expect(html).toContain("cl-atlas-wide");
    expect(html).not.toMatch(/Primary|Keyboard focus|Destructive|Disabled/);
  });

  it("reserves mobile navigation space including the safe area", () => {
    const css = fs.readFileSync(path.join(process.cwd(), "src/app/calm-lab.css"), "utf8");
    expect(css).toContain("calc(var(--cl-mobile-nav-height) + env(safe-area-inset-bottom))");
  });
});
