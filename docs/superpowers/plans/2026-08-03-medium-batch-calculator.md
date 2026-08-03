# Medium Batch Calculator Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** ตอบคำถาม "จะทำอาหารเท่าไหร่ และชั่งอะไรกี่กรัม" สำหรับการเพาะจำนวนน้อย โดยบอกตรง ๆ เมื่อชั่งไม่ได้ แล้วพาไปทำน้ำยาแม่แทน

**Architecture:** เขียนฟังก์ชันบริสุทธิ์ตัวเดียวที่รวมสามอย่างที่มีอยู่แล้วเข้าด้วยกัน คือ `calculateMediumBatchPlan` แปลงจำนวนกระปุกเป็นปริมาตร, การคูณสูตรตามปริมาตร, และ `calculateWorkingStock` ตัดสินว่าชั่งได้หรือต้องเจือจาง ผลลัพธ์เป็นรายการบรรทัดต่อสารหนึ่งตัว ที่ UI แค่เอาไปแสดง ไม่ต้องคิดเลขเอง

**Tech Stack:** TypeScript, React 19, Next.js 16, Vitest 4

## สิ่งที่มีอยู่แล้วและใช้ต่อ

- `calculateMediumBatchPlan` จำนวนกระปุก → ปริมาตรรวมพร้อมเผื่อสูญเสีย และเตือนเมื่อไม่มีกระปุกเปล่าคุม
- `calculateWorkingStock` มวลที่ต้องการ + ความละเอียดอุปกรณ์ → ตวงตรง หรือแผนเจือจาง หรือบอกว่าทำไม่ได้
- `MediaRecipe` ในแผ่นเสริมรายชนิด มีหน่วย `×`, `g/L`, `mg/L`

## Global Constraints

- **ห้ามปัดเศษให้ดูสวยเมื่อค่าต่ำกว่าที่ชั่งได้** ต้องบอกว่าชั่งไม่ได้แล้วเสนอทางแก้
- หน่วย `×` ของ MS basal salts คำนวณไม่ได้ถ้าผู้ใช้ยังไม่กรอกอัตรา g/L จากฉลากถุงที่ตัวเองซื้อ ต้องขอค่านั้นก่อน ห้ามเดา
- ตัวเลขทุกตัวที่แสดงต้องมีหน่วยกำกับ และป้ายต้องเป็นภาษาที่ผู้ใช้อ่านออก ไม่ใช่ id ภายใน
- ใช้ token `--pl-` และ class `pl-`
- ห้าม commit `package-lock.json`
- รัน `npm test` และ `npm run lint` ก่อน commit ทุกครั้ง

---

### Task 1: Batch planning domain function

**Files:**
- Create: `src/lib/rounds/medium-plan.ts`
- Test: `src/lib/rounds/medium-plan.test.ts`

**Interfaces:**
- Produces:
  - `type ToolLimits = { scaleMinimumMg: number; pipetteMinimumMl: number; msLabelRateGPerL: number }`
  - `type JarPlanInput = { cultureJars: number; blankJars: number; spareJars: number; mlPerJar: number; lossPercent: number }`
  - `type IngredientLine = { name: string; note?: string } & ({ kind: "weigh"; amount: number; unit: "g" } | { kind: "measure"; amount: number; unit: "mL" } | { kind: "working-stock"; requiredMg: number; plan: WorkingStockResult } | { kind: "needs-label-rate"; message: string })`
  - `type MediumPlan = { totalVolumeMl: number; totalJars: number; warnings: string[]; lines: IngredientLine[] }`
  - `planMediumBatch(recipe: MediaRecipe, jars: JarPlanInput, tools: ToolLimits): MediumPlan`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";
import type { MediaRecipe } from "@/lib/manual/types";
import { planMediumBatch } from "./medium-plan";

const recipe: MediaRecipe = {
  id: "multiplication",
  title: "ระยะเพิ่มจำนวนยอด",
  pH: "5.7 ถึง 5.8",
  ingredients: [
    { name: "MS basal salts", amountPerLiter: 1, unit: "×" },
    { name: "Sucrose", amountPerLiter: 30, unit: "g/L" },
    { name: "Agar", amountPerLiter: 7.5, unit: "g/L" },
    { name: "BAP", amountPerLiter: 1, unit: "mg/L" },
  ],
  evidence: { level: "species-direct", sourceIds: ["source-pp-2023"] },
};

const jars = { cultureJars: 4, blankJars: 1, spareJars: 1, mlPerJar: 25, lossPercent: 15 };
const tools = { scaleMinimumMg: 10, pipetteMinimumMl: 0.2, msLabelRateGPerL: 4.43 };

describe("planMediumBatch", () => {
  it("รวมกระปุกทุกชนิดแล้วเผื่อสูญเสียตามที่ตั้งไว้", () => {
    const plan = planMediumBatch(recipe, jars, tools);

    expect(plan.totalJars).toBe(6);
    expect(plan.totalVolumeMl).toBe(173);
  });

  it("สารที่ชั่งได้จะบอกเป็นกรัม", () => {
    const plan = planMediumBatch(recipe, jars, tools);
    const sucrose = plan.lines.find((line) => line.name === "Sucrose");

    expect(sucrose).toMatchObject({ kind: "weigh", unit: "g" });
    expect((sucrose as { amount: number }).amount).toBeCloseTo(5.19, 2);
  });

  it("MS ที่หน่วยเป็นเท่า คำนวณจากอัตราบนฉลากที่ผู้ใช้กรอก", () => {
    const plan = planMediumBatch(recipe, jars, tools);
    const ms = plan.lines.find((line) => line.name === "MS basal salts");

    expect(ms).toMatchObject({ kind: "weigh", unit: "g" });
    expect((ms as { amount: number }).amount).toBeCloseTo(0.766, 3);
  });

  it("ถ้ายังไม่กรอกอัตราบนฉลาก ต้องขอค่านั้นก่อน ห้ามเดา", () => {
    const plan = planMediumBatch(recipe, jars, { ...tools, msLabelRateGPerL: 0 });
    const ms = plan.lines.find((line) => line.name === "MS basal salts");

    expect(ms?.kind).toBe("needs-label-rate");
  });

  it("ฮอร์โมนที่มวลต่ำกว่าที่เครื่องชั่งอ่านได้ ต้องไม่ปัดเศษ แต่พาไปทำน้ำยาแม่", () => {
    const plan = planMediumBatch(recipe, jars, tools);
    const bap = plan.lines.find((line) => line.name === "BAP");

    expect(bap?.kind).toBe("working-stock");
    expect((bap as { requiredMg: number }).requiredMg).toBeCloseTo(0.173, 3);
  });

  it("เตือนเมื่อไม่มีกระปุกเปล่าคุม", () => {
    const plan = planMediumBatch(recipe, { ...jars, blankJars: 0 }, tools);

    expect(plan.warnings.join(" ")).toContain("Blank");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**
- [ ] **Step 3: Write `planMediumBatch`** โดยเรียก `calculateMediumBatchPlan` หาปริมาตร แล้ววนสารทีละตัว
  - `g/L` → กรัม เทียบกับ `scaleMinimumMg` ถ้าต่ำกว่าให้เป็น `working-stock` เช่นกัน
  - `×` → ถ้า `msLabelRateGPerL` เป็น 0 ให้เป็น `needs-label-rate`
  - `mg/L` → มวล mg ถ้าต่ำกว่า `scaleMinimumMg` ให้เรียก `calculateWorkingStock`
- [ ] **Step 4: Run test to verify it passes**
- [ ] **Step 5: Commit**

---

### Task 2: Calculator UI

**Files:**
- Create: `src/components/rounds/medium-calculator.tsx`
- Test: `src/components/rounds/medium-calculator.test.tsx`

**Interfaces:**
- Produces: `MediumCalculator({ recipes })` เป็น client component ที่ถือ state ของช่องกรอกเอง

- [ ] **Step 1: Write the failing tests**
  - เลือกสูตรได้เมื่อมีมากกว่าหนึ่งสูตร
  - แสดงปริมาตรรวมพร้อมที่มาว่ามาจากกี่กระปุกและเผื่อกี่เปอร์เซ็นต์
  - สารที่ชั่งไม่ได้ต้องขึ้นคำว่าชั่งไม่ได้ และแสดงขั้นตอนทำน้ำยาแม่
  - ทุกบรรทัดมีหน่วยกำกับ
  - ช่องกรอกทุกช่องมี label ผูกด้วย `htmlFor`
- [ ] **Step 2: Run tests to verify they fail**
- [ ] **Step 3: Write the component**
- [ ] **Step 4: Run tests to verify they pass**
- [ ] **Step 5: Commit**

---

### Task 3: Put the calculator where it is needed

**Files:**
- Modify: `src/components/rounds/step-runner.tsx`
- Modify: `src/components/rounds/step-runner.test.tsx`
- Modify: `src/components/guide/step-detail.tsx`
- Modify: `src/components/guide/step-detail.test.tsx`
- Modify: `src/app/my/rounds/[roundId]/step/[step]/page.tsx`
- Modify: `src/app/guide/[slug]/step/[step]/page.tsx`

เครื่องคำนวณต้องอยู่ในขั้นทำอาหาร ทั้งในคู่มือที่อ่านอย่างเดียวและในตัวเดินขั้นตอน
เพราะคู่มือเขียนไว้แล้วว่า `ใช้เครื่องคำนวณในระบบเพื่อหาปริมาณตามจำนวนกระปุกที่จะทำ`
ซึ่งตอนนี้ชี้ไปยังของที่ไม่มีอยู่จริงในเส้นทางใหม่

- [ ] **Step 1: Write the failing tests** ว่าขั้น `prep-media` แสดงเครื่องคำนวณ และขั้นอื่นไม่แสดง
- [ ] **Step 2: Run tests to verify they fail**
- [ ] **Step 3: Render the calculator when the step is `prep-media`** ส่ง `manual.mediaRecipes` เข้าไป
- [ ] **Step 4: Run tests, lint, and build**
- [ ] **Step 5: Commit**

---

### Task 4: Verify by hand and record

**Files:**
- Modify: `handoff.md`

- [ ] **Step 1: Run the whole suite, lint, and build**
- [ ] **Step 2: Open the prep-media step in the browser** กรอก 4 กระปุก แล้วตรวจว่าปริมาตรรวมและรายการสารถูกต้อง
- [ ] **Step 3: Check the unweighable case** ตรวจว่า BAP ขึ้นว่าชั่งไม่ได้พร้อมขั้นตอนทำน้ำยาแม่
- [ ] **Step 4: Record the result honestly in `handoff.md`**
- [ ] **Step 5: Commit**

---

## Self-Review Notes

**ไม่อยู่ในแผนนี้** ระบบเลือกเส้นทางอุปกรณ์ตามของที่มี ซึ่งเป็นอีกครึ่งของเฟส 4 แยกเป็นแผนถัดไป
เพราะเป็นคนละโครงสร้างข้อมูลและคนละหน้าจอ แผนนี้จึงรับความละเอียดของเครื่องชั่งกับอุปกรณ์ตวง
เป็นช่องกรอกในหน้าเครื่องคำนวณไปก่อน แล้วค่อยย้ายไปอ่านจากชุดอุปกรณ์ที่บันทึกไว้เมื่อทำแผนถัดไป

**ตัวเลขในเทสต์คำนวณมาจาก** 6 กระปุก × 25 mL = 150 mL เผื่อ 15% เป็น 172.5 ปัดขึ้นเป็น 173 mL
ดังนั้น sucrose 30 g/L × 0.173 L = 5.19 g และ BAP 1 mg/L × 0.173 L = 0.173 mg ซึ่งต่ำกว่า
เครื่องชั่งที่อ่านได้ต่ำสุด 10 mg จึงต้องไปทางน้ำยาแม่
