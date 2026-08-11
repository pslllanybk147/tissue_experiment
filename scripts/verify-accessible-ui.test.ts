import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const verifier = fs.readFileSync(path.join(process.cwd(), "scripts/verify-accessible-ui.mjs"), "utf8");

describe("accessible UI browser verifier contract", () => {
  it("runs a real 320px minimum-mobile viewport", () => {
    expect(verifier).toContain('{ name: "minimum-mobile", width: 320, height: 800 }');
    expect(verifier).toContain("if (viewports.length === 0)");
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
