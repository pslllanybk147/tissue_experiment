# Experiment Lots and Structured Observations Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add production-ready experiment lot CRUD, structured observations, soft delete/restore, and audit history backed by owner-scoped Firestore.

**Architecture:** Extend the domain layer with validated experiment inputs and an `ExperimentRepository`. Implement identical behavior in an in-memory repository for tests/demo and a Firestore repository for production; Firestore observation mutations write the observation and audit event in one batch. Add App Router pages that share a responsive research shell and use the authenticated repository without exposing data outside `users/{uid}`.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Firebase Auth/Firestore, Vitest, CSS, Vercel.

## Global Constraints

- Observation records are editable and use soft delete with restore.
- Observation fields are observedAt, status, stage, note, shootCount, rootCount, and contaminationCount.
- Every observation mutation produces an audit event with before/after snapshots.
- All records remain under `users/{uid}` and every repository operation rejects owner mismatch.
- Cloudinary and Protocol editor are excluded from this increment.
- Desktop 1440px, tablet 1024px, and mobile 390px must use the same components without horizontal overflow.
- `handoff.md` must begin with `ต้องมีการบันทึกทุกครั้งที่งานจบ` and be updated before delivery.

---

## File Map

- Modify `src/lib/domain/models.ts`: experiment, observation, audit, and input types.
- Create `src/lib/domain/experiment-validation.ts`: deterministic input validation and lot ID normalization.
- Create `src/lib/domain/experiment-validation.test.ts`: validation tests.
- Create `src/lib/domain/experiment-query.ts`: search/filter/sort functions.
- Create `src/lib/domain/experiment-query.test.ts`: query behavior tests.
- Create `src/lib/repositories/experiment-repository.ts`: persistence contract.
- Create `src/lib/repositories/memory-experiment-repository.ts`: demo/test implementation with audit behavior.
- Create `src/lib/repositories/memory-experiment-repository.test.ts`: repository behavior tests.
- Create `src/lib/firebase/firestore-experiment-repository.ts`: production Firestore implementation with batches.
- Create `src/components/lab/lab-shell.tsx`: shared responsive application shell.
- Create `src/components/experiments/experiment-list.tsx`: list/search/filter presentation.
- Create `src/components/experiments/lot-form.tsx`: lot creation form.
- Create `src/components/experiments/observation-form.tsx`: create/edit observation form.
- Create `src/components/experiments/observation-timeline.tsx`: active/deleted timeline actions.
- Create `src/components/experiments/audit-history.tsx`: audit event presentation.
- Create `src/app/experiments/page.tsx`: experiment list controller.
- Create `src/app/experiments/new/page.tsx`: lot creation controller.
- Create `src/app/experiments/[lotId]/page.tsx`: detail controller.
- Modify `src/app/page.tsx`: link dashboard experiment actions to real routes.
- Modify `src/app/globals.css`: shared shell and experiment responsive states.
- Modify `firestore.rules`: explicitly validate nested ownerId writes while retaining owner-only access.
- Modify `handoff.md`: implementation and verification record.

---

### Task 1: Domain Types and Validation

**Files:**
- Modify: `src/lib/domain/models.ts`
- Create: `src/lib/domain/experiment-validation.ts`
- Test: `src/lib/domain/experiment-validation.test.ts`

**Interfaces:**
- Produces: `ExperimentStatus`, `Observation`, `AuditEvent`, `CreateLotInput`, `ObservationInput`, `ValidationResult<T>`, `validateLotInput(input)`, `validateObservationInput(input)`.

- [ ] **Step 1: Write failing validation tests**

Cover uppercase lot ID normalization, invalid lot characters, empty required fields, invalid dates, unsupported status, negative/fractional counts, and valid nullable counts.

```ts
expect(validateLotInput(validLot).value?.id).toBe("PPP-001");
expect(validateObservationInput({ ...validObservation, rootCount: -1 }).errors.rootCount).toBeDefined();
```

- [ ] **Step 2: Verify RED**

Run: `npm test -- src/lib/domain/experiment-validation.test.ts`

Expected: FAIL because the validation module/types do not exist.

- [ ] **Step 3: Implement minimal types and validators**

Use a discriminated result:

```ts
type ValidationResult<T> =
  | { ok: true; value: T; errors: Record<string, never> }
  | { ok: false; value: null; errors: Record<string, string> };
```

Normalize lot IDs with `trim().toUpperCase()` and accept `/^[A-Z0-9-]+$/`. Counts must be `null` or non-negative integers.

- [ ] **Step 4: Verify GREEN and refactor**

Run: `npm test -- src/lib/domain/experiment-validation.test.ts`

Expected: all validation tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/lib/domain/models.ts src/lib/domain/experiment-validation.ts src/lib/domain/experiment-validation.test.ts
git commit -m "Add experiment domain validation"
```

### Task 2: Lot Query Functions

**Files:**
- Create: `src/lib/domain/experiment-query.ts`
- Test: `src/lib/domain/experiment-query.test.ts`

**Interfaces:**
- Consumes: `ExperimentLot`, `ExperimentStatus`.
- Produces: `filterLots(lots, search, status): ExperimentLot[]`.

- [ ] **Step 1: Write failing query tests**

Tests require case-insensitive Lot ID/plant matching, status filtering, combined filters, and newest `startedAt` first without mutating input.

- [ ] **Step 2: Verify RED**

Run: `npm test -- src/lib/domain/experiment-query.test.ts`

Expected: FAIL because `filterLots` is missing.

- [ ] **Step 3: Implement pure query function**

Copy before sort and use exact status equality unless status is `"All"`.

- [ ] **Step 4: Verify GREEN**

Run: `npm test -- src/lib/domain/experiment-query.test.ts`

- [ ] **Step 5: Commit**

```bash
git add src/lib/domain/experiment-query.ts src/lib/domain/experiment-query.test.ts
git commit -m "Add experiment lot filtering"
```

### Task 3: Repository Contract and Memory Behavior

**Files:**
- Create: `src/lib/repositories/experiment-repository.ts`
- Create: `src/lib/repositories/memory-experiment-repository.ts`
- Test: `src/lib/repositories/memory-experiment-repository.test.ts`

**Interfaces:**
- Consumes: validated `CreateLotInput`, `ObservationInput` and domain models.
- Produces: `ExperimentRepository` exactly as specified in the approved design plus `createMemoryExperimentRepository(uid, seed?)`.

- [ ] **Step 1: Write failing repository tests**

Cover owner mismatch, create/get/list lot, duplicate lot rejection, create observation + audit, update with before/after, deleted hidden by default, include deleted, restore, missing records, and newest-first ordering.

- [ ] **Step 2: Verify RED**

Run: `npm test -- src/lib/repositories/memory-experiment-repository.test.ts`

Expected: FAIL because repository files do not exist.

- [ ] **Step 3: Implement minimal in-memory repository**

Inject `now(): string` and `createId(): string` dependencies with deterministic defaults in tests. Clone stored snapshots before returning to prevent mutation leaks.

- [ ] **Step 4: Verify GREEN**

Run: `npm test -- src/lib/repositories/memory-experiment-repository.test.ts`

- [ ] **Step 5: Run all unit tests**

Run: `npm test`

Expected: all existing and new tests pass.

- [ ] **Step 6: Commit**

```bash
git add src/lib/repositories/experiment-repository.ts src/lib/repositories/memory-experiment-repository.ts src/lib/repositories/memory-experiment-repository.test.ts
git commit -m "Add audited experiment repository"
```

### Task 4: Firestore Experiment Repository

**Files:**
- Create: `src/lib/firebase/firestore-experiment-repository.ts`
- Modify: `firestore.rules`

**Interfaces:**
- Consumes: `ExperimentRepository`, authenticated `uid`, Firebase services.
- Produces: `createFirestoreExperimentRepository(uid): ExperimentRepository`.

- [ ] **Step 1: Add a failing source contract test**

Create `src/lib/firebase/firestore-experiment-repository.test.ts` that injects a small persistence adapter and asserts update/delete/restore generate paired observation and audit writes. The test must fail before the adapter-backed implementation exists.

- [ ] **Step 2: Verify RED**

Run: `npm test -- src/lib/firebase/firestore-experiment-repository.test.ts`

- [ ] **Step 3: Implement Firestore reads and batch writes**

Use paths below and `writeBatch` for every observation/audit pair:

```text
users/{uid}/lots/{lotId}
users/{uid}/lots/{lotId}/observations/{observationId}
users/{uid}/lots/{lotId}/auditEvents/{eventId}
```

Reject owner mismatch before calling Firebase. Query reads client-side and sort deterministically to avoid premature composite indexes.

- [ ] **Step 4: Tighten rules for nested data**

Keep `isOwner(userId)` and require `request.resource.data.ownerId == userId` on create/update. Read/delete remain owner-only. Do not allow root collections outside `/users/{uid}`.

- [ ] **Step 5: Verify GREEN and rule compilation**

Run: `npm test -- src/lib/firebase/firestore-experiment-repository.test.ts`

Run: `npx firebase-tools deploy --only firestore:rules --project tissue-experiment --dry-run`

Expected: tests pass and rules compile without release. If the CLI lacks `--dry-run`, use `firebase emulators:exec` only when JDK 21 is available; otherwise record the environment limitation and rely on deploy compilation at preview release time.

- [ ] **Step 6: Commit**

```bash
git add src/lib/firebase/firestore-experiment-repository.ts src/lib/firebase/firestore-experiment-repository.test.ts firestore.rules
git commit -m "Add Firestore experiment persistence"
```

### Task 5: Shared Lab Shell and Route Navigation

**Files:**
- Create: `src/components/lab/lab-shell.tsx`
- Modify: `src/app/page.tsx`
- Modify: `src/app/globals.css`

**Interfaces:**
- Produces: `LabShell({ section, children })` with desktop sidebar, mobile top bar, auth session chip, search slot, and sign-out.

- [ ] **Step 1: Write a failing render contract test**

Add `src/components/lab/lab-shell.test.tsx` using React server rendering to assert semantic navigation links for Overview and Experiments plus a main content landmark.

- [ ] **Step 2: Verify RED**

Run: `npm test -- src/components/lab/lab-shell.test.tsx`

- [ ] **Step 3: Extract the shell and convert dashboard buttons to links**

Use Next `Link` for `/` and `/experiments`. Preserve existing visual classes and mobile sign-out behavior.

- [ ] **Step 4: Verify GREEN and dashboard regression**

Run: `npm test -- src/components/lab/lab-shell.test.tsx`

Run: `npm run lint`

- [ ] **Step 5: Commit**

```bash
git add src/components/lab/lab-shell.tsx src/components/lab/lab-shell.test.tsx src/app/page.tsx src/app/globals.css
git commit -m "Extract shared research shell"
```

### Task 6: Experiment List and Lot Creation Pages

**Files:**
- Create: `src/components/experiments/experiment-list.tsx`
- Create: `src/components/experiments/lot-form.tsx`
- Create: `src/app/experiments/page.tsx`
- Create: `src/app/experiments/new/page.tsx`
- Modify: `src/app/globals.css`

**Interfaces:**
- Consumes: authenticated owner, `ExperimentRepository`, validators, `filterLots`.
- Produces: list route and create route with navigation to `/experiments/{lotId}` after success.

- [ ] **Step 1: Write failing component tests for list and form state**

Assert empty state, search/filter results, field errors, preserved invalid values, and pending submit disabled state.

- [ ] **Step 2: Verify RED**

Run: `npm test -- src/components/experiments/experiment-list.test.tsx src/components/experiments/lot-form.test.tsx`

- [ ] **Step 3: Implement list and creation components**

Use controlled inputs and accessible labels. Route controllers select memory repository for demo and Firestore repository for authenticated sessions.

- [ ] **Step 4: Add responsive styles and state surfaces**

Desktop uses a dense table; mobile uses stacked rows. Every loading/error/empty state must remain within the content grid.

- [ ] **Step 5: Verify GREEN**

Run component tests, `npm run lint`, and `npm run build`.

- [ ] **Step 6: Commit**

```bash
git add src/components/experiments src/app/experiments/page.tsx src/app/experiments/new/page.tsx src/app/globals.css
git commit -m "Add experiment list and creation"
```

### Task 7: Observation Timeline, Editing, Soft Delete, and Audit UI

**Files:**
- Create: `src/components/experiments/observation-form.tsx`
- Create: `src/components/experiments/observation-timeline.tsx`
- Create: `src/components/experiments/audit-history.tsx`
- Create: `src/app/experiments/[lotId]/page.tsx`
- Modify: `src/app/globals.css`

**Interfaces:**
- Consumes: `ExperimentRepository` operations and experiment domain models.
- Produces: lot detail workflow with create/edit/delete/restore and audit panel.

- [ ] **Step 1: Write failing component tests**

Assert structured validation, create/edit mode changes, soft-delete confirmation, show-deleted toggle, restore action, and audit summaries.

- [ ] **Step 2: Verify RED**

Run the three component test files and confirm failures are missing components/behavior.

- [ ] **Step 3: Implement detail controller and forms**

Keep form input on Firestore failure, disable duplicate submissions, reload detail data only after successful writes, and show neutral not-found for missing lots.

- [ ] **Step 4: Implement timeline and audit presentation**

Sort newest first. Deleted items use reduced emphasis and Restore. Audit history never offers mutation controls.

- [ ] **Step 5: Add responsive and focus styles**

At 390px forms use one column, actions wrap, numeric inputs remain readable, and no container sets a fixed minimum width.

- [ ] **Step 6: Verify GREEN**

Run component tests, all unit tests, lint, and build.

- [ ] **Step 7: Commit**

```bash
git add src/components/experiments src/app/experiments/[lotId]/page.tsx src/app/globals.css
git commit -m "Add structured observation workflow"
```

### Task 8: Sandbox, Preview, Rules Release, and Handoff

**Files:**
- Modify: `handoff.md`

**Interfaces:**
- Consumes: completed application and Firebase configuration.
- Produces: verified Draft PR and Vercel Preview; no production merge without user approval.

- [ ] **Step 1: Run automated checks**

```bash
npm test
npm run lint
npm run build
git diff --check
```

Expected: all pass with no warnings/errors attributable to the change.

- [ ] **Step 2: Run local sandbox**

At 1440px, 1024px, and 390px verify no horizontal overflow and test list search/filter, lot creation, observation create/edit/delete/restore, audit history, keyboard focus, loading, empty, validation, and error states.

- [ ] **Step 3: Deploy Firestore rules**

After compilation succeeds:

```bash
npx firebase-tools deploy --only firestore:rules,firestore:indexes --project tissue-experiment
```

Record the release result. Do not alter Auth configuration or data.

- [ ] **Step 4: Update handoff**

Record date, branch, commits, files, tests, sandbox dimensions, Firebase release, limitations, and exact next actions. Preserve the required first line.

- [ ] **Step 5: Push and open Draft PR**

Push `feature/experiment-observations`, open a Draft PR to `master`, and wait for Vercel Preview success.

- [ ] **Step 6: Verify Preview**

Repeat the critical create/edit/delete/restore and responsive checks against Preview using an authenticated Firebase session. Do not merge without explicit user approval.

---

## Plan Self-Review

- Spec coverage: all approved lot, structured observation, soft delete/restore, audit, responsive, permission, and verification requirements map to Tasks 1–8.
- Scope: Cloudinary and Protocol editor remain excluded.
- Type consistency: routes, models, statuses, and repository method names match the approved specification.
- Placeholder scan: every implementation step contains an exact file, behavior, command, and expected result.
