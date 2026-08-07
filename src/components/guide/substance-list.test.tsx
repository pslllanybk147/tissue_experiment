import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { substances } from "@/lib/manual/substances";
import { SubstanceList } from "./substance-list";

describe("SubstanceList", () => {
  it("แสดงสารครบทุกตัวในทะเบียน", () => {
    const html = renderToStaticMarkup(<SubstanceList />);

    for (const item of substances) {
      expect(html, `ไม่ได้แสดง ${item.id}`).toContain(item.name);
    }
  });

  // นี่คือปัญหาที่ทำให้หน้านี้ต้องมี เจ้าของเจอชื่อกรดซิตริกแล้วต้องออกไปค้นกูเกิลเอง
  it("บอกว่าซื้อที่ไหนสำหรับทุกตัว ไม่ใช่แค่บอกชื่อ", () => {
    const html = renderToStaticMarkup(<SubstanceList />);

    expect(html).toContain("ซื้อที่ไหน");
    expect(html).toContain("ร้านขายวัตถุดิบทำขนม");
  });

  it("บอกทางออกเมื่อไม่มีของ ไม่ปล่อยให้ตัน", () => {
    const html = renderToStaticMarkup(<SubstanceList />);

    expect(html).toContain("ถ้าไม่มี");
    expect(html).toContain("น้ำยาล้างจาน");
  });

  it("สารที่ห้ามใช้ ต้องขึ้นคำเตือนให้เห็น ไม่ใช่ซ่อนไว้", () => {
    const html = renderToStaticMarkup(<SubstanceList />);

    expect(html).toContain("เมอร์คิวริกคลอไรด์");
    expect(html).toContain("ห้ามใช้ที่บ้าน");
  });
});
