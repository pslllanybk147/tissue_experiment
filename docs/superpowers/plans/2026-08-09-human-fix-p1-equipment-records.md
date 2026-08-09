# Human Fix P1 Equipment and Records Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Represent the user's real inventory, explain readiness honestly, record typed protocol data, calculate measurable NaDCC doses, and allocate 46 culture jars without inventing sterile resources.

**Architecture:** Version the equipment profile additively and normalize legacy kits on read. Separate inventory facts from capability decisions, then reuse typed field values and instrument resolution in calculators and step records.

**Tech Stack:** Next.js 16.2.11, React 19.2.4, TypeScript, Vitest, memory/Firestore persistence.

## Global Constraints

- Start only after P0 full-suite verification passes.
- Keep 75% alcohol as 75%; never silently relabel it 70%.
- Water at 15 ppm is not sterile water unless the user records a sterilization method.
- NaDCC product data is label-derived: 5.4 g tablet, 2.97 g NaDCC, 60% available chlorine.
- Display actionable quantities rounded to the selected instrument resolution, while retaining calculated values for audit.
- Preserve legacy `measurements: Record<string, number | null>` reads.

---

## File Structure

- Create `src/lib/equipment/equipment-profile.ts` for v2 inventory and normalization.
- Create `src/lib/equipment/trial-readiness.ts` for ready/experimental/blocked/unknown decisions.
- Create `src/lib/rounds/field-values.ts` for typed response compatibility.
- Create `src/lib/trials/jar-allocation.ts` for deterministic allocation.
- Modify equipment repositories/page, trial creation page, NaDCC calculator, and runner integration.

### Task 1: Versioned equipment profile and legacy normalization

**Files:**
- Create: `src/lib/equipment/equipment-profile.ts`
- Test: `src/lib/equipment/equipment-profile.test.ts`
- Modify: `src/lib/repositories/equipment-repository.ts`
- Modify: `src/lib/repositories/memory-equipment-repository.ts`
- Modify: `src/lib/firebase/firestore-equipment-repository.ts`
- Test: corresponding memory and Firestore equipment repository tests.

**Interfaces:**
- Produces `EquipmentProfileV2`, `normalizeEquipmentProfile(value): EquipmentProfileV2`, and `USER_REPORTED_PROFILE` fixture.

- [ ] **Step 1: Write failing tests that normalize a legacy kit and preserve the supplied inventory values.**

```ts
expect(normalizeEquipmentProfile(legacyKit)).toMatchObject({ schemaVersion: 2, msRateGPerL: 4.43 });
expect(normalizeEquipmentProfile(userProfile).chemicals.alcohol.percent).toBe(75);
expect(normalizeEquipmentProfile(userProfile).water.sterile).toBe(false);
```

- [ ] **Step 2: Run the profile test; expect FAIL because v2 types and normalizer are absent.**

- [ ] **Step 3: Implement explicit records for chemicals, water, tools, workspace, containers, measuring instruments, medium ingredients, and phone.**

```ts
export type EquipmentProfileV2 = {
  schemaVersion: 2;
  chemicals: { nadcc: NadccProduct; bleach: { percentWw: number }; alcohol: { percent: number } };
  water: { sourcePpm: number; sterile: boolean; sterilizationMethod: string | null };
  instruments: { balanceResolutionG: number; syringeResolutionMl: number; phMeter: boolean };
  containers: { cultureJar50Ml: number; glassJar250Ml: number };
  workspace: { sab: boolean; plasticRoom: boolean; openFlameFuelAvailable: boolean };
  inventory: Array<{ id: EquipmentItemId; quantity: number; unit: "piece" | "bottle" | "pack" | "set"; note: string }>;
  msRateGPerL: number;
};
```

`EquipmentItemId` must cover `forceps`, `scissors`, `scalpel-narrow`, `scalpel-wide`, `alcohol-lamp`, `picnic-gas-stove`, `aluminium-cup-1l`, `stirring-rod`, `cutter`, `plastic-culture-jar-50ml`, `glass-jar-250ml`, `foggy-bottle`, `pp-beaker`, `glass-beaker-1l`, `measuring-cup-100ml`, `syringe-5ml`, `syringe-1ml`, `large-tissue`, `yellow-label`, `jewelry-scale`, `food-scale`, `ph-meter`, `phone-s24fe`, `sab`, and `plastic-room-2x2m`. Structured chemical/medium facts additionally store MS 4.43 g/L, white sugar, pH up/down, NAA/BA/IBA 1 mg/mL, and Telephone-brand agar. The profile fixture must use quantities 46 culture jars, 4 glass jars, 1 syringe 5 mL, 3 syringes 1 mL, 3 Foggy bottles, and the user's stated quantity for every remaining item rather than defaulting absent quantities to zero.

- [ ] **Step 4: Normalize repository reads and save only v2 data; retain additive fields in Firestore.**

- [ ] **Step 5: Run profile and both repository test suites; expect PASS for legacy and v2 fixtures.**

- [ ] **Step 6: Commit with `git commit -m "feat: store versioned equipment profiles"`.**

### Task 2: Honest readiness resolver

**Files:**
- Create: `src/lib/equipment/trial-readiness.ts`
- Test: `src/lib/equipment/trial-readiness.test.ts`
- Modify: `src/lib/equipment/resolve-path.ts`
- Modify: `src/components/equipment/path-summary.tsx`
- Test: `src/components/equipment/path-summary.test.tsx`

**Interfaces:**
- Produces `resolveTrialReadiness(profile): { overall; capabilities; blockers; cautions }` with statuses `ready | experimental | blocked | unknown`.

- [ ] **Step 1: Write a failing test for the supplied inventory.**

```ts
expect(resolveTrialReadiness(USER_REPORTED_PROFILE)).toMatchObject({
  overall: "blocked",
  blockers: expect.arrayContaining([expect.objectContaining({ id: "sterile-water" })]),
});
```

- [ ] **Step 2: Run readiness tests; expect FAIL because boolean capability resolution cannot express uncertainty.**

- [ ] **Step 3: Implement status ranking and explanations, including no fuel for the alcohol lamp, SAB present, 46 plastic jars, and unsterilized 15 ppm water.**

```ts
const statusRank = { ready: 3, experimental: 2, unknown: 1, blocked: 0 } as const;
const overall = weakest(capabilities.map((item) => item.status), statusRank);
```

- [ ] **Step 4: Render each capability with “มีอะไร”, “ยังขาดอะไร”, and “ทำอะไรต่อ” copy; do not collapse blockers into one generic alert.**

- [ ] **Step 5: Run resolver and summary component tests; expect PASS.**

- [ ] **Step 6: Commit with `git commit -m "feat: explain trial readiness from real inventory"`.**

### Task 3: Equipment page with the user's complete inventory

**Files:**
- Modify: `src/app/my/equipment/page.tsx`
- Test: `src/app/my/equipment/page.test.tsx`
- Create: `src/components/equipment/profile-section.tsx`
- Test: `src/components/equipment/profile-section.test.tsx`

**Interfaces:**
- Consumes `EquipmentProfileV2` and repository normalization from Task 1.
- Produces controlled sections for chemical labels, water, tools, workspace, containers, instruments, and medium materials.

- [ ] **Step 1: Write failing form tests for alcohol 75%, Haiter 6% w/w, pH meter, 0.01 g balance, 0.1 mL syringe resolution, and 46 jars.**

```tsx
expect(screen.getByLabelText("แอลกอฮอล์ (%)")).toHaveValue(75);
expect(screen.getByLabelText("กระปุกเพาะ 50 mL (ใบ)")).toHaveValue(46);
expect(screen.getByLabelText("น้ำนี้ผ่านการฆ่าเชื้อแล้ว")).not.toBeChecked();
```

- [ ] **Step 2: Run page/component tests; expect FAIL because current page stores only IDs and three numbers.**

- [ ] **Step 3: Implement grouped, accessible fields with unit text in every label and save/error state.**

- [ ] **Step 4: Load normalized legacy/v2 state, persist v2, and retain entered values after a failed save.**

- [ ] **Step 5: Run equipment page, component, and repository tests; expect PASS.**

- [ ] **Step 6: Commit with `git commit -m "feat: capture complete beginner equipment inventory"`.**

### Task 4: Trial creation readiness gate

**Files:**
- Modify: `src/app/my/trials/new/page.tsx`
- Test: `src/app/my/trials/new/page.test.tsx`
- Create: `src/components/trials/readiness-gate.tsx`
- Test: `src/components/trials/readiness-gate.test.tsx`

**Interfaces:**
- Consumes `resolveTrialReadiness(profile)`.
- Produces blocked, experimental-confirmation, and ready states before lot creation.

- [ ] **Step 1: Write failing tests for loading, blocked sterile water, experimental confirmation, duplicate-click prevention, and repository error detail.**

```tsx
expect(screen.getByRole("button", { name: "เริ่มชุดทดลอง" })).toBeDisabled();
expect(screen.getByText(/น้ำ 15 ppm ยังไม่ใช่น้ำปลอดเชื้อ/)).toBeVisible();
```

- [ ] **Step 2: Run readiness-gate tests; expect FAIL because creation currently starts five lots immediately.**

- [ ] **Step 3: Load equipment before reporting readiness and require an explicit confirmation only for experimental status.**

- [ ] **Step 4: Keep the start button disabled for blocked/unknown states and provide a direct link to `/my/equipment`.**

- [ ] **Step 5: Run trial creation and readiness tests; expect PASS.**

- [ ] **Step 6: Commit with `git commit -m "feat: gate trial creation on equipment readiness"`.**

### Task 5: Typed step fields with legacy compatibility

**Files:**
- Modify: `src/lib/manual/types.ts`
- Modify: `src/lib/domain/models.ts`
- Create: `src/lib/rounds/field-values.ts`
- Test: `src/lib/rounds/field-values.test.ts`
- Modify: `src/components/rounds/step-runner.tsx`
- Test: `src/components/rounds/step-runner.test.tsx`

**Interfaces:**
- Adds field kinds `number | select | checkbox | text | date` and units `ppm | hour | day | boolean | text | date`.
- Adds optional `responses?: Record<string, number | string | boolean | null>` while retaining numeric `measurements`.

- [ ] **Step 1: Write failing serialization tests for all field kinds plus an old numeric-only run.**

```ts
expect(decodeStepValues({ measurements: { pH: 5.7 } })).toEqual({ pH: 5.7 });
expect(encodeStepValues({ date: "2026-08-09", sterile: false })).toMatchObject({ responses: { date: "2026-08-09", sterile: false } });
```

- [ ] **Step 2: Run field-value tests; expect FAIL because typed responses do not exist.**

- [ ] **Step 3: Implement additive encoding/decoding and exhaustive field rendering.**

```tsx
switch (field.kind) {
  case "number": return <input type="number" />;
  case "date": return <input type="date" />;
  case "checkbox": return <input type="checkbox" />;
  case "select": return <select>{field.options.map(renderOption)}</select>;
  case "text": return <textarea />;
}
```

- [ ] **Step 4: Add arm-specific records for product, stock, actual ppm, volume, rinse count, soak hours, and contamination result fields.**

- [ ] **Step 5: Run field, runner, adapter, and both step-run repository suites; expect PASS for old and new records.**

- [ ] **Step 6: Commit with `git commit -m "feat: record typed protocol responses"`.**

### Task 6: Instrument-aware NaDCC calculation

**Files:**
- Modify: `src/lib/domain/nadcc-calculations.ts`
- Test: `src/lib/domain/nadcc-calculations.test.ts`
- Modify: `src/components/calculators/nadcc-calculator.tsx`
- Test: `src/components/calculators/nadcc-calculator.test.tsx`

**Interfaces:**
- Produces both `calculatedVolumeMl` and `actionableVolumeMl`, rounded to `minimumMeasurableMl`.

- [ ] **Step 1: Write a failing 0.1 mL resolution test and a mass/active-ingredient label test.**

```ts
expect(planNadccCleaningDose(input({ minimumMeasurableMl: 0.1 }))).toMatchObject({
  calculatedVolumeMl: expect.any(Number), actionableVolumeMl: expect.any(Number), resolutionMl: 0.1,
});
```

- [ ] **Step 2: Run calculator domain tests; expect FAIL because results expose unqualified six-decimal values.**

- [ ] **Step 3: Implement decimal-safe rounding to resolution and retain the unrounded audit value.**

```ts
const actionableVolumeMl = Math.round(calculatedVolumeMl / resolutionMl) * resolutionMl;
```

- [ ] **Step 4: Show label facts, formula, calculated value, actionable instruction, resolution, and rounding direction separately.**

- [ ] **Step 5: Run domain and component calculator tests; expect PASS.**

- [ ] **Step 6: Commit with `git commit -m "fix: round NaDCC instructions to real instruments"`.**

### Task 7: Forty-six jar allocation

**Files:**
- Create: `src/lib/trials/jar-allocation.ts`
- Test: `src/lib/trials/jar-allocation.test.ts`
- Modify: `src/app/my/trials/new/page.tsx`
- Test: `src/app/my/trials/new/page.test.tsx`

**Interfaces:**
- Produces `allocateTrialJars(total, roles, reserved): { allocations; reserved; unassigned }`.

- [ ] **Step 1: Write failing deterministic tests for 46 jars, five arms, reserved jars, and totals below five.**

```ts
const result = allocateTrialJars(46, ["control-a", "control-b", "t1", "t2", "t3"], 1);
expect(sum(result.allocations) + result.reserved + result.unassigned).toBe(46);
expect(result.allocations["control-b"]).toBeGreaterThan(0);
```

- [ ] **Step 2: Run allocation tests; expect FAIL because no allocator exists.**

- [ ] **Step 3: Implement integer allocation with user-editable counts and invariant validation.**

- [ ] **Step 4: Show allocation before creation and snapshot each arm count onto its lot.**

- [ ] **Step 5: Run allocator and trial creation tests; expect PASS with no jar invented or lost.**

- [ ] **Step 6: Commit with `git commit -m "feat: allocate available culture jars across trial arms"`.**

### Task 8: P1 verification gate

- [ ] **Step 1: Run `npm test`, `npm run lint`, `npm run build`, `npm run ui:verify`, and `npm run terms:report`; all exit 0.**
- [ ] **Step 2: At desktop and 390×844, enter the complete reported inventory, reload it, inspect each readiness explanation, calculate NaDCC at 0.1 mL resolution, and allocate all 46 jars.**
- [ ] **Step 3: Open a legacy round fixture and confirm numeric measurements still display and save.**
- [ ] **Step 4: Record exact evidence and commit only actual code/tests changed by verification fixes.**
