import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const verifier = fs.readFileSync(path.join(process.cwd(), "scripts/verify-accessible-ui.mjs"), "utf8");
const packageJson = JSON.parse(fs.readFileSync(path.join(process.cwd(), "package.json"), "utf8"));

describe("accessible UI browser verifier contract", () => {
  it("checks layout and contrast once per approved theme", () => {
    const inspectPage = verifier.slice(
      verifier.indexOf("async function inspectPage"),
      verifier.indexOf("async function verifyPublicGuide"),
    );
    expect(inspectPage).toContain('for (const theme of ["light", "dark"])');
    expect(inspectPage).toContain('const contrastSelector = ".primary-button, .secondary-button, .accessible-action, .photo-action, .cl-button-primary, .cl-button-secondary, .cl-button-danger"');
    expect(inspectPage).toContain("const contrastControls = [...document.querySelectorAll(contrastSelector)]");
    expect(inspectPage).toContain("contrast >= 4.5");
    expect(verifier).not.toContain("async function verifyButtonContrast");
  });

  it("reports horizontal text overflow separately from hidden vertical clipping", () => {
    const inspectPage = verifier.slice(
      verifier.indexOf("async function inspectPage"),
      verifier.indexOf("async function verifyPublicGuide"),
    );
    expect(inspectPage).toContain("horizontalTextOverflow");
    expect(inspectPage).toContain("verticalClipping");
    expect(inspectPage).toContain("element.scrollHeight > element.clientHeight + 1");
    expect(inspectPage).toContain('["hidden", "clip"].includes(overflowY)');
    expect(inspectPage).not.toContain("result.clippedText");
  });

  it("exposes the Botanical Atlas verification command", () => {
    expect(packageJson.scripts["atlas:verify"]).toBe("node scripts/verify-botanical-atlas.mjs");
  });

  it("stress-tests shared primitives with long Thai content and state styles", () => {
    expect(verifier).toContain("async function verifyCommonPrimitiveStress");
    expect(verifier).toContain("data-ui-stress-fixture");
    expect(verifier).toContain("หน่วยความเข้มข้นโดยประมาณจากการคำนวณตามปริมาตรทั้งหมด");
    expect(verifier).toContain("cl-page-heading-action");
    expect(verifier).toContain("cl-action-secondary");
    expect(verifier).toContain("cl-action-primary");
    expect(verifier).toContain("rectanglesOverlap");
    expect(verifier).toContain("fieldControl.scrollWidth");
    expect(verifier).toContain('cursor: getComputedStyle(busy).cursor');
  });
});
