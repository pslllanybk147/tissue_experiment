import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { Doors } from "./doors";

describe("สี่ประตูหน้าแรก", () => {
  const html = renderToStaticMarkup(<Doors />);

  it("มีครบสี่ประตู", () => {
    expect(html).toContain("มีต้นอยู่ แต่ไม่รู้ชื่อ");
    expect(html).toContain("รู้ชื่อต้นแล้ว");
    expect(html).toContain("ยังไม่มีต้น");
    expect(html).toContain("ทำแล้วมีปัญหา");
  });

  it("ทุกประตูลิงก์ไปเส้นทางของตัวเอง", () => {
    for (const href of ["/find", "/search", "/start", "/problem"]) {
      expect(html, `ไม่มีลิงก์ ${href}`).toContain(`href="${href}"`);
    }
  });

  it("ไม่มีชื่อวิทยาศาสตร์บนหน้าแรก เพราะมือใหม่ยังไม่พร้อมเจอ", () => {
    expect(html).not.toContain("Philodendron");
  });

  it("บอกว่าอ่านได้โดยไม่ต้องสมัครสมาชิก", () => {
    expect(html).toContain("ไม่ต้องสมัครสมาชิก");
  });
});
