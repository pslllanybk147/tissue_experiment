import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const verifier = fs.readFileSync(path.join(process.cwd(), "scripts/verify-protocol-integrity.mjs"), "utf8");

describe("protocol integrity verifier field lookup", () => {
  it("recognizes preparation fields by their semantic label prefix", () => {
    expect(verifier).toContain('editorSection.getByLabel(/^เป้าหมาย/)');
    expect(verifier).toContain('editorSection.getByLabel(/^ปริมาตร/)');
    expect(verifier).not.toContain('getByLabel("เป้าหมาย", { exact: true })');
    expect(verifier).not.toContain('getByLabel("ปริมาตรสุดท้าย", { exact: true })');
  });
});
