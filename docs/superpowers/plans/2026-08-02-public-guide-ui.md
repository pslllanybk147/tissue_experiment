# Public Guide UI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** เปิดคู่มือให้อ่านได้สาธารณะโดยไม่ต้องล็อกอิน ในภาษาออกแบบ Illustrated Step Book ที่รองรับทั้งโหมดสว่างและมืด พร้อมภาพประกอบครบทั้ง 14 ขั้น

**Architecture:** หน้าใหม่เป็น Server Component ล้วน อ่านจาก `src/lib/manual/` ที่เฟส 1 สร้างไว้ ตัวหน้าเป็น wrapper บาง ๆ ที่ await `params` แล้วส่งข้อมูลที่ resolve แล้วให้ component แบบ sync ใน `src/components/guide/` ซึ่งเทสต์ได้ด้วย `renderToStaticMarkup` ตามแบบที่ repo ใช้อยู่ CSS ของหน้าใหม่อยู่คนละไฟล์กับ `globals.css` และใช้ token ขึ้นต้นด้วย `--pl-` กับ class ขึ้นต้นด้วย `pl-` เพื่อไม่ให้ชนกับของเดิม 545 คลาส

**Tech Stack:** TypeScript, Next.js 16 App Router, React 19, Vitest 4, `next/font/google`

## Global Constraints

- หน้าใหม่ทั้งหมด **ห้ามใช้ `AuthGate`** ต้องอ่านได้โดยไม่ล็อกอิน
- token ของหน้าใหม่ต้องขึ้นต้นด้วย `--pl-` และ class ต้องขึ้นต้นด้วย `pl-` ห้ามใช้ชื่อซ้ำกับ `globals.css`
- ต้องออกแบบทั้งโหมดสว่างและมืดพร้อมกันที่ระดับ token **ห้าม invert ทีหลัง** โหมดมืดตอบสนองทั้ง `prefers-color-scheme` และ attribute `data-theme` บน `<html>` โดย attribute ต้องชนะ media query ทั้งสองทาง
- ชื่อระบบคือ **Plantlover Lab** ทุกที่ที่ผู้ใช้เห็น
- เงาต้องเป็นเงาทึบไม่เบลอ ตามภาษา Illustrated Step Book เช่น `box-shadow: 5px 5px 0 var(--pl-shadow)`
- ภาพประกอบต้องใช้สีจาก token เท่านั้น ห้าม hardcode สี เพื่อให้เปลี่ยนตามโหมดได้
- component ที่แสดงผลต้องเป็น sync เพื่อเทสต์ด้วย `renderToStaticMarkup` ได้ ส่วน async ให้อยู่ที่ไฟล์ `page.tsx` เท่านั้น
- `AGENTS.md` ระบุว่าต้องอ่าน `node_modules/next/dist/docs/` ก่อนเขียนโค้ดที่แตะ App Router ยืนยันแล้วในเฟส 1 ว่า `params` เป็น Promise ต้อง await
- รัน `npm test` และ `npm run lint` ก่อน commit ทุกครั้ง
- **ห้าม commit `package-lock.json`** npm บน Windows จะตัดฟิลด์ `libc` ออกซึ่งทำให้ build บน Linux เพี้ยน ถ้าไฟล์นี้เปลี่ยนให้ `git checkout -- package-lock.json`

---

### Task 1: Brand, typeface, and two-theme token system

**Files:**
- Modify: `src/app/layout.tsx`
- Create: `src/app/guide.css`
- Modify: `README.md:1`
- Test: `src/app/layout.test.ts`

**Interfaces:**
- Consumes: ไม่มี
- Produces: token ชุด `--pl-*` ที่ไฟล์ CSS อื่นใช้ต่อ, ตัวแปรฟอนต์ `--font-plex` และ `--font-plex-mono`, `metadata.title` เท่ากับ `Plantlover Lab`

เลือก IBM Plex Sans Thai เพราะครอบคลุมทั้งไทยและละตินในตระกูลเดียว ทำให้สองภาษาน้ำหนักเท่ากันจริง และเป็นตระกูลสายเทคนิคที่เข้ากับคู่มือปฏิบัติการ ฟอนต์ Geist เดิมต้องคงไว้เพราะ `globals.css` ยังอ้าง `--font-geist-sans` อยู่และหน้าเดิมยังใช้งาน

- [ ] **Step 1: Write the failing test**

สร้าง `src/app/layout.test.ts`

```ts
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { metadata } from "./layout";

describe("root layout", () => {
  it("ใช้ชื่อระบบ Plantlover Lab", () => {
    expect(metadata.title).toBe("Plantlover Lab");
  });

  it("ยังคงตัวแปรฟอนต์เดิมไว้ให้หน้าเก่าใช้ และเพิ่มฟอนต์ใหม่", () => {
    const source = readFileSync(new URL("./layout.tsx", import.meta.url), "utf8");

    expect(source).toContain("--font-geist-sans");
    expect(source).toContain("--font-plex");
  });
});

describe("guide tokens", () => {
  const css = readFileSync(new URL("./guide.css", import.meta.url), "utf8");

  it("นิยาม token ทั้งโหมดสว่างและโหมดมืด", () => {
    expect(css).toContain("prefers-color-scheme: dark");
    expect(css).toContain(':root[data-theme="dark"]');
    expect(css).toContain(':root[data-theme="light"]');
  });

  it("ใช้เงาทึบไม่เบลอตามภาษาออกแบบที่เลือก", () => {
    expect(css).toMatch(/box-shadow:\s*\d+px\s+\d+px\s+0\s+var\(--pl-shadow\)/);
  });

  it("ไม่ใช้ชื่อ token ที่ชนกับ globals.css", () => {
    const declared = [...css.matchAll(/(--[a-z0-9-]+):/g)].map((match) => match[1]);

    expect(declared.length).toBeGreaterThan(10);
    expect(declared.every((name) => name.startsWith("--pl-"))).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/app/layout.test.ts`
Expected: FAIL — หา `./guide.css` ไม่เจอ และ `metadata.title` ยังเป็น `Philodendron Lab`

- [ ] **Step 3: Write the token stylesheet**

สร้าง `src/app/guide.css`

```css
:root {
  --pl-paper: #fdf6e8;
  --pl-card: #ffffff;
  --pl-sunk: #f3ecdc;
  --pl-ink: #1d1a15;
  --pl-ink-2: #4d463a;
  --pl-ink-3: #7b7263;
  --pl-line: #1d1a15;
  --pl-shadow: #1d1a15;
  --pl-chip-ink: #1d1a15;
  --pl-yellow: #ffd23f;
  --pl-green: #65c893;
  --pl-pink: #e39ec4;
  --pl-sky: #cfe8f5;
  --pl-red: #e8705a;
  --pl-stop: #ffdcd5;
  --pl-leaf: #6f9a52;
  --pl-agar: #a8e6c1;
}

@media (prefers-color-scheme: dark) {
  :root {
    --pl-paper: #17150f;
    --pl-card: #221e17;
    --pl-sunk: #2b261d;
    --pl-ink: #f4efe3;
    --pl-ink-2: #c6bda9;
    --pl-ink-3: #948b79;
    --pl-line: #f4efe3;
    --pl-shadow: #000000;
    --pl-yellow: #e0b52e;
    --pl-green: #4fa877;
    --pl-pink: #c47ba2;
    --pl-sky: #2f4d5e;
    --pl-red: #c25b46;
    --pl-stop: #3d1f18;
    --pl-leaf: #7ca85e;
    --pl-agar: #3f7a58;
  }
}

:root[data-theme="dark"] {
  --pl-paper: #17150f;
  --pl-card: #221e17;
  --pl-sunk: #2b261d;
  --pl-ink: #f4efe3;
  --pl-ink-2: #c6bda9;
  --pl-ink-3: #948b79;
  --pl-line: #f4efe3;
  --pl-shadow: #000000;
  --pl-yellow: #e0b52e;
  --pl-green: #4fa877;
  --pl-pink: #c47ba2;
  --pl-sky: #2f4d5e;
  --pl-red: #c25b46;
  --pl-stop: #3d1f18;
  --pl-leaf: #7ca85e;
  --pl-agar: #3f7a58;
}

:root[data-theme="light"] {
  --pl-paper: #fdf6e8;
  --pl-card: #ffffff;
  --pl-sunk: #f3ecdc;
  --pl-ink: #1d1a15;
  --pl-ink-2: #4d463a;
  --pl-ink-3: #7b7263;
  --pl-line: #1d1a15;
  --pl-shadow: #1d1a15;
  --pl-chip-ink: #1d1a15;
  --pl-yellow: #ffd23f;
  --pl-green: #65c893;
  --pl-pink: #e39ec4;
  --pl-sky: #cfe8f5;
  --pl-red: #e8705a;
  --pl-stop: #ffdcd5;
  --pl-leaf: #6f9a52;
  --pl-agar: #a8e6c1;
}

.pl-root {
  min-height: 100vh;
  background: var(--pl-paper);
  color: var(--pl-ink);
  font-family: var(--font-plex), "Noto Sans Thai", Tahoma, sans-serif;
  line-height: 1.6;
}

.pl-skip {
  position: absolute;
  left: -9999px;
  top: 0;
  background: var(--pl-yellow);
  color: var(--pl-chip-ink);
  padding: 10px 16px;
  border: 2.5px solid var(--pl-line);
  border-radius: 10px;
  font-weight: 700;
  z-index: 10;
}

.pl-skip:focus {
  left: 12px;
  top: 12px;
}

.pl-wrap {
  max-width: 760px;
  margin: 0 auto;
  padding: 0 18px 72px;
}

.pl-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 18px 0 22px;
}

.pl-brand {
  font-weight: 700;
  font-size: 17px;
  letter-spacing: -0.02em;
  color: var(--pl-ink);
  text-decoration: none;
}

.pl-bar-spacer { margin-left: auto; }

.pl-card {
  background: var(--pl-card);
  border: 2.5px solid var(--pl-line);
  border-radius: 14px;
  padding: 18px;
  box-shadow: 5px 5px 0 var(--pl-shadow);
}

.pl-chip {
  display: inline-block;
  border: 2.5px solid var(--pl-line);
  border-radius: 20px;
  padding: 3px 11px;
  font-size: 12px;
  font-weight: 700;
  color: var(--pl-chip-ink);
  box-shadow: 2px 2px 0 var(--pl-shadow);
}

.pl-chip-direct { background: var(--pl-green); }
.pl-chip-adapted { background: var(--pl-yellow); }
.pl-chip-unsupported { background: var(--pl-red); }

.pl-h1 {
  font-size: clamp(26px, 5vw, 38px);
  font-weight: 700;
  letter-spacing: -0.03em;
  line-height: 1.15;
  margin: 0 0 8px;
  text-wrap: balance;
}

.pl-h2 {
  font-size: 20px;
  font-weight: 700;
  letter-spacing: -0.02em;
  margin: 0 0 6px;
}

.pl-lede { color: var(--pl-ink-2); margin: 0; }
.pl-meta { color: var(--pl-ink-3); font-size: 13px; margin: 0; }

.pl-mono {
  font-family: var(--font-plex-mono), ui-monospace, monospace;
  font-size: 12px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--pl-ink-3);
}

.pl-link:focus-visible,
.pl-skip:focus-visible,
.pl-toggle:focus-visible {
  outline: 3px solid var(--pl-ink);
  outline-offset: 3px;
}

@media (prefers-reduced-motion: reduce) {
  * { animation: none !important; transition: none !important; }
}
```

- [ ] **Step 4: Rewrite the root layout**

แทนที่ทั้งไฟล์ `src/app/layout.tsx`

```tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono, IBM_Plex_Mono, IBM_Plex_Sans_Thai, Noto_Sans_Thai } from "next/font/google";
import { AuthProvider } from "@/components/auth/auth-provider";
import "./globals.css";
import "./guide.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const notoSansThai = Noto_Sans_Thai({ variable: "--font-thai", subsets: ["thai", "latin"] });
const plexSansThai = IBM_Plex_Sans_Thai({
  variable: "--font-plex",
  subsets: ["thai", "latin"],
  weight: ["400", "600", "700"],
});
const plexMono = IBM_Plex_Mono({ variable: "--font-plex-mono", subsets: ["latin"], weight: ["400", "600"] });

export const metadata: Metadata = {
  title: "Plantlover Lab",
  description: "คู่มือเพาะเลี้ยงเนื้อเยื่อพืชแบบทีละขั้น พร้อมระดับหลักฐานของทุกคำแนะนำ",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const fontVars = [geistSans, geistMono, notoSansThai, plexSansThai, plexMono]
    .map((font) => font.variable)
    .join(" ");
  return (
    <html lang="th" className={fontVars} suppressHydrationWarning>
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
```

`suppressHydrationWarning` จำเป็นเพราะ Task 7 จะเขียน `data-theme` ลงบน `<html>` ก่อน React hydrate

- [ ] **Step 5: Update the README title**

แก้บรรทัดแรกของ `README.md` จาก `# Philodendron Lab` เป็น

```markdown
# Plantlover Lab
```

- [ ] **Step 6: Run test to verify it passes**

Run: `npx vitest run src/app/layout.test.ts`
Expected: PASS ทั้ง 5 เทสต์

- [ ] **Step 7: Verify the build still compiles**

Run: `npm run build`
Expected: build สำเร็จ ฟอนต์ใหม่ถูกดาวน์โหลดและ inline โดย `next/font`

- [ ] **Step 8: Commit**

```bash
git add src/app/layout.tsx src/app/guide.css src/app/layout.test.ts README.md
git commit -m "feat(guide): rename to Plantlover Lab and add two-theme design tokens"
```

---

### Task 2: Illustration set — ขั้นเตรียมงาน 7 ภาพแรก

**Files:**
- Create: `src/components/guide/illustrations.tsx`
- Test: `src/components/guide/illustrations.test.tsx`

**Interfaces:**
- Consumes: `coreSteps` จาก `@/lib/manual/core-steps`
- Produces: `illustrations: Record<string, () => ReactElement>` และ `Illustration({ id }: { id?: string }): ReactElement | null`

ภาพทุกภาพใช้ `viewBox="0 0 320 150"` เหมือนกันเพื่อให้ความสูงคงที่ทั้งคู่มือ และใช้ `stroke="var(--pl-line)"` กับ fill จาก token เพื่อให้เปลี่ยนตามโหมด

- [ ] **Step 1: Write the failing test**

สร้าง `src/components/guide/illustrations.test.tsx`

```tsx
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { coreSteps } from "@/lib/manual/core-steps";
import { Illustration, illustrations } from "./illustrations";

describe("illustrations", () => {
  it("มีภาพครบทุก illustrationId ที่ขั้นตอนแกนกลางอ้างถึง", () => {
    const needed = Object.values(coreSteps)
      .map((step) => step.illustrationId)
      .filter((id): id is string => Boolean(id));

    for (const id of needed) {
      expect(illustrations[id], `ยังไม่มีภาพสำหรับ ${id}`).toBeDefined();
    }
  });

  it("ทุกภาพวาดเป็น svg ที่มี viewBox เดียวกัน", () => {
    for (const [id, Component] of Object.entries(illustrations)) {
      const html = renderToStaticMarkup(<Component />);
      expect(html, `${id} ต้องเป็น svg`).toContain("<svg");
      expect(html, `${id} ต้องใช้ viewBox มาตรฐาน`).toContain('viewBox="0 0 320 150"');
    }
  });

  it("ทุกภาพใช้สีจาก token ไม่ hardcode ค่าสี", () => {
    for (const [id, Component] of Object.entries(illustrations)) {
      const html = renderToStaticMarkup(<Component />);
      expect(html, `${id} ห้าม hardcode สี hex`).not.toMatch(/#[0-9a-fA-F]{3,8}/);
    }
  });

  it("ภาพเป็นภาพประกอบ จึงซ่อนจากโปรแกรมอ่านหน้าจอ", () => {
    const html = renderToStaticMarkup(<Illustration id="sterilize-timer" />);
    expect(html).toContain('aria-hidden="true"');
  });

  it("คืนค่าว่างเมื่อไม่มีภาพของ id นั้น", () => {
    expect(renderToStaticMarkup(<Illustration id="ไม่มีภาพนี้" />)).toBe("");
    expect(renderToStaticMarkup(<Illustration />)).toBe("");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/guide/illustrations.test.tsx`
Expected: FAIL — Failed to resolve import "./illustrations"

- [ ] **Step 3: Write the frame helper and the first seven illustrations**

สร้าง `src/components/guide/illustrations.tsx`

```tsx
import type { ReactElement, ReactNode } from "react";

const LINE = "var(--pl-line)";

function Frame({ children, tone = "var(--pl-sky)" }: { children: ReactNode; tone?: string }) {
  return (
    <svg viewBox="0 0 320 150" aria-hidden="true" focusable="false" style={{ display: "block", width: "100%", height: "auto" }}>
      <rect width="320" height="150" fill={tone} />
      <g stroke={LINE} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none">
        {children}
      </g>
    </svg>
  );
}

function ReceiveBaseline() {
  return (
    <Frame>
      <rect x="34" y="86" width="66" height="44" rx="6" fill="var(--pl-leaf)" />
      <path d="M67 86V50" />
      <path d="M67 62c-16 0-24-9-24-19 13-4 24 5 24 19z" fill="var(--pl-leaf)" />
      <path d="M67 72c16 0 24-9 24-19-13-4-24 5-24 19z" fill="var(--pl-pink)" />
      <rect x="176" y="46" width="110" height="76" rx="10" fill="var(--pl-card)" />
      <circle cx="231" cy="84" r="21" fill="var(--pl-sky)" />
      <circle cx="231" cy="84" r="9" fill="var(--pl-card)" />
      <rect x="196" y="34" width="30" height="14" rx="5" fill="var(--pl-card)" />
      <path d="M140 84h22" />
      <path d="M154 76l9 8-9 8" />
    </Frame>
  );
}

function QuarantineCheck() {
  return (
    <Frame tone="var(--pl-sunk)">
      <rect x="30" y="30" width="118" height="94" rx="10" fill="var(--pl-card)" strokeDasharray="9 8" />
      <path d="M89 112V64" />
      <path d="M89 78c-14 0-21-8-21-17 12-3 21 5 21 17z" fill="var(--pl-leaf)" />
      <path d="M89 90c14 0 21-8 21-17-12-3-21 5-21 17z" fill="var(--pl-leaf)" />
      <rect x="182" y="40" width="106" height="72" rx="10" fill="var(--pl-card)" />
      <circle cx="216" cy="70" r="16" />
      <path d="M228 82l16 16" />
      <circle cx="252" cy="60" r="5" fill="var(--pl-red)" stroke="none" />
      <circle cx="264" cy="86" r="4" fill="var(--pl-red)" stroke="none" />
    </Frame>
  );
}

function IdentifyCompare() {
  return (
    <Frame>
      <rect x="26" y="32" width="122" height="90" rx="10" fill="var(--pl-card)" />
      <path d="M87 108V60" />
      <path d="M87 74c-15 0-22-8-22-18 13-3 22 6 22 18z" fill="var(--pl-leaf)" />
      <path d="M87 86c15 0 22-8 22-18-13-3-22 6-22 18z" fill="var(--pl-pink)" />
      <rect x="172" y="32" width="122" height="90" rx="10" fill="var(--pl-card)" />
      <path d="M233 108V60" />
      <path d="M233 74c-15 0-22-8-22-18 13-3 22 6 22 18z" fill="var(--pl-leaf)" />
      <path d="M233 86c15 0 22-8 22-18-13-3-22 6-22 18z" fill="var(--pl-leaf)" />
      <path d="M154 60v34" strokeDasharray="6 7" />
    </Frame>
  );
}

function NodeCutDiagram() {
  return (
    <Frame>
      <path d="M160 20v112" strokeWidth="9" stroke="var(--pl-leaf)" />
      <path d="M160 20v112" />
      <path d="M160 62c-22 0-32-10-32-22 18-5 32 6 32 22z" fill="var(--pl-leaf)" />
      <circle cx="160" cy="76" r="12" fill="var(--pl-yellow)" />
      <path d="M112 104h96" stroke="var(--pl-red)" strokeDasharray="8 7" />
      <path d="M232 76h34" />
      <path d="M232 104h34" stroke="var(--pl-red)" />
      <circle cx="272" cy="76" r="6" fill="var(--pl-yellow)" />
      <circle cx="272" cy="104" r="6" fill="var(--pl-red)" />
    </Frame>
  );
}

function CutExplant() {
  return (
    <Frame tone="var(--pl-sunk)">
      <path d="M92 30v92" strokeWidth="9" stroke="var(--pl-leaf)" />
      <path d="M92 30v92" />
      <circle cx="92" cy="70" r="11" fill="var(--pl-yellow)" />
      <path d="M56 96h72" stroke="var(--pl-red)" strokeDasharray="8 7" />
      <path d="M186 62l38 26" />
      <path d="M186 88l38-26" />
      <circle cx="182" cy="58" r="9" fill="var(--pl-card)" />
      <circle cx="182" cy="92" r="9" fill="var(--pl-card)" />
      <path d="M244 60v30" />
      <path d="M258 60v30" />
    </Frame>
  );
}

function PrepMedia() {
  return (
    <Frame tone="var(--pl-sunk)">
      <rect x="34" y="44" width="76" height="80" rx="8" fill="var(--pl-card)" />
      <rect x="42" y="86" width="60" height="34" rx="5" fill="var(--pl-agar)" />
      <path d="M26 44h92" />
      <circle cx="196" cy="80" r="34" fill="var(--pl-card)" />
      <path d="M196 80V56" />
      <path d="M196 80l16 12" />
      <rect x="252" y="52" width="42" height="60" rx="7" fill="var(--pl-yellow)" />
      <path d="M262 68h22M262 82h22M262 96h14" strokeWidth="2.5" />
    </Frame>
  );
}

function SterilizeTimer() {
  return (
    <Frame>
      <path d="M70 34h74v76a10 10 0 0 1-10 10H80a10 10 0 0 1-10-10z" fill="var(--pl-card)" />
      <path d="M74 78h66v32a8 8 0 0 1-8 8H82a8 8 0 0 1-8-8z" fill="var(--pl-agar)" />
      <path d="M62 34h90" />
      <path d="M95 94c-6-4-4-11 3-12 6-1 10 4 8 9-2 4-7 5-11 3z" fill="var(--pl-pink)" />
      <path d="M120 102c-6-4-4-11 3-12 6-1 10 4 8 9-2 4-7 5-11 3z" fill="var(--pl-pink)" />
      <circle cx="240" cy="78" r="36" fill="var(--pl-yellow)" />
      <path d="M240 78V54M240 78l16 12" />
      <path d="M230 34h20" />
      <path d="M168 78h26" />
      <path d="M186 70l10 8-10 8" />
    </Frame>
  );
}
```

- [ ] **Step 4: Add the registry and lookup component**

เพิ่มต่อท้ายไฟล์เดียวกัน

```tsx
export const illustrations: Record<string, () => ReactElement> = {
  "receive-baseline": ReceiveBaseline,
  "quarantine-check": QuarantineCheck,
  "identify-compare": IdentifyCompare,
  "node-cut-diagram": NodeCutDiagram,
  "cut-explant": CutExplant,
  "prep-media": PrepMedia,
  "sterilize-timer": SterilizeTimer,
};

export function Illustration({ id }: { id?: string }): ReactElement | null {
  if (!id) return null;
  const Component = illustrations[id];
  return Component ? <Component /> : null;
}
```

- [ ] **Step 5: Run test to verify the first three assertions pass**

Run: `npx vitest run src/components/guide/illustrations.test.tsx`
Expected: FAIL เฉพาะเทสต์แรก เพราะยังขาดภาพของอีก 7 ขั้น ส่วนเทสต์ที่เหลือผ่าน ยืนยันว่า contract ถูกต้องแล้ว

- [ ] **Step 6: Commit**

```bash
git add src/components/guide/illustrations.tsx src/components/guide/illustrations.test.tsx
git commit -m "feat(guide): add illustration frame and first seven step drawings"
```

---

### Task 3: Illustration set — ขั้นเพาะเลี้ยง 7 ภาพที่เหลือ

**Files:**
- Modify: `src/components/guide/illustrations.tsx`

**Interfaces:**
- Consumes: `Frame` และ `LINE` จาก Task 2
- Produces: `illustrations` ที่มีครบ 14 รายการ

- [ ] **Step 1: Run the test to confirm what is still missing**

Run: `npx vitest run src/components/guide/illustrations.test.tsx`
Expected: FAIL ที่เทสต์ `มีภาพครบทุก illustrationId` โดยชี้ id ที่ยังขาด

- [ ] **Step 2: Write the remaining seven illustrations**

เพิ่มฟังก์ชันเหล่านี้ก่อนบล็อก `export const illustrations`

```tsx
function MediumPlacement() {
  return (
    <Frame>
      <rect x="42" y="40" width="88" height="86" rx="9" fill="var(--pl-card)" />
      <rect x="50" y="92" width="72" height="28" rx="5" fill="var(--pl-agar)" />
      <path d="M86 92V58" />
      <path d="M86 70c-13 0-19-7-19-15 11-3 19 5 19 15z" fill="var(--pl-leaf)" />
      <circle cx="86" cy="60" r="7" fill="var(--pl-yellow)" />
      <rect x="190" y="40" width="88" height="86" rx="9" fill="var(--pl-card)" />
      <rect x="198" y="92" width="72" height="28" rx="5" fill="var(--pl-agar)" />
      <path d="M234 100v14" />
      <circle cx="234" cy="112" r="7" fill="var(--pl-red)" />
      <path d="M212 26l44 30M256 26l-44 30" stroke="var(--pl-red)" strokeWidth="4" />
    </Frame>
  );
}

function ContaminationCompare() {
  return (
    <Frame>
      <rect x="40" y="38" width="90" height="88" rx="9" fill="var(--pl-card)" />
      <rect x="48" y="94" width="74" height="26" rx="5" fill="var(--pl-agar)" />
      <path d="M85 94V64" />
      <path d="M85 76c-12 0-18-7-18-14 11-3 18 4 18 14z" fill="var(--pl-leaf)" />
      <rect x="190" y="38" width="90" height="88" rx="9" fill="var(--pl-card)" />
      <rect x="198" y="94" width="74" height="26" rx="5" fill="var(--pl-agar)" />
      <circle cx="222" cy="82" r="13" fill="var(--pl-sunk)" />
      <circle cx="248" cy="94" r="9" fill="var(--pl-sunk)" />
      <path d="M212 70l-8-8M232 70l8-8M222 66v-10" strokeWidth="2.5" />
      <path d="M204 26h62" stroke="var(--pl-red)" strokeWidth="4" />
    </Frame>
  );
}

function MultiplyShoots() {
  return (
    <Frame tone="var(--pl-sunk)">
      <rect x="34" y="44" width="72" height="80" rx="8" fill="var(--pl-card)" />
      <rect x="42" y="96" width="56" height="22" rx="5" fill="var(--pl-agar)" />
      <path d="M70 96V70" />
      <path d="M70 80c-11 0-16-6-16-13 10-2 16 4 16 13z" fill="var(--pl-leaf)" />
      <path d="M124 84h30" />
      <path d="M144 76l10 8-10 8" />
      <rect x="176" y="44" width="112" height="80" rx="8" fill="var(--pl-card)" />
      <rect x="184" y="96" width="96" height="22" rx="5" fill="var(--pl-agar)" />
      <path d="M206 96V72M232 96V64M258 96V74" />
      <path d="M206 80c-9 0-13-5-13-11 8-2 13 4 13 11z" fill="var(--pl-leaf)" />
      <path d="M232 74c9 0 13-5 13-11-8-2-13 4-13 11z" fill="var(--pl-leaf)" />
      <path d="M258 82c-9 0-13-5-13-11 8-2 13 4 13 11z" fill="var(--pl-leaf)" />
    </Frame>
  );
}

function Rooting() {
  return (
    <Frame tone="var(--pl-sunk)">
      <rect x="106" y="30" width="108" height="94" rx="9" fill="var(--pl-card)" />
      <rect x="114" y="92" width="92" height="26" rx="5" fill="var(--pl-agar)" />
      <path d="M160 92V52" />
      <path d="M160 66c-14 0-21-8-21-16 12-3 21 5 21 16z" fill="var(--pl-leaf)" />
      <path d="M160 76c14 0 21-8 21-16-12-3-21 5-21 16z" fill="var(--pl-leaf)" />
      <path d="M160 92l-20 20M160 92l20 20M160 92v22" strokeWidth="2.5" />
    </Frame>
  );
}

function Acclimatize() {
  return (
    <Frame>
      <path d="M40 120h100" />
      <rect x="46" y="92" width="88" height="28" rx="5" fill="var(--pl-leaf)" />
      <path d="M90 92V56" />
      <path d="M90 70c-13 0-20-8-20-16 12-3 20 5 20 16z" fill="var(--pl-leaf)" />
      <path d="M46 44a44 44 0 0 1 88 0" strokeDasharray="8 8" fill="none" />
      <path d="M180 120h100" />
      <rect x="186" y="92" width="88" height="28" rx="5" fill="var(--pl-leaf)" />
      <path d="M230 92V44" />
      <path d="M230 62c-15 0-23-9-23-18 14-3 23 6 23 18z" fill="var(--pl-leaf)" />
      <path d="M230 76c15 0 23-9 23-18-14-3-23 6-23 18z" fill="var(--pl-leaf)" />
      <path d="M262 30l12-12M274 44h16" strokeWidth="2.5" fill="none" />
    </Frame>
  );
}

function MonitorVariegation() {
  return (
    <Frame>
      <rect x="28" y="34" width="118" height="88" rx="10" fill="var(--pl-card)" />
      <path d="M87 108V64" />
      <path d="M87 78c-16 0-24-9-24-18 14-4 24 6 24 18z" fill="var(--pl-leaf)" />
      <path d="M87 90c16 0 24-9 24-18-14-4-24 6-24 18z" fill="var(--pl-pink)" />
      <rect x="174" y="34" width="118" height="88" rx="10" fill="var(--pl-card)" />
      <path d="M233 108V64" />
      <path d="M233 78c-16 0-24-9-24-18 14-4 24 6 24 18z" fill="var(--pl-pink)" />
      <path d="M233 90c16 0 24-9 24-18-14-4-24 6-24 18z" fill="var(--pl-leaf)" />
      <path d="M152 62v34" strokeDasharray="6 7" />
    </Frame>
  );
}

function CloseRound() {
  return (
    <Frame tone="var(--pl-sunk)">
      <rect x="74" y="26" width="120" height="100" rx="9" fill="var(--pl-card)" />
      <path d="M92 52h84M92 72h84M92 92h56" strokeWidth="2.5" />
      <circle cx="228" cy="94" r="30" fill="var(--pl-green)" />
      <path d="M214 94l10 11 20-23" strokeWidth="5" />
    </Frame>
  );
}
```

- [ ] **Step 3: Register the seven new illustrations**

แทนที่บล็อก `export const illustrations` ด้วย

```tsx
export const illustrations: Record<string, () => ReactElement> = {
  "receive-baseline": ReceiveBaseline,
  "quarantine-check": QuarantineCheck,
  "identify-compare": IdentifyCompare,
  "node-cut-diagram": NodeCutDiagram,
  "cut-explant": CutExplant,
  "prep-media": PrepMedia,
  "sterilize-timer": SterilizeTimer,
  "medium-placement": MediumPlacement,
  "contamination-compare": ContaminationCompare,
  "multiply-shoots": MultiplyShoots,
  rooting: Rooting,
  acclimatize: Acclimatize,
  "monitor-variegation": MonitorVariegation,
  "close-round": CloseRound,
};
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/components/guide/illustrations.test.tsx`
Expected: PASS ทั้ง 5 เทสต์

- [ ] **Step 5: Run lint**

Run: `npm run lint`
Expected: ไม่มี error

- [ ] **Step 6: Commit**

```bash
git add src/components/guide/illustrations.tsx
git commit -m "feat(guide): complete the fourteen step illustration set"
```

---

### Task 4: Evidence badge and guide shell

**Files:**
- Create: `src/components/guide/evidence-badge.tsx`
- Create: `src/components/guide/guide-shell.tsx`
- Test: `src/components/guide/evidence-badge.test.tsx`
- Test: `src/components/guide/guide-shell.test.tsx`

**Interfaces:**
- Consumes: `EvidenceLevel` จาก `@/lib/manual/types`
- Produces: `EvidenceBadge({ level }: { level: EvidenceLevel })`, `evidenceLabel: Record<EvidenceLevel, string>`, `GuideShell({ children, action }: { children: ReactNode; action?: ReactNode })`

- [ ] **Step 1: Write the failing tests**

สร้าง `src/components/guide/evidence-badge.test.tsx`

```tsx
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { EvidenceBadge, evidenceLabel } from "./evidence-badge";

describe("EvidenceBadge", () => {
  it("แปลระดับหลักฐานเป็นคำที่คนทั่วไปเข้าใจ", () => {
    expect(evidenceLabel["species-direct"]).toBe("ตรงพันธุ์");
    expect(evidenceLabel.adapted).toBe("ประยุกต์");
    expect(evidenceLabel.unsupported).toBe("ยังไม่มีงานรองรับ");
  });

  it("ใช้คลาสสีต่างกันตามระดับ", () => {
    expect(renderToStaticMarkup(<EvidenceBadge level="species-direct" />)).toContain("pl-chip-direct");
    expect(renderToStaticMarkup(<EvidenceBadge level="adapted" />)).toContain("pl-chip-adapted");
    expect(renderToStaticMarkup(<EvidenceBadge level="unsupported" />)).toContain("pl-chip-unsupported");
  });

  it("บอกความหมายให้โปรแกรมอ่านหน้าจอ ไม่ใช่สื่อด้วยสีอย่างเดียว", () => {
    const html = renderToStaticMarkup(<EvidenceBadge level="unsupported" />);

    expect(html).toContain("ระดับหลักฐาน");
    expect(html).toContain("ยังไม่มีงานรองรับ");
  });
});
```

สร้าง `src/components/guide/guide-shell.test.tsx`

```tsx
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { GuideShell } from "./guide-shell";

describe("GuideShell", () => {
  it("แสดงชื่อระบบและลิงก์กลับหน้าแรก", () => {
    const html = renderToStaticMarkup(<GuideShell><p>เนื้อหา</p></GuideShell>);

    expect(html).toContain("Plantlover Lab");
    expect(html).toContain('href="/"');
    expect(html).toContain("เนื้อหา");
  });

  it("มีลิงก์ข้ามไปเนื้อหาหลักสำหรับคนใช้คีย์บอร์ด", () => {
    const html = renderToStaticMarkup(<GuideShell><p>เนื้อหา</p></GuideShell>);

    expect(html).toContain('href="#pl-main"');
    expect(html).toContain('id="pl-main"');
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/components/guide/evidence-badge.test.tsx src/components/guide/guide-shell.test.tsx`
Expected: FAIL — resolve import ไม่ได้ทั้งสองไฟล์

- [ ] **Step 3: Write the evidence badge**

สร้าง `src/components/guide/evidence-badge.tsx`

```tsx
import type { EvidenceLevel } from "@/lib/manual/types";

export const evidenceLabel: Record<EvidenceLevel, string> = {
  "species-direct": "ตรงพันธุ์",
  adapted: "ประยุกต์",
  unsupported: "ยังไม่มีงานรองรับ",
};

const evidenceClass: Record<EvidenceLevel, string> = {
  "species-direct": "pl-chip pl-chip-direct",
  adapted: "pl-chip pl-chip-adapted",
  unsupported: "pl-chip pl-chip-unsupported",
};

export function EvidenceBadge({ level }: { level: EvidenceLevel }) {
  return <span className={evidenceClass[level]}>ระดับหลักฐาน {evidenceLabel[level]}</span>;
}
```

- [ ] **Step 4: Write the guide shell**

สร้าง `src/components/guide/guide-shell.tsx`

```tsx
import Link from "next/link";
import type { ReactNode } from "react";

export function GuideShell({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="pl-root">
      <a className="pl-skip" href="#pl-main">ข้ามไปเนื้อหาหลัก</a>
      <div className="pl-wrap">
        <header className="pl-bar">
          <Link className="pl-brand pl-link" href="/">Plantlover Lab</Link>
          <span className="pl-bar-spacer" />
          {action}
        </header>
        <main id="pl-main">{children}</main>
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `npx vitest run src/components/guide/evidence-badge.test.tsx src/components/guide/guide-shell.test.tsx`
Expected: PASS ทั้ง 5 เทสต์

- [ ] **Step 6: Commit**

```bash
git add src/components/guide/evidence-badge.tsx src/components/guide/guide-shell.tsx src/components/guide/evidence-badge.test.tsx src/components/guide/guide-shell.test.tsx
git commit -m "feat(guide): add evidence badge and public guide shell"
```

---

### Task 5: Public home — plant picker, and move the dashboard to /my

**Files:**
- Create: `src/components/guide/plant-picker.tsx`
- Test: `src/components/guide/plant-picker.test.tsx`
- Create: `src/app/my/page.tsx`
- Modify: `src/app/page.tsx`
- Modify: `src/components/lab/lab-shell.tsx:16`
- Modify: `src/components/lab/lab-shell.test.tsx`

**Interfaces:**
- Consumes: `plantPacks` จาก `@/lib/manual/registry`, `manualSummary` จาก `@/lib/manual/summary`, `GuideShell` จาก Task 4
- Produces: `PlantPicker({ plants }: { plants: PlantPickerItem[] })` โดย `PlantPickerItem = { slug: string; scientificName: string; commonName: string; summary: string; stepCount: number; durationLabel: string }`

หน้าเดิมที่ `/` เป็น dashboard ที่ต้องล็อกอิน ต้องย้ายไป `/my` ทั้งไฟล์โดยไม่แก้เนื้อใน แล้วให้ `/` เป็นหน้าเลือกต้นสาธารณะแทน เมนู Overview ใน `lab-shell` ต้องชี้ไป `/my` ไม่ใช่ `/`

- [ ] **Step 1: Write the failing test**

สร้าง `src/components/guide/plant-picker.test.tsx`

```tsx
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { PlantPicker } from "./plant-picker";

const plants = [
  {
    slug: "pink-princess",
    scientificName: "Philodendron erubescens ‘Pink Princess’",
    commonName: "ฟิโลเดนดรอน พิงค์ปริ๊นเซส",
    summary: "ขยายจากตาข้าง",
    stepCount: 14,
    durationLabel: "4 ถึง 8 เดือน",
  },
];

describe("PlantPicker", () => {
  it("ถามคำถามเดียวว่าจะเพาะต้นอะไร", () => {
    const html = renderToStaticMarkup(<PlantPicker plants={plants} />);

    expect(html).toContain("จะเพาะต้นอะไรดี");
    expect(html).toContain("ยังไม่ต้องสมัคร");
  });

  it("ลิงก์ไปหน้าคู่มือของแต่ละต้นและบอกจำนวนขั้น", () => {
    const html = renderToStaticMarkup(<PlantPicker plants={plants} />);

    expect(html).toContain('href="/guide/pink-princess"');
    expect(html).toContain("14 ขั้น");
    expect(html).toContain("4 ถึง 8 เดือน");
  });

  it("แสดงทั้งชื่อวิทยาศาสตร์และชื่อที่คนเรียกกัน", () => {
    const html = renderToStaticMarkup(<PlantPicker plants={plants} />);

    expect(html).toContain("Pink Princess");
    expect(html).toContain("ฟิโลเดนดรอน พิงค์ปริ๊นเซส");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/guide/plant-picker.test.tsx`
Expected: FAIL — Failed to resolve import "./plant-picker"

- [ ] **Step 3: Write the plant picker**

สร้าง `src/components/guide/plant-picker.tsx`

```tsx
import Link from "next/link";

export type PlantPickerItem = {
  slug: string;
  scientificName: string;
  commonName: string;
  summary: string;
  stepCount: number;
  durationLabel: string;
};

export function PlantPicker({ plants }: { plants: PlantPickerItem[] }) {
  return (
    <>
      <h1 className="pl-h1">จะเพาะต้นอะไรดี</h1>
      <p className="pl-lede" style={{ marginBottom: "22px" }}>
        เลือกต้นแล้วอ่านคู่มือได้เลย ยังไม่ต้องสมัครสมาชิก
      </p>
      <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "14px" }}>
        {plants.map((plant) => (
          <li key={plant.slug}>
            <Link className="pl-card pl-link" href={`/guide/${plant.slug}`} style={{ display: "block", color: "inherit", textDecoration: "none" }}>
              <p className="pl-h2">{plant.commonName}</p>
              <p className="pl-meta" style={{ fontStyle: "italic" }}>{plant.scientificName}</p>
              <p className="pl-lede" style={{ marginTop: "8px" }}>{plant.summary}</p>
              <p className="pl-mono" style={{ marginTop: "10px" }}>
                {plant.stepCount} ขั้น · {plant.durationLabel}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/components/guide/plant-picker.test.tsx`
Expected: PASS ทั้ง 3 เทสต์

- [ ] **Step 5: Move the dashboard to /my**

Run: `git mv src/app/page.tsx src/app/my/page.tsx`

ถ้าโฟลเดอร์ยังไม่มี ให้สร้างก่อนด้วย `mkdir -p src/app/my` เนื้อในไฟล์ไม่ต้องแก้เลย

- [ ] **Step 6: Write the new public home**

สร้าง `src/app/page.tsx`

```tsx
import { GuideShell } from "@/components/guide/guide-shell";
import { PlantPicker, type PlantPickerItem } from "@/components/guide/plant-picker";
import { ThemeToggle } from "@/components/guide/theme-toggle";
import { plantPacks } from "@/lib/manual/registry";
import { manualSummary } from "@/lib/manual/summary";

export default function HomePage() {
  const plants: PlantPickerItem[] = plantPacks.map((pack) => ({
    slug: pack.slug,
    scientificName: pack.scientificName,
    commonName: pack.commonName,
    summary: pack.summary,
    stepCount: manualSummary(pack.slug)?.stepCount ?? 0,
    durationLabel: pack.durationLabel,
  }));

  return (
    <GuideShell action={<ThemeToggle />}>
      <PlantPicker plants={plants} />
    </GuideShell>
  );
}
```

ไฟล์นี้อ้าง `ThemeToggle` ที่ Task 7 จะสร้าง ให้ทำ Task 7 ก่อนรัน build ถ้าอยากเห็นผลทันที ระหว่างนี้เทสต์ยังผ่านเพราะไม่มีเทสต์ใดนำเข้าไฟล์ `page.tsx`

- [ ] **Step 7: Point the legacy Overview link at /my**

ใน `src/components/lab/lab-shell.tsx` แก้รายการแรกของ `destinations` จาก

```tsx
  { label: "Overview", text: "เริ่มต้น", href: "/" },
```

เป็น

```tsx
  { label: "Overview", text: "เริ่มต้น", href: "/my" },
```

- [ ] **Step 8: Update any lab-shell assertion that expects the old href**

Run: `npx vitest run src/components/lab/lab-shell.test.tsx`

ถ้าเทสต์ล้มเหลวเพราะคาดว่า `href="/"` ให้แก้ค่าที่คาดไว้เป็น `href="/my"` ถ้าผ่านอยู่แล้วไม่ต้องแก้อะไร

- [ ] **Step 9: Run the whole suite and lint**

Run: `npm test` แล้ว `npm run lint`
Expected: ผ่านทั้งหมด

- [ ] **Step 10: Commit**

```bash
git add src/components/guide/plant-picker.tsx src/components/guide/plant-picker.test.tsx src/app/page.tsx src/app/my/page.tsx src/components/lab/lab-shell.tsx src/components/lab/lab-shell.test.tsx
git commit -m "feat(guide): make the public plant picker the home page"
```

---

### Task 6: Guide overview and step pages

**Files:**
- Create: `src/components/guide/step-map.tsx`
- Create: `src/components/guide/step-detail.tsx`
- Test: `src/components/guide/step-map.test.tsx`
- Test: `src/components/guide/step-detail.test.tsx`
- Create: `src/app/guide/[slug]/page.tsx`
- Create: `src/app/guide/[slug]/step/[step]/page.tsx`

**Interfaces:**
- Consumes: `ResolvedManual` และ `ResolvedStep` จาก `@/lib/manual/types`, `resolveBySlug` และ `allSlugs` จาก `@/lib/manual/registry`, `sourceById` จาก `@/lib/manual/sources`, `EvidenceBadge` จาก Task 4, `Illustration` จาก Task 3
- Produces: `StepMap({ manual }: { manual: ResolvedManual })`, `StepDetail({ manual, step }: { manual: ResolvedManual; step: ResolvedStep })`

หมายเลขขั้นใน URL เริ่มที่ 1 ส่วน `step.order` เริ่มที่ 0 ต้องแปลงที่ชั้น page เท่านั้น

- [ ] **Step 1: Write the failing tests**

สร้าง `src/components/guide/step-map.test.tsx`

```tsx
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { resolveBySlug } from "@/lib/manual/registry";
import { StepMap } from "./step-map";

const manual = resolveBySlug("pink-princess")!;

describe("StepMap", () => {
  it("แสดงชื่อต้นและจำนวนขั้นทั้งหมด", () => {
    const html = renderToStaticMarkup(<StepMap manual={manual} />);

    expect(html).toContain("Pink Princess");
    expect(html).toContain("14 ขั้น");
  });

  it("ลิงก์ทุกขั้นด้วยหมายเลขที่เริ่มจาก 1", () => {
    const html = renderToStaticMarkup(<StepMap manual={manual} />);

    expect(html).toContain('href="/guide/pink-princess/step/1"');
    expect(html).toContain('href="/guide/pink-princess/step/14"');
    expect(html).not.toContain('href="/guide/pink-princess/step/0"');
  });

  it("เตือนไว้บนหัวคู่มือเมื่อมีขั้นที่ยังไม่มีงานรองรับ", () => {
    const html = renderToStaticMarkup(<StepMap manual={manual} />);

    expect(html).toContain("ยังไม่มีงานรองรับ");
  });
});
```

สร้าง `src/components/guide/step-detail.test.tsx`

```tsx
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { resolveBySlug } from "@/lib/manual/registry";
import { StepDetail } from "./step-detail";

const manual = resolveBySlug("pink-princess")!;
const sterilize = manual.steps.find((step) => step.id === "sterilize")!;
const first = manual.steps[0];
const last = manual.steps[manual.steps.length - 1];

describe("StepDetail", () => {
  it("แสดงหมายเลขขั้นแบบเริ่มจาก 1 พร้อมชื่อและเหตุผล", () => {
    const html = renderToStaticMarkup(<StepDetail manual={manual} step={sterilize} />);

    expect(html).toContain("ขั้นที่ 7 จาก 14");
    expect(html).toContain("ฟอกฆ่าเชื้อ");
    expect(html).toContain("ฟอกอ่อนไปจะมีเชื้อขึ้น");
  });

  it("แสดงสิ่งที่ต้องลงมือ เกณฑ์ผ่าน และจุดที่ต้องหยุด", () => {
    const html = renderToStaticMarkup(<StepDetail manual={manual} step={sterilize} />);

    expect(html).toContain("ลงมือทำ");
    expect(html).toContain("ผ่านเมื่อ");
    expect(html).toContain("หยุดทันทีถ้า");
  });

  it("เตือนความปลอดภัยก่อนรายการลงมือทำ", () => {
    const html = renderToStaticMarkup(<StepDetail manual={manual} step={sterilize} />);

    expect(html.indexOf("แอมโมเนีย")).toBeLessThan(html.indexOf("ลงมือทำ"));
  });

  it("มีภาพประกอบของขั้นนั้น", () => {
    const html = renderToStaticMarkup(<StepDetail manual={manual} step={sterilize} />);

    expect(html).toContain("<svg");
  });

  it("ไม่มีปุ่มย้อนกลับที่ขั้นแรก และไม่มีปุ่มถัดไปที่ขั้นสุดท้าย", () => {
    const firstHtml = renderToStaticMarkup(<StepDetail manual={manual} step={first} />);
    const lastHtml = renderToStaticMarkup(<StepDetail manual={manual} step={last} />);

    expect(firstHtml).not.toContain("/step/0");
    expect(firstHtml).toContain("/step/2");
    expect(lastHtml).toContain("/step/13");
    expect(lastHtml).not.toContain("/step/15");
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/components/guide/step-map.test.tsx src/components/guide/step-detail.test.tsx`
Expected: FAIL — resolve import ไม่ได้ทั้งสองไฟล์

- [ ] **Step 3: Write the step map**

สร้าง `src/components/guide/step-map.tsx`

```tsx
import Link from "next/link";
import type { ResolvedManual } from "@/lib/manual/types";
import { EvidenceBadge, evidenceLabel } from "./evidence-badge";

export function StepMap({ manual }: { manual: ResolvedManual }) {
  const unsupported = manual.steps.filter((step) => step.evidence.level === "unsupported");

  return (
    <>
      <h1 className="pl-h1">{manual.commonName}</h1>
      <p className="pl-meta" style={{ fontStyle: "italic" }}>{manual.scientificName}</p>
      <p className="pl-lede" style={{ marginTop: "10px" }}>{manual.summary}</p>
      <p className="pl-mono" style={{ marginTop: "10px" }}>
        {manual.steps.length} ขั้น · {manual.durationLabel}
      </p>

      {unsupported.length > 0 ? (
        <div className="pl-card" style={{ background: "var(--pl-stop)", marginTop: "18px" }}>
          <p style={{ margin: 0, fontWeight: 700 }}>
            คู่มือนี้มี {unsupported.length} ขั้นที่ยังไม่มีงานรองรับ
          </p>
          <p className="pl-lede" style={{ marginTop: "6px" }}>
            ขั้นเหล่านี้ยังไม่มีงานวิจัยที่ทำกับพันธุ์นี้โดยตรง ให้ทำกระปุกเปล่าคุมทุกรอบและบันทึกผลจริงไว้เสมอ
          </p>
        </div>
      ) : null}

      <ol style={{ listStyle: "none", margin: "22px 0 0", padding: 0, display: "flex", flexDirection: "column", gap: "12px" }}>
        {manual.steps.map((step) => (
          <li key={step.id}>
            <Link
              className="pl-card pl-link"
              href={`/guide/${manual.slug}/step/${step.order + 1}`}
              style={{ display: "block", color: "inherit", textDecoration: "none" }}
            >
              <p className="pl-mono">ขั้นที่ {step.order + 1}</p>
              <p className="pl-h2" style={{ marginTop: "4px" }}>{step.title}</p>
              <p className="pl-lede" style={{ marginTop: "4px" }}>{step.summary}</p>
              <p style={{ marginTop: "10px" }}>
                <EvidenceBadge level={step.evidence.level} />
              </p>
            </Link>
          </li>
        ))}
      </ol>

      <p className="pl-meta" style={{ marginTop: "20px" }}>
        คำอธิบายระดับหลักฐาน · {evidenceLabel["species-direct"]} คือมีงานวิจัยที่ทำกับพันธุ์นี้โดยตรง ·{" "}
        {evidenceLabel.adapted} คือมีงานรองรับแต่ทำกับพืชอื่น · {evidenceLabel.unsupported} คือยังไม่มีงานตีพิมพ์รองรับ
      </p>
    </>
  );
}
```

- [ ] **Step 4: Write the step detail**

สร้าง `src/components/guide/step-detail.tsx`

```tsx
import Link from "next/link";
import { sourceById } from "@/lib/manual/sources";
import type { ResolvedManual, ResolvedStep } from "@/lib/manual/types";
import { EvidenceBadge } from "./evidence-badge";
import { Illustration } from "./illustrations";

function List({ title, items }: { title: string; items: string[] }) {
  if (items.length === 0) return null;
  return (
    <section style={{ marginTop: "18px" }}>
      <h2 className="pl-h2">{title}</h2>
      <ul style={{ margin: "8px 0 0", paddingLeft: "20px", display: "flex", flexDirection: "column", gap: "6px" }}>
        {items.map((item) => <li key={item}>{item}</li>)}
      </ul>
    </section>
  );
}

export function StepDetail({ manual, step }: { manual: ResolvedManual; step: ResolvedStep }) {
  const number = step.order + 1;
  const total = manual.steps.length;
  const previous = number > 1 ? number - 1 : null;
  const next = number < total ? number + 1 : null;

  return (
    <>
      <p className="pl-mono">
        <Link className="pl-link" href={`/guide/${manual.slug}`} style={{ color: "inherit" }}>{manual.commonName}</Link>
        {" · "}ขั้นที่ {number} จาก {total}
      </p>
      <h1 className="pl-h1" style={{ marginTop: "8px" }}>{step.title}</h1>
      <p style={{ marginTop: "6px" }}><EvidenceBadge level={step.evidence.level} /></p>
      <p className="pl-lede" style={{ marginTop: "12px" }}>{step.summary}</p>
      <p className="pl-lede" style={{ marginTop: "8px" }}>{step.why}</p>

      {step.illustrationId ? (
        <div className="pl-card" style={{ marginTop: "18px", padding: 0, overflow: "hidden" }}>
          <Illustration id={step.illustrationId} />
        </div>
      ) : null}

      {step.safetyNotes.length > 0 ? (
        <div className="pl-card" style={{ background: "var(--pl-stop)", marginTop: "18px" }}>
          <p className="pl-mono" style={{ color: "var(--pl-ink-2)" }}>ความปลอดภัย</p>
          <ul style={{ margin: "8px 0 0", paddingLeft: "20px", display: "flex", flexDirection: "column", gap: "6px" }}>
            {step.safetyNotes.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </div>
      ) : null}

      <List title="ของที่ต้องเตรียม" items={step.materials} />

      <section style={{ marginTop: "18px" }}>
        <h2 className="pl-h2">ลงมือทำ</h2>
        <ol style={{ margin: "8px 0 0", paddingLeft: "20px", display: "flex", flexDirection: "column", gap: "8px" }}>
          {step.actions.map((action) => <li key={action}>{action}</li>)}
        </ol>
      </section>

      <List title="ผ่านเมื่อ" items={step.passCriteria} />
      <List title="หยุดทันทีถ้า" items={step.stopConditions} />

      {step.evidence.note ? (
        <section style={{ marginTop: "18px" }}>
          <h2 className="pl-h2">ที่มาของคำแนะนำนี้</h2>
          <p className="pl-lede" style={{ marginTop: "6px" }}>{step.evidence.note}</p>
        </section>
      ) : null}

      {step.evidence.sourceIds.length > 0 ? (
        <ul style={{ margin: "10px 0 0", paddingLeft: "20px", display: "flex", flexDirection: "column", gap: "6px" }}>
          {step.evidence.sourceIds.map((id) => {
            const source = sourceById(id);
            return (
              <li key={id}>
                {source ? <a className="pl-link" href={source.url}>{source.title}</a> : id}
              </li>
            );
          })}
        </ul>
      ) : null}

      <nav style={{ display: "flex", gap: "12px", marginTop: "28px" }}>
        {previous ? (
          <Link className="pl-card pl-link" href={`/guide/${manual.slug}/step/${previous}`} style={{ flex: 1, textAlign: "center", color: "inherit", textDecoration: "none", fontWeight: 700 }}>
            ‹ ขั้นที่ {previous}
          </Link>
        ) : null}
        {next ? (
          <Link className="pl-card pl-link" href={`/guide/${manual.slug}/step/${next}`} style={{ flex: 1, textAlign: "center", background: "var(--pl-yellow)", color: "var(--pl-chip-ink)", textDecoration: "none", fontWeight: 700 }}>
            ขั้นที่ {next} ›
          </Link>
        ) : null}
      </nav>
    </>
  );
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `npx vitest run src/components/guide/step-map.test.tsx src/components/guide/step-detail.test.tsx`
Expected: PASS ทั้ง 8 เทสต์

- [ ] **Step 6: Write the guide overview page**

สร้าง `src/app/guide/[slug]/page.tsx`

```tsx
import { notFound } from "next/navigation";
import { GuideShell } from "@/components/guide/guide-shell";
import { StepMap } from "@/components/guide/step-map";
import { ThemeToggle } from "@/components/guide/theme-toggle";
import { allSlugs, resolveBySlug } from "@/lib/manual/registry";

export function generateStaticParams() {
  return allSlugs().map((slug) => ({ slug }));
}

export default async function GuidePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const manual = resolveBySlug(slug);
  if (!manual) notFound();

  return (
    <GuideShell action={<ThemeToggle />}>
      <StepMap manual={manual} />
    </GuideShell>
  );
}
```

- [ ] **Step 7: Write the step page**

สร้าง `src/app/guide/[slug]/step/[step]/page.tsx`

```tsx
import { notFound } from "next/navigation";
import { GuideShell } from "@/components/guide/guide-shell";
import { StepDetail } from "@/components/guide/step-detail";
import { ThemeToggle } from "@/components/guide/theme-toggle";
import { allSlugs, resolveBySlug } from "@/lib/manual/registry";

export function generateStaticParams() {
  return allSlugs().flatMap((slug) => {
    const manual = resolveBySlug(slug);
    return (manual?.steps ?? []).map((item) => ({ slug, step: String(item.order + 1) }));
  });
}

export default async function GuideStepPage({ params }: { params: Promise<{ slug: string; step: string }> }) {
  const { slug, step } = await params;
  const manual = resolveBySlug(slug);
  if (!manual) notFound();

  const number = Number(step);
  if (!Number.isInteger(number) || number < 1 || number > manual.steps.length) notFound();

  return (
    <GuideShell action={<ThemeToggle />}>
      <StepDetail manual={manual} step={manual.steps[number - 1]} />
    </GuideShell>
  );
}
```

- [ ] **Step 8: Commit**

```bash
git add src/components/guide/step-map.tsx src/components/guide/step-detail.tsx src/components/guide/step-map.test.tsx src/components/guide/step-detail.test.tsx src/app/guide
git commit -m "feat(guide): add public guide overview and step pages"
```

---

### Task 7: Theme toggle

**Files:**
- Create: `src/components/guide/theme-toggle.tsx`
- Create: `src/components/guide/theme-script.tsx`
- Modify: `src/app/layout.tsx`
- Test: `src/components/guide/theme-toggle.test.tsx`

**Interfaces:**
- Consumes: ไม่มี
- Produces: `ThemeToggle()` เป็น Client Component และ `ThemeScript()` ที่ฝัง inline script ไว้ตั้ง `data-theme` ก่อน React hydrate

ต้องตั้งค่าธีมก่อน paint ไม่งั้นหน้าจะกระพริบจากสว่างเป็นมืด สคริปต์นี้จึงต้องเป็น inline script ที่รันทันที

- [ ] **Step 1: Write the failing test**

สร้าง `src/components/guide/theme-toggle.test.tsx`

```tsx
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ThemeScript } from "./theme-script";
import { ThemeToggle } from "./theme-toggle";

describe("ThemeScript", () => {
  it("อ่านค่าที่เคยเลือกไว้และตั้ง data-theme ก่อนหน้าจะวาด", () => {
    const html = renderToStaticMarkup(<ThemeScript />);

    expect(html).toContain("localStorage");
    expect(html).toContain("data-theme");
  });
});

describe("ThemeToggle", () => {
  it("เป็นปุ่มจริงที่บอกหน้าที่ตัวเองให้โปรแกรมอ่านหน้าจอ", () => {
    const html = renderToStaticMarkup(<ThemeToggle />);

    expect(html).toContain("<button");
    expect(html).toContain('type="button"');
    expect(html).toContain("aria-label");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/guide/theme-toggle.test.tsx`
Expected: FAIL — resolve import ไม่ได้

- [ ] **Step 3: Write the pre-paint theme script**

สร้าง `src/components/guide/theme-script.tsx`

```tsx
const script = `(function(){try{var t=localStorage.getItem("pl-theme");if(t==="dark"||t==="light"){document.documentElement.setAttribute("data-theme",t);}}catch(e){}})();`;

export function ThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
```

- [ ] **Step 4: Write the toggle**

สร้าง `src/components/guide/theme-toggle.tsx`

```tsx
"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark";

function currentTheme(): Theme {
  const attribute = document.documentElement.getAttribute("data-theme");
  if (attribute === "dark" || attribute === "light") return attribute;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme | null>(null);

  useEffect(() => { setTheme(currentTheme()); }, []);

  function toggle() {
    const next: Theme = (theme ?? currentTheme()) === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    try { localStorage.setItem("pl-theme", next); } catch { /* โหมดส่วนตัวปิดการเก็บค่า ยังใช้งานต่อได้ */ }
    setTheme(next);
  }

  const label = theme === "dark" ? "เปลี่ยนเป็นโหมดสว่าง" : "เปลี่ยนเป็นโหมดมืด";

  return (
    <button type="button" className="pl-chip pl-toggle" aria-label={label} onClick={toggle} style={{ background: "var(--pl-card)", cursor: "pointer", color: "var(--pl-ink)" }}>
      {theme === "dark" ? "โหมดสว่าง" : "โหมดมืด"}
    </button>
  );
}
```

- [ ] **Step 5: Mount the script in the root layout**

ใน `src/app/layout.tsx` เพิ่ม import

```tsx
import { ThemeScript } from "@/components/guide/theme-script";
```

แล้วแก้ `<body>` เป็น

```tsx
      <body>
        <ThemeScript />
        <AuthProvider>{children}</AuthProvider>
      </body>
```

- [ ] **Step 6: Run test to verify it passes**

Run: `npx vitest run src/components/guide/theme-toggle.test.tsx`
Expected: PASS ทั้ง 2 เทสต์

- [ ] **Step 7: Run the whole suite, lint, and build**

Run: `npm test` แล้ว `npm run lint` แล้ว `npm run build`
Expected: ผ่านทั้งหมด และเห็น route `/`, `/guide/[slug]`, `/guide/[slug]/step/[step]`, `/my` ในผลลัพธ์ของ build โดยหน้า guide ถูก prerender ครบ 3 slug คูณ 14 ขั้น

- [ ] **Step 8: Commit**

```bash
git add src/components/guide/theme-toggle.tsx src/components/guide/theme-script.tsx src/components/guide/theme-toggle.test.tsx src/app/layout.tsx
git commit -m "feat(guide): add pre-paint theme script and dark mode toggle"
```

---

### Task 8: Responsive and accessibility verification on the running site

**Files:**
- ไม่มีไฟล์ที่ต้องแก้ นอกจากผลการตรวจที่ต่อท้าย `handoff.md`

**Interfaces:**
- Consumes: แอปที่ build แล้วจาก Task 7
- Produces: บันทึกผลการตรวจใน `handoff.md`

`README.md` กำหนดว่าก่อนส่งมอบต้องตรวจหน้าเว็บที่ความกว้างเดสก์ท็อป แท็บเล็ต และมือถือ แล้วบันทึกผลลง `handoff.md`

- [ ] **Step 1: Start the production server on the port the script expects**

Run: `npm run build` แล้ว `npx next start -p 3100`
ปล่อยให้รันค้างไว้ในหน้าต่างแยก

- [ ] **Step 2: Run the accessibility and viewport sweep**

Run: `npm run ui:verify`
Expected: สคริปต์ไล่ทุกความกว้างตั้งแต่ 360 ถึงเดสก์ท็อปโดยไม่รายงานการล้นแนวนอน

ถ้าสคริปต์หา Chrome ไม่เจอ ให้ตั้ง `CHROME_PATH` ชี้ไปที่ไฟล์ `chrome.exe` ก่อน

- [ ] **Step 3: Check the three guide routes by hand in both themes**

เปิด `http://localhost:3100/`, `/guide/pink-princess` และ `/guide/pink-princess/step/7` แล้วตรวจว่า

- สลับโหมดมืดแล้วเงายังอ่านออก ขอบยังเห็นชัด และตัวหนังสือไม่จมพื้น
- ภาพประกอบเปลี่ยนสีตามโหมด ไม่ค้างเป็นสีของโหมดสว่าง
- กด Tab จากบนสุดแล้วเจอลิงก์ข้ามไปเนื้อหาหลักก่อนเป็นอันดับแรก
- ที่ความกว้าง 360 พิกเซล ไม่มีการเลื่อนแนวนอน

- [ ] **Step 4: Record the result**

ต่อท้าย `handoff.md` ด้วยหัวข้อใหม่

```markdown
## 2026-08-02 เฟส 2 คู่มือสาธารณะ

- ตรวจ `/`, `/guide/pink-princess`, `/guide/pink-princess/step/7` ที่ความกว้าง 360, 768 และ 1280 พิกเซล
- ตรวจทั้งโหมดสว่างและโหมดมืด
- ผลการตรวจ: [กรอกผลจริงที่เห็น รวมถึงข้อบกพร่องที่พบและยังไม่ได้แก้]
```

แทนที่วงเล็บเหลี่ยมด้วยผลจริงที่เห็น ห้ามเขียนว่าผ่านถ้ายังไม่ได้เปิดดูจริง

- [ ] **Step 5: Commit**

```bash
git add handoff.md
git commit -m "docs: record phase two responsive and accessibility check"
```

---

## Self-Review Notes

ตรวจแผนนี้กับ spec แล้วพบว่า

- design token สองโหมดที่ระดับ token ครอบคลุมใน Task 1 และบังคับด้วยเทสต์ว่าต้องมีทั้ง media query และ attribute override
- การเปลี่ยนชื่อเป็น Plantlover Lab ครอบคลุมใน Task 1 และ Task 4
- ภาพประกอบครบ 14 ขั้น ครอบคลุมใน Task 2 และ 3 โดยมีเทสต์ผูกกับ `coreSteps` ทำให้เพิ่มขั้นใหม่แล้วลืมวาดภาพไม่ได้
- หน้าคู่มือสาธารณะที่อ่านได้โดยไม่ล็อกอิน ครอบคลุมใน Task 5 และ 6 ไม่มีหน้าใดใช้ `AuthGate`
- ข้อบังคับว่าเงาต้องทึบไม่เบลอ บังคับด้วยเทสต์ที่อ่าน CSS จริงใน Task 1

ลำดับการทำมีจุดที่ต้องระวัง Task 5 สร้าง `src/app/page.tsx` ที่อ้าง `ThemeToggle` ซึ่ง Task 7 เป็นคนสร้าง จึงห้ามรัน `npm run build` ระหว่าง Task 5 และ 6 เพราะจะล้มเหลวจากการหา module ไม่เจอ เทสต์ยังรันได้ปกติเพราะไม่มีเทสต์ใดนำเข้าไฟล์ `page.tsx` การ build ครั้งแรกหลังจากนี้อยู่ที่ Task 7 Step 7

สิ่งที่ **ไม่อยู่** ในแผนนี้เพราะเป็นของเฟส 3 และ 4 ได้แก่ การล็อกอิน การบันทึกรอบเพาะ ตัวเดินขั้นตอน การลบ runner เดิมทั้ง 4 ตัว การลบ `philodendron-knowledge.ts` และ `protocol-templates.ts` ระบบเลือกเส้นทางอุปกรณ์ และเครื่องคำนวณสารอาหาร

หน้าเดิมทั้งหมดยังทำงานได้ตามปกติหลังเฟสนี้ เปลี่ยนเพียงตำแหน่ง dashboard จาก `/` ไป `/my` และลิงก์ในเมนูเดิมที่ชี้ตามไป
