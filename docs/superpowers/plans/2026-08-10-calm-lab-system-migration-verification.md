# Calm Lab System Migration and Verification Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate every remaining public, workspace, and admin surface to the approved Calm Lab system, remove legacy visual sources, and prove the complete product flow across themes and responsive widths.

**Architecture:** Migrate by product surface so each commit leaves a coherent, testable route group. Reuse the Calm Lab shell and primitives from the foundation plan, then remove legacy tokens/classes only after repository-wide searches show no consumers.

**Tech Stack:** Next.js App Router 16.2.11, React 19.2.4, TypeScript 5, CSS custom properties, Vitest 4, Playwright 1.62.

## Global Constraints

- Complete `2026-08-10-calm-lab-p0-protocol-integrity.md` and `2026-08-10-calm-lab-foundation-core-workflows.md` first.
- Torsilp remains the only visible UI font across public, workspace, and admin routes.
- Preserve all routes, auth/demo behavior, repositories, soft-delete behavior, evidence labels, and protocol content.
- Use authentic plant imagery and real product data only; keep existing missing-image, loading, and fallback behavior explicit.
- Recompose mobile order and density instead of shrinking desktop layouts.
- Do not claim accessibility, scientific safety, or usability from automated checks alone.
- Delete legacy CSS/token code only after `rg` proves there are no remaining consumers.
- Add no runtime dependency.

---

### Task 1: Migrate public discovery and utility routes

**Files:**
- Modify: `src/app/page.tsx`
- Modify: `src/app/start/page.tsx`
- Modify: `src/app/find/page.tsx`
- Modify: `src/app/search/page.tsx`
- Modify: `src/app/problem/page.tsx`
- Modify: `src/app/substances/page.tsx`
- Modify: `src/app/form/[formId]/page.tsx`
- Modify: `src/components/home/hero-jar.tsx`
- Modify: `src/components/home/hero-jar-scene.tsx`
- Modify: `src/components/home/hero-jar.test.tsx`
- Modify: `src/components/guide/start-list.tsx`
- Modify: `src/components/guide/start-list.test.tsx`
- Modify: `src/components/guide/form-finder.tsx`
- Modify: `src/components/guide/form-finder.test.tsx`
- Modify: `src/components/guide/search-results.tsx`
- Modify: `src/components/guide/search-results.test.tsx`
- Modify: `src/components/guide/problem-list.tsx`
- Modify: `src/components/guide/problem-list.test.tsx`
- Modify: `src/components/guide/substance-list.tsx`
- Modify: `src/components/guide/substance-list.test.tsx`
- Modify: `src/components/guide/form-detail.tsx`
- Modify: `src/components/guide/form-detail.test.tsx`
- Modify: `src/app/calm-lab.css`
- Modify: `src/app/guide.css`

**Interfaces:**
- Uses `GuideShell`, `DataList`, and `StatusNotice` from the foundation plan.
- Public list components preserve existing props and URLs.
- Plant grids use reserved image geometry and explicit loading/missing states without HUD decoration.

- [ ] **Step 1: Add failing public-surface contract tests**

```tsx
it("renders plant discovery with calm list anatomy", () => {
  const html = renderToStaticMarkup(<StartList manuals={manuals} />);
  expect(html).toContain("cl-plant-grid");
  expect(html).toContain("cl-plant-card");
  expect(html).not.toContain("pl-hero-ring");
});

it("keeps long Thai and scientific names in the card", () => {
  const html = renderToStaticMarkup(<StartList manuals={[longNameManual]} />);
  expect(html).toContain(longNameManual.commonName);
  expect(html).toContain(longNameManual.scientificName);
});
```

- [ ] **Step 2: Run the public component tests and verify they fail**

Run: `npm test -- src/components/home/hero-jar.test.tsx src/components/guide/start-list.test.tsx src/components/guide/form-finder.test.tsx src/components/guide/search-results.test.tsx src/components/guide/problem-list.test.tsx src/components/guide/substance-list.test.tsx src/components/guide/form-detail.test.tsx`

Expected: FAIL because public surfaces still use legacy hero/card classes and styling.

- [ ] **Step 3: Recompose discovery and utility surfaces**

Use a quiet hero with authentic plant/lab material, not rings, scanlines, particles, grid overlays, or glow. Apply this anatomy:

```tsx
<section className="cl-page-heading">...</section>
<section className="cl-plant-grid" aria-label="ชนิดพืช">
  {items.map((item) => <PlantCard key={item.slug} item={item} />)}
</section>
```

Implement `PlantCard` as a private function in `start-list.tsx` that consumes the existing resolved-manual item type and preserves the existing `/guide/${slug}` link, image metadata, common name, scientific name, and difficulty copy.

Reserve image aspect ratio before load, keep alt/fallback behavior, and use flat surfaces with one-pixel borders only when containment is needed. Utility lists use section headings/dividers instead of nested cards.

- [ ] **Step 4: Run public tests and render route stress cases**

Run the seven focused test files. Render `/`, `/start`, `/find`, `/search`, `/problem`, `/substances`, and one `/form/[formId]` at 360/768/1280/1600px in light/dark. Test a missing image, long Thai name, long scientific name, empty search result, and bottom-nav overlap.

Expected: tests pass; all routes have one dominant heading and no horizontal overflow.

- [ ] **Step 5: Commit public route migration**

```bash
git add src/app/page.tsx src/app/start/page.tsx src/app/find/page.tsx src/app/search/page.tsx src/app/problem/page.tsx src/app/substances/page.tsx 'src/app/form/[formId]/page.tsx' src/components/home/hero-jar.tsx src/components/home/hero-jar-scene.tsx src/components/home/hero-jar.test.tsx src/components/guide/start-list.tsx src/components/guide/start-list.test.tsx src/components/guide/form-finder.tsx src/components/guide/form-finder.test.tsx src/components/guide/search-results.tsx src/components/guide/search-results.test.tsx src/components/guide/problem-list.tsx src/components/guide/problem-list.test.tsx src/components/guide/substance-list.tsx src/components/guide/substance-list.test.tsx src/components/guide/form-detail.tsx src/components/guide/form-detail.test.tsx src/app/calm-lab.css src/app/guide.css
git commit -m "feat: migrate public routes to calm lab"
```

---

### Task 2: Migrate guide overview and step-reading surfaces

**Files:**
- Modify: `src/app/guide/[slug]/page.tsx`
- Modify: `src/app/guide/[slug]/step/[step]/page.tsx`
- Modify: `src/components/guide/step-map.tsx`
- Modify: `src/components/guide/step-map.test.tsx`
- Modify: `src/components/guide/step-detail.tsx`
- Modify: `src/components/guide/step-detail.test.tsx`
- Modify: `src/components/guide/evidence-badge.tsx`
- Modify: `src/components/guide/evidence-badge.test.tsx`
- Modify: `src/components/guide/illustrations.tsx`
- Modify: `src/components/guide/illustrations.test.tsx`
- Modify: `src/components/guide/rich-text.tsx`
- Modify: `src/components/guide/rich-text.test.tsx`
- Modify: `src/app/calm-lab.css`
- Modify: `src/app/guide.css`

**Interfaces:**
- Guide overview uses comfortable reading density and an ordered step map.
- Evidence badges preserve evidence semantics and add non-color text/state cues.
- Guide step detail remains read-only and does not expose round-only calculators or locked snapshot claims.

- [ ] **Step 1: Add failing hierarchy and evidence tests**

```tsx
it("renders the guide as an ordered calm step map", () => {
  const html = renderToStaticMarkup(<StepMap manual={manual} />);
  expect(html).toContain("<ol");
  expect(html).toContain("cl-step-map");
  expect(html).not.toContain("pl-card");
});

it.each(["species-direct", "adapted", "unsupported"] as const)("%s includes text beyond color", (level) => {
  const html = renderToStaticMarkup(<EvidenceBadge level={level} />);
  expect(html).toContain("cl-evidence-badge");
  expect(html).toMatch(/ตรงพันธุ์|ประยุกต์|ยังไม่มีงานรองรับ/);
});
```

- [ ] **Step 2: Run guide tests and verify they fail**

Run: `npm test -- src/components/guide/step-map.test.tsx src/components/guide/step-detail.test.tsx src/components/guide/evidence-badge.test.tsx src/components/guide/illustrations.test.tsx src/components/guide/rich-text.test.tsx`

Expected: FAIL until guide anatomy and evidence styles move to Calm Lab classes.

- [ ] **Step 3: Implement editorial reading hierarchy**

Use a 720–800px reading measure, intentional section spacing, quiet dividers, and full-width authentic illustrations where they aid the task. Keep one H1, sequential H2/H3 levels, and visible next/previous actions.

```tsx
<article className="cl-guide-article">
  <GuideHeader manual={manual} />
  <StepMap manual={manual} />
  <GuideStartAction slug={manual.slug} />
</article>
```

Do not repeat status color as decorative border on every step. Preserve `RichText` term semantics and accessible links.

Implement `GuideHeader` and `GuideStartAction` as private page-level functions in `src/app/guide/[slug]/page.tsx`; they consume the already resolved manual and preserve the existing `/my/rounds/new?slug=${manual.slug}` target.

- [ ] **Step 4: Run guide tests and browser reading checks**

Run the five focused test files. Render a 15-step guide and a step with long safety notes at 360/768/1280px, test 200% zoom, keyboard order, image missing state, and both themes.

Expected: tests pass; reading measure and heading order remain stable.

- [ ] **Step 5: Commit guide migration**

```bash
git add 'src/app/guide/[slug]/page.tsx' 'src/app/guide/[slug]/step/[step]/page.tsx' src/components/guide/step-map.tsx src/components/guide/step-map.test.tsx src/components/guide/step-detail.tsx src/components/guide/step-detail.test.tsx src/components/guide/evidence-badge.tsx src/components/guide/evidence-badge.test.tsx src/components/guide/illustrations.tsx src/components/guide/illustrations.test.tsx src/components/guide/rich-text.tsx src/components/guide/rich-text.test.tsx src/app/calm-lab.css src/app/guide.css
git commit -m "feat: migrate guide reading surfaces to calm lab"
```

---

### Task 3: Migrate workspace rounds, equipment, and trials

**Files:**
- Modify: `src/app/my/page.tsx`
- Modify: `src/app/my/rounds/page.tsx`
- Modify: `src/app/my/rounds/[roundId]/page.tsx`
- Modify: `src/app/my/rounds/[roundId]/step/[step]/page.tsx`
- Modify: `src/app/my/rounds/legacy/[roundId]/page.tsx`
- Modify: `src/app/my/equipment/page.tsx`
- Modify: `src/app/my/trials/new/page.tsx`
- Modify: `src/app/my/trials/[trialId]/page.tsx`
- Modify: `src/components/rounds/round-list.tsx`
- Modify: `src/components/rounds/round-list.test.tsx`
- Modify: `src/components/rounds/round-progress.tsx`
- Modify: `src/components/rounds/round-progress.test.tsx`
- Modify: `src/components/rounds/legacy-round-view.tsx`
- Modify: `src/components/rounds/legacy-round-view.test.tsx`
- Modify: `src/components/equipment/profile-section.tsx`
- Modify: `src/components/equipment/profile-section.test.tsx`
- Modify: `src/components/equipment/path-summary.tsx`
- Modify: `src/components/equipment/path-summary.test.tsx`
- Modify: `src/components/trials/readiness-gate.tsx`
- Modify: `src/components/trials/jar-allocation-panel.tsx`
- Modify: `src/components/trials/t3-lock-panel.tsx`
- Modify: `src/app/calm-lab.css`
- Modify: `src/app/globals.css`
- Modify: `src/app/guide.css`

**Interfaces:**
- Round lists use `DataList`/compact rows and retain open, soft-delete, confirmation, and legacy behaviors.
- Equipment profile uses `FieldGroup`, `StatusNotice`, and capability-derived states.
- Trial readiness distinguishes ready, blocked, experimental, and legacy with text and structure, not color alone.

- [ ] **Step 1: Add failing workspace state tests**

```tsx
it("round rows expose open and destructive actions with explicit labels", () => {
  const html = renderToStaticMarkup(<RoundList lots={lots} onDelete={noop} />);
  expect(html).toContain("cl-data-row");
  expect(html).toContain("เปิดรอบ");
  expect(html).toContain("ลบรอบ");
});

it("legacy rounds label missing locked data instead of inventing it", () => {
  const html = renderToStaticMarkup(<LegacyRoundView round={legacyRound} />);
  expect(html).toContain("ข้อมูล legacy");
  expect(html).toContain("ไม่มีข้อมูลที่ล็อกไว้");
});
```

- [ ] **Step 2: Run workspace tests and verify they fail**

Run: `npm test -- src/components/rounds/round-list.test.tsx src/components/rounds/round-progress.test.tsx src/components/rounds/legacy-round-view.test.tsx src/components/equipment/profile-section.test.tsx src/components/equipment/path-summary.test.tsx src/components/trials/readiness-gate.test.tsx src/components/trials/jar-allocation-panel.test.tsx src/components/trials/t3-lock-panel.test.tsx`

Expected: FAIL where components still use inline legacy cards or lack explicit Calm Lab state anatomy.

- [ ] **Step 3: Recompose workspace surfaces by task priority**

Round overview prioritizes current step and next action, then preparation summary, then history/destructive actions. Equipment groups fields by capability and shows why a method is unavailable. Trial pages keep blockers adjacent to the action they block.

```tsx
<section className="cl-workspace-section">
  <PageHeading title={title} description={description} action={primaryAction} />
  <StatusNotice tone={readiness.overall === "blocked" ? "blocked" : "success"}>...</StatusNotice>
  <DataList density="compact" items={items} />
</section>
```

- [ ] **Step 4: Run workspace tests and exercise recovery states**

Run the eight focused test files. In demo mode exercise empty rounds, create/open/save/resume, delete confirmation, legacy read-only, missing equipment, prepared rinse, blocked trial, and T3 risk acknowledgement at mobile/desktop and light/dark.

Expected: tests pass; errors preserve input and destructive actions remain confirmed.

- [ ] **Step 5: Commit workspace migration**

```bash
git add src/app/my/page.tsx src/app/my/rounds/page.tsx 'src/app/my/rounds/[roundId]/page.tsx' 'src/app/my/rounds/[roundId]/step/[step]/page.tsx' 'src/app/my/rounds/legacy/[roundId]/page.tsx' src/app/my/equipment/page.tsx src/app/my/trials/new/page.tsx 'src/app/my/trials/[trialId]/page.tsx' src/components/rounds/round-list.tsx src/components/rounds/round-list.test.tsx src/components/rounds/round-progress.tsx src/components/rounds/round-progress.test.tsx src/components/rounds/legacy-round-view.tsx src/components/rounds/legacy-round-view.test.tsx src/components/equipment/profile-section.tsx src/components/equipment/profile-section.test.tsx src/components/equipment/path-summary.tsx src/components/equipment/path-summary.test.tsx src/components/trials/readiness-gate.tsx src/components/trials/readiness-gate.test.tsx src/components/trials/jar-allocation-panel.tsx src/components/trials/jar-allocation-panel.test.tsx src/components/trials/t3-lock-panel.tsx src/components/trials/t3-lock-panel.test.tsx src/app/calm-lab.css src/app/globals.css src/app/guide.css
git commit -m "feat: migrate workspace routes to calm lab"
```

---

### Task 4: Migrate admin, knowledge, research, and dataset surfaces

**Files:**
- Modify: `src/app/admin/pin/page.tsx`
- Modify: `src/app/admin/manual/page.tsx`
- Modify: `src/app/admin/manual/[slug]/page.tsx`
- Modify: `src/app/admin/knowledge/page.tsx`
- Modify: `src/app/admin/knowledge/sources/[sourceId]/page.tsx`
- Modify: `src/app/admin/research/page.tsx`
- Modify: `src/app/admin/dataset-review/page.tsx`
- Modify: `src/components/admin/pin-picker.tsx`
- Modify: `src/components/admin/pin-picker-logic.test.ts`
- Modify: `src/components/knowledge/knowledge-library.tsx`
- Modify: `src/components/knowledge/knowledge-library.test.tsx`
- Modify: `src/components/knowledge/knowledge-source-register.tsx`
- Modify: `src/components/knowledge/knowledge-source-register.test.tsx`
- Modify: `src/components/knowledge/knowledge-source-detail.tsx`
- Modify: `src/components/knowledge/knowledge-audit-viewer.tsx`
- Modify: `src/components/knowledge/knowledge-audit-viewer.test.tsx`
- Modify: `src/components/knowledge/knowledge-research-timeline.tsx`
- Modify: `src/components/research/research-timeline.tsx`
- Modify: `src/components/research/research-timeline.test.tsx`
- Modify: `src/components/dataset/review-queue.tsx`
- Modify: `src/components/dataset/review-queue.test.tsx`
- Modify: `src/components/dataset/preprocessing-jobs.tsx`
- Modify: `src/components/dataset/baseline-training-runs.tsx`
- Modify: `src/app/calm-lab.css`
- Modify: `src/app/globals.css`

**Interfaces:**
- Admin routes use the shared `LabShell`/`AppShell` and compact density.
- Dense records preserve table/list semantics, filtering, review actions, loading, empty, error, and selected states.
- Source/audit details use `DataList` and bounded overflow for machine-readable payloads while still using Torsilp.

- [ ] **Step 1: Add failing dense-surface tests**

```tsx
it("knowledge rows expose selected state without color alone", () => {
  const html = renderToStaticMarkup(<KnowledgeLibrary entries={entries} selectedId="k-1" />);
  expect(html).toContain('aria-current="true"');
  expect(html).toContain("รายการที่เลือก");
});

it("dataset review keeps an explicit empty state", () => {
  const html = renderToStaticMarkup(<ReviewQueue items={[]} onSelect={noop} />);
  expect(html).toContain("cl-empty-state");
  expect(html).toContain("ยังไม่มีรายการรอตรวจ");
});
```

- [ ] **Step 2: Run admin component tests and verify they fail**

Run: `npm test -- src/components/knowledge/knowledge-library.test.tsx src/components/knowledge/knowledge-source-register.test.tsx src/components/knowledge/knowledge-audit-viewer.test.tsx src/components/research/research-timeline.test.tsx src/components/dataset/review-queue.test.tsx src/components/admin/pin-picker-logic.test.ts`

Expected: FAIL where selected/empty states and legacy feature CSS have not moved to Calm Lab.

- [ ] **Step 3: Recompose dense admin interfaces**

Use compact rows, persistent filter labels, visible selected markers, bounded detail panes, and mobile priority ordering. Keep raw payloads scrollable and wrap human-readable labels.

```tsx
<div className="cl-master-detail">
  <section className="cl-master-list">...</section>
  <section className="cl-detail-pane" aria-live="polite">...</section>
</div>
```

At narrow widths, stack list before detail and move the selected record heading to the top of the detail. Preserve review and mutation confirmation behavior.

- [ ] **Step 4: Run admin tests and dense-content checks**

Run the six focused tests. Render each `/admin` route at 360/768/1280/1600px in light/dark with empty, loading, error, selected, long source URL, long Thai claim, and large audit JSON states.

Expected: tests pass; no control or payload causes page-level horizontal overflow.

- [ ] **Step 5: Commit admin migration**

```bash
git add src/app/admin/pin/page.tsx src/app/admin/manual/page.tsx 'src/app/admin/manual/[slug]/page.tsx' src/app/admin/knowledge/page.tsx 'src/app/admin/knowledge/sources/[sourceId]/page.tsx' src/app/admin/research/page.tsx src/app/admin/dataset-review/page.tsx src/components/admin/pin-picker.tsx src/components/admin/pin-picker-logic.test.ts src/components/knowledge/knowledge-library.tsx src/components/knowledge/knowledge-library.test.tsx src/components/knowledge/knowledge-source-register.tsx src/components/knowledge/knowledge-source-register.test.tsx src/components/knowledge/knowledge-source-detail.tsx src/components/knowledge/knowledge-audit-viewer.tsx src/components/knowledge/knowledge-audit-viewer.test.tsx src/components/knowledge/knowledge-research-timeline.tsx src/components/research/research-timeline.tsx src/components/research/research-timeline.test.tsx src/components/dataset/review-queue.tsx src/components/dataset/review-queue.test.tsx src/components/dataset/preprocessing-jobs.tsx src/components/dataset/baseline-training-runs.tsx src/app/calm-lab.css src/app/globals.css
git commit -m "feat: migrate admin routes to calm lab"
```

---

### Task 5: Remove legacy visual sources and add forced-color resilience

**Files:**
- Modify: `src/app/globals.css`
- Modify: `src/app/guide.css`
- Modify: `src/app/calm-lab.css`
- Modify: `src/app/calm-lab-contract.test.ts`

**Interfaces:**
- `calm-lab.css` remains the only source of foundation and semantic values.
- `globals.css` and `guide.css` contain feature composition only and no duplicate theme blocks.
- Forced-colors rules preserve boundaries, focus, selection, and destructive states.

- [ ] **Step 1: Inventory remaining legacy consumers**

Run these searches separately and save their output in the task notes:

```text
rg -n "var\(--pl-|var\(--ink|var\(--surface|var\(--paper|var\(--font-geist|Georgia|Times New Roman" src
rg -n "#[0-9a-fA-F]{3,8}|rgba?\(" src/app/globals.css src/app/guide.css
rg -n "pl-hero-grid|pl-hero-ring|pl-hero-scanline|box-shadow:.*glow|linear-gradient|radial-gradient" src
```

Expected: there are no component consumers outside `calm-lab.css`; remaining results are token definitions or temporary aliases inside the three CSS files.

- [ ] **Step 2: Add failing cleanup assertions**

```ts
it("has no independent legacy theme blocks", () => {
  expect(globalsCss).not.toMatch(/:root\[data-theme=/);
  expect(guideCss).not.toMatch(/:root\[data-theme=/);
});

it("provides forced-color boundaries and focus", () => {
  expect(calmCss).toContain("@media (forced-colors: active)");
  expect(calmCss).toContain("Highlight");
  expect(calmCss).toContain("CanvasText");
});
```

- [ ] **Step 3: Remove aliases only after consumers are gone**

Remove duplicate theme blocks, raw state colors, old font declarations, HUD animations, obsolete aliases, and repeated media-query copies. If Step 1 finds a component consumer, return it to the route-migration task that owns that component before continuing this cleanup task; do not hide the reference with another alias.

Add forced-colors rules such as:

```css
@media (forced-colors: active) {
  :focus-visible { outline: 2px solid Highlight; }
  .cl-method-option[aria-checked="true"] { border: 2px solid Highlight; }
  .cl-status-notice { border: 1px solid CanvasText; }
}
```

- [ ] **Step 4: Re-run searches and the CSS contract**

Run the three searches from Step 1 again and then `npm test -- src/app/calm-lab-contract.test.ts`.

Expected: no independent legacy theme values, font families, or HUD decoration remain; any allowed raw color is documented as media/illustration content rather than UI chrome.

- [ ] **Step 5: Commit visual-source cleanup**

```bash
git add src/app/globals.css src/app/guide.css src/app/calm-lab.css src/app/calm-lab-contract.test.ts
git commit -m "refactor: remove legacy visual system"
```

---

### Task 6: Complete the full-story browser verification matrix

**Files:**
- Modify: `scripts/verify-accessible-ui.mjs`
- Modify: `scripts/verify-protocol-integrity.mjs`
- Create: `scripts/verify-calm-lab.mjs`
- Modify: `package.json`
- Create: `docs/superpowers/verification/2026-08-10-calm-lab-results.md`

**Interfaces:**
- Produces `npm run calm-lab:verify`.
- Each failure includes route, viewport, theme, state/flow, input method, selector, and screenshot path.
- Verification report separates observed browser evidence from scientific or user-research claims.

- [ ] **Step 1: Define the explicit route and state matrix**

```js
const viewports = [
  { name: "mobile", width: 360, height: 800 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "desktop", width: 1280, height: 900 },
  { name: "wide", width: 1600, height: 1000 },
];
const themes = ["light", "dark"];
const publicRoutes = ["/", "/start", "/find", "/search", "/problem", "/substances", "/guide/pink-princess", "/guide/pink-princess/step/8"];
const demoRoutes = ["/my", "/my/equipment", "/my/rounds", "/admin/manual", "/admin/knowledge", "/admin/research", "/admin/dataset-review"];
```

- [ ] **Step 2: Implement contextual failure capture**

Wrap each case so a failure saves a full-page screenshot and throws:

```js
throw new Error(JSON.stringify({ route, viewport: viewport.name, theme, flow, selector, screenshot }, null, 2));
```

Check one main landmark, no page overflow, Torsilp computed family, minimum control size, visible focus, current navigation state, non-color selected state, image dimensions, mobile safe-area padding, and absence of legacy HUD selectors.

- [ ] **Step 3: Exercise complete product flows**

Run keyboard-only and pointer flows for:

1. Public plant selection → guide → start round.
2. Setup pressure/Haiter/NaDCC choices → review → create.
3. Open prep-media/sterilize → confirm preparation → save → reload.
4. Round list → resume → delete confirmation → verify soft deletion.
5. Equipment save failure/retry and prepared rinse review.
6. Trial blocked/readiness/T3 acknowledgement.
7. Admin list/filter/select/detail and empty/error states.
8. Theme switch persistence, system theme, reduced motion, and forced colors.

- [ ] **Step 4: Run the final gate as separate commands and write observed results**

Run:

```text
npm test
npm run lint
npm run build
npm run protocol:verify
npm run ui:verify
npm run calm-lab:verify
git diff --check
```

Record exact command results, rendered viewports/themes, flows/states exercised, corrected issues, and remaining scientific/user-research gaps in `docs/superpowers/verification/2026-08-10-calm-lab-results.md`. Do not use “accessible”, “safe”, or “verified” as an unqualified product claim.

- [ ] **Step 5: Commit final verification evidence**

```bash
git add scripts/verify-accessible-ui.mjs scripts/verify-protocol-integrity.mjs scripts/verify-calm-lab.mjs package.json docs/superpowers/verification/2026-08-10-calm-lab-results.md
git commit -m "test: verify calm lab across the full product"
```
