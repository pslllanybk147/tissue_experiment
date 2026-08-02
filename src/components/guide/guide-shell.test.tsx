import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { GuideShell } from "./guide-shell";

describe("GuideShell", () => {
  it("แสดงชื่อระบบและลิงก์กลับหน้าแรก", () => {
    const html = renderToStaticMarkup(<GuideShell><p>เนื้อหา</p></GuideShell>);

    expect(html).toContain("Plantlover Lab");
    expect(html).toContain('href="/"');
    expect(html).toContain("เนื้อหา");
  });

  it("มีลิงก์ข้ามไปเนื้อหาหลักสำหรับคนใช้คีย์บอร์ด", () => {
    const html = renderToStaticMarkup(<GuideShell><p>เนื้อหา</p></GuideShell>);

    expect(html).toContain('href="#pl-main"');
    expect(html).toContain('id="pl-main"');
  });
});
