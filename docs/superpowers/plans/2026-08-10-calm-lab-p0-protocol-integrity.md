# Calm Lab P0 Protocol Integrity Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make every round render and persist only the medium, surface-sterilization, and rinse methods locked to that round, with complete preparation records and no R4 for T1/T2.

**Architecture:** Add a backward-compatible preparation contract to the round snapshot, construct it from reviewed equipment data, and resolve round steps through one pure method-aware resolver before React renders them. Persist calculator-confirmed actual values by updating the whole sterilization snapshot through the repository rather than mutating UI-only state.

**Tech Stack:** Next.js App Router 16.2.11, React 19.2.4, TypeScript 5, Vitest 4, Firebase/Firestore and the existing in-memory repository.

## Global Constraints

- Read the relevant local Next.js 16 documentation under `node_modules/next/dist/docs/` before changing App Router or font behavior.
- T1/T2 use chlorinated rinse 300 ppm for three rounds of about one minute and have no final sterile-water rinse or R4.
- A method not selected for the round must not appear in materials, actions, execution instructions, calculators, or troubleshooting.
- Equipment profile data is a starting point; changing the profile after round creation must not mutate the locked round snapshot.
- `planned` is not evidence that a preparation was made; only `prepared` or `verified` can satisfy preparation readiness.
- Preserve legacy lots and existing repository methods; normalize missing fields instead of inventing evidence.
- Do not change scientific concentrations or timings beyond the approved product behavior. Flag scientific validation separately.
- Add no runtime dependency.

---

### Task 1: Define and normalize complete preparation snapshots

**Files:**
- Modify: `src/lib/domain/models.ts:113-203`
- Modify: `src/lib/domain/experiment-migration.ts:1-50`
- Modify: `src/lib/domain/experiment-migration.test.ts`

**Interfaces:**
- Produces `PreparationStatus`, `DoseValue`, and `ChemicalPreparationSnapshot`.
- Extends `LotSterilizationSnapshot` with `mediumPreparation?` and `surfacePreparation?` while preserving legacy scalar fields.
- Extends `RinseWaterSnapshot.status` to the same `PreparationStatus` and adds audit timestamps/dose fields without removing existing fields.

- [ ] **Step 1: Write failing normalization tests**

```ts
it("preserves complete locked preparation records", () => {
  const lot = normalizeExperimentLot({
    ...legacyLot,
    sterilization: {
      profileId: "haiter-chemical-v1",
      profileVersion: "1.0.0",
      method: "haiter-chemical",
      mediumPreparation: {
        method: "nadcc-chemical",
        protocolVersion: "nadcc-medium-v1",
        status: "verified",
        productName: "NaDCC tablet",
        batchOrLot: "N-42",
        labelConcentration: 60,
        labelBasis: "available-chlorine",
        targetPpm: 300,
        actualPpm: 297,
        calculatedDose: { value: 0.1515, unit: "g" },
        actualDose: { value: 0.152, unit: "g" },
        finalVolumeMl: 1000,
        preparedAt: "2026-08-10T09:00:00.000Z",
        confirmedAt: "2026-08-10T09:10:00.000Z",
        lockedAt: "2026-08-10T09:10:00.000Z",
      },
    },
  });
  expect(lot.sterilization?.mediumPreparation?.actualPpm).toBe(297);
  expect(lot.sterilization?.mediumPreparation?.status).toBe("verified");
});

it("normalizes legacy rinse data to planned without fabricating timestamps", () => {
  const lot = normalizeExperimentLot({ ...legacyLot, sterilization: legacySterilization });
  expect(lot.sterilization?.rinseWater?.status).toBe("planned");
  expect(lot.sterilization?.rinseWater?.confirmedAt).toBeUndefined();
  expect(lot.sterilization?.mediumPreparation).toBeUndefined();
});
```

- [ ] **Step 2: Run the migration test and verify it fails**

Run: `npm test -- src/lib/domain/experiment-migration.test.ts`

Expected: FAIL because `verified`, `ChemicalPreparationSnapshot`, and the new snapshot fields do not exist.

- [ ] **Step 3: Add the preparation types and explicit legacy normalization**

```ts
export type PreparationStatus = "planned" | "prepared" | "verified";
export type RinsePreparationStatus = PreparationStatus;
export type DoseValue = { value: number; unit: "mL" | "g" | "tablet" };
export type ChemicalPreparationSnapshot = {
  method: MediumSterilizationMethod | SterilizationMethod | RinseWaterMethod;
  protocolVersion: string;
  status: PreparationStatus;
  productName?: string;
  batchOrLot?: string;
  labelConcentration?: number;
  labelBasis?: "w/w" | "w/v" | "available-chlorine";
  targetPpm?: number;
  actualPpm?: number;
  calculatedDose?: DoseValue;
  actualDose?: DoseValue;
  stockVolumeMl?: number;
  finalVolumeMl?: number;
  containerCount?: number;
  preparedAt?: string;
  confirmedAt?: string;
  lockedAt: string;
};
```

Add `mediumPreparation?: ChemicalPreparationSnapshot` and `surfacePreparation?: ChemicalPreparationSnapshot` to `LotSterilizationSnapshot`. Extend `RinseWaterSnapshot` with `protocolVersion?`, `calculatedDose?`, `actualDose?`, `confirmedAt?`, and `lockedAt?`. In migration, keep a legacy rinse `planned` unless its stored status is exactly `prepared` or `verified`; never synthesize `preparedAt`, `confirmedAt`, or `lockedAt`.

- [ ] **Step 4: Run model and repository regression tests**

Run: `npm test -- src/lib/domain/experiment-migration.test.ts src/lib/repositories/memory-experiment-repository.test.ts src/lib/firebase/firestore-experiment-repository.test.ts`

Expected: PASS with legacy and complete snapshots round-tripping unchanged.

- [ ] **Step 5: Commit the contract**

```bash
git add src/lib/domain/models.ts src/lib/domain/experiment-migration.ts src/lib/domain/experiment-migration.test.ts
git commit -m "feat: define locked preparation snapshots"
```

---

### Task 2: Build reviewed round setup snapshots and capability-driven choices

**Files:**
- Modify: `src/lib/equipment/equipment-profile.ts:35-76`
- Modify: `src/lib/equipment/equipment-profile.test.ts`
- Modify: `src/lib/rounds/round-setup.ts`
- Modify: `src/lib/rounds/round-setup.test.ts`
- Modify: `src/components/rounds/round-setup.tsx`
- Modify: `src/components/rounds/round-setup.test.tsx`
- Modify: `src/app/my/rounds/new/page.tsx:48-61`

**Interfaces:**
- Produces `buildRoundSetupInput(selection, profile, lockedAt): RoundSetupInput`.
- `RoundSetupInput` contains `chemistry`, `lockedAt`, `mediumPreparation`, `surfacePreparation`, and optional selected `rinseWater`.
- Consumes `resolvePath(profile)` to enable pressure sterilization only when the profile owns a compatible pressure method.

- [ ] **Step 1: Write failing domain and component tests**

```ts
it("copies the selected prepared rinse and locks it to the round", () => {
  const input = buildRoundSetupInput(
    { mediumMethod: "nadcc-chemical", surfaceMethod: "haiter-chemical", rinseMethod: "nadcc" },
    { ...USER_REPORTED_PROFILE, rinseWater: { ...USER_REPORTED_PROFILE.rinseWater, nadcc: preparedNadcc } },
    "2026-08-10T10:00:00.000Z",
  );
  expect(input.rinseWater).toMatchObject({ status: "prepared", batchOrLot: "N-1", lockedAt: "2026-08-10T10:00:00.000Z" });
  expect(input.mediumPreparation.method).toBe("nadcc-chemical");
});

it("enables pressure sterilization when equipment capability exists", () => {
  const profile: EquipmentProfileV2 = { ...USER_REPORTED_PROFILE, owned: ["lab-autoclave", "heat-resistant-vessels"] };
  const html = renderToStaticMarkup(<RoundSetup profile={profile} manual={manual} onConfirm={noop} onBack={noop} />);
  expect(html).toContain('data-method="pressure-sterilization"');
  expect(html).not.toContain("ยังไม่มีอุปกรณ์");
});

it("does not promise an R4 for chlorinated rinse", () => {
  const html = renderToStaticMarkup(<RoundSetup profile={USER_REPORTED_PROFILE} manual={manual} onConfirm={noop} onBack={noop} />);
  expect(html).not.toMatch(/R4|final rinse|ล้างน้ำปลอดเชื้อ.*ต่อ/);
});

it("rejects chlorinated rinse after a NaDCC soak", () => {
  expect(() => buildRoundSetupInput(
    { mediumMethod: "nadcc-chemical", surfaceMethod: "nadcc-soak", rinseMethod: "nadcc" },
    USER_REPORTED_PROFILE,
    "2026-08-10T10:00:00.000Z",
  )).toThrow("NaDCC soak ต้องล้างด้วยน้ำปลอดเชื้อ ไม่ใช้ chlorinated rinse ต่อ");
});
```

- [ ] **Step 2: Run focused setup tests and verify they fail**

Run: `npm test -- src/lib/rounds/round-setup.test.ts src/components/rounds/round-setup.test.tsx src/lib/equipment/equipment-profile.test.ts`

Expected: FAIL because setup still creates a fixed planned 50 mL rinse, pressure is hard-coded disabled, and the UI promises R4.

- [ ] **Step 3: Implement the reviewed input builder and profile fields**

Add `batchOrLot` to `chemicals.nadcc` and `chemicals.bleach`, preserving empty-string defaults in `normalizeEquipmentProfile`. Implement:

```ts
export function buildRoundSetupInput(
  selection: RoundSetupSelection,
  profile: EquipmentProfileV2,
  lockedAt: string,
): RoundSetupInput {
  const selectedRinse = selection.rinseMethod === "nadcc"
    ? profile.rinseWater.nadcc
    : selection.rinseMethod === "low-dose-hypochlorite"
      ? profile.rinseWater.lowDoseHypochlorite
      : undefined;
  return {
    ...selection,
    chemistry: chemistryFromProfile(profile),
    lockedAt,
    mediumPreparation: mediumPreparationFromProfile(selection.mediumMethod!, profile, lockedAt),
    surfacePreparation: surfacePreparationFromProfile(selection.surfaceMethod!, profile, lockedAt),
    ...(selectedRinse ? { rinseWater: { ...structuredClone(selectedRinse), lockedAt } } : {}),
  };
}
```

When no prepared rinse exists, create a `planned` selected rinse with the chosen per-container volume; do not mark it prepared. Derive pressure availability from the `sterile-medium` result of `resolvePath(profile)` and remove the R4 sentence from both chlorinated-rinse choices. When `surfaceMethod === "nadcc-soak"`, disable both chlorinated-rinse options, explain that the soak is followed by three sterile-water rinses, and reject an incompatible programmatic input in `buildRoundSetupInput`.

- [ ] **Step 4: Route the reviewed input into lot creation**

Change `RoundSetup` to call `buildRoundSetupInput(selection, draftProfile, new Date().toISOString())` and pass that result with the draft profile. Change `buildRoundSterilizationSnapshot` to accept the complete `RoundSetupInput` rather than rebuilding data from chemistry. Run:

`npm test -- src/lib/rounds/round-setup.test.ts src/components/rounds/round-setup.test.tsx src/lib/rounds/round-adapter.test.ts src/lib/equipment/equipment-profile.test.ts`

Expected: PASS; a round contains copied preparation records and profile changes after creation cannot mutate them.

- [ ] **Step 5: Commit setup snapshot creation**

```bash
git add src/lib/equipment/equipment-profile.ts src/lib/equipment/equipment-profile.test.ts src/lib/rounds/round-setup.ts src/lib/rounds/round-setup.test.ts src/components/rounds/round-setup.tsx src/components/rounds/round-setup.test.tsx src/app/my/rounds/new/page.tsx src/lib/rounds/round-adapter.ts src/lib/rounds/round-adapter.test.ts
git commit -m "fix: lock reviewed preparation data to rounds"
```

---

### Task 3: Resolve instructions from the locked method

**Files:**
- Create: `src/lib/rounds/sterilization-plan.ts`
- Create: `src/lib/rounds/sterilization-plan.test.ts`
- Modify: `src/lib/rounds/round-adapter.ts:68-113`
- Modify: `src/lib/rounds/round-adapter.test.ts`
- Modify: `src/components/rounds/step-runner.tsx:165-180`
- Modify: `src/components/rounds/step-runner.test.tsx`
- Delete after consumers move: `src/components/rounds/sterilization-method-banner.tsx`
- Delete after consumers move: `src/components/rounds/sterilization-method-banner.test.tsx`

**Interfaces:**
- Produces `resolveSterilizationStep(step, snapshot): ResolvedStep`.
- Consumes the locked `LotSterilizationSnapshot` produced by Task 2.
- `buildRoundView()` returns steps whose materials, actions, instructions, measurements, and troubleshooting already match the round.

- [ ] **Step 1: Write a method matrix as failing pure tests**

```ts
it.each([
  ["haiter-chemical", "Haiter", "NaDCC ในอาหาร"],
  ["nadcc-chemical", "NaDCC", "121°C"],
  ["pressure-sterilization", "121°C", "NaDCC ในอาหาร"],
] as const)("prep-media resolves only %s", (method, included, excluded) => {
  const resolved = resolveSterilizationStep(prepMedia, snapshot({ mediumSterilizationMethod: method }));
  const text = JSON.stringify(resolved);
  expect(text).toContain(included);
  expect(text).not.toContain(excluded);
});

it.each(["nadcc", "low-dose-hypochlorite"] as const)("%s rinse has R1-R3 and no R4", (method) => {
  const resolved = resolveSterilizationStep(sterilize, snapshot({ rinseMethod: method }));
  const text = JSON.stringify(resolved);
  expect(text).toMatch(/R1/);
  expect(text).toMatch(/R3/);
  expect(text).not.toMatch(/R4|final rinse/);
});

it("nadcc soak removes every Haiter action and material", () => {
  const resolved = resolveSterilizationStep(sterilize, snapshot({ method: "nadcc-soak" }));
  expect(JSON.stringify(resolved)).not.toMatch(/Haiter|NaOCl/);
});
```

- [ ] **Step 2: Run the resolver test and verify it fails**

Run: `npm test -- src/lib/rounds/sterilization-plan.test.ts`

Expected: FAIL because the resolver module does not exist.

- [ ] **Step 3: Implement explicit instruction factories and resolve before render**

```ts
export function resolveSterilizationStep(
  step: ResolvedStep,
  snapshot?: LotSterilizationSnapshot,
): ResolvedStep {
  if (!snapshot || !["prep-media", "sterilize"].includes(step.id)) return structuredClone(step);
  if (step.id === "prep-media") return withMediumMethod(step, snapshot);
  return withSurfaceAndRinseMethod(step, snapshot);
}
```

Each factory must replace, not prepend to, the method-specific `materials`, `actions`, `executionInstructions`, and measurements. Preserve neutral safety rules and evidence metadata. In `buildRoundView`, run trial projection first and then apply the resolver to non-blank steps so trial-specific steps remain locked to their arm.

- [ ] **Step 4: Remove the banner workaround and run rendering regressions**

Remove `SterilizationMethodBanner` from `StepRunner`; add assertions that rendered `StepSections` contain only the resolved instructions. Run:

`npm test -- src/lib/rounds/sterilization-plan.test.ts src/lib/rounds/round-adapter.test.ts src/components/rounds/step-runner.test.tsx src/components/rounds/step-section.test.tsx src/lib/trials/project-trial-steps.test.ts`

Expected: PASS; no banner asks users to ignore instructions below it.

- [ ] **Step 5: Commit method-aware protocol resolution**

```bash
git add src/lib/rounds/sterilization-plan.ts src/lib/rounds/sterilization-plan.test.ts src/lib/rounds/round-adapter.ts src/lib/rounds/round-adapter.test.ts src/components/rounds/step-runner.tsx src/components/rounds/step-runner.test.tsx src/components/rounds/step-section.test.tsx
git rm src/components/rounds/sterilization-method-banner.tsx src/components/rounds/sterilization-method-banner.test.tsx
git commit -m "fix: resolve round instructions from locked methods"
```

---

### Task 4: Persist in-protocol chemical calculations and actual values

**Files:**
- Create: `src/components/rounds/chemical-preparation.tsx`
- Create: `src/components/rounds/chemical-preparation.test.tsx`
- Modify: `src/components/calculators/haiter-calculator.tsx:30-38`
- Modify: `src/components/calculators/nadcc-calculator.tsx:27-32`
- Modify: `src/components/rounds/step-runner.tsx`
- Modify: `src/components/rounds/step-runner.test.tsx`
- Modify: `src/app/my/rounds/[roundId]/step/[step]/page.tsx`
- Modify: `src/lib/repositories/experiment-repository.ts:1-17`
- Modify: `src/lib/repositories/memory-experiment-repository.ts:78-111`
- Modify: `src/lib/repositories/memory-experiment-repository.test.ts`
- Modify: `src/lib/firebase/firestore-experiment-repository.ts:133-161`
- Modify: `src/lib/firebase/firestore-experiment-repository.test.ts`

**Interfaces:**
- `HaiterCalculator` and `NadccCalculator` produce their current valid plan through `onPlanChange` without changing standalone calculator behavior.
- `ChemicalPreparation` consumes `stepId` and `LotSterilizationSnapshot` and emits a complete updated snapshot through `onConfirm`.
- `ExperimentRepository.updateSterilization(ownerId, lotId, sterilization)` persists and audits the complete snapshot; `updateRinseWater` remains as a compatibility wrapper.

- [ ] **Step 1: Write failing repository and component tests**

```ts
it("audits a complete sterilization snapshot update", async () => {
  await repo.createLot("owner-1", lot);
  const updated = await repo.updateSterilization("owner-1", lot.id, {
    ...lot.sterilization!,
    mediumPreparation: verifiedMediumPreparation,
  });
  expect(updated.sterilization?.mediumPreparation?.actualDose).toEqual({ value: 1.2, unit: "mL" });
  expect((await repo.listAuditEvents("owner-1", lot.id)).at(-1)?.action).toBe("updated");
});

it("shows only the calculator required by the locked method", () => {
  const html = renderToStaticMarkup(<ChemicalPreparation stepId="prep-media" sterilization={nadccSnapshot} onConfirm={noop} />);
  expect(html).toContain("NaDCC");
  expect(html).not.toContain("ไฮเตอร์ / สารฟอกฆ่าเชื้อ");
});
```

- [ ] **Step 2: Run focused tests and verify they fail**

Run: `npm test -- src/components/rounds/chemical-preparation.test.tsx src/lib/repositories/memory-experiment-repository.test.ts src/lib/firebase/firestore-experiment-repository.test.ts`

Expected: FAIL because neither the component nor full-snapshot repository mutation exists.

- [ ] **Step 3: Expose calculator plans and build the confirmation form**

Add typed callbacks:

```ts
type HaiterCalculatorProps = {
  initialInput?: Partial<HaiterAutoInput>;
  initialLabelBasis?: LabelBasis;
  onPlanChange?: (plan: HaiterAutoResult | null) => void;
};

type NadccCalculatorProps = {
  initialInput?: Partial<NadccAutoInput>;
  onPlanChange?: (plan: NadccAutoResult | null) => void;
};
```

`ChemicalPreparation` must prefill from the locked record, show calculated beside actual dose, require product/batch/final volume/prepared date for `prepared`, require actual ppm for `verified`, and preserve values after validation failure. It must not render a selector for a different method.

- [ ] **Step 4: Persist through the page and reload the round view**

Implement `updateSterilization` in memory and Firestore repositories with the same owner checks, timestamps, and audit event as `updateRinseWater`. Pass an async `onConfirmPreparation` from the round step page to `StepRunner`, call the repository mutation, and increment `reloadKey` only after success. Run:

`npm test -- src/components/rounds/chemical-preparation.test.tsx src/components/rounds/step-runner.test.tsx src/lib/repositories/memory-experiment-repository.test.ts src/lib/firebase/firestore-experiment-repository.test.ts`

Expected: PASS; calculator output and actual values survive a view reload.

- [ ] **Step 5: Commit in-protocol preparation persistence**

```bash
git add src/components/rounds/chemical-preparation.tsx src/components/rounds/chemical-preparation.test.tsx src/components/calculators/haiter-calculator.tsx src/components/calculators/nadcc-calculator.tsx src/components/rounds/step-runner.tsx src/components/rounds/step-runner.test.tsx 'src/app/my/rounds/[roundId]/step/[step]/page.tsx' src/lib/repositories/experiment-repository.ts src/lib/repositories/memory-experiment-repository.ts src/lib/repositories/memory-experiment-repository.test.ts src/lib/firebase/firestore-experiment-repository.ts src/lib/firebase/firestore-experiment-repository.test.ts
git commit -m "feat: persist protocol chemical preparations"
```

---

### Task 5: Separate BA and BAP stock mapping

**Files:**
- Create: `src/lib/domain/hormone-stock-mapping.ts`
- Create: `src/lib/domain/hormone-stock-mapping.test.ts`
- Modify: `src/lib/equipment/resolve-path.ts:4-14`
- Modify: `src/lib/equipment/equipment-profile.ts:62-71`
- Modify: `src/components/equipment/profile-section.tsx:145-170`
- Modify: `src/components/equipment/profile-section.test.tsx`
- Modify: `src/components/rounds/medium-calculator.tsx:103-153,196-203`
- Modify: `src/components/rounds/medium-calculator.test.tsx`
- Modify: `src/lib/domain/medium-batch-calculations.ts`
- Modify: `src/lib/domain/medium-batch-calculations.test.ts`

**Interfaces:**
- Produces `HormoneStockId = "ba" | "bap" | "naa" | "iba"` and `stockIdForIngredient(name): HormoneStockId | null`.
- Adds separate `baStockMgPerMl?` and `bapStockMgPerMl?` inputs while preserving legacy `baMgPerMl` normalization.
- Medium calculation selects a stock only through the exact mapping helper.

- [ ] **Step 1: Write exact-name mapping and UI tests**

```ts
it.each([
  ["BA", "ba"],
  ["6-BA", "ba"],
  ["BAP", "bap"],
  ["6-BA (BAP)", "bap"],
  ["IBA", "iba"],
] as const)("maps %s to %s stock", (name, stock) => {
  expect(stockIdForIngredient(name)).toBe(stock);
});

it("renders BA and BAP as separate labelled stocks", () => {
  const html = renderToStaticMarkup(<MediumCalculator recipes={recipes} tools={tools} />);
  expect(html).toContain("BA stock");
  expect(html).toContain("BAP stock");
  expect(html).toContain("ตรวจชื่อบนฉลากให้ตรงกับชื่อในสูตร");
  expect(html).not.toContain("BA/BAP stock");
});
```

- [ ] **Step 2: Run hormone and medium tests and verify they fail**

Run: `npm test -- src/lib/domain/hormone-stock-mapping.test.ts src/components/rounds/medium-calculator.test.tsx src/lib/domain/medium-batch-calculations.test.ts`

Expected: FAIL because there is one combined BA/BAP input and no mapping helper.

- [ ] **Step 3: Implement exact stock mapping and compatibility normalization**

```ts
export function stockIdForIngredient(name: string): HormoneStockId | null {
  const normalized = name.trim().toUpperCase();
  if (normalized === "BA" || normalized === "6-BA") return "ba";
  if (normalized === "BAP" || normalized === "6-BA (BAP)") return "bap";
  if (normalized === "NAA") return "naa";
  if (normalized === "IBA") return "iba";
  return null;
}
```

Normalize legacy `baMgPerMl` into `baStockMgPerMl` only; do not copy it into BAP. Add separate equipment fields and feed both values to the medium planner.

- [ ] **Step 4: Run equipment, calculator, and registry regressions**

Run: `npm test -- src/lib/domain/hormone-stock-mapping.test.ts src/components/equipment/profile-section.test.tsx src/components/rounds/medium-calculator.test.tsx src/lib/domain/medium-batch-calculations.test.ts src/lib/manual/registry.test.ts`

Expected: PASS; every recipe ingredient uses the explicitly matched stock field.

- [ ] **Step 5: Commit hormone stock mapping**

```bash
git add src/lib/domain/hormone-stock-mapping.ts src/lib/domain/hormone-stock-mapping.test.ts src/lib/equipment/resolve-path.ts src/lib/equipment/equipment-profile.ts src/components/equipment/profile-section.tsx src/components/equipment/profile-section.test.tsx src/components/rounds/medium-calculator.tsx src/components/rounds/medium-calculator.test.tsx src/lib/domain/medium-batch-calculations.ts src/lib/domain/medium-batch-calculations.test.ts
git commit -m "fix: separate BA and BAP stock mapping"
```

---

### Task 6: Add the protocol-integrity browser matrix

**Files:**
- Modify: `scripts/verify-accessible-ui.mjs`
- Create: `scripts/verify-protocol-integrity.mjs`
- Modify: `package.json`
- Modify: `src/lib/manual/protocol-completeness.test.ts`

**Interfaces:**
- Produces `npm run protocol:verify` for demo-mode browser verification.
- The script reports route, viewport, theme, method tuple, and last completed action when it fails.

- [ ] **Step 1: Add a failing static completeness assertion**

```ts
it("generic manual instructions never tell a locked round to choose externally", () => {
  for (const slug of allSlugs()) {
    const text = JSON.stringify(resolveBySlug(slug)?.steps ?? []);
    expect(text).not.toContain("ห้ามเปิดเครื่องคำนวณแยกจาก protocol");
  }
});
```

- [ ] **Step 2: Run completeness tests and record the expected failure**

Run: `npm test -- src/lib/manual/protocol-completeness.test.ts`

Expected: FAIL until the old external-calculator instruction is removed by the resolver work.

- [ ] **Step 3: Implement the browser method matrix**

In `verify-protocol-integrity.mjs`, enter demo mode once and navigate by client-side links so the in-memory demo session persists. For each tuple below, create a round, open `prep-media` and `sterilize`, and assert included/excluded text:

```js
const cases = [
  { medium: "pressure-sterilization", surface: "haiter-chemical", rinse: "commercial-sterile" },
  { medium: "haiter-chemical", surface: "haiter-chemical", rinse: "low-dose-hypochlorite" },
  { medium: "nadcc-chemical", surface: "nadcc-soak", rinse: "commercial-sterile" },
];
```

For chlorinated rinse, assert R1, R2, and R3 are present and `/R4|final rinse/` is absent. After confirming preparation values, reload the view and assert product, batch, actual dose, final volume, prepared date, and actual ppm are unchanged.

- [ ] **Step 4: Add the package command and run the P0 gate**

Add `"protocol:verify": "node scripts/verify-protocol-integrity.mjs"` to `package.json`. Run:

Run these commands separately:

```text
npm test
npm run lint
npm run build
npm run protocol:verify
git diff --check
```

Expected: every command exits 0. Browser failure output names the exact method tuple and route rather than a generic timeout.

- [ ] **Step 5: Commit the P0 verification gate**

```bash
git add scripts/verify-accessible-ui.mjs scripts/verify-protocol-integrity.mjs package.json src/lib/manual/protocol-completeness.test.ts
git commit -m "test: verify locked protocol methods end to end"
```
