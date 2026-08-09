import { describe, expect, it } from "vitest";
import { allSlugs, resolveBySlug } from "./registry";
import type { ResolvedManual } from "./types";
import { auditBeginnerCopy } from "./beginner-copy";

describe("auditBeginnerCopy", () => {
  it("จับคำสั่งที่ยัดหลายการกระทำและศัพท์อังกฤษที่ไม่อธิบาย", () => {
    const base = resolveBySlug("violin-variegated")!;
    const fixture: ResolvedManual = {
      ...base,
      steps: [{
        ...base.steps[0],
        actions: ["ตัดชิ้น explant แล้วล้าง จากนั้นเช็ด แล้วนำเข้าตู้ทันที"],
      }],
    };
    const issues = auditBeginnerCopy(fixture);

    expect(issues.map((issue) => issue.code)).toEqual(expect.arrayContaining(["multiple-actions", "unexplained-term"]));
  });

  it("ตรวจคู่มือที่ลงทะเบียนทุกต้นโดยไม่พบคำสั่งที่ผิดกฎ", () => {
    const issues = allSlugs().flatMap((slug) => auditBeginnerCopy(resolveBySlug(slug)!));
    expect(issues.map((issue) => `${issue.slug} > ${issue.stepId} > ${issue.field} > ${issue.code}: ${issue.text}`)).toEqual([]);
  });
});
