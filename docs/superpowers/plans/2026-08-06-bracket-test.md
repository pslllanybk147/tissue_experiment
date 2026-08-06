# เฟส 4 · ขั้นทดสอบช่วง — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** เปลี่ยนขั้นที่ไม่มีงานรองรับจากทางตัน ให้เป็นการทดลองที่ออกแบบไว้แล้ว โดยผู้ใช้ทดสอบสามความเข้มข้นแล้วระบบจำค่าที่ได้ผลไว้ให้

**Architecture:** ค่าช่วงจาก `Dose` ถูกต่อเข้า `ManualStepDef` แล้วไหลตาม cascade เดิม ฟังก์ชันบริสุทธิ์แปลงช่วงเป็นสามชุด ตัดสินผู้ชนะ และตรวจตัวเลขที่ขัดกันเอง ผลบันทึกลง `ProtocolStepRun.measurements` ที่มีอยู่แล้วด้วยคีย์ที่สร้างจากฟังก์ชันเดียว ค่าที่ตัดสินได้เก็บที่ `users/{uid}/settings/calibration` ตามแพตเทิร์นเดียวกับชุดอุปกรณ์

**Tech Stack:** TypeScript · Next.js 16.2.11 · React 19.2.4 · Vitest 4 (ไม่มี jsdom)

## Global Constraints

- อ่านคู่มือ Next.js ใน `node_modules/next/dist/docs/` ก่อนเขียนโค้ดที่แตะ Next API ตาม `AGENTS.md`
- เทสต์ component ใช้ `renderToStaticMarkup` เท่านั้น ตรรกะเป็นฟังก์ชันบริสุทธิ์แยกจาก React
- **ไม่สร้าง collection ใหม่ ไม่แก้ `firestore.rules` ไม่ migrate ข้อมูล**
- **ห้ามเพิ่ม client component ใหม่** `step-runner.tsx` และหน้า `/my/**` เป็น client อยู่แล้ว แก้ของเดิมได้
- **ห้ามพิมพ์คีย์ของบันทึกตรง ๆ กระจายตามไฟล์** ต้องเรียกจากฟังก์ชันสร้างคีย์ที่เดียว
- **ค่าที่ผู้ใช้ทดสอบได้ ห้ามเปลี่ยนระดับหลักฐานของขั้น** ขั้นที่เป็น `unsupported` ยังคงเป็น `unsupported`
- ทุกที่ที่แสดงค่าที่ทดสอบได้ ต้องกำกับว่า **"จากการทดสอบ 3 กระปุกต่อชุดในรอบเดียว ใช้เป็นจุดตั้งต้นที่ดีกว่าเดา ไม่ใช่ข้อพิสูจน์"**
- ข้อความในโค้ดและคอมเมนต์เป็นภาษาไทย
- ห้ามแก้เทสต์ที่มีอยู่เพื่อให้ผ่าน
- ทุก task จบด้วย `npm test && npm run lint && npm run build` ผ่าน แล้วจึง commit
- อ้างอิงสเปก: `docs/superpowers/specs/2026-08-06-bracket-test-design.md`

## File Structure

| ไฟล์ | หน้าที่ |
|---|---|
| `src/lib/manual/types.ts` | **แก้** `ManualStepDef.doses?: Record<string, Dose>` |
| `src/lib/manual/resolve.ts` | **แก้** รวม `doses` ตาม cascade |
| `src/lib/rounds/bracket.ts` | **ใหม่** คีย์ · แผนสามชุด · ตัดสินผู้ชนะ · ตรวจตัวเลขขัดกัน |
| `src/lib/rounds/bracket.test.ts` | **ใหม่** |
| `src/components/guide/bracket-notice.tsx` | **ใหม่** กล่องบนหน้าคู่มือสาธารณะ |
| `src/components/guide/bracket-notice.test.tsx` | **ใหม่** |
| `src/components/guide/step-detail.tsx` | **แก้** วางกล่อง |
| `src/lib/domain/calibration.ts` | **ใหม่** ชนิด `CalibrationEntry` และฟังก์ชันคีย์ |
| `src/lib/repositories/calibration-repository.ts` | **ใหม่** interface |
| `src/lib/repositories/memory-calibration-repository.ts` | **ใหม่** |
| `src/lib/firebase/firestore-calibration-repository.ts` | **ใหม่** |
| `src/lib/repositories/calibration-repository-factory.ts` | **ใหม่** |
| `src/components/rounds/bracket-table.tsx` | **ใหม่** ตารางกรอกสามชุด |
| `src/components/rounds/bracket-table.test.tsx` | **ใหม่** |
| `src/components/rounds/step-runner.tsx` | **แก้** วางตาราง และรวมค่าตอนบันทึก |
| `src/app/my/rounds/[roundId]/step/[step]/page.tsx` | **แก้** ต่อ repository และบันทึกค่าที่ตัดสินได้ |
| `src/app/my/page.tsx` | **แก้** แสดงรายการค่าที่ทดสอบได้ |

---

### Task 1: ต่อ Dose เข้าคู่มือ

`Dose` ถูกสร้างไว้ตั้งแต่เฟส 0 แต่ยังไม่มีใครอ่าน เพราะ `ManualStepDef` ไม่มีช่องรับ

**Files:**
- Modify: `src/lib/manual/types.ts`
- Modify: `src/lib/manual/resolve.ts`
- Test: `src/lib/manual/resolve.test.ts`

**Interfaces:**
- Consumes: `Dose` จาก `./forms/types`
- Produces: `ManualStepDef.doses?: Record<string, Dose>` และ `ResolvedStep.doses` ที่รวมค่าจากทุกชั้นแล้ว

- [ ] **Step 1: เขียนเทสต์ที่ยังไม่ผ่าน**

เพิ่มใน `src/lib/manual/resolve.test.ts` ท้าย describe ของ cascade

```ts
  it("ค่าช่วงจากทรงไหลลงมาถึงคู่มือ", () => {
    const dose = {
      form: "น้ำยาซักผ้าขาว NaOCl 6%",
      low: 0.8,
      high: 2,
      unit: "%" as const,
      durationMin: [10, 20] as [number, number],
      movesLowerWhen: ["เนื้อด่างมาก"],
      movesHigherWhen: ["ต้นกลางแจ้ง"],
      evidence,
    };
    const formWithDose = { ...cascadeForm, defaultDoses: { "sterilize.dose": dose } } as unknown as GrowthForm;
    const manual = resolveManual(basePack, { library, form: formWithDose });
    expect(manual.steps.find((item) => item.id === "sterilize")?.doses?.["sterilize.dose"]?.low).toBe(0.8);
  });

  it("ค่าช่วงของสกุลทับของทรงด้วยคีย์เดียวกัน", () => {
    const low = {
      form: "น้ำยาซักผ้าขาว NaOCl 6%",
      low: 0.8, high: 2, unit: "%" as const, durationMin: [10, 20] as [number, number],
      movesLowerWhen: [], movesHigherWhen: [], evidence,
    };
    const formWithDose = { ...cascadeForm, defaultDoses: { "sterilize.dose": low } } as unknown as GrowthForm;
    const genusWithDose = { ...cascadeGenus, doses: { "sterilize.dose": { ...low, low: 1.0, high: 1.6 } } };
    const manual = resolveManual(basePack, { library, form: formWithDose, genus: genusWithDose });
    const found = manual.steps.find((item) => item.id === "sterilize")?.doses?.["sterilize.dose"];
    expect(found?.low).toBe(1.0);
    expect(found?.high).toBe(1.6);
  });
```

- [ ] **Step 2: รันให้เห็นว่าพัง**

Run: `npx vitest run src/lib/manual/resolve.test.ts`
Expected: FAIL — `doses` เป็น undefined

- [ ] **Step 3: เพิ่มฟิลด์ในสคีมา**

`src/lib/manual/types.ts` เพิ่มใน `ManualStepDef` ถัดจาก `measurements` และเพิ่ม import

```ts
import type { Dose } from "./forms/types";
```

```ts
  /** ค่าเชิงปริมาณเป็นช่วง คีย์เช่น "sterilize.dose" รวมมาจากชั้นทรงและชั้นสกุลตอน resolve
   *  ขั้นที่มีค่านี้และหลักฐานไม่ใช่ตรงพันธุ์ จะมีขั้นทดสอบช่วงกำกับ */
  doses?: Record<string, Dose>;
```

- [ ] **Step 4: รวมค่าใน resolve**

`src/lib/manual/resolve.ts` ในการ map แต่ละขั้น หลังบรรทัดที่คำนวณ `origin` ให้เพิ่ม

```ts
    // ค่าช่วงรวมจากบนลงล่าง คีย์เดียวกันทับกัน ต่างจากฟิลด์อื่นที่ทับทั้งก้อน
    // เพราะทรงอาจให้ค่าหลายคีย์ แล้วสกุลทับเพียงคีย์เดียว
    const doses = {
      ...(form?.defaultDoses ?? {}),
      ...(genus?.doses ?? {}),
      ...(base.doses ?? {}),
      ...(override?.doses ?? {}),
    };
```

แล้วใส่ลงในออบเจกต์ที่คืนออกไป โดยวางหลัง spread ของ override

```ts
      doses: Object.keys(doses).length > 0 ? doses : undefined,
```

- [ ] **Step 5: รันเทสต์**

Run: `npx vitest run src/lib/manual/resolve.test.ts`
Expected: PASS ทั้งหมด

- [ ] **Step 6: รันทั้งชุด**

Run: `npm test && npm run lint && npm run build`
Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add src/lib/manual/types.ts src/lib/manual/resolve.ts src/lib/manual/resolve.test.ts
git commit -m "feat: flow dose ranges through the resolve cascade"
```

---

### Task 2: แผนสามชุด และคีย์ของบันทึก

**Files:**
- Create: `src/lib/rounds/bracket.ts`
- Create: `src/lib/rounds/bracket.test.ts`

**Interfaces:**
- Consumes: `ResolvedStep` จาก `@/lib/manual/types` · `Dose` จาก `@/lib/manual/forms/types`
- Produces:
  - `type BracketArmId = "a" | "b" | "c"`
  - `type BracketPlan = { doseKey: string; dose: Dose; arms: { armId: BracketArmId; dose: number }[] }`
  - `buildBracketPlan(step: ResolvedStep): BracketPlan | null`
  - `bracketKey(armId: BracketArmId, field: "dose" | "clean" | "alive" | "usable"): string`
  - `jarsPerArmKey(): string`

- [ ] **Step 1: เขียนเทสต์ที่ยังไม่ผ่าน**

`src/lib/rounds/bracket.test.ts`

```ts
import { describe, expect, it } from "vitest";

import type { Dose } from "@/lib/manual/forms/types";
import type { ResolvedStep } from "@/lib/manual/types";
import { bracketKey, buildBracketPlan, jarsPerArmKey } from "./bracket";

const dose: Dose = {
  form: "น้ำยาซักผ้าขาว NaOCl 6%",
  low: 0.8,
  high: 2,
  unit: "%",
  durationMin: [10, 20],
  movesLowerWhen: [],
  movesHigherWhen: [],
  evidence: { level: "adapted", sourceIds: ["source-pp-2023"] },
};

function step(overrides: Partial<ResolvedStep> = {}): ResolvedStep {
  return {
    id: "sterilize",
    title: "ฟอกฆ่าเชื้อ",
    summary: "",
    why: "",
    materials: [],
    actions: [],
    passCriteria: [],
    stopConditions: [],
    safetyNotes: [],
    measurements: [],
    evidence: { level: "adapted", sourceIds: ["source-pp-2023"] },
    durationMinutes: null,
    order: 0,
    origin: "core",
    ...overrides,
  };
}

describe("แผนการทดสอบช่วง", () => {
  it("ขั้นที่ไม่มีค่าช่วง ไม่มีแผนทดสอบ", () => {
    expect(buildBracketPlan(step())).toBeNull();
  });

  it("ขั้นที่มีงานตรงพันธุ์แล้ว ไม่ต้องทดสอบ", () => {
    const found = buildBracketPlan(
      step({ doses: { "sterilize.dose": dose }, evidence: { level: "species-direct", sourceIds: ["source-pp-2023"] } }),
    );
    expect(found).toBeNull();
  });

  it("แบ่งช่วงเป็นสามชุด ปลายต่ำ กลาง ปลายสูง", () => {
    const plan = buildBracketPlan(step({ doses: { "sterilize.dose": dose } }))!;
    expect(plan.arms.map((arm) => arm.dose)).toEqual([0.8, 1.4, 2]);
    expect(plan.arms.map((arm) => arm.armId)).toEqual(["a", "b", "c"]);
  });

  it("ปัดค่ากลางให้อ่านง่าย ไม่เอาทศนิยมยาว", () => {
    const odd: Dose = { ...dose, low: 0.5, high: 1.2 };
    const plan = buildBracketPlan(step({ doses: { "sterilize.dose": odd } }))!;
    expect(plan.arms[1].dose).toBe(0.85);
  });

  it("มีค่าช่วงหลายคีย์ ใช้คีย์แรกตามลำดับตัวอักษร เพื่อให้ผลคงที่", () => {
    const plan = buildBracketPlan(
      step({ doses: { "sterilize.dose": dose, "multiply.cytokinin": { ...dose, low: 1, high: 3 } } }),
    )!;
    expect(plan.doseKey).toBe("multiply.cytokinin");
  });

  it("คีย์ของบันทึกสร้างจากฟังก์ชันเดียว และไม่ชนกัน", () => {
    expect(bracketKey("a", "usable")).toBe("bracket-a-usable");
    expect(bracketKey("c", "dose")).toBe("bracket-c-dose");
    expect(jarsPerArmKey()).toBe("bracket-jars-per-arm");
    const all = new Set<string>();
    for (const armId of ["a", "b", "c"] as const) {
      for (const field of ["dose", "clean", "alive", "usable"] as const) all.add(bracketKey(armId, field));
    }
    all.add(jarsPerArmKey());
    expect(all.size).toBe(13);
  });
});
```

- [ ] **Step 2: รันให้เห็นว่าพัง**

Run: `npx vitest run src/lib/rounds/bracket.test.ts`
Expected: FAIL — `Cannot find module './bracket'`

- [ ] **Step 3: เขียน implementation**

`src/lib/rounds/bracket.ts`

```ts
import type { Dose } from "@/lib/manual/forms/types";
import type { ResolvedStep } from "@/lib/manual/types";

export type BracketArmId = "a" | "b" | "c";
export type BracketField = "dose" | "clean" | "alive" | "usable";

export type BracketPlan = {
  doseKey: string;
  dose: Dose;
  arms: { armId: BracketArmId; dose: number }[];
};

/** คีย์ของบันทึกต้องสร้างจากที่นี่ที่เดียว พิมพ์ตรง ๆ กระจายตามไฟล์แล้วพิมพ์ผิดจะเงียบ
 *  ซึ่งเป็นความผิดพลาดแบบเดียวกับที่เคยเจอในชั้นสกุลและในเมนูนำทาง */
export function bracketKey(armId: BracketArmId, field: BracketField): string {
  return `bracket-${armId}-${field}`;
}

export function jarsPerArmKey(): string {
  return "bracket-jars-per-arm";
}

/** ปัดให้เหลือทศนิยมสองตำแหน่ง เพราะค่ากลางของช่วงมักได้ทศนิยมยาวจนอ่านไม่รู้เรื่อง
 *  และความละเอียดเกินสองตำแหน่งไม่มีความหมายกับการตวงที่บ้านอยู่แล้ว */
function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

/** คืนแผนทดสอบเมื่อขั้นนั้นมีค่าช่วงและยังไม่มีงานตรงพันธุ์
 *  ขั้นที่มีงานตรงพันธุ์แล้วไม่ต้องให้ผู้ใช้ทดลองเอง */
export function buildBracketPlan(step: ResolvedStep): BracketPlan | null {
  if (step.evidence.level === "species-direct") return null;
  const keys = Object.keys(step.doses ?? {}).sort();
  const doseKey = keys[0];
  if (!doseKey) return null;

  const dose = step.doses![doseKey];
  const middle = round2((dose.low + dose.high) / 2);

  return {
    doseKey,
    dose,
    arms: [
      { armId: "a", dose: round2(dose.low) },
      { armId: "b", dose: middle },
      { armId: "c", dose: round2(dose.high) },
    ],
  };
}
```

- [ ] **Step 4: รันเทสต์**

Run: `npx vitest run src/lib/rounds/bracket.test.ts`
Expected: PASS ทั้ง 6 ข้อ

- [ ] **Step 5: Commit**

```bash
git add src/lib/rounds/bracket.ts src/lib/rounds/bracket.test.ts
git commit -m "feat: split a dose range into three test arms"
```

---

### Task 3: ตัดสินผู้ชนะ และตรวจตัวเลขที่ขัดกันเอง

**Files:**
- Modify: `src/lib/rounds/bracket.ts`
- Modify: `src/lib/rounds/bracket.test.ts`

**Interfaces:**
- Consumes: `BracketArmId` จาก task ก่อนหน้า
- Produces:
  - `type BracketResult = { armId: BracketArmId; dose: number; clean: number; alive: number; usable: number }`
  - `chooseBracketWinner(results: BracketResult[], jarsPerArm: number): BracketOutcome`
  - `validateBracket(results: BracketResult[], jarsPerArm: number): string[]`
  - ```ts
    type BracketOutcome =
      | { kind: "winner"; armId: BracketArmId; dose: number; note: string }
      | { kind: "all-failed"; direction: "up" | "down" | "both"; note: string }
      | { kind: "incomplete"; note: string };
    ```

- [ ] **Step 1: เขียนเทสต์ที่ยังไม่ผ่าน**

เพิ่มท้าย `src/lib/rounds/bracket.test.ts`

```ts
import { chooseBracketWinner, validateBracket, type BracketResult } from "./bracket";

const arm = (armId: "a" | "b" | "c", dose: number, clean: number, alive: number, usable: number): BracketResult =>
  ({ armId, dose, clean, alive, usable });

describe("การตัดสินผลทดสอบช่วง", () => {
  it("กรอกไม่ครบสามชุด ยังตัดสินไม่ได้", () => {
    expect(chooseBracketWinner([arm("a", 0.8, 3, 3, 3)], 3).kind).toBe("incomplete");
  });

  it("เลือกชุดที่ใช้ได้มากที่สุด", () => {
    const outcome = chooseBracketWinner(
      [arm("a", 0.8, 1, 3, 1), arm("b", 1.4, 3, 3, 3), arm("c", 2, 3, 1, 1)],
      3,
    );
    expect(outcome).toMatchObject({ kind: "winner", armId: "b", dose: 1.4 });
  });

  it("เสมอกันให้เลือกชุดที่เข้มข้นต่ำกว่า เพราะเสียหายกับเนื้อเยื่อน้อยกว่า", () => {
    const outcome = chooseBracketWinner(
      [arm("a", 0.8, 2, 2, 2), arm("b", 1.4, 2, 2, 2), arm("c", 2, 2, 2, 2)],
      3,
    );
    expect(outcome).toMatchObject({ kind: "winner", armId: "a", dose: 0.8 });
  });

  it("ล้มทุกชุดเพราะติดเชื้อ ให้เพิ่มความเข้มข้น", () => {
    const outcome = chooseBracketWinner(
      [arm("a", 0.8, 0, 3, 0), arm("b", 1.4, 0, 3, 0), arm("c", 2, 1, 3, 0)],
      3,
    );
    expect(outcome).toMatchObject({ kind: "all-failed", direction: "up" });
  });

  it("ล้มทุกชุดเพราะชิ้นดำ ให้ลดความเข้มข้น", () => {
    const outcome = chooseBracketWinner(
      [arm("a", 0.8, 3, 0, 0), arm("b", 1.4, 3, 1, 0), arm("c", 2, 3, 0, 0)],
      3,
    );
    expect(outcome).toMatchObject({ kind: "all-failed", direction: "down" });
  });

  it("ล้มทุกชุดจากทั้งสองอาการเท่ากัน ต้องบอกให้แยกอาการก่อน", () => {
    const outcome = chooseBracketWinner(
      [arm("a", 0.8, 1, 1, 0), arm("b", 1.4, 1, 1, 0), arm("c", 2, 1, 1, 0)],
      3,
    );
    expect(outcome).toMatchObject({ kind: "all-failed", direction: "both" });
  });
});

describe("การตรวจตัวเลขที่ขัดกันเอง", () => {
  it("ตัวเลขที่สมเหตุสมผล ไม่มีคำเตือน", () => {
    expect(validateBracket([arm("a", 0.8, 3, 3, 3)], 3)).toEqual([]);
  });

  it("ใช้ได้จริงมากกว่าจำนวนกระปุก เป็นไปไม่ได้", () => {
    expect(validateBracket([arm("a", 0.8, 3, 3, 4)], 3).length).toBeGreaterThan(0);
  });

  it("ใช้ได้จริงมากกว่ากระปุกที่ไม่ติดเชื้อ เป็นไปไม่ได้", () => {
    expect(validateBracket([arm("a", 0.8, 1, 3, 2)], 3).length).toBeGreaterThan(0);
  });

  it("ใช้ได้จริงมากกว่ากระปุกที่ชิ้นยังเขียว เป็นไปไม่ได้", () => {
    expect(validateBracket([arm("a", 0.8, 3, 1, 2)], 3).length).toBeGreaterThan(0);
  });

  it("คำเตือนบอกว่าเป็นชุดไหน", () => {
    expect(validateBracket([arm("c", 2, 3, 3, 9)], 3)[0]).toContain("C");
  });
});
```

- [ ] **Step 2: รันให้เห็นว่าพัง**

Run: `npx vitest run src/lib/rounds/bracket.test.ts`
Expected: FAIL — ไม่มี `chooseBracketWinner`

- [ ] **Step 3: เขียน implementation**

ต่อท้าย `src/lib/rounds/bracket.ts`

```ts
export type BracketResult = {
  armId: BracketArmId;
  dose: number;
  clean: number;
  alive: number;
  usable: number;
};

export type BracketOutcome =
  | { kind: "winner"; armId: BracketArmId; dose: number; note: string }
  | { kind: "all-failed"; direction: "up" | "down" | "both"; note: string }
  | { kind: "incomplete"; note: string };

const armLabel: Record<BracketArmId, string> = { a: "A", b: "B", c: "C" };

/** ตัดสินว่าชุดไหนใช้ได้ ถ้าไม่มีเลยก็บอกทิศทางที่ควรขยับ
 *
 *  เสมอกันให้เลือกชุดที่เข้มข้นต่ำกว่าเสมอ เพราะเสียหายกับเนื้อเยื่อน้อยกว่า
 *  และใช้สารน้อยกว่า ซึ่งเป็นทิศทางที่ปลอดภัยกว่าเมื่อข้อมูลบอกไม่ต่างกัน */
export function chooseBracketWinner(results: BracketResult[], jarsPerArm: number): BracketOutcome {
  if (results.length < 3 || jarsPerArm <= 0) {
    return { kind: "incomplete", note: "ยังกรอกไม่ครบทั้งสามชุด จึงยังสรุปไม่ได้" };
  }

  const usable = results.filter((item) => item.usable > 0);
  if (usable.length > 0) {
    const best = [...usable].sort((a, b) => (b.usable - a.usable) || (a.dose - b.dose))[0];
    return {
      kind: "winner",
      armId: best.armId,
      dose: best.dose,
      note:
        `ชุด ${armLabel[best.armId]} ใช้ได้ ${best.usable} จาก ${jarsPerArm} กระปุก ` +
        "จากการทดสอบ 3 กระปุกต่อชุดในรอบเดียว ใช้เป็นจุดตั้งต้นที่ดีกว่าเดา ไม่ใช่ข้อพิสูจน์",
    };
  }

  const totalJars = jarsPerArm * results.length;
  const contaminated = totalJars - results.reduce((sum, item) => sum + item.clean, 0);
  const browned = totalJars - results.reduce((sum, item) => sum + item.alive, 0);

  if (contaminated > browned) {
    return {
      kind: "all-failed",
      direction: "up",
      note: "ทุกชุดล้มเพราะติดเชื้อเป็นหลัก แปลว่าฟอกไม่พอ ให้เพิ่มความเข้มข้นหรือเวลาแล้วทดสอบใหม่",
    };
  }
  if (browned > contaminated) {
    return {
      kind: "all-failed",
      direction: "down",
      note: "ทุกชุดล้มเพราะชิ้นดำเป็นหลัก แปลว่าฟอกแรงเกิน ให้ลดลงแล้วทดสอบใหม่ และดูวิธีแก้ยางดำ",
    };
  }
  return {
    kind: "all-failed",
    direction: "both",
    note: "เจอทั้งติดเชื้อและชิ้นดำพอ ๆ กัน ให้แยกอาการก่อนว่าอันไหนเกิดกับกระปุกไหน แล้วค่อยเลือกทิศทาง",
  };
}

/** ตัวเลขที่ขัดกันเองต้องเตือนตอนกรอก ไม่ใช่ปล่อยผ่านแล้วคำนวณผิด
 *  เพราะผลลัพธ์จะดูสมเหตุสมผลทั้งที่ข้อมูลเข้าเป็นไปไม่ได้ */
export function validateBracket(results: BracketResult[], jarsPerArm: number): string[] {
  const messages: string[] = [];
  for (const item of results) {
    const label = armLabel[item.armId];
    if (item.usable > jarsPerArm) messages.push(`ชุด ${label} ใช้ได้จริงมากกว่าจำนวนกระปุกทั้งหมด`);
    if (item.usable > item.clean) messages.push(`ชุด ${label} ใช้ได้จริงมากกว่ากระปุกที่ไม่ติดเชื้อ`);
    if (item.usable > item.alive) messages.push(`ชุด ${label} ใช้ได้จริงมากกว่ากระปุกที่ชิ้นยังเขียว`);
    if (item.clean > jarsPerArm) messages.push(`ชุด ${label} กระปุกที่ไม่ติดเชื้อมากกว่าจำนวนกระปุกทั้งหมด`);
    if (item.alive > jarsPerArm) messages.push(`ชุด ${label} กระปุกที่ชิ้นยังเขียวมากกว่าจำนวนกระปุกทั้งหมด`);
  }
  return messages;
}
```

- [ ] **Step 4: รันเทสต์**

Run: `npx vitest run src/lib/rounds/bracket.test.ts`
Expected: PASS ทั้งหมด

- [ ] **Step 5: รันทั้งชุด**

Run: `npm test && npm run lint`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add src/lib/rounds/bracket.ts src/lib/rounds/bracket.test.ts
git commit -m "feat: decide the winning arm and warn on impossible counts"
```

---

### Task 4: กล่องบอกบนหน้าคู่มือสาธารณะ

**Files:**
- Create: `src/components/guide/bracket-notice.tsx`
- Create: `src/components/guide/bracket-notice.test.tsx`
- Modify: `src/components/guide/step-detail.tsx`

**Interfaces:**
- Consumes: `buildBracketPlan` จาก `@/lib/rounds/bracket`
- Produces: `<BracketNotice step={ResolvedStep} />` คืน `null` เมื่อขั้นนั้นไม่ต้องทดสอบ

- [ ] **Step 1: เขียนเทสต์ที่ยังไม่ผ่าน**

`src/components/guide/bracket-notice.test.tsx`

```tsx
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import type { Dose } from "@/lib/manual/forms/types";
import type { ResolvedStep } from "@/lib/manual/types";
import { BracketNotice } from "./bracket-notice";

const dose: Dose = {
  form: "น้ำยาซักผ้าขาว NaOCl 6%",
  low: 0.8,
  high: 2,
  unit: "%",
  durationMin: [10, 20],
  movesLowerWhen: ["เนื้อด่างมาก"],
  movesHigherWhen: ["ต้นกลางแจ้ง"],
  evidence: { level: "adapted", sourceIds: ["source-pp-2023"] },
};

const base: ResolvedStep = {
  id: "sterilize",
  title: "ฟอกฆ่าเชื้อ",
  summary: "",
  why: "",
  materials: [],
  actions: [],
  passCriteria: [],
  stopConditions: [],
  safetyNotes: [],
  measurements: [],
  evidence: { level: "adapted", sourceIds: ["source-pp-2023"] },
  durationMinutes: null,
  order: 0,
  origin: "core",
};

describe("กล่องบอกว่าต้องทดสอบช่วง", () => {
  it("ขั้นที่ไม่มีค่าช่วง ไม่แสดงอะไร", () => {
    expect(renderToStaticMarkup(<BracketNotice step={base} />)).toBe("");
  });

  it("ขั้นที่มีงานตรงพันธุ์ ไม่แสดงอะไร", () => {
    const step = { ...base, doses: { "sterilize.dose": dose }, evidence: { level: "species-direct" as const, sourceIds: ["source-pp-2023"] } };
    expect(renderToStaticMarkup(<BracketNotice step={step} />)).toBe("");
  });

  it("แสดงสามชุดพร้อมค่าที่ต้องใช้", () => {
    const html = renderToStaticMarkup(<BracketNotice step={{ ...base, doses: { "sterilize.dose": dose } }} />);
    expect(html).toContain("0.8");
    expect(html).toContain("1.4");
    expect(html).toContain("2");
  });

  it("บอกชื่อและรูปแบบของสารที่ใช้จริง ไม่ใช่ตัวเลขลอย ๆ", () => {
    const html = renderToStaticMarkup(<BracketNotice step={{ ...base, doses: { "sterilize.dose": dose } }} />);
    expect(html).toContain("น้ำยาซักผ้าขาว NaOCl 6%");
  });

  it("บอกตัวแปรที่ทำให้ขยับขึ้นและลง", () => {
    const html = renderToStaticMarkup(<BracketNotice step={{ ...base, doses: { "sterilize.dose": dose } }} />);
    expect(html).toContain("เนื้อด่างมาก");
    expect(html).toContain("ต้นกลางแจ้ง");
  });

  it("ไม่มีช่องกรอกและไม่มีข้อมูลเฉพาะบุคคล เพราะหน้านี้ prerender และอ่านได้โดยไม่ล็อกอิน", () => {
    const html = renderToStaticMarkup(<BracketNotice step={{ ...base, doses: { "sterilize.dose": dose } }} />);
    expect(html).not.toContain("<input");
    expect(html).not.toContain("<form");
  });
});
```

- [ ] **Step 2: รันให้เห็นว่าพัง**

Run: `npx vitest run src/components/guide/bracket-notice.test.tsx`
Expected: FAIL — `Cannot find module './bracket-notice'`

- [ ] **Step 3: เขียน component**

`src/components/guide/bracket-notice.tsx`

```tsx
import { buildBracketPlan } from "@/lib/rounds/bracket";
import type { ResolvedStep } from "@/lib/manual/types";

const armLabel = { a: "A", b: "B", c: "C" } as const;
const armWhen = { a: "ปลายต่ำ", b: "กลาง", c: "ปลายสูง" } as const;

/** กล่องนี้เป็นข้อความอย่างเดียว ไม่มีช่องกรอกและไม่มีข้อมูลเฉพาะบุคคล
 *  เพราะหน้าคู่มือสาธารณะ prerender ตอน build และอ่านได้โดยไม่ต้องล็อกอิน
 *  การกรอกจริงอยู่ในรอบเพาะ ดู bracket-table.tsx */
export function BracketNotice({ step }: { step: ResolvedStep }) {
  const plan = buildBracketPlan(step);
  if (!plan) return null;

  const { dose } = plan;

  return (
    <div className="pl-card" style={{ marginTop: "18px", background: "var(--pl-sunk)" }}>
      <p style={{ margin: 0, fontWeight: 700 }}>ยังไม่มีงานตรงพันธุ์ของต้นนี้ — อย่าเดา ให้ต้นบอกเอง</p>
      <p className="pl-lede" style={{ marginTop: "8px" }}>
        แบ่งชิ้นพืชเป็น 3 ชุด ชุดละ 3 กระปุก ใช้{dose.form} แช่นาน {dose.durationMin[0]} ถึง{" "}
        {dose.durationMin[1]} นาทีเท่ากันทุกชุด ต่างกันแค่ความเข้มข้น
      </p>
      <ul style={{ margin: "10px 0 0", paddingLeft: "20px", display: "flex", flexDirection: "column", gap: "4px" }}>
        {plan.arms.map((arm) => (
          <li key={arm.armId}>
            ชุด {armLabel[arm.armId]} {armWhen[arm.armId]} {arm.dose}{dose.unit}
          </li>
        ))}
      </ul>
      {dose.movesLowerWhen.length > 0 ? (
        <p className="pl-meta" style={{ marginTop: "10px" }}>
          เริ่มจากปลายต่ำถ้า {dose.movesLowerWhen.join(" · ")}
        </p>
      ) : null}
      {dose.movesHigherWhen.length > 0 ? (
        <p className="pl-meta" style={{ marginTop: "4px" }}>
          เริ่มจากปลายสูงถ้า {dose.movesHigherWhen.join(" · ")}
        </p>
      ) : null}
      <p className="pl-lede" style={{ marginTop: "10px" }}>
        ดูผลใน 14 วัน แล้วบันทึกลงรอบเพาะ ชุดที่ไม่ติดเชื้อและชิ้นยังเขียว คือค่าของต้นคุณ
      </p>
    </div>
  );
}
```

- [ ] **Step 4: วางกล่องในหน้าขั้นเดียว**

`src/components/guide/step-detail.tsx` เพิ่ม import

```tsx
import { BracketNotice } from "./bracket-notice";
```

แล้วเพิ่มบรรทัดนี้ทันทีหลังบรรทัดที่แสดง `<RichText source={step.summary} />`

```tsx
      <BracketNotice step={step} />
```

- [ ] **Step 5: รันเทสต์และ build**

Run: `npm test && npm run lint && npm run build`
Expected: PASS ทั้งหมด

- [ ] **Step 6: Commit**

```bash
git add src/components/guide/bracket-notice.tsx src/components/guide/bracket-notice.test.tsx src/components/guide/step-detail.tsx
git commit -m "feat: tell readers when a step needs a bracket test"
```

---

### Task 5: ที่เก็บค่าที่ทดสอบได้

**Files:**
- Create: `src/lib/domain/calibration.ts`
- Create: `src/lib/domain/calibration.test.ts`
- Create: `src/lib/repositories/calibration-repository.ts`
- Create: `src/lib/repositories/memory-calibration-repository.ts`
- Create: `src/lib/firebase/firestore-calibration-repository.ts`
- Create: `src/lib/repositories/calibration-repository-factory.ts`

**Interfaces:**
- Consumes: ไม่มีจาก task อื่น
- Produces:
  - `type CalibrationEntry = { slug: string; stepId: string; doseKey: string; value: number; unit: string; jarsPerArm: number; usable: number; lotId: string; decidedAt: string }`
  - `calibrationKey(slug: string, stepId: string, doseKey: string): string`
  - `interface CalibrationRepository { list(ownerId): Promise<CalibrationEntry[]>; save(ownerId, entry): Promise<CalibrationEntry> }`
  - `getCalibrationRepository(ownerId: string, authenticated: boolean): CalibrationRepository`

- [ ] **Step 1: เขียนเทสต์ที่ยังไม่ผ่าน**

`src/lib/domain/calibration.test.ts`

```ts
import { describe, expect, it } from "vitest";

import { calibrationKey } from "./calibration";
import { createMemoryCalibrationRepository } from "@/lib/repositories/memory-calibration-repository";

const entry = {
  slug: "pink-princess",
  stepId: "sterilize",
  doseKey: "sterilize.dose",
  value: 1.4,
  unit: "%",
  jarsPerArm: 3,
  usable: 3,
  lotId: "round-1",
  decidedAt: "2026-08-06",
};

describe("ค่าที่ทดสอบได้", () => {
  it("คีย์ประกอบจากพืช ขั้น และชื่อค่า", () => {
    expect(calibrationKey("pink-princess", "sterilize", "sterilize.dose")).toBe(
      "pink-princess:sterilize:sterilize.dose",
    );
  });

  it("บันทึกแล้วอ่านกลับได้", async () => {
    const repo = createMemoryCalibrationRepository();
    await repo.save("owner", entry);
    expect(await repo.list("owner")).toEqual([entry]);
  });

  it("ทดสอบซ้ำของขั้นเดิม ทับค่าเดิม ไม่ใช่เพิ่มรายการใหม่", async () => {
    const repo = createMemoryCalibrationRepository();
    await repo.save("owner", entry);
    await repo.save("owner", { ...entry, value: 0.8, decidedAt: "2026-09-01" });
    const found = await repo.list("owner");
    expect(found).toHaveLength(1);
    expect(found[0].value).toBe(0.8);
  });

  it("ค่าของเจ้าของคนละคนไม่ปนกัน", async () => {
    const repo = createMemoryCalibrationRepository();
    await repo.save("owner-a", entry);
    expect(await repo.list("owner-b")).toEqual([]);
  });
});
```

- [ ] **Step 2: รันให้เห็นว่าพัง**

Run: `npx vitest run src/lib/domain/calibration.test.ts`
Expected: FAIL — `Cannot find module './calibration'`

- [ ] **Step 3: เขียนชนิดและฟังก์ชันคีย์**

`src/lib/domain/calibration.ts`

```ts
/** ค่าที่ผู้ใช้ทดสอบได้เองจากขั้นทดสอบช่วง
 *
 *  ค่านี้ไม่เปลี่ยนระดับหลักฐานของขั้นนั้น เพราะการทดลองของผู้ใช้คนเดียว
 *  ไม่ใช่งานที่ผ่านการทบทวน ระบบแค่จำสิ่งที่ผู้ใช้พบ ไม่ได้เปลี่ยนสิ่งที่ระบบอ้าง */
export type CalibrationEntry = {
  slug: string;
  stepId: string;
  doseKey: string;
  value: number;
  unit: string;
  jarsPerArm: number;
  usable: number;
  lotId: string;
  decidedAt: string;
};

export function calibrationKey(slug: string, stepId: string, doseKey: string): string {
  return `${slug}:${stepId}:${doseKey}`;
}
```

- [ ] **Step 4: เขียน interface และตัวจำในหน่วยความจำ**

`src/lib/repositories/calibration-repository.ts`

```ts
import type { CalibrationEntry } from "@/lib/domain/calibration";

export interface CalibrationRepository {
  list(ownerId: string): Promise<CalibrationEntry[]>;
  save(ownerId: string, entry: CalibrationEntry): Promise<CalibrationEntry>;
}
```

`src/lib/repositories/memory-calibration-repository.ts`

```ts
import { calibrationKey, type CalibrationEntry } from "@/lib/domain/calibration";
import type { CalibrationRepository } from "./calibration-repository";

export function createMemoryCalibrationRepository(): CalibrationRepository {
  const byOwner = new Map<string, Map<string, CalibrationEntry>>();

  return {
    async list(ownerId) {
      return [...(byOwner.get(ownerId)?.values() ?? [])];
    },
    async save(ownerId, entry) {
      const existing = byOwner.get(ownerId) ?? new Map<string, CalibrationEntry>();
      existing.set(calibrationKey(entry.slug, entry.stepId, entry.doseKey), entry);
      byOwner.set(ownerId, existing);
      return entry;
    },
  };
}
```

- [ ] **Step 5: เขียนตัว Firestore และ factory**

`src/lib/firebase/firestore-calibration-repository.ts`

```ts
import { doc, getDoc, setDoc } from "firebase/firestore";
import { calibrationKey, type CalibrationEntry } from "@/lib/domain/calibration";
import type { CalibrationRepository } from "@/lib/repositories/calibration-repository";
import { getFirebaseServices } from "./client";

// เก็บที่ users/{ownerId}/settings/calibration ซึ่ง security rules เดิมอนุญาตอยู่แล้ว
// แพตเทิร์นเดียวกับ settings/equipment จึงไม่ต้องแก้ rules และไม่ต้อง migrate
export function createFirestoreCalibrationRepository(ownerId: string): CalibrationRepository {
  void ownerId;
  const path = (owner: string) => `users/${owner}/settings/calibration`;

  return {
    async list(owner) {
      const services = getFirebaseServices();
      if (!services) return [];
      const snapshot = await getDoc(doc(services.firestore, path(owner)));
      if (!snapshot.exists()) return [];
      const data = snapshot.data() as { entries?: Record<string, CalibrationEntry> };
      return Object.values(data.entries ?? {});
    },
    async save(owner, entry) {
      const services = getFirebaseServices();
      if (!services) return entry;
      const reference = doc(services.firestore, path(owner));
      const snapshot = await getDoc(reference);
      const data = snapshot.exists() ? (snapshot.data() as { entries?: Record<string, CalibrationEntry> }) : {};
      const entries = { ...(data.entries ?? {}) };
      entries[calibrationKey(entry.slug, entry.stepId, entry.doseKey)] = entry;
      await setDoc(reference, { ownerId: owner, entries });
      return entry;
    },
  };
}
```

`src/lib/repositories/calibration-repository-factory.ts`

```ts
import { createFirestoreCalibrationRepository } from "@/lib/firebase/firestore-calibration-repository";
import type { CalibrationRepository } from "./calibration-repository";
import { createMemoryCalibrationRepository } from "./memory-calibration-repository";

const demos = new Map<string, CalibrationRepository>();

export function getCalibrationRepository(ownerId: string, authenticated: boolean): CalibrationRepository {
  if (authenticated) return createFirestoreCalibrationRepository(ownerId);
  const existing = demos.get(ownerId);
  if (existing) return existing;
  const repository = createMemoryCalibrationRepository();
  demos.set(ownerId, repository);
  return repository;
}
```

- [ ] **Step 6: รันเทสต์และทั้งชุด**

Run: `npx vitest run src/lib/domain/calibration.test.ts && npm test && npm run lint`
Expected: PASS ทั้งหมด

- [ ] **Step 7: Commit**

```bash
git add src/lib/domain/calibration.ts src/lib/domain/calibration.test.ts src/lib/repositories/calibration-repository.ts src/lib/repositories/memory-calibration-repository.ts src/lib/firebase/firestore-calibration-repository.ts src/lib/repositories/calibration-repository-factory.ts
git commit -m "feat: remember the dose a user proved on their own plant"
```

---

### Task 6: ตารางกรอกผลในรอบเพาะ

**Files:**
- Create: `src/components/rounds/bracket-table.tsx`
- Create: `src/components/rounds/bracket-table.test.tsx`
- Modify: `src/components/rounds/step-runner.tsx`
- Modify: `src/app/guide.css`

**Interfaces:**
- Consumes: `buildBracketPlan`, `bracketKey`, `jarsPerArmKey` จาก `@/lib/rounds/bracket` · `CalibrationEntry` จาก `@/lib/domain/calibration`
- Produces: `<BracketTable plan={BracketPlan} saved={Record<string, number | null>} remembered={CalibrationEntry | null} />`
  โดยชื่อ `name` ของทุก input มาจาก `bracketKey` และ `jarsPerArmKey`

- [ ] **Step 1: เขียนเทสต์ที่ยังไม่ผ่าน**

`src/components/rounds/bracket-table.test.tsx`

```tsx
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import type { Dose } from "@/lib/manual/forms/types";
import { bracketKey, jarsPerArmKey, type BracketPlan } from "@/lib/rounds/bracket";
import { BracketTable } from "./bracket-table";

const dose: Dose = {
  form: "น้ำยาซักผ้าขาว NaOCl 6%",
  low: 0.8, high: 2, unit: "%", durationMin: [10, 20],
  movesLowerWhen: [], movesHigherWhen: [],
  evidence: { level: "adapted", sourceIds: ["source-pp-2023"] },
};

const plan: BracketPlan = {
  doseKey: "sterilize.dose",
  dose,
  arms: [
    { armId: "a", dose: 0.8 },
    { armId: "b", dose: 1.4 },
    { armId: "c", dose: 2 },
  ],
};

describe("ตารางกรอกผลทดสอบช่วง", () => {
  const html = renderToStaticMarkup(<BracketTable plan={plan} saved={{}} remembered={null} />);

  it("มีช่องกรอกครบทุกชุดและทุกช่อง โดยชื่อมาจากฟังก์ชันสร้างคีย์", () => {
    for (const armId of ["a", "b", "c"] as const) {
      for (const field of ["clean", "alive", "usable"] as const) {
        expect(html, `ไม่มีช่อง ${armId}/${field}`).toContain(`name="${bracketKey(armId, field)}"`);
      }
    }
    expect(html).toContain(`name="${jarsPerArmKey()}"`);
  });

  it("ไม่มีช่องให้กรอกความเข้มข้น เพราะระบบเป็นคนกำหนด", () => {
    expect(html).not.toContain(`name="${bracketKey("a", "dose")}"`);
  });

  it("เขียนนิยามของแต่ละช่องไว้ ไม่ให้ผู้ใช้เดา", () => {
    expect(html).toContain("ไม่มีเมือก");
    expect(html).toContain("ทั้งสองข้อพร้อมกัน");
  });

  it("เติมค่าที่เคยบันทึกไว้กลับเข้าช่อง", () => {
    const filled = renderToStaticMarkup(
      <BracketTable plan={plan} saved={{ [bracketKey("b", "usable")]: 3 }} remembered={null} />,
    );
    expect(filled).toContain('value="3"');
  });

  it("ค่าที่เคยทดสอบได้ ต้องไม่ยกระดับหลักฐานของขั้น", () => {
    // การทดลองของผู้ใช้คนเดียวไม่ใช่งานที่ผ่านการทบทวน ระบบจำสิ่งที่ผู้ใช้พบ
    // ไม่ได้เปลี่ยนสิ่งที่ระบบอ้าง เทสต์นี้กันไม่ให้ใครเผลอเชื่อมสองอย่างนี้เข้าด้วยกัน
    const withMemory = renderToStaticMarkup(
      <BracketTable
        plan={plan}
        saved={{}}
        remembered={{
          slug: "pink-princess", stepId: "sterilize", doseKey: "sterilize.dose",
          value: 1.4, unit: "%", jarsPerArm: 3, usable: 3,
          lotId: "round-1", decidedAt: "2026-08-06",
        }}
      />,
    );
    expect(withMemory).not.toContain("ระดับหลักฐาน");
    expect(withMemory).not.toContain("ตรงพันธุ์");
  });

  it("แสดงค่าที่เคยทดสอบได้พร้อมคำเตือนว่าไม่ใช่ข้อพิสูจน์", () => {
    const withMemory = renderToStaticMarkup(
      <BracketTable
        plan={plan}
        saved={{}}
        remembered={{
          slug: "pink-princess", stepId: "sterilize", doseKey: "sterilize.dose",
          value: 1.4, unit: "%", jarsPerArm: 3, usable: 3,
          lotId: "round-1", decidedAt: "2026-08-06",
        }}
      />,
    );
    expect(withMemory).toContain("1.4");
    expect(withMemory).toContain("ไม่ใช่ข้อพิสูจน์");
  });
});
```

- [ ] **Step 2: รันให้เห็นว่าพัง**

Run: `npx vitest run src/components/rounds/bracket-table.test.tsx`
Expected: FAIL — `Cannot find module './bracket-table'`

- [ ] **Step 3: เขียน component**

`src/components/rounds/bracket-table.tsx`

```tsx
import type { CalibrationEntry } from "@/lib/domain/calibration";
import { bracketKey, jarsPerArmKey, type BracketPlan } from "@/lib/rounds/bracket";

const armLabel = { a: "A", b: "B", c: "C" } as const;

/** ไม่ใช่ client component ของตัวเอง มันถูกวางอยู่ในฟอร์มของ step-runner ที่เป็น client อยู่แล้ว
 *  ช่องทั้งหมดใช้ name ที่มาจากฟังก์ชันสร้างคีย์ ทำให้ตัวบันทึกเดิมเก็บค่าได้โดยไม่ต้องรู้จักตารางนี้ */
export function BracketTable({
  plan,
  saved,
  remembered,
}: {
  plan: BracketPlan;
  saved: Record<string, number | null>;
  remembered: CalibrationEntry | null;
}) {
  const value = (key: string) => {
    const found = saved[key];
    return found === null || found === undefined ? "" : String(found);
  };

  return (
    <section style={{ marginTop: "24px" }}>
      <h2 className="pl-h2">ผลการทดสอบช่วง</h2>

      {remembered ? (
        <div className="pl-card" style={{ marginTop: "10px", background: "var(--pl-sunk)" }}>
          <p style={{ margin: 0, fontWeight: 700 }}>
            ค่าที่คุณเคยทดสอบได้คือ {remembered.value}{remembered.unit}
          </p>
          <p className="pl-meta" style={{ marginTop: "6px" }}>
            จากรอบ {remembered.lotId} เมื่อ {remembered.decidedAt} · ใช้ได้ {remembered.usable} จาก{" "}
            {remembered.jarsPerArm} กระปุก · จากการทดสอบ 3 กระปุกต่อชุดในรอบเดียว
            ใช้เป็นจุดตั้งต้นที่ดีกว่าเดา ไม่ใช่ข้อพิสูจน์
          </p>
        </div>
      ) : null}

      <p className="pl-lede" style={{ marginTop: "12px" }}>
        นับกระปุกในแต่ละชุดหลังครบ 14 วัน แล้วกรอกสามช่องต่อชุด
      </p>
      <ul className="pl-meta" style={{ margin: "8px 0 0", paddingLeft: "20px" }}>
        <li>ไม่ติดเชื้อ คือกระปุกที่ไม่มีเมือก ไม่มีขนฟู วุ้นยังใส</li>
        <li>ชิ้นยังเขียว คือชิ้นพืชไม่ดำและไม่เปื่อย ไม่ว่าจะติดเชื้อหรือไม่</li>
        <li>ใช้ได้จริง คือกระปุกที่เข้าทั้งสองข้อพร้อมกัน</li>
      </ul>

      <p style={{ marginTop: "14px" }}>
        <label>
          กระปุกต่อชุด{" "}
          <input
            className="pl-input"
            style={{ maxWidth: "90px" }}
            type="number"
            min={1}
            name={jarsPerArmKey()}
            defaultValue={value(jarsPerArmKey()) || "3"}
          />
        </label>
      </p>

      <div style={{ overflowX: "auto", marginTop: "12px" }}>
        <table className="pl-table">
          <thead>
            <tr>
              <th>ชุด</th>
              <th>ความเข้มข้น</th>
              <th>ไม่ติดเชื้อ</th>
              <th>ชิ้นยังเขียว</th>
              <th>ใช้ได้จริง</th>
            </tr>
          </thead>
          <tbody>
            {plan.arms.map((arm) => (
              <tr key={arm.armId}>
                <th scope="row">{armLabel[arm.armId]}</th>
                <td>{arm.dose}{plan.dose.unit}</td>
                {(["clean", "alive", "usable"] as const).map((field) => (
                  <td key={field}>
                    <input
                      className="pl-input"
                      style={{ maxWidth: "80px" }}
                      type="number"
                      min={0}
                      name={bracketKey(arm.armId, field)}
                      defaultValue={value(bracketKey(arm.armId, field))}
                      aria-label={`ชุด ${armLabel[arm.armId]} ${field}`}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: เพิ่ม CSS ของตาราง**

ต่อท้าย `src/app/guide.css`

```css
/* ตารางผลทดสอบช่วง อยู่ในโหมดลงมือจึงเน้นตัวเลขอ่านง่ายตอนมือเปื้อน */
.pl-table {
  border-collapse: collapse;
  width: 100%;
  font-variant-numeric: tabular-nums;
}

.pl-table th,
.pl-table td {
  border: 1px solid var(--pl-line-soft);
  padding: 8px 10px;
  text-align: left;
}

.pl-table thead th {
  font-size: 13px;
  color: var(--pl-ink-3);
  font-weight: 600;
}
```

- [ ] **Step 5: วางตารางใน step-runner และรวมค่าตอนบันทึก**

`src/components/rounds/step-runner.tsx`

เพิ่ม import

```tsx
import type { CalibrationEntry } from "@/lib/domain/calibration";
import { bracketKey, buildBracketPlan, jarsPerArmKey } from "@/lib/rounds/bracket";
import { BracketTable } from "./bracket-table";
```

เพิ่ม prop `remembered?: CalibrationEntry | null` ใน signature ของ `StepRunner`

ในฟังก์ชัน `submit` หลังลูปที่อ่าน `step.measurements` ให้เพิ่ม

```tsx
    // ค่าของตารางทดสอบช่วงใช้ name ที่มาจากฟังก์ชันสร้างคีย์ จึงอ่านด้วยวิธีเดียวกัน
    const plan = buildBracketPlan(step);
    if (plan) {
      const keys = [jarsPerArmKey()];
      for (const arm of plan.arms) {
        for (const field of ["clean", "alive", "usable"] as const) keys.push(bracketKey(arm.armId, field));
        // ความเข้มข้นระบบเป็นคนเขียน ไม่ใช่ผู้ใช้กรอก เก็บไว้ให้ย้อนดูได้ว่ารอบนั้นทดสอบค่าอะไร
        measurements[bracketKey(arm.armId, "dose")] = arm.dose;
      }
      for (const key of keys) {
        const raw = String(form.get(key) ?? "").trim();
        measurements[key] = raw === "" ? null : Number(raw);
      }
    }
```

แล้ววาง `<BracketTable />` ทันทีก่อน `{troubleshooting.length > 0 ? (`

```tsx
      {buildBracketPlan(step) ? (
        <BracketTable
          plan={buildBracketPlan(step)!}
          saved={step.state.measurements}
          remembered={remembered ?? null}
        />
      ) : null}
```

- [ ] **Step 6: รันเทสต์ทั้งชุด**

Run: `npm test && npm run lint && npm run build`
Expected: PASS ทั้งหมด

- [ ] **Step 7: Commit**

```bash
git add src/components/rounds/bracket-table.tsx src/components/rounds/bracket-table.test.tsx src/components/rounds/step-runner.tsx src/app/guide.css
git commit -m "feat: record bracket results inside the round"
```

---

### Task 7: ต่อหน้ารอบเข้ากับที่เก็บค่า

**Files:**
- Modify: `src/app/my/rounds/[roundId]/step/[step]/page.tsx`

**Interfaces:**
- Consumes: `getCalibrationRepository` จาก `@/lib/repositories/calibration-repository-factory` · `chooseBracketWinner`, `buildBracketPlan`, `bracketKey`, `jarsPerArmKey` จาก `@/lib/rounds/bracket` · `calibrationKey` จาก `@/lib/domain/calibration`
- Produces: ไม่มี API ใหม่

- [ ] **Step 1: เพิ่ม import และ repository**

เพิ่ม import ที่หัวไฟล์

```tsx
import { calibrationKey, type CalibrationEntry } from "@/lib/domain/calibration";
import { getCalibrationRepository } from "@/lib/repositories/calibration-repository-factory";
import { bracketKey, buildBracketPlan, chooseBracketWinner, jarsPerArmKey, type BracketResult } from "@/lib/rounds/bracket";
```

เพิ่มถัดจากบรรทัดที่สร้าง `equipment`

```tsx
  const calibration = useMemo(() => getCalibrationRepository(ownerId, authenticated), [ownerId, authenticated]);
  const [remembered, setRemembered] = useState<CalibrationEntry | null>(null);
```

- [ ] **Step 2: โหลดค่าที่เคยทดสอบได้**

เพิ่ม effect ถัดจาก effect ที่โหลดชุดอุปกรณ์

```tsx
  // ดึงค่าที่ผู้ใช้เคยทดสอบได้ของขั้นนี้มาแสดง ผู้ใช้จะได้ไม่ต้องเปิดรอบเก่าหาเอง
  useEffect(() => {
    if (!["demo", "authenticated"].includes(session.status)) return;
    if (!view || !current) return;
    const plan = buildBracketPlan(current);
    if (!plan) {
      setRemembered(null);
      return;
    }
    let active = true;
    calibration
      .list(ownerId)
      .then((entries) => {
        if (!active) return;
        const key = calibrationKey(view.slug, current.id, plan.doseKey);
        setRemembered(entries.find((item) => calibrationKey(item.slug, item.stepId, item.doseKey) === key) ?? null);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [calibration, current, ownerId, session.status, view]);
```

- [ ] **Step 3: บันทึกค่าที่ตัดสินได้ตอนบันทึกขั้น**

ใน `save` หลัง `await runs.save(...)` และก่อน `setReloadKey` ให้เพิ่ม

```tsx
    // ถ้ากรอกครบและมีชุดที่ใช้ได้ ให้จำค่านั้นไว้ ผู้ใช้จะได้ไม่ต้องทดสอบซ้ำในรอบถัดไป
    // ค่านี้ไม่เปลี่ยนระดับหลักฐานของขั้น เพราะการทดลองของคนเดียวไม่ใช่งานที่ผ่านการทบทวน
    const plan = buildBracketPlan(current);
    if (plan) {
      const jars = input.measurements[jarsPerArmKey()] ?? 0;
      const results: BracketResult[] = plan.arms.map((arm) => ({
        armId: arm.armId,
        dose: arm.dose,
        clean: input.measurements[bracketKey(arm.armId, "clean")] ?? 0,
        alive: input.measurements[bracketKey(arm.armId, "alive")] ?? 0,
        usable: input.measurements[bracketKey(arm.armId, "usable")] ?? 0,
      }));
      const outcome = chooseBracketWinner(results, jars);
      if (outcome.kind === "winner") {
        const entry: CalibrationEntry = {
          slug: view.slug,
          stepId: current.id,
          doseKey: plan.doseKey,
          value: outcome.dose,
          unit: plan.dose.unit,
          jarsPerArm: jars,
          usable: results.find((item) => item.armId === outcome.armId)?.usable ?? 0,
          lotId: view.lotId,
          decidedAt: new Date().toISOString().slice(0, 10),
        };
        await calibration.save(ownerId, entry);
        setRemembered(entry);
      }
    }
```

และเพิ่ม `calibration` ลงใน dependency array ของ `save`

- [ ] **Step 4: ส่ง remembered ให้ StepRunner**

เพิ่ม prop ใน JSX

```tsx
            remembered={remembered}
```

- [ ] **Step 5: รันทั้งชุดและ build**

Run: `npm test && npm run lint && npm run build`
Expected: PASS ทั้งหมด

- [ ] **Step 6: Commit**

```bash
git add "src/app/my/rounds/[roundId]/step/[step]/page.tsx"
git commit -m "feat: save and recall the proven dose from the round page"
```

---

### Task 8: แสดงค่าที่ทดสอบได้ทั้งหมดที่หน้ารายการรอบ

**สเปกส่วนที่ 6 เขียนว่า `/my` แต่แผนนี้ใช้ `/my/rounds` แทน** เพราะ `src/app/my/page.tsx`
ถูกบีบเหลือบรรทัดเดียวและใช้ `LabShell` ซึ่งเป็นโซนหลังบ้านเก่าที่ `project_summary.md`
บันทึกไว้เองว่ายังใช้ `globals.css` และไม่มีโหมดมืด ส่วน `/my/rounds` ใช้ `GuideShell`
เหมือนหน้าอื่นและเป็นที่ที่ผู้ใช้เปิดดูรอบของตัวเองอยู่แล้ว

**Files:**
- Modify: `src/app/my/rounds/page.tsx`

**Interfaces:**
- Consumes: `getCalibrationRepository` และ `CalibrationEntry`
- Produces: ไม่มี API ใหม่

- [ ] **Step 1: เพิ่ม repository และ state**

`src/app/my/rounds/page.tsx` เพิ่ม import

```tsx
import type { CalibrationEntry } from "@/lib/domain/calibration";
import { getCalibrationRepository } from "@/lib/repositories/calibration-repository-factory";
```

เพิ่มถัดจากบรรทัดที่สร้าง `stepRuns`

```tsx
  const calibration = useMemo(() => getCalibrationRepository(ownerId, authenticated), [ownerId, authenticated]);
  const [calibrations, setCalibrations] = useState<CalibrationEntry[]>([]);
```

- [ ] **Step 2: โหลดค่าที่ทดสอบได้**

เพิ่ม effect ถัดจาก effect ที่โหลดรายการรอบ

```tsx
  useEffect(() => {
    if (!["demo", "authenticated"].includes(session.status)) return;
    let active = true;
    calibration
      .list(ownerId)
      .then((entries) => {
        if (active) setCalibrations(entries);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [calibration, ownerId, session.status]);
```

- [ ] **Step 3: เพิ่มส่วนแสดงผล**

วางก่อนปิด `</GuideShell>`

```tsx
      <section style={{ marginTop: "26px" }}>
        <h2 className="pl-h2">ค่าที่คุณทดสอบได้เอง</h2>
        {calibrations.length === 0 ? (
          <p className="pl-lede" style={{ marginTop: "8px" }}>
            ยังไม่มี ค่าจะขึ้นที่นี่เมื่อคุณทำขั้นทดสอบช่วงจนได้ชุดที่ใช้ได้
          </p>
        ) : (
          <>
            <ul style={{ listStyle: "none", margin: "10px 0 0", padding: 0, display: "flex", flexDirection: "column", gap: "10px" }}>
              {calibrations.map((entry) => (
                <li className="pl-card" key={`${entry.slug}-${entry.stepId}-${entry.doseKey}`}>
                  <p className="pl-h2">{entry.value}{entry.unit}</p>
                  <p className="pl-meta" style={{ marginTop: "4px" }}>
                    {entry.slug} · ขั้น {entry.stepId} · ใช้ได้ {entry.usable} จาก {entry.jarsPerArm} กระปุก ·{" "}
                    {entry.decidedAt}
                  </p>
                </li>
              ))}
            </ul>
            <p className="pl-meta" style={{ marginTop: "10px" }}>
              จากการทดสอบ 3 กระปุกต่อชุดในรอบเดียว ใช้เป็นจุดตั้งต้นที่ดีกว่าเดา ไม่ใช่ข้อพิสูจน์
            </p>
          </>
        )}
      </section>
```

- [ ] **Step 4: รันทั้งชุดและ build**

Run: `npm test && npm run lint && npm run build`
Expected: PASS ทั้งหมด

- [ ] **Step 5: Commit**

```bash
git add src/app/my/rounds/page.tsx
git commit -m "feat: list proven doses on the rounds page"
```

---

### Task 9: ตรวจของจริงในเบราว์เซอร์

เฟสนี้เป็นครั้งแรกที่ต้องเข้าโหมดสาธิตหรือล็อกอินก่อนถึงจะเห็นของ ต่างจากสามเฟสก่อน

**Files:**
- Modify: `handoff.md`
- อาจต้อง Modify: `src/lib/manual/genera/philodendron.ts` ชั่วคราว เพื่อให้มีค่าช่วงให้ทดสอบ

**Interfaces:**
- Consumes: ผลของ Task 1–8
- Produces: ไม่มีโค้ด

- [ ] **Step 1: ใส่ค่าช่วงชั่วคราวให้ทดสอบได้**

ตอนนี้ยังไม่มีทรงหรือสกุลใดตั้ง `doses` ไว้จริง จึงยังไม่มีขั้นไหนขึ้นตารางทดสอบ
เพิ่มชั่วคราวใน `src/lib/manual/genera/philodendron.ts` ใน `deviations`

```ts
    sterilize: {
      doses: {
        "sterilize.dose": {
          form: "น้ำยาซักผ้าขาว NaOCl 6% (ค่าทดสอบชั่วคราว ไม่ใช่ค่าจริง)",
          low: 0.8,
          high: 2,
          unit: "%",
          durationMin: [10, 20],
          movesLowerWhen: ["เนื้อด่างมาก", "ต้นจากโรงเรือน"],
          movesHigherWhen: ["ต้นกลางแจ้ง", "ฝนเพิ่งตก"],
          evidence: {
            level: "unsupported",
            sourceIds: [],
            searchedAt: "2026-08-06",
            searchQueries: ["ค่าทดสอบชั่วคราวสำหรับ QA เท่านั้น"],
            note: "ค่าทดสอบชั่วคราวสำหรับตรวจหน้าจอ ต้องลบออกหลังตรวจเสร็จ",
          },
        },
      },
    },
```

- [ ] **Step 2: ตรวจในเบราว์เซอร์**

Run: `npm run dev` แล้วเปิดตรวจ โดย**เลือก "เข้าใช้แบบสาธิต" ที่หน้าล็อกอิน**

| หน้า | ต้องเห็น |
|---|---|
| `/guide/pink-princess/step/7` | กล่องบอกให้แบ่งสามชุด พร้อมค่า 0.8 · 1.4 · 2 และชื่อสารเต็ม |
| หน้าเดียวกัน | ไม่มีช่องกรอกและไม่มีข้อมูลส่วนตัว |
| สร้างรอบใหม่จาก `/guide/pink-princess` แล้วไปขั้นฟอก | เห็นตารางสามชุด นิยามของแต่ละช่องครบ |
| กรอก 3 / 1,3,1 / 3,3,3 / 3,1,1 แล้วบันทึกว่าผ่าน | กลับมาแล้วค่าที่กรอกยังอยู่ในช่อง |
| หลังบันทึก | ขึ้นกล่อง "ค่าที่คุณเคยทดสอบได้คือ 1.4%" พร้อมคำเตือนว่าไม่ใช่ข้อพิสูจน์ |
| `/my` | มีรายการค่าที่ทดสอบได้ |
| ขั้นที่ไม่มีค่าช่วง เช่นขั้นรับต้น | ไม่มีตารางและไม่มีกล่อง |
| ป้ายระดับหลักฐานของขั้นฟอก | **ยังเป็นระดับเดิม ไม่ถูกยกระดับ** |

ตรวจทั้งโหมดสว่างและโหมดมืด และดูโทนโหมดลงมือ (`.pl-do`) ซึ่งเฟส 1 ยังไม่เคยเห็นของจริง

- [ ] **Step 3: ลบค่าชั่วคราวออก**

```bash
git checkout -- src/lib/manual/genera/philodendron.ts
git status --short
```

Expected: ไม่มีการแก้ไฟล์สกุลค้างอยู่

- [ ] **Step 4: บันทึกผลลง handoff.md**

ต่อท้าย `handoff.md` ตามโครงนี้

```markdown
## <วันที่> · เฟส 4 ขั้นทดสอบช่วง · QA ผ่านเบราว์เซอร์จริง

ตรวจในโหมดสาธิต โดยใส่ค่าช่วงชั่วคราวในสกุล Philodendron แล้วลบออกหลังตรวจเสร็จ

### ผ่านแล้ว
| หน้า | ผล |
|---|---|
| ... | ... |

### บั๊กที่เจอจากการเปิดดูของจริง
1. ...

### ยังไม่ได้ตรวจ
- **โหมดล็อกอินจริงกับ Firestore** ตรวจในโหมดสาธิตเท่านั้น ซึ่งเก็บในหน่วยความจำ
  ยังไม่ยืนยันว่าเขียนลง `users/{uid}/settings/calibration` ได้จริง
- ...
```

- [ ] **Step 5: รันทั้งชุด**

Run: `npm test && npm run lint && npm run build`
Expected: PASS ทั้งหมด

- [ ] **Step 6: Commit**

```bash
git add handoff.md
git commit -m "docs: record browser QA for the bracket test"
```

---

### Task 10: อัปเดตเอกสารระบบ

**Files:**
- Modify: `project_summary.md`

- [ ] **Step 1: เพิ่มกฎใหม่ในตารางกฎที่บังคับด้วยเทสต์ในส่วนที่ 4**

```markdown
| คีย์ของบันทึกทดสอบช่วงสร้างจากฟังก์ชันเดียว ห้ามพิมพ์ตรง ๆ | `rounds/bracket.test.ts` |
| เสมอกันในการทดสอบช่วง ต้องเลือกความเข้มข้นต่ำกว่า | `rounds/bracket.test.ts` |
| ล้มทุกชุดต้องบอกทิศทางที่ถูก ทั้งขึ้น ลง และทั้งสองทาง | `rounds/bracket.test.ts` |
| กรอกไม่ครบต้องคืน incomplete ไม่ใช่เดา | `rounds/bracket.test.ts` |
| ค่าช่วงต้องไหลผ่าน cascade ครบสี่ชั้น | `resolve.test.ts` |
```

- [ ] **Step 2: เพิ่มส่วนใหม่ท้ายไฟล์**

```markdown
## 17 · ขั้นทดสอบช่วง (เพิ่ม 6 สิงหาคม 2026)

เฟส 4 ของ redesign รอบสอง เหตุผลเต็มอยู่ใน
`docs/superpowers/specs/2026-08-06-bracket-test-design.md`

**แก้ painpoint ข้อ 7** คือ feedback loop ยาว และแก้ทางตันที่เฟส 2 ทิ้งไว้
คือขั้นและทรงจำนวนมากที่ติดป้ายว่ายังไม่มีงานรองรับ ตอนนี้ระบบบอกวิธีหาค่าเองได้แล้ว

**ค่าช่วงไหลจากชั้นทรงและชั้นสกุลลงมาที่ `ManualStepDef.doses`** ผ่าน cascade เดิม
ก่อนหน้านี้ `Dose` มีอยู่ตั้งแต่เฟส 0 แต่ไม่มีใครอ่าน เฟสนี้คือที่ที่มันได้ทำงานจริง

**หน้าคู่มือสาธารณะแสดงแค่คำสั่ง ไม่มีช่องกรอกและไม่มีข้อมูลเฉพาะบุคคล**
เพราะหน้านั้น prerender ตอน build และอ่านได้โดยไม่ต้องล็อกอิน การกรอกจริงอยู่ในรอบเพาะ

**สามช่องต่อชุดไม่ใช่ค่าที่คำนวณจากกันได้** ไม่ติดเชื้อ ชิ้นยังเขียว และใช้ได้จริง
ต้องนับแยกทั้งสาม เพราะกระปุกที่ติดเชื้ออาจยังเขียว และที่ไม่ติดเชื้ออาจชิ้นดำ
การแยกสองอาการคือสิ่งที่ทำให้ระบบบอกทิศทางการแก้ได้เมื่อทุกชุดล้มเหลว

**เก็บด้วยคีย์ที่มีชื่อชุดต่อท้ายบน `ProtocolStepRun.measurements` เดิม**
ไม่มี collection ใหม่ ไม่แก้ security rules ไม่ migrate ส่วนค่าที่ตัดสินได้เก็บที่
`users/{uid}/settings/calibration` ตามแพตเทิร์นเดียวกับชุดอุปกรณ์

**ค่าที่ผู้ใช้ทดสอบได้ ไม่เปลี่ยนระดับหลักฐานของขั้น** ขั้นที่เป็น `unsupported`
ยังคงเป็น `unsupported` เพราะการทดลองของผู้ใช้คนเดียวไม่ใช่งานที่ผ่านการทบทวน
ระบบจำสิ่งที่ผู้ใช้พบ ไม่ได้เปลี่ยนสิ่งที่ระบบอ้าง
```

- [ ] **Step 3: แก้จำนวนเทสต์บนหัวไฟล์ให้ตรงกับผลจริง**

- [ ] **Step 4: รันทั้งชุด**

Run: `npm test && npm run lint && npm run build`
Expected: PASS ทั้งหมด

- [ ] **Step 5: Commit**

```bash
git add project_summary.md
git commit -m "docs: document the bracket test and where its numbers live"
```
