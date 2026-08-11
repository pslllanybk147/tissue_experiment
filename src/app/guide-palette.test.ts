import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const css = readFileSync(new URL("./guide.css", import.meta.url), "utf8");
const globalCss = readFileSync(new URL("./globals.css", import.meta.url), "utf8");
const calmLabCss = readFileSync(new URL("./calm-lab.css", import.meta.url), "utf8");

describe("guide action palette", () => {
  it("defines the public reading layer entirely through Botanical Atlas tokens", () => {
    expect(css).toContain("--pl-bg: var(--cl-canvas)");
    expect(css).toContain("--pl-surface: var(--cl-surface)");
    expect(css).toContain("--pl-text: var(--cl-text)");
    expect(css).toContain(".cl-atlas-reading");
    expect(css).not.toMatch(/font-family:\s*(?:Georgia|\"Times New Roman\")/);
  });

  it("ทำให้ลิงก์ในเนื้อหาเห็นชัดด้วยสี action และเส้นใต้ semantic", () => {
    expect(css).toMatch(/\.cl-inline-link\s*\{[^}]*color:\s*var\(--cl-action\)/s);
    expect(css).toMatch(/\.cl-inline-link\s*\{[^}]*text-decoration[^}]*underline/s);
    expect(css).toContain(".cl-inline-link:hover");
    expect(css).toContain("var(--cl-action-hover)");
    expect(css).toContain(".cl-inline-link:focus-visible");
    expect(css).toContain("var(--cl-focus)");
  });

  it("ให้ shell เป็นเจ้าของระยะหลบ navigation มือถือเพียงจุดเดียว", () => {
    expect(calmLabCss).toMatch(/\.cl-main\s*\{[^}]*padding-block:[^}]*var\(--cl-mobile-nav-height\)/s);
    expect(css).toMatch(/\.pl-wrap\.cl-atlas-reading\s*\{[^}]*padding:\s*0;/s);
    expect(css).not.toMatch(/\.pl-wrap\.cl-atlas-reading\s*\{[^}]*cl-mobile-nav-height/s);
  });

  it("ไม่เขียนทับ chapter primitive ที่ LabShell และ dashboard ใช้ร่วมกัน", () => {
    expect(calmLabCss).toContain(".cl-atlas-chapter { min-width: 0; }");
    expect(css).not.toMatch(/(^|[}\n])\s*\.cl-atlas-chapter(?=[\s,{>])/m);
    expect(css).toContain(".cl-guide-article .cl-guide-chapter");
  });

  it("maps legacy action names to the shared Calm Lab semantic palette", () => {
    for (const token of [
      "--pl-action-primary-bg",
      "--pl-action-primary-fg",
      "--pl-action-secondary-bg",
      "--pl-action-secondary-fg",
      "--pl-action-success-bg",
      "--pl-action-success-fg",
      "--pl-action-danger-bg",
      "--pl-action-danger-fg",
    ]) {
      expect(css).toMatch(new RegExp(`${token}: var\\(--cl-`));
    }
    expect(css).not.toContain(':root[data-theme="light"]');
    expect(css).not.toContain(':root[data-theme="dark"]');
  });

  it("ปุ่มหลักไม่ใช้สี inline ที่แยกออกจาก palette กลาง", () => {
    expect(css).toContain(".pl-action-primary");
    expect(css).toContain("color: var(--pl-action-primary-fg)");
  });

  it("มีคู่สีเฉพาะสำหรับปุ่มสลับธีม ภาพ และการ์ดคำสั่ง", () => {
    for (const token of ["--pl-media-border", "--pl-step-bg", "--pl-step-border"]) {
      expect(css).toContain(token);
    }
    expect(css).toContain(".pl-toggle");
    expect(css).toContain("font-size: var(--cl-text-label)");
    expect(css).not.toContain(".pl-toggle {\n  white-space: nowrap");
    expect(css.indexOf(".pl-action-secondary.pl-toggle")).toBeGreaterThan(css.indexOf("font: inherit"));
    expect(globalCss).toContain("background:var(--pl-step-bg)");
    expect(globalCss).toContain("border:1px solid var(--pl-step-border)");
  });

  it("กันกฎเลขลำดับของคู่มือไม่ให้ทับรายการคำสั่งที่มีเลขในตัวเอง", () => {
    expect(css).toContain(".pl-root ol.execution-instructions");
    expect(css).toContain("list-style: none");
  });
});
