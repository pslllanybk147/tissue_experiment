# Medium Chemistry Audit Fix Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use inline execution with the TDD cycle task-by-task.

**Goal:** Make medium, stock-solution, bleach, anti-browning, and evidence displays use the user's real equipment and explicit units without silently substituting incompatible values.

**Architecture:** Keep recipe data in the existing manual registry, but add explicit base-rate metadata and optional supporting-media recipes. Pass a complete chemistry profile into the existing client calculator instead of hard-coding concentrations. Preserve existing evidence levels and expose them through small reusable UI labels.

**Tech Stack:** TypeScript, React 19 client components, Next.js App Router 16.2.11, Vitest 4.

## Global Constraints

- MS basal salts must never be used as a fallback rate for BCD/BCDAT.
- The user's Haiter label is 6% w/w and must be converted before C1V1 = C2V2.
- NAA, BA, and IBA calculations must use the stored stock concentration for the matching hormone.
- Adapted and unsupported recipes must remain visibly experimental.
- Vitamin C, citric acid, PVP, and charcoal values are experimental ranges, not Violin-specific protocols.
- Do not add mercury-based procedures or pretend unavailable chemicals are in inventory.
- Every production behavior change requires a failing regression test before implementation.

---

### Task 1: Make the calculator's chemistry inputs explicit

**Files:**
- Modify: `src/lib/manual/types.ts`
- Modify: `src/lib/rounds/medium-plan.ts`
- Modify: `src/lib/equipment/resolve-path.ts`
- Modify: `src/lib/equipment/equipment-profile.ts`
- Test: `src/lib/rounds/medium-plan.test.ts`
- Test: `src/lib/equipment/equipment-profile.test.ts`

**Interfaces:**
- `MediaIngredient` gains an explicit base identifier for ratio ingredients and supports exact BCDAT units already represented by the existing ingredient model.
- `ToolLimits` gains `bcdLabelRateGPerL`, `naaStockMgPerMl`, `baStockMgPerMl`, and `ibaStockMgPerMl`.
- `planMediumBatch()` chooses the stock concentration by normalized hormone name and returns a clear blocked line when the matching stock is missing.

- [ ] Write tests proving a BCD ingredient does not use `msLabelRateGPerL`.
- [ ] Run `npm test -- src/lib/rounds/medium-plan.test.ts src/lib/equipment/equipment-profile.test.ts --run` and confirm the new assertions fail against the current implementation.
- [ ] Implement explicit base-rate selection and hormone stock selection with no fallback from BCD to MS and no fallback from a missing hormone stock to 1 mg/mL.
- [ ] Run the focused tests and confirm they pass.

### Task 2: Pass the real chemistry profile through every calculator entry point

**Files:**
- Modify: `src/components/rounds/medium-calculator.tsx`
- Modify: `src/components/rounds/step-runner.tsx`
- Modify: `src/app/my/rounds/[roundId]/step/[step]/page.tsx`
- Modify: `src/components/calculators/calculator-overlay.tsx`
- Test: `src/components/rounds/medium-calculator.test.tsx`
- Test: `src/components/calculators/calculator-overlay.test.tsx`

**Interfaces:**
- Calculator props accept the expanded `ToolLimits` object.
- Profile values are serialized as props from the server page and are used by both public overlay and active-round calculator.

- [ ] Add a failing component test showing a BA stock other than 1 mg/mL changes the displayed mL dose.
- [ ] Run the focused component tests and confirm the test fails because the current component only receives scale, pipette, and MS rate.
- [ ] Thread the profile values through the page, runner, overlay, and calculator state key.
- [ ] Add visible labels showing which stock concentration was used.
- [ ] Run focused component tests and confirm they pass.

### Task 3: Correct Haiter basis defaults and profile propagation

**Files:**
- Modify: `src/lib/domain/haiter-calculations.ts`
- Modify: `src/components/calculators/haiter-calculator.tsx`
- Modify: `src/components/calculators/calculator-overlay.tsx`
- Test: `src/lib/domain/haiter-calculations.test.ts`
- Test: `src/components/calculators/haiter-calculator.test.tsx`

- [ ] Add a failing test that a 6% w/w profile opens with w/w selected and calculates using 6.48% w/v under the documented density assumption.
- [ ] Run the focused tests and confirm the default currently starts as w/v.
- [ ] Add a serializable calculator input for label basis and density, defaulting from the equipment profile.
- [ ] Keep the density assumption visible and ensure direct/working dilution results use the converted source concentration.
- [ ] Run focused tests and confirm they pass.

### Task 4: Add a reusable anti-browning dose calculator and recipe metadata

**Files:**
- Create: `src/lib/domain/anti-browning-calculations.ts`
- Create: `src/lib/domain/anti-browning-calculations.test.ts`
- Create: `src/components/calculators/anti-browning-calculator.tsx`
- Create: `src/components/calculators/anti-browning-calculator.test.tsx`
- Modify: `src/components/calculators/calculator-overlay.tsx`
- Modify: `src/lib/manual/substances.ts`
- Modify: `src/lib/manual/troubleshooting.ts`

- [ ] Write failing tests for mg/L and g/L conversion, total mass calculation, and an experimental-source warning.
- [ ] Run the new focused test and confirm it fails because the module/component does not exist.
- [ ] Implement the smallest pure calculator API: substance, target concentration, final volume, unit, and result mass.
- [ ] Render the existing experimental ranges with explicit units, no universal recommendation, and the acid/bleach incompatibility warning.
- [ ] Run focused tests and confirm they pass.

### Task 5: Make BCDAT and species evidence actionable

**Files:**
- Modify: `src/lib/manual/species/christmas-moss.ts`
- Modify: `src/lib/manual/species/java-moss.ts`
- Modify: `src/lib/manual/species/thai-constellation.ts`
- Modify: `src/lib/manual/species/violin-variegated.ts`
- Modify: `src/lib/manual/species/scindapsus-exotica.ts`
- Modify: `src/components/rounds/medium-calculator.tsx`
- Modify: `src/components/guide/step-detail.tsx`
- Test: `src/lib/manual/all-manuals-human.test.ts`
- Test: `src/components/rounds/medium-calculator.test.tsx`

- [ ] Add failing assertions that BCDAT contains explicit component ingredients and that adapted/unsupported recipes render an experimental label.
- [ ] Run the focused manual/UI tests and confirm they fail against the existing opaque BCD and evidence display.
- [ ] Replace the incomplete BCDAT placeholder with explicit source-aligned component entries and keep the recipe marked adapted where appropriate.
- [ ] Add Thai Constellation rooting support-media entries and label Violin establishment as an unsupported experimental control.
- [ ] Keep Scindapsus rooting hidden/blocked until exact amounts exist, while preserving its verified inositol/thiamine values.
- [ ] Run focused manual/UI tests and confirm they pass.

### Task 6: Verify the complete change

**Files:**
- No production file changes planned.

- [ ] Run `npm test -- --run` and record the complete result.
- [ ] Run `npm run lint` and record the complete result.
- [ ] Run `npm run build` and record the complete result.
- [ ] Inspect `git diff --check`, `git status --short`, and the final diff for accidental edits to `human_fix.md` or `new_idea.md`.
- [ ] Report any remaining scientific values that are still explicitly experimental rather than claiming they are validated.
