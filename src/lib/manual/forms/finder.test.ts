import { describe, expect, it } from "vitest";

import { formById, growthForms } from "./registry";
import { finderQuestions, resolveFinder } from "./finder";

/** ทุกเส้นทางที่ผู้ใช้เดินได้จริง ใช้ยืนยันว่าไม่มีทางไหนตกหล่น */
const allPaths = [
  { stem: "vine", texture: "soft" },
  { stem: "vine", texture: "woody" },
  { stem: "vine", texture: "hollow" },
  { stem: "upright", texture: "soft" },
  { stem: "upright", texture: "woody" },
  { stem: "upright", texture: "hollow" },
  { stem: "leaf-only", leaf: "thick" },
  { stem: "leaf-only", leaf: "thin" },
  { stem: "leaf-only", leaf: "frond" },
  { stem: "underground", bulb: "yes" },
  { stem: "underground", bulb: "no" },
  { stem: "mat" },
  { stem: "none" },
];

describe("การไล่คำถามหาทรง", () => {
  it("ยังไม่ตอบอะไรเลย ได้คำถามแรก", () => {
    const { question, outcome } = resolveFinder({});
    expect(question?.key).toBe(finderQuestions[0].key);
    expect(outcome).toBeNull();
  });

  it("เถาเลื้อยเนื้ออ่อน จบที่ทรงเถาเลื้อยข้อชัด", () => {
    const { outcome } = resolveFinder({ stem: "vine", texture: "soft" });
    expect(outcome?.formId).toBe("climbing-vine-visible-node");
    expect(outcome?.planned).toBe(false);
  });

  it("ตอบข้อแรกแล้วยังไม่จบ ได้คำถามถัดไปที่ตรงกับเส้นทางนั้น", () => {
    expect(resolveFinder({ stem: "vine" }).question?.key).toBe("texture");
    expect(resolveFinder({ stem: "leaf-only" }).question?.key).toBe("leaf");
    expect(resolveFinder({ stem: "underground" }).question?.key).toBe("bulb");
  });

  it("ต้นที่ไม่เข้าทรงไหนเลย จบทันทีและบอกว่ายังไม่ครอบคลุม", () => {
    const { question, outcome } = resolveFinder({ stem: "none" });
    expect(question).toBeNull();
    expect(outcome?.planned).toBe(true);
    expect(formById(outcome!.formId)).toBeNull();
  });

  it("คำตอบที่ไม่มีในตัวเลือก ถือว่ายังไม่ได้ตอบ", () => {
    expect(resolveFinder({ stem: "มั่ว" }).question?.key).toBe("stem");
    expect(resolveFinder({ stem: "vine", texture: "มั่ว" }).question?.key).toBe("texture");
  });

  it("ทุกเส้นทางต้องมีปลายทาง ไม่มีทางไหนตัน", () => {
    for (const answers of allPaths) {
      const { outcome } = resolveFinder(answers);
      expect(outcome, `${JSON.stringify(answers)} ไม่ได้ปลายทาง`).not.toBeNull();
    }
  });

  it("ปลายทางที่บอกว่ามีอยู่แล้ว ต้องมีในทะเบียนทรงจริง", () => {
    for (const answers of allPaths) {
      const { outcome } = resolveFinder(answers)!;
      if (outcome!.planned) continue;
      expect(formById(outcome!.formId), `${outcome!.formId} ไม่มีในทะเบียน`).not.toBeNull();
    }
  });

  it("ทุกทรงในทะเบียนต้องมีเส้นทางเดินมาถึงได้ ไม่มีทรงที่เขียนแล้วแต่ผู้ใช้หาไม่เจอ", () => {
    const reachable = new Set(
      allPaths.map((answers) => resolveFinder(answers).outcome!.formId),
    );
    for (const form of growthForms) {
      expect(reachable.has(form.id), `${form.id} เขียนแล้วแต่ /find เดินมาไม่ถึง`).toBe(true);
    }
  });
});
