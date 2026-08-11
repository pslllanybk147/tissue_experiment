# Botanical Atlas Core Workflows Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate the app shell, public guide, protocol runner, setup, calculators, forms, and media evidence flows to the approved Botanical Atlas components.

**Architecture:** Build on the semantic foundation and common primitives from Plan 1. Route components keep their data and event contracts while composition moves to editorial chapter headers, step anatomy, contextual asides, and mobile-first single-column transformations.

**Tech Stack:** Next.js 16.2.11 App Router, React 19.2.4, TypeScript, CSS, Vitest, Playwright.

## Global Constraints

- Plan 1 must be complete and `npm run atlas:verify` must exist.
- Read `node_modules/next/dist/docs/01-app/01-getting-started/11-css.md` before changing stylesheet imports/order.
- Preserve every route, href, callback, form name, validation rule, calculator formula, persistence call, and Thai scientific copy.
- Use Sarabun and shared `--cl-*` tokens only; no Chaeo Hon/Torsilp references or English variant captions.
- Cards have no fixed height; grid/flex text children use `min-width: 0`; mobile is one-column task order.

---

### Task 1: Migrate app shell, navigation, and dashboard

**Files:**
- Modify: `src/components/common/app-shell.tsx`
- Modify: `src/components/common/app-shell.test.tsx`
- Modify: `src/components/lab/lab-shell.tsx`
- Modify: `src/components/lab/lab-shell.test.tsx`
- Modify: `src/components/lab/dashboard-summary.tsx`
- Modify: `src/components/lab/dashboard-summary.test.tsx`
- Modify: `src/components/nav/primary-nav.tsx`
- Modify: `src/components/nav/primary-nav.test.tsx`
- Modify: `src/app/calm-lab.css`
- Modify: `src/app/globals.css`

**Interfaces:**
- Consumes: Plan 1 shared primitives and semantic tokens.
- Produces: stable Botanical Atlas shell/navigation used by all authenticated and admin routes.
- Preserves: nav destinations from `src/components/nav/nav-items.ts` and auth/demo behavior.

- [ ] **Step 1: Add failing shell hierarchy tests**

Assert one `<main>`, current-route `aria-current="page"`, Thai nav labels, chapter/page heading order, and absence of old class patterns that create nested dashboard cards:

```tsx
expect(html).toContain('class="cl-atlas-shell"');
expect(html).toContain('aria-current="page"');
expect(html.match(/<main/g)).toHaveLength(1);
expect(html).not.toMatch(/Primary|Keyboard focus|Destructive|Disabled/);
```

- [ ] **Step 2: Run shell tests and verify RED**

Run: `npm test -- src/components/common/app-shell.test.tsx src/components/lab src/components/nav/primary-nav.test.tsx`

Expected: FAIL because `cl-atlas-shell` composition does not exist.

- [ ] **Step 3: Recompose shell/dashboard using existing data**

Keep current props and links. Use a single page header, aligned summary rows, divider-led lists, and at most one contextual aside. Add classes such as `cl-atlas-shell`, `cl-atlas-chapter`, `cl-atlas-reading`, and `cl-atlas-wide`; do not add new state.

```tsx
<div className="cl-atlas-shell">
  <a className="cl-skip-link" href="#main-content">ข้ามไปเนื้อหาหลัก</a>
  <header className="cl-topbar">{navigation}{utility}</header>
  <main id="main-content" className="cl-main cl-atlas-wide">{children}</main>
  <div className="cl-mobile-nav">{mobileNavigation}</div>
</div>
```

- [ ] **Step 4: Implement responsive shell CSS**

At 1200px use the wide container; below 768px expose the existing mobile navigation and stack page actions. Ensure safe-area padding and 48px targets.

```css
.cl-atlas-wide { width: min(100% - 48px, 1200px); margin-inline: auto; }
.cl-atlas-reading { width: min(100%, 780px); }
@media (max-width: 767px) {
  .cl-atlas-wide { width: min(100% - 32px, 1200px); }
  .cl-action-bar { grid-template-columns: 1fr; }
  .cl-mobile-nav a, .cl-mobile-nav button { min-height: 52px; }
}
```

- [ ] **Step 5: Run focused tests and browser routes**

Run:

```powershell
npm test -- src/components/common/app-shell.test.tsx src/components/lab src/components/nav
$env:UI_VIEWPORT='desktop'; npm run atlas:verify
$env:UI_VIEWPORT='iphone-12'; npm run atlas:verify
```

Expected: PASS with no overflow on `/my` and all shell destinations.

- [ ] **Step 6: Commit shell migration**

```powershell
git add src/components/common/app-shell* src/components/lab src/components/nav/primary-nav* src/app/calm-lab.css src/app/globals.css
git commit -m "feat: migrate app shell to botanical atlas"
```

### Task 2: Migrate public guide and manual reading surfaces

**Files:**
- Modify: `src/components/guide/guide-shell.tsx`
- Modify: `src/components/guide/guide-shell.test.tsx`
- Modify: `src/components/guide/step-detail.tsx`
- Modify: `src/components/guide/step-detail.test.tsx`
- Modify: `src/components/guide/step-map.tsx`
- Modify: `src/components/guide/start-list.tsx`
- Modify: `src/components/guide/form-detail.tsx`
- Modify: `src/components/guide/problem-list.tsx`
- Modify: `src/components/guide/search-results.tsx`
- Modify: `src/components/guide/substance-list.tsx`
- Modify: `src/app/guide.css`

**Interfaces:**
- Consumes: shared shell, headings, notices, buttons, and tokens.
- Produces: editorial reading classes used by `/`, `/guide/*`, `/find`, `/start`, `/problem`, `/search`, and `/substances`.
- Preserves: all resolved manual content, evidence labels, route params, previous/next links, and theme toggle behavior.

- [ ] **Step 1: Add failing chapter/reading-order tests**

Assert the step page renders chapter metadata before H1, sections in the existing semantic order, secondary previous link before primary next link, and no English mockup captions.

```ts
expect(html.indexOf("บทที่")).toBeLessThan(html.indexOf("<h1"));
expect(html.indexOf("ขั้นนี้ต้องได้อะไร")).toBeLessThan(html.indexOf("ทำตามลำดับ"));
expect(html.indexOf("‹ ขั้นที่")).toBeLessThan(html.indexOf("ขั้นที่ 3 ›"));
```

- [ ] **Step 2: Run guide tests and verify RED**

Run: `npm test -- src/components/guide src/app/guide-palette.test.ts`

Expected: new Botanical Atlas chapter/class assertions FAIL.

- [ ] **Step 3: Recompose guide surfaces without changing content resolution**

Use the approved reading width, chapter kicker, section dividers, Botanical Atlas buttons, and contextual evidence aside. Keep `RichText`, `ResolvedStep`, and existing data flow untouched.

```tsx
<article className="cl-atlas-reading pl-step-detail">
  <p className="cl-meta">บทที่ {chapterNumber} จาก {chapterCount}</p>
  <PageHeading title={step.title} />
  <section className="cl-atlas-chapter" aria-labelledby="step-outcome">
    <h2 id="step-outcome">ขั้นนี้ต้องได้อะไร</h2>
    <RichText source={step.summary} />
  </section>
  {children}
</article>
```

- [ ] **Step 4: Replace guide-specific visual values with aliases to `--cl-*`**

Remove independent font declarations and decorative geometry. Keep only `--pl-*` compatibility aliases where tests or components still need them, mapped to semantic tokens.

```css
:root {
  --pl-bg: var(--cl-bg);
  --pl-surface: var(--cl-surface);
  --pl-text: var(--cl-text);
  --pl-muted: var(--cl-text-muted);
  --pl-border: var(--cl-border);
  --pl-primary: var(--cl-action);
}
```

- [ ] **Step 5: Verify guide tests and public routes**

Run:

```powershell
npm test -- src/components/guide src/app/guide-palette.test.ts
$env:UI_VIEWPORT='desktop'; npm run atlas:verify
$env:UI_VIEWPORT='minimum-mobile'; npm run atlas:verify
```

Expected: PASS across public routes in both themes with no clipped Thai text.

- [ ] **Step 6: Commit guide migration**

```powershell
git add src/components/guide src/app/guide.css src/app/guide-palette.test.ts
git commit -m "feat: migrate guides to botanical atlas"
```

### Task 3: Migrate protocol step cards and round navigation

**Files:**
- Modify: `src/components/rounds/step-section.tsx`
- Modify: `src/components/rounds/step-section.test.tsx`
- Modify: `src/components/rounds/step-runner.tsx`
- Modify: `src/components/rounds/step-runner.test.tsx`
- Modify: `src/components/rounds/round-progress.tsx`
- Modify: `src/components/rounds/round-progress.test.tsx`
- Modify: `src/components/rounds/step-photos.tsx`
- Modify: `src/components/rounds/step-photos.test.tsx`
- Modify: `src/components/media/media-uploader.tsx`
- Modify: `src/components/media/media-uploader.test.tsx`
- Modify: `src/app/calm-lab.css`
- Modify: `src/app/globals.css`

**Interfaces:**
- Consumes: existing `ResolvedStep`, `MediumExecutionContext`, and `DoseValue` unchanged.
- Produces: `.cl-atlas-step-card` anatomy and photo evidence composition.
- Preserves: `StepSections`, `StepRunner`, upload callbacks, gate logic, save behavior, and previous/next URLs.

- [ ] **Step 1: Add failing step-card anatomy tests**

Assert each execution instruction contains number, heading, action, optional details, completion, and next block in that order:

```tsx
expect(html).toContain("cl-atlas-step-card");
expect(html.indexOf("execution-instruction-action"))
  .toBeLessThan(html.indexOf("execution-instruction-details"));
expect(html.indexOf("execution-instruction-details"))
  .toBeLessThan(html.indexOf("execution-instruction-completion"));
```

For media, assert the picker label remains Thai and upload submit is disabled until a file exists.

- [ ] **Step 2: Run focused tests and verify RED**

Run: `npm test -- src/components/rounds/step-section.test.tsx src/components/rounds/step-runner.test.tsx src/components/rounds/step-photos.test.tsx src/components/media/media-uploader.test.tsx`

Expected: FAIL on missing `cl-atlas-step-card` and updated media anatomy.

- [ ] **Step 3: Recompose step cards and photo evidence**

Preserve calculation override logic. Add only structural wrappers/classes required by the approved anatomy. Keep actual Thai action copy and never render design-state captions.

```tsx
<li className={`cl-atlas-step-card execution-instruction-${instruction.tone ?? "normal"}`}>
  <div className="execution-instruction-heading">
    <span className="execution-instruction-number">{index + 1}</span>
    <h3>{instruction.label}</h3>
  </div>
  <div className="execution-instruction-action"><RichText source={action} /></div>
  {details}
  {completion}
  {next}
</li>
```

- [ ] **Step 4: Implement desktop/mobile card and pagination CSS**

Use a 5px primary top rule, sequence divider, label/value detail grid, warm completion block, and full-width stacked mobile actions. No fixed card height or `white-space: nowrap` on dynamic labels.

```css
.cl-atlas-step-card { border-top: 5px solid var(--cl-action); padding: 24px 0; min-width: 0; }
.execution-instruction-details { display: grid; grid-template-columns: minmax(7rem, 0.3fr) minmax(0, 1fr); }
@media (max-width: 767px) {
  .execution-instruction-details { grid-template-columns: 1fr; }
  .cl-step-pagination { display: grid; grid-template-columns: 1fr; }
}
```

- [ ] **Step 5: Run focused and route verification**

Run:

```powershell
npm test -- src/components/rounds src/components/media
$env:UI_VIEWPORT='desktop'; npm run atlas:verify
$env:UI_VIEWPORT='iphone-12'; npm run atlas:verify
```

Expected: PASS; long step content expands rather than overlaps.

- [ ] **Step 6: Commit protocol cards**

```powershell
git add src/components/rounds/step-* src/components/rounds/round-progress* src/components/media src/app/calm-lab.css src/app/globals.css
git commit -m "feat: redesign protocol execution cards"
```

### Task 4: Migrate setup, forms, preparation, and calculators

**Files:**
- Modify: `src/components/rounds/round-setup.tsx`
- Modify: `src/components/rounds/round-setup.test.tsx`
- Modify: `src/components/rounds/chemical-preparation.tsx`
- Modify: `src/components/rounds/chemical-preparation.test.tsx`
- Modify: `src/components/rounds/medium-calculator.tsx`
- Modify: `src/components/rounds/medium-calculator.test.tsx`
- Modify: `src/components/calculators/calculator-field.tsx`
- Modify: `src/components/calculators/calculator-field.test.tsx`
- Modify: `src/components/calculators/haiter-calculator.tsx`
- Modify: `src/components/calculators/haiter-calculator.test.tsx`
- Modify: `src/components/calculators/nadcc-calculator.tsx`
- Modify: `src/components/calculators/nadcc-calculator.test.tsx`
- Modify: `src/components/calculators/working-stock-calculator.tsx`
- Modify: `src/components/calculators/working-stock-calculator.test.tsx`
- Modify: `src/app/calm-lab.css`
- Modify: `src/app/globals.css`

**Interfaces:**
- Consumes: `FieldGroup`, `StatusNotice`, action primitives, and existing calculator domain functions.
- Produces: Botanical Atlas setup/form/calculator composition.
- Preserves: all numeric input clearing, ppm estimation, preparation status gates, domain plan callbacks, and submission payloads.

- [ ] **Step 1: Add failing structure and regression tests**

Keep all existing scientific assertions and add:

```tsx
expect(html).toContain("cl-atlas-form-section");
expect(html).toContain("ค่าจากสูตร ยังไม่ใช่ค่าตรวจ");
expect(html).toContain("TDS/EC");
expect(html).not.toMatch(/Primary|Keyboard focus|Destructive|Disabled/);
```

Add a long-label fixture to ensure unit and input remain sibling grid cells and numeric value remains clearable.

- [ ] **Step 2: Run calculator/setup tests and verify RED**

Run: `npm test -- src/components/rounds/round-setup.test.tsx src/components/rounds/chemical-preparation.test.tsx src/components/rounds/medium-calculator.test.tsx src/components/calculators`

Expected: new structural assertions FAIL; all pre-existing formula assertions remain green.

- [ ] **Step 3: Recompose setup and calculators**

Group forms into chapter sections, use label → hint → control → error, and show computed results in a primary-rule result block. Do not change state initialization, calculation functions, or submit handlers.

```tsx
<section className="cl-atlas-form-section" aria-labelledby="preparation-heading">
  <h2 id="preparation-heading">ยืนยันการเตรียมสาร</h2>
  <div className="cl-atlas-field-grid">{fields}</div>
  {result ? <output className="cl-atlas-result" aria-live="polite">{result}</output> : null}
  {notice}
  {actions}
</section>
```

- [ ] **Step 4: Implement responsive form/calculator CSS**

Use two columns only when each field remains at least 12rem; otherwise stack. Units use an explicit grid column. Validation copy occupies its own row and cannot overlay controls.

```css
.cl-atlas-field-grid { display: grid; grid-template-columns: repeat(2, minmax(12rem, 1fr)); gap: 24px; }
.cl-field-control { display: grid; grid-template-columns: minmax(0, 1fr) auto; }
.cl-field-error { grid-column: 1 / -1; }
@media (max-width: 767px) { .cl-atlas-field-grid { grid-template-columns: 1fr; } }
```

- [ ] **Step 5: Run tests and browser verification**

Run:

```powershell
npm test -- src/components/rounds src/components/calculators
npm run lint
$env:UI_VIEWPORT='desktop'; npm run atlas:verify
$env:UI_VIEWPORT='minimum-mobile'; npm run atlas:verify
```

Expected: PASS with unchanged calculated values and no form overlap.

- [ ] **Step 6: Commit workflow forms**

```powershell
git add src/components/rounds src/components/calculators src/app/calm-lab.css src/app/globals.css
git commit -m "feat: redesign workflow forms and calculators"
```

## Plan 2 Completion Gate

Run `npm test`, `npm run lint`, `npm run build`, `npm run atlas:verify`, `npm run protocol:verify`, and `git diff --check`.

Expected: all PASS; core public and authenticated workflows render Botanical Atlas in both themes without behavior changes.
