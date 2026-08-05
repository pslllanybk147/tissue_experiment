import { describe, expect, it } from "vitest";

import { searchPlants } from "./search";

describe("การค้นหา", () => {
  it("คำว่างคืนผลว่าง", () => {
    expect(searchPlants("")).toEqual([]);
    expect(searchPlants("   ")).toEqual([]);
  });

  it("ค้นด้วยชื่อไทยของชนิดเจอ", () => {
    const hits = searchPlants("พิงค์");
    expect(hits.some((hit) => hit.kind === "species" && hit.slug === "pink-princess")).toBe(true);
  });

  it("ค้นด้วยชื่อวิทยาศาสตร์เจอ ไม่สนตัวพิมพ์เล็กใหญ่", () => {
    const hits = searchPlants("PINK PRINCESS");
    expect(hits.some((hit) => hit.kind === "species")).toBe(true);
  });

  it("ค้นชื่อสกุลที่ยังไม่มีคู่มือชนิด ได้ผลระดับสกุล", () => {
    const hits = searchPlants("ฟิโลเดนดรอน");
    expect(hits.some((hit) => hit.kind === "genus")).toBe(true);
  });

  it("ค้นชื่อทรงเจอทรง", () => {
    const hits = searchPlants("เถาเลื้อย");
    expect(hits.some((hit) => hit.kind === "form")).toBe(true);
  });

  it("คำที่ไม่ตรงอะไรเลยคืนผลว่าง", () => {
    expect(searchPlants("ปลาทอง")).toEqual([]);
  });

  it("ผลชนิดมาก่อนผลสกุลและทรงเสมอ", () => {
    const hits = searchPlants("philodendron");
    const kinds = hits.map((hit) => hit.kind);
    const firstGenus = kinds.indexOf("genus");
    const lastSpecies = kinds.lastIndexOf("species");
    if (firstGenus !== -1 && lastSpecies !== -1) expect(lastSpecies).toBeLessThan(firstGenus);
  });
});
