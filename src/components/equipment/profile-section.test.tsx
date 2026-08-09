import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { USER_REPORTED_PROFILE } from "@/lib/equipment/equipment-profile";
import { ProfileSection } from "./profile-section";

describe("ProfileSection", () => {
  const html = renderToStaticMarkup(<ProfileSection profile={USER_REPORTED_PROFILE} onChange={() => {}} />);

  it("แสดงค่าฉลากสารและเครื่องมือวัดตามของจริง", () => {
    expect(html).toContain("Haiter (% w/w)");
    expect(html).toContain('value="6"');
    expect(html).toContain("แอลกอฮอล์ (%)");
    expect(html).toContain('value="75"');
    expect(html).toContain("เครื่องชั่งจิวเวลรี่ อ่านต่ำสุด (g)");
    expect(html).toContain('value="0.01"');
    expect(html).toContain("Syringe ตวงละเอียดสุด (mL)");
    expect(html).toContain('value="0.1"');
  });

  it("แสดงภาชนะ pH meter และไม่ติ๊กว่าน้ำปลอดเชื้อเอง", () => {
    expect(html).toContain("กระปุกเพาะ 50 mL (ใบ)");
    expect(html).toContain('value="46"');
    expect(html).toContain("มี pH meter");
    expect(html).toContain("น้ำนี้ผ่านการฆ่าเชื้อแล้ว");
    const sterileAt = html.indexOf("น้ำนี้ผ่านการฆ่าเชื้อแล้ว");
    const sterileInput = html.slice(html.lastIndexOf("<input", sterileAt), sterileAt);
    expect(sterileInput).not.toContain("checked");
  });

  it("แสดงรายการชิ้นจริงที่ผู้ใช้รายงานครบ", () => {
    expect(html).toContain("คีม forceps");
    expect(html).toContain("มีดผ่าตัดแบบเรียว");
    expect(html).toContain("Samsung Galaxy S24 FE");
    expect(html).toContain("Foggy (ขวด)");
    expect(html).toContain('value="3"');
  });
});
