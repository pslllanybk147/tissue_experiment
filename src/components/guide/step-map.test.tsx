import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { resolveBySlug } from "@/lib/manual/registry";
import { StepMap } from "./step-map";

const manual = resolveBySlug("pink-princess")!;

describe("StepMap", () => {
  it("แสดงชื่อต้นและจำนวนขั้นทั้งหมด", () => {
    const html = renderToStaticMarkup(<StepMap manual={manual} />);

    expect(html).toContain("Pink Princess");
    expect(html).toContain("15 ขั้น");
    expect(html).toContain("cl-step-map");
    expect(html).toContain("<ol");
    expect(html).not.toContain("pl-card");
  });

  it("วางชื่อวิทยาศาสตร์เป็นข้อมูลบทก่อนชื่อคู่มือ", () => {
    const html = renderToStaticMarkup(<StepMap manual={manual} />);

    expect(html).toContain("cl-chapter-kicker");
    expect(html.indexOf(manual.scientificName.replace(/'/g, "&#x27;"))).toBeLessThan(html.indexOf("<h1"));
  });

  it("ลิงก์ทุกขั้นด้วยหมายเลขที่เริ่มจาก 1", () => {
    const html = renderToStaticMarkup(<StepMap manual={manual} />);

    expect(html).toContain('href="/guide/pink-princess/step/1"');
    expect(html).toContain('href="/guide/pink-princess/step/14"');
    expect(html).not.toContain('href="/guide/pink-princess/step/0"');
  });

  it("มีทางเข้าไปเริ่มรอบเพาะ และบอกว่าต้องล็อกอินตอนกด", () => {
    const html = renderToStaticMarkup(<StepMap manual={manual} />);

    expect(html).toContain("เริ่มรอบเพาะของฉัน");
    expect(html).toContain("cl-button-primary");
    expect(html).toContain('href="/my/rounds/new?slug=pink-princess"');
    expect(html).toContain("ล็อกอิน");
  });

  it("เตือนไว้บนหัวคู่มือเมื่อมีขั้นที่ยังไม่มีงานรองรับ", () => {
    const html = renderToStaticMarkup(<StepMap manual={manual} />);

    expect(html).toContain("ยังไม่มีงานรองรับ");
  });
});
