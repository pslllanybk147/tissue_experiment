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

  it("มีเมนูรอบเพาะให้ผู้ใช้เข้าถึงจากหน้าเว็บโดยตรง", () => {
    expect(navLinkItems.some((item) => item.href === "/my/rounds")).toBe(true);
  });
});
