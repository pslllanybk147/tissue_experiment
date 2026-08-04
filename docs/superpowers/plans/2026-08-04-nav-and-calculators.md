# Nav Bar + Calculator Overlay Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a responsive primary navigation (bottom tab bar on mobile, top bar on desktop) and a floating calculator overlay with all three unit calculators (medium recipe, working stock, haiter) to the public/user zone of Plantlover Lab, per `docs/superpowers/specs/2026-08-03-nav-and-calculators-design.md`.

**Architecture:** New client components live in `src/components/nav/` (navigation + overlay state) and `src/components/calculators/` (the three calculator forms + the overlay shell). `GuideShell` (the shared chrome already used by every public/user route) is edited once to mount a `CalculatorOverlayProvider`, render `PrimaryNav`, and render `CalculatorOverlay`. Interactive open/close/screen-switching state is a pure reducer, unit-tested directly; component tests use `renderToStaticMarkup` per project convention (no jsdom) and rely on optional `initial*` props to render each state deterministically.

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript, Vitest (Node environment, no jsdom), existing `--pl-*` CSS custom-property design system in `src/app/guide.css`.

## Global Constraints

- Test command is `npm test` (`vitest run`). No jsdom, no `@testing-library/react` — tests use `renderToStaticMarkup` from `react-dom/server` and assert on HTML substrings only. Interaction (click/drag/breakpoint) is verified manually via `npm run ui:verify`, not in unit tests.
- Path alias `@/` maps to `src/` (both `tsconfig.json` and `vitest.config.ts`).
- All new/edited files must pass `npm run lint` (ESLint via `eslint-config-next`, includes `react-hooks/exhaustive-deps`).
- `medium-calculator.tsx` (`src/components/rounds/medium-calculator.tsx`) is reused unmodified — do not edit it.
- New CSS classes must NOT reuse `.pl-card`/`.pl-chip` (the "hard" 2.5px-border/offset-shadow style) — use the new soft tokens/classes introduced in Task 1, per spec §5.
- Every design token added to `src/app/guide.css` must be mirrored in all four existing theme blocks: `:root`, `@media (prefers-color-scheme: dark) { :root {...} }`, `:root[data-theme="dark"]`, `:root[data-theme="light"]`.
- Thai UI copy only, matching the existing tone (direct, plain, no jargon without explanation) — mirror the Thai strings already used in `medium-calculator.tsx` where a similar concept exists.

---

## File Structure

```
src/app/guide.css                                            (edit)
src/components/guide/guide-shell.tsx                          (edit)
src/components/guide/guide-shell.test.tsx                     (edit)

src/components/nav/overlay-state.ts                           (new — pure reducer)
src/components/nav/overlay-state.test.ts                      (new)
src/components/nav/calculator-overlay-context.tsx              (new — Provider + hook)
src/components/nav/calculator-overlay-context.test.tsx         (new)
src/components/nav/nav-items.ts                                (new — pure data)
src/components/nav/primary-nav.tsx                              (new)
src/components/nav/primary-nav.test.tsx                         (new)

src/components/calculators/calculator-field.tsx                 (new — shared input, used by the two new forms only)
src/components/calculators/calculator-field.test.tsx             (new)
src/components/calculators/working-stock-calculator.tsx          (new)
src/components/calculators/working-stock-calculator.test.tsx     (new)
src/components/calculators/haiter-calculator.tsx                 (new)
src/components/calculators/haiter-calculator.test.tsx             (new)
src/components/calculators/calculator-overlay.tsx                 (new)
src/components/calculators/calculator-overlay.test.tsx            (new)
```

---

### Task 1: Soft design tokens + shared nav/overlay CSS

**Files:**
- Modify: `src/app/guide.css`

**Interfaces:**
- Produces: CSS custom properties `--pl-line-soft`, `--pl-shadow-soft` (defined in all four theme blocks). CSS classes: `.pl-nav-desktop`, `.pl-nav-mobile`, `.pl-nav-item`, `.pl-overlay-root`, `.pl-overlay-backdrop`, `.pl-overlay-panel`, `.pl-overlay-handle`, `.pl-overlay-header`, `.pl-overlay-back`, `.pl-overlay-close`, `.pl-overlay-body`, `.pl-calc-picker-grid`, `.pl-calc-picker-card`, `.pl-soft-card`, `.pl-calc-tabs`, `.pl-calc-tab`. All later tasks depend on these exact class names.

This task is pure CSS with no test file (the project has no CSS unit tests — `guide.css` isn't imported by any test). Verification is via `npm run lint` (no-op for CSS) and later tasks' component tests asserting these class names appear in rendered HTML, plus final manual `npm run ui:verify` in Task 10.

- [ ] **Step 1: Add `--pl-line-soft` and `--pl-shadow-soft` to the four theme blocks**

Open `src/app/guide.css`. In the `:root { ... }` block (starts line 1), after the line `--pl-agar: #a8e6c1;` (line 18), add:

```css
  --pl-line-soft: #d8cfba;
  --pl-shadow-soft: rgba(29, 26, 21, 0.12);
```

In the `@media (prefers-color-scheme: dark) { :root { ... } }` block, after its `--pl-agar: #7ca85e;` line — wait, check the actual value first: it's `--pl-agar: #3f7a58;` (line 39). Add directly after it:

```css
    --pl-line-soft: #3a352a;
    --pl-shadow-soft: rgba(0, 0, 0, 0.35);
```

In the `:root[data-theme="dark"] { ... }` block, after its `--pl-agar: #3f7a58;` line (line 60), add:

```css
  --pl-line-soft: #3a352a;
  --pl-shadow-soft: rgba(0, 0, 0, 0.35);
```

In the `:root[data-theme="light"] { ... }` block, after its `--pl-agar: #a8e6c1;` line (line 80), add:

```css
  --pl-line-soft: #d8cfba;
  --pl-shadow-soft: rgba(29, 26, 21, 0.12);
```

- [ ] **Step 2: Append the new nav/overlay classes at the end of the file**

Add this block at the very end of `src/app/guide.css` (after the existing `@media (prefers-reduced-motion: reduce)` block):

```css

/* ระบบนำทางหลัก: bottom tab bar บนมือถือ, แถบบนเดสก์ท็อป */
.pl-nav-desktop {
  display: none;
  align-items: center;
  gap: 4px;
}

.pl-nav-mobile {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 20;
  display: flex;
  justify-content: space-around;
  background: var(--pl-card);
  border-top: 1.5px solid var(--pl-line-soft);
  padding: 8px 12px calc(8px + env(safe-area-inset-bottom));
}

.pl-nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  font-size: 11px;
  font-weight: 600;
  color: var(--pl-ink-3);
  text-decoration: none;
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px 10px;
  border-radius: 12px;
}

.pl-nav-item[aria-current="page"] {
  color: var(--pl-leaf);
}

@media (min-width: 768px) {
  .pl-nav-desktop {
    display: flex;
  }

  .pl-nav-mobile {
    display: none;
  }
}

@media (max-width: 767px) {
  .pl-wrap {
    padding-bottom: 96px;
  }
}

/* เครื่องคำนวณลอยทับ (overlay) */
.pl-overlay-root {
  position: fixed;
  inset: 0;
  z-index: 30;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

@media (min-width: 768px) {
  .pl-overlay-root {
    align-items: center;
  }
}

.pl-overlay-backdrop {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  border: none;
  padding: 0;
  cursor: pointer;
}

.pl-overlay-panel {
  position: relative;
  width: 100%;
  max-height: 85vh;
  overflow-y: auto;
  background: var(--pl-card);
  border: 1.5px solid var(--pl-line-soft);
  border-radius: 24px 24px 0 0;
  box-shadow: 0 8px 24px var(--pl-shadow-soft);
  padding: 12px 18px 24px;
}

@media (min-width: 768px) {
  .pl-overlay-panel {
    max-width: 480px;
    border-radius: 20px;
  }
}

.pl-overlay-handle {
  display: block;
  width: 40px;
  height: 5px;
  margin: 0 auto 10px;
  border-radius: 3px;
  border: none;
  background: var(--pl-line-soft);
  cursor: pointer;
}

.pl-overlay-header {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
}

.pl-overlay-back,
.pl-overlay-close {
  border: 1.5px solid var(--pl-line-soft);
  border-radius: 999px;
  background: var(--pl-card);
  color: var(--pl-ink);
  width: 34px;
  height: 34px;
  font-size: 16px;
  cursor: pointer;
}

.pl-overlay-back {
  margin-right: auto;
}

.pl-overlay-body {
  margin-top: 10px;
}

.pl-calc-picker-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.pl-calc-picker-card {
  display: block;
  text-align: left;
  cursor: pointer;
  width: 100%;
}

.pl-soft-card {
  background: var(--pl-card);
  border: 1.5px solid var(--pl-line-soft);
  border-radius: 20px;
  padding: 18px;
  box-shadow: 0 8px 24px var(--pl-shadow-soft);
}

.pl-calc-tabs {
  display: flex;
  gap: 8px;
  margin-top: 10px;
}

.pl-calc-tab {
  border: 1.5px solid var(--pl-line-soft);
  border-radius: 999px;
  padding: 6px 14px;
  background: var(--pl-card);
  color: var(--pl-ink-2);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}

.pl-calc-tab[aria-selected="true"] {
  background: var(--pl-leaf);
  color: #ffffff;
  border-color: var(--pl-leaf);
}

.pl-nav-item:focus-visible,
.pl-overlay-close:focus-visible,
.pl-overlay-back:focus-visible,
.pl-overlay-handle:focus-visible,
.pl-overlay-backdrop:focus-visible,
.pl-calc-picker-card:focus-visible,
.pl-calc-tab:focus-visible {
  outline: 3px solid var(--pl-ink);
  outline-offset: 3px;
}
```

- [ ] **Step 3: Verify the file has no syntax errors**

Run: `npm run lint`
Expected: no new errors (ESLint doesn't lint `.css`, but this confirms the command still runs clean, catching any accidental JS/TS breakage from the edit tool).

- [ ] **Step 4: Commit**

```bash
git add src/app/guide.css
git commit -m "style: add soft nav/overlay design tokens and CSS classes"
```

---

### Task 2: Overlay state — pure reducer

**Files:**
- Create: `src/components/nav/overlay-state.ts`
- Test: `src/components/nav/overlay-state.test.ts`

**Interfaces:**
- Produces: `type CalculatorScreen = "picker" | "medium" | "working-stock" | "haiter"`, `type OverlayState = { isOpen: boolean; screen: CalculatorScreen }`, `type OverlayAction = { type: "open" } | { type: "close" } | { type: "select"; screen: Exclude<CalculatorScreen, "picker"> } | { type: "back" }`, `const initialOverlayState: OverlayState`, `function overlayReducer(state: OverlayState, action: OverlayAction): OverlayState`. Task 3 consumes all of these directly.

- [ ] **Step 1: Write the failing tests**

Create `src/components/nav/overlay-state.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { initialOverlayState, overlayReducer } from "./overlay-state";

describe("overlayReducer", () => {
  it("เริ่มต้นปิดอยู่ที่หน้า picker", () => {
    expect(initialOverlayState).toEqual({ isOpen: false, screen: "picker" });
  });

  it("open เปิด overlay และตั้งจอเป็น picker เสมอ", () => {
    const state = overlayReducer({ isOpen: false, screen: "haiter" }, { type: "open" });
    expect(state).toEqual({ isOpen: true, screen: "picker" });
  });

  it("close ปิด overlay และรีเซ็ตจอกลับไป picker", () => {
    const state = overlayReducer({ isOpen: true, screen: "medium" }, { type: "close" });
    expect(state).toEqual({ isOpen: false, screen: "picker" });
  });

  it("select เปลี่ยนจอโดยไม่ปิด overlay", () => {
    const state = overlayReducer({ isOpen: true, screen: "picker" }, { type: "select", screen: "working-stock" });
    expect(state).toEqual({ isOpen: true, screen: "working-stock" });
  });

  it("back กลับไปหน้า picker โดยไม่ปิด overlay", () => {
    const state = overlayReducer({ isOpen: true, screen: "haiter" }, { type: "back" });
    expect(state).toEqual({ isOpen: true, screen: "picker" });
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx vitest run src/components/nav/overlay-state.test.ts`
Expected: FAIL — `overlay-state.ts` does not exist yet (module not found).

- [ ] **Step 3: Write the implementation**

Create `src/components/nav/overlay-state.ts`:

```ts
export type CalculatorScreen = "picker" | "medium" | "working-stock" | "haiter";

export type OverlayState = {
  isOpen: boolean;
  screen: CalculatorScreen;
};

export type OverlayAction =
  | { type: "open" }
  | { type: "close" }
  | { type: "select"; screen: Exclude<CalculatorScreen, "picker"> }
  | { type: "back" };

export const initialOverlayState: OverlayState = { isOpen: false, screen: "picker" };

export function overlayReducer(state: OverlayState, action: OverlayAction): OverlayState {
  switch (action.type) {
    case "open":
      return { isOpen: true, screen: "picker" };
    case "close":
      return { isOpen: false, screen: "picker" };
    case "select":
      return { ...state, screen: action.screen };
    case "back":
      return { ...state, screen: "picker" };
    default:
      return state;
  }
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npx vitest run src/components/nav/overlay-state.test.ts`
Expected: PASS (5 tests)

- [ ] **Step 5: Commit**

```bash
git add src/components/nav/overlay-state.ts src/components/nav/overlay-state.test.ts
git commit -m "feat: add pure reducer for calculator overlay state"
```

---

### Task 3: Calculator overlay context + provider hook

**Files:**
- Create: `src/components/nav/calculator-overlay-context.tsx`
- Test: `src/components/nav/calculator-overlay-context.test.tsx`

**Interfaces:**
- Consumes: `overlayReducer`, `initialOverlayState`, `OverlayState`, `CalculatorScreen` from `./overlay-state` (Task 2).
- Produces: `function CalculatorOverlayProvider({ children, initialState }: { children: ReactNode; initialState?: OverlayState }): JSX.Element`, `function useCalculatorOverlay(): { state: OverlayState; open: () => void; close: () => void; select: (screen: Exclude<CalculatorScreen, "picker">) => void; back: () => void }`. Tasks 4 (`PrimaryNav`), 6/7 (calculator forms via overlay), and 8 (`CalculatorOverlay`) all consume `useCalculatorOverlay`. Task 9 (`GuideShell`) consumes `CalculatorOverlayProvider`. The `initialState` prop exists solely so tests (and Task 8's overlay) can render a specific screen without simulating clicks.

- [ ] **Step 1: Write the failing tests**

Create `src/components/nav/calculator-overlay-context.test.tsx`:

```tsx
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { CalculatorOverlayProvider, useCalculatorOverlay } from "./calculator-overlay-context";

function Probe() {
  const { state } = useCalculatorOverlay();
  return <p>{state.isOpen ? "open" : "closed"}:{state.screen}</p>;
}

describe("CalculatorOverlayProvider", () => {
  it("เริ่มต้นปิดอยู่ที่หน้า picker เมื่อไม่ส่ง initialState", () => {
    const html = renderToStaticMarkup(
      <CalculatorOverlayProvider>
        <Probe />
      </CalculatorOverlayProvider>,
    );
    expect(html).toContain("closed:picker");
  });

  it("รับ initialState เพื่อ render จอใดจอหนึ่งตรง ๆ โดยไม่ต้องจำลองคลิก", () => {
    const html = renderToStaticMarkup(
      <CalculatorOverlayProvider initialState={{ isOpen: true, screen: "haiter" }}>
        <Probe />
      </CalculatorOverlayProvider>,
    );
    expect(html).toContain("open:haiter");
  });

  it("throw ถ้าเรียก useCalculatorOverlay นอก Provider", () => {
    expect(() => renderToStaticMarkup(<Probe />)).toThrow(
      "useCalculatorOverlay must be used within CalculatorOverlayProvider",
    );
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx vitest run src/components/nav/calculator-overlay-context.test.tsx`
Expected: FAIL — module not found.

- [ ] **Step 3: Write the implementation**

Create `src/components/nav/calculator-overlay-context.tsx`:

```tsx
"use client";

import { createContext, useContext, useReducer, type ReactNode } from "react";
import {
  initialOverlayState,
  overlayReducer,
  type CalculatorScreen,
  type OverlayState,
} from "./overlay-state";

type CalculatorOverlayValue = {
  state: OverlayState;
  open: () => void;
  close: () => void;
  select: (screen: Exclude<CalculatorScreen, "picker">) => void;
  back: () => void;
};

const CalculatorOverlayContext = createContext<CalculatorOverlayValue | null>(null);

export function CalculatorOverlayProvider({
  children,
  initialState,
}: {
  children: ReactNode;
  /** ใช้ในเทสต์ (และใน CalculatorOverlay เอง) เพื่อ render จอใดจอหนึ่งตรง ๆ โดยไม่ต้องจำลองคลิก */
  initialState?: OverlayState;
}) {
  const [state, dispatch] = useReducer(overlayReducer, initialState ?? initialOverlayState);

  const value: CalculatorOverlayValue = {
    state,
    open: () => dispatch({ type: "open" }),
    close: () => dispatch({ type: "close" }),
    select: (screen) => dispatch({ type: "select", screen }),
    back: () => dispatch({ type: "back" }),
  };

  return <CalculatorOverlayContext.Provider value={value}>{children}</CalculatorOverlayContext.Provider>;
}

export function useCalculatorOverlay(): CalculatorOverlayValue {
  const value = useContext(CalculatorOverlayContext);
  if (!value) throw new Error("useCalculatorOverlay must be used within CalculatorOverlayProvider");
  return value;
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npx vitest run src/components/nav/calculator-overlay-context.test.tsx`
Expected: PASS (3 tests)

- [ ] **Step 5: Commit**

```bash
git add src/components/nav/calculator-overlay-context.tsx src/components/nav/calculator-overlay-context.test.tsx
git commit -m "feat: add CalculatorOverlayProvider and useCalculatorOverlay hook"
```

---

### Task 4: Primary navigation component

**Files:**
- Create: `src/components/nav/nav-items.ts`
- Create: `src/components/nav/primary-nav.tsx`
- Test: `src/components/nav/primary-nav.test.tsx`

**Interfaces:**
- Consumes: `useCalculatorOverlay` from `./calculator-overlay-context` (Task 3).
- Produces: `type NavItem = { key: string; label: string; href: string }`, `const navLinkItems: NavItem[]` (from `nav-items.ts`), `function PrimaryNav(): JSX.Element` (default-exported as a named export, no props). Task 9 (`GuideShell`) renders `<PrimaryNav />`.

- [ ] **Step 1: Write `nav-items.ts` (pure data, no test needed — trivial constant, exercised indirectly by Step 2's test)**

Create `src/components/nav/nav-items.ts`:

```ts
export type NavItem = {
  key: string;
  label: string;
  href: string;
};

export const navLinkItems: NavItem[] = [
  { key: "home", label: "หน้าแรก", href: "/" },
  { key: "equipment", label: "อุปกรณ์ของฉัน", href: "/my/equipment" },
];
```

- [ ] **Step 2: Write the failing test for `PrimaryNav`**

Create `src/components/nav/primary-nav.test.tsx`:

```tsx
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { CalculatorOverlayProvider } from "./calculator-overlay-context";
import { PrimaryNav } from "./primary-nav";

vi.mock("next/navigation", () => ({
  usePathname: () => "/my/equipment",
}));

describe("PrimaryNav", () => {
  it("แสดงลิงก์หน้าแรก อุปกรณ์ของฉัน และปุ่มเครื่องคำนวณ", () => {
    const html = renderToStaticMarkup(
      <CalculatorOverlayProvider>
        <PrimaryNav />
      </CalculatorOverlayProvider>,
    );

    expect(html).toContain('href="/"');
    expect(html).toContain('href="/my/equipment"');
    expect(html).toContain("หน้าแรก");
    expect(html).toContain("อุปกรณ์ของฉัน");
    expect(html).toContain("เครื่องคำนวณ");
    expect(html).toContain("<button");
  });

  it("ทำเครื่องหมาย aria-current ให้รายการที่ตรงกับ pathname ปัจจุบัน", () => {
    const html = renderToStaticMarkup(
      <CalculatorOverlayProvider>
        <PrimaryNav />
      </CalculatorOverlayProvider>,
    );

    expect(html).toContain('aria-current="page"');
  });

  it("มีทั้งเมนูเดสก์ท็อปและมือถือใน markup เดียวกัน (สลับด้วย CSS)", () => {
    const html = renderToStaticMarkup(
      <CalculatorOverlayProvider>
        <PrimaryNav />
      </CalculatorOverlayProvider>,
    );

    expect(html).toContain("pl-nav-desktop");
    expect(html).toContain("pl-nav-mobile");
  });
});
```

- [ ] **Step 3: Run the test to verify it fails**

Run: `npx vitest run src/components/nav/primary-nav.test.tsx`
Expected: FAIL — `primary-nav.tsx` does not exist yet.

- [ ] **Step 4: Write the implementation**

Create `src/components/nav/primary-nav.tsx`:

```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCalculatorOverlay } from "./calculator-overlay-context";
import { navLinkItems } from "./nav-items";

function HomeIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M4 11.5 12 4l8 7.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6 10v9h12v-9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function EquipmentIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M9 3v5L4 17a2 2 0 0 0 2 3h12a2 2 0 0 0 2-3l-5-9V3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 3h6" strokeLinecap="round" />
    </svg>
  );
}

function CalculatorIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <rect x="5" y="3" width="14" height="18" rx="2" />
      <path d="M8 7h8M8 11h.01M12 11h.01M16 11h.01M8 15h.01M12 15h.01M16 15h.01" strokeLinecap="round" />
    </svg>
  );
}

const linkIcons: Record<string, () => React.JSX.Element> = {
  home: HomeIcon,
  equipment: EquipmentIcon,
};

export function PrimaryNav() {
  const pathname = usePathname();
  const { state, open } = useCalculatorOverlay();

  function renderItems() {
    return (
      <>
        {navLinkItems.map((item) => {
          const Icon = linkIcons[item.key];
          const active = pathname === item.href;
          return (
            <Link
              key={item.key}
              href={item.href}
              className="pl-nav-item"
              aria-current={active ? "page" : undefined}
            >
              <Icon />
              <span>{item.label}</span>
            </Link>
          );
        })}
        <button
          type="button"
          className="pl-nav-item"
          aria-current={state.isOpen ? "page" : undefined}
          onClick={open}
        >
          <CalculatorIcon />
          <span>เครื่องคำนวณ</span>
        </button>
      </>
    );
  }

  return (
    <>
      <nav className="pl-nav-desktop" aria-label="เมนูหลัก">
        {renderItems()}
      </nav>
      <nav className="pl-nav-mobile" aria-label="เมนูหลัก">
        {renderItems()}
      </nav>
    </>
  );
}
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `npx vitest run src/components/nav/primary-nav.test.tsx`
Expected: PASS (3 tests)

- [ ] **Step 6: Commit**

```bash
git add src/components/nav/nav-items.ts src/components/nav/primary-nav.tsx src/components/nav/primary-nav.test.tsx
git commit -m "feat: add responsive PrimaryNav (bottom tab bar / top bar)"
```

---

### Task 5: Shared calculator input field

**Files:**
- Create: `src/components/calculators/calculator-field.tsx`
- Test: `src/components/calculators/calculator-field.test.tsx`

**Interfaces:**
- Produces: `const calculatorInputStyle` (style object), `function CalculatorField({ id, label, value, onChange, hint, step }: { id: string; label: string; value: number; onChange: (next: number) => void; hint?: string; step?: string }): JSX.Element`. Tasks 6 and 7 (`WorkingStockCalculator`, `HaiterCalculator`) both consume this.

This mirrors the `Field` helper already inside `src/components/rounds/medium-calculator.tsx` (not imported from there — that file is left unmodified per Global Constraints — this is a fresh, smaller copy scoped to the two new calculators so they don't duplicate the same ~20 lines twice).

- [ ] **Step 1: Write the failing test**

Create `src/components/calculators/calculator-field.test.tsx`:

```tsx
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { CalculatorField } from "./calculator-field";

describe("CalculatorField", () => {
  it("แสดง label เชื่อมกับ input ผ่าน htmlFor/id", () => {
    const html = renderToStaticMarkup(
      <CalculatorField id="test-field" label="มวลที่ต้องการ (mg)" value={5} onChange={() => {}} />,
    );

    expect(html).toContain('for="test-field"');
    expect(html).toContain('id="test-field"');
    expect(html).toContain("มวลที่ต้องการ (mg)");
    expect(html).toContain('value="5"');
  });

  it("แสดง hint เมื่อส่งมา และไม่แสดงเมื่อไม่ส่ง", () => {
    const withHint = renderToStaticMarkup(
      <CalculatorField id="a" label="A" value={1} onChange={() => {}} hint="คำอธิบายเพิ่มเติม" />,
    );
    const withoutHint = renderToStaticMarkup(<CalculatorField id="b" label="B" value={1} onChange={() => {}} />);

    expect(withHint).toContain("คำอธิบายเพิ่มเติม");
    expect(withoutHint).not.toContain("pl-meta");
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run src/components/calculators/calculator-field.test.tsx`
Expected: FAIL — module not found.

- [ ] **Step 3: Write the implementation**

Create `src/components/calculators/calculator-field.tsx`:

```tsx
export const calculatorInputStyle = {
  width: "100%",
  padding: "9px 11px",
  border: "1.5px solid var(--pl-line-soft)",
  borderRadius: "12px",
  background: "var(--pl-card)",
  color: "var(--pl-ink)",
  fontSize: "16px",
} as const;

export function CalculatorField({
  id,
  label,
  value,
  onChange,
  hint,
  step = "any",
}: {
  id: string;
  label: string;
  value: number;
  onChange: (next: number) => void;
  hint?: string;
  step?: string;
}) {
  return (
    <p style={{ margin: 0 }}>
      <label htmlFor={id} style={{ display: "block", fontWeight: 600, marginBottom: "5px", fontSize: "14px" }}>
        {label}
      </label>
      <input
        id={id}
        type="number"
        min="0"
        step={step}
        inputMode="decimal"
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        style={calculatorInputStyle}
      />
      {hint ? <span className="pl-meta" style={{ display: "block", marginTop: "4px" }}>{hint}</span> : null}
    </p>
  );
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run src/components/calculators/calculator-field.test.tsx`
Expected: PASS (2 tests)

- [ ] **Step 5: Commit**

```bash
git add src/components/calculators/calculator-field.tsx src/components/calculators/calculator-field.test.tsx
git commit -m "feat: add shared CalculatorField input for new calculator forms"
```

---

### Task 6: Working Stock Calculator (new UI)

**Files:**
- Create: `src/components/calculators/working-stock-calculator.tsx`
- Test: `src/components/calculators/working-stock-calculator.test.tsx`

**Interfaces:**
- Consumes: `calculateWorkingStock`, `formatNumber`, `formatVolume`, `type WorkingStockInput`, `type WorkingStockResult` from `@/lib/domain/working-stock-calculator` (existing, untouched). `CalculatorField` from `./calculator-field` (Task 5).
- Produces: `function WorkingStockCalculator({ initialInput }: { initialInput?: Partial<WorkingStockInput> }): JSX.Element`. Task 8 (`CalculatorOverlay`) renders this with `initialInput={{ minimumToolVolumeMl: kit.pipetteMinimumMl }}`.

`calculateWorkingStock` never throws — it returns a `{ state: "blocked", ... }` result for invalid input, so no try/catch is needed here (unlike Task 7's haiter calculator).

- [ ] **Step 1: Write the failing tests**

Create `src/components/calculators/working-stock-calculator.test.tsx`. These three `initialInput` values are chosen to deterministically hit each of the three `WorkingStockResult` states on first render (verified against `src/lib/domain/working-stock-calculator.ts`'s logic: default `sourceConcentrationMgPerMl=1`, `minimumToolVolumeMl=0.2`, `workingSolutionVolumeMl=50`):

```tsx
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { WorkingStockCalculator } from "./working-stock-calculator";

describe("WorkingStockCalculator", () => {
  it("บล็อกเมื่อกรอกมวลเป็น 0", () => {
    const html = renderToStaticMarkup(<WorkingStockCalculator initialInput={{ requiredMassMg: 0 }} />);

    expect(html).toContain("ตัวเลขทุกช่องต้องมากกว่า 0");
    expect(html).toContain("ตรวจหน่วยบนฉลากและกรอกมวลเป็น mg ส่วนความเข้มข้นเป็น mg/mL");
  });

  it("ตวงตรงได้เมื่อโดสไม่ต่ำกว่าเครื่องมือ (มวล 5mg เข้มข้น 1mg/mL ตวงขั้นต่ำ 0.2mL)", () => {
    const html = renderToStaticMarkup(<WorkingStockCalculator initialInput={{ requiredMassMg: 5 }} />);

    expect(html).toContain("ตวงตรงจาก stock เดิม");
    expect(html).toContain("5 mL");
  });

  it("ต้องทำ working dilution เมื่อโดสตรงต่ำกว่าเครื่องมือ (มวล 0.01mg)", () => {
    const html = renderToStaticMarkup(<WorkingStockCalculator initialInput={{ requiredMassMg: 0.01 }} />);

    expect(html).toContain("อัตราส่วน 1:100");
    expect(html).toContain("0.01 mg/mL");
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx vitest run src/components/calculators/working-stock-calculator.test.tsx`
Expected: FAIL — module not found.

- [ ] **Step 3: Write the implementation**

Create `src/components/calculators/working-stock-calculator.tsx`:

```tsx
"use client";

import { useMemo, useState } from "react";
import {
  calculateWorkingStock,
  formatNumber,
  formatVolume,
  type WorkingStockInput,
} from "@/lib/domain/working-stock-calculator";
import { CalculatorField } from "./calculator-field";

const defaultInput: WorkingStockInput = {
  requiredMassMg: 5,
  sourceConcentrationMgPerMl: 1,
  minimumToolVolumeMl: 0.2,
  workingSolutionVolumeMl: 50,
};

export function WorkingStockCalculator({
  initialInput,
}: {
  /** ตั้งค่าเริ่มต้นจากอุปกรณ์ของผู้ใช้ (pipetteMinimumMl) และใช้ในเทสต์เพื่อ render สถานะใดสถานะหนึ่งตรง ๆ */
  initialInput?: Partial<WorkingStockInput>;
}) {
  const merged = { ...defaultInput, ...initialInput };
  const [requiredMassMg, setRequiredMassMg] = useState(merged.requiredMassMg);
  const [sourceConcentrationMgPerMl, setSourceConcentrationMgPerMl] = useState(merged.sourceConcentrationMgPerMl);
  const [minimumToolVolumeMl, setMinimumToolVolumeMl] = useState(merged.minimumToolVolumeMl);
  const [workingSolutionVolumeMl, setWorkingSolutionVolumeMl] = useState(merged.workingSolutionVolumeMl);

  const result = useMemo(
    () =>
      calculateWorkingStock({
        requiredMassMg,
        sourceConcentrationMgPerMl,
        minimumToolVolumeMl,
        workingSolutionVolumeMl,
      }),
    [requiredMassMg, sourceConcentrationMgPerMl, minimumToolVolumeMl, workingSolutionVolumeMl],
  );

  return (
    <section>
      <h2 className="pl-h2">น้ำยาแม่ (working stock)</h2>
      <p className="pl-lede" style={{ marginTop: "6px" }}>
        ใช้เมื่อปริมาณสารที่ต้องใช้น้อยเกินกว่าจะตวงจาก stock เดิมได้ตรง ๆ
      </p>

      <div className="pl-soft-card" style={{ marginTop: "14px", display: "flex", flexDirection: "column", gap: "12px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "12px" }}>
          <CalculatorField id="ws-mass" label="มวลที่ต้องการ (mg)" value={requiredMassMg} onChange={setRequiredMassMg} />
          <CalculatorField
            id="ws-source"
            label="ความเข้มข้น stock เดิม (mg/mL)"
            value={sourceConcentrationMgPerMl}
            onChange={setSourceConcentrationMgPerMl}
          />
          <CalculatorField
            id="ws-tool-min"
            label="ตวงได้ละเอียดสุด (mL)"
            value={minimumToolVolumeMl}
            onChange={setMinimumToolVolumeMl}
            hint="ดึงจากอุปกรณ์ของคุณถ้าตั้งค่าไว้"
          />
          <CalculatorField
            id="ws-volume"
            label="ปริมาตร working solution ที่จะเตรียม (mL)"
            value={workingSolutionVolumeMl}
            onChange={setWorkingSolutionVolumeMl}
          />
        </div>
      </div>

      {result.state === "blocked" ? (
        <div className="pl-soft-card" role="alert" style={{ marginTop: "14px", background: "var(--pl-stop)" }}>
          <p style={{ margin: 0, fontWeight: 700 }}>{result.reason}</p>
          <p className="pl-lede" style={{ marginTop: "6px" }}>{result.safeAction}</p>
        </div>
      ) : null}

      {result.state === "direct" ? (
        <div className="pl-soft-card" style={{ marginTop: "14px" }}>
          <p className="pl-mono">ตวงตรงจาก stock เดิม</p>
          <p style={{ margin: "4px 0 0", fontSize: "26px", fontWeight: 800, fontVariantNumeric: "tabular-nums" }}>
            {formatVolume(result.directDoseMl)} mL
          </p>
          <ol style={{ margin: "10px 0 0", paddingLeft: "20px", display: "flex", flexDirection: "column", gap: "6px" }}>
            {result.actions.map((action) => <li key={action}>{action}</li>)}
          </ol>
        </div>
      ) : null}

      {result.state === "working-dilution" ? (
        <div className="pl-soft-card" style={{ marginTop: "14px" }}>
          <p className="pl-mono">ต้องทำ working stock อัตราส่วน 1:{result.dilutionFactor}</p>
          <p style={{ margin: "4px 0 0", fontSize: "18px", fontWeight: 700 }}>
            ความเข้มข้น {formatNumber(result.workingConcentrationMgPerMl)} mg/mL
          </p>
          <ol style={{ margin: "10px 0 0", paddingLeft: "20px", display: "flex", flexDirection: "column", gap: "6px" }}>
            {result.actions.map((action) => <li key={action}>{action}</li>)}
          </ol>
        </div>
      ) : null}
    </section>
  );
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npx vitest run src/components/calculators/working-stock-calculator.test.tsx`
Expected: PASS (3 tests)

- [ ] **Step 5: Commit**

```bash
git add src/components/calculators/working-stock-calculator.tsx src/components/calculators/working-stock-calculator.test.tsx
git commit -m "feat: add Working Stock Calculator UI"
```

---

### Task 7: Haiter Calculator (new UI)

**Files:**
- Create: `src/components/calculators/haiter-calculator.tsx`
- Test: `src/components/calculators/haiter-calculator.test.tsx`

**Interfaces:**
- Consumes: `calculateHaiterDose`, `planHaiterWorkingDilution`, `type HaiterDoseInput`, `type HaiterWorkingDilutionInput` from `@/lib/domain/haiter-calculations` (existing, untouched). `CalculatorField` from `./calculator-field` (Task 5).
- Produces: `function HaiterCalculator({ initialMode, initialDoseInput, initialDilutionInput }: { initialMode?: "direct" | "working-dilution"; initialDoseInput?: Partial<HaiterDoseInput>; initialDilutionInput?: Partial<HaiterWorkingDilutionInput> }): JSX.Element`. Task 8 (`CalculatorOverlay`) renders this with `initialDoseInput={{ minimumMeasurableMl: kit.pipetteMinimumMl }}` and `initialDilutionInput={{ minimumMeasurableMl: kit.pipetteMinimumMl }}`.

Both `calculateHaiterDose` and `planHaiterWorkingDilution` **throw** a plain `Error` on invalid input (e.g. `target >= source`, `dilutionFactor <= 1`) — both call sites must be wrapped in try/catch, mirroring the existing `useMemo(() => { try {...} catch { return null } }, [...])` pattern already used in `medium-calculator.tsx`.

- [ ] **Step 1: Write the failing tests**

Create `src/components/calculators/haiter-calculator.test.tsx`. Expected numbers are derived directly from `src/lib/domain/haiter-calculations.ts`'s formulas:

```tsx
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { HaiterCalculator } from "./haiter-calculator";

describe("HaiterCalculator", () => {
  it("โหมดคำนวณตรง: ตวงได้พอดีไม่มีคำเตือน (6% เจือจางเหลือ 1% ใน 100mL ตวงขั้นต่ำ 1mL)", () => {
    const html = renderToStaticMarkup(<HaiterCalculator />);

    expect(html).toContain("16.666667 mL");
    expect(html).not.toContain("ไปทำ working dilution");
  });

  it("โหมดคำนวณตรง: เตือนให้ทำ working dilution เมื่อโดสต่ำกว่าตวงได้ (target 0.05% final 10mL)", () => {
    const html = renderToStaticMarkup(
      <HaiterCalculator initialDoseInput={{ targetPercent: 0.05, finalVolumeMl: 10 }} />,
    );

    expect(html).toContain("วัดไม่ได้อย่างน่าเชื่อถือ");
    expect(html).toContain("ไปทำ working dilution");
  });

  it("โหมดคำนวณตรง: โชว์การ์ดเตือนเมื่อ target มากกว่าหรือเท่ากับ source", () => {
    const html = renderToStaticMarkup(<HaiterCalculator initialDoseInput={{ sourcePercent: 1, targetPercent: 2 }} />);

    expect(html).toContain("target concentration ต้องต่ำกว่า source concentration");
  });

  it("โหมด working dilution: คำนวณสำเร็จไม่มีคำเตือน (ค่าเริ่มต้น)", () => {
    const html = renderToStaticMarkup(<HaiterCalculator initialMode="working-dilution" />);

    expect(html).toContain("working stock 0.6%");
    expect(html).toContain("ตวงต้นทาง 10 mL");
    expect(html).toContain("เติมน้ำ 90 mL");
  });

  it("โหมด working dilution: โชว์คำเตือนเมื่อโดสยังตวงไม่ได้ (target 0.001% final 1mL)", () => {
    const html = renderToStaticMarkup(
      <HaiterCalculator initialMode="working-dilution" initialDilutionInput={{ targetPercent: 0.001, finalVolumeMl: 1 }} />,
    );

    expect(html).toContain("ยังต่ำกว่าเครื่องมือขั้นต่ำ");
  });

  it("โหมด working dilution: โชว์การ์ดเตือนเมื่อ dilution factor ไม่มากกว่า 1", () => {
    const html = renderToStaticMarkup(
      <HaiterCalculator initialMode="working-dilution" initialDilutionInput={{ dilutionFactor: 1 }} />,
    );

    expect(html).toContain("dilution factor ต้องมากกว่า 1");
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx vitest run src/components/calculators/haiter-calculator.test.tsx`
Expected: FAIL — module not found.

- [ ] **Step 3: Write the implementation**

Create `src/components/calculators/haiter-calculator.tsx`:

```tsx
"use client";

import { useMemo, useState } from "react";
import {
  calculateHaiterDose,
  planHaiterWorkingDilution,
  type HaiterDoseInput,
  type HaiterDoseResult,
  type HaiterWorkingDilutionInput,
  type HaiterWorkingDilutionResult,
} from "@/lib/domain/haiter-calculations";
import { CalculatorField } from "./calculator-field";

type Mode = "direct" | "working-dilution";

type Attempt<T> = { ok: true; result: T } | { ok: false; message: string };

const defaultDoseInput: HaiterDoseInput = {
  sourcePercent: 6,
  targetPercent: 1,
  finalVolumeMl: 100,
  minimumMeasurableMl: 1,
};

const defaultDilutionInput: HaiterWorkingDilutionInput = {
  sourcePercent: 6,
  dilutionFactor: 10,
  workingVolumeMl: 100,
  targetPercent: 1,
  finalVolumeMl: 100,
  minimumMeasurableMl: 1,
};

function tryCalculateDose(input: HaiterDoseInput): Attempt<HaiterDoseResult> {
  try {
    return { ok: true, result: calculateHaiterDose(input) };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : String(error) };
  }
}

function tryPlanDilution(input: HaiterWorkingDilutionInput): Attempt<HaiterWorkingDilutionResult> {
  try {
    return { ok: true, result: planHaiterWorkingDilution(input) };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : String(error) };
  }
}

export function HaiterCalculator({
  initialMode = "direct",
  initialDoseInput,
  initialDilutionInput,
}: {
  initialMode?: Mode;
  /** ตั้งค่าเริ่มต้นจากอุปกรณ์ของผู้ใช้ (minimumMeasurableMl) และใช้ในเทสต์ */
  initialDoseInput?: Partial<HaiterDoseInput>;
  initialDilutionInput?: Partial<HaiterWorkingDilutionInput>;
}) {
  const [mode, setMode] = useState<Mode>(initialMode);

  const doseMerged = { ...defaultDoseInput, ...initialDoseInput };
  const [sourcePercent, setSourcePercent] = useState(doseMerged.sourcePercent);
  const [targetPercent, setTargetPercent] = useState(doseMerged.targetPercent);
  const [finalVolumeMl, setFinalVolumeMl] = useState(doseMerged.finalVolumeMl);
  const [minimumMeasurableMl, setMinimumMeasurableMl] = useState(doseMerged.minimumMeasurableMl);

  const dilutionMerged = { ...defaultDilutionInput, ...initialDilutionInput };
  const [dilutionFactor, setDilutionFactor] = useState(dilutionMerged.dilutionFactor);
  const [workingVolumeMl, setWorkingVolumeMl] = useState(dilutionMerged.workingVolumeMl);

  const dose = useMemo(
    () => tryCalculateDose({ sourcePercent, targetPercent, finalVolumeMl, minimumMeasurableMl }),
    [sourcePercent, targetPercent, finalVolumeMl, minimumMeasurableMl],
  );

  const dilution = useMemo(
    () =>
      tryPlanDilution({
        sourcePercent,
        dilutionFactor,
        workingVolumeMl,
        targetPercent,
        finalVolumeMl,
        minimumMeasurableMl,
      }),
    [sourcePercent, dilutionFactor, workingVolumeMl, targetPercent, finalVolumeMl, minimumMeasurableMl],
  );

  return (
    <section>
      <h2 className="pl-h2">ไฮเตอร์ / สารฟอกฆ่าเชื้อ</h2>

      <div className="pl-calc-tabs" role="tablist" aria-label="โหมดคำนวณไฮเตอร์">
        <button type="button" role="tab" aria-selected={mode === "direct"} className="pl-calc-tab" onClick={() => setMode("direct")}>
          คำนวณตรง
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === "working-dilution"}
          className="pl-calc-tab"
          onClick={() => setMode("working-dilution")}
        >
          Working dilution
        </button>
      </div>

      {mode === "direct" ? (
        <div className="pl-soft-card" style={{ marginTop: "14px", display: "flex", flexDirection: "column", gap: "12px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "12px" }}>
            <CalculatorField id="hd-source" label="% สารต้นทาง" value={sourcePercent} onChange={setSourcePercent} />
            <CalculatorField id="hd-target" label="% เป้าหมาย" value={targetPercent} onChange={setTargetPercent} />
            <CalculatorField id="hd-volume" label="ปริมาตรสุดท้าย (mL)" value={finalVolumeMl} onChange={setFinalVolumeMl} />
            <CalculatorField id="hd-min" label="ตวงได้ละเอียดสุด (mL)" value={minimumMeasurableMl} onChange={setMinimumMeasurableMl} />
          </div>

          {dose.ok ? (
            <div className="pl-soft-card" style={{ background: "var(--pl-sunk)" }}>
              <p className="pl-mono">{dose.result.formula}</p>
              <p style={{ margin: "4px 0 0", fontSize: "26px", fontWeight: 800, fontVariantNumeric: "tabular-nums" }}>
                {dose.result.sourceVolumeMl} mL
              </p>
              {dose.result.warning ? (
                <div style={{ marginTop: "10px" }}>
                  <p className="pl-lede">{dose.result.warning}</p>
                  <button type="button" className="pl-calc-tab" onClick={() => setMode("working-dilution")}>
                    ไปทำ working dilution
                  </button>
                </div>
              ) : null}
            </div>
          ) : (
            <p className="pl-soft-card" role="alert" style={{ background: "var(--pl-stop)" }}>{dose.message}</p>
          )}
        </div>
      ) : (
        <div className="pl-soft-card" style={{ marginTop: "14px", display: "flex", flexDirection: "column", gap: "12px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "12px" }}>
            <CalculatorField id="hwd-source" label="% สารต้นทาง" value={sourcePercent} onChange={setSourcePercent} />
            <CalculatorField id="hwd-factor" label="เจือจางกี่เท่า" value={dilutionFactor} onChange={setDilutionFactor} />
            <CalculatorField id="hwd-volume" label="ปริมาตร working ที่จะเตรียม (mL)" value={workingVolumeMl} onChange={setWorkingVolumeMl} />
            <CalculatorField id="hwd-target" label="% เป้าหมาย" value={targetPercent} onChange={setTargetPercent} />
            <CalculatorField id="hwd-final" label="ปริมาตรสุดท้าย (mL)" value={finalVolumeMl} onChange={setFinalVolumeMl} />
            <CalculatorField id="hwd-min" label="ตวงได้ละเอียดสุด (mL)" value={minimumMeasurableMl} onChange={setMinimumMeasurableMl} />
          </div>

          {dilution.ok ? (
            <div className="pl-soft-card" style={{ background: "var(--pl-sunk)" }}>
              <p className="pl-mono">working stock {dilution.result.workingPercent}%</p>
              <ol style={{ margin: "10px 0 0", paddingLeft: "20px", display: "flex", flexDirection: "column", gap: "6px" }}>
                <li>ตวงต้นทาง {dilution.result.sourceVolumeMl} mL</li>
                <li>เติมน้ำ {dilution.result.diluentVolumeMl} mL</li>
                <li>ตวง working stock ใส่จริง {dilution.result.workingDoseMl} mL</li>
              </ol>
              {dilution.result.warning ? <p className="pl-lede" style={{ marginTop: "8px" }}>{dilution.result.warning}</p> : null}
            </div>
          ) : (
            <p className="pl-soft-card" role="alert" style={{ background: "var(--pl-stop)" }}>{dilution.message}</p>
          )}
        </div>
      )}
    </section>
  );
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npx vitest run src/components/calculators/haiter-calculator.test.tsx`
Expected: PASS (6 tests)

- [ ] **Step 5: Commit**

```bash
git add src/components/calculators/haiter-calculator.tsx src/components/calculators/haiter-calculator.test.tsx
git commit -m "feat: add Haiter Calculator UI with direct and working-dilution modes"
```

---

### Task 8: Calculator overlay shell

**Files:**
- Create: `src/components/calculators/calculator-overlay.tsx`
- Test: `src/components/calculators/calculator-overlay.test.tsx`

**Interfaces:**
- Consumes: `useCalculatorOverlay` from `@/components/nav/calculator-overlay-context` (Task 3), `CalculatorOverlayProvider` (for the test), `useAuth` from `@/components/auth/auth-provider` (existing), `defaultKit`, `type EquipmentKit` from `@/lib/equipment/resolve-path` (existing), `getEquipmentRepository` from `@/lib/repositories/equipment-repository-factory` (existing), `plantPacks` from `@/lib/manual/registry` (existing), `MediumCalculator` from `@/components/rounds/medium-calculator` (existing, untouched), `WorkingStockCalculator` (Task 6), `HaiterCalculator` (Task 7).
- Produces: `function CalculatorOverlay(): JSX.Element | null`. Task 9 (`GuideShell`) renders `<CalculatorOverlay />`.

- [ ] **Step 1: Write the failing tests**

Create `src/components/calculators/calculator-overlay.test.tsx`. `AuthProvider` is required because `CalculatorOverlay` calls `useAuth()` unconditionally (before its early-return); its `useEffect` (which touches Firebase/`window`) never runs under `renderToStaticMarkup`, so wrapping is safe for static-markup testing — only the initial `"loading"` session state is exercised:

```tsx
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { AuthProvider } from "@/components/auth/auth-provider";
import { CalculatorOverlayProvider } from "@/components/nav/calculator-overlay-context";
import { CalculatorOverlay } from "./calculator-overlay";

function renderOverlay(screen: "picker" | "medium" | "working-stock" | "haiter") {
  return renderToStaticMarkup(
    <AuthProvider>
      <CalculatorOverlayProvider initialState={{ isOpen: true, screen }}>
        <CalculatorOverlay />
      </CalculatorOverlayProvider>
    </AuthProvider>,
  );
}

describe("CalculatorOverlay", () => {
  it("ไม่ render อะไรเลยเมื่อปิดอยู่", () => {
    const html = renderToStaticMarkup(
      <AuthProvider>
        <CalculatorOverlayProvider initialState={{ isOpen: false, screen: "picker" }}>
          <CalculatorOverlay />
        </CalculatorOverlayProvider>
      </AuthProvider>,
    );

    expect(html).toBe("");
  });

  it("หน้า picker แสดงตัวเลือกครบสามเครื่องคำนวณ พร้อมปุ่มปิด", () => {
    const html = renderOverlay("picker");

    expect(html).toContain("สูตรอาหาร");
    expect(html).toContain("น้ำยาแม่ (working stock)");
    expect(html).toContain("ไฮเตอร์ฆ่าเชื้อ");
    expect(html).toContain("pl-overlay-close");
    expect(html).toContain("pl-overlay-backdrop");
  });

  it("หน้า medium มี dropdown เลือกพืชและปุ่มย้อนกลับ", () => {
    const html = renderOverlay("medium");

    expect(html).toContain('id="calc-plant"');
    expect(html).toContain("pl-overlay-back");
    expect(html).toContain("จะทำอาหารเท่าไหร่");
  });

  it("หน้า working-stock render WorkingStockCalculator", () => {
    const html = renderOverlay("working-stock");

    expect(html).toContain("น้ำยาแม่ (working stock)");
  });

  it("หน้า haiter render HaiterCalculator", () => {
    const html = renderOverlay("haiter");

    expect(html).toContain("ไฮเตอร์ / สารฟอกฆ่าเชื้อ");
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx vitest run src/components/calculators/calculator-overlay.test.tsx`
Expected: FAIL — module not found.

- [ ] **Step 3: Write the implementation**

Create `src/components/calculators/calculator-overlay.tsx`:

```tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { useCalculatorOverlay } from "@/components/nav/calculator-overlay-context";
import { defaultKit, type EquipmentKit } from "@/lib/equipment/resolve-path";
import { plantPacks } from "@/lib/manual/registry";
import { getEquipmentRepository } from "@/lib/repositories/equipment-repository-factory";
import { MediumCalculator } from "@/components/rounds/medium-calculator";
import { HaiterCalculator } from "./haiter-calculator";
import { WorkingStockCalculator } from "./working-stock-calculator";

const pickerItems = [
  { screen: "medium" as const, title: "สูตรอาหาร", description: "คำนวณปริมาณสารต่อชุดอาหารที่จะทำ" },
  { screen: "working-stock" as const, title: "น้ำยาแม่ (working stock)", description: "เมื่อสารต้องใช้น้อยจนตวงตรง ๆ ไม่ได้" },
  { screen: "haiter" as const, title: "ไฮเตอร์ฆ่าเชื้อ", description: "เจือจางสารฟอกให้ได้ % ที่ต้องการ" },
];

export function CalculatorOverlay() {
  const { state, select, back, close } = useCalculatorOverlay();
  const { session } = useAuth();
  const ownerId = session.user?.uid ?? "demo-owner";
  const authenticated = session.status === "authenticated";
  const repository = useMemo(() => getEquipmentRepository(ownerId, authenticated), [ownerId, authenticated]);
  const [kit, setKit] = useState<EquipmentKit>(defaultKit);
  const [selectedPlantSlug, setSelectedPlantSlug] = useState(plantPacks[0]?.slug ?? "");

  useEffect(() => {
    if (!state.isOpen) return;
    if (!["demo", "authenticated"].includes(session.status)) return;
    let active = true;
    repository
      .get(ownerId)
      .then((found) => {
        if (active && found) setKit({ ...defaultKit, ...found });
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [ownerId, repository, session.status, state.isOpen]);

  useEffect(() => {
    if (!state.isOpen) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") close();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [state.isOpen, close]);

  if (!state.isOpen) return null;

  const toolsKey = `${kit.scaleMinimumMg}-${kit.pipetteMinimumMl}-${kit.msLabelRateGPerL}`;
  const selectedPlant = plantPacks.find((pack) => pack.slug === selectedPlantSlug) ?? plantPacks[0];

  return (
    <div className="pl-overlay-root">
      <button type="button" className="pl-overlay-backdrop" aria-label="ปิดเครื่องคำนวณ" onClick={close} />
      <div className="pl-overlay-panel" role="dialog" aria-modal="true" aria-label="เครื่องคำนวณ">
        <button type="button" className="pl-overlay-handle" aria-label="ปิดเครื่องคำนวณ" onClick={close} />
        <div className="pl-overlay-header">
          {state.screen !== "picker" ? (
            <button type="button" className="pl-overlay-back" aria-label="กลับไปเลือกเครื่องคำนวณ" onClick={back}>
              ←
            </button>
          ) : null}
          <button type="button" className="pl-overlay-close" aria-label="ปิดเครื่องคำนวณ" onClick={close}>
            ×
          </button>
        </div>

        <div className="pl-overlay-body">
          {state.screen === "picker" ? (
            <div className="pl-calc-picker-grid">
              {pickerItems.map((item) => (
                <button
                  key={item.screen}
                  type="button"
                  className="pl-calc-picker-card pl-soft-card"
                  onClick={() => select(item.screen)}
                >
                  <p style={{ margin: 0, fontWeight: 700 }}>{item.title}</p>
                  <p className="pl-lede" style={{ marginTop: "6px" }}>{item.description}</p>
                </button>
              ))}
            </div>
          ) : null}

          {state.screen === "medium" && selectedPlant ? (
            <>
              <p style={{ margin: "0 0 12px" }}>
                <label htmlFor="calc-plant" style={{ display: "block", fontWeight: 600, marginBottom: "5px", fontSize: "14px" }}>
                  พืชที่จะทำอาหาร
                </label>
                <select
                  id="calc-plant"
                  value={selectedPlant.slug}
                  onChange={(event) => setSelectedPlantSlug(event.target.value)}
                  style={{
                    width: "100%",
                    padding: "9px 11px",
                    border: "1.5px solid var(--pl-line-soft)",
                    borderRadius: "12px",
                    background: "var(--pl-card)",
                    color: "var(--pl-ink)",
                    fontSize: "16px",
                  }}
                >
                  {plantPacks.map((pack) => (
                    <option key={pack.slug} value={pack.slug}>{pack.commonName}</option>
                  ))}
                </select>
              </p>
              <MediumCalculator key={`${selectedPlant.slug}-${toolsKey}`} recipes={selectedPlant.mediaRecipes} tools={kit} />
            </>
          ) : null}

          {state.screen === "working-stock" ? (
            <WorkingStockCalculator key={toolsKey} initialInput={{ minimumToolVolumeMl: kit.pipetteMinimumMl }} />
          ) : null}

          {state.screen === "haiter" ? (
            <HaiterCalculator
              key={toolsKey}
              initialDoseInput={{ minimumMeasurableMl: kit.pipetteMinimumMl }}
              initialDilutionInput={{ minimumMeasurableMl: kit.pipetteMinimumMl }}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}
```

Note on the handle bar: it's rendered as a `<button>` (`.pl-overlay-handle`) that closes the overlay on tap. A real drag-to-dismiss gesture (tracking `pointerdown`/`pointermove`/`pointerup` with velocity) is out of scope for this plan — tap-to-close on the handle plus the explicit `×` button and backdrop/Escape already give three ways to close, satisfying the spec's requirement without the added complexity of gesture tracking.

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npx vitest run src/components/calculators/calculator-overlay.test.tsx`
Expected: PASS (5 tests)

- [ ] **Step 5: Commit**

```bash
git add src/components/calculators/calculator-overlay.tsx src/components/calculators/calculator-overlay.test.tsx
git commit -m "feat: add CalculatorOverlay shell wiring picker and all three calculators"
```

---

### Task 9: Wire navigation and overlay into GuideShell

**Files:**
- Modify: `src/components/guide/guide-shell.tsx`
- Modify: `src/components/guide/guide-shell.test.tsx`

**Interfaces:**
- Consumes: `CalculatorOverlayProvider` (Task 3), `PrimaryNav` (Task 4), `CalculatorOverlay` (Task 8).
- Produces: no new exports — `GuideShell`'s existing signature (`{ children, action }`) is unchanged, so every one of its 8 existing callers (`src/app/guide/[slug]/page.tsx`, `src/app/guide/[slug]/step/[step]/page.tsx`, `src/app/my/equipment/page.tsx`, `src/app/my/rounds/[roundId]/page.tsx`, `src/app/my/rounds/[roundId]/step/[step]/page.tsx`, `src/app/my/rounds/legacy/[roundId]/page.tsx`, `src/app/my/rounds/new/page.tsx`, `src/app/my/rounds/page.tsx`, `src/app/page.tsx`) needs no changes.

- [ ] **Step 1: Update the existing test to mock `next/navigation` and wrap with `AuthProvider`**

The current `guide-shell.test.tsx` renders `<GuideShell>` directly. Once `GuideShell` renders `PrimaryNav` (which calls `usePathname()`) and `CalculatorOverlay` (which calls `useAuth()`), both are required in the test render tree. Replace the full contents of `src/components/guide/guide-shell.test.tsx` with:

```tsx
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { AuthProvider } from "@/components/auth/auth-provider";
import { GuideShell } from "./guide-shell";

vi.mock("next/navigation", () => ({
  usePathname: () => "/",
}));

function renderShell(children: React.ReactNode, action?: React.ReactNode) {
  return renderToStaticMarkup(
    <AuthProvider>
      <GuideShell action={action}>{children}</GuideShell>
    </AuthProvider>,
  );
}

describe("GuideShell", () => {
  it("แสดงชื่อระบบและลิงก์กลับหน้าแรก", () => {
    const html = renderShell(<p>เนื้อหา</p>);

    expect(html).toContain("Plantlover Lab");
    expect(html).toContain('href="/"');
    expect(html).toContain("เนื้อหา");
  });

  it("มีลิงก์ข้ามไปเนื้อหาหลักสำหรับคนใช้คีย์บอร์ด", () => {
    const html = renderShell(<p>เนื้อหา</p>);

    expect(html).toContain('href="#pl-main"');
    expect(html).toContain('id="pl-main"');
  });

  it("มีเมนูหลักและปุ่มเครื่องคำนวณ", () => {
    const html = renderShell(<p>เนื้อหา</p>);

    expect(html).toContain("pl-nav-desktop");
    expect(html).toContain("pl-nav-mobile");
    expect(html).toContain("เครื่องคำนวณ");
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run src/components/guide/guide-shell.test.tsx`
Expected: FAIL — `GuideShell` doesn't render `PrimaryNav` yet, so the third test's assertions fail (first two still pass unchanged).

- [ ] **Step 3: Update the implementation**

Replace the full contents of `src/components/guide/guide-shell.tsx`:

```tsx
import Link from "next/link";
import type { ReactNode } from "react";
import { CalculatorOverlay } from "@/components/calculators/calculator-overlay";
import { CalculatorOverlayProvider } from "@/components/nav/calculator-overlay-context";
import { PrimaryNav } from "@/components/nav/primary-nav";

export function GuideShell({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <CalculatorOverlayProvider>
      <div className="pl-root">
        <a className="pl-skip" href="#pl-main">ข้ามไปเนื้อหาหลัก</a>
        <div className="pl-wrap">
          <header className="pl-bar">
            <Link className="pl-brand pl-link" href="/">Plantlover Lab</Link>
            <PrimaryNav />
            <span className="pl-bar-spacer" />
            {action}
          </header>
          <main id="pl-main">{children}</main>
        </div>
        <CalculatorOverlay />
      </div>
    </CalculatorOverlayProvider>
  );
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run src/components/guide/guide-shell.test.tsx`
Expected: PASS (3 tests)

- [ ] **Step 5: Commit**

```bash
git add src/components/guide/guide-shell.tsx src/components/guide/guide-shell.test.tsx
git commit -m "feat: mount PrimaryNav and CalculatorOverlay in GuideShell"
```

---

### Task 10: Full verification pass

**Files:** none (verification only)

- [ ] **Step 1: Run the full test suite**

Run: `npm test`
Expected: PASS — all existing tests plus every test added in Tasks 2–9. Pay particular attention to any test elsewhere in the suite that renders `GuideShell` or anything under `src/app/` that now transitively renders `PrimaryNav`/`CalculatorOverlay` (search first: `grep -rl "GuideShell" src/app src/components` to confirm none of those callers have their own tests that would now need the same `next/navigation` mock and `AuthProvider` wrapper applied in Task 9 — if any do, apply the identical fix).

- [ ] **Step 2: Run lint**

Run: `npm run lint`
Expected: no errors. Pay attention to `react-hooks/exhaustive-deps` on the two `useEffect` calls in `calculator-overlay.tsx` and `@typescript-eslint/no-unused-vars` on any leftover import.

- [ ] **Step 3: Run a production build**

Run: `npm run build`
Expected: build succeeds. This catches any Server/Client Component boundary mistake (e.g. a `"use client"` directive missing on a file that uses hooks) that neither `vitest` nor `eslint` would catch, since `GuideShell` itself stays a Server Component that now renders Client Components as children — a boundary that only Next's build step fully validates.

- [ ] **Step 4: Manual QA with `npm run dev` and `npm run ui:verify`**

Run: `npm run dev`, then in a browser:
- Load `/` at a mobile width (<768px) — confirm the bottom tab bar shows 3 items and doesn't overlap page content.
- Resize to ≥768px — confirm the bottom bar disappears and the same 3 items appear inline in the top bar.
- Tap/click "เครื่องคำนวณ" — confirm the overlay opens on the picker screen, each of the 3 cards navigates to its calculator, "←" returns to the picker, and "×"/backdrop click/Esc all close it.
- Open the "สูตรอาหาร" calculator — confirm switching the plant dropdown swaps the recipe shown.
- If logged in with saved equipment settings, confirm the working-stock and haiter forms are pre-filled with the saved pipette minimum.

Then run: `npm run ui:verify`
Expected: passes across all checked widths (360–1920px) — this is the project's existing automated visual-regression-style check on the production build; it will catch overlapping/clipped nav or overlay layout that unit tests cannot.

- [ ] **Step 5: Final commit (only if manual QA in Step 4 required code fixes)**

If Step 4 required no changes, this task is done — nothing to commit. If it did:

```bash
git add -A
git commit -m "fix: address issues found in manual nav/calculator overlay QA"
```

---

## Self-Review Notes

- **Spec coverage:** §2 (architecture) → Tasks 2–4, 8, 9. §3 (PrimaryNav) → Task 4. §4 (overlay + all 3 screens) → Tasks 2, 3, 8. §4.1 (medium recipe reuse + plant picker) → Task 8. §4.2 (working stock UI) → Task 6. §4.3 (haiter UI, two modes) → Task 7. §5 (soft tokens/CSS) → Task 1. §6 (client-only state, equipment prefill, error handling) → Tasks 6, 7, 8. §7 (testing conventions) → every task's test step + Task 10. §8 (out of scope) → not built (admin/`LabShell`, wide retrofit, rounds/profile nav items are absent by design).
- **Placeholder scan:** no TBD/TODO; every step has literal code and literal test assertions with numbers traced back to the actual domain functions.
- **Type consistency:** `OverlayState`/`CalculatorScreen` (Task 2) flow unchanged through `calculator-overlay-context.tsx` (Task 3), `primary-nav.tsx` (Task 4, via `state.isOpen` only), and `calculator-overlay.tsx` (Task 8, via `state.screen`/`select`/`back`/`close`) — verified consistent. `WorkingStockInput`/`WorkingStockResult` and `HaiterDoseInput`/`HaiterWorkingDilutionInput` are imported, never redefined, in Tasks 6–8.
