import { describe, expect, it } from "vitest";

import { manualSources } from "./sources";
import { traitById, traits } from "./traits";

const sourceIds = new Set(manualSources.map((source) => source.id));

describe("ทะเบียนลักษณะพันธุ์", () => {
  it("ไม่มี id ซ้ำ", () => {
    const ids = traits.map((trait) => trait.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("ทุกการปรับค่าต้องบอกเหตุผลและอ้างแหล่งที่มีอยู่จริง", () => {
    for (const trait of traits) {
      expect(trait.adjustments.length, `${trait.id} ไม่มีการปรับค่าเลย`).toBeGreaterThan(0);
      for (const adjustment of trait.adjustments) {
        expect(adjustment.why.length, `${trait.id}/${adjustment.target} ไม่บอกเหตุผล`).toBeGreaterThan(0);
        for (const id of adjustment.evidence.sourceIds) {
          expect(sourceIds.has(id), `${trait.id} อ้าง ${id} ที่ไม่มีในทะเบียน`).toBe(true);
        }
      }
    }
  });

  it("การปรับค่าที่บอกว่าไม่มีงานรองรับ ต้องบันทึกว่าค้นอะไรไปแล้ว", () => {
    for (const trait of traits) {
      for (const adjustment of trait.adjustments) {
        if (adjustment.evidence.level !== "unsupported") continue;
        expect(adjustment.evidence.searchedAt, `${trait.id}/${adjustment.target} ไม่บันทึกวันที่ค้น`).toBeTruthy();
        expect(
          adjustment.evidence.searchQueries?.length,
          `${trait.id}/${adjustment.target} ไม่บันทึกคำค้น`,
        ).toBeGreaterThan(0);
      }
    }
  });

  it("ค้นด้วย id ได้ และคืน null เมื่อไม่มี", () => {
    expect(traitById("variegated")?.id).toBe("variegated");
    expect(traitById("ไม่มี")).toBeNull();
  });
});
