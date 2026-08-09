# Human Fix P0 Protocol Integrity Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make each trial arm internally consistent, give Control-B a true blank workflow, require evidence before passing, and lock T3 until prerequisite results or an audited override exists.

**Architecture:** Insert pure branch-projection, evidence-policy, and T3-eligibility modules between shared manual data and the existing UI. Integrate through additive optional model fields so old lots and runs remain readable.

**Tech Stack:** Next.js 16.2.11 App Router, React 19.2.4, TypeScript 5, Vitest 4.1.10, Testing Library, memory/Firestore repositories.

## Global Constraints

- Read relevant `node_modules/next/dist/docs/` guides before changing Next.js pages or components.
- Follow red-green-refactor and commit each independently passing task.
- Preserve Cyber Greenhouse styling and existing CSS tokens.
- Control-B has no explant selection, cutting, surface sterilization, or placement language.
- Fixed T1/T2/T3 arms never display the 150/300/450 bracket.
- T3 stays readable while locked; Passed and timers remain disabled.
- Schema changes are additive and legacy rounds remain readable.

---

## File Structure

- Create `src/lib/trials/project-trial-steps.ts` for arm-specific projection.
- Create `src/lib/trials/t3-eligibility.ts` for unlock decisions.
- Create `src/lib/rounds/evidence-policy.ts` for required data/photo validation.
- Modify `src/lib/domain/models.ts`, `src/lib/rounds/round-adapter.ts`, trial pages, and `step-runner.tsx` only as integration points.

### Task 1: Arm-specific projection boundary

**Files:**
- Create: `src/lib/trials/project-trial-steps.ts`
- Test: `src/lib/trials/project-trial-steps.test.ts`
- Modify: `src/lib/rounds/round-adapter.ts`
- Test: `src/lib/rounds/round-adapter.test.ts`

**Interfaces:**
- Produces: `projectTrialSteps(steps: ResolvedStep[], lot: ExperimentLot): ResolvedStep[]`.
- Consumes: shared resolved manual steps and immutable lot snapshots.

- [ ] **Step 1: Write a failing branch semantic matrix**

```ts
const text = (role: TrialArmRole) => JSON.stringify(projectTrialSteps(manual.steps, lot(role)));
expect(text("t3")).not.toMatch(/Haiter|NaOCl|ไฮเตอร์/);
expect(text("t1")).not.toMatch(/NaDCC.*24|150.*450/);
expect(text("t2")).not.toMatch(/NaClO 300 ppm|150.*450/);
```

- [ ] **Step 2: Run `npm test -- src/lib/trials/project-trial-steps.test.ts` and confirm FAIL because the module is absent.**

- [ ] **Step 3: Implement immutable projection with one builder per arm**

```ts
export function projectTrialSteps(steps: ResolvedStep[], lot: ExperimentLot): ResolvedStep[] {
  if (!lot.armRole) return steps.map(cloneStep);
  if (lot.armRole === "control-b") return buildBlankSteps();
  return steps.map((step) => projectArmStep(step, lot.armRole));
}
```

Control-A uses Haiter plus sterile water; T1 uses Haiter plus NaClO 300 ppm rinse; T2 uses Haiter plus NaDCC 300 ppm rinse; T3 uses NaDCC 300 ppm for 24–48 hours and no Haiter content. Delete fixed-arm bracket doses from projected copies.

- [ ] **Step 4: Call projection before `RoundStep` numbering in `buildRoundView`.**

```ts
const applicableSteps = projectTrialSteps(manual.steps, lot);
```

- [ ] **Step 5: Run `npm test -- src/lib/trials/project-trial-steps.test.ts src/lib/rounds/round-adapter.test.ts`; expect PASS including the existing filtered-route regression.**

- [ ] **Step 6: Commit with `git commit -m "fix: project coherent protocol steps per trial arm"`.**

### Task 2: Seven-step Control-B workflow

**Files:**
- Modify: `src/lib/trials/project-trial-steps.ts`
- Test: `src/lib/trials/project-trial-steps.test.ts`
- Test: `src/components/rounds/step-runner.test.tsx`

**Interfaces:**
- Produces IDs: `blank-prepare`, `blank-medium`, `blank-container`, `blank-pour`, `blank-seal`, `blank-incubate`, `blank-observe`.

- [ ] **Step 1: Write a failing exact-sequence and forbidden-language test.**

```ts
expect(projectTrialSteps(manual.steps, blankLot).map((step) => step.id)).toEqual([
  "blank-prepare", "blank-medium", "blank-container", "blank-pour",
  "blank-seal", "blank-incubate", "blank-observe",
]);
expect(JSON.stringify(projectTrialSteps(manual.steps, blankLot))).not.toMatch(/explant|ชิ้นพืช|ตัดข้อ|ฟอกผิว|วางชิ้น/);
```

- [ ] **Step 2: Run the focused test; expect FAIL because current code only skips two shared steps.**

- [ ] **Step 3: Build seven explicit `ManualStepDef` records with preparation, same-batch medium, empty vessel, pouring, sealing, incubation, and contamination observation copy.**

```ts
const blankSteps = [
  blankStep("blank-prepare", "เตรียมพื้นที่และติดฉลาก"),
  blankStep("blank-medium", "เตรียมอาหารชุดเดียวกับแขนงอื่น"),
  blankStep("blank-container", "เตรียมกระปุกเปล่า"),
  blankStep("blank-pour", "แบ่งอาหารโดยไม่ใส่ชิ้นพืช"),
  blankStep("blank-seal", "ปิดฝาและบันทึก"),
  blankStep("blank-incubate", "บ่มร่วมกับชุดทดลอง"),
  blankStep("blank-observe", "ตรวจการปนเปื้อน"),
];
```

- [ ] **Step 4: Run projection, runner, and round-list tests; expect steps/routes 1–7 and no forbidden language.**

- [ ] **Step 5: Commit with `git commit -m "fix: give blank control a dedicated workflow"`.**

### Task 3: Required field and photo gate

**Files:**
- Create: `src/lib/rounds/evidence-policy.ts`
- Test: `src/lib/rounds/evidence-policy.test.ts`
- Modify: `src/lib/manual/types.ts`
- Modify: `src/components/rounds/step-runner.tsx`
- Test: `src/components/rounds/step-runner.test.tsx`

**Interfaces:**
- Adds optional `evidenceRequirement?: "none" | "one-photo" | "photo-with-caption"` to steps.
- Produces `evaluateStepEvidence(step, values, media): { canPass; missingFieldIds; missingPhotoCount; missingCaptionCount }`.

- [ ] **Step 1: Write a failing policy test for required number, one photo, and caption.**

```ts
expect(evaluateStepEvidence(step, { "medium-ph": 5.7 }, [])).toMatchObject({
  canPass: false, missingFieldIds: [], missingPhotoCount: 1,
});
```

- [ ] **Step 2: Run `npm test -- src/lib/rounds/evidence-policy.test.ts`; expect FAIL because the evaluator is absent.**

- [ ] **Step 3: Implement empty-value, photo-count, and trimmed-caption validation.**

```ts
const missingFieldIds = step.measurements
  .filter((field) => field.required && isEmpty(values[field.id]))
  .map((field) => field.id);
```

- [ ] **Step 4: Disable only the Passed action when evidence is missing; keep “ติดปัญหา” enabled and show field-level plus aggregate messages.**

```tsx
<button value="Passed" disabled={!gate.canPass || locked}>บันทึกว่าผ่าน</button>
<button value="Needs review">ติดปัญหา</button>
```

- [ ] **Step 5: Run evidence-policy, runner, and step-photo tests; expect PASS.**

- [ ] **Step 6: Commit with `git commit -m "feat: require evidence before passing protocol steps"`.**

### Task 4: T3 result eligibility model

**Files:**
- Create: `src/lib/trials/t3-eligibility.ts`
- Test: `src/lib/trials/t3-eligibility.test.ts`
- Modify: `src/lib/domain/models.ts`
- Modify: `src/lib/rounds/round-adapter.ts`
- Test: `src/lib/rounds/round-adapter.test.ts`

**Interfaces:**
- Produces `evaluateT3Eligibility(lots, runs): T3Eligibility`.
- Adds optional `t3Override: { reason; acknowledged; recordedAt; mode: "risk-override" | "demo-only" }` to `ExperimentLot`.
- Requires T1 and T2 fields `container-total`, `container-clean`, `container-usable`, and `observed-at`.
- In P0, logical field `observed-at` reads the existing `ProtocolStepRun.observedAt`; P1 later exposes it as a typed date field without changing old records.

- [ ] **Step 1: Write a failing T1/T2 completion matrix including missing-one-field cases.**

```ts
expect(evaluateT3Eligibility([t1, t2, t3], completeRuns).unlocked).toBe(true);
expect(evaluateT3Eligibility([t1, t2, t3], without("t2", "container-clean")).unlocked).toBe(false);
```

- [ ] **Step 2: Run `npm test -- src/lib/trials/t3-eligibility.test.ts`; expect FAIL because the module is absent.**

- [ ] **Step 3: Implement deterministic result and override evaluation.**

```ts
if (override?.acknowledged && override.reason.trim().length >= 20) {
  return { unlocked: true, reason: "override", missing: [] };
}
const missing = requiredRoles.flatMap((role) => missingResultFields(role, lots, runs));
return { unlocked: missing.length === 0, reason: missing.length ? "missing-results" : "evidence-complete", missing };
```

- [ ] **Step 4: Add optional eligibility to `RoundView`; old lots without new properties must produce the same view as before.**

- [ ] **Step 5: Run eligibility, adapter, memory repository, and Firestore repository tests; expect PASS.**

- [ ] **Step 6: Commit with `git commit -m "feat: model evidence-gated T3 eligibility"`.**

### Task 5: T3 lock and override UI

**Files:**
- Create: `src/components/trials/t3-lock-panel.tsx`
- Test: `src/components/trials/t3-lock-panel.test.tsx`
- Modify: `src/app/my/rounds/[roundId]/step/[step]/page.tsx`
- Modify: `src/app/my/trials/[trialId]/page.tsx`
- Modify: `src/components/rounds/step-runner.tsx`
- Test: `src/components/rounds/step-runner.test.tsx`
- Modify: `src/lib/repositories/experiment-repository.ts`
- Modify: `src/lib/repositories/memory-experiment-repository.ts`
- Modify: `src/lib/firebase/firestore-experiment-repository.ts`
- Test: corresponding memory and Firestore experiment repository tests.

**Interfaces:**
- Produces `T3LockPanel({ eligibility, demoMode, onOverride })`.
- Adds `saveT3Override(ownerId, lotId, override): Promise<ExperimentLot>` to `ExperimentRepository`; no generic patch method exists in the baseline.

- [ ] **Step 1: Write failing interaction tests for unchecked acknowledgement, a 19-character reason, a valid reason, saving state, and demo-only labeling.**

```tsx
await user.type(screen.getByLabelText(/เหตุผล/), "ต้องการทดลองโดยยอมรับความเสี่ยงทั้งหมดแล้ว");
await user.click(screen.getByRole("checkbox", { name: /เข้าใจ/ }));
expect(screen.getByRole("button", { name: /ปลดล็อก/ })).toBeEnabled();
```

- [ ] **Step 2: Run lock-panel and runner tests; expect FAIL because lock UI does not exist.**

- [ ] **Step 3: Implement an accessible checkbox, textarea with `minLength={20}`, missing-results list, saving state, and actionable errors.**

- [ ] **Step 4: Add and test the narrow repository method, then load sibling lots/runs and persist override metadata.**

```ts
await repository.saveT3Override(ownerId, lot.id, {
  reason, acknowledged: true, recordedAt: now,
  mode: authenticated ? "risk-override" : "demo-only",
});
```

- [ ] **Step 5: Pass `locked` into `StepRunner`; disable Passed and timer controls while leaving all protocol text readable.**

- [ ] **Step 6: Run lock-panel, runner, overview, and repository tests; expect PASS.**

- [ ] **Step 7: Commit with `git commit -m "feat: enforce and explain the T3 evidence lock"`.**

### Task 6: P0 verification gate

**Files:**
- No production file changes unless verification reveals a failing regression.

**Interfaces:**
- Produces fresh automated and browser evidence.

- [ ] **Step 1: Run `npm test`, `npm run lint`, and `npm run build`; all must exit 0.**
- [ ] **Step 2: Run `npm start` and verify no hydration or console errors.**
- [ ] **Step 3: At 1440×900 and 390×844, traverse Control-A, all seven Control-B steps, T1, T2, locked T3, automatic unlock, override, photo failure, and “ติดปัญหา”.**
- [ ] **Step 4: Run `npm run ui:verify` and `npm run terms:report`; both must exit 0.**
- [ ] **Step 5: Record exact commands, outcomes, viewport, and tested routes in the final handoff; do not edit historical findings merely to mark success.**
