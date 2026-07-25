# Sterilization Profiles and Beginner UX Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** เพิ่มการเลือกวิธีฆ่าเชื้ออาหารแบบ Haiter หรือหม้อนึ่งแรงดัน พร้อม Beginner Wizard, การประกอบขั้นตอนตาม profile และ readiness gate ที่ห้ามตัด explant ก่อนอาหารและพื้นที่พร้อม

**Architecture:** เก็บขั้นตอนชีววิทยาใน Base Protocol เดิม และเพิ่ม `SterilizationProfile` เป็น domain object แยก จากนั้นสร้าง snapshot ลง Experiment Lot และใช้ pure function ประกอบขั้นตอน Runner แบบคงที่ต่อ Lot ตัวคำนวณ Haiter เป็น pure function แยกจาก React และ repository เพื่อให้ตรวจหน่วย คำเตือน และ working dilution ด้วย Vitest ได้

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript 5, Firebase Auth/Firestore, Vitest, Firebase Emulator, Vercel

## Global Constraints

- `handoff.md` ต้องขึ้นต้นด้วย `ต้องมีการบันทึกทุกครั้งที่งานจบ`
- ใช้ Gridgeist visual direction เดิม: technical, calm, evidence-led และ high contrast
- รองรับ desktop/mobile ใน code path เดียวที่ 390px, 1024px และ 1440px
- Profile รุ่นแรกมีเฉพาะ `haiter-chemical` และ `pressure-sterilization`
- Blank test ของ Haiter เป็น `recommended-skippable` และการข้ามต้องมีเหตุผล
- วิธีฆ่าเชื้อต้องถูกล็อกหลังเริ่ม Lot
- ห้ามเปิดขั้นตัด explant ก่อน readiness gate ผ่าน
- ค่าไม่มีหลักฐานตรงห้ามแสดงเป็น `Verified`
- ห้ามบันทึก `undefined` ลง Firestore
- ก่อนส่งต้องผ่าน `npm test`, `npm run lint`, `npm run build`, `npm run firebase:verify` และ browser verification

---

## File Structure

- Create `src/lib/domain/sterilization-profiles.ts`: profile definitions, step composition, readiness gate
- Create `src/lib/domain/sterilization-profiles.test.ts`: profile and composition behavior
- Create `src/lib/domain/haiter-calculations.ts`: Haiter dose and working dilution calculation
- Create `src/lib/domain/haiter-calculations.test.ts`: unit/range/precision tests
- Modify `src/lib/domain/models.ts`: profile, snapshot, wizard and Lot types
- Modify `src/lib/domain/experiment-validation.ts`: validate and sanitize Lot snapshot
- Modify `src/lib/domain/experiment-validation.test.ts`: invalid/missing/legacy cases
- Create `src/components/experiments/beginner-lot-wizard.tsx`: five-step first-time flow
- Create `src/components/experiments/beginner-lot-wizard.test.tsx`: wizard navigation and validation
- Modify `src/app/experiments/new/page.tsx`: load templates/profiles and persist snapshot
- Modify `src/components/experiments/lot-form.tsx`: advanced direct-entry flow with profile field
- Modify `src/components/experiments/lot-form.test.tsx`: direct-entry behavior
- Modify `src/components/protocols/guided-protocol-runner.tsx`: one-step focus, readiness lock and Thai states
- Modify `src/components/protocols/guided-protocol-runner.test.tsx`: branch and gate rendering
- Modify `src/components/lab/dashboard-summary.tsx`: primary beginner CTA
- Modify `src/components/lab/dashboard-summary.test.tsx`: CTA behavior
- Modify `src/app/globals.css`: approved contrast/focus/responsive styles
- Modify experiment repositories/tests only where snapshot serialization requires it
- Modify `handoff.md`: implementation, checks, commit and deployment status

### Task 1: Sterilization domain and Lot snapshot

**Files:**
- Modify: `src/lib/domain/models.ts`
- Create: `src/lib/domain/sterilization-profiles.ts`
- Test: `src/lib/domain/sterilization-profiles.test.ts`

**Interfaces:**
- Produces: `SterilizationMethod`, `SterilizationProfile`, `LotSterilizationSnapshot`
- Produces: `sterilizationProfiles`, `composeGuidedSteps(baseSteps, profile)`, `canUnlockExplantSteps(readiness)`
- Consumes: `ProtocolStep`, `EvidenceState`

- [ ] **Step 1: Write failing profile tests**

```ts
test("Haiter profile places medium readiness before explant cutting", () => {
  const steps = composeGuidedSteps(baseSteps, profileById("haiter-chemical-v1"));
  expect(steps.findIndex((step) => step.phase === "readiness"))
    .toBeLessThan(steps.findIndex((step) => step.phase === "explant-cut"));
});

test("readiness stays locked when blank is skipped without a reason", () => {
  expect(canUnlockExplantSteps({
    mediumReady: true, containersReady: true, workspaceReady: true,
    toolsReady: true, blankDecision: "skipped", blankSkipReason: "",
  })).toBe(false);
});
```

- [ ] **Step 2: Run test and verify RED**

Run: `npx vitest run src/lib/domain/sterilization-profiles.test.ts`  
Expected: FAIL because the module and exported functions do not exist.

- [ ] **Step 3: Add model and profile implementation**

```ts
export type SterilizationMethod = "haiter-chemical" | "pressure-sterilization";
export type LotSterilizationSnapshot = {
  profileId: string;
  profileVersion: string;
  method: SterilizationMethod;
  lockedAt?: string;
  activeChlorinePercent?: number;
  mediumVolumeMl?: number;
  calculatedDoseMl?: number;
  blankDecision?: "completed" | "skipped";
  blankSkipReason?: string;
};
```

Implement profiles with explicit phase IDs and compose them into the Base Protocol while replacing the old early `ตัดและเตรียมชิ้นพืช` position.

- [ ] **Step 4: Run focused and full domain tests**

Run: `npx vitest run src/lib/domain/sterilization-profiles.test.ts src/lib/domain/protocol-templates.test.ts`  
Expected: PASS.

- [ ] **Step 5: Commit**

```powershell
git add src/lib/domain/models.ts src/lib/domain/sterilization-profiles.ts src/lib/domain/sterilization-profiles.test.ts
git commit -m "Add sterilization profiles and readiness gate"
```

### Task 2: Haiter calculation and measurement safety

**Files:**
- Create: `src/lib/domain/haiter-calculations.ts`
- Test: `src/lib/domain/haiter-calculations.test.ts`

**Interfaces:**
- Produces: `calculateHaiterDose(input): HaiterDoseResult`
- Produces: `planHaiterWorkingDilution(input): HaiterDilutionResult`
- Consumes: percentage concentration, target percentage, medium volume and minimum measurable volume

- [ ] **Step 1: Write failing calculation tests**

```ts
test("calculates source volume with C1V1 = C2V2", () => {
  expect(calculateHaiterDose({
    sourcePercent: 6,
    targetPercent: 0.003,
    finalVolumeMl: 1000,
    minimumMeasurableMl: 0.1,
  }).sourceVolumeMl).toBe(0.5);
});

test("recommends a working dilution when the dose is below tool capability", () => {
  expect(calculateHaiterDose({
    sourcePercent: 6,
    targetPercent: 0.003,
    finalVolumeMl: 100,
    minimumMeasurableMl: 0.1,
  }).needsWorkingDilution).toBe(true);
});
```

- [ ] **Step 2: Run test and verify RED**

Run: `npx vitest run src/lib/domain/haiter-calculations.test.ts`  
Expected: FAIL because calculation exports do not exist.

- [ ] **Step 3: Implement validation and calculation**

Validate finite positive values, require `targetPercent < sourcePercent`, round display values without losing raw calculation, and return Thai warnings for abnormal ranges and unmeasurable volumes.

- [ ] **Step 4: Run focused tests**

Run: `npx vitest run src/lib/domain/haiter-calculations.test.ts src/lib/domain/medium-calculations.test.ts`  
Expected: PASS.

- [ ] **Step 5: Commit**

```powershell
git add src/lib/domain/haiter-calculations.ts src/lib/domain/haiter-calculations.test.ts
git commit -m "Add safe Haiter dose calculations"
```

### Task 3: Lot validation and persistence

**Files:**
- Modify: `src/lib/domain/experiment-validation.ts`
- Test: `src/lib/domain/experiment-validation.test.ts`
- Modify: `src/lib/firebase/firestore-experiment-repository.ts`
- Test: `src/lib/firebase/firestore-experiment-repository.test.ts`
- Modify: `src/lib/repositories/memory-experiment-repository.ts`
- Test: `src/lib/repositories/memory-experiment-repository.test.ts`

**Interfaces:**
- Consumes: `CreateLotInput.sterilization`
- Produces: normalized Lot without undefined fields
- Preserves: legacy Lots may load with no snapshot but cannot advance to a profile-dependent step

- [ ] **Step 1: Write failing validation tests**

```ts
test("rejects a skipped blank without a reason", () => {
  const result = validateLotInput(lot({
    sterilization: { ...haiterSnapshot, blankDecision: "skipped", blankSkipReason: "" },
  }));
  expect(result.ok).toBe(false);
});

test("removes absent optional snapshot values instead of writing undefined", () => {
  const result = validateLotInput(lot({ sterilization: pressureSnapshot }));
  expect(result.ok && JSON.stringify(result.value)).not.toContain("undefined");
});
```

- [ ] **Step 2: Run test and verify RED**

Run: `npx vitest run src/lib/domain/experiment-validation.test.ts`  
Expected: FAIL because the validator does not handle sterilization.

- [ ] **Step 3: Implement normalized persistence**

Add snapshot validation, preserve old records on read, and sanitize nested optional fields before Firestore `set`.

- [ ] **Step 4: Run validation and repository tests**

Run: `npx vitest run src/lib/domain/experiment-validation.test.ts src/lib/firebase/firestore-experiment-repository.test.ts src/lib/repositories/memory-experiment-repository.test.ts`  
Expected: PASS.

- [ ] **Step 5: Commit**

```powershell
git add src/lib/domain/experiment-validation.ts src/lib/domain/experiment-validation.test.ts src/lib/firebase/firestore-experiment-repository.ts src/lib/firebase/firestore-experiment-repository.test.ts src/lib/repositories/memory-experiment-repository.ts src/lib/repositories/memory-experiment-repository.test.ts
git commit -m "Persist locked sterilization snapshots on lots"
```

### Task 4: Beginner Lot Wizard

**Files:**
- Create: `src/components/experiments/beginner-lot-wizard.tsx`
- Test: `src/components/experiments/beginner-lot-wizard.test.tsx`
- Modify: `src/app/experiments/new/page.tsx`
- Modify: `src/components/experiments/lot-form.tsx`
- Test: `src/components/experiments/lot-form.test.tsx`

**Interfaces:**
- Consumes: plants, templates, protocol versions and `sterilizationProfiles`
- Produces: validated `CreateLotInput`
- Calls: existing `onCreateLot` persistence path

- [ ] **Step 1: Write failing wizard tests**

```tsx
test("walks a beginner through five named stages", () => {
  render(<BeginnerLotWizard {...props} />);
  expect(screen.getByText("1. เพิ่มต้นไม้")).toBeTruthy();
  expect(screen.getByRole("button", { name: "ถัดไป" })).toBeTruthy();
});

test("does not continue from Haiter selection without active chlorine", () => {
  render(<BeginnerLotWizard {...haiterProps} />);
  fireEvent.click(screen.getByRole("button", { name: "ตรวจอุปกรณ์ต่อ" }));
  expect(screen.getByText(/กรอกค่าจากฉลาก/)).toBeTruthy();
});
```

- [ ] **Step 2: Run tests and verify RED**

Run: `npx vitest run src/components/experiments/beginner-lot-wizard.test.tsx`  
Expected: FAIL because the component does not exist.

- [ ] **Step 3: Implement the five-step wizard**

Use one React component with step state, Thai copy, automatic Lot ID, Advanced section for direct editing, profile cards with text/icon selection, equipment checklist and calculation summary.

- [ ] **Step 4: Connect page and retain advanced form**

Make Wizard the default on `/experiments/new`; expose `ใช้แบบฟอร์มขั้นสูง` to render the existing form with the new required profile selection.

- [ ] **Step 5: Run focused tests**

Run: `npx vitest run src/components/experiments/beginner-lot-wizard.test.tsx src/components/experiments/lot-form.test.tsx`  
Expected: PASS.

- [ ] **Step 6: Commit**

```powershell
git add src/components/experiments/beginner-lot-wizard.tsx src/components/experiments/beginner-lot-wizard.test.tsx src/app/experiments/new/page.tsx src/components/experiments/lot-form.tsx src/components/experiments/lot-form.test.tsx
git commit -m "Add beginner experiment wizard"
```

### Task 5: Guided Runner branching and readiness gate

**Files:**
- Modify: `src/components/protocols/guided-protocol-runner.tsx`
- Test: `src/components/protocols/guided-protocol-runner.test.tsx`
- Modify: `src/app/experiments/[lotId]/page.tsx`

**Interfaces:**
- Consumes: composed steps and Lot sterilization snapshot
- Produces: one-step focused runner with locked future explant steps
- Preserves: existing note, measurement, photo and status persistence

- [ ] **Step 1: Write failing runner tests**

```tsx
test("shows a do-not-cut warning before readiness passes", () => {
  render(<GuidedProtocolRunner {...haiterRunnerProps} />);
  expect(screen.getByText("อย่าเพิ่งตัดต้นไม้")).toBeTruthy();
});

test("renders Thai completion states", () => {
  render(<GuidedProtocolRunner {...runnerProps} />);
  expect(screen.getByLabelText("ผ่าน")).toBeTruthy();
  expect(screen.getByLabelText("ต้องตรวจเพิ่ม")).toBeTruthy();
  expect(screen.getByLabelText("ไม่ผ่าน")).toBeTruthy();
});
```

- [ ] **Step 2: Run test and verify RED**

Run: `npx vitest run src/components/protocols/guided-protocol-runner.test.tsx`  
Expected: FAIL because the approved copy and branch behavior are absent.

- [ ] **Step 3: Implement focused runner**

Show current step, compact progress, next-step summary, evidence state explanation, fixed seven-section content order and a guarded message when the selected step is not yet available.

- [ ] **Step 4: Connect composed steps on Lot page**

Resolve the Lot snapshot, choose the matching profile version, compose the Base Protocol and render a migration prompt for legacy Lots.

- [ ] **Step 5: Run runner and integration tests**

Run: `npx vitest run src/components/protocols/guided-protocol-runner.test.tsx src/lib/domain/sterilization-profiles.test.ts`  
Expected: PASS.

- [ ] **Step 6: Commit**

```powershell
git add src/components/protocols/guided-protocol-runner.tsx src/components/protocols/guided-protocol-runner.test.tsx src/app/experiments/[lotId]/page.tsx
git commit -m "Guide protocol steps by sterilization method"
```

### Task 6: Beginner entry point and visual contract

**Files:**
- Modify: `src/components/lab/dashboard-summary.tsx`
- Test: `src/components/lab/dashboard-summary.test.tsx`
- Modify: `src/app/globals.css`

**Interfaces:**
- Produces: primary CTA to `/plants/new` or `/experiments/new`
- Applies: approved high-contrast tokens, focus states and responsive Wizard/Runner layout

- [ ] **Step 1: Write failing CTA test**

```tsx
test("offers one obvious beginner starting action", () => {
  render(<DashboardSummary {...props} />);
  expect(screen.getByRole("link", { name: "เริ่มจากต้นไม้ 1 ต้น" }).getAttribute("href"))
    .toBe("/plants/new");
});
```

- [ ] **Step 2: Run test and verify RED**

Run: `npx vitest run src/components/lab/dashboard-summary.test.tsx`  
Expected: FAIL because the CTA copy is absent.

- [ ] **Step 3: Add CTA and approved visual tokens**

Use dark text on light backgrounds, visible borders, non-color-only state cues, `:focus-visible`, mobile vertical flow and `prefers-reduced-motion`.

- [ ] **Step 4: Run component tests**

Run: `npx vitest run src/components/lab/dashboard-summary.test.tsx src/components/lab/lab-shell.test.tsx`  
Expected: PASS.

- [ ] **Step 5: Commit**

```powershell
git add src/components/lab/dashboard-summary.tsx src/components/lab/dashboard-summary.test.tsx src/app/globals.css
git commit -m "Improve beginner entry and UI contrast"
```

### Task 7: Full verification, handoff and production branches

**Files:**
- Modify: `handoff.md`
- Modify: plan checkboxes in `docs/superpowers/plans/2026-07-25-sterilization-profiles-beginner-ux.md`

**Interfaces:**
- Verifies all prior outputs end-to-end

- [ ] **Step 1: Run code checks**

```powershell
npm test
npm run lint
npm run build
npm run firebase:verify
```

Expected: all commands exit 0.

- [ ] **Step 2: Run sandbox/emulator flow**

Verify authenticated Plant creation, Wizard Lot creation for both profiles, locked method, readiness gate, guided completion, media note preservation and legacy Lot migration prompt.

- [ ] **Step 3: Run browser verification**

Verify 390px, 1024px and 1440px; keyboard-only navigation; focus visibility; long Thai copy; no horizontal overflow; reduced motion; Haiter and pressure branches.

- [ ] **Step 4: Update handoff**

Keep the exact first line and record implemented files, tests, emulator result, browser result, unresolved risks, commits and deployment branch.

- [ ] **Step 5: Commit final records**

```powershell
git add handoff.md docs/superpowers/plans/2026-07-25-sterilization-profiles-beginner-ux.md
git commit -m "Record sterilization workflow verification"
```

- [ ] **Step 6: Push production branches**

```powershell
git push origin master
git push origin master:main
```

Expected: both remote branches point to the verified final commit and Vercel production deployment begins from the configured production branch.

