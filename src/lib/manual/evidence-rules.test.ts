import { describe, expect, it } from "vitest";

import { capabilityMethods } from "@/lib/equipment/capabilities";
import { allSlugs, resolveBySlug } from "./registry";
import { troubleshootingEntries } from "./troubleshooting";
import type { EvidenceRef } from "./types";

// ตรวจที่คู่มือฉบับประกอบเสร็จ ไม่ใช่ที่ coreSteps ดิบ ๆ เพราะขั้นในแกนกลางที่เป็น
// unsupported หมายถึงตั้งใจไม่ให้ตัวเลขและรอให้แผ่นเสริมเติม ซึ่งคนละความหมายกับ
// ค้นแล้วไม่เจอ ถ้าแผ่นเสริมไหนลืมเติม ค่า unsupported จะไหลออกมาที่นี่และถูกจับได้
function collect(): Array<{ where: string; evidence: EvidenceRef }> {
  const items: Array<{ where: string; evidence: EvidenceRef }> = [];
  for (const [id, entry] of Object.entries(troubleshootingEntries)) items.push({ where: `trouble/${id}`, evidence: entry.evidence });
  for (const method of capabilityMethods) items.push({ where: `equipment/${method.id}`, evidence: method.evidence });
  for (const slug of allSlugs()) {
    const manual = resolveBySlug(slug)!;
    for (const step of manual.steps) items.push({ where: `${slug}/${step.id}`, evidence: step.evidence });
    for (const recipe of manual.mediaRecipes) items.push({ where: `${slug}/recipe/${recipe.id}`, evidence: recipe.evidence });
  }
  return items;
}

describe("กฎของหลักฐาน", () => {
  it("ข้ออ้างว่ามีงานรองรับ ต้องระบุแหล่ง", () => {
    for (const item of collect()) {
      if (item.evidence.level === "unsupported") continue;
      expect(item.evidence.sourceIds.length, `${item.where} ไม่ระบุแหล่ง`).toBeGreaterThan(0);
    }
  });

  it("ข้ออ้างว่าไม่มีงานรองรับ ต้องบันทึกว่าค้นอะไรไปแล้วและค้นเมื่อไหร่", () => {
    for (const item of collect()) {
      if (item.evidence.level !== "unsupported") continue;
      expect(item.evidence.searchedAt, `${item.where} ไม่บันทึกวันที่ค้น`).toBeTruthy();
      expect(item.evidence.searchQueries?.length, `${item.where} ไม่บันทึกคำค้น`).toBeGreaterThan(0);
    }
  });

  it("ข้อมูลจากตำราต้องระบุแหล่ง ห้ามใช้เป็นทางเลี่ยงการอ้างอิง", () => {
    for (const item of collect()) {
      if (item.evidence.level !== "botanical-fact") continue;
      expect(item.evidence.sourceIds.length, `${item.where} เป็นข้อมูลจากตำราแต่ไม่ระบุแหล่ง`).toBeGreaterThan(0);
    }
  });

  it("วันที่ค้นเป็นรูปแบบ YYYY-MM-DD", () => {
    for (const item of collect()) {
      if (!item.evidence.searchedAt) continue;
      expect(item.evidence.searchedAt, `${item.where} รูปแบบวันที่ผิด`).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });
});
