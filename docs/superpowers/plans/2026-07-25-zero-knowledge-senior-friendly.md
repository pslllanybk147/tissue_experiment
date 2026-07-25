# Zero-Knowledge + Senior-Friendly Guided Lab Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rewrite the complete Guided Protocol and system interface so a first-time user with no plant, tissue-culture, laboratory, unit, or equation knowledge can safely complete each action using readable senior-friendly controls.

**Architecture:** Add a zero-knowledge presentation contract to protocol steps, keep scientific content and evidence metadata in secondary disclosures, and move all derived calculations into pure domain planners. Build accessible reusable instruction, uncertainty, action, and media controls; then apply shared design tokens across the application without changing evidence states or published scientific meaning.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Firebase Auth/Firestore, Cloudinary, Vitest, Firebase Emulator, Vercel, browser verification.

## Global Constraints

- Treat the default user as having no prior plant, tissue-culture, laboratory, equipment, unit, dilution, or safety knowledge.
- Primary instructions must use plain Thai; technical terms must be defined in the same sentence.
- Equations may appear only inside an expandable `เหตุผลทางวิทยาศาสตร์` disclosure.
- The system calculates derived values; missing inputs stop the workflow and must never be guessed.
- Thai body text is at least 18px; labels/helper text at least 16px; metadata at least 14px.
- Interactive targets are at least 48×48px; primary actions at least 56px high; photo actions at least 60px high.
- Normal text and controls meet WCAG 2.2 AA contrast.
- Primary workflows support 200% zoom, 390px, 1024px, 1440px, keyboard-only navigation, and reduced motion.
- Evidence states and scientific sources remain unchanged by copy simplification.
- Every task follows test-first red/green/refactor.
- Every completed milestone updates `handoff.md`, whose first line remains `ต้องมีการบันทึกทุกครั้งที่งานจบ`.
- Before delivery run `npm test`, `npm run lint`, `npm run build`, `npm run firebase:verify`, sandbox browser checks, and authenticated production smoke tests.

---

## File structure

### Domain and content

- Create `src/lib/domain/zero-knowledge-protocol.ts` — presentation contract, terminology checks, content validation, and plain-language helpers.
- Create `src/lib/domain/zero-knowledge-protocol.test.ts` — 22-step content contract and prohibited-primary-copy tests.
- Create `src/lib/domain/haiter-guidance.ts` — user-facing direct-dose and working-dilution action planner.
- Create `src/lib/domain/haiter-guidance.test.ts` — label, tool-limit, direct-dose, dilution, and blocked-path tests.
- Modify `src/lib/domain/models.ts` — add structured beginner instructions and uncertainty paths.
- Modify `src/lib/domain/philodendron-knowledge.ts` — rewrite monograph steps into the structured contract.
- Modify `src/lib/domain/protocol-templates.ts` — preserve the structured contract in generated templates.
- Modify `src/lib/domain/sterilization-profiles.ts` — use calculated action plans and zero-knowledge copy.

### Reusable interface

- Create `src/components/protocols/beginner-step-guide.tsx` — ordered zero-knowledge step presentation.
- Create `src/components/protocols/beginner-step-guide.test.tsx`.
- Create `src/components/common/uncertainty-actions.tsx` — safe `ไม่รู้/ไม่มีอุปกรณ์/ไม่เหมือนตัวอย่าง` branches.
- Create `src/components/common/uncertainty-actions.test.tsx`.
- Create `src/components/common/accessible-action.tsx` — consistent large primary, secondary, destructive, and photo actions.
- Create `src/components/common/accessible-action.test.tsx`.
- Modify `src/components/protocols/guided-protocol-runner.tsx` and its test.
- Modify `src/components/media/media-uploader.tsx`, `media-strip.tsx`, and their tests.

### Application shell and system pages

- Modify `src/app/layout.tsx` — Thai-optimized font and Geist metadata scope.
- Modify `src/app/globals.css` — accessible tokens, typography, focus, controls, zoom, and responsive rules.
- Modify `src/components/lab/lab-shell.tsx` and test — task-language navigation and mobile controls.
- Modify forms and lists under `src/components/experiments`, `src/components/plants`, `src/components/knowledge`, `src/components/research`, `src/components/dataset`, and `src/components/protocols`.
- Modify relevant `src/app/**/page.tsx` files only when page-level labels or state handling cannot live in a component.

### Verification

- Create `src/lib/domain/beginner-simulation.test.ts` — content-level simulation checklist for every composed workflow.
- Create `scripts/verify-accessible-ui.mjs` — browser assertions for target size, font size, overflow, focus, zoom, and reduced motion.
- Modify `package.json` — add `ui:verify`.
- Modify `handoff.md`.

---

### Task 1: Zero-knowledge protocol domain contract

**Files:**
- Create: `src/lib/domain/zero-knowledge-protocol.ts`
- Create: `src/lib/domain/zero-knowledge-protocol.test.ts`
- Modify: `src/lib/domain/models.ts`
- Modify: `src/lib/domain/protocol-validation.ts`
- Test: `src/lib/domain/protocol-validation.test.ts`

**Interfaces:**
- Produces:
  - `BeginnerInstruction`
  - `UncertaintyPath`
  - `validateBeginnerInstruction(step: ProtocolStep): string[]`
  - `primaryInstructionText(step: ProtocolStep): string`
- Consumed by Tasks 2–6.

- [ ] **Step 1: Write the failing domain-contract tests**

```ts
test("rejects unexplained equations in primary instructions", () => {
  const errors = validateBeginnerInstruction(step({
    beginner: {
      currentAction: "ใช้ C1V1 = C2V2",
      doNotDoYet: [],
      whatToFind: [],
      materials: [],
      actions: ["คำนวณเอง"],
      stopConditions: [],
      evidencePrompt: [],
      readyChecklist: [],
      uncertaintyPaths: [],
      scienceNote: "สูตรเจือจาง",
    },
  }));
  expect(errors).toContain("primary_copy_contains_equation");
});

test("requires a safe uncertainty path", () => {
  expect(validateBeginnerInstruction(step({ beginner: validBeginner({ uncertaintyPaths: [] }) })))
    .toContain("missing_uncertainty_path");
});
```

- [ ] **Step 2: Run the focused tests and verify RED**

Run:

```powershell
npx vitest run src/lib/domain/zero-knowledge-protocol.test.ts src/lib/domain/protocol-validation.test.ts
```

Expected: FAIL because the structured types and validator do not exist.

- [ ] **Step 3: Add the structured types**

```ts
export type UncertaintyPath = {
  id: "cannot-find" | "do-not-know" | "missing-equipment" | "unexpected-result" | "stop";
  label: string;
  safeAction: string;
  blocksCompletion: boolean;
};

export type BeginnerInstruction = {
  currentAction: string;
  doNotDoYet: string[];
  whatToFind: string[];
  materials: Array<{ name: string; appearance: string; purpose: string; substitute?: string }>;
  actions: string[];
  stopConditions: string[];
  evidencePrompt: string[];
  readyChecklist: string[];
  uncertaintyPaths: UncertaintyPath[];
  scienceNote: string;
};
```

Add `beginner?: BeginnerInstruction` to `ProtocolStep`.

- [ ] **Step 4: Implement validation without changing evidence semantics**

```ts
const equationPattern = /\bC1V1\b|\bC2V2\b|=|÷|\bppm\b/i;

export function validateBeginnerInstruction(step: ProtocolStep): string[] {
  const value = step.beginner;
  if (!value) return ["missing_beginner_instruction"];
  const errors: string[] = [];
  const primary = [value.currentAction, ...value.actions].join(" ");
  if (equationPattern.test(primary)) errors.push("primary_copy_contains_equation");
  if (!value.actions.length) errors.push("missing_physical_actions");
  if (!value.readyChecklist.length) errors.push("missing_ready_checklist");
  if (!value.uncertaintyPaths.length) errors.push("missing_uncertainty_path");
  if (!value.scienceNote.trim()) errors.push("missing_science_note");
  return errors;
}
```

- [ ] **Step 5: Run focused and full domain tests**

Run:

```powershell
npx vitest run src/lib/domain/zero-knowledge-protocol.test.ts src/lib/domain/protocol-validation.test.ts
```

Expected: PASS.

- [ ] **Step 6: Commit**

```powershell
git add src/lib/domain/models.ts src/lib/domain/zero-knowledge-protocol.ts src/lib/domain/zero-knowledge-protocol.test.ts src/lib/domain/protocol-validation.ts src/lib/domain/protocol-validation.test.ts
git commit -m "Add zero-knowledge protocol contract"
```

---

### Task 2: Rewrite all composed workflows and verify 22-step coverage

**Files:**
- Modify: `src/lib/domain/philodendron-knowledge.ts`
- Modify: `src/lib/domain/philodendron-knowledge.test.ts`
- Modify: `src/lib/domain/protocol-templates.ts`
- Modify: `src/lib/domain/protocol-templates.test.ts`
- Modify: `src/lib/domain/sterilization-profiles.ts`
- Modify: `src/lib/domain/sterilization-profiles.test.ts`
- Create: `src/lib/domain/beginner-simulation.test.ts`

**Interfaces:**
- Consumes `BeginnerInstruction` and `validateBeginnerInstruction`.
- Produces composed Pink Princess Haiter, Pink Princess pressure, Violin Haiter, Violin pressure, and Generic fallback workflows with complete beginner content.

- [ ] **Step 1: Write failing workflow tests**

```ts
const workflows = [
  compose("template-pink-princess-nodal", "haiter-chemical-v1"),
  compose("template-pink-princess-nodal", "pressure-sterilization-v1"),
  compose("template-violin-nodal", "haiter-chemical-v1"),
  compose("template-violin-nodal", "pressure-sterilization-v1"),
];

test.each(workflows)("every step passes beginner simulation", (steps) => {
  expect(steps).toHaveLength(22);
  expect(steps.flatMap(validateBeginnerInstruction)).toEqual([]);
});
```

Also assert that each required journey concept appears exactly once and that equations do not appear in `currentAction` or `actions`.

- [ ] **Step 2: Run and verify RED**

Run:

```powershell
npx vitest run src/lib/domain/beginner-simulation.test.ts
```

Expected: FAIL because current steps lack `beginner` content and profile composition may not total 22.

- [ ] **Step 3: Rewrite steps 1–11**

For each step add complete `beginner` content. Example:

```ts
beginner: {
  currentAction: "หาจุดบนลำต้นที่จะนำไปเพาะ แต่ยังไม่ตัด",
  doNotDoYet: ["อย่าเพิ่งใช้มีดหรือกรรไกรตัดต้น"],
  whatToFind: ["มองหาจุดที่ใบหรือยอดแตกออกจากลำต้น จุดนี้เรียกว่า ‘ข้อของลำต้น (node)’"],
  materials: [{ name: "ป้ายหรือเทปสี", appearance: "ชิ้นเล็กที่ติดใกล้ลำต้นได้", purpose: "ทำเครื่องหมายโดยไม่ทำแผล" }],
  actions: ["ถ่ายรูปด้านข้างของลำต้น", "เลือกข้อที่เห็นตาข้าง", "ติดป้ายใกล้จุดนั้นโดยไม่รัดลำต้น"],
  stopConditions: ["หยุดถ้ามองไม่เห็นตาข้างหรือไม่แน่ใจว่าจุดใดคือข้อ"],
  evidencePrompt: ["ถ่ายรูปให้เห็นยอด ข้อ และป้ายในภาพเดียว"],
  readyChecklist: ["ฉันเห็นข้อและตาข้างชัด", "ฉันยังไม่ได้ตัดต้น"],
  uncertaintyPaths: defaultUncertaintyPaths("ถ่ายรูปเพิ่มและขอให้ตรวจตำแหน่ง"),
  scienceNote: "ข้อของลำต้นมีตาข้างซึ่งสามารถพัฒนาเป็นยอดใหม่ได้",
}
```

- [ ] **Step 4: Rewrite steps 12–22**

Use the same contract. Never copy a scientific paragraph into `actions`; convert it to physical actions and place rationale in `scienceNote`.

- [ ] **Step 5: Normalize profile-specific step count**

Implement an explicit workflow manifest:

```ts
export type GuidedJourney = {
  journeyId: string;
  userVisibleStepCount: 22;
  steps: ProtocolStep[];
};
```

Merge calculation and medium-profile details into the required journey positions instead of silently increasing or dropping user-visible steps. Preserve stable step IDs for existing progress.

- [ ] **Step 6: Run workflow and migration tests**

Run:

```powershell
npx vitest run src/lib/domain/beginner-simulation.test.ts src/lib/domain/philodendron-knowledge.test.ts src/lib/domain/protocol-templates.test.ts src/lib/domain/sterilization-profiles.test.ts src/lib/domain/experiment-migration.test.ts
```

Expected: PASS.

- [ ] **Step 7: Commit**

```powershell
git add src/lib/domain/philodendron-knowledge.ts src/lib/domain/philodendron-knowledge.test.ts src/lib/domain/protocol-templates.ts src/lib/domain/protocol-templates.test.ts src/lib/domain/sterilization-profiles.ts src/lib/domain/sterilization-profiles.test.ts src/lib/domain/beginner-simulation.test.ts
git commit -m "Rewrite guided workflows for zero-knowledge users"
```

---

### Task 3: Replace dilution equations with an action planner

**Files:**
- Create: `src/lib/domain/haiter-guidance.ts`
- Create: `src/lib/domain/haiter-guidance.test.ts`
- Modify: `src/lib/domain/haiter-calculations.ts`
- Modify: `src/lib/domain/haiter-calculations.test.ts`
- Modify: `src/components/experiments/beginner-lot-wizard.tsx`
- Modify: `src/components/experiments/beginner-lot-wizard.test.tsx`

**Interfaces:**
- Produces:
  - `HaiterGuidanceInput`
  - `HaiterActionPlan`
  - `createHaiterActionPlan(input): HaiterActionPlan`
- Consumed by Wizard and Runner.

- [ ] **Step 1: Write failing action-plan tests**

```ts
test("returns a direct physical instruction when measurable", () => {
  expect(createHaiterActionPlan({
    labelPercent: 6,
    targetPercent: 0.003,
    mediumVolumeMl: 1000,
    minimumToolVolumeMl: 0.1,
  })).toMatchObject({
    state: "direct",
    primaryInstruction: "ตวงไฮเตอร์จากขวด 0.50 mL",
  });
});

test("returns a working solution recipe when direct dose is too small", () => {
  const plan = createHaiterActionPlan({
    labelPercent: 6,
    targetPercent: 0.003,
    mediumVolumeMl: 100,
    minimumToolVolumeMl: 0.1,
    permittedDiluent: "น้ำปลอดเชื้อ",
  });
  expect(plan.state).toBe("working-dilution");
  expect(plan.actions).toContain("ตวงไฮเตอร์ 1.00 mL");
  expect(plan.actions).toContain("เติมน้ำปลอดเชื้อ 9.00 mL");
});

test("blocks when the label value is missing", () => {
  expect(createHaiterActionPlan({ labelPercent: null, /* exact remaining fields */ }).state)
    .toBe("blocked");
});
```

- [ ] **Step 2: Run and verify RED**

Run:

```powershell
npx vitest run src/lib/domain/haiter-guidance.test.ts
```

- [ ] **Step 3: Implement the discriminated result**

```ts
export type HaiterActionPlan =
  | { state: "blocked"; reason: string; safeAction: string }
  | { state: "direct"; primaryInstruction: string; doseMl: number; actions: string[]; scienceNote: string }
  | { state: "working-dilution"; primaryInstruction: string; doseMl: number; workingPercent: number; actions: string[]; label: string; scienceNote: string };
```

Use existing calculation functions internally. The primary instruction and actions must not contain `C1V1`, `C2V2`, or unexplained abbreviations.

- [ ] **Step 4: Render the action plan in the Wizard**

Replace formula-first output with:

```tsx
<HaiterPlanCard plan={plan} />
```

The card displays where to find the label value, exact physical actions, tool suitability, and a `หาเปอร์เซ็นต์ไม่เจอ` branch.

- [ ] **Step 5: Run focused tests**

Run:

```powershell
npx vitest run src/lib/domain/haiter-guidance.test.ts src/lib/domain/haiter-calculations.test.ts src/components/experiments/beginner-lot-wizard.test.tsx
```

- [ ] **Step 6: Commit**

```powershell
git add src/lib/domain/haiter-guidance.ts src/lib/domain/haiter-guidance.test.ts src/lib/domain/haiter-calculations.ts src/lib/domain/haiter-calculations.test.ts src/components/experiments/beginner-lot-wizard.tsx src/components/experiments/beginner-lot-wizard.test.tsx
git commit -m "Guide Haiter preparation without user equations"
```

---

### Task 4: Build the accessible beginner step interface

**Files:**
- Create: `src/components/protocols/beginner-step-guide.tsx`
- Create: `src/components/protocols/beginner-step-guide.test.tsx`
- Create: `src/components/common/uncertainty-actions.tsx`
- Create: `src/components/common/uncertainty-actions.test.tsx`
- Create: `src/components/common/accessible-action.tsx`
- Create: `src/components/common/accessible-action.test.tsx`
- Modify: `src/components/protocols/guided-protocol-runner.tsx`
- Modify: `src/components/protocols/guided-protocol-runner.test.tsx`

**Interfaces:**
- `BeginnerStepGuide({ instruction, onUncertainty })`
- `UncertaintyActions({ paths, onSelect })`
- `AccessibleAction({ intent, icon, children, ...buttonProps })`

- [ ] **Step 1: Write failing render and behavior tests**

```tsx
test("renders the zero-knowledge sections in required order", () => {
  const html = renderToStaticMarkup(<BeginnerStepGuide instruction={instruction} />);
  expect(indexes(html, [
    "ตอนนี้กำลังทำอะไร",
    "ตอนนี้ยังห้ามทำอะไร",
    "สิ่งที่ต้องมองหา",
    "ของที่ต้องหยิบ",
    "ทำทีละข้อ",
    "หยุดทันทีถ้า",
    "ตรวจว่าพร้อมไปต่อหรือยัง",
    "เหตุผลทางวิทยาศาสตร์",
  ])).toBeStrictlyIncreasing();
});

test("does not mark a blocking uncertainty as passed", async () => {
  // Select “ฉันไม่มีอุปกรณ์นี้”; assert the completion action stays disabled
});
```

- [ ] **Step 2: Run and verify RED**

Run:

```powershell
npx vitest run src/components/protocols/beginner-step-guide.test.tsx src/components/common/uncertainty-actions.test.tsx src/components/common/accessible-action.test.tsx
```

- [ ] **Step 3: Implement the reusable components**

Render numbered `<ol>` actions, prominent warnings, checkbox-style readiness confirmations, uncertainty buttons, and a native `<details>` science disclosure.

- [ ] **Step 4: Replace GuideBlock/GuideList composition in the runner**

```tsx
<BeginnerStepGuide
  instruction={step.beginner!}
  onUncertainty={(path) => {
    setStatus(path.blocksCompletion ? "Needs review" : status);
    setNote(path.safeAction);
  }}
/>
```

Keep legacy fallback copy only for old published versions missing `beginner`; label it as requiring migration rather than presenting it as beginner-complete.

- [ ] **Step 5: Separate save, confirm, and next actions**

Use explicit labels:

- `บันทึกร่าง`
- `ยืนยันผลของขั้นนี้`
- `ไปขั้นถัดไป`

Do not enable confirmation until required readiness checks and evidence are complete.

- [ ] **Step 6: Run component tests**

Run:

```powershell
npx vitest run src/components/protocols/beginner-step-guide.test.tsx src/components/common/uncertainty-actions.test.tsx src/components/common/accessible-action.test.tsx src/components/protocols/guided-protocol-runner.test.tsx
```

- [ ] **Step 7: Commit**

```powershell
git add src/components/common src/components/protocols/beginner-step-guide.tsx src/components/protocols/beginner-step-guide.test.tsx src/components/protocols/guided-protocol-runner.tsx src/components/protocols/guided-protocol-runner.test.tsx
git commit -m "Build accessible zero-knowledge protocol runner"
```

---

### Task 5: Redesign photo evidence for large, explicit actions

**Files:**
- Modify: `src/components/media/media-uploader.tsx`
- Modify: `src/components/media/media-uploader.test.tsx`
- Modify: `src/components/media/media-strip.tsx`
- Modify: `src/components/media/media-strip.test.tsx`
- Modify: `src/components/protocols/guided-protocol-runner.tsx`
- Test: `src/components/protocols/guided-protocol-runner.test.tsx`

**Interfaces:**
- Add `purpose`, `requiredFrame`, and `actionLabel` props to `MediaUploader`.
- Preserve existing signed-upload, soft-delete, and restore repository APIs.

- [ ] **Step 1: Write failing media-state tests**

```tsx
test("explains why and what to photograph", () => {
  const html = renderToStaticMarkup(
    <MediaUploader
      actionLabel="ถ่ายรูปฉลากไฮเตอร์"
      purpose="ใช้ยืนยันเปอร์เซ็นต์บนฉลาก"
      requiredFrame={["ชื่อผลิตภัณฑ์", "ตัวเลขเปอร์เซ็นต์"]}
      {...requiredProps}
    />,
  );
  expect(html).toContain("ถ่ายรูปฉลากไฮเตอร์");
  expect(html).toContain("ชื่อผลิตภัณฑ์");
  expect(html).toContain("ตัวเลขเปอร์เซ็นต์");
});
```

Add tests for uploading, progress, failure, retry, delete, restore, Escape, and dialog naming.

- [ ] **Step 2: Run and verify RED**

Run:

```powershell
npx vitest run src/components/media/media-uploader.test.tsx src/components/media/media-strip.test.tsx
```

- [ ] **Step 3: Implement explicit media states**

Use a single large visible file action, progress text, success confirmation, retry action, and separated destructive action. Do not expose raw API error text.

- [ ] **Step 4: Connect step-specific photo prompts**

Map `beginner.evidencePrompt` to `purpose` and `requiredFrame`. The runner must explain that a required photo blocks completion before the user presses the action.

- [ ] **Step 5: Run media and runner tests**

- [ ] **Step 6: Commit**

```powershell
git add src/components/media src/components/protocols/guided-protocol-runner.tsx src/components/protocols/guided-protocol-runner.test.tsx
git commit -m "Make protocol photo evidence accessible"
```

---

### Task 6: Introduce the senior-friendly visual system

**Files:**
- Modify: `src/app/layout.tsx`
- Modify: `src/app/globals.css`
- Modify: `src/components/lab/lab-shell.tsx`
- Modify: `src/components/lab/lab-shell.test.tsx`
- Create: `src/components/common/accessibility-contract.test.tsx`

**Interfaces:**
- CSS custom properties:
  - `--font-thai-ui`
  - `--font-metadata`
  - `--text-body: 1.125rem`
  - `--text-label: 1rem`
  - `--text-meta: .875rem`
  - `--target-min: 3rem`
  - `--action-primary: 3.5rem`
  - `--action-photo: 3.75rem`

- [ ] **Step 1: Write failing token and markup tests**

Assert:

- Thai font variable is applied to body.
- Geist remains scoped to `.metadata`, `code`, Lot IDs, and numeric values.
- buttons/inputs expose classes governed by minimum target tokens.
- mobile navigation has an accessible name and current-page state.

- [ ] **Step 2: Run and verify RED**

- [ ] **Step 3: Configure the Thai font**

Use a Thai-optimized sans-serif available through Next font loading or a bundled local font. Define an explicit fallback chain:

```css
--font-thai-ui: var(--font-thai), "Noto Sans Thai", "Leelawadee UI", Tahoma, sans-serif;
```

Do not rely on Geist for Thai instructional text.

- [ ] **Step 4: Add accessible global tokens and base controls**

```css
body { font-family: var(--font-thai-ui); font-size: var(--text-body); line-height: 1.6; }
button, [role="button"], input, select { min-height: var(--target-min); }
.primary-button { min-height: var(--action-primary); font-size: 1.125rem; }
.photo-action { min-height: var(--action-photo); width: 100%; }
:focus-visible { outline: 3px solid #174ea6; outline-offset: 3px; }
```

Add `prefers-reduced-motion`, 200% zoom-safe wrapping, and no horizontal overflow rules.

- [ ] **Step 5: Update shell navigation**

Use task-based Thai labels where they improve clarity, retain desktop and mobile parity, and ensure every icon-only control has a text alternative.

- [ ] **Step 6: Run tests and build**

Run:

```powershell
npx vitest run src/components/common/accessibility-contract.test.tsx src/components/lab/lab-shell.test.tsx
npm run lint
npm run build
```

- [ ] **Step 7: Commit**

```powershell
git add src/app/layout.tsx src/app/globals.css src/components/lab/lab-shell.tsx src/components/lab/lab-shell.test.tsx src/components/common/accessibility-contract.test.tsx
git commit -m "Introduce senior-friendly accessible visual system"
```

---

### Task 7: Apply the accessibility contract across all system pages

**Files:**
- Modify: components under:
  - `src/components/experiments/`
  - `src/components/plants/`
  - `src/components/knowledge/`
  - `src/components/protocols/`
  - `src/components/research/`
  - `src/components/dataset/`
- Modify: relevant tests in the same directories.
- Modify: relevant `src/app/**/page.tsx` files for page-state copy.

**Interfaces:**
- Consumes `AccessibleAction` and global tokens from Tasks 4 and 6.
- No repository API changes.

- [ ] **Step 1: Add failing page-contract tests**

For each page group assert:

- one clear primary action;
- labels in plain language;
- raw technical errors absent;
- loading, empty, warning, success, and error states explain the next action;
- destructive actions are separated;
- controls have accessible names.

- [ ] **Step 2: Run all component tests and record RED failures**

Run:

```powershell
npx vitest run src/components
```

- [ ] **Step 3: Update first-entry, Overview, navigation, and Plants**

Make `เริ่มจากต้นไม้ 1 ต้น` dominant. Rewrite Plant fields with examples and help paths. Ensure Plant Profile tells the user what to do next.

- [ ] **Step 4: Update Experiments, Observation, and timelines**

Use large controls, explicit status explanations, non-color state cues, and clear save confirmation.

- [ ] **Step 5: Update Knowledge and Taxon pages**

Keep scientific names and evidence visible while defining terminology and separating `ข้อมูลสำหรับอ่าน` from `เริ่มทำการทดลอง`.

- [ ] **Step 6: Update Protocol authoring and Research review**

These expert surfaces may remain denser than the runner but must meet the minimum font, target, focus, and contrast rules. Label them as advanced workspaces.

- [ ] **Step 7: Update Image review**

Explain provenance, label confidence, training eligibility, and rejection states in plain language without claiming model certainty.

- [ ] **Step 8: Run all component tests**

Run:

```powershell
npx vitest run src/components
```

- [ ] **Step 9: Commit**

```powershell
git add src/components src/app
git commit -m "Apply accessible UX contract across lab"
```

---

### Task 8: Automate browser accessibility and beginner simulation

**Files:**
- Create: `scripts/verify-accessible-ui.mjs`
- Modify: `package.json`
- Modify: `.gitignore` only if generated verification artifacts require exclusion.
- Modify: `handoff.md`

**Interfaces:**
- Adds `npm run ui:verify`.
- Consumes a running local server URL via `UI_BASE_URL`.

- [ ] **Step 1: Write the verification script with failing assertions against the current UI**

The script must:

- open Dashboard, Plant creation, Wizard, Guided Runner, media upload, Knowledge, Protocol authoring, Research, and Image review;
- inspect computed body/label/metadata font sizes;
- inspect target rectangles;
- detect horizontal overflow;
- exercise keyboard focus order and Escape;
- set 200% zoom through viewport/emulation-compatible CSS inspection;
- test 390px, 1024px, and 1440px;
- enable reduced motion;
- report exact selector, page, expected, and actual values.

Example assertion:

```js
assert(rect.width >= 48 && rect.height >= 48,
  `${url} ${selector}: expected 48x48 target, got ${rect.width}x${rect.height}`);
```

- [ ] **Step 2: Add the package script**

```json
"ui:verify": "node scripts/verify-accessible-ui.mjs"
```

- [ ] **Step 3: Start the sandbox and verify RED**

Run:

```powershell
npm run dev -- --hostname 127.0.0.1 --port 3100
$env:UI_BASE_URL="http://127.0.0.1:3100"
npm run ui:verify
```

Expected: any remaining inaccessible target, font, focus, overflow, or workflow failure is reported.

- [ ] **Step 4: Fix only failures within the approved spec**

Repeat `npm run ui:verify` until it passes. Do not weaken thresholds.

- [ ] **Step 5: Run the full quality gate**

```powershell
npm test
npm run lint
npm run build
npm run firebase:verify
npm run ui:verify
```

- [ ] **Step 6: Conduct authenticated production smoke tests**

After pushing `master` and `main`:

- verify Vercel production commit and `READY`;
- sign in;
- create a Plant;
- create Pink Princess Haiter Lot;
- complete direct-dose and working-dilution branches;
- exercise an uncertainty path;
- save a step draft;
- confirm a step;
- upload, delete, and restore a photo;
- verify locked cutting steps;
- repeat core runner checks at mobile width and keyboard-only.

- [ ] **Step 7: Update handoff**

Record:

- commit;
- branches;
- deployment ID and production URL;
- automated check counts;
- exact browser flows tested;
- known limitations, if any.

- [ ] **Step 8: Commit and push**

```powershell
git add scripts/verify-accessible-ui.mjs package.json handoff.md
git commit -m "Verify zero-knowledge accessible workflows"
git push origin master
git push origin master:main
```

---

## Plan self-review

- Spec coverage: all zero-knowledge, 22-step, calculation, uncertainty, typography, target-size, photo, system-page, emulator, responsive, keyboard, zoom, reduced-motion, and production requirements map to Tasks 1–8.
- Placeholder scan: no TBD/TODO/“implement later” instructions remain.
- Type consistency: `BeginnerInstruction`, `UncertaintyPath`, `HaiterActionPlan`, `BeginnerStepGuide`, `UncertaintyActions`, and `AccessibleAction` are defined before use.
- Scope: model training and automatic species identification remain excluded.
- Migration: existing step IDs and evidence states must be preserved; composed workflows explicitly handle current published versions.

