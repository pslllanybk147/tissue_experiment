import { describe, expect, it } from "vitest";

import { manualSources } from "./sources";
import { findSubstance, substanceById, substances } from "./substances";

const sourceIds = new Set(manualSources.map((source) => source.id));

describe("ทะเบียนสาร", () => {
  it("ไม่มี id ซ้ำ", () => {
    const ids = substances.map((item) => item.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("ทุกแหล่งที่อ้างมีอยู่จริงในทะเบียนแหล่ง", () => {
    for (const item of substances) {
      for (const id of item.evidence.sourceIds) {
        expect(sourceIds.has(id), `${item.id} อ้าง ${id} ที่ไม่มีในทะเบียน`).toBe(true);
      }
    }
  });

  // เหตุผลที่ทะเบียนนี้มีอยู่ คือผู้ใช้เจอชื่อสารแล้วต้องออกไปค้นเอง
  // ถ้ารายการไหนไม่บอกว่าซื้อที่ไหน มันก็ไม่ได้แก้ปัญหาที่ตั้งใจจะแก้
  it("ทุกสารต้องบอกว่าคืออะไรและหาซื้อที่ไหน", () => {
    for (const item of substances) {
      expect(item.whatItIs.length, `${item.id} ไม่ได้อธิบายว่าคืออะไร`).toBeGreaterThan(20);
      expect(item.whereToBuy.length, `${item.id} ไม่ได้บอกว่าซื้อที่ไหน`).toBeGreaterThan(10);
    }
  });

  // ของแทนที่ยังไม่มีใครทดสอบ ต้องบอกข้อจำกัดไว้ ไม่ใช่เสนอเฉย ๆ ให้ดูเหมือนใช้ได้เลย
  it("ของแทนทุกตัวต้องเขียนข้อจำกัดกำกับ ไม่ใช่เสนอลอย ๆ", () => {
    const hedges = ["ยังไม่มีงาน", "แต่", "ข้อจำกัด", "ไม่ใช่ของแทนที่เท่ากัน", "ให้ถือว่าเป็นการทดลอง"];
    for (const item of substances) {
      if (!item.substitute) continue;
      expect(
        hedges.some((word) => item.substitute!.includes(word)),
        `${item.id} เสนอของแทนโดยไม่บอกข้อจำกัด`,
      ).toBe(true);
    }
  });

  it("สารที่ห้ามใช้ ต้องมีคำเตือนเสมอ", () => {
    const mercury = substanceById("mercuric-chloride");

    expect(mercury?.caution).toContain("ห้ามใช้ที่บ้าน");
  });

  it("ค้นด้วยชื่อที่คนเห็นบนฉลากได้ ไม่ใช่แค่ id", () => {
    expect(findSubstance("วิตามินซี")?.id).toBe("ascorbic-acid");
    expect(findSubstance("Tween 20")?.id).toBe("surfactant");
    expect(findSubstance("คลอรีนเม็ด")?.id).toBe("nadcc");
    expect(findSubstance("ไม่มีสารนี้")).toBeNull();
    expect(findSubstance("  ")).toBeNull();
  });

  it("ค้นด้วย id ได้ และคืน null เมื่อไม่มี", () => {
    expect(substanceById("pvp")?.name).toBe("PVP");
    expect(substanceById("ไม่มี")).toBeNull();
  });
});
