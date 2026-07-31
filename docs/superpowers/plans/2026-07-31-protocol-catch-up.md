# Protocol Catch-up Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** ให้ผู้ใช้เลือกจุดเริ่มทำต่อเพียงครั้งเดียว แล้วปิดขั้นที่ทำไปแล้วทั้งหมดโดยไม่กรอกเวลาและบันทึกทีละขั้น

**Architecture:** สร้าง pure domain planner สำหรับตรวจช่วงขั้นที่จะ carry forward และสร้าง Step Run metadata จากนั้นเพิ่ม `saveMany` แบบ atomic ให้ memory/Firestore repository หน้า Linear Runner เรียก planner และบันทึกทั้งชุด ก่อนเลื่อนไปยังขั้นที่ผู้ใช้เลือก

**Tech Stack:** Next.js 16, React 19, TypeScript, Vitest, Firebase Auth/Firestore, Playwright

## Global Constraints

- ไม่บังคับ note รูป หรือเวลารายขั้นใน catch-up flow
- Timer ที่ผ่านแล้วต้องยืนยันเพียงครั้งเดียวและไม่เริ่มใหม่
- หาก Timer ไม่ได้รับการยืนยัน ระบบเริ่มต่อที่ Timer นั้น
- ไม่เขียนทับ Step Run ที่ `Passed`, `Needs review` หรือ `Failed`
- Firestore batch ต้องสำเร็จหรือยกเลิกพร้อมกัน
- หลังยืนยันต้องเลื่อนไปหัวขั้นที่เลือก
- ต้องผ่าน tests, lint, build, Firebase emulator และ 14 viewport 360–1920px ก่อน push `master`

---

### Task 1: Catch-up domain planner

**Files:**
- Create: `src/lib/domain/protocol-catch-up.ts`
- Create: `src/lib/domain/protocol-catch-up.test.ts`
- Modify: `src/lib/domain/models.ts`

**Interfaces:**
- Produces: `planProtocolCatchUp(input: ProtocolCatchUpInput): ProtocolCatchUpPlan`
- Produces: `completionMode: "carried-forward"`, `carryForwardRecordedAt`, `carryForwardTargetStepId`, `carryForwardApproximateDate` on `ProtocolStepRun`

- [ ] **Step 1: Write failing planner tests**

```ts
expect(planProtocolCatchUp({
  steps,
  runs: [],
  targetStepId: "step-9",
  confirmedTimedStepIds: ["step-8"],
  recordedAt: "2026-07-31T10:00:00.000Z",
})).toMatchObject({ state: "ready", targetIndex: 8, runs: expect.arrayContaining([
  expect.objectContaining({ stepId: "step-8", completionMode: "carried-forward" }),
]) });

expect(planProtocolCatchUp({
  steps,
  runs: [],
  targetStepId: "step-9",
  confirmedTimedStepIds: [],
  recordedAt: "2026-07-31T10:00:00.000Z",
})).toEqual(expect.objectContaining({ state: "timer-confirmation-required", stepId: "step-8" }));
```

- [ ] **Step 2: Run the domain test and confirm it fails because the module does not exist**

Run: `npm test -- --run src/lib/domain/protocol-catch-up.test.ts`

- [ ] **Step 3: Implement the planner and model metadata**

```ts
export type ProtocolCatchUpInput = {
  lotId: string;
  protocolId: string;
  versionId: string;
  steps: ProtocolStep[];
  runs: ProtocolStepRun[];
  targetStepId: string;
  confirmedTimedStepIds: string[];
  recordedAt: string;
  approximateDate?: string;
};

export type ProtocolCatchUpPlan =
  | { state: "ready"; targetIndex: number; runs: Array<Omit<ProtocolStepRun, "id" | "ownerId" | "updatedAt">> }
  | { state: "invalid-target"; reason: string }
  | { state: "blocked-existing-result"; stepId: string; reason: string }
  | { state: "timer-confirmation-required"; stepId: string; reason: string };
```

The planner selects only steps before the target, omits existing Passed runs, blocks Needs review/Failed, requires confirmation for each unpassed timed step, and emits Passed runs with empty note/media/measurements and carried-forward metadata.

- [ ] **Step 4: Run the domain test**

Run: `npm test -- --run src/lib/domain/protocol-catch-up.test.ts`

- [ ] **Step 5: Commit Task 1**

```text
git add src/lib/domain/models.ts src/lib/domain/protocol-catch-up.ts src/lib/domain/protocol-catch-up.test.ts
git commit -m "Add protocol catch-up planner"
```

### Task 2: Atomic repository saveMany

**Files:**
- Modify: `src/lib/repositories/step-run-repository.ts`
- Modify: `src/lib/repositories/memory-step-run-repository.ts`
- Modify: `src/lib/repositories/guided-repositories.test.ts`
- Modify: `src/lib/firebase/firestore-step-run-repository.ts`
- Modify: `src/lib/firebase/firestore-step-run-repository.test.ts`

**Interfaces:**
- Consumes: planner run inputs from Task 1
- Produces: `StepRunRepository.saveMany(ownerId, runs): Promise<ProtocolStepRun[]>`

- [ ] **Step 1: Write failing repository tests**

```ts
const saved = await repository.saveMany("owner-a", [run1, run2]);
expect(saved.map((item) => item.stepId)).toEqual(["step-1", "step-2"]);
expect(await repository.list("owner-a", "LOT-1")).toHaveLength(2);
```

Add a Firestore serialization assertion that carried-forward metadata survives while optional undefined values are removed.

- [ ] **Step 2: Run repository tests and confirm `saveMany` is missing**

Run: `npm test -- --run src/lib/repositories/guided-repositories.test.ts src/lib/firebase/firestore-step-run-repository.test.ts`

- [ ] **Step 3: Implement memory atomic save**

Build all next records in a cloned Map, then replace records and write demo storage once. Do not call `save()` repeatedly.

- [ ] **Step 4: Implement Firestore atomic batch**

Use `writeBatch(db)`. For each run, set the Step Run document and `progress-${stepId}` audit document. Audit action is `carried_forward`; commit once after every write is queued.

- [ ] **Step 5: Run repository tests**

Run: `npm test -- --run src/lib/repositories/guided-repositories.test.ts src/lib/firebase/firestore-step-run-repository.test.ts`

- [ ] **Step 6: Commit Task 2**

```text
git add src/lib/repositories src/lib/firebase
git commit -m "Save protocol catch-up atomically"
```

### Task 3: Catch-up UI and simplified single-step retrospective form

**Files:**
- Create: `src/components/protocols/protocol-catch-up-panel.tsx`
- Create: `src/components/protocols/protocol-catch-up-panel.test.tsx`
- Modify: `src/components/protocols/linear-protocol-runner-v2.tsx`
- Modify: `src/components/protocols/linear-protocol-runner-v2.test.tsx`
- Modify: `src/app/experiments/[lotId]/page.tsx`
- Modify: `src/app/globals.css`

**Interfaces:**
- Consumes: `planProtocolCatchUp()` and `onSaveMany()`
- Produces: one catch-up panel opened by `ตั้งจุดเริ่มต่อ`

- [ ] **Step 1: Write failing UI tests**

Assert the runner shows `ตั้งจุดเริ่มต่อ`; the panel contains one target-step selector, a summary of skipped steps, Timer confirmation controls, optional approximate date, no note textarea, and `ยืนยันและเริ่มต่อจากขั้นนี้`.

- [ ] **Step 2: Run UI tests and confirm the panel is missing**

Run: `npm test -- --run src/components/protocols/protocol-catch-up-panel.test.tsx src/components/protocols/linear-protocol-runner-v2.test.tsx`

- [ ] **Step 3: Implement the catch-up panel**

Use a native select labelled `ฉันจะเริ่มทำต่อจาก` and a readable list instead of a table. Show checkbox `ฉันยืนยันว่าครบเวลาที่กำหนดแล้ว` only for timed steps before the selected target. Disable confirmation while an existing Needs review/Failed run blocks the range.

- [ ] **Step 4: Connect batch persistence and navigation**

Add `onSaveMany` to runner props. The Experiment page calls `stepRunRepository.saveMany`, refreshes runs once, and runner calls `select(targetIndex)` only after save succeeds.

- [ ] **Step 5: Simplify the single-step retrospective form**

Remove required note. Untimed steps use one optional approximate date and can be confirmed without start/end fields. Timed steps use a clear `ครบเวลาที่กำหนดแล้ว` confirmation; if not confirmed, the user uses the normal Timer flow.

- [ ] **Step 6: Add responsive and accessible styles**

Use one column below 600px, controls at least 48px, visible focus, `aria-live` result messages, and scroll to the selected step respecting reduced motion.

- [ ] **Step 7: Run UI tests**

Run: `npm test -- --run src/components/protocols/protocol-catch-up-panel.test.tsx src/components/protocols/linear-protocol-runner-v2.test.tsx`

- [ ] **Step 8: Commit Task 3**

```text
git add src/components/protocols src/app/experiments src/app/globals.css
git commit -m "Add one-step protocol catch-up flow"
```

### Task 4: Audit, sandbox, handoff, and production

**Files:**
- Modify: `src/components/experiments/audit-history.tsx`
- Modify: `scripts/verify-accessible-ui.mjs`
- Modify: `handoff.md`

**Interfaces:**
- Audit label: `carried_forward` → `ทำก่อนเริ่มใช้คู่มือ`

- [ ] **Step 1: Add audit label and regression assertion**

Ensure carried-forward events display the Thai label and expose metadata in details without presenting an invented completion time.

- [ ] **Step 2: Update browser sandbox flow**

Create a Pink Princess + Haiter Lot, open catch-up, select step 9, confirm the 48-hour Blank timer, save once, assert steps 1–8 are Passed, assert step 9 opens, and assert no note field appears in catch-up.

- [ ] **Step 3: Run complete verification**

```text
npm test
npm run lint
npm run build
npm run firebase:verify
npm run ui:verify
```

- [ ] **Step 4: Update handoff**

Keep the first line `ต้องมีการบันทึกทุกครั้งที่งานจบ`; record behavior, test counts, commits, push and Vercel deployment state.

- [ ] **Step 5: Commit, push master, and wait for production**

```text
git add src/components/experiments/audit-history.tsx scripts/verify-accessible-ui.mjs handoff.md docs/superpowers/plans/2026-07-31-protocol-catch-up.md
git commit -m "Verify protocol catch-up workflow"
git push origin master
```

Confirm the deployment for the pushed SHA is `READY` and `https://tissue-experiment-93.vercel.app/` returns HTTP 200.

