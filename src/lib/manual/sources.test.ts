import { describe, expect, it } from "vitest";
import { allSlugs, resolveBySlug } from "./registry";
import { manualSources, sourceById } from "./sources";

describe("manual sources", () => {
  it("ทุก sourceId ที่ขั้นตอนอ้างถึงต้องมีอยู่จริงในทะเบียน", () => {
    for (const slug of allSlugs()) {
      const manual = resolveBySlug(slug)!;
      const referenced = [
        ...manual.sourceIds,
        ...manual.steps.flatMap((step) => step.evidence.sourceIds),
        ...manual.mediaRecipes.flatMap((recipe) => recipe.evidence.sourceIds),
      ];
      for (const id of referenced) {
        expect(sourceById(id), `${slug} อ้าง ${id} ที่ไม่มีในทะเบียน`).not.toBeNull();
      }
    }
  });

  it("มีงานฆ่าเชื้ออาหารด้วยสารเคมีของ Philodendron สำหรับกรณีไม่มีหม้อนึ่ง", () => {
    const record = sourceById("source-ruaysap-chemical-sterilization");

    expect(record).not.toBeNull();
    expect(record!.kind).toBe("peer-reviewed");
    expect(record!.url).toContain("tci-thaijo.org");
  });

  it("id ของแหล่งอ้างอิงไม่ซ้ำกัน", () => {
    const ids = manualSources.map((item) => item.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
