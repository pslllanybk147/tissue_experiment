# Botanical Atlas Foundation and Primitives Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the global font/theme foundation and shared UI primitives with the approved Botanical Atlas system without changing application behavior.

**Architecture:** `src/app/calm-lab.css` remains the only semantic token source, while `layout.tsx` supplies one local Sarabun variable and common React primitives keep their existing public APIs. Tests first reverse the old Chaeo Hon contract, then shared CSS implements the approved Light/Dark palette, typography, actions, fields, notices, and content-stress rules.

**Tech Stack:** Next.js 16.2.11 App Router, React 19.2.4, TypeScript 5, `next/font/local`, CSS, Vitest 4.1.10, Playwright 1.62.0.

## Global Constraints

- Read `node_modules/next/dist/docs/01-app/01-getting-started/13-fonts.md` and `11-css.md` before editing Next.js or global CSS.
- Use Sarabun local WOFF2 files at weights 400, 500, 600, and 700 with `display: "swap"`.
- No runtime references to MN Chaeo Hon or Torsilp.
- Light and Dark use the exact semantic values in `docs/superpowers/specs/2026-08-11-botanical-atlas-system-redesign-design.md`.
- Body text is 18px/1.7; Thai line-height is never below 1.5; Thai text has no negative letter-spacing.
- Interactive targets are at least 48px; important mobile actions are at least 52px.
- Preserve routes, component props, validation, calculation, persistence, and copy behavior.
- Use `apply_patch` for text edits; do not overwrite unrelated worktree changes.

---

### Task 1: Install Sarabun and replace the foundation contract

**Files:**
- Create: `public/fonts/sarabun/Sarabun-Regular.woff2`
- Create: `public/fonts/sarabun/Sarabun-Medium.woff2`
- Create: `public/fonts/sarabun/Sarabun-SemiBold.woff2`
- Create: `public/fonts/sarabun/Sarabun-Bold.woff2`
- Create: `public/fonts/sarabun/OFL.txt`
- Modify: `src/app/layout.tsx`
- Modify: `src/app/layout.test.ts`
- Modify: `src/app/calm-lab.css`
- Modify: `src/app/calm-lab-contract.test.ts`

**Interfaces:**
- Produces: CSS variable `--font-sarabun` on `<html>` and all `--cl-*` semantic tokens consumed by every later task.
- Preserves: `RootLayout({ children }: Readonly<{ children: React.ReactNode }>)`.

- [ ] **Step 1: Change the font and token tests so the old system fails**

Replace the font assertions with:

```ts
it("loads only the local Sarabun UI font", () => {
  expect(source).toContain('variable: "--font-sarabun"');
  expect(source).toContain("Sarabun-Regular.woff2");
  expect(source).toContain("Sarabun-Medium.woff2");
  expect(source).toContain("Sarabun-SemiBold.woff2");
  expect(source).toContain("Sarabun-Bold.woff2");
  expect(source).not.toMatch(/chae[o]?[-_ ]?hon|torsilp/i);
});
```

Update `calm-lab-contract.test.ts` to assert `--cl-text-body: 18px`, `--cl-control-min: 48px`, the approved Light/Dark action colors, `font-family: var(--font-sarabun)`, and absence of `/font-chaeo-hon|torsilp/i`.

- [ ] **Step 2: Run the focused tests and verify RED**

Run: `npm test -- src/app/layout.test.ts src/app/calm-lab-contract.test.ts`

Expected: FAIL because `layout.tsx` and CSS still reference `--font-chaeo-hon`, 17px body, and 44px controls.

- [ ] **Step 3: Add the four official WOFF2 files and license**

Download exact upstream files from `cadsondemak/Sarabun`:

```powershell
New-Item -ItemType Directory -Force public/fonts/sarabun | Out-Null
Invoke-WebRequest https://raw.githubusercontent.com/cadsondemak/Sarabun/master/fonts/Sarabun-Regular.woff2 -OutFile public/fonts/sarabun/Sarabun-Regular.woff2
Invoke-WebRequest https://raw.githubusercontent.com/cadsondemak/Sarabun/master/fonts/Sarabun-Medium.woff2 -OutFile public/fonts/sarabun/Sarabun-Medium.woff2
Invoke-WebRequest https://raw.githubusercontent.com/cadsondemak/Sarabun/master/fonts/Sarabun-SemiBold.woff2 -OutFile public/fonts/sarabun/Sarabun-SemiBold.woff2
Invoke-WebRequest https://raw.githubusercontent.com/cadsondemak/Sarabun/master/fonts/Sarabun-Bold.woff2 -OutFile public/fonts/sarabun/Sarabun-Bold.woff2
Invoke-WebRequest https://raw.githubusercontent.com/cadsondemak/Sarabun/master/OFL.txt -OutFile public/fonts/sarabun/OFL.txt
```

Verify every response is non-empty with `Get-ChildItem public/fonts/sarabun | Select-Object Name,Length`.

- [ ] **Step 4: Replace the root local font declaration**

Use:

```tsx
const sarabun = localFont({
  src: [
    { path: "../../public/fonts/sarabun/Sarabun-Regular.woff2", weight: "400", style: "normal" },
    { path: "../../public/fonts/sarabun/Sarabun-Medium.woff2", weight: "500", style: "normal" },
    { path: "../../public/fonts/sarabun/Sarabun-SemiBold.woff2", weight: "600", style: "normal" },
    { path: "../../public/fonts/sarabun/Sarabun-Bold.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-sarabun",
  display: "swap",
});
```

Set `<html lang="th" className={sarabun.variable}>` and leave provider/import order unchanged.

- [ ] **Step 5: Replace the token blocks and global typography in `calm-lab.css`**

Implement the full approved token tables. The core rules must include:

```css
body, button, input, select, textarea {
  font-family: var(--font-sarabun), Tahoma, sans-serif;
}
body { font-size: var(--cl-text-body); line-height: 1.7; }
:where(button, input, select, textarea) { min-height: var(--cl-control-min); }
:where(h1, h2, h3, p, li, label, button, a, dd, dt) {
  min-width: 0;
  overflow-wrap: break-word;
  word-break: normal;
}
```

Delete `body * { font-family: ... !important; }`. Keep only explicit `ui-monospace` exceptions for code and machine IDs that contain no Thai.

Add the required motion and high-contrast fallbacks:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation-duration: 0.01ms !important; animation-iteration-count: 1 !important; transition-duration: 0.01ms !important; }
}
@media (forced-colors: active) {
  :where(button, a, input, select, textarea, .cl-status-notice) { border: 1px solid CanvasText; }
  :focus-visible { outline: 3px solid Highlight; outline-offset: 3px; }
}
```

- [ ] **Step 6: Run tests, lint, and build**

Run:

```powershell
npm test -- src/app/layout.test.ts src/app/calm-lab-contract.test.ts
npm run lint
npm run build
```

Expected: all commands PASS and Next build reports no external font request.

- [ ] **Step 7: Commit the foundation**

```powershell
git add public/fonts/sarabun src/app/layout.tsx src/app/layout.test.ts src/app/calm-lab.css src/app/calm-lab-contract.test.ts
git commit -m "feat: add botanical atlas foundation"
```

### Task 2: Apply Botanical Atlas grammar to shared primitives

**Files:**
- Modify: `src/components/common/accessible-action.tsx`
- Modify: `src/components/common/accessible-action.test.tsx`
- Modify: `src/components/common/action-bar.tsx`
- Modify: `src/components/common/field-group.tsx`
- Modify: `src/components/common/status-notice.tsx`
- Modify: `src/components/common/page-heading.tsx`
- Modify: `src/components/common/data-list.tsx`
- Modify: `src/components/common/workflow-shell.tsx`
- Modify: `src/components/common/calm-ui.test.tsx`
- Modify: `src/components/common/accessibility-contract.test.tsx`
- Modify: `src/app/calm-lab.css`

**Interfaces:**
- Consumes: `--font-sarabun`, `--cl-*` semantic tokens from Task 1.
- Produces: stable classes `.cl-button-*`, `.cl-field-group`, `.cl-status-notice`, `.cl-action-bar`, `.cl-page-heading`, `.cl-data-list`, and `.cl-workflow-shell` for Plans 2–3.
- Preserves all existing component prop types and rendered labels.

- [ ] **Step 1: Add failing anatomy and annotation-regression tests**

Add assertions such as:

```tsx
expect(renderToStaticMarkup(<AccessibleAction variant="primary">ไปขั้นถัดไป</AccessibleAction>))
  .toContain("cl-button-primary");
expect(html).not.toMatch(/Primary|Keyboard focus|Destructive|Disabled/);
expect(fieldHtml).toContain('aria-describedby="dose-hint dose-error"');
expect(statusHtml).toContain('data-tone="warning"');
```

In `calm-ui.test.tsx`, assert the action bar preserves secondary-before-primary DOM order and does not emit variant captions.

- [ ] **Step 2: Run focused tests and verify RED**

Run: `npm test -- src/components/common`

Expected: at least the unified class/anatomy assertions FAIL before primitive updates.

- [ ] **Step 3: Normalize primitive markup without changing public props**

Use task-based class mapping in `accessible-action.tsx`:

```ts
const classByVariant = {
  primary: "cl-button-primary",
  secondary: "cl-button-secondary",
  danger: "cl-button-danger",
  quiet: "cl-button-quiet",
} as const;
```

Keep `FieldGroup` order as label → hint → control → error. Keep `StatusNotice` anatomy as symbol/title/copy/action only when the existing API supplies them; do not insert English design labels.

- [ ] **Step 4: Implement shared component CSS and states**

Define default, hover, focus-visible, active, disabled, loading-compatible, danger, and narrow-container behavior. Core action rules:

```css
.cl-button-primary,
.cl-button-secondary,
.cl-button-danger,
.cl-button-quiet {
  min-height: 48px;
  padding: 10px 16px;
  border-radius: 0;
  font-size: var(--cl-text-label);
  font-weight: 700;
  line-height: 1.45;
  white-space: normal;
}
```

Use 5px inline-start borders plus symbols/text for notices. Ensure field units use a non-overlapping grid group instead of absolute positioning.

- [ ] **Step 5: Run shared tests and content-stress checks**

Run:

```powershell
npm test -- src/components/common
npm test -- src/app/calm-lab-contract.test.ts
npm run lint
```

Expected: PASS; no primitive snapshot contains English design annotations.

- [ ] **Step 6: Commit shared primitives**

```powershell
git add src/components/common src/app/calm-lab.css
git commit -m "feat: restyle shared botanical atlas primitives"
```

### Task 3: Upgrade automated UI verification for Sarabun and overlap detection

**Files:**
- Modify: `scripts/verify-accessible-ui.mjs`
- Modify: `scripts/verify-calm-lab.mjs`
- Modify: `package.json`
- Create: `scripts/verify-botanical-atlas.mjs`

**Interfaces:**
- Consumes: shared classes and Sarabun foundation from Tasks 1–2.
- Produces: `npm run atlas:verify`, the required browser gate for Plans 2–3.

- [ ] **Step 1: Add Sarabun, 320px, and overlap assertions before changing implementation**

Change the body-family assertion to `/sarabun/i`, add `{ name: "minimum-mobile", width: 320, height: 800 }`, raise control floors to 48px, and collect clipped/overlapping text:

```js
const clippedText = [...document.querySelectorAll("h1,h2,h3,h4,p,li,label,button,a,dt,dd")]
  .filter(visible)
  .filter((element) => element.scrollWidth > element.clientWidth + 1
    && getComputedStyle(element).overflowX !== "auto")
  .map((element) => (element.textContent ?? "").trim().slice(0, 80));
```

Fail when `clippedText.length > 0` or horizontal overflow exceeds 1px.

The viewport inventory must contain the exact acceptance widths:

```js
const viewports = [
  { name: "desktop", width: 1440, height: 1000 },
  { name: "tablet-wide", width: 1024, height: 900 },
  { name: "tablet", width: 768, height: 900 },
  { name: "mobile", width: 390, height: 844 },
  { name: "minimum-mobile", width: 320, height: 800 },
];
```

- [ ] **Step 2: Run the existing verifier and confirm it fails on stale assumptions**

Run: `npm run ui:verify`

Expected: FAIL until the script stops requiring Chaeo Hon and all inspected controls meet 48px.

- [ ] **Step 3: Create the Botanical Atlas orchestration script**

Copy `scripts/verify-calm-lab.mjs` to `scripts/verify-botanical-atlas.mjs` so server startup/shutdown remains identical, then replace only its final execution/report block with:

```js
try {
  await ensureServer();
  if (run("scripts/verify-protocol-integrity.mjs")) {
    run("scripts/verify-accessible-ui.mjs");
  }
} finally {
  stopServer();
}

if (process.exitCode) throw new Error("Botanical Atlas browser verification failed");
console.log("Botanical Atlas browser verification passed");
```

Add the package script:

```json
"atlas:verify": "node scripts/verify-botanical-atlas.mjs"
```

Do not remove existing scripts yet; Plan 3 removes aliases only after all routes migrate.

- [ ] **Step 4: Run the foundation browser gate**

Run: `$env:UI_VIEWPORT='desktop'; npm run atlas:verify`

Expected: PASS for the currently migrated foundation routes and write screenshots under `work/ui-audit`.

- [ ] **Step 5: Commit verifier changes**

```powershell
git add scripts/verify-accessible-ui.mjs scripts/verify-botanical-atlas.mjs package.json
git commit -m "test: verify botanical atlas rendering"
```

## Plan 1 Completion Gate

Run:

```powershell
npm test
npm run lint
npm run build
$env:UI_VIEWPORT='desktop'; npm run atlas:verify
$env:UI_VIEWPORT='minimum-mobile'; npm run atlas:verify
git diff --check
```

Expected: all PASS; the worktree contains no unintended files, and the app renders Sarabun with the approved foundation in both themes.
