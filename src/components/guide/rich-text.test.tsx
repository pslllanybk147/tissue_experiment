import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { RichText, landmarkByTermId } from "./rich-text";

describe("ข้อความที่มีคำศัพท์แตะดูได้", () => {
  it("ข้อความธรรมดาออกมาเหมือนเดิม", () => {
    expect(renderToStaticMarkup(<RichText source="ตัดให้ชิดโคน" />)).toContain("ตัดให้ชิดโคน");
  });

  it("คำที่ห่อไว้กลายเป็น details ที่กางดูความหมายได้", () => {
    const html = renderToStaticMarkup(<RichText source="หา[[node|ข้อ]]ที่สมบูรณ์" />);
    expect(html).toContain("<details");
    expect(html).toContain("<summary");
    expect(html).toContain("ข้อ");
    expect(html).toContain("วงนูนรอบลำต้นที่ใบและรากงอกออกมา");
  });

  it("แสดงวิธีหาและคำที่มักสับสน ไม่ใช่แค่คำแปล", () => {
    const html = renderToStaticMarkup(<RichText source="[[node|ข้อ]]" />);
    expect(html).toContain("ไล่นิ้วไปตามลำต้น");
    expect(html).toContain("ปล้องคือช่วงเรียบยาว");
  });

  it("คำที่ไม่มีในทะเบียน แสดงเป็นข้อความธรรมดา ไม่พัง", () => {
    const html = renderToStaticMarkup(<RichText source="ลอง[[nodee|ข้อ]]ดู" />);
    expect(html).toContain("ลอง");
    expect(html).toContain("ข้อ");
    expect(html).not.toContain("<details");
  });

  it("ค้น landmark จาก id ได้ข้ามทุกทรง", () => {
    expect(landmarkByTermId("axillary-bud")?.term).toBe("ตาข้าง");
    expect(landmarkByTermId("ไม่มี")).toBeNull();
  });

  it("คำที่ห่อไว้ชี้ไปสารในคลังสาร กางดูวิธีซื้อได้เหมือนกัน", () => {
    const html = renderToStaticMarkup(<RichText source="จุ่ม[[ascorbic-acid|กรดแอสคอร์บิก]]" />);
    expect(html).toContain("<details");
    expect(html).toContain("ซื้อที่ไหน");
    expect(html).toContain("ร้านขายวัตถุดิบทำขนม");
  });
});
