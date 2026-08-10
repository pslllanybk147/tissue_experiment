# Calm Lab Foundation and Core Workflows Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Establish one Torsilp-based Calm Lab design system and migrate the shared shells plus round setup/protocol/calculator workflows onto it.

**Architecture:** Move all foundation and semantic tokens into one CSS source, centralize theme resolution, and introduce small semantic React primitives for repeated workflow anatomy. Keep feature behavior in existing components while replacing inline style decisions with shared variants and responsive composition.

**Tech Stack:** Next.js App Router 16.2.11, React 19.2.4, TypeScript 5, CSS custom properties, Vitest 4, Playwright 1.62.

## Global Constraints

- Complete `2026-08-10-calm-lab-p0-protocol-integrity.md` first.
- Read `node_modules/next/dist/docs/01-app/03-api-reference/02-components/font.md` and `node_modules/next/dist/docs/01-app/01-getting-started/11-css.md` before editing the root layout or CSS imports.
- Torsilp is the only UI font family; do not use Geist, IBM Plex, Noto, Georgia, or a monospace family for visible UI.
- Use the approved Calm Lab semantic colors and spacing scale exactly as the starting contract; rendered contrast may require adjusting paired foreground tokens, not replacing the visual thesis.
- Backgrounds are flat. Do not add decorative grid, glow, continuous gradient, glassmorphism, or ambient motion.
- Do not change routes, protocol behavior, persistence, copy meaning, or scientific values during visual migration.
- Controls are at least 44px high where they are interactive; input text is at least 16px and metadata is at least 14px.
- Add no runtime dependency.

---

### Task 1: Create the single Calm Lab token and typography source

**Files:**
- Create: `src/app/calm-lab.css`
- Create: `src/app/calm-lab-contract.test.ts`
- Modify: `src/app/layout.tsx:1-39`
- Modify: `src/app/globals.css:1-77`
- Modify: `src/app/guide.css:1-168`

**Interfaces:**
- Produces foundation tokens `--cl-space-*`, `--cl-text-*`, `--cl-radius-*`, and semantic tokens `--cl-canvas`, `--cl-surface`, `--cl-text`, `--cl-border`, `--cl-action`, `--cl-focus`, `--cl-warning`, `--cl-danger`, and paired foreground tokens.
- Exposes only `--font-torsilp` as the visible UI family.
- Existing `--pl-*` and legacy global tokens remain temporary aliases during migration, not independent values.

- [ ] **Step 1: Write a failing CSS contract test**

```ts
import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const css = fs.readFileSync(path.join(process.cwd(), "src/app/calm-lab.css"), "utf8");

describe("Calm Lab contract", () => {
  it.each(["--cl-canvas", "--cl-surface", "--cl-text", "--cl-border", "--cl-action", "--cl-focus"])("defines %s in both themes", (token) => {
    expect(css.match(new RegExp(`${token}:`, "g"))).toHaveLength(2);
  });
  it("uses the approved spacing and readable type floors", () => {
    expect(css).toContain("--cl-space-4: 16px");
    expect(css).toContain("--cl-text-body: 17px");
    expect(css).toContain("--cl-text-meta: 14px");
    expect(css).toContain("--cl-control-min: 44px");
  });
});
```

- [ ] **Step 2: Run the contract test and verify it fails**

Run: `npm test -- src/app/calm-lab-contract.test.ts`

Expected: FAIL because `calm-lab.css` does not exist.

- [ ] **Step 3: Implement tokens and simplify font loading**

Define the approved palettes under default/light and `[data-theme="dark"]`, plus foreground tokens such as `--cl-on-action`, `--cl-on-warning`, and `--cl-on-danger`. Define:

```css
:root {
  --cl-canvas: #F4F6F2;
  --cl-surface: #FFFFFF;
  --cl-surface-subtle: #EAF0EC;
  --cl-text: #17251F;
  --cl-text-muted: #52645B;
  --cl-border: #CDD8D1;
  --cl-action: #1F6B52;
  --cl-on-action: #FFFFFF;
  --cl-accent: #287C86;
  --cl-focus: #167B88;
  --cl-warning: #9A5B13;
  --cl-danger: #A33A32;
  --cl-text-body: 17px;
  --cl-text-meta: 14px;
  --cl-control-min: 44px;
}
```

Load only the local Torsilp font in `layout.tsx`, import `calm-lab.css` before feature CSS, and set body/UI controls to `var(--font-torsilp)`. Convert the old token blocks in `globals.css` and `guide.css` into aliases such as `--pl-paper: var(--cl-canvas)` so there is one value source.

- [ ] **Step 4: Run contract, layout, and theme regressions**

Run: `npm test -- src/app/calm-lab-contract.test.ts src/components/guide/theme-toggle.test.tsx src/components/guide/guide-shell.test.tsx src/components/lab/lab-shell.test.tsx`

Expected: PASS; the app exposes one token source and one visible font family.

- [ ] **Step 5: Commit the foundation contract**

```bash
git add src/app/calm-lab.css src/app/calm-lab-contract.test.ts src/app/layout.tsx src/app/globals.css src/app/guide.css
git commit -m "feat: add calm lab design tokens"
```

---

### Task 2: Centralize theme resolution and accessible theme controls

**Files:**
- Create: `src/lib/theme/theme.ts`
- Create: `src/lib/theme/theme.test.ts`
- Modify: `src/components/guide/theme-script.tsx`
- Modify: `src/components/guide/theme-toggle.tsx`
- Modify: `src/components/guide/theme-toggle.test.tsx`
- Modify: `src/app/calm-lab.css`

**Interfaces:**
- Produces `Theme = "light" | "dark"`, `THEME_STORAGE_KEY = "pl-theme"`, `resolveInitialTheme(stored, systemDark): Theme`, `oppositeTheme(theme): Theme`, and `themeToggleLabel(theme): string`.
- `ThemeScript` applies user preference, then system preference, then light before paint.
- `ThemeToggle` renders a hydration-safe neutral state, then exposes the current theme through `aria-pressed` and names the target action after mount.

- [ ] **Step 1: Write failing pure and markup tests**

```ts
it.each([
  ["dark", false, "dark"],
  ["light", true, "light"],
  [null, true, "dark"],
  [null, false, "light"],
] as const)("resolves stored=%s systemDark=%s", (stored, systemDark, expected) => {
  expect(resolveInitialTheme(stored, systemDark)).toBe(expected);
});

it.each([
  ["light", "เปลี่ยนเป็นโหมดมืด"],
  ["dark", "เปลี่ยนเป็นโหมดสว่าง"],
] as const)("labels the action from %s mode", (theme, expected) => {
  expect(themeToggleLabel(theme)).toBe(expected);
});

it("renders the same neutral control on server and first client render", () => {
  const html = renderToStaticMarkup(<ThemeToggle />);
  expect(html).toContain("กำลังตรวจสอบธีม");
  expect(html).not.toContain("aria-pressed");
});
```

- [ ] **Step 2: Run theme tests and verify they fail**

Run: `npm test -- src/lib/theme/theme.test.ts src/components/guide/theme-toggle.test.tsx`

Expected: FAIL because theme resolution is embedded in DOM functions and the toggle has no state semantics.

- [ ] **Step 3: Implement theme helpers and pre-paint bootstrap**

```ts
export function resolveInitialTheme(stored: string | null, systemDark: boolean): Theme {
  if (stored === "light" || stored === "dark") return stored;
  return systemDark ? "dark" : "light";
}

export function oppositeTheme(theme: Theme): Theme {
  return theme === "dark" ? "light" : "dark";
}

export function themeToggleLabel(theme: Theme): string {
  return theme === "dark" ? "เปลี่ยนเป็นโหมดสว่าง" : "เปลี่ยนเป็นโหมดมืด";
}
```

Keep the bootstrap inline, but generate it from the same storage key and decision order. Set `document.documentElement.dataset.theme` and `style.colorScheme` before paint. During SSR and the first client render, keep `ThemeToggle` neutral; in `useEffect`, read the already-applied `data-theme`, then add `aria-pressed` and the target-action label. Update both after a click. Catch storage errors without preventing the current-page theme change.

- [ ] **Step 4: Verify theme persistence and no-flash behavior**

Run: `npm test -- src/lib/theme/theme.test.ts src/components/guide/theme-toggle.test.tsx`

Then use Playwright to open `/start` with stored light, stored dark, system light, and system dark; read `data-theme` before hydration settles and confirm the first rendered canvas matches it.

Expected: tests pass and no case flashes the opposite canvas.

- [ ] **Step 5: Commit theme behavior**

```bash
git add src/lib/theme/theme.ts src/lib/theme/theme.test.ts src/components/guide/theme-script.tsx src/components/guide/theme-toggle.tsx src/components/guide/theme-toggle.test.tsx src/app/calm-lab.css
git commit -m "fix: unify light and dark theme behavior"
```

---

### Task 3: Add Calm Lab workflow primitives

**Files:**
- Create: `src/components/common/workflow-shell.tsx`
- Create: `src/components/common/field-group.tsx`
- Create: `src/components/common/method-selector.tsx`
- Create: `src/components/common/status-notice.tsx`
- Create: `src/components/common/action-bar.tsx`
- Create: `src/components/common/data-list.tsx`
- Create: `src/components/common/page-heading.tsx`
- Create: `src/components/common/calm-ui.test.tsx`
- Modify: `src/app/calm-lab.css`

**Interfaces:**
- `WorkflowShell({ title, description, steps, currentStep, aside, children, actions })` owns the three-stage responsive composition.
- `FieldGroup({ id, label, hint, error, unit, children })` owns label/description/error associations.
- `MethodSelector({ name, value, options, onChange })` renders native radio inputs; `MethodOption` includes `value`, `label`, `description`, `status?`, `disabled?`, and `disabledReason?`.
- `StatusNotice({ tone, title, children, action })` maps tones to semantic roles.
- `ActionBar` accepts secondary content and exactly one primary action.
- `DataList` renders semantic `dl` markup and supports comfortable/compact density.
- `PageHeading({ title, description, action })` owns one page H1 and an optional primary page action.

- [ ] **Step 1: Write failing semantic and state tests**

```tsx
it("associates field hint and error with the control", () => {
  const html = renderToStaticMarkup(
    <FieldGroup id="ppm" label="ค่า ppm" hint="กรอกค่าที่วัดจริง" error="ต้องมากกว่าศูนย์">
      <input id="ppm" aria-invalid="true" />
    </FieldGroup>,
  );
  expect(html).toContain('aria-describedby="ppm-hint ppm-error"');
  expect(html).toContain('role="alert"');
});

it("keeps disabled method reasons visible", () => {
  const html = renderToStaticMarkup(<MethodSelector name="medium" value={null} options={options} onChange={noop} />);
  expect(html).toContain("ยังไม่มีหม้อนึ่งหรือหม้ออัดแรงดัน");
  expect(html).toContain("disabled");
});
```

- [ ] **Step 2: Run the primitive test and verify it fails**

Run: `npm test -- src/components/common/calm-ui.test.tsx`

Expected: FAIL because the primitives do not exist.

- [ ] **Step 3: Implement focused primitives and variants**

Use native `fieldset`, `legend`, `label`, `input`, `dl`, and `button` semantics. Variant classes must describe purpose:

```ts
export type NoticeTone = "info" | "success" | "warning" | "error" | "blocked";
export type Density = "comfortable" | "compact";
```

CSS must implement 44px controls, `:focus-visible`, selected indicators that do not rely on color, flat surfaces, one-pixel borders, and mobile stacking below 768px. Avoid component-specific color literals.

- [ ] **Step 4: Run primitive and accessibility contract tests**

Run: `npm test -- src/components/common/calm-ui.test.tsx src/components/common/accessibility-contract.test.tsx src/components/common/accessible-action.test.tsx`

Expected: PASS; long labels wrap without hiding the input or status.

- [ ] **Step 5: Commit workflow primitives**

```bash
git add src/components/common/workflow-shell.tsx src/components/common/field-group.tsx src/components/common/method-selector.tsx src/components/common/status-notice.tsx src/components/common/action-bar.tsx src/components/common/data-list.tsx src/components/common/page-heading.tsx src/components/common/calm-ui.test.tsx src/app/calm-lab.css
git commit -m "feat: add calm lab workflow primitives"
```

---

### Task 4: Unify public and lab shells on Calm Lab composition

**Files:**
- Create: `src/components/common/app-shell.tsx`
- Create: `src/components/common/app-shell.test.tsx`
- Modify: `src/components/guide/guide-shell.tsx`
- Modify: `src/components/guide/guide-shell.test.tsx`
- Modify: `src/components/lab/lab-shell.tsx`
- Modify: `src/components/lab/lab-shell.test.tsx`
- Modify: `src/components/nav/primary-nav.tsx`
- Modify: `src/components/nav/primary-nav.test.tsx`
- Modify: `src/app/calm-lab.css`
- Modify: `src/app/globals.css`
- Modify: `src/app/guide.css`

**Interfaces:**
- `AppShell({ navigation, utility, mobileNavigation, children })` owns skip link, brand, compact desktop top bar, main container, and mobile safe-area reservation.
- `GuideShell` remains source-compatible and supplies public navigation/calculator overlay.
- `LabShell` remains source-compatible and supplies admin destinations/session actions without a separate visual token system.

- [ ] **Step 1: Write failing shell invariants**

```tsx
it.each(["GuideShell", "LabShell"])("%s uses the shared app shell", (name) => {
  const html = name === "GuideShell" ? renderGuide() : renderLab();
  expect(html).toContain("cl-app-shell");
  expect(html).toContain('href="#main-content"');
  expect(html).toContain('id="main-content"');
});

it("reserves mobile navigation space including the safe area", () => {
  expect(css).toContain("calc(var(--cl-mobile-nav-height) + env(safe-area-inset-bottom))");
});
```

- [ ] **Step 2: Run shell tests and verify they fail**

Run: `npm test -- src/components/common/app-shell.test.tsx src/components/guide/guide-shell.test.tsx src/components/lab/lab-shell.test.tsx src/components/nav/primary-nav.test.tsx`

Expected: FAIL because GuideShell and LabShell still own unrelated layouts.

- [ ] **Step 3: Implement the shared shell and navigation slots**

```tsx
export type AppShellProps = {
  navigation: React.ReactNode;
  utility?: React.ReactNode;
  mobileNavigation: React.ReactNode;
  children: React.ReactNode;
};

export function AppShell({ navigation, utility, mobileNavigation, children }: AppShellProps) {
  return (
    <div className="cl-app-shell">
      <a className="cl-skip-link" href="#main-content">ข้ามไปเนื้อหาหลัก</a>
      <header className="cl-topbar">{navigation}<div className="cl-topbar-utility">{utility}</div></header>
      <main id="main-content" className="cl-main">{children}</main>
      <div className="cl-mobile-nav">{mobileNavigation}</div>
    </div>
  );
}
```

Keep CalculatorOverlayProvider and auth/session behavior in their current wrappers. Replace the lab sidebar at desktop with the approved compact top navigation; use an overflow-safe menu at narrow widths. Ensure the mobile bar does not cover page content or focused controls.

- [ ] **Step 4: Render shell breakpoints**

Run the four shell tests, then render GuideShell and LabShell at 360, 768, 1280, and 1600px in both themes. Confirm one main landmark, visible skip target, no horizontal overflow, and no mobile-nav overlap.

Expected: all tests pass and both product areas share the same Calm Lab frame.

- [ ] **Step 5: Commit shared shell migration**

```bash
git add src/components/common/app-shell.tsx src/components/common/app-shell.test.tsx src/components/guide/guide-shell.tsx src/components/guide/guide-shell.test.tsx src/components/lab/lab-shell.tsx src/components/lab/lab-shell.test.tsx src/components/nav/primary-nav.tsx src/components/nav/primary-nav.test.tsx src/app/calm-lab.css src/app/globals.css src/app/guide.css
git commit -m "refactor: unify app shells for calm lab"
```

---

### Task 5: Migrate round setup to the approved three-stage composition

**Files:**
- Modify: `src/components/rounds/round-setup.tsx`
- Modify: `src/components/rounds/round-setup.test.tsx`
- Create: `src/components/rounds/preparation-summary.tsx`
- Create: `src/components/rounds/preparation-summary.test.tsx`
- Modify: `src/app/my/rounds/new/page.tsx`
- Modify: `src/app/calm-lab.css`

**Interfaces:**
- Consumes `WorkflowShell`, `FieldGroup`, `MethodSelector`, `StatusNotice`, and `ActionBar` from Task 3.
- Preserves `RoundSetup` props and the reviewed `RoundSetupResult` from the P0 plan.
- Uses stages `ข้อมูลสาร`, `เลือกวิธี`, and `ตรวจทาน` with one active stage and a live review summary.
- `PreparationSummary({ value })` displays method, product/batch, planned-versus-actual values, and preparation status without editing the snapshot.

- [ ] **Step 1: Write failing composition tests**

```tsx
it("renders the approved three-stage workflow and one primary action", () => {
  const html = renderSetup(USER_REPORTED_PROFILE);
  expect(html).toContain("1 ข้อมูลสาร");
  expect(html).toContain("2 เลือกวิธี");
  expect(html).toContain("3 ตรวจทาน");
  expect((html.match(/cl-action-primary/g) ?? [])).toHaveLength(1);
});

it("uses native grouped methods without nested pl-card stacks", () => {
  const html = renderSetup(USER_REPORTED_PROFILE);
  expect(html).toContain("<fieldset");
  expect(html).not.toContain('style="display:grid;grid-template-columns:auto 1fr auto');
});
```

- [ ] **Step 2: Run setup tests and verify they fail**

Run: `npm test -- src/components/rounds/round-setup.test.tsx src/components/rounds/preparation-summary.test.tsx`

Expected: FAIL because setup is a long stack of inline-styled cards without stage composition.

- [ ] **Step 3: Recompose setup with shared primitives**

Keep both chemicals visible in the data stage. Move the three method groups into the method stage and display the locked summary in `WorkflowShell.aside`. Use a validation summary in the review stage, keep the back action secondary, and disable confirmation until all selections and required preparation fields are valid.

```tsx
<WorkflowShell title="ตั้งค่ารอบก่อนเริ่ม" steps={steps} currentStep={currentStep} aside={<PreparationSummary value={draft} />} actions={<ActionBar primary={confirmButton} secondary={backButton} />}>
  {currentStep === 0 ? <ChemicalFields /> : null}
  {currentStep === 1 ? <MethodGroups /> : null}
  {currentStep === 2 ? <ReviewRound /> : null}
</WorkflowShell>
```

- [ ] **Step 4: Verify long content, keyboard, and mobile order**

Run: `npm test -- src/components/rounds/round-setup.test.tsx src/components/rounds/preparation-summary.test.tsx src/lib/rounds/round-setup.test.ts`

Render `/my/rounds/new?slug=pink-princess` at 360 and 1280px in both themes. Tab through every field and method; confirm validation focuses the first invalid control and the action bar never covers it.

- [ ] **Step 5: Commit the setup migration**

```bash
git add src/components/rounds/round-setup.tsx src/components/rounds/round-setup.test.tsx src/components/rounds/preparation-summary.tsx src/components/rounds/preparation-summary.test.tsx src/app/my/rounds/new/page.tsx src/app/calm-lab.css
git commit -m "feat: redesign round setup for calm lab"
```

---

### Task 6: Migrate protocol execution and calculators to Calm Lab

**Files:**
- Modify: `src/components/rounds/step-runner.tsx`
- Modify: `src/components/rounds/step-runner.test.tsx`
- Modify: `src/components/rounds/step-section.tsx`
- Modify: `src/components/rounds/step-section.test.tsx`
- Modify: `src/components/rounds/chemical-preparation.tsx`
- Modify: `src/components/rounds/chemical-preparation.test.tsx`
- Modify: `src/components/rounds/medium-calculator.tsx`
- Modify: `src/components/rounds/medium-calculator.test.tsx`
- Modify: `src/components/calculators/calculator-field.tsx`
- Modify: `src/components/calculators/haiter-calculator.tsx`
- Modify: `src/components/calculators/nadcc-calculator.tsx`
- Modify: `src/app/calm-lab.css`
- Modify: `src/app/guide.css`

**Interfaces:**
- Uses comfortable density for instructions and forms, compact density for preparation summaries.
- Keeps `StepRunner`, `StepSections`, and calculator public props source-compatible except for the P0 callbacks already introduced.
- Execution instructions remain an ordered list with one visually dominant current action.

- [ ] **Step 1: Add failing markup and style-contract assertions**

```tsx
it("renders protocol sections without nested legacy card classes", () => {
  const html = renderToStaticMarkup(<StepRunner view={view} step={step} onSave={noop} />);
  expect(html).toContain("cl-protocol");
  expect(html).toContain("execution-instructions");
  expect(html).not.toContain("pl-soft-card");
});

it("keeps calculator labels and errors associated", () => {
  const html = renderToStaticMarkup(<NadccCalculator />);
  expect(html).toContain("cl-field-group");
  expect(html).toContain("aria-live");
});
```

- [ ] **Step 2: Run workflow tests and verify they fail**

Run: `npm test -- src/components/rounds/step-runner.test.tsx src/components/rounds/step-section.test.tsx src/components/rounds/chemical-preparation.test.tsx src/components/rounds/medium-calculator.test.tsx src/components/calculators/nadcc-calculator.test.tsx src/components/calculators/haiter-calculator.test.tsx`

Expected: FAIL until legacy cards/inline fields move to the Calm Lab grammar.

- [ ] **Step 3: Recompose the execution surface**

Use a 720–800px reading column, quiet section dividers, numbered instruction rows, `StatusNotice` for safety/stop states, `FieldGroup` for all calculator inputs, and `ActionBar` for save actions. Keep actual product evidence and preparation status near the action that consumes it.

```tsx
<article className="cl-protocol">
  <header className="cl-protocol-header"><p>{progress}</p><h1>{step.title}</h1></header>
  <StepSections step={step} mediumContext={mediumContext} />
  <ActionBar secondary={previousAction} primary={saveAction} />
</article>
```

- [ ] **Step 4: Run core workflow and rendered checks**

Run the six focused component tests. Then render setup, `prep-media`, and `sterilize` at 360/768/1280px in light/dark and inspect default, invalid, saving, saved, blocked, and disabled states.

Expected: all tests pass; one dominant action remains visible without persistent glow or overlapping navigation.

- [ ] **Step 5: Commit core workflow styling**

```bash
git add src/components/rounds/step-runner.tsx src/components/rounds/step-runner.test.tsx src/components/rounds/step-section.tsx src/components/rounds/step-section.test.tsx src/components/rounds/chemical-preparation.tsx src/components/rounds/chemical-preparation.test.tsx src/components/rounds/medium-calculator.tsx src/components/rounds/medium-calculator.test.tsx src/components/calculators/calculator-field.tsx src/components/calculators/haiter-calculator.tsx src/components/calculators/nadcc-calculator.tsx src/app/calm-lab.css src/app/guide.css
git commit -m "feat: migrate core workflows to calm lab"
```

---

### Task 7: Verify the foundation and core workflow release

**Files:**
- Modify: `scripts/verify-accessible-ui.mjs`
- Modify: `package.json` only if a focused command is needed

**Interfaces:**
- Extends existing UI verification with explicit theme, viewport, shell, and core-workflow context.
- Writes screenshots only for failed cases under the existing verification output directory.

- [ ] **Step 1: Add foundation assertions to the verifier**

```js
const calmLabChecks = async (page, context) => {
  const family = await page.locator("body").evaluate((node) => getComputedStyle(node).fontFamily);
  assert(/torsilp/i.test(family), `${context}: body is not using Torsilp`);
  assert(!(await page.locator(".pl-hero-grid, .pl-hero-ring, .pl-hero-scanline").count()), `${context}: legacy HUD decoration remains`);
  assert(await page.locator("main").count() === 1, `${context}: expected one main landmark`);
};
```

- [ ] **Step 2: Run the verifier against the pre-migration route set**

Run: `npm run ui:verify`

Expected: any failure reports route, theme, and viewport; fix only foundation/core workflow regressions in this task.

- [ ] **Step 3: Run the automated release gate as separate commands**

Run:

```text
npm test
npm run lint
npm run build
npm run protocol:verify
npm run ui:verify
git diff --check
```

Expected: every command exits 0.

- [ ] **Step 4: Inspect representative rendered states**

Capture and inspect `/start`, `/my/rounds/new?slug=pink-princess`, one `prep-media` step, one `sterilize` step, and one LabShell admin page at 360, 768, 1280, and 1600px in light/dark. Record any page groups still on legacy feature styling for the system-migration plan.

- [ ] **Step 5: Commit verification improvements**

```bash
git add scripts/verify-accessible-ui.mjs package.json
git commit -m "test: verify calm lab foundation and workflows"
```
