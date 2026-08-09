# Executable Beginner Guide Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the guide actionable for beginners by rendering explicit execution instructions, quantities, containers, and timing for the sterilization workflow without weakening evidence labels.

**Architecture:** Add a small typed execution-instruction layer to manual steps, render it in the shared step sections, and project the selected sterilization arm into one readable beginner path. Keep legacy string actions for all unaffected steps and preserve the existing calculators as the source of truth for chemistry math.

**Tech Stack:** Next.js 16, React, TypeScript, Vitest, existing CSS tokens and manual/trial domain modules.

## Global Constraints

- Do not hardcode a volume for `% w/w` Haiter without preserving the label basis.
- Keep Control-A, T1, T2, and T3 visibly distinct.
- Do not change evidence levels or claim direct evidence for Violin variegated.
- Existing manual steps without execution instructions must remain backward compatible.
- Verify with unit tests, full tests, lint, build, UI verification, and a browser smoke check.

---

### Task 1: Add typed beginner execution instructions

**Files:**
- Modify: `src/lib/manual/types.ts`
- Test: `src/lib/manual/types.test.ts` or the closest existing manual type/domain test file

**Interfaces:**
- Produce `ExecutionInstruction` and `executionInstructions?: ExecutionInstruction[]` on `ManualStepDef`.
- Support `label`, `action`, optional `materials`, `container`, `durationMinutes`, `completion`, and `tone` fields.

- [ ] Write a failing test proving a resolved step can carry and preserve an execution instruction.
- [ ] Run the focused test and observe the expected type/shape failure.
- [ ] Add the minimal types and clone/resolve support.
- [ ] Run the focused test again.
- [ ] Commit the typed model change.

### Task 2: Render execution instructions with visible hierarchy

**Files:**
- Modify: `src/components/rounds/step-section.tsx`
- Modify: `src/app/globals.css`
- Test: `src/components/rounds/step-section.test.tsx`

**Interfaces:**
- Consume `step.executionInstructions`.
- Render a “ทำตามลำดับ” block before legacy actions when instructions exist.
- Show container, quantity, time, and completion as separate readable lines.

- [ ] Add failing render tests for action, container, duration, and completion.
- [ ] Run the focused component test and verify it fails because the new block is absent.
- [ ] Implement the semantic instruction list and responsive CSS.
- [ ] Run focused tests and inspect mobile/desktop class behavior.
- [ ] Commit the renderer change.

### Task 3: Add an executable sterilization path for Violin variegated

**Files:**
- Modify: `src/lib/manual/species/violin-variegated.ts`
- Modify: `src/lib/trials/project-trial-steps.ts` if arm-specific values are needed
- Test: `src/components/guide/step-detail.test.tsx`
- Test: `src/lib/trials/project-trial-steps.test.ts`

**Interfaces:**
- Consume the selected arm/project values already used by the trial runner.
- Produce one beginner-readable sequence for the guide baseline and arm-specific sequence for an active trial.

- [ ] Add failing tests asserting S/R1/R2/R3/F labels, explicit rinse count, and explicit one-minute rinse duration.
- [ ] Run focused tests and verify they fail on the current prose-only actions.
- [ ] Replace the multi-branch paragraph with explicit instructions and keep uncertainty in a separate note.
- [ ] Ensure T1/T2 say “น้ำล้างคลอรีนต่ำ 300 ppm” and Control-A says “น้ำปลอดเชื้อ”.
- [ ] Ensure the dose calculator remains the source for user-specific stock volumes rather than inventing static volumes.
- [ ] Run focused tests.
- [ ] Commit the sterilization content change.

### Task 4: Add preflight and calculator-context copy

**Files:**
- Modify: `src/components/guide/bracket-notice.tsx`
- Modify: `src/components/rounds/sterilization-method-banner.tsx`
- Test: `src/components/guide/bracket-notice.test.tsx`
- Test: `src/components/rounds/sterilization-method-banner.test.tsx`

**Interfaces:**
- Consume existing bracket and rinse preparation data.
- Render protocol selection, vessel count, volume per vessel, and the distinction between sterile water and experimental chlorinated rinse.

- [ ] Add failing tests for explicit vessel labels and the “not sterile water” distinction.
- [ ] Run focused tests and verify the current vague copy fails.
- [ ] Implement concise preflight copy and move long caveats behind explanatory text.
- [ ] Run focused tests.
- [ ] Commit the preflight change.

### Task 5: Verify the complete beginner flow

**Files:**
- Modify: `scripts/verify-accessible-ui.mjs` only if a new visible control needs coverage
- Test: existing suite

- [ ] Run focused tests for manual, guide, and trial modules.
- [ ] Run `npm test`.
- [ ] Run `npm run lint`.
- [ ] Run `npm run build`.
- [ ] Run `npm run ui:verify`.
- [ ] Start the dev server and run the required browser smoke check for `/guide/violin-variegated/step/8`.
- [ ] Review the rendered page at mobile and desktop widths for text overflow and contrast.
- [ ] Commit any verification-only fixes, then report remaining scientific uncertainties separately.

