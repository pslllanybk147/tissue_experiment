import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { resolveBySlug } from "@/lib/manual/registry";
import { StepMap } from "./step-map";

const manual = resolveBySlug("pink-princess")!;

describe("StepMap", () => {
  it("แสดงชื่อต้นและจำนวนขั้นทั้งหมด", () => {
    const html = renderToStaticMarkup(<StepMap manual={manual} />);

    expect(html).toContain("Pink Princess");
    expect(html).toContain("14 ขั้น");
  });

  it("ลิงก์ทุกขั้นด้วยหมายเลขที่เริ่มจาก 1", () => {
    const html = renderToStaticMarkup(<StepMap manual={manual} />);

    expect(html).toContain('href="/guide/pink-princess/step/1"');
    expect(html).toContain('href="/guide/pink-princess/step/14"');
    expect(html).not.toContain('href="/guide/pink-princess/step/0"');
  });

  it("เตือนไว้บนหัวคู่มือเมื่อมีขั้นที่ยังไม่มีงานรองรับ", () => {
    const html = renderToStaticMarkup(<StepMap manual={manual} />);

    expect(html).toContain("ยังไม่มีงานรองรับ");
  });
});
