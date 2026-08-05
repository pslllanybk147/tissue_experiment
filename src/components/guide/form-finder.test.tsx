import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { FormFinder } from "./form-finder";

describe("จอไล่หาทรง", () => {
  it("แสดงคำถามพร้อมคำใบ้ของทุกตัวเลือก", () => {
    const html = renderToStaticMarkup(<FormFinder answers={{}} />);
    expect(html).toContain("ลำต้นของต้นคุณเป็นแบบไหน");
    expect(html).toContain("เลื้อยหรือพาดขึ้นหลัก");
    expect(html).toContain("ขุดดินขึ้นมาเจอแง่ง หรือมีลำอ้วนตั้งจากโคนกอ");
  });

  it("ตัวเลือกเป็นลิงก์ที่สะสมคำตอบไว้ใน URL", () => {
    const html = renderToStaticMarkup(<FormFinder answers={{}} />);
    expect(html).toContain('href="/find?stem=vine"');
  });

  it("ตอบข้อแรกแล้ว ลิงก์ข้อถัดไปเก็บคำตอบเดิมไว้ด้วย", () => {
    const html = renderToStaticMarkup(<FormFinder answers={{ stem: "vine" }} />);
    expect(html).toContain('href="/find?stem=vine&amp;texture=soft"');
  });

  it("จบที่ทรงที่มีอยู่จริง พาไปหน้าทรง", () => {
    const html = renderToStaticMarkup(<FormFinder answers={{ stem: "vine", texture: "soft" }} />);
    expect(html).toContain('href="/form/climbing-vine-visible-node"');
  });

  it("ต้นที่ยังไม่ครอบคลุม บอกตรง ๆ และไม่ทิ้งให้ตัน", () => {
    const html = renderToStaticMarkup(<FormFinder answers={{ stem: "none" }} />);
    expect(html).toContain("ต้นแบบนี้ยังไม่อยู่ในระบบ");
    expect(html).toContain('href="/find"');
  });

  it("กรณีไม่ตรงสักทรง ห้ามบอกว่าระบุทรงได้แล้ว เพราะผู้ใช้เพิ่งบอกว่าไม่ตรง", () => {
    const html = renderToStaticMarkup(<FormFinder answers={{ stem: "none" }} />);
    expect(html).not.toContain("เราระบุได้ว่าต้นของคุณเป็นทรงไหน");
  });

  it("ต้นที่ยังไม่ครอบคลุม ต้องไม่ยกคู่มือของทรงอื่นมาให้", () => {
    const html = renderToStaticMarkup(<FormFinder answers={{ stem: "none" }} />);
    expect(html).not.toContain('href="/form/');
  });

  it("มีทางถอยกลับไปเริ่มใหม่เสมอ", () => {
    const html = renderToStaticMarkup(<FormFinder answers={{ stem: "vine" }} />);
    expect(html).toContain('href="/find"');
  });
});
