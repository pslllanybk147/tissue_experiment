import { describe, expect, it } from "vitest";
import type { GrowthForm } from "./forms/types";
import type { GenusPack } from "./genera/types";
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
    const manual = resolveManual({ ...basePack, sequence: ["sterilize", "receive"] }, { library });

    expect(manual.steps.map((item) => item.id)).toEqual(["sterilize", "receive"]);
    expect(manual.steps.map((item) => item.order)).toEqual([0, 1]);
    expect(manual.steps.every((item) => item.origin === "core")).toBe(true);
  });

  it("ถอดขั้นที่ไม่อยู่ใน sequence ออก", () => {
    const manual = resolveManual({ ...basePack, sequence: ["receive", "sterilize"] }, { library });

    expect(manual.steps.map((item) => item.id)).not.toContain("multiply");
  });

  it("ทับเฉพาะฟิลด์ที่ override ระบุ และคงฟิลด์อื่นไว้", () => {
    const manual = resolveManual(
      { ...basePack, overrides: { sterilize: { title: "ฟอกด้วยไฮเตอร์", durationMinutes: 30 } } },
      { library },
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
      { library },
    );

    expect(manual.steps.map((item) => item.id)).toEqual(["receive", "callus-induction"]);
    expect(manual.steps[1].origin).toBe("pack");
  });

  it("โยน error เมื่อ sequence อ้างขั้นที่ไม่มีทั้งในแกนกลางและในแผ่นเสริม", () => {
    expect(() => resolveManual({ ...basePack, sequence: ["receive", "ไม่มีจริง"] }, { library }))
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
      { library },
    )).toThrow("ขั้นตอน callus-induction เป็นของแผ่นเสริมอยู่แล้ว");
  });

  it("โยน error เมื่อ sequence มีขั้นซ้ำ", () => {
    expect(() => resolveManual({ ...basePack, sequence: ["receive", "receive"] }, { library }))
      .toThrow("ขั้นตอน receive ถูกใส่ใน sequence ซ้ำ");
  });
});

const cascadeForm: GrowthForm = {
  id: "form-demo",
  label: "ทรงตัวอย่าง",
  plainDescription: "",
  landmarks: [],
  defaultExplant: {
    landmarkId: "node",
    offsetMm: 10,
    direction: "below",
    sizeMm: [15, 20],
    evidence: { level: "adapted", sourceIds: ["source-example"] },
  },
  beginnerDifficulty: 1,
  whyThisDifficulty: "",
  stepOverrides: { sterilize: { title: "จากทรง" } },
};

const cascadeGenus: GenusPack = {
  id: "genus-demo",
  growthFormId: "form-demo",
  scientificName: "Demo",
  commonNames: [],
  deviations: { sterilize: { title: "จากสกุล" } },
  sourceIds: [],
};

describe("การประกอบคู่มือแบบต่อชั้น core → form → genus → species", () => {
  const sterilizeOf = (pack: PlantPack, form?: GrowthForm, genus?: GenusPack) =>
    resolveManual(pack, { library, form, genus }).steps.find((item) => item.id === "sterilize")!;

  it("ไม่มีชั้นบนเลย ใช้ค่าจากแกนกลาง", () => {
    const found = sterilizeOf(basePack);
    expect(found.title).toBe("ฟอกฆ่าเชื้อ");
    expect(found.origin).toBe("core");
  });

  it("ทรงทับแกนกลาง", () => {
    const found = sterilizeOf(basePack, cascadeForm);
    expect(found.title).toBe("จากทรง");
    expect(found.origin).toBe("form");
  });

  it("สกุลทับทรง", () => {
    const found = sterilizeOf(basePack, cascadeForm, cascadeGenus);
    expect(found.title).toBe("จากสกุล");
    expect(found.origin).toBe("genus");
  });

  it("ชนิดทับสกุล", () => {
    const found = sterilizeOf(
      { ...basePack, overrides: { sterilize: { title: "จากชนิด" } } },
      cascadeForm,
      cascadeGenus,
    );
    expect(found.title).toBe("จากชนิด");
    expect(found.origin).toBe("override");
  });

  it("ชั้นบนที่ไม่ได้พูดถึงฟิลด์ไหน ฟิลด์นั้นตกทอดลงมา", () => {
    const found = sterilizeOf(
      { ...basePack, overrides: { sterilize: { summary: "เฉพาะชนิด" } } },
      cascadeForm,
      cascadeGenus,
    );
    expect(found.title).toBe("จากสกุล");
    expect(found.summary).toBe("เฉพาะชนิด");
  });

  it("ขั้นที่แผ่นเสริมเขียนเอง ไม่ถูกชั้นทรงหรือสกุลทับ", () => {
    const manual = resolveManual(
      {
        ...basePack,
        sequence: ["sterilize"],
        steps: { sterilize: step("sterilize", "เขียนเองทั้งขั้น") },
      },
      { library, form: cascadeForm, genus: cascadeGenus },
    );
    expect(manual.steps[0].title).toBe("เขียนเองทั้งขั้น");
    expect(manual.steps[0].origin).toBe("pack");
  });
});
