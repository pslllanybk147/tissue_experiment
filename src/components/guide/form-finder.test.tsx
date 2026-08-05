import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { FormFinder } from "./form-finder";

describe("จอไล่หาทรง", () => {
  it("แสดงคำถามพร้อมคำใบ้ของทุกตัวเลือก", () => {
    const html = renderToStaticMarkup(<FormFinder answers={{}} />);
    expect(html).toContain("ลำต้นของต้นคุณเป็นแบบไหน");
    expect(html).toContain("เลื้อยหรือพาดขึ้นหลัก");
    expect(html).toContain("ขุดดินขึ้นมาเจอหัวหรือแง่งทอดขวาง");
  });

  it("ตัวเลือกเป็นลิงก์ที่สะสมคำตอบไว้ใน URL", () => {
    const html = renderToStaticMarkup(<FormFinder answers={{}} />);
    expect(html).toContain('href="/find?stem=vine"');
  });

  it("ตอบข้อแรกแล้ว ลิงก์ข้อถัดไปเก็บคำตอบเดิมไว้ด้วย", () => {
    const html = renderToStaticMarkup(<FormFinder answers={{ stem: "vine" }} />);
    expect(html).toContain('href="/find?stem=vine&amp;node=visible"');
  });

  it("จบที่ทรงที่มีอยู่จริง พาไปหน้าทรง", () => {
    const html = renderToStaticMarkup(<FormFinder answers={{ stem: "vine", node: "visible" }} />);
    expect(html).toContain('href="/form/climbing-vine-visible-node"');
  });

  it("จบที่ทรงที่ยังไม่ได้เขียน บอกตรง ๆ และไม่ทิ้งให้ตัน", () => {
    const html = renderToStaticMarkup(<FormFinder answers={{ stem: "rosette" }} />);
    expect(html).toContain("ยังไม่มีคู่มือของทรงนี้");
    expect(html).toContain('href="/find"');
  });

  it("จบที่ทรงที่ยังไม่ได้เขียน ต้องไม่ยกคู่มือของทรงอื่นมาให้", () => {
    const html = renderToStaticMarkup(<FormFinder answers={{ stem: "rosette" }} />);
    expect(html).not.toContain('href="/form/');
  });

  it("มีทางถอยกลับไปเริ่มใหม่เสมอ", () => {
    const html = renderToStaticMarkup(<FormFinder answers={{ stem: "vine" }} />);
    expect(html).toContain('href="/find"');
  });
});
