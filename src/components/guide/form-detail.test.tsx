import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { climbingVineVisibleNode } from "@/lib/manual/forms/climbing-vine-visible-node";
import { FormDetail } from "./form-detail";

const html = renderToStaticMarkup(
  <FormDetail form={climbingVineVisibleNode} plants={[{ slug: "pink-princess", commonName: "พิงค์ปริ๊นเซส" }]} />,
);

describe("หน้าทรง", () => {
  it("มีการ์ดของทุกจุดสังเกต", () => {
    for (const landmark of climbingVineVisibleNode.landmarks) {
      expect(html, `ไม่มีการ์ดของ ${landmark.id}`).toContain(landmark.term);
      expect(html).toContain(landmark.howToFind);
    }
  });

  it("บอกตำแหน่งตัดเป็นระยะจากจุดอ้างอิงที่ชี้ได้ ไม่ใช่คำลอย ๆ", () => {
    expect(html).toContain("10");
    expect(html).toContain("ใต้");
    expect(html).toContain("ข้อ");
  });

  it("แสดงระดับหลักฐานของตำแหน่งตัด", () => {
    expect(html).toContain("ระดับหลักฐาน");
  });

  it("บอกตรง ๆ เมื่อทรงยังไม่มีภาพ และเสนอทางเลือกแทนการเงียบ", () => {
    expect(html).toContain("ยังไม่มีภาพ");
  });

  it("ลิงก์ไปพืชที่มีคู่มือเฉพาะในทรงนี้", () => {
    expect(html).toContain('href="/guide/pink-princess"');
    expect(html).toContain("พิงค์ปริ๊นเซส");
  });

  it("มีทางออกเมื่อผู้ใช้มาผิดทรง", () => {
    expect(html).toContain('href="/find"');
  });

  it("ทรงที่ไม่มีพืชที่มีคู่มือเฉพาะ บอกตรง ๆ ไม่เงียบ", () => {
    const empty = renderToStaticMarkup(<FormDetail form={climbingVineVisibleNode} plants={[]} />);
    expect(empty).toContain("ยังไม่มีพืชชนิดใดในทรงนี้ที่มีคู่มือเฉพาะ");
  });
});
