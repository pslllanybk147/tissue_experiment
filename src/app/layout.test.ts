import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("root layout", () => {
  const source = readFileSync(new URL("./layout.tsx", import.meta.url), "utf8");

  it("ใช้ชื่อระบบ Plantlover Lab", () => {
    expect(source).toContain('title: "Plantlover Lab"');
    expect(source).not.toContain("Philodendron Lab");
  });

  it("loads only the local Sarabun UI font", () => {
    expect(source).toContain('variable: "--font-sarabun"');
    expect(source).toContain("Sarabun-Regular.woff2");
    expect(source).toContain("Sarabun-Medium.woff2");
    expect(source).toContain("Sarabun-SemiBold.woff2");
    expect(source).toContain("Sarabun-Bold.woff2");
    expect(source).not.toMatch(/chae[o]?[-_ ]?hon|torsilp/i);
    expect(source).not.toContain("next/font/google");
  });

  it("imports the shared foundation before feature styles", () => {
    expect(source.indexOf('import "./calm-lab.css"')).toBeLessThan(source.indexOf('import "./globals.css"'));
  });
});

describe("guide tokens", () => {
  const css = readFileSync(new URL("./guide.css", import.meta.url), "utf8");

  it("keeps only compatibility aliases instead of independent theme values", () => {
    expect(css).not.toContain(':root[data-theme="dark"]');
    expect(css).not.toContain(':root[data-theme="light"]');
    expect(css).toContain("--pl-paper: var(--cl-canvas)");
  });

  it("does not keep the legacy decorative glow", () => {
    expect(css).toContain("--pl-glow: transparent");
  });

  it("ไม่ใช้ชื่อ token ที่ชนกับ globals.css", () => {
    const declared = [...css.matchAll(/(--[a-z0-9-]+):/g)].map((match) => match[1]);

    expect(declared.length).toBeGreaterThan(10);
    expect(declared.filter((name) => !name.startsWith("--pl-")).length).toBe(0);
  });
});

describe("global button theme tokens", () => {
  const css = readFileSync(new URL("./globals.css", import.meta.url), "utf8");

  it("keeps lab buttons visible in both themes", () => {
    expect(css).toContain("--button-primary-bg: var(--cl-action)");
    expect(css).toContain("--button-primary-ink: var(--cl-on-action)");
    expect(css).toContain("--button-secondary-bg: var(--cl-surface)");
    expect(css).toMatch(/\.primary-button\s*\{[^}]*background:\s*var\(--button-primary-bg\)/s);
    expect(css).toMatch(/\.secondary-button\s*\{[^}]*background:\s*var\(--button-secondary-bg\)/s);
    expect(css).toMatch(/\.text-button\s*\{[^}]*color:\s*var\(--button-text\)/s);
    expect(css).toMatch(/\.square-button\s*\{[^}]*background:\s*var\(--button-secondary-bg\)/s);
  });
});
