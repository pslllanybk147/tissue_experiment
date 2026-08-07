# Cyber Greenhouse Visual Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** เปลี่ยนผิวเว็บ Plantlover Lab เป็นธีม "Cyber Greenhouse" (Full Cyberpunk HUD) — หน้าแรกมีขวดโหล 3D หมุนได้ หน้าทำงานนิ่งอ่านง่าย รองรับธีมมืด/สว่างเดิม

**Architecture:** ระบบธีม (`data-theme` + `pl-theme` localStorage + ThemeScript + ThemeToggle) และ token `--pl-*` ใน `guide.css` **มีอยู่แล้ว** — งานคือเปลี่ยนค่า token เป็นชุดสีไซเบอร์, ปรับสไตล์คอมโพเนนต์ผิวนอก, เพิ่มคอมโพเนนต์ hero ใหม่บนหน้าแรก (poster นิ่ง + HUD CSS + ฉาก 3D โหลด lazy) ห้ามแตะตรรกะ/โครงสร้าง/ข้อความใด ๆ

**Tech Stack:** Next.js 16.2.11 (App Router), React 19.2.4, Tailwind CSS 4 (ใช้ CSS ตรงใน guide.css/globals.css), three + @react-three/fiber (ติดตั้งใหม่ใน Task 4), vitest (renderToStaticMarkup pattern), Playwright ผ่าน `scripts/verify-accessible-ui.mjs`

**Spec:** `docs/superpowers/specs/2026-08-07-cyber-greenhouse-visual-redesign-design.md`

## Global Constraints

- อ่านคู่มือ Next ใน `node_modules/next/dist/docs/` ก่อนเขียนโค้ดที่แตะ API ของ Next (ดู AGENTS.md) — เอกสาร lazy loading: `01-app/02-guides/lazy-loading.md` (`ssr: false` ใช้ได้เฉพาาะใน Client Component)
- ห้ามแตะ: โครงสร้าง route, ตรรกะ Guided Runner/validator, ข้อความคู่มือ, schema ข้อมูล, Firestore rules
- ห้ามโหลดฟอนต์/สคริปต์จาก CDN ตอน runtime (ฟอนต์ IBM Plex Sans Thai ผ่าน next/font มีแล้วใน `src/app/layout.tsx` — ไม่ต้องเพิ่ม)
- three.js ต้องอยู่เฉพาะ chunk ของหน้าแรกผ่าน `next/dynamic` + `ssr: false`; งบเพิ่ม ~150KB gzip โหลดหลัง first paint
- ทุกอนิเมชันต้องดับภายใต้ `prefers-reduced-motion: reduce` (กติกา global มีแล้วใน guide.css และ globals.css — อนิเมชันใหม่ต้องไม่หลุดกติกานี้ และ 3D ต้อง fallback เป็น poster)
- ก่อนปิดงาน: `npm test`, `npm run lint`, `npm run build`, `npm run firebase:verify`, `npm run ui:verify` ต้องผ่านครบ
- commit ทุก task; ทำงานบนสาขา `feature/cyber-greenhouse` แตกจาก `master`

## File Structure

- `src/app/guide.css` — เปลี่ยนค่า token 3 บล็อก (:root / media dark / data-theme) + สไตล์การ์ด ปุ่ม chip
- `src/app/globals.css` — เปลี่ยนค่า token `:root` บรรทัด 3 ให้เข้าชุดเดียวกัน (หน้า admin เก่าใช้ไฟล์นี้)
- `src/components/home/hero-jar.tsx` — client component: poster + HUD + ตัวตัดสินใจโหลด 3D (ใหม่)
- `src/components/home/hero-jar-scene.tsx` — ฉาก R3F (ใหม่, โหลดผ่าน dynamic)
- `src/components/home/hero-jar.test.tsx` — เทสต์ (ใหม่)
- `src/app/page.tsx` — วาง `<HeroJar />` เหนือ `<Doors />`
- `scripts/verify-accessible-ui.mjs` — เพิ่มตรวจธีม 2 โหมด + fallback poster
- `package.json` — เพิ่ม `three`, `@react-three/fiber`

---

### Task 1: ชุดสีไซเบอร์ใน token เดิม

**Files:**
- Modify: `src/app/guide.css:1-89` (สามบล็อก token)
- Modify: `src/app/globals.css:3` (token ของหน้า admin เก่า)

**Interfaces:**
- Produces: token ใหม่ `--pl-neon`, `--pl-neon-2`, `--pl-glow`, `--pl-grid` ที่ Task 2–4 ใช้; ค่า token เดิมทุกตัวเปลี่ยนค่าแต่**ชื่อเดิมทั้งหมด** (คอมโพเนนต์ไม่ต้องแก้)
- หมายเหตุ: สลับ default เป็นมืด — `:root` ถือค่ามืด, `@media (prefers-color-scheme: light)` ถือค่าสว่าง (กลับด้านจากเดิม), บล็อก `data-theme` ตามเดิม

- [ ] **Step 1: สร้างสาขา**

```bash
git checkout master && git checkout -b feature/cyber-greenhouse
```

- [ ] **Step 2: แทนค่า token ใน guide.css**

แทนบล็อก `:root` (บรรทัด 1–21) ด้วยค่ามืด, แทนบล็อก `@media (prefers-color-scheme: dark)` ด้วย `@media (prefers-color-scheme: light)` ถือค่าสว่าง, แล้วอัปเดตบล็อก `data-theme="dark"` / `data-theme="light"` ให้ตรงกัน:

```css
:root {
  --pl-paper: #070d1a;
  --pl-card: #0b1424;
  --pl-sunk: #0e1a2e;
  --pl-ink: #f0fdff;
  --pl-ink-2: #9fb3c8;
  --pl-ink-3: #6b7f94;
  --pl-line: #35cfe4;
  --pl-shadow: #01030a;
  --pl-chip-ink: #04070f;
  --pl-yellow: #a3e635;
  --pl-green: #34d399;
  --pl-pink: #c084fc;
  --pl-sky: #0e3a47;
  --pl-red: #f87171;
  --pl-stop: #3b1620;
  --pl-leaf: #4ade80;
  --pl-agar: #164e63;
  --pl-line-soft: rgba(34, 211, 238, 0.18);
  --pl-shadow-soft: rgba(1, 3, 10, 0.5);
  --pl-neon: #22d3ee;
  --pl-neon-2: #a3e635;
  --pl-glow: rgba(34, 211, 238, 0.45);
  --pl-grid: rgba(34, 211, 238, 0.05);
}
```

ชุดสว่าง (ใช้ทั้งใน `@media (prefers-color-scheme: light)` และ `:root[data-theme="light"]`):

```css
  --pl-paper: #f4f7fa;
  --pl-card: #ffffff;
  --pl-sunk: #e9eff5;
  --pl-ink: #0f2436;
  --pl-ink-2: #46586a;
  --pl-ink-3: #5c6f82;
  --pl-line: #46586a;
  --pl-shadow: #0f2436;
  --pl-chip-ink: #f7fee7;
  --pl-yellow: #3f6212;
  --pl-green: #17834b;
  --pl-pink: #7c3aed;
  --pl-sky: #d9f2f8;
  --pl-red: #b42318;
  --pl-stop: #ffe4e0;
  --pl-leaf: #3f6212;
  --pl-agar: #a5f3fc;
  --pl-line-soft: #dbe5ee;
  --pl-shadow-soft: rgba(15, 36, 54, 0.10);
  --pl-neon: #0891b2;
  --pl-neon-2: #4d7c0f;
  --pl-glow: rgba(8, 145, 178, 0.25);
  --pl-grid: rgba(8, 145, 178, 0.05);
```

`:root[data-theme="dark"]` ใช้ชุดมืดเดียวกับ `:root` ทุกตัว (รวม 4 token ใหม่)

ข้อควรระวัง: `--pl-chip-ink` เดิมเป็นสีเข้มคงที่ใช้ทับพื้น `--pl-yellow` — ชุดใหม่โหมดสว่าง `--pl-yellow` เป็นเขียวเข้ม (#3f6212) จึงต้องให้ `--pl-chip-ink` เป็นสีอ่อน (#f7fee7) ตรวจทุกจุดที่ใช้คู่นี้ (`grep -n "pl-chip-ink" src/app/guide.css`) ว่าไม่มีจุดใช้ทับพื้นอ่อนค้างอยู่ ถ้ามี ให้จุดนั้นใช้ `--pl-ink` แทน

- [ ] **Step 3: ปรับ token ใน globals.css บรรทัด 3 ให้เข้าชุด**

```css
:root { --ink: #f0fdff; --muted: #9fb3c8; --faint: #6b7f94; --line: rgba(34,211,238,.35); --surface: #0b1424; --canvas: #070d1a; --blue: #22d3ee; --blue-soft: #0e3a47; --green: #34d399; --green-soft: #0d3327; --orange: #fbbf24; --orange-soft: #3b2a10; --red: #f87171; --red-soft: #3b1620; --purple: #c084fc; }
:root[data-theme="light"] { --ink: #0f2436; --muted: #46586a; --faint: #5c6f82; --line: #dbe5ee; --surface: #ffffff; --canvas: #f4f7fa; --blue: #0891b2; --blue-soft: #d9f2f8; --green: #17834b; --green-soft: #e7f6ee; --orange: #b45309; --orange-soft: #fff7ed; --red: #b42318; --red-soft: #fff1f0; --purple: #7c3aed; }
```

(บล็อกที่สองเพิ่มใหม่ต่อจากบล็อกแรก — globals.css เดิมไม่มีระบบธีม จึงต้องเพิ่ม override ให้หน้าเก่าไม่พังตอนสลับสว่าง)

- [ ] **Step 4: ตรวจ**

Run: `npm test` แล้ว `npm run lint` แล้ว `npm run build`
Expected: ผ่านทั้งหมด (เทสต์เดิมไม่ผูกกับค่าสี) — ถ้าเทสต์ใดผูกค่าสีเดิม ให้แก้ค่าในเทสต์ให้ตรง token ใหม่ ไม่แก้พฤติกรรม

- [ ] **Step 5: เปิดดูจริง**

Run: `npm run dev` เปิด `/`, `/start`, `/my/rounds` — สลับธีมด้วยปุ่มบนหัวเว็บ ตรวจด้วยตา: ตัวหนังสืออ่านชัดทั้งสองโหมด ไม่มีข้อความจมพื้น

- [ ] **Step 6: Commit**

```bash
git add src/app/guide.css src/app/globals.css
git commit -m "feat: cyber greenhouse palette in existing theme tokens"
```

---

### Task 2: ผิวคอมโพเนนต์หน้าทำงาน (นิ่ง แต่กลิ่นไซเบอร์)

**Files:**
- Modify: `src/app/guide.css` (คลาส `.pl-card`, ปุ่ม, chip, progress — ดู grep ในขั้นตอน)

**Interfaces:**
- Consumes: token จาก Task 1
- Produces: คลาสใหม่ `.pl-hud-chip`, `.pl-pulse` ให้ Task 3 ใช้

- [ ] **Step 1: สำรวจคลาสเป้าหมาย**

Run: `grep -n "^\.pl-card\|^\.pl-btn\|^\.pl-chip\|progress" src/app/guide.css`
จดเลขบรรทัดจริงก่อนแก้ (ไฟล์ 640 บรรทัด)

- [ ] **Step 2: ปรับสไตล์ตาม mockup ที่อนุมัติ**

หลักการแทนที่ (คงขนาด/ระยะ/พฤติกรรม focus เดิมทุกอย่าง เปลี่ยนเฉพาะสี เส้น เงา):

```css
/* การ์ดเนื้อหา: ขอบบาง + เส้นเน้นซ้ายนีออน แทนขอบหนา 2.5px เดิม */
.pl-card {
  background: var(--pl-card);
  border: 1px solid var(--pl-line-soft);
  border-left: 3px solid var(--pl-neon);
  border-radius: 8px;
  box-shadow: 0 1px 3px var(--pl-shadow-soft);
}
.pl-card.pl-link:hover { border-color: var(--pl-neon); box-shadow: 0 0 14px var(--pl-glow); }

/* chip สถานะสไตล์ HUD */
.pl-hud-chip {
  display: inline-block;
  font-family: var(--font-geist-mono), monospace;
  font-size: 12px;
  letter-spacing: 0.5px;
  padding: 2px 10px;
  border: 1px solid var(--pl-neon);
  border-radius: 4px;
  color: var(--pl-neon);
  background: transparent;
}

/* ไฟกะพริบจุดเดียวของหน้าทำงาน (ดับใต้ reduced motion ด้วยกติกา global เดิม) */
@keyframes pl-pulse { 0%, 100% { opacity: 0.5; } 50% { opacity: 1; } }
.pl-pulse { animation: pl-pulse 2s ease-in-out infinite; }
```

ปุ่มหลัก: ใช้ `--pl-yellow` + `--pl-chip-ink` ตามเดิม (Task 1 ทำให้กลายเป็นนีออนเขียวมะนาว/เขียวเข้มแล้ว) — เพิ่มเฉพาะเงา `box-shadow: 0 0 14px var(--pl-glow)` ในโหมด hover ของปุ่มหลัก แถบ progress (ถ้ามีคลาสอยู่): พื้น `var(--pl-sunk)` แท่งใน `linear-gradient(90deg, var(--pl-neon), var(--pl-neon-2))`

ห้ามเพิ่มอนิเมชันต่อเนื่องอื่นใดในไฟล์นี้นอกจาก `.pl-pulse`

- [ ] **Step 3: ตรวจ**

Run: `npm test` แล้ว `npm run lint` แล้ว `npm run build` แล้ว `npm run ui:verify`
Expected: ผ่านครบ — ui:verify คือด่านหลักของ task นี้ (โครงหน้า, overflow, touch target ต้องไม่เปลี่ยน)

- [ ] **Step 4: เปิดดูจริงสองโหมด**

`npm run dev` — ตรวจ `/guide/[slug]` สักหน้า + `/my/rounds` ทั้งมืด/สว่าง เทียบกับ mockup `work-pages.html`

- [ ] **Step 5: Commit**

```bash
git add src/app/guide.css
git commit -m "feat: cyber surface styles for work pages"
```

---

### Task 3: Hero หน้าแรก — poster + HUD (ยังไม่มี 3D)

**Files:**
- Create: `src/components/home/hero-jar.tsx`
- Create: `src/components/home/hero-jar.test.tsx`
- Modify: `src/app/page.tsx`
- Modify: `src/app/guide.css` (สไตล์ hero ต่อท้ายไฟล์)

**Interfaces:**
- Consumes: token Task 1, `.pl-hud-chip`/`.pl-pulse` Task 2
- Produces: `export function HeroJar(): JSX.Element` (client component); โครงสร้าง DOM: `<section className="pl-hero" aria-label="ขวดเพาะเลี้ยงจำลอง">` ครอบ `<div className="pl-hero-stage">` ซึ่งข้างในมี poster `<svg className="pl-hero-poster">` — Task 4 จะฝังฉาก 3D ลงใน stage เดียวกันนี้

- [ ] **Step 1: เขียนเทสต์ให้ตกก่อน**

```tsx
// src/components/home/hero-jar.test.tsx
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { HeroJar } from "./hero-jar";

describe("hero ขวดเพาะเลี้ยงหน้าแรก", () => {
  const html = renderToStaticMarkup(<HeroJar />);

  it("มี poster ภาพนิ่งเสมอ (fallback ของ 3D)", () => {
    expect(html).toContain("pl-hero-poster");
  });

  it("มีป้ายสถานะ HUD", () => {
    expect(html).toContain("pl-hud-chip");
    expect(html).toContain("READY");
  });

  it("ระบุว่าเป็นภาพจำลอง ไม่ใช่ภาพต้นจริง", () => {
    expect(html).toContain("ภาพจำลอง");
  });

  it("องค์ประกอบตกแต่งถูกซ่อนจาก screen reader", () => {
    expect(html).toContain('aria-hidden="true"');
  });
});
```

- [ ] **Step 2: รันให้เห็นว่าตก**

Run: `npx vitest run src/components/home/hero-jar.test.tsx`
Expected: FAIL — โมดูล `./hero-jar` ยังไม่มี

- [ ] **Step 3: เขียนคอมโพเนนต์**

```tsx
// src/components/home/hero-jar.tsx
"use client";

export function HeroJar() {
  return (
    <section className="pl-hero" aria-label="ขวดเพาะเลี้ยงจำลอง">
      <div className="pl-hero-grid" aria-hidden="true" />
      <div className="pl-hero-stage">
        <div className="pl-hero-ring pl-hero-ring-a" aria-hidden="true" />
        <div className="pl-hero-ring pl-hero-ring-b" aria-hidden="true" />
        <span className="pl-hud-chip pl-hero-chip-top" aria-hidden="true">LAB:PLANTLOVER</span>
        <span className="pl-hud-chip pl-pulse pl-hero-chip-bottom" aria-hidden="true">READY ▲</span>
        <div className="pl-hero-scanline" aria-hidden="true" />
        <HeroPoster />
      </div>
      <p className="pl-hero-note">ภาพจำลองขวดเพาะเลี้ยง ไม่ใช่ภาพต้นจริง — ลากเพื่อหมุนได้เมื่อโหลดครบ</p>
    </section>
  );
}

function HeroPoster() {
  // ภาพนิ่ง: โหลแก้ว + วุ้น + ต้นอ่อน ใช้สีจาก currentColor/var() เพื่อตามธีม
  return (
    <svg className="pl-hero-poster" viewBox="0 0 200 260" role="img" aria-label="ขวดโหลแก้วมีต้นอ่อนบนวุ้นอาหาร">
      <defs>
        <linearGradient id="pl-jar-glass" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="var(--pl-ink)" stopOpacity="0.14" />
          <stop offset="0.5" stopColor="var(--pl-ink)" stopOpacity="0.02" />
          <stop offset="1" stopColor="var(--pl-ink)" stopOpacity="0.2" />
        </linearGradient>
      </defs>
      <ellipse cx="100" cy="150" rx="92" ry="80" fill="var(--pl-glow)" opacity="0.35" />
      <rect x="58" y="26" width="84" height="18" rx="6" fill="var(--pl-ink-3)" />
      <path d="M62 44 h76 v150 a38 26 0 0 1 -76 0 Z" fill="url(#pl-jar-glass)" stroke="var(--pl-neon)" strokeOpacity="0.55" strokeWidth="2" />
      <path d="M66 168 h68 v26 a34 22 0 0 1 -68 0 Z" fill="var(--pl-agar)" />
      <g stroke="var(--pl-leaf)" fill="none" strokeWidth="3" strokeLinecap="round">
        <path d="M100 176 V96" />
        <path d="M100 140 C78 132 68 112 70 92 C90 100 100 118 100 138 Z" fill="var(--pl-leaf)" fillOpacity="0.55" />
        <path d="M100 124 C122 116 132 96 130 76 C110 84 100 102 100 122 Z" fill="var(--pl-leaf)" fillOpacity="0.4" />
        <path d="M100 100 C96 82 100 66 112 56 C118 72 112 90 101 99 Z" fill="var(--pl-leaf)" fillOpacity="0.55" />
      </g>
    </svg>
  );
}
```

- [ ] **Step 4: สไตล์ hero ต่อท้าย guide.css**

```css
.pl-hero { position: relative; overflow: hidden; border-radius: 12px; margin-bottom: 26px; padding: 18px; background: radial-gradient(120% 100% at 70% 20%, var(--pl-sunk) 0%, var(--pl-paper) 70%); border: 1px solid var(--pl-line-soft); }
.pl-hero-grid { position: absolute; inset: 0; background-image: linear-gradient(var(--pl-grid) 1px, transparent 1px), linear-gradient(90deg, var(--pl-grid) 1px, transparent 1px); background-size: 28px 28px; }
.pl-hero-stage { position: relative; width: min(280px, 70vw); height: 320px; margin: 0 auto; }
.pl-hero-poster { position: absolute; inset: 0; width: 100%; height: 100%; }
.pl-hero-ring { position: absolute; border-radius: 50%; border: 1px dashed var(--pl-neon); opacity: 0.5; }
.pl-hero-ring-a { inset: 6px; animation: pl-spin 16s linear infinite; }
.pl-hero-ring-b { inset: 32px; border-color: var(--pl-neon-2); animation: pl-spin-rev 10s linear infinite; }
.pl-hero-chip-top { position: absolute; top: 2px; right: 2px; z-index: 2; }
.pl-hero-chip-bottom { position: absolute; bottom: 2px; left: 2px; z-index: 2; color: var(--pl-neon-2); border-color: var(--pl-neon-2); }
.pl-hero-scanline { position: absolute; left: 10%; right: 10%; height: 2px; background: linear-gradient(90deg, transparent, var(--pl-neon), transparent); box-shadow: 0 0 10px var(--pl-glow); animation: pl-scan 4s linear infinite; }
.pl-hero-note { margin-top: 10px; font-size: 13px; color: var(--pl-ink-3); text-align: center; }
@keyframes pl-spin { to { transform: rotate(360deg); } }
@keyframes pl-spin-rev { to { transform: rotate(-360deg); } }
@keyframes pl-scan { 0% { top: 8%; opacity: 0; } 12% { opacity: 1; } 88% { opacity: 1; } 100% { top: 90%; opacity: 0; } }
@media (prefers-reduced-motion: reduce) { .pl-hero-ring, .pl-hero-scanline { animation: none; } .pl-hero-scanline { display: none; } }
```

- [ ] **Step 5: วางบนหน้าแรก**

```tsx
// src/app/page.tsx
import { Doors } from "@/components/guide/doors";
import { GuideShell } from "@/components/guide/guide-shell";
import { ThemeToggle } from "@/components/guide/theme-toggle";
import { HeroJar } from "@/components/home/hero-jar";

export default function HomePage() {
  return (
    <GuideShell action={<ThemeToggle />}>
      <HeroJar />
      <Doors />
    </GuideShell>
  );
}
```

- [ ] **Step 6: รันเทสต์ให้ผ่าน**

Run: `npx vitest run src/components/home/hero-jar.test.tsx` แล้ว `npm test`
Expected: PASS ทั้งหมด (doors.test เดิมต้องยังผ่าน — HeroJar ไม่มีคำว่า Philodendron)

- [ ] **Step 7: ตรวจ + ดูจริง**

Run: `npm run lint`, `npm run build`, `npm run ui:verify` แล้ว `npm run dev` ดู `/` สองโหมด + จอแคบ 360px (stage ต้องไม่ล้นจอ)

- [ ] **Step 8: Commit**

```bash
git add src/components/home/hero-jar.tsx src/components/home/hero-jar.test.tsx src/app/page.tsx src/app/guide.css
git commit -m "feat: home hero poster with cyberpunk HUD"
```

---

### Task 4: ฉาก 3D ขวดโหล (lazy + fallback)

**Files:**
- Create: `src/components/home/hero-jar-scene.tsx`
- Modify: `src/components/home/hero-jar.tsx`
- Modify: `src/components/home/hero-jar.test.tsx`
- Modify: `package.json` (ผ่าน npm install)

**Interfaces:**
- Consumes: `.pl-hero-stage` จาก Task 3
- Produces: `export default function HeroJarScene({ neon, neon2, leaf, agar }: { neon: string; neon2: string; leaf: string; agar: string }): JSX.Element` — รับสีเป็น prop เพราะ WebGL อ่าน CSS variable ตรง ๆ ไม่ได้

- [ ] **Step 1: ติดตั้ง dependency**

```bash
npm install three @react-three/fiber
```

(ไม่ใช้ @react-three/drei — การหมุนเขียนเองด้วย pointer event เพื่อคุมขนาด bundle)

- [ ] **Step 2: เพิ่มเทสต์เงื่อนไข fallback ให้ตกก่อน**

เพิ่มใน `hero-jar.test.tsx`:

```tsx
import { shouldLoadScene } from "./hero-jar";

describe("เงื่อนไขโหลดฉาก 3D", () => {
  it("ไม่โหลดเมื่อผู้ใช้ขอลดการเคลื่อนไหว", () => {
    expect(shouldLoadScene({ reducedMotion: true, webgl: true })).toBe(false);
  });
  it("ไม่โหลดเมื่อไม่มี WebGL", () => {
    expect(shouldLoadScene({ reducedMotion: false, webgl: false })).toBe(false);
  });
  it("โหลดเมื่อพร้อมทั้งคู่", () => {
    expect(shouldLoadScene({ reducedMotion: false, webgl: true })).toBe(true);
  });
});
```

Run: `npx vitest run src/components/home/hero-jar.test.tsx` — Expected: FAIL (`shouldLoadScene` ยังไม่ export)

- [ ] **Step 3: เขียนฉาก 3D**

```tsx
// src/components/home/hero-jar-scene.tsx
"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type { Group } from "three";

type SceneColors = { neon: string; neon2: string; leaf: string; agar: string };

function Jar({ colors }: { colors: SceneColors }) {
  const group = useRef<Group>(null);
  const drag = useRef({ active: false, lastX: 0, velocity: 0.004 });

  useFrame(() => {
    if (!group.current) return;
    if (!drag.current.active) group.current.rotation.y += drag.current.velocity;
  });

  return (
    <group
      ref={group}
      onPointerDown={(e) => { drag.current.active = true; drag.current.lastX = e.clientX; }}
      onPointerUp={() => { drag.current.active = false; }}
      onPointerLeave={() => { drag.current.active = false; }}
      onPointerMove={(e) => {
        if (!drag.current.active || !group.current) return;
        group.current.rotation.y += (e.clientX - drag.current.lastX) * 0.01;
        drag.current.lastX = e.clientX;
      }}
    >
      {/* ตัวโหลแก้ว */}
      <mesh position={[0, 0.1, 0]}>
        <cylinderGeometry args={[0.85, 0.8, 2.1, 48, 1, true]} />
        <meshPhysicalMaterial transparent opacity={0.25} roughness={0.05} metalness={0} transmission={0.9} thickness={0.2} color="#bfeff7" side={2} />
      </mesh>
      {/* ฝาโลหะ */}
      <mesh position={[0, 1.25, 0]}>
        <cylinderGeometry args={[0.9, 0.9, 0.22, 48]} />
        <meshStandardMaterial color="#39434f" roughness={0.5} metalness={0.7} />
      </mesh>
      {/* วุ้นอาหารเรืองแสง */}
      <mesh position={[0, -0.75, 0]}>
        <cylinderGeometry args={[0.78, 0.74, 0.4, 48]} />
        <meshStandardMaterial color={colors.agar} emissive={colors.neon} emissiveIntensity={0.55} roughness={0.3} />
      </mesh>
      {/* ต้นอ่อน: ก้าน + ใบสามใบ */}
      <mesh position={[0, -0.1, 0]}>
        <cylinderGeometry args={[0.03, 0.045, 0.9, 8]} />
        <meshStandardMaterial color={colors.leaf} roughness={0.6} />
      </mesh>
      {[0, 1, 2].map((i) => (
        <mesh key={i} position={[Math.sin(i * 2.1) * 0.3, 0.25 + i * 0.18, Math.cos(i * 2.1) * 0.3]} rotation={[0.5, i * 2.1, 0.3]}>
          <sphereGeometry args={[0.26, 16, 12]} />
          <meshStandardMaterial color={colors.leaf} emissive={colors.neon2} emissiveIntensity={0.12} roughness={0.5} />
        </mesh>
      ))}
    </group>
  );
}

export default function HeroJarScene(colors: SceneColors) {
  return (
    <Canvas camera={{ position: [0, 0.4, 4], fov: 40 }} dpr={[1, 2]} gl={{ antialias: true, alpha: true }}>
      <ambientLight intensity={0.5} />
      <pointLight position={[3, 3, 3]} intensity={30} color={colors.neon} />
      <pointLight position={[-3, -1, 2]} intensity={18} color={colors.neon2} />
      <Jar colors={colors} />
    </Canvas>
  );
}
```

- [ ] **Step 4: ต่อเข้า HeroJar ด้วย dynamic import + เงื่อนไข fallback**

แก้ `hero-jar.tsx`:

```tsx
"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const HeroJarScene = dynamic(() => import("./hero-jar-scene"), { ssr: false });

export function shouldLoadScene(env: { reducedMotion: boolean; webgl: boolean }) {
  return !env.reducedMotion && env.webgl;
}

function detectEnv() {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let webgl = false;
  try {
    const canvas = document.createElement("canvas");
    webgl = Boolean(canvas.getContext("webgl2") ?? canvas.getContext("webgl"));
  } catch {
    webgl = false;
  }
  return { reducedMotion, webgl };
}

function readSceneColors() {
  const style = getComputedStyle(document.documentElement);
  return {
    neon: style.getPropertyValue("--pl-neon").trim() || "#22d3ee",
    neon2: style.getPropertyValue("--pl-neon-2").trim() || "#a3e635",
    leaf: style.getPropertyValue("--pl-leaf").trim() || "#4ade80",
    agar: style.getPropertyValue("--pl-agar").trim() || "#164e63",
  };
}

export function HeroJar() {
  const [scene, setScene] = useState<null | ReturnType<typeof readSceneColors>>(null);

  useEffect(() => {
    if (!shouldLoadScene(detectEnv())) return;
    setScene(readSceneColors());
    // เปลี่ยนธีมแล้วให้แสง 3D เปลี่ยนตาม
    const observer = new MutationObserver(() => setScene(readSceneColors()));
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => observer.disconnect();
  }, []);

  return (
    <section className="pl-hero" aria-label="ขวดเพาะเลี้ยงจำลอง">
      {/* …โครง HUD เดิมจาก Task 3 ทุกบรรทัด… */}
      <div className="pl-hero-stage">
        {/* ring/chip/scanline เดิม */}
        <HeroPoster />
        {scene ? (
          <div className="pl-hero-canvas" aria-hidden="true">
            <HeroJarScene {...scene} />
          </div>
        ) : null}
      </div>
      <p className="pl-hero-note">ภาพจำลองขวดเพาะเลี้ยง ไม่ใช่ภาพต้นจริง — ลากเพื่อหมุนได้เมื่อโหลดครบ</p>
    </section>
  );
}
```

(คง `HeroPoster` ไว้ในไฟล์ตามเดิม; poster อยู่ใต้ canvas เสมอ — 3D เฟดทับเมื่อพร้อม)

เพิ่มใน guide.css:

```css
.pl-hero-canvas { position: absolute; inset: 0; z-index: 1; opacity: 0; animation: pl-fade-in 0.8s ease forwards; }
@keyframes pl-fade-in { to { opacity: 1; } }
.pl-hero-canvas:has(canvas) ~ .pl-hero-poster { opacity: 0; }
```

หมายเหตุลำดับ DOM: ถ้าใช้ selector `~` ให้วาง `.pl-hero-canvas` ก่อน poster ใน DOM หรือใช้วิธีง่ายกว่า: state `sceneReady` ใส่คลาส `pl-hero-poster-hidden { opacity: 0; transition: opacity .8s; }` ให้ poster เมื่อ scene render แล้ว — เลือกทางที่โค้ดอ่านง่ายกว่าตอนลงมือ

- [ ] **Step 5: รันเทสต์**

Run: `npx vitest run src/components/home/hero-jar.test.tsx` แล้ว `npm test`
Expected: PASS ทั้งหมด — เทสต์ SSR เดิมยังผ่านเพราะ `useEffect` ไม่รันใน renderToStaticMarkup (poster จึง render เสมอ)

- [ ] **Step 6: ตรวจ bundle**

Run: `npm run build` แล้วดูตาราง route size ที่ build พิมพ์ออกมา
Expected: First Load JS ของ `/` ไม่บวมจาก three (three ต้องอยู่ใน async chunk) — ถ้า three โผล่ใน first load ให้ตรวจว่า dynamic import อยู่ใน client component จริง

- [ ] **Step 7: ดูจริง**

`npm run dev` เปิด `/`: 3D เฟดเข้า หมุนเอง ลากหมุนได้ สลับธีมแล้วแสงเปลี่ยน; เปิด DevTools → Rendering → เปิด "Emulate prefers-reduced-motion" รีเฟรช → ต้องเห็น poster นิ่ง ไม่มี canvas

- [ ] **Step 8: Commit**

```bash
git add package.json package-lock.json src/components/home/ src/app/guide.css
git commit -m "feat: lazy 3D culture jar scene with reduced-motion/WebGL fallback"
```

---

### Task 5: ขยาย ui:verify + ตรวจครบชุดปิดงาน

**Files:**
- Modify: `scripts/verify-accessible-ui.mjs`

**Interfaces:**
- Consumes: ปุ่มสลับธีม (component `theme-toggle.tsx` — ดู aria-label จริงในไฟล์ก่อนเขียน selector), คลาส `pl-hero-poster` จาก Task 3

- [ ] **Step 1: อ่านโครงสคริปต์เดิม**

อ่าน `scripts/verify-accessible-ui.mjs` ทั้งไฟล์ (464 บรรทัด) — ทำความเข้าใจ pattern `assert`, `inspectPage`, รายการ viewport และจุด main loop ก่อนเพิ่มของใหม่ และอ่าน `src/components/guide/theme-toggle.tsx` เพื่อรู้ selector จริงของปุ่ม

- [ ] **Step 2: เพิ่มฟังก์ชันตรวจธีมและ fallback**

เพิ่มฟังก์ชัน (ปรับ selector ให้ตรงของจริงจาก Step 1):

```js
async function verifyThemeAndHero(page, viewportName) {
  await page.goto(`${baseUrl}/`, { waitUntil: "networkidle" });

  // 1) poster ต้องมีเสมอ (fallback ของ 3D)
  assert(await page.locator(".pl-hero-poster").count() === 1, `${viewportName}: หน้าแรกไม่มี hero poster`);

  // 2) สลับธีมแล้ว data-theme ต้องเปลี่ยน และตัวหนังสือหลักต้องยังอ่านได้ (สีต่างจากพื้น)
  const themeButton = page.locator("[data-testid=theme-toggle], .pl-theme-toggle, button:has-text('ธีม')").first();
  const before = await page.evaluate(() => document.documentElement.getAttribute("data-theme"));
  await themeButton.click();
  const after = await page.evaluate(() => document.documentElement.getAttribute("data-theme"));
  assert(before !== after, `${viewportName}: กดปุ่มธีมแล้ว data-theme ไม่เปลี่ยน`);
  for (const theme of ["dark", "light"]) {
    await page.evaluate((t) => document.documentElement.setAttribute("data-theme", t), theme);
    const readable = await page.evaluate(() => {
      const s = getComputedStyle(document.body.querySelector(".pl-root") ?? document.body);
      return s.color !== s.backgroundColor;
    });
    assert(readable, `${viewportName}: โหมด ${theme} สีตัวหนังสือกลืนพื้นหลัง`);
    await page.screenshot({ path: path.join(screenshotRoot, `${viewportName}-home-${theme}.png`), fullPage: true });
  }

  // 3) reduced motion → ห้ามมี canvas 3D, poster ต้องมองเห็น
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.reload({ waitUntil: "networkidle" });
  assert(await page.locator(".pl-hero canvas").count() === 0, `${viewportName}: reduced motion แล้วยังโหลด 3D`);
  assert(await page.locator(".pl-hero-poster").isVisible(), `${viewportName}: reduced motion แล้ว poster หาย`);
  await page.emulateMedia({ reducedMotion: null });
}
```

เรียกฟังก์ชันนี้ใน main loop ของทุก viewport (จุดเดียวกับที่เรียก `inspectPage` หน้าแรก)

- [ ] **Step 3: รัน ui:verify ให้ผ่าน**

Run: `npm run ui:verify`
Expected: ผ่านทั้ง 14 viewport — ถ้า selector ปุ่มธีมผิด แก้ selector ไม่ใช่แก้คอมโพเนนต์

- [ ] **Step 4: ชุดตรวจปิดงานครบตามกติกาโปรเจกต์**

Run ตามลำดับ: `npm test` → `npm run lint` → `npm run build` → `npm run firebase:verify` → `npm run ui:verify`
Expected: ผ่านครบทุกตัว บันทึกตัวเลขผลจริงไว้ใส่ handoff

- [ ] **Step 5: ตรวจภาพด้วยตา**

เปิด screenshot จาก ui:verify (โฟลเดอร์ที่สคริปต์เซฟ) เทียบกับ mockup ที่อนุมัติ: hero cyberpunk ตรงคอนเซปต์, หน้าทำงานนิ่ง, สองโหมดอ่านชัด

- [ ] **Step 6: Commit + อัปเดต handoff**

```bash
git add scripts/verify-accessible-ui.mjs handoff.md
git commit -m "test: verify theme switching and 3D fallback in ui:verify"
```

อัปเดต `handoff.md` ตาม Required handoff rule (วันที่, สิ่งที่ทำ, ไฟล์ที่เปลี่ยน, ผลตรวจ) — push และ merge เข้า master **ต้องรอผู้ใช้สั่งแยกต่างหาก** (กติกาโปรเจกต์)

---

## Self-Review Notes

- Spec §1 hero 3D + HUD → Task 3, 4; §2 สี/ธีม → Task 1 (ระบบสลับ/จำค่า/กัน flash มีอยู่แล้ว ไม่ต้องสร้าง); §3 หน้าทำงาน → Task 2; §4 ฟอนต์ → มีแล้วใน layout.tsx ไม่มีงาน; §5 ประสิทธิภาพ/การเข้าถึง → Task 4 Step 6, Task 5
- ประเด็นเบี่ยงจาก spec ที่จงใจ: ป้าย HUD ใช้ข้อความกลาง `READY` เสมอ (spec เปิดช่องไว้) — ไม่ดึงข้อมูลรอบเพาะจริงเพื่อกันขอบเขตบาน
- ชื่อ/ลายเซ็นข้ามงาน: `HeroJar`, `shouldLoadScene`, `HeroJarScene({neon, neon2, leaf, agar})`, คลาส `pl-hero-*`, `.pl-hud-chip`, `.pl-pulse` — สอดคล้องทุก task แล้ว
