import { describe, expect, it } from "vitest";
import { resolveManual } from "./resolve";
import type { ManualStepDef, PlantPack } from "./types";

const step = (id: string, title: string): ManualStepDef => ({
  id,
  title,
  summary: `สรุปของ ${title}`,
  why: `เหตุผลของ ${title}`,
  materials: ["อุปกรณ์ตัวอย่าง"],
  actions: ["ลงมือทำตามตัวอย่าง"],
  passCriteria: ["ผ่านตามตัวอย่าง"],
  stopConditions: ["หยุดตามตัวอย่าง"],
  safetyNotes: [],
  measurements: [],
  evidence: { level: "adapted", sourceIds: ["source-example"] },
  durationMinutes: 10,
});

const library: Record<string, ManualStepDef> = {
  receive: step("receive", "รับต้น"),
  sterilize: step("sterilize", "ฟอกฆ่าเชื้อ"),
  multiply: step("multiply", "เพิ่มจำนวนยอด"),
};

const basePack: PlantPack = {
  slug: "demo-plant",
  scientificName: "Demo plant",
  commonName: "ต้นตัวอย่าง",
  method: "nodal",
  summary: "คู่มือตัวอย่าง",
  durationLabel: "1 เดือน",
  sequence: ["receive", "sterilize", "multiply"],
  sourceIds: ["source-example"],
  mediaRecipes: [],
};

describe("resolveManual", () => {
  it("เรียงขั้นตามลำดับใน sequence และใส่ order ให้", () => {
    const manual = resolveManual({ ...basePack, sequence: ["sterilize", "receive"] }, library);

    expect(manual.steps.map((item) => item.id)).toEqual(["sterilize", "receive"]);
    expect(manual.steps.map((item) => item.order)).toEqual([0, 1]);
    expect(manual.steps.every((item) => item.origin === "core")).toBe(true);
  });

  it("ถอดขั้นที่ไม่อยู่ใน sequence ออก", () => {
    const manual = resolveManual({ ...basePack, sequence: ["receive", "sterilize"] }, library);

    expect(manual.steps.map((item) => item.id)).not.toContain("multiply");
  });

  it("ทับเฉพาะฟิลด์ที่ override ระบุ และคงฟิลด์อื่นไว้", () => {
    const manual = resolveManual(
      { ...basePack, overrides: { sterilize: { title: "ฟอกด้วยไฮเตอร์", durationMinutes: 30 } } },
      library,
    );
    const sterilize = manual.steps.find((item) => item.id === "sterilize");

    expect(sterilize?.title).toBe("ฟอกด้วยไฮเตอร์");
    expect(sterilize?.durationMinutes).toBe(30);
    expect(sterilize?.summary).toBe("สรุปของ ฟอกฆ่าเชื้อ");
    expect(sterilize?.origin).toBe("override");
  });

  it("ใช้ขั้นที่แผ่นเสริมเขียนเองได้ และทำเครื่องหมายว่ามาจาก pack", () => {
    const manual = resolveManual(
      {
        ...basePack,
        sequence: ["receive", "callus-induction"],
        steps: { "callus-induction": step("callus-induction", "ชักนำให้เกิด callus") },
      },
      library,
    );

    expect(manual.steps.map((item) => item.id)).toEqual(["receive", "callus-induction"]);
    expect(manual.steps[1].origin).toBe("pack");
  });

  it("โยน error เมื่อ sequence อ้างขั้นที่ไม่มีทั้งในแกนกลางและในแผ่นเสริม", () => {
    expect(() => resolveManual({ ...basePack, sequence: ["receive", "ไม่มีจริง"] }, library))
      .toThrow("ไม่พบขั้นตอน ไม่มีจริง");
  });

  it("โยน error เมื่อ override ไปทับขั้นที่แผ่นเสริมเป็นเจ้าของเอง", () => {
    expect(() => resolveManual(
      {
        ...basePack,
        sequence: ["callus-induction"],
        steps: { "callus-induction": step("callus-induction", "ชักนำให้เกิด callus") },
        overrides: { "callus-induction": { title: "ห้ามทับ" } },
      },
      library,
    )).toThrow("ขั้นตอน callus-induction เป็นของแผ่นเสริมอยู่แล้ว");
  });

  it("โยน error เมื่อ sequence มีขั้นซ้ำ", () => {
    expect(() => resolveManual({ ...basePack, sequence: ["receive", "receive"] }, library))
      .toThrow("ขั้นตอน receive ถูกใส่ใน sequence ซ้ำ");
  });
});
