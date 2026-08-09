import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { coreSteps } from "@/lib/manual/core-steps";
import { Illustration, illustrations } from "./illustrations";

describe("illustrations", () => {
  it("มีภาพครบทุก illustrationId ที่ขั้นตอนแกนกลางอ้างถึง", () => {
    const needed = Object.values(coreSteps)
      .map((step) => step.illustrationId)
      .filter((id): id is string => Boolean(id));

    for (const id of needed) {
      expect(illustrations[id], `ยังไม่มีภาพสำหรับ ${id}`).toBeDefined();
    }
  });

  it("ทุกภาพวาดเป็น svg ที่มี viewBox เดียวกัน", () => {
    for (const [id, Component] of Object.entries(illustrations)) {
      const html = renderToStaticMarkup(<Component />);
      expect(html, `${id} ต้องเป็น svg`).toContain("<svg");
      expect(html, `${id} ต้องใช้ viewBox มาตรฐาน`).toContain('viewBox="0 0 320 150"');
    }
  });

  it("ทุกภาพใช้สีจาก token ไม่ hardcode ค่าสี", () => {
    for (const [id, Component] of Object.entries(illustrations)) {
      const html = renderToStaticMarkup(<Component />);
      expect(html, `${id} ห้าม hardcode สี hex`).not.toMatch(/#[0-9a-fA-F]{3,8}/);
    }
  });

  it("ภาพเป็นภาพประกอบ จึงซ่อนจากโปรแกรมอ่านหน้าจอ", () => {
    const html = renderToStaticMarkup(<Illustration id="sterilize-timer" />);
    expect(html).toContain('aria-hidden="true"');
  });

  it("แสดงคำอธิบายและคำเตือนเป็นข้อความจริงใต้ภาพ", () => {
    const html = renderToStaticMarkup(<Illustration id="sterilant-sequence" />);
    expect(html).toContain("แสดงว่าสองสารเป็นคนละลำดับ");
    expect(html).toContain("ภาพประกอบ ไม่ใช่ภาพตัวอย่างผลทดลองจริง");
    expect(html).toContain("<figcaption");
  });

  it("คืนค่าว่างเมื่อไม่มีภาพของ id นั้น", () => {
    expect(renderToStaticMarkup(<Illustration id="ไม่มีภาพนี้" />)).toBe("");
    expect(renderToStaticMarkup(<Illustration />)).toBe("");
  });
});
