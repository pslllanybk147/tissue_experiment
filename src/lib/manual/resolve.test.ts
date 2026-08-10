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

  it("สร้างรายการทำตามลำดับให้ขั้นที่ยังไม่มี execution metadata", () => {
    const manual = resolveManual(basePack, { library });
    const receive = manual.steps.find((item) => item.id === "receive")!;

    expect(receive.executionInstructions).toMatchObject([
      {
        label: "ติดรหัสต้น",
        action: "ลงมือทำตามตัวอย่าง",
        materials: ["อุปกรณ์ตัวอย่าง"],
        completion: "ผ่านตามตัวอย่าง",
      },
    ]);
  });

  it("สร้างคำสั่งเตรียมอาหารพร้อมค่า pH จริงของสูตรใน pack", () => {
    const manual = resolveManual(
      {
        ...basePack,
        sequence: ["prep-media"],
        mediaRecipes: [
          {
            id: "establishment",
            title: "ระยะตั้งต้น",
            pH: "5.7 ถึง 5.8",
            ingredients: [],
            evidence: { level: "unsupported", sourceIds: [], searchedAt: "2026-08-09", searchQueries: ["test"] },
          },
          {
            id: "rooting",
            title: "ระยะออกราก",
            pH: "6.5",
            ingredients: [],
            evidence: { level: "unsupported", sourceIds: [], searchedAt: "2026-08-09", searchQueries: ["test"] },
          },
        ],
      },
      {
        library: {
          ...library,
          "prep-media": {
            ...step("prep-media", "ทำอาหารและเตรียมของ"),
          },
        },
      },
    );

    const instructions = manual.steps[0].executionInstructions ?? [];
    const phInstruction = instructions.find((item) => item.label === "ปรับ pH");
    expect(phInstruction?.action).toContain("ปรับ pH ให้ตรงกับค่าเป้าหมายของสูตรที่เลือก");
    expect(phInstruction?.quantity).toContain("ระยะตั้งต้น: pH 5.7 ถึง 5.8");
    expect(phInstruction?.quantity).toContain("ระยะออกราก: pH 6.5");
    expect(instructions.map((item) => item.action).join(" ")).not.toContain("ช่วงของสูตร");
  });

  it("ไม่แสดงคำสั่งเก่าที่ให้เปิดเครื่องคำนวณ NaDCC แยกจาก protocol", () => {
    const manual = resolveManual(
      {
        ...basePack,
        sequence: ["prep-media"],
        mediaRecipes: [],
      },
      {
        library: {
          ...library,
          "prep-media": { ...step("prep-media", "ทำอาหารและเตรียมของ") },
        },
      },
    );

    const text = manual.steps[0].executionInstructions?.map((item) => `${item.label} ${item.action}`).join(" ") ?? "";
    expect(text).not.toContain("เปิดเครื่องคำนวณ NaDCC แยกต่างหาก");
    expect(text).not.toContain("ไม่ใช่ขั้นบังคับของสูตรหลัก");
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

  it("รักษาคำสั่งปฏิบัติแบบมี metadata ผ่านการ resolve", () => {
    const manual = resolveManual(
      {
        ...basePack,
        overrides: {
          sterilize: {
            executionInstructions: [
              {
                label: "เตรียมภาชนะ S",
                action: "วางกระปุก S ไว้ด้านซ้ายของพื้นที่ทำงาน",
                container: "S",
                completion: "กระปุก S มีป้ายตรงกับ protocol",
              },
            ],
          },
        },
      },
      { library },
    );

    const instructions = manual.steps.find((item) => item.id === "sterilize")?.executionInstructions ?? [];
    expect(instructions[0]).toEqual({
      label: "เตรียมภาชนะ S",
      action: "วางกระปุก S ไว้ด้านซ้ายของพื้นที่ทำงาน",
      container: "S",
      completion: "กระปุก S มีป้ายตรงกับ protocol",
    });
    expect(instructions.some((item) => item.quantity?.includes("300 ppm"))).toBe(true);
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

const doseEvidence = { level: "adapted" as const, sourceIds: ["source-example"] };

const sampleDose = {
  form: "น้ำยาซักผ้าขาว NaOCl 6%",
  low: 0.8,
  high: 2,
  unit: "%" as const,
  durationMin: [10, 20] as [number, number],
  movesLowerWhen: ["เนื้อด่างมาก"],
  movesHigherWhen: ["ต้นกลางแจ้ง"],
  evidence: doseEvidence,
};

describe("ค่าช่วงไหลตาม cascade", () => {
  it("ค่าช่วงจากทรงไหลลงมาถึงคู่มือ", () => {
    const formWithDose = { ...cascadeForm, defaultDoses: { "sterilize.dose": sampleDose } } as GrowthForm;
    const manual = resolveManual(basePack, { library, form: formWithDose });
    expect(manual.steps.find((item) => item.id === "sterilize")?.doses?.["sterilize.dose"]?.low).toBe(0.8);
  });

  it("ค่าช่วงของสกุลทับของทรงด้วยคีย์เดียวกัน", () => {
    const formWithDose = { ...cascadeForm, defaultDoses: { "sterilize.dose": sampleDose } } as GrowthForm;
    const genusWithDose = { ...cascadeGenus, doses: { "sterilize.dose": { ...sampleDose, low: 1.0, high: 1.6 } } };
    const manual = resolveManual(basePack, { library, form: formWithDose, genus: genusWithDose });
    const found = manual.steps.find((item) => item.id === "sterilize")?.doses?.["sterilize.dose"];
    expect(found?.low).toBe(1.0);
    expect(found?.high).toBe(1.6);
  });

  it("ขั้นที่ไม่มีค่าช่วง ต้องไม่มีฟิลด์ doses ติดมา", () => {
    const manual = resolveManual(basePack, { library });
    expect(manual.steps.find((item) => item.id === "receive")?.doses).toBeUndefined();
  });
});

describe("ค่าช่วงที่ให้มากับขั้นโดยตรง", () => {
  it("ค่าช่วงที่สกุลให้ผ่าน deviations ต้องไม่หายไป", () => {
    // บั๊กจริงที่เจอตอนเปิดดูของจริง บรรทัด doses ที่วางหลัง spread เคยทับค่าที่ spread ใส่มา
    const genusWithStepDose = {
      ...cascadeGenus,
      deviations: { sterilize: { doses: { "sterilize.dose": sampleDose } } },
    };
    const manual = resolveManual(basePack, { library, genus: genusWithStepDose });
    expect(manual.steps.find((item) => item.id === "sterilize")?.doses?.["sterilize.dose"]?.low).toBe(0.8);
  });

  it("ค่าช่วงที่ทรงให้ผ่าน stepOverrides ต้องไม่หายไป", () => {
    const formWithStepDose = {
      ...cascadeForm,
      stepOverrides: { sterilize: { doses: { "sterilize.dose": sampleDose } } },
    } as GrowthForm;
    const manual = resolveManual(basePack, { library, form: formWithStepDose });
    expect(manual.steps.find((item) => item.id === "sterilize")?.doses?.["sterilize.dose"]?.low).toBe(0.8);
  });

  it("ชั้นล่างชนะชั้นบนเสมอ ชนิดทับสกุล", () => {
    const genusWithStepDose = {
      ...cascadeGenus,
      deviations: { sterilize: { doses: { "sterilize.dose": sampleDose } } },
    };
    const manual = resolveManual(
      { ...basePack, overrides: { sterilize: { doses: { "sterilize.dose": { ...sampleDose, low: 1.5 } } } } },
      { library, genus: genusWithStepDose },
    );
    expect(manual.steps.find((item) => item.id === "sterilize")?.doses?.["sterilize.dose"]?.low).toBe(1.5);
  });
});
