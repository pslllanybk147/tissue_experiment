import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { growthForms } from "@/lib/manual/forms/registry";
import { StartList } from "./start-list";

const html = renderToStaticMarkup(<StartList />);

describe("หน้าเริ่มต้นสำหรับคนที่ยังไม่มีต้น", () => {
  it("แสดงทุกทรงที่มีอยู่จริง", () => {
    for (const form of growthForms) expect(html).toContain(form.label);
  });

  it("บอกเหตุผลของความยาก ไม่ใช่แค่ระดับลอย ๆ", () => {
    for (const form of growthForms) expect(html).toContain(form.whyThisDifficulty);
  });

  it("ลิงก์ไปหน้าทรง", () => {
    for (const form of growthForms) expect(html).toContain(`href="/form/${form.id}"`);
  });

  it("บอกว่าตอนนี้ยังมีทรงไม่ครบ", () => {
    expect(html).toContain("ยังไม่ครบ");
  });
});
