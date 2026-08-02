import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { OfflineBanner } from "./offline-banner";

describe("OfflineBanner", () => {
  it("ประกาศให้โปรแกรมอ่านหน้าจอรู้ว่าสถานะเปลี่ยน", () => {
    const html = renderToStaticMarkup(<OfflineBanner />);

    expect(html).toContain('role="status"');
  });

  it("บอกว่าบันทึกไว้ในเครื่องแล้วและจะซิงก์ให้เมื่อกลับมาออนไลน์", () => {
    const html = renderToStaticMarkup(<OfflineBanner />);

    expect(html).toContain("ออฟไลน์");
    expect(html).toContain("บันทึกไว้ในเครื่อง");
    expect(html).toContain("ซิงก์");
  });

  it("บอกด้วยว่าตอนออฟไลน์ถ่ายรูปไม่ได้ เพื่อไม่ให้ผู้ใช้รอเก้อ", () => {
    const html = renderToStaticMarkup(<OfflineBanner />);

    expect(html).toContain("รูป");
  });
});
