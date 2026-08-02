# Manual Content Core Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** สร้างแหล่งเนื้อหาคู่มือแหล่งเดียวที่ประกอบจากแกนกลางบวกแผ่นเสริมรายชนิด แทนเนื้อหา 3 แหล่งที่ไหลออกจากกัน โดยไม่แตะ UI ที่ผู้ใช้เห็น

**Architecture:** แกนกลางเป็นคลังขั้นตอนแบบ map ไม่ใช่ array แผ่นเสริมรายชนิดกำหนด `sequence` เองว่าจะหยิบขั้นไหนมาเรียงยังไง ทับค่าอะไร และเพิ่มขั้นของตัวเองอะไร ตัว resolve รับ library เข้ามาเป็นพารามิเตอร์เพื่อให้เทสต์ด้วย fixture เล็ก ๆ ได้ แล้ว registry เป็นตัวเดียวที่ผูก library จริงเข้ากับ pack จริง

**Tech Stack:** TypeScript, Next.js 16 App Router, Vitest 4, React 19

## Global Constraints

- ห้ามแตะ `src/app` และ `src/components` ที่ผู้ใช้เห็น ยกเว้น `src/app/admin/**` ที่สร้างใหม่ในแผนนี้
- ห้ามแตะ `src/lib/repositories/**`
- ข้อความที่ผู้ใช้อ่านและข้อความ error เขียนเป็นภาษาไทย ตามแบบที่มีอยู่ใน `src/lib/domain/**`
- จำนวนขั้นของคู่มือคือ **14** ขั้น
- ระดับหลักฐานมี 3 ค่าเท่านั้น `species-direct` `adapted` `unsupported`
- ทุกขั้นที่ `evidence.level` ไม่ใช่ `unsupported` ต้องมี `sourceIds` อย่างน้อย 1 รายการ
- สูตรระยะเพิ่มจำนวนของ Pink Princess คือ **BAP 1.0 mg/L เดี่ยว ไม่มี NAA** ตามงานปี 2023
- สูตรระยะออกรากของ Pink Princess คือ **IBA 3.0 mg/L**
- ขั้นฟอกฆ่าเชื้อของ Pink Princess เป็น `unsupported` เพราะงานต้นทางเริ่มจากเนื้อเยื่อที่ปลอดเชื้ออยู่แล้ว
- รันเทสต์ด้วย `npm test` และ lint ด้วย `npm run lint` ก่อน commit ทุกครั้ง
- `AGENTS.md` ของ repo นี้ระบุว่า Next.js เวอร์ชันที่ใช้มี breaking change จากที่คุ้นเคย **ต้องอ่านคู่มือใน `node_modules/next/dist/docs/` ก่อนเขียนโค้ดที่แตะ App Router** โดยเฉพาะเรื่อง `params` ที่เป็น Promise ใน Next 16

---

### Task 1: Manual schema and resolve engine

**Files:**
- Create: `src/lib/manual/types.ts`
- Create: `src/lib/manual/resolve.ts`
- Test: `src/lib/manual/resolve.test.ts`

**Interfaces:**
- Consumes: ไม่มี เป็นงานแรกของแผน
- Produces: `EvidenceLevel`, `Measurement`, `EvidenceRef`, `ManualStepDef`, `StepOverride`, `PlantPack`, `ResolvedStep`, `ResolvedManual`, และ `resolveManual(pack: PlantPack, library: Record<string, ManualStepDef>): ResolvedManual`

- [ ] **Step 1: Write the failing test**

สร้าง `src/lib/manual/resolve.test.ts`

```ts
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/manual/resolve.test.ts`
Expected: FAIL — resolve ยังไม่มีไฟล์ ขึ้นว่า Failed to resolve import "./resolve"

- [ ] **Step 3: Write the schema**

สร้าง `src/lib/manual/types.ts`

```ts
export type EvidenceLevel = "species-direct" | "adapted" | "unsupported";

export type MeasurementUnit = "mL" | "g" | "mg/L" | "%" | "min" | "°C" | "pH" | "count";

export type Measurement = {
  id: string;
  label: string;
  unit: MeasurementUnit;
  required: boolean;
  min?: number;
  max?: number;
};

export type EvidenceRef = {
  level: EvidenceLevel;
  sourceIds: string[];
  note?: string;
};

export type MediaIngredient = {
  name: string;
  amountPerLiter: number;
  unit: "×" | "g/L" | "mg/L";
  note?: string;
};

export type MediaRecipe = {
  id: string;
  title: string;
  pH: string;
  ingredients: MediaIngredient[];
  evidence: EvidenceRef;
};

export type ManualStepDef = {
  id: string;
  title: string;
  summary: string;
  why: string;
  materials: string[];
  actions: string[];
  passCriteria: string[];
  stopConditions: string[];
  safetyNotes: string[];
  measurements: Measurement[];
  evidence: EvidenceRef;
  illustrationId?: string;
  durationMinutes: number | null;
};

export type StepOverride = Partial<Omit<ManualStepDef, "id">>;

export type PlantPack = {
  slug: string;
  scientificName: string;
  commonName: string;
  method: string;
  summary: string;
  durationLabel: string;
  sequence: string[];
  overrides?: Record<string, StepOverride>;
  steps?: Record<string, ManualStepDef>;
  mediaRecipes: MediaRecipe[];
  sourceIds: string[];
};

export type StepOrigin = "core" | "override" | "pack";

export type ResolvedStep = ManualStepDef & { order: number; origin: StepOrigin };

export type ResolvedManual = {
  slug: string;
  scientificName: string;
  commonName: string;
  method: string;
  summary: string;
  durationLabel: string;
  steps: ResolvedStep[];
  mediaRecipes: MediaRecipe[];
  sourceIds: string[];
};
```

- [ ] **Step 4: Write the resolve engine**

สร้าง `src/lib/manual/resolve.ts`

```ts
import type { ManualStepDef, PlantPack, ResolvedManual, ResolvedStep, StepOrigin } from "./types";

export function resolveManual(pack: PlantPack, library: Record<string, ManualStepDef>): ResolvedManual {
  const seen = new Set<string>();
  const steps: ResolvedStep[] = pack.sequence.map((stepId, index) => {
    if (seen.has(stepId)) throw new Error(`ขั้นตอน ${stepId} ถูกใส่ใน sequence ซ้ำ`);
    seen.add(stepId);

    const packStep = pack.steps?.[stepId];
    const override = pack.overrides?.[stepId];

    if (packStep && override) {
      throw new Error(`ขั้นตอน ${stepId} เป็นของแผ่นเสริมอยู่แล้ว ไม่ต้องใส่ override`);
    }

    const base = packStep ?? library[stepId];
    if (!base) throw new Error(`ไม่พบขั้นตอน ${stepId} ทั้งในแกนกลางและในแผ่นเสริม`);

    const origin: StepOrigin = packStep ? "pack" : override ? "override" : "core";
    return { ...structuredClone(base), ...(override ?? {}), id: stepId, order: index, origin };
  });

  return {
    slug: pack.slug,
    scientificName: pack.scientificName,
    commonName: pack.commonName,
    method: pack.method,
    summary: pack.summary,
    durationLabel: pack.durationLabel,
    steps,
    mediaRecipes: structuredClone(pack.mediaRecipes),
    sourceIds: [...pack.sourceIds],
  };
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run src/lib/manual/resolve.test.ts`
Expected: PASS ทั้ง 7 เทสต์

- [ ] **Step 6: Run lint**

Run: `npm run lint`
Expected: ไม่มี error

- [ ] **Step 7: Commit**

```bash
git add src/lib/manual/types.ts src/lib/manual/resolve.ts src/lib/manual/resolve.test.ts
git commit -m "feat(manual): add manual schema and core plus pack resolve engine"
```

---

### Task 2: Core step library — ขั้นที่ 1 ถึง 7

**Files:**
- Create: `src/lib/manual/core-steps.ts`
- Test: `src/lib/manual/core-steps.test.ts`

**Interfaces:**
- Consumes: `ManualStepDef` จาก `./types`
- Produces: `coreSteps: Record<string, ManualStepDef>` ซึ่ง Task 3 จะเติมอีก 7 ขั้น และ Task 4 จะ import ไปใช้ใน registry

- [ ] **Step 1: Write the failing test**

สร้าง `src/lib/manual/core-steps.test.ts`

```ts
import { describe, expect, it } from "vitest";
import { coreSteps } from "./core-steps";

describe("coreSteps", () => {
  it("มีขั้นเตรียมงานครบ 7 ขั้นแรก", () => {
    expect(Object.keys(coreSteps)).toEqual([
      "receive",
      "quarantine",
      "identify",
      "select-explant",
      "cut",
      "prep-media",
      "sterilize",
    ]);
  });

  it("ทุกขั้นมีเกณฑ์ผ่านและเงื่อนไขหยุดอย่างน้อยหนึ่งข้อ", () => {
    for (const [id, step] of Object.entries(coreSteps)) {
      expect(step.passCriteria.length, `${id} ต้องมีเกณฑ์ผ่าน`).toBeGreaterThan(0);
      expect(step.stopConditions.length, `${id} ต้องมีเงื่อนไขหยุด`).toBeGreaterThan(0);
      expect(step.actions.length, `${id} ต้องมีขั้นลงมือ`).toBeGreaterThan(0);
    }
  });

  it("ขั้นที่อ้างว่ามีหลักฐานต้องระบุแหล่งอ้างอิง", () => {
    for (const [id, step] of Object.entries(coreSteps)) {
      if (step.evidence.level === "unsupported") continue;
      expect(step.evidence.sourceIds.length, `${id} อ้างว่ามีหลักฐานแต่ไม่ระบุแหล่ง`).toBeGreaterThan(0);
    }
  });

  it("id ของแต่ละขั้นตรงกับ key ที่ใช้เก็บ", () => {
    for (const [key, step] of Object.entries(coreSteps)) {
      expect(step.id).toBe(key);
    }
  });

  it("ขั้นฟอกฆ่าเชื้อเตือนเรื่องการผสมสารและบังคับบันทึกเวลา", () => {
    const sterilize = coreSteps.sterilize;

    expect(sterilize.safetyNotes.join(" ")).toContain("แอมโมเนีย");
    expect(sterilize.measurements.some((item) => item.id === "sterilize-minutes" && item.required)).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/manual/core-steps.test.ts`
Expected: FAIL — Failed to resolve import "./core-steps"

- [ ] **Step 3: Write the first seven core steps**

สร้าง `src/lib/manual/core-steps.ts`

```ts
import type { ManualStepDef } from "./types";

export const coreSteps: Record<string, ManualStepDef> = {
  receive: {
    id: "receive",
    title: "รับต้นและถ่ายรูปตั้งต้น",
    summary: "เก็บสภาพต้นก่อนเริ่มงานไว้เป็นหลักฐานเปรียบเทียบ",
    why: "ถ้าไม่มีรูปตั้งต้น จะแยกไม่ออกว่าความเปลี่ยนแปลงมาจากการเพาะเลี้ยงหรือมาจากต้นเดิม",
    materials: ["โทรศัพท์หรือกล้อง", "ป้ายรหัสต้น"],
    actions: [
      "ตั้งรหัสต้นแล้วเขียนป้ายติดไว้กับกระถาง",
      "ถ่ายรูปต้นทั้งต้นหนึ่งรูป",
      "ถ่ายรูปใบ ยอด ข้อ และรากที่มองเห็น อย่างละหนึ่งรูป",
    ],
    passCriteria: ["มีรูปต้นทั้งต้นอย่างน้อย 1 รูป", "มีรูปยอดหรือข้อที่ตั้งใจจะใช้อย่างน้อย 1 รูป"],
    stopConditions: ["ระบุไม่ได้ว่าต้นไหนคือต้นที่กำลังทำ"],
    safetyNotes: [],
    measurements: [],
    evidence: { level: "adapted", sourceIds: ["source-kew-philodendron"], note: "เป็นวิธีปฏิบัติทั่วไปของงานบันทึกผล ไม่ใช่ผลการทดลอง" },
    illustrationId: "receive-baseline",
    durationMinutes: 10,
  },
  quarantine: {
    id: "quarantine",
    title: "กักต้นและตรวจสุขภาพ",
    summary: "แยกต้นไว้สังเกตอาการก่อนตัดชิ้นส่วนไปใช้",
    why: "ต้นที่มีเชื้อหรือแมลงแฝงทำให้ทุกขั้นหลังจากนี้ปนเปื้อนตามไปด้วย",
    materials: ["พื้นที่แยกต้น", "ป้ายบอกสถานะ"],
    actions: [
      "แยกต้นออกจากต้นอื่นอย่างน้อยหนึ่งวัน",
      "ตรวจใบ ลำต้น ข้อ และรากอากาศ ว่ามีจุดดำ เมือก รา หรือแมลงไหม",
      "จดสิ่งที่เห็นจริงลงบันทึก",
    ],
    passCriteria: ["ไม่พบโรคหรือแมลงที่ควบคุมไม่ได้"],
    stopConditions: ["พบราหรือเมือกที่ลำต้น", "พบแมลงที่ยังกำจัดไม่หมด"],
    safetyNotes: ["ล้างมือและอุปกรณ์หลังจับต้นที่มีอาการผิดปกติ"],
    measurements: [],
    evidence: { level: "adapted", sourceIds: ["source-kew-philodendron"], note: "หลักการลดความเสี่ยงปนเปื้อนทั่วไป" },
    illustrationId: "quarantine-check",
    durationMinutes: 1440,
  },
  identify: {
    id: "identify",
    title: "ยืนยันว่าใช่ต้นนี้จริง",
    summary: "ตรวจว่าต้นที่มีตรงกับคู่มือที่กำลังเปิดอยู่",
    why: "แต่ละชนิดและแต่ละโคลนตอบสนองต่อสูตรต่างกัน ถ้าระบุผิดตั้งแต่ต้น ผลที่ได้จะตีความไม่ได้",
    materials: ["รูปต้นที่ถ่ายไว้", "ข้อมูลจากผู้ขาย"],
    actions: [
      "เทียบรูปใบและลายด่างกับภาพในคู่มือ",
      "เลือกระดับความมั่นใจว่า มั่นใจ ไม่แน่ใจ หรือเดา",
      "ถ้าไม่มั่นใจ ให้เปลี่ยนไปใช้คู่มือกลางของสกุลแทน",
    ],
    passCriteria: ["เลือกคู่มือที่ตรงกับต้นได้ หรือเลือกคู่มือกลางแล้ว"],
    stopConditions: ["ยังไม่รู้ว่าเป็นชนิดอะไรและไม่มีคู่มือกลางให้ใช้"],
    safetyNotes: [],
    measurements: [],
    evidence: { level: "adapted", sourceIds: ["source-kew-wcvp-v15"] },
    illustrationId: "identify-compare",
    durationMinutes: 20,
  },
  "select-explant": {
    id: "select-explant",
    title: "เลือกข้อที่จะตัด",
    summary: "หาข้อที่มีตาข้างสมบูรณ์และยังไม่แตกยอด",
    why: "ตาข้างให้ยอดใหม่ที่ยังเก็บลักษณะเดิมของต้นแม่ไว้ได้ดีกว่าการสร้างยอดแบบสุ่ม",
    materials: ["ป้ายเบอร์ข้อ", "รูปถ่าย"],
    actions: [
      "หาจุดที่ก้านใบต่อกับลำต้น ตาข้างอยู่ใกล้จุดนั้น",
      "เลือกข้อที่ตายังเขียวและไม่ช้ำ",
      "ติดเบอร์ข้อและถ่ายรูปไว้ก่อนตัด",
      "เก็บข้อสำรองไว้บนต้นแม่ อย่าตัดหมดในรอบเดียว",
    ],
    passCriteria: ["มีตาข้างที่เห็นชัดอย่างน้อยหนึ่งตา"],
    stopConditions: ["ไม่มีข้อที่ตายังสมบูรณ์"],
    safetyNotes: ["ใช้เครื่องมือที่เช็ดสะอาดแล้วเท่านั้น"],
    measurements: [],
    evidence: { level: "adapted", sourceIds: ["source-uf-shoot-cultures"], note: "หลักการ shoot tip และ axillary node ทั่วไป ไม่ใช่ภาพยืนยันรายพันธุ์" },
    illustrationId: "node-cut-diagram",
    durationMinutes: 15,
  },
  cut: {
    id: "cut",
    title: "ตัดและเตรียมชิ้นพืช",
    summary: "ตัดชิ้นที่เลือกให้มีขนาดพอฟอกและพอจับ",
    why: "ชิ้นใหญ่เกินไปฟอกไม่ทั่ว ชิ้นเล็กเกินไปบอบช้ำจนไม่ฟื้น",
    materials: ["ใบมีดหรือกรรไกรที่คมและสะอาด", "ไม้บรรทัด", "ภาชนะสะอาดใส่ชิ้นพืช"],
    actions: [
      "ตัดใต้ข้อโดยไม่ตัดผ่านตา",
      "เหลือเนื้อไว้เหนือและใต้ตาพอให้จับได้ตอนฟอก",
      "วัดความยาวชิ้นแล้วจดไว้",
    ],
    passCriteria: ["ตายังเขียวและไม่ช้ำ", "จดความยาวชิ้นแล้ว"],
    stopConditions: ["ตาช้ำหรือหลุดระหว่างตัด"],
    safetyNotes: ["ระวังของมีคม", "ระวังน้ำยางของพืชเข้าตาและผิวหนัง"],
    measurements: [{ id: "explant-length", label: "ความยาวชิ้นพืช", unit: "count", required: true, min: 1 }],
    evidence: { level: "adapted", sourceIds: ["source-uf-shoot-cultures"] },
    illustrationId: "cut-explant",
    durationMinutes: 20,
  },
  "prep-media": {
    id: "prep-media",
    title: "ทำอาหารและเตรียมของ",
    summary: "ทำอาหารตามสูตร ปรับ pH แล้วทำให้อาหารและภาชนะปลอดเชื้อ",
    why: "ความผิดพลาดช่วงเตรียมทำให้แยกไม่ออกว่ารอบนี้ล้มเหลวเพราะสูตรหรือเพราะการปนเปื้อน",
    materials: ["MS basal salts", "น้ำตาลทราย", "ผงวุ้น", "น้ำยาแม่ของฮอร์โมนตามสูตร", "เครื่องชั่ง", "เครื่องวัดหรือแถบวัด pH", "ภาชนะเพาะพร้อมฝา"],
    actions: [
      "ใช้เครื่องคำนวณในระบบเพื่อหาปริมาณตามจำนวนกระปุกที่จะทำ",
      "ชั่งและละลายตามลำดับ เกลือ น้ำตาล แล้วจึงฮอร์โมน",
      "ปรับ pH ให้อยู่ในช่วงของสูตรก่อนใส่วุ้น",
      "แบ่งลงภาชนะ ติดป้ายรหัสรอบ แล้วทำให้ปลอดเชื้อตามวิธีที่ระบบจัดให้",
    ],
    passCriteria: ["มีรหัสรอบติดที่ภาชนะทุกใบ", "pH อยู่ในช่วงที่สูตรกำหนด", "อาหารเซ็ตตัวและไม่มีฝ้าหรือตะกอนแปลกปลอม"],
    stopConditions: ["pH อยู่นอกช่วงที่สูตรกำหนด", "อาหารขึ้นฝ้าก่อนใช้งาน"],
    safetyNotes: ["สวมถุงมือกันความร้อนเมื่อยกภาชนะร้อน", "อย่าปิดฝาแน่นสนิทขณะให้ความร้อนในภาชนะปิด"],
    measurements: [
      { id: "medium-ph", label: "pH ของอาหาร", unit: "pH", required: true, min: 4, max: 7 },
      { id: "medium-volume", label: "ปริมาตรอาหารที่ทำ", unit: "mL", required: true, min: 1 },
    ],
    evidence: { level: "adapted", sourceIds: ["source-merck-media-sterilization"] },
    illustrationId: "prep-media",
    durationMinutes: 60,
  },
  sterilize: {
    id: "sterilize",
    title: "ฟอกฆ่าเชื้อ",
    summary: "ลดเชื้อบนผิวชิ้นพืชแล้วล้างสารฟอกออกให้หมด",
    why: "ฟอกอ่อนไปจะมีเชื้อขึ้นในกระปุก ฟอกแรงไปเนื้อเยื่อจะตาย จุดสมดุลต่างกันตามชนิดและความสดของชิ้นพืช",
    materials: ["สารฟอกตามที่ระบบจัดให้", "น้ำปลอดเชื้อสำหรับล้าง", "ภาชนะแช่", "ตัวจับเวลา"],
    actions: [
      "เทสารฟอกที่เจือจางแล้วลงภาชนะ ใส่ชิ้นพืชให้จมทั้งหมด",
      "เริ่มจับเวลาหลังใส่ชิ้นสุดท้ายลงไปแล้วเท่านั้น",
      "ครบเวลาแล้วล้างด้วยน้ำปลอดเชื้อ 3 รอบ รอบละประมาณหนึ่งนาที",
      "จดเวลาและจำนวนรอบที่ทำจริง ไม่ใช่ที่ตั้งใจจะทำ",
    ],
    passCriteria: ["ล้างครบตามจำนวนรอบที่จด", "เนื้อเยื่อยังเขียว ไม่ขาวซีดและไม่เปื่อย"],
    stopConditions: ["ชิ้นพืชเปลี่ยนเป็นสีขาวซีด", "ชิ้นพืชเปื่อยยุ่ยจนจับไม่ได้"],
    safetyNotes: [
      "ห้ามผสมสารฟอกกับกรด แอมโมเนีย หรือแอลกอฮอล์ เพราะเกิดแก๊สพิษ",
      "ทำในที่อากาศถ่ายเท และสวมแว่นตานิรภัย",
    ],
    measurements: [
      { id: "sterilize-minutes", label: "เวลาฟอกที่ใช้จริง", unit: "min", required: true, min: 1 },
      { id: "sterile-rinses", label: "จำนวนรอบที่ล้าง", unit: "count", required: true, min: 1 },
    ],
    evidence: { level: "unsupported", sourceIds: [], note: "เวลาและความเข้มข้นต้องมาจากแผ่นเสริมรายชนิด แกนกลางไม่ให้ตัวเลข" },
    illustrationId: "sterilize-timer",
    durationMinutes: 30,
  },
};
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/manual/core-steps.test.ts`
Expected: PASS ทั้ง 5 เทสต์

- [ ] **Step 5: Commit**

```bash
git add src/lib/manual/core-steps.ts src/lib/manual/core-steps.test.ts
git commit -m "feat(manual): add first seven core steps"
```

---

### Task 3: Core step library — ขั้นที่ 8 ถึง 14

**Files:**
- Modify: `src/lib/manual/core-steps.ts`
- Modify: `src/lib/manual/core-steps.test.ts:6-16`

**Interfaces:**
- Consumes: `coreSteps` จาก Task 2
- Produces: `coreSteps` ที่มีครบ 14 key ตามลำดับมาตรฐาน ซึ่ง Task 4 ใช้เป็น library

- [ ] **Step 1: Update the failing test**

แทนที่เทสต์ตัวแรกใน `src/lib/manual/core-steps.test.ts` ด้วยตัวนี้

```ts
  it("มีขั้นครบ 14 ขั้นตามลำดับมาตรฐาน", () => {
    expect(Object.keys(coreSteps)).toEqual([
      "receive",
      "quarantine",
      "identify",
      "select-explant",
      "cut",
      "prep-media",
      "sterilize",
      "initiate",
      "check-contamination",
      "multiply",
      "root",
      "acclimatize",
      "monitor",
      "close-round",
    ]);
  });
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/manual/core-steps.test.ts`
Expected: FAIL — array ที่ได้มีแค่ 7 รายการ ไม่ตรงกับ 14 รายการที่คาดไว้

- [ ] **Step 3: Append the remaining seven steps**

เพิ่มต่อท้าย `sterilize` ใน `src/lib/manual/core-steps.ts` ก่อนวงเล็บปิดของ `coreSteps`

```ts
  initiate: {
    id: "initiate",
    title: "วางชิ้นพืชลงอาหาร",
    summary: "วางชิ้นพืชให้ถูกด้านแล้วปิดภาชนะทันที",
    why: "ทิศทางและความลึกมีผลต่อการรอด ถ้าฝังยอดลงไปในวุ้น ยอดจะเน่าแทนที่จะแตก",
    materials: ["พื้นที่ทำงานที่เช็ดสะอาดแล้ว", "คีมและใบมีดที่ผ่านการฆ่าเชื้อ", "อาหารที่เตรียมไว้"],
    actions: [
      "ตัดปลายที่ช้ำจากการฟอกออกเล็กน้อย",
      "วางให้โคนแตะผิวอาหารพอตั้งอยู่ได้ โดยตาและยอดอยู่เหนือผิววุ้น",
      "ปิดฝาทันทีที่วางเสร็จแต่ละกระปุก",
      "เขียนวันที่และรหัสรอบบนกระปุก",
    ],
    passCriteria: ["ชิ้นพืชตั้งอยู่ได้และไม่จมวุ้น", "ปิดฝาครบทุกกระปุกโดยไม่มีรอยหก"],
    stopConditions: ["วางกลับด้าน", "ยอดจมลงไปในวุ้น"],
    safetyNotes: ["เปิดภาชนะให้สั้นที่สุด"],
    measurements: [{ id: "jars-started", label: "จำนวนกระปุกที่ลงจริง", unit: "count", required: true, min: 1 }],
    evidence: { level: "adapted", sourceIds: ["source-uf-shoot-cultures"] },
    illustrationId: "medium-placement",
    durationMinutes: 20,
  },
  "check-contamination": {
    id: "check-contamination",
    title: "ตรวจว่ามีเชื้อขึ้นไหม",
    summary: "ดูผ่านผนังภาชนะโดยไม่เปิดฝา แล้วแยกกระปุกที่มีปัญหาออก",
    why: "ต้องแยกให้ออกว่าที่ล้มเหลวคือการปนเปื้อน หรือเนื้อเยื่อตายเอง เพราะวิธีแก้คนละทาง",
    materials: ["กล้องหรือโทรศัพท์", "พื้นที่แยกกระปุกที่มีปัญหา"],
    actions: [
      "ตรวจทุกกระปุกทุกวันในสัปดาห์แรก แล้วลดเป็นสัปดาห์ละครั้ง",
      "มองหาเส้นใยฟู คือรา และเมือกขุ่นรอบโคนชิ้น คือแบคทีเรีย",
      "มองหาการเปลี่ยนเป็นสีน้ำตาลของชิ้นพืชหรือของวุ้นรอบชิ้น",
      "ถ่ายรูปทุกกระปุกที่ผิดปกติแล้วย้ายออกจากพื้นที่สะอาดทันที",
    ],
    passCriteria: ["ยังมีกระปุกที่ใสและตาเริ่มบวมหรือเขียวขึ้น"],
    stopConditions: ["ทุกกระปุกมีเชื้อขึ้น", "ชิ้นพืชดำทั้งหมดต่อเนื่องเกินหนึ่งสัปดาห์"],
    safetyNotes: ["ห้ามเปิดฝากระปุกที่ปนเปื้อนในพื้นที่สะอาด"],
    measurements: [
      { id: "jars-clean", label: "จำนวนกระปุกที่ยังใส", unit: "count", required: true, min: 0 },
      { id: "jars-contaminated", label: "จำนวนกระปุกที่มีเชื้อ", unit: "count", required: true, min: 0 },
    ],
    evidence: { level: "adapted", sourceIds: ["source-merck-media-sterilization"] },
    illustrationId: "contamination-compare",
    durationMinutes: 10080,
  },
  multiply: {
    id: "multiply",
    title: "เพิ่มจำนวนยอด",
    summary: "ย้ายยอดที่ตั้งตัวแล้วไปอาหารสูตรเพิ่มจำนวน",
    why: "เป็นช่วงที่ได้จำนวนต้นเพิ่ม แต่ก็เป็นช่วงที่ความแปรปรวนของลักษณะเกิดขึ้นมากที่สุด",
    materials: ["อาหารสูตรเพิ่มจำนวน", "ภาชนะใหม่", "คีมที่ผ่านการฆ่าเชื้อ"],
    actions: [
      "เลือกเฉพาะกระปุกที่ไม่มีเชื้อและยอดตั้งตัวแล้ว",
      "แยกยอดออกจากกันแล้วย้ายลงอาหารสูตรเพิ่มจำนวน",
      "นับจำนวนยอดที่ได้ในแต่ละกระปุกแล้วจดไว้",
      "แยกยอดที่ลายผิดปกติออกไปเลี้ยงต่างหาก อย่าทิ้งทันที",
    ],
    passCriteria: ["มียอดใหม่เพิ่มขึ้นหรือยอดเดิมขยายขนาดชัดเจน"],
    stopConditions: ["เกิดก้อนเนื้อเยื่อผิดรูปจำนวนมากแทนที่จะเป็นยอด"],
    safetyNotes: [],
    measurements: [{ id: "shoot-count", label: "จำนวนยอดที่ได้", unit: "count", required: true, min: 0 }],
    evidence: { level: "unsupported", sourceIds: [], note: "ความเข้มข้นฮอร์โมนต้องมาจากแผ่นเสริมรายชนิด" },
    illustrationId: "multiply-shoots",
    durationMinutes: 20160,
  },
  root: {
    id: "root",
    title: "ออกราก",
    summary: "ย้ายยอดที่แข็งแรงไปอาหารสูตรออกราก",
    why: "รากที่สมบูรณ์คือตัวชี้ว่าต้นจะรอดตอนออกจากขวดหรือไม่",
    materials: ["อาหารสูตรออกราก", "ภาชนะใหม่"],
    actions: [
      "เลือกยอดที่มีใบและไม่ผิดรูป",
      "ย้ายลงอาหารสูตรออกราก",
      "นับจำนวนรากและวัดความยาวรากที่ยาวที่สุดเมื่อครบกำหนด",
    ],
    passCriteria: ["มีรากที่ใช้งานได้อย่างน้อยหนึ่งรากต่อยอด"],
    stopConditions: ["โคนยอดเน่า", "ไม่มีรากเลยหลังครบระยะเวลาของสูตร"],
    safetyNotes: [],
    measurements: [
      { id: "root-count", label: "จำนวนราก", unit: "count", required: true, min: 0 },
      { id: "root-length", label: "ความยาวรากที่ยาวที่สุด", unit: "count", required: false, min: 0 },
    ],
    evidence: { level: "unsupported", sourceIds: [], note: "ชนิดและความเข้มข้นของออกซินต้องมาจากแผ่นเสริมรายชนิด" },
    illustrationId: "rooting",
    durationMinutes: 20160,
  },
  acclimatize: {
    id: "acclimatize",
    title: "ปรับสภาพออกขวด",
    summary: "นำต้นออกจากขวดแล้วค่อย ๆ ลดความชื้นลง",
    why: "ต้นในขวดไม่เคยควบคุมการคายน้ำเอง ถ้าเจอความชื้นต่ำทันทีจะเหี่ยวตายภายในไม่กี่ชั่วโมง",
    materials: ["วัสดุปลูกที่โปร่ง", "ถาดเพาะ", "ฝาครอบหรือถุงคลุม"],
    actions: [
      "นำต้นออกแล้วล้างวุ้นที่ติดรากออกให้หมดด้วยน้ำสะอาด",
      "ปลูกในวัสดุโปร่งแล้วคลุมไว้ให้ความชื้นสูง",
      "เปิดช่องระบายเพิ่มขึ้นทีละน้อยตลอดสองถึงสามสัปดาห์",
      "วางในที่มีแสงรำไร ไม่ใช่แดดตรง",
    ],
    passCriteria: ["ต้นไม่เหี่ยวต่อเนื่องหลังลดการคลุม", "มีใบใหม่แตกออกมา"],
    stopConditions: ["ต้นเหี่ยวถาวรแม้เพิ่มความชื้นกลับ", "โคนต้นเน่า"],
    safetyNotes: ["อย่าให้วัสดุปลูกแฉะ"],
    measurements: [{ id: "plantlets-out", label: "จำนวนต้นที่นำออกขวด", unit: "count", required: true, min: 0 }],
    evidence: { level: "adapted", sourceIds: ["source-pp-2023"] },
    illustrationId: "acclimatize",
    durationMinutes: 20160,
  },
  monitor: {
    id: "monitor",
    title: "ติดตามความแข็งแรงและลักษณะที่ต้องการ",
    summary: "เทียบต้นที่ได้กับรูปตั้งต้นเพื่อดูว่าลักษณะยังคงเดิมไหม",
    why: "ลักษณะบางอย่างโดยเฉพาะลายด่างอาจเปลี่ยนไประหว่างการเพิ่มจำนวน และดูออกก็ต่อเมื่อใบใหม่โตพอ",
    materials: ["กล้องหรือโทรศัพท์", "รูปตั้งต้นจากขั้นแรก"],
    actions: [
      "ถ่ายรูปใบใหม่ในมุมและแสงเดียวกับรูปตั้งต้น",
      "แยกนับต้นที่ลายตรงตามต้องการ ต้นที่เขียวล้วน และต้นที่ขาวเกินจนเลี้ยงต่อไม่ได้",
      "จดข้อสรุปของรอบนี้",
    ],
    passCriteria: ["มีใบใหม่ที่โตพอให้เทียบได้", "มีผลนับแยกตามลักษณะแล้ว"],
    stopConditions: ["ข้อมูลไม่พอจะสรุป ให้เลี้ยงต่อแล้วค่อยกลับมาบันทึก"],
    safetyNotes: [],
    measurements: [{ id: "true-to-type", label: "จำนวนต้นที่ลักษณะตรงตามต้องการ", unit: "count", required: true, min: 0 }],
    evidence: { level: "adapted", sourceIds: ["source-pp-2025"], note: "การดูด้วยตาไม่ใช่หลักฐานความคงตัวทางพันธุกรรม" },
    illustrationId: "monitor-variegation",
    durationMinutes: 43200,
  },
  "close-round": {
    id: "close-round",
    title: "ปิดรอบและสรุปผล",
    summary: "รวมทุกอย่างที่บันทึกไว้เป็นข้อสรุปเดียวของรอบนี้",
    why: "ถ้าไม่สรุปตอนจบ รอบถัดไปจะเดาไม่ออกว่าควรเปลี่ยนอะไร",
    materials: [],
    actions: [
      "ทบทวนบันทึกทุกขั้นว่ามีขั้นไหนที่ค่าจริงต่างจากที่คู่มือแนะนำ",
      "ระบุจุดที่คิดว่าทำให้รอบนี้สำเร็จหรือล้มเหลว",
      "เลือกตัวแปรเดียวที่จะเปลี่ยนในรอบหน้า",
      "ปิดรอบ",
    ],
    passCriteria: ["มีข้อสรุปของรอบและระบุตัวแปรที่จะเปลี่ยนรอบหน้าแล้ว"],
    stopConditions: [],
    safetyNotes: [],
    measurements: [],
    evidence: { level: "adapted", sourceIds: ["source-kew-philodendron"], note: "หลักการบันทึกผลการทดลองทั่วไป" },
    illustrationId: "close-round",
    durationMinutes: 30,
  },
```

หมายเหตุ ขั้น `close-round` มี `stopConditions` ว่าง จึงต้องผ่อนเทสต์ข้อ stopConditions ในขั้นถัดไป

- [ ] **Step 4: Relax the stop-condition assertion for the closing step**

แก้เทสต์ `ทุกขั้นมีเกณฑ์ผ่านและเงื่อนไขหยุดอย่างน้อยหนึ่งข้อ` ใน `src/lib/manual/core-steps.test.ts` เป็น

```ts
  it("ทุกขั้นมีเกณฑ์ผ่านและขั้นลงมือ และขั้นที่มีความเสี่ยงมีเงื่อนไขหยุด", () => {
    for (const [id, step] of Object.entries(coreSteps)) {
      expect(step.passCriteria.length, `${id} ต้องมีเกณฑ์ผ่าน`).toBeGreaterThan(0);
      expect(step.actions.length, `${id} ต้องมีขั้นลงมือ`).toBeGreaterThan(0);
    }
    const mustStop = Object.values(coreSteps).filter((step) => step.id !== "close-round");
    for (const step of mustStop) {
      expect(step.stopConditions.length, `${step.id} ต้องมีเงื่อนไขหยุด`).toBeGreaterThan(0);
    }
  });
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run src/lib/manual/core-steps.test.ts`
Expected: PASS ทั้ง 5 เทสต์

- [ ] **Step 6: Run lint**

Run: `npm run lint`
Expected: ไม่มี error

- [ ] **Step 7: Commit**

```bash
git add src/lib/manual/core-steps.ts src/lib/manual/core-steps.test.ts
git commit -m "feat(manual): complete the fourteen step core library"
```

---

### Task 4: Species packs and registry

**Files:**
- Create: `src/lib/manual/species/pink-princess.ts`
- Create: `src/lib/manual/species/violin-variegated.ts`
- Create: `src/lib/manual/species/generic-philodendron.ts`
- Create: `src/lib/manual/registry.ts`
- Test: `src/lib/manual/registry.test.ts`

**Interfaces:**
- Consumes: `coreSteps` จาก Task 3, `resolveManual` และ type ทั้งหมดจาก Task 1
- Produces: `plantPacks: PlantPack[]`, `packBySlug(slug: string): PlantPack | null`, `resolveBySlug(slug: string): ResolvedManual | null`, `allSlugs(): string[]`

- [ ] **Step 1: Write the failing test**

สร้าง `src/lib/manual/registry.test.ts`

```ts
import { describe, expect, it } from "vitest";
import { allSlugs, packBySlug, plantPacks, resolveBySlug } from "./registry";

describe("manual registry", () => {
  it("มีแผ่นเสริมสามชนิดและ slug ไม่ซ้ำกัน", () => {
    expect(allSlugs()).toEqual(["pink-princess", "violin-variegated", "generic-philodendron"]);
    expect(new Set(allSlugs()).size).toBe(plantPacks.length);
  });

  it("resolve ได้ครบทุกแผ่นเสริมโดยไม่โยน error", () => {
    for (const slug of allSlugs()) {
      const manual = resolveBySlug(slug);
      expect(manual, `${slug} ต้อง resolve ได้`).not.toBeNull();
      expect(manual!.steps.length).toBeGreaterThan(0);
    }
  });

  it("คู่มือ Pink Princess มี 14 ขั้นตามลำดับแกนกลาง", () => {
    const manual = resolveBySlug("pink-princess");

    expect(manual!.steps).toHaveLength(14);
    expect(manual!.steps[0].id).toBe("receive");
    expect(manual!.steps[13].id).toBe("close-round");
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/manual/registry.test.ts`
Expected: FAIL — Failed to resolve import "./registry"

- [ ] **Step 3: Write the Pink Princess pack**

สร้าง `src/lib/manual/species/pink-princess.ts`

```ts
import type { PlantPack } from "../types";

const fullSequence = [
  "receive",
  "quarantine",
  "identify",
  "select-explant",
  "cut",
  "prep-media",
  "sterilize",
  "initiate",
  "check-contamination",
  "multiply",
  "root",
  "acclimatize",
  "monitor",
  "close-round",
];

export const pinkPrincessPack: PlantPack = {
  slug: "pink-princess",
  scientificName: "Philodendron erubescens ‘Pink Princess’",
  commonName: "ฟิโลเดนดรอน พิงค์ปริ๊นเซส",
  method: "nodal",
  summary: "ขยายจากตาข้าง เน้นการรักษาลายด่างชมพูให้คงอยู่",
  durationLabel: "4 ถึง 8 เดือน",
  sequence: fullSequence,
  overrides: {
    sterilize: {
      evidence: {
        level: "unsupported",
        sourceIds: [],
        note: "งานปี 2023 เริ่มจาก protocorm-like bodies และงานปี 2025 เพิ่มจำนวนจากยอดที่อยู่ในขวด ทั้งสองงานจึงเริ่มจากเนื้อเยื่อที่ปลอดเชื้ออยู่แล้ว ไม่มีขั้นฟอกผิวจากต้นแม่ให้อ้างอิง",
      },
    },
    multiply: {
      evidence: {
        level: "species-direct",
        sourceIds: ["source-pp-2023"],
        note: "BAP 1.0 mg/L เดี่ยวให้ยอดมากที่สุด รายงาน 11.2 ยอดต่อชิ้นในอาหารเหลว",
      },
    },
    root: {
      evidence: {
        level: "species-direct",
        sourceIds: ["source-pp-2023"],
        note: "IBA 3.0 mg/L ให้ 3.2 รากต่อชิ้น และรากยาว 1.9 เซนติเมตร",
      },
    },
    monitor: {
      title: "ติดตามความคงตัวของลายด่าง",
      evidence: {
        level: "species-direct",
        sourceIds: ["source-pp-2025"],
        note: "งานปี 2025 ประเมินความคงตัวทางพันธุกรรมของต้นที่ได้ แต่การดูสีใบด้วยตาไม่ใช่หลักฐานความคงตัว",
      },
    },
  },
  mediaRecipes: [
    {
      id: "establishment",
      title: "ระยะตั้งต้น",
      pH: "5.7 ถึง 5.8",
      ingredients: [
        { name: "MS basal salts", amountPerLiter: 1, unit: "×" },
        { name: "Sucrose", amountPerLiter: 30, unit: "g/L" },
        { name: "Agar", amountPerLiter: 7.5, unit: "g/L" },
      ],
      evidence: {
        level: "unsupported",
        sourceIds: [],
        note: "งานต้นทางไม่ได้รายงานสูตรตั้งต้นจากต้นแม่ เพราะเริ่มจากเนื้อเยื่อที่อยู่ในขวดแล้ว สูตรนี้จึงเป็นอาหารพื้นฐานที่ยังไม่ใส่ฮอร์โมน",
      },
    },
    {
      id: "multiplication",
      title: "ระยะเพิ่มจำนวนยอด",
      pH: "5.7 ถึง 5.8",
      ingredients: [
        { name: "MS basal salts", amountPerLiter: 1, unit: "×" },
        { name: "Sucrose", amountPerLiter: 30, unit: "g/L" },
        { name: "Agar", amountPerLiter: 7.5, unit: "g/L" },
        { name: "BAP", amountPerLiter: 1, unit: "mg/L", note: "ใช้น้ำยาแม่ ห้ามชั่งผงโดยตรงเมื่อทำปริมาณน้อย" },
      ],
      evidence: { level: "species-direct", sourceIds: ["source-pp-2023"] },
    },
    {
      id: "rooting",
      title: "ระยะออกราก",
      pH: "5.7 ถึง 5.8",
      ingredients: [
        { name: "MS basal salts", amountPerLiter: 0.5, unit: "×" },
        { name: "Sucrose", amountPerLiter: 30, unit: "g/L" },
        { name: "Agar", amountPerLiter: 7.5, unit: "g/L" },
        { name: "IBA", amountPerLiter: 3, unit: "mg/L", note: "ใช้น้ำยาแม่" },
      ],
      evidence: { level: "species-direct", sourceIds: ["source-pp-2023"] },
    },
  ],
  sourceIds: ["source-pp-2023", "source-pp-2025", "source-kew-philodendron"],
};

export { fullSequence as standardSequence };
```

- [ ] **Step 4: Write the Violin and generic packs**

สร้าง `src/lib/manual/species/violin-variegated.ts`

```ts
import type { PlantPack } from "../types";
import { standardSequence } from "./pink-princess";

export const violinVariegatedPack: PlantPack = {
  slug: "violin-variegated",
  scientificName: "Philodendron bipennifolium ‘Violin’ variegated",
  commonName: "ฟิโลเดนดรอน ไวโอลิน ด่าง",
  method: "nodal",
  summary: "เส้นทางทดลอง ยังไม่มีงานวิจัยตรงพันธุ์ให้อ้างอิง",
  durationLabel: "4 ถึง 8 เดือน",
  sequence: [...standardSequence],
  overrides: {
    sterilize: {
      evidence: { level: "unsupported", sourceIds: [], note: "ยังไม่มีงานฟอกผิวตรงพันธุ์นี้" },
    },
    multiply: {
      evidence: { level: "unsupported", sourceIds: [], note: "ยังไม่มีงานเพิ่มจำนวนตรงพันธุ์นี้ ให้เริ่มจากค่ากลางของสกุลแล้วเปลี่ยนทีละตัวแปร" },
    },
    root: {
      evidence: { level: "unsupported", sourceIds: [], note: "ยังไม่มีงานออกรากตรงพันธุ์นี้" },
    },
  },
  mediaRecipes: [
    {
      id: "establishment",
      title: "ระยะตั้งต้น",
      pH: "5.7 ถึง 5.8",
      ingredients: [
        { name: "MS basal salts", amountPerLiter: 1, unit: "×" },
        { name: "Sucrose", amountPerLiter: 30, unit: "g/L" },
        { name: "Agar", amountPerLiter: 7.5, unit: "g/L" },
      ],
      evidence: { level: "unsupported", sourceIds: [], note: "อาหารพื้นฐานที่ยังไม่ใส่ฮอร์โมน" },
    },
  ],
  sourceIds: ["source-violin-gap", "source-kew-philodendron"],
};
```

สร้าง `src/lib/manual/species/generic-philodendron.ts`

```ts
import type { PlantPack } from "../types";
import { standardSequence } from "./pink-princess";

export const genericPhilodendronPack: PlantPack = {
  slug: "generic-philodendron",
  scientificName: "Philodendron sp.",
  commonName: "ฟิโลเดนดรอนที่ยังไม่ยืนยันชนิด",
  method: "nodal",
  summary: "เส้นทางกลางสำหรับต้นที่ยังระบุชนิดไม่ได้",
  durationLabel: "4 ถึง 8 เดือน",
  sequence: [...standardSequence],
  overrides: {
    identify: {
      summary: "ยืนยันเท่าที่ยืนยันได้ แล้วบันทึกว่ายังไม่ทราบชนิด",
      evidence: { level: "adapted", sourceIds: ["source-kew-wcvp-v15"], note: "ใช้เส้นทางกลางเมื่อยังระบุชนิดไม่ได้" },
    },
    sterilize: {
      evidence: { level: "unsupported", sourceIds: [], note: "ยังไม่ทราบชนิด จึงไม่มีงานตรงพันธุ์ให้อ้างอิง" },
    },
    multiply: {
      evidence: { level: "unsupported", sourceIds: [], note: "ยังไม่ทราบชนิด ให้เริ่มจากค่าต่ำแล้วเพิ่มทีละขั้น" },
    },
    root: {
      evidence: { level: "unsupported", sourceIds: [], note: "ยังไม่ทราบชนิด" },
    },
    monitor: {
      evidence: { level: "adapted", sourceIds: ["source-kew-philodendron"] },
    },
  },
  mediaRecipes: [
    {
      id: "establishment",
      title: "ระยะตั้งต้น",
      pH: "5.7 ถึง 5.8",
      ingredients: [
        { name: "MS basal salts", amountPerLiter: 1, unit: "×" },
        { name: "Sucrose", amountPerLiter: 30, unit: "g/L" },
        { name: "Agar", amountPerLiter: 7.5, unit: "g/L" },
      ],
      evidence: { level: "unsupported", sourceIds: [], note: "อาหารพื้นฐานที่ยังไม่ใส่ฮอร์โมน" },
    },
  ],
  sourceIds: ["source-kew-philodendron", "source-kew-wcvp-v15"],
};
```

- [ ] **Step 5: Write the registry**

สร้าง `src/lib/manual/registry.ts`

```ts
import { coreSteps } from "./core-steps";
import { resolveManual } from "./resolve";
import { genericPhilodendronPack } from "./species/generic-philodendron";
import { pinkPrincessPack } from "./species/pink-princess";
import { violinVariegatedPack } from "./species/violin-variegated";
import type { PlantPack, ResolvedManual } from "./types";

export const plantPacks: PlantPack[] = [pinkPrincessPack, violinVariegatedPack, genericPhilodendronPack];

export function allSlugs(): string[] {
  return plantPacks.map((pack) => pack.slug);
}

export function packBySlug(slug: string): PlantPack | null {
  return plantPacks.find((pack) => pack.slug === slug) ?? null;
}

export function resolveBySlug(slug: string): ResolvedManual | null {
  const pack = packBySlug(slug);
  return pack ? resolveManual(pack, coreSteps) : null;
}
```

- [ ] **Step 6: Run test to verify it passes**

Run: `npx vitest run src/lib/manual/registry.test.ts`
Expected: PASS ทั้ง 10 เทสต์

- [ ] **Step 7: Run the whole suite and lint**

Run: `npm test` แล้ว `npm run lint`
Expected: เทสต์เดิมทั้งหมดยังผ่าน และ lint ไม่มี error

- [ ] **Step 8: Commit**

```bash
git add src/lib/manual/species src/lib/manual/registry.ts src/lib/manual/registry.test.ts
git commit -m "feat(manual): add three species packs and the resolve registry"
```

---

### Task 5: Source registry for the manual layer

**Files:**
- Create: `src/lib/manual/sources.ts`
- Test: `src/lib/manual/sources.test.ts`

**Interfaces:**
- Consumes: `plantPacks` และ `resolveBySlug` จาก Task 4
- Produces: `manualSources: ManualSourceRecord[]`, `sourceById(id: string): ManualSourceRecord | null` โดย `ManualSourceRecord = { id: string; title: string; url: string; kind: "taxonomy" | "peer-reviewed" | "technical-guide" | "research-gap"; accessedAt: string }`

- [ ] **Step 1: Write the failing test**

สร้าง `src/lib/manual/sources.test.ts`

```ts
import { describe, expect, it } from "vitest";
import { allSlugs, resolveBySlug } from "./registry";
import { manualSources, sourceById } from "./sources";

describe("manual sources", () => {
  it("ทุก sourceId ที่ขั้นตอนอ้างถึงต้องมีอยู่จริงในทะเบียน", () => {
    for (const slug of allSlugs()) {
      const manual = resolveBySlug(slug)!;
      const referenced = [
        ...manual.sourceIds,
        ...manual.steps.flatMap((step) => step.evidence.sourceIds),
        ...manual.mediaRecipes.flatMap((recipe) => recipe.evidence.sourceIds),
      ];
      for (const id of referenced) {
        expect(sourceById(id), `${slug} อ้าง ${id} ที่ไม่มีในทะเบียน`).not.toBeNull();
      }
    }
  });

  it("มีงานฆ่าเชื้ออาหารด้วยสารเคมีของ Philodendron สำหรับกรณีไม่มีหม้อนึ่ง", () => {
    const record = sourceById("source-ruaysap-chemical-sterilization");

    expect(record).not.toBeNull();
    expect(record!.kind).toBe("peer-reviewed");
    expect(record!.url).toContain("tci-thaijo.org");
  });

  it("id ของแหล่งอ้างอิงไม่ซ้ำกัน", () => {
    const ids = manualSources.map((item) => item.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/manual/sources.test.ts`
Expected: FAIL — Failed to resolve import "./sources"

- [ ] **Step 3: Write the source registry**

สร้าง `src/lib/manual/sources.ts`

```ts
export type ManualSourceKind = "taxonomy" | "peer-reviewed" | "technical-guide" | "research-gap";

export type ManualSourceRecord = {
  id: string;
  title: string;
  url: string;
  kind: ManualSourceKind;
  accessedAt: string;
};

export const manualSources: ManualSourceRecord[] = [
  {
    id: "source-pp-2023",
    title: "In Vitro Propagation of Philodendron erubescens ‘Pink Princess’ and Ex Vitro Acclimatization of the Plantlets",
    url: "https://doi.org/10.3390/horticulturae9060688",
    kind: "peer-reviewed",
    accessedAt: "2026-08-02",
  },
  {
    id: "source-pp-2025",
    title: "Development of an Efficient Micropropagation Protocol for Philodendron erubescens ‘Pink Princess’ Using a Temporary Immersion System and Assessment of Genetic Fidelity",
    url: "https://doi.org/10.3390/horticulturae11091085",
    kind: "peer-reviewed",
    accessedAt: "2026-08-02",
  },
  {
    id: "source-ruaysap-chemical-sterilization",
    title: "Chemical Sterilization in MS Culture Medium for In vitro Culture of Philodendron sp. “Ruaysap”",
    url: "https://li01.tci-thaijo.org/index.php/pnujr/article/view/246876",
    kind: "peer-reviewed",
    accessedAt: "2026-08-02",
  },
  {
    id: "source-white-knight-2025",
    title: "Micropropagation of Philodendron ‘White Knight’ via Shoot Regeneration from Petiole Explants",
    url: "https://doi.org/10.3390/plants14111714",
    kind: "peer-reviewed",
    accessedAt: "2026-08-02",
  },
  {
    id: "source-merck-media-sterilization",
    title: "Media Sterilization — Plant Tissue Culture Protocol",
    url: "https://www.merckmillipore.com/AL/en/technical-documents/protocol/cell-culture-and-cell-culture-analysis/cell-culture-media-preparation/media-sterilization",
    kind: "technical-guide",
    accessedAt: "2026-08-02",
  },
  {
    id: "source-uf-shoot-cultures",
    title: "Types of Tissue Culture — Shoot Cultures, University of Florida IFAS",
    url: "https://propg.ifas.ufl.edu/09-tissue-culture/01-types/08-tctypes-shootcultures.html",
    kind: "technical-guide",
    accessedAt: "2026-08-02",
  },
  {
    id: "source-kew-philodendron",
    title: "Plants of the World Online — Philodendron Schott",
    url: "https://powo.science.kew.org/taxon/urn%3Alsid%3Aipni.org%3Anames%3A326132-2",
    kind: "taxonomy",
    accessedAt: "2026-08-02",
  },
  {
    id: "source-kew-wcvp-v15",
    title: "World Checklist of Vascular Plants v15",
    url: "https://doi.org/10.15468/6h8ucr",
    kind: "taxonomy",
    accessedAt: "2026-08-02",
  },
  {
    id: "source-violin-gap",
    title: "Violin variegated evidence register — ยังไม่พบงานตรงพันธุ์",
    url: "https://powo.science.kew.org/taxon/urn%3Alsid%3Aipni.org%3Anames%3A326132-2",
    kind: "research-gap",
    accessedAt: "2026-08-02",
  },
];

export function sourceById(id: string): ManualSourceRecord | null {
  return manualSources.find((item) => item.id === id) ?? null;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/manual/sources.test.ts`
Expected: PASS ทั้ง 3 เทสต์

- [ ] **Step 5: Commit**

```bash
git add src/lib/manual/sources.ts src/lib/manual/sources.test.ts
git commit -m "feat(manual): add source registry with integrity test"
```

---

### Task 6: Admin manual viewer

**Files:**
- Create: `src/app/admin/manual/[slug]/page.tsx`
- Create: `src/app/admin/manual/page.tsx`
- Test: `src/lib/manual/summary.test.ts`
- Create: `src/lib/manual/summary.ts`

**Interfaces:**
- Consumes: `resolveBySlug`, `allSlugs`, `packBySlug` จาก Task 4 และ `sourceById` จาก Task 5
- Produces: `manualSummary(slug: string): ManualSummary | null` โดย `ManualSummary = { slug: string; stepCount: number; byOrigin: Record<StepOrigin, number>; byEvidence: Record<EvidenceLevel, number>; unsupportedStepIds: string[] }`

หน้าเหล่านี้เป็น Server Component ล้วน ไม่ต้องมี `"use client"` เพราะอ่านจากไฟล์ในโค้ดอย่างเดียว

- [ ] **Step 1: Write the failing test**

สร้าง `src/lib/manual/summary.test.ts`

```ts
import { describe, expect, it } from "vitest";
import { manualSummary } from "./summary";

describe("manualSummary", () => {
  it("นับจำนวนขั้นแยกตามที่มาและตามระดับหลักฐาน", () => {
    const summary = manualSummary("pink-princess")!;

    expect(summary.stepCount).toBe(14);
    expect(summary.byOrigin.core + summary.byOrigin.override + summary.byOrigin.pack).toBe(14);
    expect(summary.byOrigin.override).toBe(4);
    expect(summary.byEvidence["species-direct"]).toBe(3);
  });

  it("ชี้ขั้นที่ยังไม่มีงานรองรับให้ตรวจได้ง่าย", () => {
    const summary = manualSummary("pink-princess")!;

    expect(summary.unsupportedStepIds).toContain("sterilize");
  });

  it("คืนค่า null เมื่อไม่รู้จัก slug", () => {
    expect(manualSummary("ไม่มีต้นนี้")).toBeNull();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/manual/summary.test.ts`
Expected: FAIL — Failed to resolve import "./summary"

- [ ] **Step 3: Write the summary helper**

สร้าง `src/lib/manual/summary.ts`

```ts
import { resolveBySlug } from "./registry";
import type { EvidenceLevel, StepOrigin } from "./types";

export type ManualSummary = {
  slug: string;
  stepCount: number;
  byOrigin: Record<StepOrigin, number>;
  byEvidence: Record<EvidenceLevel, number>;
  unsupportedStepIds: string[];
};

export function manualSummary(slug: string): ManualSummary | null {
  const manual = resolveBySlug(slug);
  if (!manual) return null;

  const byOrigin: Record<StepOrigin, number> = { core: 0, override: 0, pack: 0 };
  const byEvidence: Record<EvidenceLevel, number> = { "species-direct": 0, adapted: 0, unsupported: 0 };
  const unsupportedStepIds: string[] = [];

  for (const step of manual.steps) {
    byOrigin[step.origin] += 1;
    byEvidence[step.evidence.level] += 1;
    if (step.evidence.level === "unsupported") unsupportedStepIds.push(step.id);
  }

  return { slug, stepCount: manual.steps.length, byOrigin, byEvidence, unsupportedStepIds };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/manual/summary.test.ts`
Expected: PASS ทั้ง 3 เทสต์

- [ ] **Step 5: Write the index page**

สร้าง `src/app/admin/manual/page.tsx`

```tsx
import Link from "next/link";
import { plantPacks } from "@/lib/manual/registry";
import { manualSummary } from "@/lib/manual/summary";

export default function AdminManualIndexPage() {
  return (
    <main style={{ padding: "32px", fontFamily: "system-ui, sans-serif", maxWidth: "820px" }}>
      <h1>คู่มือที่ merge แล้ว</h1>
      <p>หน้านี้สำหรับตรวจทานเนื้อหา ไม่ใช่หน้าที่ผู้ใช้เห็น</p>
      <ul>
        {plantPacks.map((pack) => {
          const summary = manualSummary(pack.slug);
          return (
            <li key={pack.slug} style={{ marginBottom: "12px" }}>
              <Link href={`/admin/manual/${pack.slug}`}>{pack.scientificName}</Link>
              <div>
                {summary?.stepCount} ขั้น · ยังไม่มีงานรองรับ {summary?.byEvidence.unsupported} ขั้น
              </div>
            </li>
          );
        })}
      </ul>
    </main>
  );
}
```

- [ ] **Step 6: Write the detail page**

สร้าง `src/app/admin/manual/[slug]/page.tsx`

```tsx
import { notFound } from "next/navigation";
import { allSlugs, resolveBySlug } from "@/lib/manual/registry";
import { sourceById } from "@/lib/manual/sources";
import { manualSummary } from "@/lib/manual/summary";

export function generateStaticParams() {
  return allSlugs().map((slug) => ({ slug }));
}

const originLabel = { core: "แกนกลาง", override: "ปรับค่า", pack: "เขียนเอง" } as const;
const evidenceLabel = { "species-direct": "ตรงพันธุ์", adapted: "ประยุกต์", unsupported: "ยังไม่มีงานรองรับ" } as const;

export default async function AdminManualDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const manual = resolveBySlug(slug);
  if (!manual) notFound();
  const summary = manualSummary(slug)!;

  return (
    <main style={{ padding: "32px", fontFamily: "system-ui, sans-serif", maxWidth: "820px" }}>
      <h1>{manual.scientificName}</h1>
      <p>{manual.summary}</p>
      <p>
        {summary.stepCount} ขั้น · แกนกลาง {summary.byOrigin.core} · ปรับค่า {summary.byOrigin.override} · เขียนเอง {summary.byOrigin.pack}
      </p>

      <h2>สูตรอาหาร</h2>
      {manual.mediaRecipes.map((recipe) => (
        <section key={recipe.id}>
          <h3>{recipe.title} · {evidenceLabel[recipe.evidence.level]}</h3>
          <p>pH {recipe.pH}</p>
          <ul>
            {recipe.ingredients.map((item) => (
              <li key={item.name}>{item.name} {item.amountPerLiter} {item.unit}{item.note ? ` — ${item.note}` : ""}</li>
            ))}
          </ul>
          {recipe.evidence.note ? <p>{recipe.evidence.note}</p> : null}
        </section>
      ))}

      <h2>ขั้นตอน</h2>
      {manual.steps.map((step) => (
        <article key={step.id} style={{ borderTop: "1px solid #ccc", paddingTop: "16px", marginTop: "16px" }}>
          <h3>{step.order + 1}. {step.title}</h3>
          <p>{originLabel[step.origin]} · {evidenceLabel[step.evidence.level]}</p>
          <p>{step.summary}</p>
          <p>{step.why}</p>
          <h4>ลงมือทำ</h4>
          <ol>{step.actions.map((action) => <li key={action}>{action}</li>)}</ol>
          <h4>ผ่านเมื่อ</h4>
          <ul>{step.passCriteria.map((item) => <li key={item}>{item}</li>)}</ul>
          {step.stopConditions.length ? (
            <>
              <h4>หยุดทันทีถ้า</h4>
              <ul>{step.stopConditions.map((item) => <li key={item}>{item}</li>)}</ul>
            </>
          ) : null}
          {step.safetyNotes.length ? (
            <>
              <h4>ความปลอดภัย</h4>
              <ul>{step.safetyNotes.map((item) => <li key={item}>{item}</li>)}</ul>
            </>
          ) : null}
          {step.evidence.note ? <p>หมายเหตุหลักฐาน {step.evidence.note}</p> : null}
          <ul>
            {step.evidence.sourceIds.map((id) => {
              const source = sourceById(id);
              return <li key={id}>{source ? <a href={source.url}>{source.title}</a> : id}</li>;
            })}
          </ul>
        </article>
      ))}
    </main>
  );
}
```

- [ ] **Step 7: Verify the build compiles**

Run: `npm run build`
Expected: build สำเร็จ และเห็น route `/admin/manual` กับ `/admin/manual/[slug]` ในผลลัพธ์

- [ ] **Step 8: Run the whole suite and lint**

Run: `npm test` แล้ว `npm run lint`
Expected: ผ่านทั้งหมด

- [ ] **Step 9: Commit**

```bash
git add src/lib/manual/summary.ts src/lib/manual/summary.test.ts src/app/admin/manual
git commit -m "feat(admin): add merged manual viewer for content review"
```

---

### Task 7: Sync the legacy documents with the verified content

**Files:**
- Modify: `docs/philodendron/pink-princess.md`
- Modify: `docs/philodendron/violin-variegated.md`
- Modify: `docs/philodendron/README.md`

**Interfaces:**
- Consumes: เนื้อหาที่ resolve ได้จาก Task 4 เป็นแหล่งความจริง
- Produces: เอกสารที่ไม่ขัดกับโค้ดอีกต่อไป ไม่มี export ใหม่

เอกสารเดิมเขียนว่า 18 ขั้น และอ้างว่างานปี 2023 รองรับ MS + BAP 1.0 สำหรับการเพิ่มยอด ซึ่งข้อหลังถูก แต่จำนวนขั้นผิดและยังไม่ได้ระบุว่าไม่มีหลักฐานเรื่องการฟอกผิว

- [ ] **Step 1: Replace the step-count line in pink-princess.md**

ใน `docs/philodendron/pink-princess.md` แทนที่หัวข้อ `## 18 ขั้นในระบบ` และบรรทัดรายการขั้นใต้หัวข้อนั้น ด้วย

```markdown
## 14 ขั้นในระบบ

รับต้น → กักต้น → ยืนยันชนิด → เลือกข้อ → ตัดชิ้นพืช → ทำอาหาร → ฟอกฆ่าเชื้อ → วางลงอาหาร → ตรวจการปนเปื้อน → เพิ่มจำนวนยอด → ออกราก → ปรับสภาพออกขวด → ติดตามลายด่าง → ปิดรอบและสรุปผล

ลำดับนี้เป็นแหล่งความจริงเดียวกับ `src/lib/manual/core-steps.ts` และ `src/lib/manual/species/pink-princess.ts`
```

- [ ] **Step 2: Add the evidence audit section to pink-princess.md**

เพิ่มหัวข้อนี้ต่อท้ายไฟล์ `docs/philodendron/pink-princess.md`

```markdown
## ผลการตรวจหลักฐานเมื่อ 2026-08-02

- ขั้นฟอกฆ่าเชื้อ **ไม่มีงานตรงพันธุ์รองรับ** งานปี 2023 เริ่มจาก protocorm-like bodies และงานปี 2025 เพิ่มจำนวนจากยอดที่อยู่ในขวด ทั้งสองงานจึงไม่มีขั้นฟอกผิวจากต้นแม่
- ขั้นเพิ่มจำนวนยอด **BAP 1.0 mg/L เดี่ยว ไม่มี NAA** ตามงานปี 2023 ที่รายงาน 11.2 ยอดต่อชิ้นในอาหารเหลว
- ขั้นออกราก **IBA 3.0 mg/L** ตามงานปี 2023 ที่รายงาน 3.2 รากต่อชิ้น และรากยาว 1.9 เซนติเมตร
- สูตรระยะตั้งต้นเดิมที่ระบุ BAP 0.5 กับ NAA 0.05 mg/L **หาที่มาไม่พบ** จึงถอดฮอร์โมนออกจากสูตรตั้งต้นและติดป้ายว่ายังไม่มีงานรองรับ
- กรณีไม่มีหม้อนึ่ง มีงานของ Philodendron sp. “รวยทรัพย์” รายงานว่าเติมไฮเตอร์ 2 mL/L ลงในอาหารแทนการนึ่งยับยั้งจุลินทรีย์ได้ และต้นรอดทั้งหมดหลังออกปลูก 30 วัน
```

- [ ] **Step 3: Update violin-variegated.md**

ใน `docs/philodendron/violin-variegated.md` เปลี่ยนหัวข้อ `## 18 ขั้นในระบบ` ที่บรรทัด 20 เป็น `## 14 ขั้นในระบบ` แล้วแทนรายการขั้นใต้หัวข้อนั้นด้วยลำดับ 14 ขั้นชุดเดียวกับที่ใส่ใน `pink-princess.md` จากนั้นเพิ่มบรรทัดนี้ต่อท้ายหัวข้อ `## สถานะหลักฐาน`

```markdown
ยังไม่มีงานวิจัยตรงพันธุ์ ทุกขั้นที่เกี่ยวกับสูตรและการฟอกจึงติดป้ายว่ายังไม่มีงานรองรับ และระบบจะบังคับให้ทำกระปุกเปล่าคุมทุกรอบ
```

- [ ] **Step 4: Update the docs README**

`docs/philodendron/README.md` ไม่มีข้อความ `18 ขั้น` จึงไม่ต้องแก้ตัวเลข แต่ต้องเพิ่มบรรทัดนี้ต่อท้ายไฟล์เพื่อชี้แหล่งความจริง

```markdown
แหล่งความจริงของเนื้อหาคู่มือคือ `src/lib/manual/` เอกสารในโฟลเดอร์นี้เป็นบทสรุปสำหรับอ่าน ไม่ใช่ต้นฉบับ
```

- [ ] **Step 5: Verify no stale step count remains in the philodendron docs**

Run: `grep -rn "18 ขั้น" docs/philodendron/`
Expected: ไม่มีผลลัพธ์

ยังมีข้อความ `18 ขั้น` ค้างอยู่อีกสองจุดในโค้ดเดิม คือ `src/lib/domain/philodendron-knowledge.ts:138` และ `src/components/knowledge/philodendron-monograph.tsx:28` **ห้ามแก้ในเฟสนี้** เพราะ Global Constraints ห้ามแตะ `src/components` และสองไฟล์นี้จะถูกลบทั้งไฟล์ในเฟส 2 เมื่อ UI ใหม่มาแทน การแก้ตัวเลขตอนนี้ได้ผลเป็นศูนย์และเพิ่มความเสี่ยงทำเทสต์เดิมพัง

- [ ] **Step 6: Confirm nothing else broke**

Run: `npm test`
Expected: เทสต์ทั้งหมดผ่าน รวมถึงเทสต์เดิมที่ยืนยันว่า `stepsForTemplate` คืน 18 ขั้น ซึ่งยังถูกต้องเพราะเฟสนี้ไม่แตะ `protocol-templates.ts`

- [ ] **Step 7: Commit**

```bash
git add docs/philodendron
git commit -m "docs: sync philodendron manuals with verified fourteen step content"
```

---

## Self-Review Notes

ตรวจแผนนี้กับ spec แล้วพบว่า

- โครงแกนกลางบวกแผ่นเสริม ครอบคลุมใน Task 1 ถึง 4
- การยุบขั้นเหลือ 14 ครอบคลุมใน Task 3 และ Task 7
- การแก้สูตรตามผลตรวจ ครอบคลุมใน Task 4 และ Task 7
- `/admin/manual/<slug>` ครอบคลุมใน Task 6
- ข้อกำหนดว่าขั้นที่อ้างหลักฐานต้องมี `sourceIds` มีเทสต์บังคับใน Task 2, 4 และ 5

สิ่งที่ **ไม่อยู่** ในแผนนี้เพราะเป็นของเฟสถัดไป ได้แก่ design token สองโหมด, การเปลี่ยนชื่อเป็น Plantlover Lab, SVG ประกอบ, หน้าคู่มือสาธารณะ, capability model, เครื่องคำนวณ, การลบ runner เดิม, การลบ `philodendron-knowledge.ts` และ `protocol-templates.ts`

ระหว่างเฟส 1 โค้ดเดิมยังทำงานอยู่และเทสต์เดิมที่ยืนยันว่า `stepsForTemplate` คืน 18 ขั้นยังผ่านตามปกติ เพราะแผนนี้ไม่แตะ `protocol-templates.ts` การลบของเดิมจะเกิดในเฟส 2 เมื่อ UI ใหม่พร้อมใช้แทน
