# Haiter Calculator Single-Form Auto-Dilution Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the two-tab Haiter (bleach) calculator with a single 5-field form where the system
picks the dilution factor and working-stock volume automatically, instead of making the user guess
a "dilution factor" that has no feedback until after they submit it.

**Architecture:** Add one new pure function `planHaiterCleaningDose()` to the existing domain module
`src/lib/domain/haiter-calculations.ts` that composes the two existing pure functions
(`calculateHaiterDose`, `planHaiterWorkingDilution`) and searches two fixed candidate ladders
(dilution factor, working volume) for the first combination that is actually measurable with the
user's equipment — mirroring the pattern `calculateWorkingStock()` already uses for the hormone
stock calculator. Then rewrite `HaiterCalculator` to a single form bound to that one function, and
update the one call site that constructs it.

**Tech Stack:** Next.js 16 / React 19, TypeScript, Vitest (`renderToStaticMarkup`, no jsdom — this
project keeps calculation logic in plain functions specifically so it's testable without a DOM).

## Global Constraints

- No jsdom in this project — component tests render with `react-dom/server`'s `renderToStaticMarkup`
  and assert on the resulting HTML string. Do not introduce `@testing-library/react` or jsdom.
- Every bug found during manual browser verification must get a regression test that fails when the
  bug is reintroduced, per this project's standing rule (see `handoff.md` history).
- Do not change the public signature or behavior of `calculateHaiterDose()` or
  `planHaiterWorkingDilution()` — existing tests in `haiter-calculations.test.ts` (lines 1–141) must
  keep passing unmodified.
- Do not touch `working-stock-calculator.tsx`, `medium-calculator.tsx`, or the guided-protocol
  "เติม Haiter" step — out of scope per the approved spec.
- Record the verification results as a new dated entry in `handoff.md` (append-only, matches the
  existing entry format used throughout that file).
- Commit after each task. Push and merge only when the user explicitly says so — never bundle those
  into a task's steps.

---

### Task 1: Domain function `planHaiterCleaningDose()`

**Files:**
- Modify: `src/lib/domain/haiter-calculations.ts`
- Test: `src/lib/domain/haiter-calculations.test.ts`

**Interfaces:**
- Consumes: existing `calculateHaiterDose(input: HaiterDoseInput): HaiterDoseResult` and
  `planHaiterWorkingDilution(input: HaiterWorkingDilutionInput): HaiterWorkingDilutionResult`,
  both already defined in this file — unchanged.
- Produces:
  ```ts
  export type HaiterAutoInput = {
    sourcePercent: number;
    targetPercent: number;
    finalVolumeMl: number;
    minimumMeasurableMl: number;
  };

  export type HaiterAutoResult =
    | { mode: "direct"; sourceVolumeMl: number; formula: string }
    | {
        mode: "working-dilution";
        dilutionFactor: number;
        workingPercent: number;
        workingVolumeMl: number;
        sourceVolumeMl: number;
        diluentVolumeMl: number;
        workingDoseMl: number;
      };

  export function planHaiterCleaningDose(input: HaiterAutoInput): HaiterAutoResult;
  ```
  `HaiterCalculator` (Task 2) imports `planHaiterCleaningDose`, `HaiterAutoInput`, `HaiterAutoResult`
  from this module.

- [ ] **Step 1: Write the failing tests**

First, change the import block at the top of `src/lib/domain/haiter-calculations.test.ts` (lines 2–6)
from:

```ts
import {
  calculateHaiterDose,
  planHaiterWorkingDilution,
  toWeightPerVolumePercent,
} from "./haiter-calculations";
```

to:

```ts
import {
  calculateHaiterDose,
  planHaiterCleaningDose,
  planHaiterWorkingDilution,
  toWeightPerVolumePercent,
} from "./haiter-calculations";
```

Then append this to the end of the file (after the existing `toWeightPerVolumePercent` describe
block, keep everything above it untouched):

```ts
describe("planHaiterCleaningDose", () => {
  test("ตวงตรงได้อยู่แล้ว ไม่ต้องเจือจาง", () => {
    const result = planHaiterCleaningDose({
      sourcePercent: 6,
      targetPercent: 1,
      finalVolumeMl: 100,
      minimumMeasurableMl: 1,
    });

    expect(result.mode).toBe("direct");
    if (result.mode === "direct") {
      expect(result.sourceVolumeMl).toBe(16.666667);
    }
  });

  // ภาพหน้าจอจริงจากผู้ใช้ 7 สิงหาคม 2026: กรอก 6% w/w (=6.48% w/v), เป้าหมาย 1%,
  // ปริมาตรสุดท้าย 100 mL, ตวงละเอียดสุด 0.1 mL แล้วเข้าใจผิดว่าต้องเจือจางก่อน
  // ทั้งที่ตวงตรงจากขวดต้นทางได้อยู่แล้ว (15.432099 mL > 0.1 mL) ฟอร์มเดียวต้องไม่พาไป
  // เจือจางเกินจำเป็นแบบนั้นอีก
  test("ตัวเลขจากภาพหน้าจอจริงของผู้ใช้ ต้องได้ตวงตรง ไม่ใช่ working dilution", () => {
    const result = planHaiterCleaningDose({
      sourcePercent: 6.48,
      targetPercent: 1,
      finalVolumeMl: 100,
      minimumMeasurableMl: 0.1,
    });

    expect(result.mode).toBe("direct");
    if (result.mode === "direct") {
      expect(result.sourceVolumeMl).toBe(15.432099);
    }
  });

  test("ต้องเจือจางจริง เลือกอัตราเจือจางและปริมาตร working stock ให้เองโดยผู้ใช้ไม่ต้องกรอก", () => {
    const result = planHaiterCleaningDose({
      sourcePercent: 6,
      targetPercent: 0.05,
      finalVolumeMl: 10,
      minimumMeasurableMl: 0.5,
    });

    expect(result.mode).toBe("working-dilution");
    if (result.mode === "working-dilution") {
      expect(result.dilutionFactor).toBe(6);
      expect(result.workingPercent).toBe(1);
      expect(result.workingVolumeMl).toBe(20);
      expect(result.sourceVolumeMl).toBe(3.333333);
      expect(result.diluentVolumeMl).toBe(16.666667);
      expect(result.workingDoseMl).toBe(0.5);
      // ต้องตวงได้จริงทั้งสองขั้น: ตวงต้นทางเข้า working stock ได้ไม่ต่ำกว่าเครื่องมือขั้นต่ำ
      expect(result.sourceVolumeMl).toBeGreaterThanOrEqual(0.5);
      // และตวงจาก working stock ได้ไม่เกินปริมาตรที่เตรียมไว้จริง
      expect(result.workingDoseMl).toBeLessThanOrEqual(result.workingVolumeMl);
    }
  });

  test("ไม่มีอัตราเจือจางไหนตวงได้จริงด้วยเครื่องมือนี้ ต้องบอกตรง ๆ ว่าทำไม่ได้", () => {
    expect(() =>
      planHaiterCleaningDose({
        sourcePercent: 6,
        targetPercent: 0.003,
        finalVolumeMl: 1,
        minimumMeasurableMl: 50,
      }),
    ).toThrow(/อุปกรณ์ตวงละเอียดไม่พอ/);
  });

  test("ปฏิเสธ target ที่มากกว่าหรือเท่ากับ source เหมือน calculateHaiterDose เดิม", () => {
    expect(() =>
      planHaiterCleaningDose({
        sourcePercent: 5,
        targetPercent: 5,
        finalVolumeMl: 100,
        minimumMeasurableMl: 0.1,
      }),
    ).toThrow("ต่ำกว่า source");
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm test -- haiter-calculations`
Expected: FAIL — `planHaiterCleaningDose is not a function` (or a TypeScript error if `npm test`
type-checks; either way the new tests must not pass yet).

- [ ] **Step 3: Implement `planHaiterCleaningDose()`**

Add to `src/lib/domain/haiter-calculations.ts`, after the existing `planHaiterWorkingDilution`
function (i.e. after line 118, before the `LabelBasis` comment block):

```ts
export type HaiterAutoInput = {
  sourcePercent: number;
  targetPercent: number;
  finalVolumeMl: number;
  minimumMeasurableMl: number;
};

export type HaiterAutoResult =
  | { mode: "direct"; sourceVolumeMl: number; formula: string }
  | {
      mode: "working-dilution";
      dilutionFactor: number;
      workingPercent: number;
      workingVolumeMl: number;
      sourceVolumeMl: number;
      diluentVolumeMl: number;
      workingDoseMl: number;
    };

/** ลิสต์อัตราเจือจางและปริมาตร working stock สำเร็จรูปที่ระบบไล่หาให้เอง แทนที่จะให้ผู้ใช้เดา
 *  รูปแบบเดียวกับ dilutionFactors ที่ calculateWorkingStock() ใช้อยู่แล้วสำหรับน้ำยาแม่ฮอร์โมน */
const haiterDilutionFactors = [
  2, 3, 4, 5, 6, 8, 10, 15, 20, 25, 30, 40, 50, 75, 100, 150, 200, 300, 500, 1000,
];
const haiterWorkingVolumesMl = [20, 50, 100, 200, 500, 1000];

/** คำนวณให้ทั้งหมดในขั้นตอนเดียว ไม่ถามผู้ใช้ว่า "เจือจางกี่เท่า" หรือ "ปริมาตร working
 *  ที่จะเตรียม" อีกต่อไป ไล่หาคู่อัตราเจือจาง/ปริมาตรที่ตวงได้จริงทั้งสองขั้น
 *  (ทั้งตอนตวงต้นทางลงไปทำ working stock และตอนตวง working stock ไปใช้จริง)
 *  แล้วเลือกคู่แรกที่เจือจางน้อยที่สุดและเปลืองน้อยที่สุด */
export function planHaiterCleaningDose(input: HaiterAutoInput): HaiterAutoResult {
  const dose = calculateHaiterDose(input);
  if (!dose.needsWorkingDilution) {
    return { mode: "direct", sourceVolumeMl: dose.sourceVolumeMl, formula: dose.formula };
  }

  for (const dilutionFactor of haiterDilutionFactors) {
    for (const workingVolumeMl of haiterWorkingVolumesMl) {
      let candidate;
      try {
        candidate = planHaiterWorkingDilution({
          sourcePercent: input.sourcePercent,
          dilutionFactor,
          workingVolumeMl,
          targetPercent: input.targetPercent,
          finalVolumeMl: input.finalVolumeMl,
          minimumMeasurableMl: input.minimumMeasurableMl,
        });
      } catch {
        continue;
      }

      const sourcePourIsMeasurable = candidate.sourceVolumeMl >= input.minimumMeasurableMl;
      const doseFitsInWorkingStock = candidate.workingDoseMl <= workingVolumeMl;
      if (!candidate.isMeasurable || !sourcePourIsMeasurable || !doseFitsInWorkingStock) {
        continue;
      }

      return {
        mode: "working-dilution",
        dilutionFactor,
        workingPercent: candidate.workingPercent,
        workingVolumeMl,
        sourceVolumeMl: candidate.sourceVolumeMl,
        diluentVolumeMl: candidate.diluentVolumeMl,
        workingDoseMl: candidate.workingDoseMl,
      };
    }
  }

  throw new Error(
    "อุปกรณ์ตวงละเอียดไม่พอสำหรับค่านี้ ต้องใช้อุปกรณ์ที่ตวงได้ละเอียดกว่านี้ หรือลดความเข้มข้นเป้าหมายลง",
  );
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npm test -- haiter-calculations`
Expected: PASS, all tests in the file including the 5 new ones.

- [ ] **Step 5: Commit**

```bash
git add src/lib/domain/haiter-calculations.ts src/lib/domain/haiter-calculations.test.ts
git commit -m "$(cat <<'EOF'
Add planHaiterCleaningDose: auto-pick dilution factor and working volume

Composes the existing calculateHaiterDose/planHaiterWorkingDilution
functions and searches known-good dilution ratios, so callers stop
asking the user to guess a dilution factor blind.
EOF
)"
```

---

### Task 2: Single-form `HaiterCalculator` component

**Files:**
- Modify: `src/components/calculators/haiter-calculator.tsx`
- Test: `src/components/calculators/haiter-calculator.test.tsx` (full rewrite)

**Interfaces:**
- Consumes: `planHaiterCleaningDose`, `toWeightPerVolumePercent`, `LabelBasis`, `HaiterAutoInput`,
  `HaiterAutoResult` from `@/lib/domain/haiter-calculations` (Task 1). `CalculatorField` from
  `./calculator-field` (unchanged, already supports a `hint` prop — see
  `src/components/calculators/calculator-field.tsx:16,23,41`).
- Produces: `export function HaiterCalculator({ initialInput }: { initialInput?:
  Partial<HaiterAutoInput> }): JSX.Element` — this is the new prop shape Task 3's call site uses.
  The old `initialMode`, `initialDoseInput`, `initialDilutionInput` props no longer exist.

- [ ] **Step 1: Write the failing tests**

Replace the entire contents of `src/components/calculators/haiter-calculator.test.tsx` with:

```tsx
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { HaiterCalculator } from "./haiter-calculator";

describe("HaiterCalculator", () => {
  it("ฟอร์มเดียว ไม่มีแท็บและไม่มีช่องกรอกอัตราเจือจาง", () => {
    const html = renderToStaticMarkup(<HaiterCalculator />);

    expect(html).not.toContain("คำนวณตรง");
    expect(html).not.toContain("Working dilution");
    expect(html).not.toContain("เจือจางกี่เท่า");
    expect(html).not.toContain("ปริมาตร working ที่จะเตรียม");
  });

  it("ค่าเริ่มต้นตวงตรงได้ แสดงตัวเลข mL เดียวไม่มีขั้นตอนเจือจาง", () => {
    const html = renderToStaticMarkup(<HaiterCalculator />);

    expect(html).toContain("16.666667 mL");
    expect(html).not.toContain("ขั้น 1");
  });

  it("ตัวเลขจากภาพหน้าจอจริงของผู้ใช้ (6% w/w, เป้าหมาย 1%, 100mL, ตวงละเอียดสุด 0.1mL) ต้องได้ตวงตรง", () => {
    const html = renderToStaticMarkup(
      <HaiterCalculator
        initialInput={{ sourcePercent: 6, targetPercent: 1, finalVolumeMl: 100, minimumMeasurableMl: 0.1 }}
      />,
    );

    expect(html).toContain("15.432099");
  });

  it("ต้องเจือจางจริง แสดง 2 ขั้นตอนพร้อมตัวเลขที่ระบบเลือกให้เอง", () => {
    const html = renderToStaticMarkup(
      <HaiterCalculator
        initialInput={{ targetPercent: 0.05, finalVolumeMl: 10, minimumMeasurableMl: 0.5 }}
      />,
    );

    expect(html).toContain("ขั้น 1");
    expect(html).toContain("ตวงไฮเตอร์ 3.333333 mL");
    expect(html).toContain("น้ำ 16.666667 mL");
    expect(html).toContain("รวมเป็น 20 mL");
    expect(html).toContain("ขั้น 2");
    expect(html).toContain("ตวง 0.5 mL");
    expect(html).toContain("ผสมน้ำให้ครบ 10 mL");
    expect(html).toContain("เจือจาง 1:6");
  });

  it("โชว์การ์ดเตือนเมื่อ target มากกว่าหรือเท่ากับ source", () => {
    const html = renderToStaticMarkup(
      <HaiterCalculator initialInput={{ sourcePercent: 1, targetPercent: 2 }} />,
    );

    expect(html).toContain("target concentration ต้องต่ำกว่า source concentration");
  });

  it("โชว์การ์ดเตือนเมื่อไม่มีอัตราเจือจางไหนตวงได้จริงด้วยเครื่องมือนี้", () => {
    const html = renderToStaticMarkup(
      <HaiterCalculator
        initialInput={{ targetPercent: 0.003, finalVolumeMl: 1, minimumMeasurableMl: 50 }}
      />,
    );

    expect(html).toContain("อุปกรณ์ตวงละเอียดไม่พอ");
  });
});

describe("HaiterCalculator · หน่วยบนฉลาก", () => {
  // ไฮเตอร์ที่เจ้าของมีจริงระบุ 6% w/w ซึ่งไม่เท่ากับ 6% w/v
  it("ตั้งต้นเป็น w/v และยังไม่ขึ้นคำอธิบายการแปลงหน่วย", () => {
    const html = renderToStaticMarkup(<HaiterCalculator />);

    expect(html).toContain("ฉลากเขียนกำกับว่า");
    expect(html).not.toContain("หลังคูณความหนาแน่น");
  });

  it("มีตัวเลือก w/w ให้ผู้ใช้ระบุได้", () => {
    const html = renderToStaticMarkup(<HaiterCalculator />);

    expect(html).toContain("w/w");
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm test -- haiter-calculator.test`
Expected: FAIL — old component still has tabs/two-field-set, so most assertions above fail (e.g.
`html` still contains `"คำนวณตรง"`, `HaiterCalculator` doesn't accept `initialInput`, etc.). A
TypeScript error on the `initialInput` prop is an acceptable failure mode too.

- [ ] **Step 3: Rewrite the component**

Replace the entire contents of `src/components/calculators/haiter-calculator.tsx` with:

```tsx
"use client";

import { useMemo, useState } from "react";
import {
  planHaiterCleaningDose,
  toWeightPerVolumePercent,
  type LabelBasis,
  type HaiterAutoInput,
  type HaiterAutoResult,
} from "@/lib/domain/haiter-calculations";
import { CalculatorField } from "./calculator-field";

type Attempt<T> = { ok: true; result: T } | { ok: false; message: string };

const defaultInput: HaiterAutoInput = {
  sourcePercent: 6,
  targetPercent: 1,
  finalVolumeMl: 100,
  minimumMeasurableMl: 1,
};

function tryPlan(input: HaiterAutoInput): Attempt<HaiterAutoResult> {
  try {
    return { ok: true, result: planHaiterCleaningDose(input) };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : String(error) };
  }
}

export function HaiterCalculator({
  initialInput,
}: {
  /** ตั้งค่าเริ่มต้นจากอุปกรณ์ของผู้ใช้ (minimumMeasurableMl) และใช้ในเทสต์ */
  initialInput?: Partial<HaiterAutoInput>;
}) {
  const merged = { ...defaultInput, ...initialInput };
  const [sourcePercent, setSourcePercent] = useState(merged.sourcePercent);
  // ฉลากบอกได้สองแบบและไม่เท่ากัน ต้องแปลงเป็น w/v ก่อนเข้าสูตรทุกครั้ง
  const [labelBasis, setLabelBasis] = useState<LabelBasis>("w/v");
  const effectiveSourcePercent = useMemo(() => {
    try {
      return toWeightPerVolumePercent(sourcePercent, labelBasis);
    } catch {
      return sourcePercent;
    }
  }, [sourcePercent, labelBasis]);
  const [targetPercent, setTargetPercent] = useState(merged.targetPercent);
  const [finalVolumeMl, setFinalVolumeMl] = useState(merged.finalVolumeMl);
  const [minimumMeasurableMl, setMinimumMeasurableMl] = useState(merged.minimumMeasurableMl);

  const plan = useMemo(
    () =>
      tryPlan({
        sourcePercent: effectiveSourcePercent,
        targetPercent,
        finalVolumeMl,
        minimumMeasurableMl,
      }),
    [effectiveSourcePercent, targetPercent, finalVolumeMl, minimumMeasurableMl],
  );

  return (
    <section>
      <h2 className="pl-h2">ไฮเตอร์ / สารฟอกฆ่าเชื้อ</h2>

      <div className="pl-soft-card" style={{ marginTop: "14px", display: "flex", flexDirection: "column", gap: "12px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "12px" }}>
          <CalculatorField
            id="hd-source"
            label="ความเข้มข้นบนฉลากขวด (%)"
            value={sourcePercent}
            onChange={setSourcePercent}
            hint="ตัวเลข % ที่เขียนบนฉลากไฮเตอร์ เช่น 6"
          />
          <label style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "14px" }}>
            ฉลากเขียนกำกับว่า
            <select
              value={labelBasis}
              onChange={(event) => setLabelBasis(event.target.value as LabelBasis)}
              className="pl-input"
            >
              <option value="w/v">w/v หรือไม่ได้ระบุ</option>
              <option value="w/w">w/w</option>
            </select>
            <span className="pl-meta">ไม่แน่ใจให้เลือกตัวแรก ฉลากบ้านเราส่วนใหญ่เป็นแบบนี้</span>
          </label>
          <CalculatorField
            id="hd-target"
            label="อยากได้น้ำยาความเข้มข้นเท่าไหร่ (%)"
            value={targetPercent}
            onChange={setTargetPercent}
            hint="ดูจากสูตร/คู่มือที่ใช้อยู่"
          />
          <CalculatorField
            id="hd-volume"
            label="อยากได้น้ำยาทั้งหมดกี่ mL"
            value={finalVolumeMl}
            onChange={setFinalVolumeMl}
          />
          <CalculatorField
            id="hd-min"
            label="อุปกรณ์ตวงที่มีละเอียดสุดกี่ mL"
            value={minimumMeasurableMl}
            onChange={setMinimumMeasurableMl}
            hint="เช่น syringe เล็กมักละเอียด 0.1–1 mL"
          />
        </div>

        {labelBasis === "w/w" ? (
          <p className="pl-lede" style={{ margin: 0 }}>
            ฉลาก {sourcePercent}% w/w คิดเป็น {effectiveSourcePercent}% w/v หลังคูณความหนาแน่นของน้ำยาฟอกขาว
            ระบบใช้ค่าหลังแปลงในการคำนวณให้แล้ว
          </p>
        ) : null}

        {plan.ok && plan.result.mode === "direct" ? (
          <div className="pl-soft-card" style={{ background: "var(--pl-sunk)" }}>
            <p className="pl-mono">{plan.result.formula}</p>
            <p style={{ margin: "4px 0 0", fontSize: "26px", fontWeight: 800, fontVariantNumeric: "tabular-nums" }}>
              {plan.result.sourceVolumeMl} mL
            </p>
          </div>
        ) : null}

        {plan.ok && plan.result.mode === "working-dilution" ? (
          <div className="pl-soft-card" style={{ background: "var(--pl-sunk)" }}>
            <p className="pl-mono">ขั้น 1: เตรียมน้ำยาเจือจางก่อน</p>
            <p style={{ margin: "4px 0 0" }}>
              ตวงไฮเตอร์ {plan.result.sourceVolumeMl} mL + น้ำ {plan.result.diluentVolumeMl} mL รวมเป็น{" "}
              {plan.result.workingVolumeMl} mL
            </p>
            <p className="pl-mono" style={{ marginTop: "12px" }}>ขั้น 2: จากน้ำยาเจือจางที่เตรียมไว้</p>
            <p style={{ margin: "4px 0 0" }}>
              ตวง {plan.result.workingDoseMl} mL ผสมน้ำให้ครบ {finalVolumeMl} mL
            </p>
            <p className="pl-meta" style={{ marginTop: "10px" }}>
              (เจือจาง 1:{plan.result.dilutionFactor} ได้น้ำยาเจือจางเข้มข้น {plan.result.workingPercent}%)
            </p>
          </div>
        ) : null}

        {!plan.ok ? (
          <p className="pl-soft-card" role="alert" style={{ background: "var(--pl-stop)" }}>{plan.message}</p>
        ) : null}
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npm test -- haiter-calculator.test`
Expected: PASS, all tests in the file.

- [ ] **Step 5: Commit**

```bash
git add src/components/calculators/haiter-calculator.tsx src/components/calculators/haiter-calculator.test.tsx
git commit -m "$(cat <<'EOF'
Rewrite HaiterCalculator as a single form, no tabs, no manual dilution factor

The dilution factor and working-stock volume are now chosen by
planHaiterCleaningDose automatically. Field labels are also reworded
in plain Thai for a first-time user.
EOF
)"
```

---

### Task 3: Update the overlay call site

**Files:**
- Modify: `src/components/calculators/calculator-overlay.tsx:123-129`
- Test: `src/components/calculators/calculator-overlay.test.tsx` (no content changes expected, just
  confirm it still passes — it only asserts the title text renders)

**Interfaces:**
- Consumes: `HaiterCalculator` with the new `{ initialInput?: Partial<HaiterAutoInput> }` prop from
  Task 2.

- [ ] **Step 1: Update the call site**

In `src/components/calculators/calculator-overlay.tsx`, replace:

```tsx
          {state.screen === "haiter" ? (
            <HaiterCalculator
              key={toolsKey}
              initialDoseInput={{ minimumMeasurableMl: kit.pipetteMinimumMl }}
              initialDilutionInput={{ minimumMeasurableMl: kit.pipetteMinimumMl }}
            />
          ) : null}
```

with:

```tsx
          {state.screen === "haiter" ? (
            <HaiterCalculator key={toolsKey} initialInput={{ minimumMeasurableMl: kit.pipetteMinimumMl }} />
          ) : null}
```

- [ ] **Step 2: Run the full test suite to confirm nothing else references the old props**

Run: `npm test`
Expected: PASS — in particular `calculator-overlay.test.tsx`'s `"หน้า haiter render HaiterCalculator"`
test (asserts the HTML contains `"ไฮเตอร์ / สารฟอกฆ่าเชื้อ"`, unaffected by the prop rename) and
`haiter-calculator.test.tsx` from Task 2.

- [ ] **Step 3: Run lint and typecheck**

Run: `npm run lint`
Expected: PASS — this also catches any other file in the repo still importing the removed
`initialMode`/`initialDoseInput`/`initialDilutionInput` props via TypeScript errors surfaced by
`next build`'s type checking; run that too:

Run: `npm run build`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add src/components/calculators/calculator-overlay.tsx
git commit -m "Wire the floating calculator overlay to the new HaiterCalculator prop shape"
```

---

### Task 4: Manual browser verification and handoff.md entry

**Files:**
- Modify: `handoff.md` (append a new dated entry; do not edit existing entries)

No new interfaces — this task only verifies Tasks 1–3 behave correctly in a real browser and
records the result, per this project's standing rule that every phase gets a real-browser check
before it's considered done.

- [ ] **Step 1: Start the dev server**

Run: `npm run dev` (background it — it must stay running for the manual check)
Expected: server ready on `http://localhost:3000`

- [ ] **Step 2: Open the calculator in a real browser and verify the exact screenshot scenario**

Navigate to the app (enter demo mode if gated), open the floating "เครื่องคำนวณ" nav item, select
"ไฮเตอร์ฆ่าเชื้อ". Enter: ความเข้มข้นบนฉลากขวด = 6, ฉลากเขียนกำกับว่า = w/w, อยากได้น้ำยาความเข้มข้นเท่าไหร่ = 1,
อยากได้น้ำยาทั้งหมดกี่ mL = 100, อุปกรณ์ตวงที่มีละเอียดสุดกี่ mL = 0.1.

Expected: a single result card showing a direct-measure instruction around `15.432099 mL` — no tab
to click, no dilution-factor field anywhere on screen.

- [ ] **Step 3: Verify the working-dilution path renders correctly**

In the same form, change "อยากได้น้ำยาความเข้มข้นเท่าไหร่" to `0.05`, "อยากได้น้ำยาทั้งหมดกี่ mL" to `10`,
and "อุปกรณ์ตวงที่มีละเอียดสุดกี่ mL" to `0.5` (keep source at 6% w/v, or reset labelBasis to w/v first).

Expected: a single card with "ขั้น 1" (measure source into water to make a working stock) followed
by "ขั้น 2" (measure from that working stock into the final volume), with concrete mL numbers for
every quantity — no field asking the user to type a dilution factor.

- [ ] **Step 4: Verify light and dark mode**

Toggle the site's theme switch. Confirm both result-card states from Steps 2–3 remain readable
(border/text contrast) in dark mode, matching the existing dark-mode pass criteria used in prior
`handoff.md` UI phases.

- [ ] **Step 5: Record the results in handoff.md**

Append a new section at the end of `handoff.md`, following the exact structure of the entry
immediately above it (dated heading, what was tested, defects found and fixed if any, and a
verification summary block with the actual `npm test` / `npm run lint` / `npm run build` /
`npm run firebase:verify` results from Tasks 1–3 plus the manual browser findings from Steps 2–4 of
this task). Use today's real date for the heading, not a placeholder.

- [ ] **Step 6: Commit**

```bash
git add handoff.md
git commit -m "Record haiter calculator single-form verification in handoff.md"
```
