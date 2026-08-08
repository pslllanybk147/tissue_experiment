import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

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

  it("ต้นที่ยังไม่มีไฟล์ภาพ ต้องมีตัวอักษรย่อสำรอง ไม่ใช่ว่างเปล่า", () => {
    // ตอนรันเทสต์ยังไม่มีไฟล์ใน public/plants/ เลย ทุกการ์ดจึงต้องขึ้น placeholder
    expect(html).toContain("pl-plant-card-placeholder");
  });

  it("มีทางออกไปหน้าไล่ลักษณะต้นสำหรับคนที่ยังไม่รู้ชนิด", () => {
    expect(html).toContain('href="/find"');
  });
});
