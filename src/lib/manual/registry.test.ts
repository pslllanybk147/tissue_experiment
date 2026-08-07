import { describe, expect, it } from "vitest";
import { allSlugs, packBySlug, plantPacks, resolveBySlug } from "./registry";

describe("manual registry", () => {
  it("มีแผ่นเสริมสี่ชนิดและ slug ไม่ซ้ำกัน", () => {
    expect(allSlugs()).toEqual([
      "pink-princess",
      "violin-variegated",
      "thai-constellation",
      "generic-philodendron",
    ]);
    expect(new Set(allSlugs()).size).toBe(plantPacks.length);
  });

  it("resolve ได้ครบทุกแผ่นเสริมโดยไม่โยน error", () => {
    for (const slug of allSlugs()) {
      const manual = resolveBySlug(slug);
      expect(manual, `${slug} ต้อง resolve ได้`).not.toBeNull();
      expect(manual!.steps.length).toBeGreaterThan(0);
    }
  });

  it("คู่มือ Pink Princess มี 15 ขั้นตามลำดับแกนกลาง", () => {
    const manual = resolveBySlug("pink-princess");

    expect(manual!.steps).toHaveLength(15);
    expect(manual!.steps[0].id).toBe("receive");
    expect(manual!.steps[14].id).toBe("close-round");
  });

  it("ขั้นฟอกฆ่าเชื้อของ Pink Princess ยังไม่มีงานรองรับ", () => {
    const sterilize = resolveBySlug("pink-princess")!.steps.find((item) => item.id === "sterilize");

    expect(sterilize!.evidence.level).toBe("unsupported");
    expect(sterilize!.evidence.note).toContain("ปลอดเชื้ออยู่แล้ว");
  });

  it("ขั้นเพิ่มจำนวนยอดของ Pink Princess อ้างงานปี 2023 และใช้ BAP 1.0 เดี่ยว", () => {
    const manual = resolveBySlug("pink-princess")!;
    const multiply = manual.steps.find((item) => item.id === "multiply");
    const recipe = manual.mediaRecipes.find((item) => item.id === "multiplication");
    const bap = recipe!.ingredients.find((item) => item.name === "BAP");

    expect(multiply!.evidence.level).toBe("species-direct");
    expect(multiply!.evidence.sourceIds).toContain("source-pp-2023");
    expect(bap!.amountPerLiter).toBe(1);
    expect(recipe!.ingredients.some((item) => item.name === "NAA")).toBe(false);
  });

  it("สูตรออกรากของ Pink Princess ใช้ IBA 3.0", () => {
    const rooting = resolveBySlug("pink-princess")!.mediaRecipes.find((item) => item.id === "rooting");
    const iba = rooting!.ingredients.find((item) => item.name === "IBA");

    expect(iba!.amountPerLiter).toBe(3);
    expect(rooting!.evidence.level).toBe("species-direct");
  });

  it("ขั้นเพิ่มยอดอ้างงานตรงพันธุ์สองชิ้นที่ให้ผลสอดคล้องกัน", () => {
    const multiply = resolveBySlug("pink-princess")!.steps.find((item) => item.id === "multiply");

    expect(multiply!.evidence.sourceIds).toContain("source-pp-2023");
    expect(multiply!.evidence.sourceIds).toContain("source-pp-thai-2023");
  });

  it("เก็บสูตรออกรากไว้ทั้งสองทางเมื่อสองงานใช้ออกซินคนละตัว", () => {
    const recipes = resolveBySlug("pink-princess")!.mediaRecipes;
    const iba = recipes.find((item) => item.id === "rooting");
    const naa = recipes.find((item) => item.id === "rooting-naa");

    expect(iba!.ingredients.some((item) => item.name === "IBA")).toBe(true);
    expect(naa, "ต้องเก็บทางเลือก NAA ไว้ ไม่ใช่เลือกข้างเงียบ ๆ").toBeDefined();
    expect(naa!.ingredients.find((item) => item.name === "NAA")!.amountPerLiter).toBe(4);
    expect(naa!.evidence.sourceIds).toContain("source-pp-thai-2023");
  });

  it("Violin ไม่มีขั้นใดที่อ้างว่าตรงพันธุ์", () => {
    const manual = resolveBySlug("violin-variegated")!;

    expect(manual.steps.every((item) => item.evidence.level !== "species-direct")).toBe(true);
  });

  it("ทุกขั้นที่อ้างว่ามีหลักฐานต้องระบุแหล่งอ้างอิง", () => {
    for (const slug of allSlugs()) {
      for (const step of resolveBySlug(slug)!.steps) {
        if (step.evidence.level === "unsupported") continue;
        expect(step.evidence.sourceIds.length, `${slug}/${step.id} ไม่ระบุแหล่ง`).toBeGreaterThan(0);
      }
    }
  });

  it("คืนค่า null เมื่อไม่รู้จัก slug", () => {
    expect(packBySlug("ไม่มีต้นนี้")).toBeNull();
    expect(resolveBySlug("ไม่มีต้นนี้")).toBeNull();
  });
});
