import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const calmLabPath = path.join(process.cwd(), "src/app/calm-lab.css");

describe("Calm Lab contract", () => {
  it.each([
    "--cl-canvas",
    "--cl-surface",
    "--cl-text",
    "--cl-border",
    "--cl-action",
    "--cl-focus",
  ])("defines %s in both explicit themes", (token) => {
    const css = fs.readFileSync(calmLabPath, "utf8");
    expect(css.match(new RegExp(`${token}:`, "g"))).toHaveLength(2);
  });

  it("uses the approved spacing and readable type floors", () => {
    const css = fs.readFileSync(calmLabPath, "utf8");
    expect(css).toContain("--cl-space-4: 16px");
    expect(css).toContain("--cl-text-body: 17px");
    expect(css).toContain("--cl-text-meta: 14px");
    expect(css).toContain("--cl-control-min: 44px");
  });

  it("keeps visible UI on the single Torsilp family", () => {
    const css = fs.readFileSync(calmLabPath, "utf8");
    expect(css).toContain("font-family: var(--font-torsilp)");
    expect(css).not.toMatch(/font-(?:geist|plex|thai)/i);
  });
});
