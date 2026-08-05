import { describe, expect, it } from "vitest";

import { linkIcons } from "./primary-nav";
import { navLinkItems } from "./nav-items";

describe("รายการเมนูหลัก", () => {
  it("ทุกรายการต้องมีไอคอน ไม่งั้นหน้าจะพังทั้งหน้าโดยไม่บอกสาเหตุ", () => {
    for (const item of navLinkItems) {
      expect(linkIcons[item.key], `เมนู ${item.key} ไม่มีไอคอน`).toBeTypeOf("function");
    }
  });

  it("ไม่มี key ซ้ำ", () => {
    const keys = navLinkItems.map((item) => item.key);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it("จำนวนรายการไม่เกินสี่ เพราะ bottom tab bar บนจอ 360px รับได้เท่านี้", () => {
    // ปุ่มเครื่องคำนวณเป็นช่องที่ห้าที่ไม่ได้อยู่ในลิสต์นี้ จึงจำกัดลิสต์ไว้ที่สาม
    expect(navLinkItems.length).toBeLessThanOrEqual(3);
  });
});
