import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

// อ่านจากไฟล์ต้นฉบับแทนการ import เพราะ layout.tsx เรียก next/font/google
// ซึ่งต้องใช้ตัวแปลงของ Next ตอน build จึงรันตรง ๆ ใน vitest ไม่ได้
describe("root layout", () => {
  const source = readFileSync(new URL("./layout.tsx", import.meta.url), "utf8");

  it("ใช้ชื่อระบบ Plantlover Lab", () => {
    expect(source).toContain('title: "Plantlover Lab"');
    expect(source).not.toContain("Philodendron Lab");
  });

  it("ยังคงตัวแปรฟอนต์เดิมไว้ให้หน้าเก่าใช้ และเพิ่มฟอนต์ใหม่", () => {
    expect(source).toContain("--font-geist-sans");
    expect(source).toContain("--font-plex");
  });
});

describe("guide tokens", () => {
  const css = readFileSync(new URL("./guide.css", import.meta.url), "utf8");

  it("นิยาม token ทั้งโหมดสว่างและโหมดมืด", () => {
    expect(css).toContain("prefers-color-scheme: dark");
    expect(css).toContain(':root[data-theme="dark"]');
    expect(css).toContain(':root[data-theme="light"]');
  });

  it("ใช้เงาทึบไม่เบลอตามภาษาออกแบบที่เลือก", () => {
    expect(css).toMatch(/box-shadow:\s*\d+px\s+\d+px\s+0\s+var\(--pl-shadow\)/);
  });

  it("ไม่ใช้ชื่อ token ที่ชนกับ globals.css", () => {
    const declared = [...css.matchAll(/(--[a-z0-9-]+):/g)].map((match) => match[1]);

    expect(declared.length).toBeGreaterThan(10);
    expect(declared.every((name) => name.startsWith("--pl-"))).toBe(true);
  });
});
