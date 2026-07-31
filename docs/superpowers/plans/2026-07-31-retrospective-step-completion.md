# Retrospective Step Completion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** ให้ผู้ใช้บันทึกขั้น Protocol v2 ที่ทำไปแล้วด้วยเวลาจริง โดย Timer นับเฉพาะเวลาที่เหลือและ Lot เดิมไม่ต้องเริ่มใหม่

**Architecture:** เพิ่มฟังก์ชันคำนวณ retrospective timing แบบ pure function ใน domain แล้วให้ Linear Protocol Runner ใช้ฟังก์ชันนี้สร้าง Step Run เดิมพร้อม metadata ว่าเป็นข้อมูลย้อนหลัง Repository ปัจจุบันบันทึก Step Run และ audit event อยู่แล้ว จึงขยาย schema โดยไม่สร้าง collection ใหม่

**Tech Stack:** Next.js 16, React 19, TypeScript, Vitest, Firebase Auth/Firestore, Playwright

## Global Constraints

- ใช้ได้กับทุกขั้น Protocol v2
- ไม่บังคับรูป
- ห้ามเวลาที่อยู่ในอนาคต
- ขั้น Timer ผ่านได้ต่อเมื่อเวลาที่คำนวณครบ
- checklist และ measurement บังคับยังต้องครบ
- Lot v2 ปัจจุบันใช้ได้โดยไม่สร้างใหม่
- ต้องผ่าน tests, lint, build, Firebase emulator และ UI verification ก่อน push `master`

---

### Task 1: Retrospective timing domain

**Files:**
- Create: `src/lib/domain/retrospective-step-completion.ts`
- Create: `src/lib/domain/retrospective-step-completion.test.ts`
- Modify: `src/lib/domain/models.ts`

**Interfaces:**
- Produces: `planRetrospectiveCompletion(input): RetrospectiveCompletionPlan`
- Produces fields `completionMode` and `retrospectiveRecordedAt` on `ProtocolStepRun`

- [ ] **Step 1: Write failing tests**

```ts
expect(planRetrospectiveCompletion({
  startedAt: "2026-07-29T08:00:00.000Z",
  durationMinutes: 2880,
  now: "2026-07-31T09:00:00.000Z",
})).toMatchObject({ state: "complete" });

expect(planRetrospectiveCompletion({
  startedAt: "2026-07-31T08:00:00.000Z",
  durationMinutes: 2880,
  now: "2026-07-31T09:00:00.000Z",
})).toMatchObject({ state: "waiting" });
```

- [ ] **Step 2: Run the test and confirm failure because the module is missing**

Run: `npm test -- --run src/lib/domain/retrospective-step-completion.test.ts`

- [ ] **Step 3: Implement validation and timing calculation**

The function rejects invalid/future dates, computes `timerEndsAt`, and returns `complete` only when `now >= timerEndsAt`.

- [ ] **Step 4: Run the targeted test**

Run: `npm test -- --run src/lib/domain/retrospective-step-completion.test.ts`

### Task 2: Runner form and persistence

**Files:**
- Modify: `src/components/protocols/linear-protocol-runner-v2.tsx`
- Modify: `src/components/protocols/linear-protocol-runner-v2.test.tsx`
- Modify: `src/app/globals.css`

**Interfaces:**
- Consumes: `planRetrospectiveCompletion`
- Saves: existing `onSave()` with `completionMode: "retrospective"` and `retrospectiveRecordedAt`

- [ ] **Step 1: Write failing rendering tests**

Assert that every step shows `ฉันทำขั้นนี้ไว้แล้ว`, the form contains a datetime input, and photo/file inputs are absent.

- [ ] **Step 2: Run test and confirm the button is missing**

Run: `npm test -- --run src/components/protocols/linear-protocol-runner-v2.test.tsx`

- [ ] **Step 3: Implement the inline retrospective panel**

For untimed steps request start/completion time. For timed steps request start time, show calculated end time, and save either `Passed` or `Pending`. Reuse readiness and measurement gates.

- [ ] **Step 4: Add accessible responsive styles**

Keep minimum 48px controls, visible focus, single-column mobile layout, and status text in `aria-live`.

- [ ] **Step 5: Run targeted tests**

Run: `npm test -- --run src/components/protocols/linear-protocol-runner-v2.test.tsx`

### Task 3: Firebase, audit, browser verification, and handoff

**Files:**
- Modify: `src/lib/firebase/firestore-step-run-repository.test.ts`
- Modify: `scripts/verify-accessible-ui.mjs`
- Modify: `handoff.md`

**Interfaces:**
- Audit event `after` includes `completionMode: "retrospective"`
- Existing Firestore undefined-field sanitizer remains the write boundary

- [ ] **Step 1: Add repository regression assertion**

Verify retrospective fields survive sanitization and no optional `undefined` reaches Firestore.

- [ ] **Step 2: Update browser verification**

Create a Pink Princess v2 Lot, complete step 1 retrospectively, verify step 2 unlocks, and verify a timed retrospective plan shows complete/waiting correctly.

- [ ] **Step 3: Run complete verification**

Run:

```text
npm test
npm run lint
npm run build
npm run firebase:verify
npm run ui:verify
```

- [ ] **Step 4: Update `handoff.md`**

Record behavior, migration impact, exact verification counts, commit, and production deployment.

- [ ] **Step 5: Commit and push**

Commit the implementation and push `master`, then wait for Vercel Production to become `READY`.
