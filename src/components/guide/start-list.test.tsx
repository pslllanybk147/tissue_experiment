import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { plantImageUrl } from "@/lib/manual/plant-images";
import { plantPacks } from "@/lib/manual/registry";
import { StartList } from "./start-list";

const html = renderToStaticMarkup(<StartList />);

describe("หน้าเริ่มต้นสำหรับคนที่ยังไม่มีต้น", () => {
  it("แสดงทุกชนิดพืชที่มีคู่มืออยู่จริงเป็นการ์ด", () => {
    for (const pack of plantPacks) expect(html).toContain(pack.commonName);
  });

  it("บอกชื่อวิทยาศาสตร์ของแต่ละชนิด", () => {
    // React SSR เข้ารหัส ' เป็น &#x27; ในเนื้อ HTML แปลงทั้งสองฝั่งให้เทียบกันได้ก่อน
    for (const pack of plantPacks) {
      expect(html).toContain(pack.scientificName.replace(/'/g, "&#x27;"));
    }
  });

  it("ลิงก์ไปหน้าคู่มือของชนิดนั้นโดยตรง", () => {
    for (const pack of plantPacks) expect(html).toContain(`href="/guide/${pack.slug}"`);
  });

  it("ต้นที่มีไฟล์ภาพจริง ต้องโชว์รูป ไม่ใช่ตัวอักษรย่อ", () => {
    // ตรวจตาม plantImageUrl() จริง แทนการเดาว่ามีไฟล์ครบหรือไม่ครบกี่ต้น ไม่ผูกกับสถานะไฟล์ปัจจุบัน
    for (const pack of plantPacks) {
      const image = plantImageUrl(pack.slug);
      if (!image) continue;
      expect(html).toContain(`background-image:url(${image})`);
    }
  });

  it("ต้นที่ยังไม่มีไฟล์ภาพ ต้องมีตัวอักษรย่อสำรอง ไม่ใช่ว่างเปล่า", () => {
    const missing = plantPacks.filter((pack) => !plantImageUrl(pack.slug));
    if (missing.length === 0) return; // ตอนนี้ทุกต้นมีภาพครบแล้ว ไม่มีเคสให้ตรวจ แต่ไม่ควรทำให้เทสต์พัง
    expect(html).toContain("pl-plant-card-placeholder");
  });

  it("มีทางออกไปหน้าไล่ลักษณะต้นสำหรับคนที่ยังไม่รู้ชนิด", () => {
    expect(html).toContain('href="/find"');
  });

  it("มีทางออกไปหน้าค้นหาสำหรับคนที่รู้ชื่อต้นอยู่แล้ว (เดิมเข้าถึงผ่าน Doors ที่ตอนนี้ถูกแทนที่แล้ว)", () => {
    expect(html).toContain('href="/search"');
  });
});
