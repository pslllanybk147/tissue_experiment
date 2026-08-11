import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { StatusNotice } from "./status-notice";

describe("StatusNotice", () => {
  it("dynamic blocked notice ยังคงประกาศเป็น alert", () => {
    const html = renderToStaticMarkup(
      <StatusNotice tone="blocked" title="บันทึกไม่ได้">กรอกข้อมูลให้ครบ</StatusNotice>,
    );

    expect(html).toContain('role="alert"');
    expect(html).toContain('aria-hidden="true"');
  });

  it("static blocked notice ใช้ note แต่คง tone สัญลักษณ์ หัวข้อ และเนื้อหา", () => {
    const html = renderToStaticMarkup(
      <StatusNotice tone="blocked" title="หยุดก่อน" live={false}>หยุดทันทีเมื่อชิ้นพืชซีดขาว</StatusNotice>,
    );

    expect(html).toContain('role="note"');
    expect(html).not.toContain('role="alert"');
    expect(html).not.toContain("aria-live");
    expect(html).toContain('data-tone="blocked"');
    expect(html).toContain('aria-hidden="true"');
    expect(html).toContain("หยุดก่อน");
    expect(html).toContain("หยุดทันทีเมื่อชิ้นพืชซีดขาว");
  });
});
