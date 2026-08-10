import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { resolveBySlug } from "@/lib/manual/registry";
import { MediumCalculator } from "./medium-calculator";

const recipes = resolveBySlug("pink-princess")!.mediaRecipes;

describe("MediumCalculator", () => {
  it("บอกว่าเครื่องมือนี้ทำอะไร ด้วยภาษาที่ผู้ใช้เข้าใจ", () => {
    const html = renderToStaticMarkup(<MediumCalculator recipes={recipes} />);

    expect(html).toContain("จะทำอาหารเท่าไหร่");
    expect(html).toContain("cl-medium-calculator");
    expect(html).not.toContain("pl-card");
  });

  it("ให้เลือกสูตรได้เมื่อคู่มือมีหลายสูตร", () => {
    const html = renderToStaticMarkup(<MediumCalculator recipes={recipes} />);

    expect(html).toContain("<select");
    for (const recipe of recipes) {
      expect(html, `ขาดตัวเลือก ${recipe.title}`).toContain(recipe.title);
    }
  });

  it("ช่องกรอกทุกช่องมีป้ายผูกกับช่องจริง", () => {
    const html = renderToStaticMarkup(<MediumCalculator recipes={recipes} />);
    const inputIds = [...html.matchAll(/<input[^>]*id="([^"]+)"/g)].map((match) => match[1]);

    expect(inputIds.length).toBeGreaterThan(4);
    for (const id of inputIds) {
      expect(html, `ช่อง ${id} ไม่มี label ผูกไว้`).toContain(`for="${id}"`);
    }
  });

  it("แสดงปริมาตรรวมพร้อมที่มาว่ามาจากกี่กระปุกและเผื่อเท่าไร", () => {
    const html = renderToStaticMarkup(<MediumCalculator recipes={recipes} />);

    expect(html).toContain("รวมต้องทำอาหาร");
    expect(html).toContain("มิลลิลิตร");
    expect(html).toContain("กระปุก");
  });

  it("สารที่ชั่งไม่ได้ต้องขึ้นว่าชั่งไม่ได้ ไม่ใช่ปัดเศษให้ดูสวย", () => {
    // สูตรเพิ่มจำนวนยอดมี BAP 1 mg/L ซึ่งเมื่อทำไม่กี่กระปุกจะได้มวลต่ำกว่าที่เครื่องชั่งอ่านได้
    const html = renderToStaticMarkup(<MediumCalculator recipes={recipes} initialRecipeId="multiplication" />);

    expect(html).toContain("ชั่งไม่ได้");
    expect(html).toContain("น้ำยาแม่");
  });

  it("แสดงระดับหลักฐานและช่วงต้านการดำพร้อมปริมาณตาม batch", () => {
    const html = renderToStaticMarkup(<MediumCalculator recipes={recipes} initialRecipeId="multiplication" />);

    expect(html).toContain("ระดับหลักฐาน");
    expect(html).toContain("ถ้าเจอชิ้นพืชดำ");
    expect(html).toContain("วิตามินซี");
    expect(html).toContain("กรดซิตริก");
  });

  it("ไม่แอบใช้สูตรแรกแทนสูตรออกรากเมื่อคู่มือยังไม่มีสูตรราก", () => {
    const html = renderToStaticMarkup(<MediumCalculator recipes={recipes} initialRecipeId="rooting-missing" />);

    expect(html).toContain("ยังไม่มีสูตรอาหารของขั้นนี้ในระบบ");
    expect(html).not.toContain("MS basal salts");
  });

  it("แสดง BA และ BAP เป็น stock คนละช่องและเตือนให้ตรวจฉลาก", () => {
    const html = renderToStaticMarkup(<MediumCalculator recipes={recipes} />);

    expect(html).toContain("BA stock");
    expect(html).toContain("BAP stock");
    expect(html).toContain("ตรวจชื่อบนฉลากให้ตรงกับชื่อในสูตร");
    expect(html).not.toContain("BA/BAP stock");
  });
});
