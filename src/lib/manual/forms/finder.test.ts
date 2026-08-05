import { describe, expect, it } from "vitest";

import { formById } from "./registry";
import { finderQuestions, resolveFinder } from "./finder";

describe("การไล่คำถามหาทรง", () => {
  it("ยังไม่ตอบอะไรเลย ได้คำถามแรก", () => {
    const { question, outcome } = resolveFinder({});
    expect(question?.key).toBe(finderQuestions[0].key);
    expect(outcome).toBeNull();
  });

  it("เถาเลื้อยที่เห็นข้อชัด จบที่ทรงเถาเลื้อยข้อชัด", () => {
    const { outcome } = resolveFinder({ stem: "vine", node: "visible" });
    expect(outcome?.formId).toBe("climbing-vine-visible-node");
    expect(outcome?.planned).toBe(false);
  });

  it("เส้นทางที่ทรงยังไม่ถูกเขียน ต้องบอกว่าวางแผนไว้แล้วแต่ยังไม่มี", () => {
    const { outcome } = resolveFinder({ stem: "rosette" });
    expect(outcome?.planned).toBe(true);
    expect(formById(outcome!.formId)).toBeNull();
  });

  it("ตอบข้อแรกแล้วยังไม่จบ ได้คำถามถัดไป", () => {
    const { question, outcome } = resolveFinder({ stem: "vine" });
    expect(question?.key).toBe("node");
    expect(outcome).toBeNull();
  });

  it("คำตอบที่ไม่มีในตัวเลือก ถือว่ายังไม่ได้ตอบ", () => {
    const { question } = resolveFinder({ stem: "มั่ว" });
    expect(question?.key).toBe("stem");
  });

  it("ทุกปลายทางที่บอกว่ามีอยู่แล้ว ต้องมีในทะเบียนทรงจริง", () => {
    const paths = [
      { stem: "vine", node: "visible" },
      { stem: "vine", node: "faint" },
      { stem: "rosette" },
      { stem: "rhizome" },
      { stem: "leaf-only" },
    ];
    for (const answers of paths) {
      const { outcome } = resolveFinder(answers);
      expect(outcome, `${JSON.stringify(answers)} ไม่ได้ปลายทาง`).not.toBeNull();
      if (!outcome!.planned) {
        expect(formById(outcome!.formId), `${outcome!.formId} ไม่มีในทะเบียน`).not.toBeNull();
      }
    }
  });
});
