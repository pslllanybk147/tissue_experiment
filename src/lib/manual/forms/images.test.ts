import { existsSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { growthForms } from "./registry";

const imagesDir = join(process.cwd(), "public", "forms");

/** ทรงที่ประกาศภาพไว้แล้วเท่านั้น ทรงที่ยังไม่มีภาพไม่ผิดกฎข้อใด */
const withImage = growthForms.flatMap((form) =>
  form.referenceImage ? [{ form, image: form.referenceImage }] : [],
);

describe("กฎของภาพอ้างอิงของทรง", () => {
  it("ทุกไฟล์ที่อ้างต้องมีอยู่จริงใน public/forms", () => {
    for (const { form, image } of withImage) {
      expect(existsSync(join(imagesDir, image.file)), `${form.id} อ้างไฟล์ ${image.file} ที่ไม่มีอยู่`).toBe(true);
    }
  });

  it("คำบรรยายภาพต้องยาวพอที่จะบรรยายโครงสร้างได้จริง", () => {
    for (const { form, image } of withImage) {
      expect(image.alt.trim().length, `${form.id} มี alt สั้นเกินกว่าจะช่วยคนที่มองไม่เห็นภาพ`).toBeGreaterThan(20);
    }
  });

  it("ต้องบอกชนิดที่อยู่ในภาพและคนถ่ายเสมอ", () => {
    for (const { form, image } of withImage) {
      expect(image.speciesShown.trim().length, `${form.id} ไม่บอกชนิดที่อยู่ในภาพ`).toBeGreaterThan(0);
      expect(image.credit.trim().length, `${form.id} ไม่บอกคนถ่าย`).toBeGreaterThan(0);
    }
  });

  it("ใบอนุญาตต้องเป็น CC BY-SA 4.0 เท่านั้น", () => {
    for (const { form, image } of withImage) {
      expect(image.license, `${form.id} ใช้ใบอนุญาตอื่น`).toBe("CC BY-SA 4.0");
    }
  });

  it("ขนาดภาพต้องเป็นบวก เพราะใช้คำนวณภาพซูม", () => {
    for (const { form, image } of withImage) {
      expect(image.width, `${form.id} ความกว้างไม่ถูกต้อง`).toBeGreaterThan(0);
      expect(image.height, `${form.id} ความสูงไม่ถูกต้อง`).toBeGreaterThan(0);
    }
  });

  it("ภาพต้องไม่กว้างเกิน 1400 px และไฟล์ต้องไม่เกิน 250 KB", () => {
    // ข้อจำกัดนี้อยู่ในสเปกส่วนที่ 5 ถ้าไม่บังคับด้วยเทสต์ ไฟล์จากกล้องมือถือ
    // ขนาดหลายเมกะไบต์จะหลุดเข้า repo โดยไม่มีใครทักท้วง
    for (const { form, image } of withImage) {
      expect(image.width, `${form.id} ภาพกว้างเกิน 1400 px`).toBeLessThanOrEqual(1400);
      const bytes = statSync(join(imagesDir, image.file)).size;
      expect(bytes, `${form.id} ไฟล์ใหญ่ ${Math.round(bytes / 1024)} KB เกิน 250 KB`).toBeLessThanOrEqual(
        250 * 1024,
      );
    }
  });

  it("พิกัดของทุกจุดสังเกตต้องอยู่ในช่วง 0 ถึง 1", () => {
    for (const { form } of withImage) {
      for (const landmark of form.landmarks) {
        if (!landmark.point) continue;
        expect(landmark.point.x, `${form.id}/${landmark.id} x หลุดกรอบ`).toBeGreaterThanOrEqual(0);
        expect(landmark.point.x, `${form.id}/${landmark.id} x หลุดกรอบ`).toBeLessThanOrEqual(1);
        expect(landmark.point.y, `${form.id}/${landmark.id} y หลุดกรอบ`).toBeGreaterThanOrEqual(0);
        expect(landmark.point.y, `${form.id}/${landmark.id} y หลุดกรอบ`).toBeLessThanOrEqual(1);
      }
    }
  });
});
