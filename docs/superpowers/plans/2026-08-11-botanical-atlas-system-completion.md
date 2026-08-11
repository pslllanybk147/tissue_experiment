# Botanical Atlas System Completion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Complete Botanical Atlas migration across equipment, trials, admin, knowledge, dataset, tables, and remaining routes, then remove unreachable legacy visual rules and produce full verification evidence.

**Architecture:** Continue using the foundation/primitives from Plans 1–2, migrate route families by shared surface type, then use source scans plus browser route inventory to safely delete legacy font/color rules. Final verification separates automated evidence from rendered observations.

**Tech Stack:** Next.js 16.2.11, React 19.2.4, TypeScript, CSS, Vitest, Playwright, existing verification scripts.

## Global Constraints

- Plans 1–2 and their completion gates must pass first.
- Preserve domain models, repositories, Firebase behavior, routes, permissions, and scientific copy.
- Every visible route must use Sarabun and semantic `--cl-*` tokens in Light/Dark.
- No English design annotations in production; no Chaeo Hon/Torsilp runtime references.
- Verify 1440, 1024, 768, 390, and 320px plus 200% zoom/content stress.

---

### Task 1: Migrate equipment, trials, lists, and remaining user workflows

**Files:**
- Modify: `src/components/equipment/profile-section.tsx`
- Modify: `src/components/equipment/profile-section.test.tsx`
- Modify: `src/components/equipment/path-summary.tsx`
- Modify: `src/components/equipment/path-summary.test.tsx`
- Modify: `src/components/equipment/rinse-preparation-card.tsx`
- Modify: `src/components/trials/readiness-gate.tsx`
- Modify: `src/components/trials/readiness-gate.test.tsx`
- Modify: `src/components/trials/jar-allocation-panel.tsx`
- Modify: `src/components/trials/jar-allocation-panel.test.tsx`
- Modify: `src/components/trials/t3-lock-panel.tsx`
- Modify: `src/components/rounds/round-list.tsx`
- Modify: `src/components/rounds/round-list.test.tsx`
- Modify: `src/components/rounds/legacy-round-view.tsx`
- Modify: `src/app/globals.css`

**Interfaces:**
- Consumes: Plan 1 primitives and Plan 2 shell/forms.
- Produces: consistent list, readiness, allocation, and equipment surfaces.
- Preserves: equipment data, trial gates, round links, readiness decisions, and legacy display behavior.

- [ ] **Step 1: Add failing surface-contract tests**

Assert each surface uses shared heading/notice/action classes, labels remain Thai, and long inventory/trial names are not wrapped in `white-space: nowrap` containers.

```tsx
expect(html).toContain("cl-atlas-data-list");
expect(html).toContain("cl-status-notice");
expect(html).not.toMatch(/white-space:\s*nowrap/);
expect(html).not.toMatch(/Primary|Keyboard focus|Destructive|Disabled/);
```

- [ ] **Step 2: Run focused tests and verify RED**

Run: `npm test -- src/components/equipment src/components/trials src/components/rounds/round-list.test.tsx src/components/rounds/legacy-round-view.test.tsx`

- [ ] **Step 3: Recompose the surfaces with divider-led lists and semantic notices**

Keep handlers and data mapping unchanged. Use label/value rows on mobile and reserve cards for readiness/action units only.

```tsx
<div className="cl-atlas-data-list">
  <DataList
    items={items.map((item) => ({ term: item.label, detail: item.value }))}
    density="comfortable"
  />
</div>
```

Keep the existing `DataList({ items, density })` public API; do not invent a second data-list API.

- [ ] **Step 4: Add responsive CSS and run tests**

Add and verify:

```css
.cl-atlas-data-list > * { border-block-end: 1px solid var(--cl-border); padding-block: 16px; }
@media (max-width: 767px) {
  .cl-atlas-data-list > * { display: grid; grid-template-columns: 1fr; gap: 4px; }
}
```

Run the focused tests plus `$env:UI_VIEWPORT='iphone-12'; npm run atlas:verify`.

- [ ] **Step 5: Commit user workflow completion**

```powershell
git add src/components/equipment src/components/trials src/components/rounds/round-list* src/components/rounds/legacy-round-view* src/app/globals.css
git commit -m "feat: complete botanical atlas user workflows"
```

### Task 2: Migrate admin, knowledge, research, and dataset surfaces

**Files:**
- Modify: `src/components/knowledge/knowledge-library.tsx`
- Modify: `src/components/knowledge/knowledge-library.test.tsx`
- Modify: `src/components/knowledge/knowledge-audit-viewer.tsx`
- Modify: `src/components/knowledge/knowledge-audit-viewer.test.tsx`
- Modify: `src/components/knowledge/knowledge-source-register.tsx`
- Modify: `src/components/knowledge/knowledge-source-register.test.tsx`
- Modify: `src/components/knowledge/knowledge-source-detail.tsx`
- Modify: `src/components/knowledge/knowledge-research-timeline.tsx`
- Modify: `src/components/research/research-register.tsx`
- Modify: `src/components/research/research-register.test.tsx`
- Modify: `src/components/dataset/review-queue.tsx`
- Modify: `src/components/dataset/review-queue.test.tsx`
- Modify: `src/components/dataset/training-readiness-panel.tsx`
- Modify: `src/components/dataset/training-readiness-panel.test.tsx`
- Modify: `src/components/dataset/baseline-training-runs.tsx`
- Modify: `src/components/dataset/preprocessing-jobs.tsx`
- Modify: `src/components/admin/pin-picker.tsx`
- Modify: `src/app/globals.css`

**Interfaces:**
- Consumes: Botanical Atlas shell, fields, notices, buttons, data-list, and table rules.
- Produces: migrated admin/data surfaces for all `/admin/*` routes.
- Preserves: filters, selected records, audit details, dataset actions, PIN logic, and permissions.

- [ ] **Step 1: Add failing table/filter/state tests**

Assert accessible labels, table headings, selected/error/empty states, shared Botanical Atlas classes, and absence of old font names/English design captions.

```tsx
expect(html).toContain('class="cl-atlas-table-wrap"');
expect(html).toMatch(/<th[^>]*scope="col"/);
expect(html).toContain('aria-label="ค้นหา"');
expect(html).not.toMatch(/font-chaeo-hon|torsilp|Primary|Keyboard focus|Destructive|Disabled/i);
```

- [ ] **Step 2: Run admin/data tests and verify RED**

Run: `npm test -- src/components/knowledge src/components/research src/components/dataset src/components/admin`

- [ ] **Step 3: Recompose admin surfaces by shared anatomy**

Use one route heading, filter row, result table/list, and contextual detail region. On mobile, convert record-oriented tables to label/value rows; keep comparison tables horizontally scrollable with visible headers.

```tsx
<section aria-labelledby="results-heading">
  <PageHeading title={title} />
  <form className="cl-atlas-filter-row" role="search">{filters}</form>
  <div className="cl-atlas-table-wrap" tabIndex={0}>{results}</div>
  {selected ? <aside className="cl-atlas-context">{detail}</aside> : null}
</section>
```

- [ ] **Step 4: Implement table stress behavior**

Ensure table wrappers own horizontal scrolling, cells use normal Thai wrapping where comparison is not harmed, and long IDs use explicit ellipsis/title or scroll behavior.

```css
.cl-atlas-table-wrap { max-width: 100%; overflow-x: auto; }
.cl-atlas-table-wrap table { width: 100%; border-collapse: collapse; }
.cl-atlas-table-wrap thead th { position: sticky; inset-block-start: 0; background: var(--cl-surface); }
.cl-atlas-table-wrap :is(th, td) { min-width: 0; overflow-wrap: break-word; word-break: normal; }
.cl-machine-id { font-family: ui-monospace, monospace; overflow-wrap: anywhere; }
```

- [ ] **Step 5: Run tests and browser verification**

Run:

```powershell
npm test -- src/components/knowledge src/components/research src/components/dataset src/components/admin
$env:UI_VIEWPORT='desktop'; npm run atlas:verify
$env:UI_VIEWPORT='minimum-mobile'; npm run atlas:verify
```

- [ ] **Step 6: Commit admin migration**

```powershell
git add src/components/knowledge src/components/research src/components/dataset src/components/admin src/app/globals.css
git commit -m "feat: migrate admin surfaces to botanical atlas"
```

### Task 3: Remove legacy visual rules and lock the route inventory

**Files:**
- Modify: `src/app/globals.css`
- Modify: `src/app/guide.css`
- Modify: `src/app/calm-lab.css`
- Modify: `src/app/calm-lab-contract.test.ts`
- Modify: `src/app/layout.test.ts`
- Modify: `scripts/verify-accessible-ui.mjs`
- Modify: `scripts/report-unwrapped-terms.mjs`
- Modify: `package.json`

**Interfaces:**
- Consumes: all migrated routes from Tasks 1–2 and Plans 1–2.
- Produces: one reachable visual system and a route inventory verified by `atlas:verify`.

- [ ] **Step 1: Add failing source-cleanup tests**

Add scans over `src/app` and `src/components`:

```ts
expect(runtimeSource).not.toMatch(/font-chaeo-hon|MNChaeoHon|torsilp/i);
expect(runtimeSource).not.toMatch(/body\s*\*\s*\{[^}]*font-family[^}]*!important/s);
expect(runtimeSource).not.toMatch(/Primary|Keyboard focus|Destructive|Disabled/);
```

Exclude test/spec files from the runtime scan.

- [ ] **Step 2: Run cleanup tests and record every remaining match**

Run:

```powershell
npm test -- src/app/calm-lab-contract.test.ts src/app/layout.test.ts
rg -n "font-chaeo-hon|MNChaeoHon|torsilp|body \*" src/app src/components
```

Expected: FAIL/list matches until legacy rules are removed.

- [ ] **Step 3: Delete only unreachable duplicate rules**

For each match, trace its class to TSX with `rg` before removal. Keep behavior-bearing layout selectors; replace their color/type declarations with semantic tokens. Do not bulk-delete selector blocks without usage evidence.

```powershell
$selectors = rg -o --no-filename '\.[a-zA-Z][a-zA-Z0-9_-]+' src/app/globals.css src/app/guide.css src/app/calm-lab.css | Sort-Object -Unique
foreach ($selector in $selectors) {
  $className = $selector.Substring(1)
  if (-not (rg -l --fixed-strings $className src/app src/components)) { $selector }
}
```

Review this candidate list manually; remove a selector only after confirming it is absent from runtime TS/TSX and not constructed dynamically.

- [ ] **Step 4: Expand browser route inventory**

Add every current page under `src/app` except API routes and parameter samples already represented. Include `/my/rounds/new`, `/my/trials/new`, `/form/climbing-vine-visible-node`, and representative dynamic detail routes.

```js
const requiredRoutes = [
  "/", "/guide", "/find", "/start", "/problem", "/search", "/substances",
  "/my", "/my/rounds/new", "/my/trials/new", "/form/climbing-vine-visible-node",
];
for (const route of requiredRoutes) {
  if (!routes.includes(route)) throw new Error(`Missing UI verification route: ${route}`);
}
```

- [ ] **Step 5: Run cleanup contract and full browser inventory**

Run `npm test -- src/app/calm-lab-contract.test.ts src/app/layout.test.ts` and `npm run atlas:verify`.

- [ ] **Step 6: Commit cleanup**

```powershell
git add src/app src/components scripts package.json
git commit -m "refactor: remove legacy visual system rules"
```

### Task 4: Perform final verification and write evidence

**Files:**
- Create: `docs/superpowers/verification/2026-08-11-botanical-atlas-results.md`

**Interfaces:**
- Consumes: completed implementation and `atlas:verify`.
- Produces: reproducible verification record; no runtime interface changes.

- [ ] **Step 1: Run the complete automated gate**

```powershell
npm test
npm run lint
npm run build
npm run protocol:verify
npm run atlas:verify
npm run firebase:verify
git diff --check
```

Expected: all PASS. If Firebase verification is unavailable because of JDK/emulator environment, record the exact command/error and do not claim it passed.

- [ ] **Step 2: Inspect rendered screenshots and primary flows**

Review `work/ui-audit` at 1440, 1024, 768, 390, and 320px in both themes. Exercise theme toggle, keyboard Tab order, long Thai content, 200% browser zoom, form error, disabled action, upload picker, success, warning, blocked, loading, empty, and destructive states.

- [ ] **Step 3: Write the verification record with observed evidence**

The document must list commit, commands/results, viewport/theme matrix, inspected routes/states, screenshot directory, observed defects fixed, and remaining untested limitations. It must not call automated screenshots user research or scientific validation.

```markdown
# Botanical Atlas Verification Results

## Revision
- Commit: `<git rev-parse HEAD>`

## Automated gates
| Command | Result | Evidence |
| --- | --- | --- |

## Render matrix
| Width | Light | Dark | 200% zoom | Notes |
| --- | --- | --- | --- | --- |

## Routes and states inspected
## Defects found and fixed
## Remaining limitations
```

- [ ] **Step 4: Commit verification evidence**

```powershell
git add docs/superpowers/verification/2026-08-11-botanical-atlas-results.md
git commit -m "docs: record botanical atlas verification"
```

## Plan 3 Completion Gate

Confirm `git status --short` is clean, `git log --oneline` shows all planned commits, and every Acceptance Criterion in the design spec maps to a passing command or observed browser check before merge/push.
