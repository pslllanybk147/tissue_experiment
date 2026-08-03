import { describe, expect, it } from "vitest";
import { philodendronTaxa } from "./philodendron-knowledge";

describe("รายชื่อ taxon ของคลังหลังบ้าน", () => {
  it("มีลำดับชั้นตั้งแต่วงศ์ลงมาถึง cultivar", () => {
    const ranks = new Set(philodendronTaxa.map((item) => item.rank));

    expect(ranks.has("family")).toBe(true);
    expect(ranks.has("genus")).toBe(true);
    expect(ranks.has("species")).toBe(true);
    expect(ranks.has("cultivar")).toBe(true);
  });

  it("cultivar ผูกกับ species ที่มีอยู่จริงในรายการ ไม่ลอยเดี่ยว", () => {
    const ids = new Set(philodendronTaxa.map((item) => item.id));

    for (const taxon of philodendronTaxa) {
      if (!taxon.parentId) continue;
      expect(ids.has(taxon.parentId), `${taxon.id} ชี้ไป parent ที่ไม่มีจริง`).toBe(true);
    }
  });

  it("Pink Princess ไม่ถูกอ้างว่ายืนยันชนิดแน่นอน เพราะเป็นชื่อการค้า", () => {
    const pink = philodendronTaxa.find((item) => item.id === "cultivar-pink-princess")!;

    expect(pink.rank).toBe("cultivar");
    expect(pink.confidence).not.toBe("High");
  });

  it("id ไม่ซ้ำกัน", () => {
    const ids = philodendronTaxa.map((item) => item.id);

    expect(new Set(ids).size).toBe(ids.length);
  });
});
