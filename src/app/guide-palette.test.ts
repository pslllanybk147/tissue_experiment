import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const css = readFileSync(new URL("./guide.css", import.meta.url), "utf8");

describe("guide action palette", () => {
  it("มี semantic action tokens ครบสำหรับทั้งธีมมืดและธีมสว่าง", () => {
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
      expect(css).toContain(token);
    }
    expect(css).toContain(':root[data-theme="light"]');
    expect(css).toContain(':root[data-theme="dark"]');
  });

  it("ปุ่มหลักไม่ใช้สี inline ที่แยกออกจาก palette กลาง", () => {
    expect(css).toContain(".pl-action-primary");
    expect(css).toContain("color: var(--pl-action-primary-fg)");
  });
});
