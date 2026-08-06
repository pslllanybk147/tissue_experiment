import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { climbingVineVisibleNode } from "@/lib/manual/forms/climbing-vine-visible-node";
import type { GrowthForm } from "@/lib/manual/forms/types";
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

const withPhoto: GrowthForm = {
  ...climbingVineVisibleNode,
  referenceImage: {
    file: "demo.jpg",
    speciesShown: "Philodendron hederaceum",
    credit: "เจ้าของระบบ",
    license: "CC BY-SA 4.0",
    alt: "ลำต้นเลื้อยที่เห็นวงนูนของข้อเป็นระยะ พร้อมรากอากาศงอกจากข้อ",
    width: 1200,
    height: 900,
  },
  landmarks: climbingVineVisibleNode.landmarks.map((landmark, index) =>
    index === 0 ? { ...landmark, point: { x: 0.4, y: 0.3 } } : landmark,
  ),
};

describe("หน้าทรงที่มีภาพ", () => {
  const photoHtml = renderToStaticMarkup(<FormDetail form={withPhoto} plants={[]} />);

  it("แสดงภาพพร้อมคำบรรยายสำหรับคนที่มองไม่เห็นภาพ", () => {
    expect(photoHtml).toContain('src="/forms/demo.jpg"');
    expect(photoHtml).toContain("ลำต้นเลื้อยที่เห็นวงนูนของข้อเป็นระยะ");
  });

  it("บอกชนิดที่อยู่ในภาพ คนถ่าย และใบอนุญาต", () => {
    expect(photoHtml).toContain("Philodendron hederaceum");
    expect(photoHtml).toContain("เจ้าของระบบ");
    expect(photoHtml).toContain("CC BY-SA 4.0");
  });

  it("บอกตรง ๆ ว่าภาพนี้ไม่ใช่ภาพของทุกชนิดในทรง", () => {
    expect(photoHtml).toContain("ไม่ใช่ภาพของทุกชนิดในทรง");
  });

  it("วางหมุดเฉพาะจุดที่มีพิกัด และวางด้วยเปอร์เซ็นต์", () => {
    expect(photoHtml).toContain("left:40%");
    expect(photoHtml).toContain("top:30%");
  });

  it("ทรงที่มีภาพแล้ว ต้องไม่แสดงกล่องว่ายังไม่มีภาพ", () => {
    expect(photoHtml).not.toContain("ยังไม่มีภาพอ้างอิง");
  });

  it("กำหนดขนาดภาพไว้ล่วงหน้าเพื่อไม่ให้หน้ากระตุกตอนโหลด", () => {
    expect(photoHtml).toContain('width="1200"');
    expect(photoHtml).toContain('height="900"');
  });
});
