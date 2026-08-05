# เฟส 1 · ประตูและหน้าทรง — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** เปิดหน้าจอที่ทำให้มือใหม่ซึ่งไม่รู้ชื่อต้นและไม่รู้จักโครงสร้างต้นไม้ เข้าใช้ระบบได้จริงเป็นครั้งแรก

**Architecture:** ทุก flow ขับด้วย URL ไม่ใช่ state ในเบราว์เซอร์ (`/find?stem=vine&node=visible`) ทำให้ทุกหน้ายังเป็น Server Component ล้วน ทดสอบด้วย `renderToStaticMarkup` ได้ และใช้งานได้แม้ JavaScript ไม่ทำงาน คำอธิบายศัพท์ใช้ `<details>` ของ HTML แทน overlay ที่ต้องใช้ JS ด้วยเหตุผลเดียวกัน

**Tech Stack:** TypeScript · Next.js 16.2.11 · React 19.2.4 · Vitest 4 (ไม่มี jsdom ไม่มี testing-library)

## Global Constraints

- อ่านคู่มือ Next.js ใน `node_modules/next/dist/docs/` ก่อนเขียนโค้ดที่แตะ Next API ตาม `AGENTS.md` **เฟสนี้แตะ routing และ `searchParams` จริง อ่านก่อนเสมอ**
- เทสต์ component ใช้ `renderToStaticMarkup` เท่านั้น · component ที่แสดงผลต้องเป็น sync · async อยู่ที่ `page.tsx` เท่านั้น
- **ห้ามเพิ่ม client component ใหม่ในเฟสนี้** ถ้ารู้สึกว่าต้องใช้ แปลว่าออกแบบ URL ผิด
- ข้อความในโค้ดและคอมเมนต์เป็นภาษาไทย ตามธรรมเนียมไฟล์เดิม
- ห้ามแก้เทสต์ที่มีอยู่เพื่อให้ผ่าน
- CSS ใหม่ทั้งหมดอยู่ใน `src/app/guide.css` ใช้ token ขึ้นต้น `--pl-` และ class ขึ้นต้น `pl-` **ห้ามแตะ `globals.css`**
- โหมดมืดต้องออกแบบที่ระดับ token ตั้งแต่ต้น ไม่ใช่ invert ทีหลัง
- ทุกหน้าต้องมีทางออกเสมอ **ห้ามมีทางตัน** ผู้ใช้ที่มาผิดทางต้องกลับไปเลือกใหม่ได้
- ทุก task จบด้วย `npm test && npm run lint && npm run build` ผ่าน แล้วจึง commit
- อ้างอิงสเปก: `docs/superpowers/specs/2026-08-05-growth-form-first-redesign-design.md` ส่วนที่ 5 และ 6

## หมายเหตุความจริงของข้อมูลตอนเริ่มเฟสนี้

ทะเบียนทรงมี **ทรงเดียว** (`climbing-vine-visible-node`) และพืชสามชนิด ทั้งหมดอยู่ในสกุล Philodendron
หน้าจอทุกหน้าจึงต้องรับสภาพนี้ได้อย่างซื่อสัตย์ — ทางที่ยังไม่มีของ ต้องบอกว่ายังไม่มี
ไม่ใช่ซ่อนตัวเลือกจนผู้ใช้คิดว่าต้นของตัวเองไม่มีอยู่ในโลก

## File Structure

| ไฟล์ | หน้าที่ |
|---|---|
| `src/components/guide/doors.tsx` | **ใหม่** สี่ประตูบนหน้าแรก |
| `src/app/page.tsx` | **แก้** เปลี่ยนจาก `PlantPicker` เป็น `Doors` |
| `src/components/guide/rich-text.tsx` | **ใหม่** เรนเดอร์ `TermSpan` เป็นข้อความ + `<details>` อธิบายศัพท์ |
| `src/lib/manual/forms/finder.ts` | **ใหม่** ต้นไม้คำถามของ `/find` |
| `src/lib/manual/forms/finder.test.ts` | **ใหม่** |
| `src/components/guide/form-finder.tsx` | **ใหม่** จอคำถามและจอผลลัพธ์ของ `/find` |
| `src/app/find/page.tsx` | **ใหม่** |
| `src/components/guide/form-detail.tsx` | **ใหม่** หน้าทรง การ์ดต่อหนึ่ง landmark |
| `src/app/form/[formId]/page.tsx` | **ใหม่** |
| `src/lib/manual/search.ts` | **ใหม่** ค้นชนิด สกุล และทรงจากคำเดียว |
| `src/lib/manual/search.test.ts` | **ใหม่** |
| `src/components/guide/search-results.tsx` | **ใหม่** รวมกรณีไม่เจอ |
| `src/app/search/page.tsx` | **ใหม่** |
| `src/components/guide/start-list.tsx` | **ใหม่** ทรงเรียงตามความยาก |
| `src/app/start/page.tsx` | **ใหม่** |
| `src/components/guide/problem-list.tsx` | **ใหม่** เข้าจากอาการ |
| `src/app/problem/page.tsx` | **ใหม่** |
| `src/components/nav/nav-items.ts` | **แก้** เพิ่มรายการนำทางใหม่ |
| `src/app/guide.css` | **แก้** โทนโหมดอ่าน (B) และโหมดลงมือ (C) |
| `src/components/guide/plant-picker.tsx` | **ลบ** ถูกแทนด้วย `search-results.tsx` |

---

### Task 1: สี่ประตูบนหน้าแรก

**Files:**
- Create: `src/components/guide/doors.tsx`
- Create: `src/components/guide/doors.test.tsx`
- Modify: `src/app/page.tsx`

**Interfaces:**
- Consumes: ไม่มีจาก task อื่น
- Produces: `<Doors />` — ไม่รับ prop เพราะประตูเป็นค่าคงที่ของระบบ

- [ ] **Step 1: เขียนเทสต์ที่ยังไม่ผ่าน**

`src/components/guide/doors.test.tsx`

```tsx
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { Doors } from "./doors";

describe("สี่ประตูหน้าแรก", () => {
  const html = renderToStaticMarkup(<Doors />);

  it("มีครบสี่ประตู", () => {
    expect(html).toContain("มีต้นอยู่ แต่ไม่รู้ชื่อ");
    expect(html).toContain("รู้ชื่อต้นแล้ว");
    expect(html).toContain("ยังไม่มีต้น");
    expect(html).toContain("ทำแล้วมีปัญหา");
  });

  it("ทุกประตูลิงก์ไปเส้นทางของตัวเอง", () => {
    for (const href of ["/find", "/search", "/start", "/problem"]) {
      expect(html, `ไม่มีลิงก์ ${href}`).toContain(`href="${href}"`);
    }
  });

  it("ไม่มีชื่อวิทยาศาสตร์บนหน้าแรก เพราะมือใหม่ยังไม่พร้อมเจอ", () => {
    expect(html).not.toContain("Philodendron");
  });

  it("บอกว่าอ่านได้โดยไม่ต้องสมัครสมาชิก", () => {
    expect(html).toContain("ไม่ต้องสมัครสมาชิก");
  });
});
```

- [ ] **Step 2: รันให้เห็นว่าพัง**

Run: `npx vitest run src/components/guide/doors.test.tsx`
Expected: FAIL — `Cannot find module './doors'`

- [ ] **Step 3: เขียน implementation**

`src/components/guide/doors.tsx`

```tsx
import Link from "next/link";

type Door = {
  href: string;
  title: string;
  hint: string;
};

/** สี่สถานะตั้งต้นของมือใหม่ที่เปิดเว็บมาครั้งแรก แสดงขนาดเท่ากันทั้งสี่ ไม่ชี้นำ
 *  เพราะยังไม่มีข้อมูลว่าคนส่วนใหญ่มาจากประตูไหน */
const doors: Door[] = [
  { href: "/find", title: "มีต้นอยู่ แต่ไม่รู้ชื่อ", hint: "ตอบคำถามจากลักษณะต้น ไม่กี่ข้อก็รู้ว่าเพาะยังไง" },
  { href: "/search", title: "รู้ชื่อต้นแล้ว", hint: "ค้นหาคู่มือจากชื่อที่คุณรู้" },
  { href: "/start", title: "ยังไม่มีต้น", hint: "ดูว่าต้นแบบไหนเริ่มง่ายที่สุดสำหรับมือใหม่" },
  { href: "/problem", title: "ทำแล้วมีปัญหา", hint: "ขวดขุ่น ชิ้นดำ ไม่โต ต้นใส" },
];

export function Doors() {
  return (
    <>
      <h1 className="pl-h1">เริ่มต้นตรงไหนดี</h1>
      <p className="pl-lede" style={{ marginBottom: "22px" }}>
        เลือกข้อที่ตรงกับคุณตอนนี้ อ่านคู่มือได้เลย ไม่ต้องสมัครสมาชิก
      </p>
      <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "14px" }}>
        {doors.map((door) => (
          <li key={door.href}>
            <Link
              className="pl-card pl-link"
              href={door.href}
              style={{ display: "block", color: "inherit", textDecoration: "none" }}
            >
              <p className="pl-h2">{door.title}</p>
              <p className="pl-lede" style={{ marginTop: "6px" }}>{door.hint}</p>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
```

- [ ] **Step 4: เปลี่ยนหน้าแรก**

`src/app/page.tsx` แทนที่ทั้งไฟล์

```tsx
import { Doors } from "@/components/guide/doors";
import { GuideShell } from "@/components/guide/guide-shell";
import { ThemeToggle } from "@/components/guide/theme-toggle";

export default function HomePage() {
  return (
    <GuideShell action={<ThemeToggle />}>
      <Doors />
    </GuideShell>
  );
}
```

- [ ] **Step 5: รันเทสต์**

Run: `npx vitest run src/components/guide/doors.test.tsx`
Expected: PASS ทั้ง 4 ข้อ

- [ ] **Step 6: รันทั้งชุด**

Run: `npm test`
Expected: FAIL ที่ `src/app/layout.test.ts` หรือเทสต์ที่อ้าง `PlantPicker` ถ้ามี — ถ้าพังให้ดูว่าเทสต์นั้นตรวจอะไร แล้วแก้เทสต์ให้ตรวจ `Doors` แทนโดย**ไม่ลดความเข้มของการตรวจ**
ถ้าไม่พัง ให้ผ่านไป Step 7 ได้เลย (`plant-picker.tsx` ยังอยู่ จะลบใน Task 5)

- [ ] **Step 7: ตรวจ lint และ build**

Run: `npm run lint && npm run build`
Expected: PASS

- [ ] **Step 8: Commit**

```bash
git add src/components/guide/doors.tsx src/components/guide/doors.test.tsx src/app/page.tsx
git commit -m "feat: replace species picker with four beginner doors"
```

---

### Task 2: เรนเดอร์คำศัพท์ที่แตะดูความหมายได้

ใช้ `<details>` ของ HTML แทน overlay ที่ต้องใช้ JavaScript เพราะเข้าถึงได้ในตัว ทำงานโดยไม่มี JS
และทดสอบด้วย `renderToStaticMarkup` ได้ ซึ่งตรงกับข้อจำกัดเทสต์ของโปรเจกต์นี้

**Files:**
- Create: `src/components/guide/rich-text.tsx`
- Create: `src/components/guide/rich-text.test.tsx`

**Interfaces:**
- Consumes: `parseTerms(source: string): TermSpan[]` จาก `@/lib/manual/terms` · `growthForms` จาก `@/lib/manual/forms/registry`
- Produces: `<RichText source={string} />` — เรนเดอร์ข้อความพร้อมคำที่แตะขยายได้ · `landmarkByTermId(termId: string): Landmark | null` export จากไฟล์เดียวกัน

- [ ] **Step 1: เขียนเทสต์ที่ยังไม่ผ่าน**

`src/components/guide/rich-text.test.tsx`

```tsx
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { RichText, landmarkByTermId } from "./rich-text";

describe("ข้อความที่มีคำศัพท์แตะดูได้", () => {
  it("ข้อความธรรมดาออกมาเหมือนเดิม", () => {
    expect(renderToStaticMarkup(<RichText source="ตัดให้ชิดโคน" />)).toContain("ตัดให้ชิดโคน");
  });

  it("คำที่ห่อไว้กลายเป็น details ที่กางดูความหมายได้", () => {
    const html = renderToStaticMarkup(<RichText source="หา[[node|ข้อ]]ที่สมบูรณ์" />);
    expect(html).toContain("<details");
    expect(html).toContain("<summary");
    expect(html).toContain("ข้อ");
    expect(html).toContain("วงนูนรอบลำต้นที่ใบและรากงอกออกมา");
  });

  it("แสดงวิธีหาและคำที่มักสับสน ไม่ใช่แค่คำแปล", () => {
    const html = renderToStaticMarkup(<RichText source="[[node|ข้อ]]" />);
    expect(html).toContain("ไล่นิ้วไปตามลำต้น");
    expect(html).toContain("ปล้องคือช่วงเรียบยาว");
  });

  it("คำที่ไม่มีในทะเบียน แสดงเป็นข้อความธรรมดา ไม่พัง", () => {
    const html = renderToStaticMarkup(<RichText source="ลอง[[nodee|ข้อ]]ดู" />);
    expect(html).toContain("ลอง");
    expect(html).toContain("ข้อ");
    expect(html).not.toContain("<details");
  });

  it("ค้น landmark จาก id ได้ข้ามทุกทรง", () => {
    expect(landmarkByTermId("axillary-bud")?.term).toBe("ตาข้าง");
    expect(landmarkByTermId("ไม่มี")).toBeNull();
  });
});
```

- [ ] **Step 2: รันให้เห็นว่าพัง**

Run: `npx vitest run src/components/guide/rich-text.test.tsx`
Expected: FAIL — `Cannot find module './rich-text'`

- [ ] **Step 3: เขียน implementation**

`src/components/guide/rich-text.tsx`

```tsx
import { growthForms } from "@/lib/manual/forms/registry";
import type { Landmark } from "@/lib/manual/forms/types";
import { parseTerms } from "@/lib/manual/terms";

/** ค้นคำศัพท์ข้ามทุกทรง เพราะคำเดียวกันอาจถูกนิยามไว้ในทรงที่ต่างจากที่ผู้ใช้กำลังอ่าน
 *  ทรงแรกที่นิยามคำนั้นชนะ ซึ่งพอสำหรับตอนนี้เพราะคำที่ซ้ำกันข้ามทรงมีความหมายเดียวกัน */
export function landmarkByTermId(termId: string): Landmark | null {
  for (const form of growthForms) {
    const found = form.landmarks.find((landmark) => landmark.id === termId);
    if (found) return found;
  }
  return null;
}

/** ใช้ <details> แทน overlay ที่ต้องใช้ JavaScript เพราะเข้าถึงได้ในตัว ทำงานโดยไม่มี JS
 *  และเทสต์ด้วย renderToStaticMarkup ได้ตามข้อจำกัดของโปรเจกต์นี้ */
export function RichText({ source }: { source: string }) {
  return (
    <>
      {parseTerms(source).map((span, index) => {
        if (span.kind === "text") return <span key={index}>{span.text}</span>;

        const landmark = landmarkByTermId(span.termId);
        if (!landmark) return <span key={index}>{span.text}</span>;

        return (
          <details key={index} className="pl-term">
            <summary className="pl-term-word">{span.text}</summary>
            <div className="pl-term-body">
              <p className="pl-term-line"><b>คืออะไร</b> {landmark.whatItIs}</p>
              <p className="pl-term-line"><b>หายังไง</b> {landmark.howToFind}</p>
              {landmark.confusedWith ? (
                <p className="pl-term-line"><b>อย่าสับสน</b> {landmark.confusedWith}</p>
              ) : null}
            </div>
          </details>
        );
      })}
    </>
  );
}
```

- [ ] **Step 4: เพิ่ม CSS ของคำศัพท์**

ต่อท้าย `src/app/guide.css`

```css
/* คำศัพท์ที่แตะกางดูได้ ต้องอยู่ในบรรทัดเดียวกับข้อความรอบ ๆ ไม่ตัดบรรทัดใหม่ */
.pl-term {
  display: inline;
}

.pl-term-word {
  display: inline;
  cursor: pointer;
  border-bottom: 2px dotted var(--pl-leaf);
  list-style: none;
}

.pl-term-word::-webkit-details-marker {
  display: none;
}

.pl-term-word::after {
  content: " ⓘ";
  font-size: 0.85em;
  color: var(--pl-leaf);
}

.pl-term-body {
  display: block;
  margin: 8px 0;
  padding: 10px 12px;
  border-left: 3px solid var(--pl-leaf);
  background: var(--pl-sunk);
  border-radius: 8px;
}

.pl-term-line {
  margin: 0 0 6px;
  font-size: 14px;
  line-height: 1.6;
  color: var(--pl-ink-2);
}

.pl-term-line:last-child {
  margin-bottom: 0;
}
```

- [ ] **Step 5: รันเทสต์**

Run: `npx vitest run src/components/guide/rich-text.test.tsx`
Expected: PASS ทั้ง 5 ข้อ

- [ ] **Step 6: ใช้ `RichText` แทน `plainText` ที่จุดเรนเดอร์คู่มือ**

`src/components/guide/step-detail.tsx` เปลี่ยนบรรทัดที่แสดง summary

```tsx
      <p className="pl-lede" style={{ marginTop: "12px" }}><RichText source={step.summary} /></p>
```

และเปลี่ยน import จาก `plainText` เป็น

```tsx
import { RichText } from "./rich-text";
```

`src/components/guide/step-map.tsx` ทำแบบเดียวกัน

```tsx
              <p className="pl-lede" style={{ marginTop: "4px" }}><RichText source={step.summary} /></p>
```

**ห้ามแตะ `src/components/rounds/step-runner.tsx`** ให้คงใช้ `plainText` ไว้
เพราะการ์ดในลิงก์ของ step-map ซ้อน `<details>` ในลิงก์ไม่ได้ตามมาตรฐาน HTML — ดู Step 7

- [ ] **Step 7: แก้ปัญหา details ซ้อนในลิงก์ที่ step-map**

`step-map.tsx` ห่อการ์ดทั้งใบไว้ใน `<Link>` ซึ่งวาง `<details>` ข้างในไม่ได้
ให้เปลี่ยนกลับเป็น `plainText` เฉพาะไฟล์นี้ และคง `RichText` ไว้ที่ `step-detail.tsx` อย่างเดียว

```tsx
              <p className="pl-lede" style={{ marginTop: "4px" }}>{plainText(step.summary)}</p>
```

เหตุผลบันทึกไว้เป็นคอมเมนต์เหนือบรรทัดนั้น

```tsx
              {/* ใช้ข้อความล้วนเพราะการ์ดทั้งใบอยู่ในลิงก์ ซึ่งซ้อน details ไม่ได้
                  คำอธิบายศัพท์อยู่ที่หน้าขั้นเดียว (step-detail) ซึ่งไม่ได้อยู่ในลิงก์ */}
```

- [ ] **Step 8: รันทั้งชุดและ build**

Run: `npm test && npm run lint && npm run build`
Expected: PASS ทั้งหมด

- [ ] **Step 9: Commit**

```bash
git add src/components/guide/rich-text.tsx src/components/guide/rich-text.test.tsx src/components/guide/step-detail.tsx src/components/guide/step-map.tsx src/app/guide.css
git commit -m "feat: render inline term explanations with native details"
```

---

### Task 3: หน้าทรง

**Files:**
- Create: `src/components/guide/form-detail.tsx`
- Create: `src/components/guide/form-detail.test.tsx`
- Create: `src/app/form/[formId]/page.tsx`

**Interfaces:**
- Consumes: `formById`, `growthForms` จาก `@/lib/manual/forms/registry` · `plantPacks` จาก `@/lib/manual/registry` · `EvidenceBadge` จาก `./evidence-badge`
- Produces: `<FormDetail form={GrowthForm} plants={FormPlantLink[]} />` โดย
  `FormPlantLink = { slug: string; commonName: string }`

- [ ] **Step 1: เขียนเทสต์ที่ยังไม่ผ่าน**

`src/components/guide/form-detail.test.tsx`

```tsx
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { climbingVineVisibleNode } from "@/lib/manual/forms/climbing-vine-visible-node";
import { FormDetail } from "./form-detail";

const html = renderToStaticMarkup(
  <FormDetail form={climbingVineVisibleNode} plants={[{ slug: "pink-princess", commonName: "พิงค์ปริ๊นเซส" }]} />,
);

describe("หน้าทรง", () => {
  it("มีการ์ดของทุกจุดสังเกต", () => {
    for (const landmark of climbingVineVisibleNode.landmarks) {
      expect(html, `ไม่มีการ์ดของ ${landmark.id}`).toContain(landmark.term);
      expect(html).toContain(landmark.howToFind);
    }
  });

  it("บอกตำแหน่งตัดเป็นระยะจากจุดอ้างอิงที่ชี้ได้ ไม่ใช่คำลอย ๆ", () => {
    expect(html).toContain("10");
    expect(html).toContain("ใต้");
    expect(html).toContain("ข้อ");
  });

  it("แสดงระดับหลักฐานของตำแหน่งตัด", () => {
    expect(html).toContain("ระดับหลักฐาน");
  });

  it("บอกตรง ๆ เมื่อทรงยังไม่มีภาพ และเสนอทางเลือกแทนการเงียบ", () => {
    expect(html).toContain("ยังไม่มีภาพ");
  });

  it("ลิงก์ไปพืชที่มีคู่มือเฉพาะในทรงนี้", () => {
    expect(html).toContain('href="/guide/pink-princess"');
    expect(html).toContain("พิงค์ปริ๊นเซส");
  });

  it("มีทางออกเมื่อผู้ใช้มาผิดทรง", () => {
    expect(html).toContain('href="/find"');
  });
});
```

- [ ] **Step 2: รันให้เห็นว่าพัง**

Run: `npx vitest run src/components/guide/form-detail.test.tsx`
Expected: FAIL — `Cannot find module './form-detail'`

- [ ] **Step 3: เขียน component**

`src/components/guide/form-detail.tsx`

```tsx
import Link from "next/link";
import type { GrowthForm } from "@/lib/manual/forms/types";
import { EvidenceBadge } from "./evidence-badge";
import { RichText } from "./rich-text";

export type FormPlantLink = { slug: string; commonName: string };

const directionLabel = { above: "เหนือ", below: "ใต้" } as const;

export function FormDetail({ form, plants }: { form: GrowthForm; plants: FormPlantLink[] }) {
  const explant = form.defaultExplant;
  const anchor = form.landmarks.find((landmark) => landmark.id === explant.landmarkId);

  return (
    <>
      <h1 className="pl-h1">{form.label}</h1>
      <p className="pl-lede" style={{ marginTop: "8px" }}>{form.plainDescription}</p>

      {form.referenceImageId ? null : (
        <div className="pl-card" style={{ marginTop: "18px", background: "var(--pl-sunk)" }}>
          <p style={{ margin: 0, fontWeight: 700 }}>ทรงนี้ยังไม่มีภาพอ้างอิง</p>
          <p className="pl-lede" style={{ marginTop: "6px" }}>
            ให้ใช้คำอธิบายวิธีหาข้างล่างเทียบกับต้นจริงที่อยู่ตรงหน้าคุณ
            เราไม่เอาภาพวาดมาแทนเพื่อให้ดูเหมือนมี เพราะภาพที่ไม่ตรงต้นทำให้ตัดผิดตำแหน่งได้
          </p>
        </div>
      )}

      <h2 className="pl-h2" style={{ marginTop: "26px" }}>จุดสังเกตที่ต้องหาให้เจอ</h2>
      <ul style={{ listStyle: "none", margin: "12px 0 0", padding: 0, display: "flex", flexDirection: "column", gap: "12px" }}>
        {form.landmarks.map((landmark) => (
          <li className="pl-card" key={landmark.id}>
            <p className="pl-h2">{landmark.term}</p>
            {landmark.aka?.length ? (
              <p className="pl-meta" style={{ marginTop: "2px" }}>เรียกอีกอย่างว่า {landmark.aka.join(" · ")}</p>
            ) : null}
            <p className="pl-lede" style={{ marginTop: "8px" }}>{landmark.whatItIs}</p>
            <p className="pl-lede" style={{ marginTop: "6px" }}><b>หายังไง</b> {landmark.howToFind}</p>
            {landmark.confusedWith ? (
              <p className="pl-lede" style={{ marginTop: "6px" }}><b>อย่าสับสน</b> {landmark.confusedWith}</p>
            ) : null}
          </li>
        ))}
      </ul>

      <h2 className="pl-h2" style={{ marginTop: "26px" }}>ต้นทรงนี้ตัดตรงไหน</h2>
      <div className="pl-card" style={{ marginTop: "12px" }}>
        <p className="pl-lede">
          ตัด{directionLabel[explant.direction]}
          <RichText source={`[[${explant.landmarkId}|${anchor?.term ?? explant.landmarkId}]]`} />
          {" "}{explant.offsetMm} มม. ให้ได้ชิ้นยาว {explant.sizeMm[0]} ถึง {explant.sizeMm[1]} มม.
        </p>
        <p style={{ marginTop: "12px" }}>
          <EvidenceBadge level={explant.evidence.level} />
        </p>
        {explant.evidence.note ? (
          <p className="pl-meta" style={{ marginTop: "8px" }}>{explant.evidence.note}</p>
        ) : null}
      </div>

      {plants.length > 0 ? (
        <>
          <h2 className="pl-h2" style={{ marginTop: "26px" }}>ต้นที่มีคู่มือเฉพาะในทรงนี้</h2>
          <ul style={{ listStyle: "none", margin: "12px 0 0", padding: 0, display: "flex", flexDirection: "column", gap: "10px" }}>
            {plants.map((plant) => (
              <li key={plant.slug}>
                <Link
                  className="pl-card pl-link"
                  href={`/guide/${plant.slug}`}
                  style={{ display: "block", color: "inherit", textDecoration: "none" }}
                >
                  <p className="pl-h2">{plant.commonName}</p>
                </Link>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <p className="pl-lede" style={{ marginTop: "26px" }}>
          ยังไม่มีพืชชนิดใดในทรงนี้ที่มีคู่มือเฉพาะ
        </p>
      )}

      <p className="pl-meta" style={{ marginTop: "26px" }}>
        ต้นของคุณไม่เหมือนที่อธิบายไว้ข้างบน? <Link className="pl-link" href="/find">กลับไปเลือกทรงใหม่</Link>
      </p>
    </>
  );
}
```

- [ ] **Step 4: เขียนหน้า**

`src/app/form/[formId]/page.tsx`

```tsx
import { notFound } from "next/navigation";
import { FormDetail, type FormPlantLink } from "@/components/guide/form-detail";
import { GuideShell } from "@/components/guide/guide-shell";
import { ThemeToggle } from "@/components/guide/theme-toggle";
import { formById, growthForms } from "@/lib/manual/forms/registry";
import { plantPacks } from "@/lib/manual/registry";

export function generateStaticParams() {
  return growthForms.map((form) => ({ formId: form.id }));
}

export default async function FormPage({ params }: { params: Promise<{ formId: string }> }) {
  const { formId } = await params;
  const form = formById(formId);
  if (!form) notFound();

  const plants: FormPlantLink[] = plantPacks
    .filter((pack) => pack.growthFormId === form.id)
    .map((pack) => ({ slug: pack.slug, commonName: pack.commonName }));

  return (
    <GuideShell action={<ThemeToggle />}>
      <FormDetail form={form} plants={plants} />
    </GuideShell>
  );
}
```

- [ ] **Step 5: รันเทสต์และ build**

Run: `npx vitest run src/components/guide/form-detail.test.tsx && npm run build`
Expected: PASS · build แสดงเส้นทาง `/form/[formId]` เป็น SSG

- [ ] **Step 6: รันทั้งชุด**

Run: `npm test && npm run lint`
Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add src/components/guide/form-detail.tsx src/components/guide/form-detail.test.tsx "src/app/form/[formId]/page.tsx"
git commit -m "feat: add growth form page"
```

---

### Task 4: ไล่ภาพหาทรง

**Files:**
- Create: `src/lib/manual/forms/finder.ts`
- Create: `src/lib/manual/forms/finder.test.ts`
- Create: `src/components/guide/form-finder.tsx`
- Create: `src/components/guide/form-finder.test.tsx`
- Create: `src/app/find/page.tsx`

**Interfaces:**
- Consumes: `formById` จาก `@/lib/manual/forms/registry`
- Produces:
  - `FinderChoice = { value: string; label: string; hint: string }`
  - `FinderQuestion = { key: string; ask: string; choices: FinderChoice[] }`
  - `FinderOutcome = { formId: string; planned: boolean }`
  - `finderQuestions: FinderQuestion[]`
  - `resolveFinder(answers: Record<string, string | undefined>): { question: FinderQuestion | null; outcome: FinderOutcome | null }`

- [ ] **Step 1: เขียนเทสต์ของตรรกะที่ยังไม่ผ่าน**

`src/lib/manual/forms/finder.test.ts`

```ts
import { describe, expect, it } from "vitest";

import { formById } from "./registry";
import { finderQuestions, resolveFinder } from "./finder";

describe("การไล่คำถามหาทรง", () => {
  it("ยังไม่ตอบอะไรเลย ได้คำถามแรก", () => {
    const { question, outcome } = resolveFinder({});
    expect(question?.key).toBe(finderQuestions[0].key);
    expect(outcome).toBeNull();
  });

  it("เถาเลื้อยที่เห็นข้อชัด จบที่ทรงเถาเลื้อยข้อชัด", () => {
    const { outcome } = resolveFinder({ stem: "vine", node: "visible" });
    expect(outcome?.formId).toBe("climbing-vine-visible-node");
    expect(outcome?.planned).toBe(false);
  });

  it("เส้นทางที่ทรงยังไม่ถูกเขียน ต้องบอกว่าวางแผนไว้แล้วแต่ยังไม่มี", () => {
    const { outcome } = resolveFinder({ stem: "rosette" });
    expect(outcome?.planned).toBe(true);
    expect(formById(outcome!.formId)).toBeNull();
  });

  it("ตอบข้อแรกแล้วยังไม่จบ ได้คำถามถัดไป", () => {
    const { question, outcome } = resolveFinder({ stem: "vine" });
    expect(question?.key).toBe("node");
    expect(outcome).toBeNull();
  });

  it("คำตอบที่ไม่มีในตัวเลือก ถือว่ายังไม่ได้ตอบ", () => {
    const { question } = resolveFinder({ stem: "มั่ว" });
    expect(question?.key).toBe("stem");
  });

  it("ทุกปลายทางที่บอกว่ามีอยู่แล้ว ต้องมีในทะเบียนทรงจริง", () => {
    const paths = [
      { stem: "vine", node: "visible" },
      { stem: "vine", node: "faint" },
      { stem: "rosette" },
      { stem: "rhizome" },
      { stem: "leaf-only" },
    ];
    for (const answers of paths) {
      const { outcome } = resolveFinder(answers);
      expect(outcome, `${JSON.stringify(answers)} ไม่ได้ปลายทาง`).not.toBeNull();
      if (!outcome!.planned) {
        expect(formById(outcome!.formId), `${outcome!.formId} ไม่มีในทะเบียน`).not.toBeNull();
      }
    }
  });
});
```

- [ ] **Step 2: รันให้เห็นว่าพัง**

Run: `npx vitest run src/lib/manual/forms/finder.test.ts`
Expected: FAIL — `Cannot find module './finder'`

- [ ] **Step 3: เขียนตรรกะ**

`src/lib/manual/forms/finder.ts`

```ts
export type FinderChoice = { value: string; label: string; hint: string };
export type FinderQuestion = { key: string; ask: string; choices: FinderChoice[] };
/** planned เป็นจริงเมื่อทรงนั้นอยู่ในแผนแต่ยังไม่ได้เขียน หน้าจอต้องบอกตรง ๆ
 *  ไม่ใช่ซ่อนตัวเลือกจนผู้ใช้คิดว่าต้นของตัวเองไม่มีในระบบ */
export type FinderOutcome = { formId: string; planned: boolean };

export const finderQuestions: FinderQuestion[] = [
  {
    key: "stem",
    ask: "ลำต้นของต้นคุณเป็นแบบไหน",
    choices: [
      { value: "vine", label: "เลื้อยหรือพาดขึ้นหลัก", hint: "ลำต้นทอดยาว มีใบออกเป็นระยะตลอดความยาว" },
      { value: "rosette", label: "ตั้งตรง ใบออกรอบจุดเดียว", hint: "ก้านใบซ้อนกันออกจากโคนเดียว มองไม่เห็นลำต้นชัด" },
      { value: "rhizome", label: "มีหัวหรือเหง้าอยู่ใต้ดิน", hint: "ขุดดินขึ้นมาเจอหัวหรือแง่งทอดขวาง" },
      { value: "leaf-only", label: "ใบออกจากดินเลย ไม่เห็นลำต้น", hint: "ใบหนาตั้งขึ้นตรงจากดิน" },
    ],
  },
  {
    key: "node",
    ask: "ตามลำต้นมีวงนูนหรือปุ่มเป็นระยะ ๆ ไหม",
    choices: [
      { value: "visible", label: "เห็นชัด บางทีมีรากเล็ก ๆ งอกออกมา", hint: "ไล่นิ้วไปตามลำต้นแล้วสะดุดเป็นปุ่ม" },
      { value: "faint", label: "เห็นราง ๆ หรือไม่แน่ใจ", hint: "ลำต้นค่อนข้างเรียบ หาปุ่มไม่เจอชัด" },
    ],
  },
];

/** ปลายทางของแต่ละเส้นทางคำตอบ คีย์คือค่าที่ตอบต่อกันด้วย "/" */
const outcomes: Record<string, FinderOutcome> = {
  "vine/visible": { formId: "climbing-vine-visible-node", planned: false },
  "vine/faint": { formId: "climbing-vine-hidden-node", planned: true },
  rosette: { formId: "rosette-sheathed-node", planned: true },
  rhizome: { formId: "rhizome-bud", planned: true },
  "leaf-only": { formId: "thick-leaf-no-stem", planned: true },
};

/** ถามเฉพาะคำถามที่จำเป็นกับเส้นทางนั้น เส้นทางที่ไม่ใช่เถาเลื้อยจบตั้งแต่ข้อแรก */
function questionsFor(stem: string | undefined): FinderQuestion[] {
  if (stem === "vine") return finderQuestions;
  return finderQuestions.slice(0, 1);
}

function answered(question: FinderQuestion, answers: Record<string, string | undefined>): string | null {
  const given = answers[question.key];
  return question.choices.some((choice) => choice.value === given) ? given! : null;
}

export function resolveFinder(answers: Record<string, string | undefined>): {
  question: FinderQuestion | null;
  outcome: FinderOutcome | null;
} {
  const path: string[] = [];

  for (const question of questionsFor(answers.stem)) {
    const value = answered(question, answers);
    if (value === null) return { question, outcome: null };
    path.push(value);
  }

  return { question: null, outcome: outcomes[path.join("/")] ?? null };
}
```

- [ ] **Step 4: รันเทสต์ตรรกะ**

Run: `npx vitest run src/lib/manual/forms/finder.test.ts`
Expected: PASS ทั้ง 6 ข้อ

- [ ] **Step 5: เขียนเทสต์ของหน้าจอที่ยังไม่ผ่าน**

`src/components/guide/form-finder.test.tsx`

```tsx
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { FormFinder } from "./form-finder";

describe("จอไล่หาทรง", () => {
  it("แสดงคำถามพร้อมคำใบ้ของทุกตัวเลือก", () => {
    const html = renderToStaticMarkup(<FormFinder answers={{}} />);
    expect(html).toContain("ลำต้นของต้นคุณเป็นแบบไหน");
    expect(html).toContain("เลื้อยหรือพาดขึ้นหลัก");
    expect(html).toContain("ขุดดินขึ้นมาเจอหัวหรือแง่งทอดขวาง");
  });

  it("ตัวเลือกเป็นลิงก์ที่สะสมคำตอบไว้ใน URL", () => {
    const html = renderToStaticMarkup(<FormFinder answers={{}} />);
    expect(html).toContain('href="/find?stem=vine"');
  });

  it("ตอบข้อแรกแล้ว ลิงก์ข้อถัดไปเก็บคำตอบเดิมไว้ด้วย", () => {
    const html = renderToStaticMarkup(<FormFinder answers={{ stem: "vine" }} />);
    expect(html).toContain('href="/find?stem=vine&amp;node=visible"');
  });

  it("จบที่ทรงที่มีอยู่จริง พาไปหน้าทรง", () => {
    const html = renderToStaticMarkup(<FormFinder answers={{ stem: "vine", node: "visible" }} />);
    expect(html).toContain('href="/form/climbing-vine-visible-node"');
  });

  it("จบที่ทรงที่ยังไม่ได้เขียน บอกตรง ๆ และไม่ทิ้งให้ตัน", () => {
    const html = renderToStaticMarkup(<FormFinder answers={{ stem: "rosette" }} />);
    expect(html).toContain("ยังไม่มีคู่มือของทรงนี้");
    expect(html).toContain('href="/find"');
  });

  it("มีทางถอยกลับไปเริ่มใหม่เสมอ", () => {
    const html = renderToStaticMarkup(<FormFinder answers={{ stem: "vine" }} />);
    expect(html).toContain('href="/find"');
  });
});
```

- [ ] **Step 6: รันให้เห็นว่าพัง**

Run: `npx vitest run src/components/guide/form-finder.test.tsx`
Expected: FAIL — `Cannot find module './form-finder'`

- [ ] **Step 7: เขียนหน้าจอ**

`src/components/guide/form-finder.tsx`

```tsx
import Link from "next/link";
import { formById } from "@/lib/manual/forms/registry";
import { resolveFinder } from "@/lib/manual/forms/finder";

export type FinderAnswers = Record<string, string | undefined>;

function hrefWith(answers: FinderAnswers, key: string, value: string): string {
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(answers)) if (v) params.set(k, v);
  params.set(key, value);
  return `/find?${params.toString()}`;
}

export function FormFinder({ answers }: { answers: FinderAnswers }) {
  const { question, outcome } = resolveFinder(answers);

  if (question) {
    return (
      <>
        <h1 className="pl-h1">{question.ask}</h1>
        <p className="pl-lede" style={{ marginBottom: "20px" }}>
          เอาต้นจริงมาวางตรงหน้าแล้วดูไปด้วย จะตอบง่ายกว่านึกเอา
        </p>
        <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "14px" }}>
          {question.choices.map((choice) => (
            <li key={choice.value}>
              <Link
                className="pl-card pl-link"
                href={hrefWith(answers, question.key, choice.value)}
                style={{ display: "block", color: "inherit", textDecoration: "none" }}
              >
                <p className="pl-h2">{choice.label}</p>
                <p className="pl-lede" style={{ marginTop: "6px" }}>{choice.hint}</p>
              </Link>
            </li>
          ))}
        </ul>
        <p className="pl-meta" style={{ marginTop: "22px" }}>
          <Link className="pl-link" href="/find">เริ่มตอบใหม่</Link>
        </p>
      </>
    );
  }

  const form = outcome ? formById(outcome.formId) : null;

  if (outcome && form) {
    return (
      <>
        <h1 className="pl-h1">ต้นของคุณน่าจะเป็น {form.label}</h1>
        <p className="pl-lede" style={{ marginTop: "8px" }}>{form.plainDescription}</p>
        <p style={{ marginTop: "20px" }}>
          <Link className="pl-card pl-link" href={`/form/${form.id}`} style={{ display: "block", color: "inherit", textDecoration: "none" }}>
            <p className="pl-h2">เปิดคู่มือของทรงนี้</p>
            <p className="pl-lede" style={{ marginTop: "6px" }}>ดูจุดสังเกตที่ต้องหา และตำแหน่งที่ต้องตัด</p>
          </Link>
        </p>
        <p className="pl-meta" style={{ marginTop: "22px" }}>
          ไม่ตรงกับต้นของคุณ? <Link className="pl-link" href="/find">เริ่มตอบใหม่</Link>
        </p>
      </>
    );
  }

  return (
    <>
      <h1 className="pl-h1">ยังไม่มีคู่มือของทรงนี้</h1>
      <p className="pl-lede" style={{ marginTop: "8px" }}>
        เราระบุได้ว่าต้นของคุณเป็นทรงไหน แต่ยังไม่ได้เขียนคู่มือของทรงนั้น
        เราไม่เอาคู่มือของทรงอื่นมาให้ เพราะตำแหน่งตัดของแต่ละทรงต่างกันจริง ๆ และตัดผิดตำแหน่งต้นจะไม่ขึ้น
      </p>
      <p className="pl-meta" style={{ marginTop: "22px" }}>
        <Link className="pl-link" href="/find">เริ่มตอบใหม่</Link> · <Link className="pl-link" href="/">กลับหน้าแรก</Link>
      </p>
    </>
  );
}
```

- [ ] **Step 8: เขียนหน้า**

`src/app/find/page.tsx`

```tsx
import { FormFinder, type FinderAnswers } from "@/components/guide/form-finder";
import { GuideShell } from "@/components/guide/guide-shell";
import { ThemeToggle } from "@/components/guide/theme-toggle";

export default async function FindPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const raw = await searchParams;
  const answers: FinderAnswers = {};
  for (const [key, value] of Object.entries(raw)) {
    answers[key] = Array.isArray(value) ? value[0] : value;
  }

  return (
    <GuideShell action={<ThemeToggle />}>
      <FormFinder answers={answers} />
    </GuideShell>
  );
}
```

- [ ] **Step 9: รันเทสต์ทั้งชุดและ build**

Run: `npm test && npm run lint && npm run build`
Expected: PASS ทั้งหมด

- [ ] **Step 10: Commit**

```bash
git add src/lib/manual/forms/finder.ts src/lib/manual/forms/finder.test.ts src/components/guide/form-finder.tsx src/components/guide/form-finder.test.tsx src/app/find/page.tsx
git commit -m "feat: add url-driven growth form finder"
```

---

### Task 5: ค้นหาชนิด และกรณีค้นไม่เจอ

กรณีสำคัญที่สุดของประตูนี้คือ **ค้นไม่เจอ** เพราะระบบมีคู่มือสามชุด แปลว่าเกือบทุกคนจะไม่เจอต้นของตัวเอง

**Files:**
- Create: `src/lib/manual/search.ts`
- Create: `src/lib/manual/search.test.ts`
- Create: `src/components/guide/search-results.tsx`
- Create: `src/components/guide/search-results.test.tsx`
- Create: `src/app/search/page.tsx`
- Delete: `src/components/guide/plant-picker.tsx` และ `src/components/guide/plant-picker.test.tsx`

**Interfaces:**
- Consumes: `plantPacks` จาก `@/lib/manual/registry` · `generaPacks` จาก `@/lib/manual/genera/registry` · `growthForms` จาก `@/lib/manual/forms/registry`
- Produces:
  - `SearchHit = { kind: "species"; slug: string; title: string; subtitle: string } | { kind: "genus"; formId: string; title: string; subtitle: string } | { kind: "form"; formId: string; title: string; subtitle: string }`
  - `searchPlants(query: string): SearchHit[]`

- [ ] **Step 1: เขียนเทสต์ที่ยังไม่ผ่าน**

`src/lib/manual/search.test.ts`

```ts
import { describe, expect, it } from "vitest";

import { searchPlants } from "./search";

describe("การค้นหา", () => {
  it("คำว่างคืนผลว่าง", () => {
    expect(searchPlants("")).toEqual([]);
    expect(searchPlants("   ")).toEqual([]);
  });

  it("ค้นด้วยชื่อไทยของชนิดเจอ", () => {
    const hits = searchPlants("พิงค์");
    expect(hits.some((hit) => hit.kind === "species" && hit.slug === "pink-princess")).toBe(true);
  });

  it("ค้นด้วยชื่อวิทยาศาสตร์เจอ ไม่สนตัวพิมพ์เล็กใหญ่", () => {
    const hits = searchPlants("PINK PRINCESS");
    expect(hits.some((hit) => hit.kind === "species")).toBe(true);
  });

  it("ค้นชื่อสกุลที่ยังไม่มีคู่มือชนิด ได้ผลระดับสกุล", () => {
    const hits = searchPlants("ฟิโลเดนดรอน");
    expect(hits.some((hit) => hit.kind === "genus")).toBe(true);
  });

  it("ค้นชื่อทรงเจอทรง", () => {
    const hits = searchPlants("เถาเลื้อย");
    expect(hits.some((hit) => hit.kind === "form")).toBe(true);
  });

  it("คำที่ไม่ตรงอะไรเลยคืนผลว่าง", () => {
    expect(searchPlants("ปลาทอง")).toEqual([]);
  });

  it("ผลชนิดมาก่อนผลสกุลและทรงเสมอ", () => {
    const hits = searchPlants("philodendron");
    const kinds = hits.map((hit) => hit.kind);
    const firstGenus = kinds.indexOf("genus");
    const lastSpecies = kinds.lastIndexOf("species");
    if (firstGenus !== -1 && lastSpecies !== -1) expect(lastSpecies).toBeLessThan(firstGenus);
  });
});
```

- [ ] **Step 2: รันให้เห็นว่าพัง**

Run: `npx vitest run src/lib/manual/search.test.ts`
Expected: FAIL — `Cannot find module './search'`

- [ ] **Step 3: เขียนตรรกะ**

`src/lib/manual/search.ts`

```ts
import { growthForms } from "./forms/registry";
import { generaPacks } from "./genera/registry";
import { plantPacks } from "./registry";

export type SearchHit =
  | { kind: "species"; slug: string; title: string; subtitle: string }
  | { kind: "genus"; formId: string; title: string; subtitle: string }
  | { kind: "form"; formId: string; title: string; subtitle: string };

function matches(haystacks: string[], needle: string): boolean {
  return haystacks.some((text) => text.toLowerCase().includes(needle));
}

/** เรียงจากเจาะจงที่สุดไปกว้างที่สุด ชนิด → สกุล → ทรง
 *  เพราะยิ่งเจาะจง หลักฐานยิ่งตรงพันธุ์ ผู้ใช้ควรเห็นของที่ดีที่สุดก่อน */
export function searchPlants(query: string): SearchHit[] {
  const needle = query.trim().toLowerCase();
  if (needle.length === 0) return [];

  const hits: SearchHit[] = [];

  for (const pack of plantPacks) {
    if (!matches([pack.commonName, pack.scientificName], needle)) continue;
    hits.push({ kind: "species", slug: pack.slug, title: pack.commonName, subtitle: pack.scientificName });
  }

  for (const pack of generaPacks) {
    if (!matches([pack.scientificName, ...pack.commonNames], needle)) continue;
    hits.push({
      kind: "genus",
      formId: pack.growthFormId,
      title: `สกุล ${pack.scientificName}`,
      subtitle: pack.commonNames.join(" · "),
    });
  }

  for (const form of growthForms) {
    if (!matches([form.label, form.plainDescription], needle)) continue;
    hits.push({ kind: "form", formId: form.id, title: form.label, subtitle: form.plainDescription });
  }

  return hits;
}
```

- [ ] **Step 4: รันเทสต์ตรรกะ**

Run: `npx vitest run src/lib/manual/search.test.ts`
Expected: PASS ทั้ง 7 ข้อ

- [ ] **Step 5: เขียนเทสต์ของหน้าจอที่ยังไม่ผ่าน**

`src/components/guide/search-results.test.tsx`

```tsx
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { SearchResults } from "./search-results";

describe("ผลการค้นหา", () => {
  it("ยังไม่ได้พิมพ์อะไร แนะนำตัวอย่างคำค้น", () => {
    const html = renderToStaticMarkup(<SearchResults query="" />);
    expect(html).toContain("ลองพิมพ์");
  });

  it("เจอชนิด แสดงลิงก์ไปคู่มือของชนิดนั้น", () => {
    const html = renderToStaticMarkup(<SearchResults query="พิงค์" />);
    expect(html).toContain('href="/guide/pink-princess"');
  });

  it("ค้นไม่เจอ ต้องไม่ใช่ทางตัน และต้องเสนอประตูอื่น", () => {
    const html = renderToStaticMarkup(<SearchResults query="ปลาทอง" />);
    expect(html).toContain("ยังไม่มีคู่มือของต้นนี้");
    expect(html).toContain('href="/find"');
  });

  it("ค้นไม่เจอ ต้องไม่แกล้งทำเป็นว่ามีคำตอบ", () => {
    const html = renderToStaticMarkup(<SearchResults query="ปลาทอง" />);
    expect(html).not.toContain('href="/guide/');
  });

  it("มีช่องค้นหาที่ส่งด้วย GET เพื่อให้ทำงานได้โดยไม่ต้องมี JavaScript", () => {
    const html = renderToStaticMarkup(<SearchResults query="" />);
    expect(html).toContain('method="get"');
    expect(html).toContain('action="/search"');
    expect(html).toContain('name="q"');
  });
});
```

- [ ] **Step 6: รันให้เห็นว่าพัง**

Run: `npx vitest run src/components/guide/search-results.test.tsx`
Expected: FAIL — `Cannot find module './search-results'`

- [ ] **Step 7: เขียนหน้าจอ**

`src/components/guide/search-results.tsx`

```tsx
import Link from "next/link";
import { searchPlants, type SearchHit } from "@/lib/manual/search";

function hrefOf(hit: SearchHit): string {
  return hit.kind === "species" ? `/guide/${hit.slug}` : `/form/${hit.formId}`;
}

const kindNote: Record<SearchHit["kind"], string> = {
  species: "มีคู่มือเฉพาะของต้นนี้",
  genus: "ยังไม่มีคู่มือเฉพาะ ใช้คู่มือระดับทรงของสกุลนี้",
  form: "คู่มือระดับทรง",
};

export function SearchResults({ query }: { query: string }) {
  const hits = searchPlants(query);
  const searched = query.trim().length > 0;

  return (
    <>
      <h1 className="pl-h1">ค้นหาคู่มือ</h1>
      <form method="get" action="/search" style={{ margin: "18px 0 24px", display: "flex", gap: "10px" }}>
        <input
          className="pl-input"
          type="search"
          name="q"
          defaultValue={query}
          placeholder="ชื่อต้น เช่น พิงค์ปริ๊นเซส"
          aria-label="ชื่อต้นที่ต้องการค้นหา"
        />
        <button className="pl-button" type="submit">ค้นหา</button>
      </form>

      {!searched ? (
        <p className="pl-lede">
          ลองพิมพ์ชื่อที่คุณเรียกต้นนั้น จะเป็นชื่อไทยหรือชื่อวิทยาศาสตร์ก็ได้
          ถ้าไม่รู้ชื่อ ใช้ <Link className="pl-link" href="/find">การไล่ดูจากลักษณะต้น</Link> แทนได้
        </p>
      ) : hits.length > 0 ? (
        <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "14px" }}>
          {hits.map((hit) => (
            <li key={`${hit.kind}-${hit.title}`}>
              <Link
                className="pl-card pl-link"
                href={hrefOf(hit)}
                style={{ display: "block", color: "inherit", textDecoration: "none" }}
              >
                <p className="pl-h2">{hit.title}</p>
                <p className="pl-meta" style={{ fontStyle: "italic", marginTop: "2px" }}>{hit.subtitle}</p>
                <p className="pl-lede" style={{ marginTop: "8px" }}>{kindNote[hit.kind]}</p>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <div className="pl-card" style={{ background: "var(--pl-sunk)" }}>
          <p className="pl-h2">ยังไม่มีคู่มือของต้นนี้</p>
          <p className="pl-lede" style={{ marginTop: "8px" }}>
            เราไม่เดาให้ เพราะตำแหน่งตัดของแต่ละทรงต่างกันจริง ๆ และตัดผิดตำแหน่งต้นจะไม่ขึ้น
            แต่ถ้าคุณบอกลักษณะต้นได้ เราหาทรงให้ได้
          </p>
          <p style={{ marginTop: "14px" }}>
            <Link className="pl-link" href="/find">ไล่ดูจากลักษณะต้นแทน</Link>
          </p>
        </div>
      )}
    </>
  );
}
```

- [ ] **Step 8: เพิ่ม CSS ของช่องค้นหา**

ต่อท้าย `src/app/guide.css`

```css
.pl-input {
  flex: 1;
  min-width: 0;
  padding: 10px 14px;
  border: 1px solid var(--pl-line-soft);
  border-radius: 10px;
  background: var(--pl-card);
  color: var(--pl-ink);
  font: inherit;
  font-size: 16px;
}

.pl-input:focus-visible {
  outline: 2px solid var(--pl-leaf);
  outline-offset: 1px;
}

.pl-button {
  padding: 10px 18px;
  border: 1px solid var(--pl-line-soft);
  border-radius: 10px;
  background: var(--pl-leaf);
  color: #ffffff;
  font: inherit;
  font-weight: 700;
  cursor: pointer;
}
```

- [ ] **Step 9: เขียนหน้า**

`src/app/search/page.tsx`

```tsx
import { GuideShell } from "@/components/guide/guide-shell";
import { SearchResults } from "@/components/guide/search-results";
import { ThemeToggle } from "@/components/guide/theme-toggle";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[] }>;
}) {
  const { q } = await searchParams;
  const query = Array.isArray(q) ? (q[0] ?? "") : (q ?? "");

  return (
    <GuideShell action={<ThemeToggle />}>
      <SearchResults query={query} />
    </GuideShell>
  );
}
```

- [ ] **Step 10: ลบ PlantPicker ที่ไม่มีใครใช้แล้ว**

```bash
git rm src/components/guide/plant-picker.tsx src/components/guide/plant-picker.test.tsx
```

ถ้ามีไฟล์อื่น import `PlantPicker` อยู่ `npx tsc --noEmit` จะชี้ให้เห็น ให้แก้ที่นั่น

- [ ] **Step 11: รันทั้งชุดและ build**

Run: `npm test && npm run lint && npm run build`
Expected: PASS ทั้งหมด

- [ ] **Step 12: Commit**

```bash
git add -A
git commit -m "feat: add search with an honest not-found path"
```

---

### Task 6: หน้าเริ่มต้นสำหรับคนที่ยังไม่มีต้น

**Files:**
- Create: `src/components/guide/start-list.tsx`
- Create: `src/components/guide/start-list.test.tsx`
- Create: `src/app/start/page.tsx`

**Interfaces:**
- Consumes: `growthForms` จาก `@/lib/manual/forms/registry`
- Produces: `<StartList />` — ไม่รับ prop เพราะอ่านทะเบียนทรงตรง ๆ

- [ ] **Step 1: เขียนเทสต์ที่ยังไม่ผ่าน**

`src/components/guide/start-list.test.tsx`

```tsx
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { growthForms } from "@/lib/manual/forms/registry";
import { StartList } from "./start-list";

const html = renderToStaticMarkup(<StartList />);

describe("หน้าเริ่มต้นสำหรับคนที่ยังไม่มีต้น", () => {
  it("แสดงทุกทรงที่มีอยู่จริง", () => {
    for (const form of growthForms) expect(html).toContain(form.label);
  });

  it("บอกเหตุผลของความยาก ไม่ใช่แค่ระดับลอย ๆ", () => {
    for (const form of growthForms) expect(html).toContain(form.whyThisDifficulty);
  });

  it("ลิงก์ไปหน้าทรง", () => {
    for (const form of growthForms) expect(html).toContain(`href="/form/${form.id}"`);
  });

  it("บอกว่าตอนนี้ยังมีทรงไม่ครบ", () => {
    expect(html).toContain("ยังไม่ครบ");
  });
});
```

- [ ] **Step 2: รันให้เห็นว่าพัง**

Run: `npx vitest run src/components/guide/start-list.test.tsx`
Expected: FAIL — `Cannot find module './start-list'`

- [ ] **Step 3: เขียน implementation**

`src/components/guide/start-list.tsx`

```tsx
import Link from "next/link";
import { growthForms } from "@/lib/manual/forms/registry";

const difficultyLabel: Record<1 | 2 | 3, string> = {
  1: "ง่ายสุดสำหรับมือใหม่",
  2: "ปานกลาง",
  3: "ยาก ควรผ่านทรงง่ายมาก่อน",
};

export function StartList() {
  const sorted = [...growthForms].sort((a, b) => a.beginnerDifficulty - b.beginnerDifficulty);

  return (
    <>
      <h1 className="pl-h1">เริ่มจากต้นแบบไหนดี</h1>
      <p className="pl-lede" style={{ marginBottom: "20px" }}>
        ความยากไม่ได้อยู่ที่ชนิดพืช แต่อยู่ที่ทรงของมัน เพราะทรงเป็นตัวกำหนดว่าหาจุดตัดยากแค่ไหน
      </p>

      <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "14px" }}>
        {sorted.map((form) => (
          <li key={form.id}>
            <Link
              className="pl-card pl-link"
              href={`/form/${form.id}`}
              style={{ display: "block", color: "inherit", textDecoration: "none" }}
            >
              <p className="pl-mono">{difficultyLabel[form.beginnerDifficulty]}</p>
              <p className="pl-h2" style={{ marginTop: "4px" }}>{form.label}</p>
              <p className="pl-lede" style={{ marginTop: "6px" }}>{form.whyThisDifficulty}</p>
            </Link>
          </li>
        ))}
      </ul>

      <p className="pl-meta" style={{ marginTop: "22px" }}>
        รายการนี้ยังไม่ครบทุกทรง เรากำลังทยอยเขียนเพิ่ม ถ้ามีต้นอยู่แล้วและไม่รู้ว่าทรงไหน
        ลอง <Link className="pl-link" href="/find">ไล่ดูจากลักษณะต้น</Link>
      </p>
    </>
  );
}
```

- [ ] **Step 4: เขียนหน้า**

`src/app/start/page.tsx`

```tsx
import { GuideShell } from "@/components/guide/guide-shell";
import { StartList } from "@/components/guide/start-list";
import { ThemeToggle } from "@/components/guide/theme-toggle";

export default function StartPage() {
  return (
    <GuideShell action={<ThemeToggle />}>
      <StartList />
    </GuideShell>
  );
}
```

- [ ] **Step 5: รันทั้งชุดและ build**

Run: `npm test && npm run lint && npm run build`
Expected: PASS ทั้งหมด

- [ ] **Step 6: Commit**

```bash
git add src/components/guide/start-list.tsx src/components/guide/start-list.test.tsx src/app/start/page.tsx
git commit -m "feat: add beginner start page ordered by growth form difficulty"
```

---

### Task 7: เข้าจากอาการ

**Files:**
- Create: `src/components/guide/problem-list.tsx`
- Create: `src/components/guide/problem-list.test.tsx`
- Create: `src/app/problem/page.tsx`

**Interfaces:**
- Consumes: `troubleshootingEntries` จาก `@/lib/manual/troubleshooting` · `EvidenceBadge` จาก `./evidence-badge`
- Produces: `<ProblemList selected={string | undefined} />`

- [ ] **Step 1: เขียนเทสต์ที่ยังไม่ผ่าน**

`src/components/guide/problem-list.test.tsx`

```tsx
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { troubleshootingEntries } from "@/lib/manual/troubleshooting";
import { ProblemList } from "./problem-list";

describe("การเข้าจากอาการ", () => {
  it("ยังไม่เลือกอาการ แสดงอาการทั้งหมดให้เลือก", () => {
    const html = renderToStaticMarkup(<ProblemList selected={undefined} />);
    for (const entry of Object.values(troubleshootingEntries)) {
      expect(html, `ไม่มีอาการ ${entry.id}`).toContain(entry.symptom);
    }
  });

  it("เลือกอาการแล้ว แสดงสาเหตุและสิ่งที่ต้องทำ", () => {
    const entry = troubleshootingEntries["browning-phenolic"];
    const html = renderToStaticMarkup(<ProblemList selected="browning-phenolic" />);
    expect(html).toContain(entry.likelyCause);
    for (const action of entry.actions) expect(html).toContain(action);
  });

  it("แสดงวิธีแยกจากอาการที่หน้าตาคล้ายกัน เพราะแก้คนละทาง", () => {
    const html = renderToStaticMarkup(<ProblemList selected="browning-phenolic" />);
    expect(html).toContain(troubleshootingEntries["browning-phenolic"].distinguish!);
  });

  it("แสดงระดับหลักฐานของวิธีแก้", () => {
    const html = renderToStaticMarkup(<ProblemList selected="browning-phenolic" />);
    expect(html).toContain("ระดับหลักฐาน");
  });

  it("อาการที่ไม่มีอยู่ ไม่พัง และพากลับไปเลือกใหม่", () => {
    const html = renderToStaticMarkup(<ProblemList selected="ไม่มีอาการนี้" />);
    expect(html).toContain('href="/problem"');
  });
});
```

- [ ] **Step 2: รันให้เห็นว่าพัง**

Run: `npx vitest run src/components/guide/problem-list.test.tsx`
Expected: FAIL — `Cannot find module './problem-list'`

- [ ] **Step 3: เขียน implementation**

`src/components/guide/problem-list.tsx`

```tsx
import Link from "next/link";
import { troubleshootingEntries } from "@/lib/manual/troubleshooting";
import { EvidenceBadge } from "./evidence-badge";

export function ProblemList({ selected }: { selected: string | undefined }) {
  const entry = selected ? troubleshootingEntries[selected] : undefined;

  if (!entry) {
    return (
      <>
        <h1 className="pl-h1">ตอนนี้เห็นอาการอะไร</h1>
        <p className="pl-lede" style={{ marginBottom: "20px" }}>
          เลือกอาการที่ตรงกับที่เห็นในขวดมากที่สุด อาการบางคู่หน้าตาคล้ายกันแต่แก้คนละทาง
          เราจะช่วยแยกให้หลังจากเลือกแล้ว
        </p>
        {selected ? (
          <p className="pl-meta" style={{ marginBottom: "16px" }}>ไม่พบอาการที่เลือกไว้ ลองเลือกใหม่จากรายการนี้</p>
        ) : null}
        <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "14px" }}>
          {Object.values(troubleshootingEntries).map((item) => (
            <li key={item.id}>
              <Link
                className="pl-card pl-link"
                href={`/problem?symptom=${item.id}`}
                style={{ display: "block", color: "inherit", textDecoration: "none" }}
              >
                <p className="pl-lede">{item.symptom}</p>
              </Link>
            </li>
          ))}
        </ul>
        <p className="pl-meta" style={{ marginTop: "22px" }}>
          <Link className="pl-link" href="/problem">เริ่มเลือกใหม่</Link> · <Link className="pl-link" href="/">กลับหน้าแรก</Link>
        </p>
      </>
    );
  }

  return (
    <>
      <h1 className="pl-h1">{entry.symptom}</h1>

      <div className="pl-card" style={{ marginTop: "18px" }}>
        <p className="pl-h2">น่าจะเกิดจาก</p>
        <p className="pl-lede" style={{ marginTop: "8px" }}>{entry.likelyCause}</p>
      </div>

      {entry.distinguish ? (
        <div className="pl-card" style={{ marginTop: "14px", background: "var(--pl-sunk)" }}>
          <p className="pl-h2">แยกจากอาการที่คล้ายกันยังไง</p>
          <p className="pl-lede" style={{ marginTop: "8px" }}>{entry.distinguish}</p>
        </div>
      ) : null}

      <h2 className="pl-h2" style={{ marginTop: "26px" }}>สิ่งที่ต้องทำ</h2>
      <ol style={{ margin: "12px 0 0", paddingLeft: "22px", display: "flex", flexDirection: "column", gap: "10px" }}>
        {entry.actions.map((action) => (
          <li className="pl-lede" key={action}>{action}</li>
        ))}
      </ol>

      <p style={{ marginTop: "18px" }}>
        <EvidenceBadge level={entry.evidence.level} />
      </p>
      {entry.evidence.note ? <p className="pl-meta" style={{ marginTop: "8px" }}>{entry.evidence.note}</p> : null}

      <p className="pl-meta" style={{ marginTop: "22px" }}>
        ไม่ตรงกับที่เห็น? <Link className="pl-link" href="/problem">เลือกอาการใหม่</Link>
      </p>
    </>
  );
}
```

- [ ] **Step 4: เขียนหน้า**

`src/app/problem/page.tsx`

```tsx
import { GuideShell } from "@/components/guide/guide-shell";
import { ProblemList } from "@/components/guide/problem-list";
import { ThemeToggle } from "@/components/guide/theme-toggle";

export default async function ProblemPage({
  searchParams,
}: {
  searchParams: Promise<{ symptom?: string | string[] }>;
}) {
  const { symptom } = await searchParams;
  const selected = Array.isArray(symptom) ? symptom[0] : symptom;

  return (
    <GuideShell action={<ThemeToggle />}>
      <ProblemList selected={selected} />
    </GuideShell>
  );
}
```

- [ ] **Step 5: รันทั้งชุดและ build**

Run: `npm test && npm run lint && npm run build`
Expected: PASS ทั้งหมด

- [ ] **Step 6: Commit**

```bash
git add src/components/guide/problem-list.tsx src/components/guide/problem-list.test.tsx src/app/problem/page.tsx
git commit -m "feat: add symptom-first troubleshooting entry point"
```

---

### Task 8: เมนูนำทางให้ตรงกับเส้นทางใหม่

**Files:**
- Modify: `src/components/nav/nav-items.ts`
- Test: `src/components/nav/primary-nav.test.tsx`

**Interfaces:**
- Consumes: ไม่มี
- Produces: `navLinkItems: NavItem[]` ที่ยังใช้ชนิดเดิม `{ key, label, href }`

- [ ] **Step 1: อ่านเทสต์ที่มีอยู่ก่อนแก้**

Run: `cat src/components/nav/primary-nav.test.tsx`
เพื่อดูว่าเทสต์เดิมยึดกับรายการเมนูอย่างไร **ห้ามลดความเข้มของเทสต์เดิม**

- [ ] **Step 2: เขียนเทสต์ที่ยังไม่ผ่าน**

เพิ่มใน `src/components/nav/primary-nav.test.tsx`

```tsx
  it("เมนูพาไปประตูที่ใช้บ่อย ไม่ใช่แค่หน้าแรก", () => {
    const html = renderToStaticMarkup(<PrimaryNav />);
    expect(html).toContain('href="/find"');
    expect(html).toContain('href="/problem"');
  });
```

ถ้าไฟล์เทสต์เดิมใช้ชื่อ import ต่างจาก `PrimaryNav` หรือ `renderToStaticMarkup` ให้ใช้ตามที่ไฟล์นั้นใช้อยู่

- [ ] **Step 3: รันให้เห็นว่าพัง**

Run: `npx vitest run src/components/nav/primary-nav.test.tsx`
Expected: FAIL — ไม่มี `href="/find"`

- [ ] **Step 4: แก้รายการเมนู**

`src/components/nav/nav-items.ts`

```ts
export type NavItem = {
  key: string;
  label: string;
  href: string;
};

/** สี่รายการนี้คือสิ่งที่ผู้ใช้กลับมาใช้ซ้ำบ่อยที่สุด ประตู "ยังไม่มีต้น" กับ "ค้นหา"
 *  ไม่อยู่ในเมนูเพราะใช้ครั้งเดียวตอนเริ่ม แล้วเข้าถึงได้จากหน้าแรกอยู่แล้ว */
export const navLinkItems: NavItem[] = [
  { key: "home", label: "หน้าแรก", href: "/" },
  { key: "find", label: "ต้นนี้ทรงอะไร", href: "/find" },
  { key: "problem", label: "แก้ปัญหา", href: "/problem" },
  { key: "equipment", label: "อุปกรณ์ของฉัน", href: "/my/equipment" },
];
```

- [ ] **Step 5: รันทั้งชุด**

Run: `npm test`
Expected: PASS — ถ้าเทสต์เดิมพังเพราะยึดว่ามีรายการ "รอบเพาะของฉัน" ให้หยุดแล้วถามเจ้าของระบบว่าจะเอารายการนั้นออกจริงหรือไม่ **ห้ามลบเทสต์ทิ้งเอง**

- [ ] **Step 6: lint และ build**

Run: `npm run lint && npm run build`
Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add src/components/nav/nav-items.ts src/components/nav/primary-nav.test.tsx
git commit -m "feat: point primary nav at the new entry points"
```

---

### Task 9: โทนภาพโหมดอ่านและโหมดลงมือ

สเปกส่วนที่ 6 กำหนดสองสำเนียงจาก token ชุดเดียว **ไม่ใช่สอง design system**
โหมดอ่านคือหน้าสาธารณะทั้งหมด โหมดลงมือคือตัวเดินขั้นตอนใน `/my/rounds`

**Files:**
- Modify: `src/app/guide.css`
- Modify: `src/components/rounds/step-runner.tsx`
- Test: `src/components/common/accessibility-contract.test.tsx`

**Interfaces:**
- Consumes: ไม่มี
- Produces: class `pl-do` ที่ครอบตัวเดินขั้นตอน และ class `pl-num` สำหรับตัวเลขที่ต้องอ่านจากระยะไกล

- [ ] **Step 1: ดูสัญญาการเข้าถึงที่มีอยู่**

Run: `cat src/components/common/accessibility-contract.test.tsx`
เพื่อดูว่ามีเกณฑ์คอนทราสต์หรือขนาดตัวอักษรที่บังคับไว้แล้วหรือยัง **ต้องไม่ทำให้เกณฑ์เดิมพัง**

- [ ] **Step 2: ปรับ token และ .pl-card ให้เป็นสำเนียงอ่าน**

`src/app/guide.css` บรรทัด 142–148 แทนที่ `.pl-card` ทั้งบล็อก (เดิมคือเส้น 2.5px กับเงาทึบ 5px)

```css
.pl-card {
  background: var(--pl-card);
  border: 1px solid var(--pl-line-soft);
  border-radius: 14px;
  padding: 18px;
  box-shadow: 0 2px 14px var(--pl-shadow-soft);
}
```

บรรทัด 178–192 แทนที่ `.pl-h1` และ `.pl-h2` ทั้งสองบล็อก โดย**เก็บ property เดิมทุกตัวไว้**
และเพิ่ม `font-family` กับลดน้ำหนักจาก 700 เป็น 600 ส่วน `letter-spacing` ที่เดิมติดลบ
ให้เปลี่ยนเป็นบวกเล็กน้อย เพราะฟอนต์ serif ต้องการช่องไฟมากกว่า sans

```css
.pl-h1 {
  font-family: Georgia, "Times New Roman", serif;
  font-size: clamp(26px, 5vw, 38px);
  font-weight: 600;
  letter-spacing: 0.01em;
  line-height: 1.2;
  margin: 0 0 8px;
  text-wrap: balance;
}

.pl-h2 {
  font-family: Georgia, "Times New Roman", serif;
  font-size: 20px;
  font-weight: 600;
  letter-spacing: 0.01em;
  margin: 0 0 6px;
}
```

- [ ] **Step 3: เพิ่มสำเนียงโหมดลงมือ**

ต่อท้าย `src/app/guide.css`

```css
/* โหมดลงมือ ใช้เฉพาะตัวเดินขั้นตอนที่ผู้ใช้อ่านตอนใส่ถุงมือและมือเปื้อน
   ต่างจากโหมดอ่านแค่คอนทราสต์และขนาดตัวเลข ไม่ใช่ระบบดีไซน์คนละชุด */
.pl-do {
  --pl-line-soft: var(--pl-ink-3);
}

.pl-do .pl-card {
  border-width: 2px;
}

.pl-do .pl-lede {
  font-size: 17px;
  line-height: 1.7;
}

.pl-num {
  display: inline-block;
  font-size: 30px;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.01em;
  line-height: 1.15;
}
```

- [ ] **Step 4: ครอบตัวเดินขั้นตอนด้วย pl-do**

`src/components/rounds/step-runner.tsx` บรรทัด 88 คืน fragment `<>` อยู่ (ตัวเปิดคือ `<OnlineStatus />`)
ให้เปลี่ยน fragment เป็น `div` ที่มี class แทน

```tsx
  return (
    <div className="pl-do">
      <OnlineStatus />
```

และปิดท้ายด้วย `</div>` แทน `</>` ที่ท้าย return เดียวกัน

หมายเหตุ ไฟล์นี้มี `return (` สองแห่ง (บรรทัด 32 และ 88) **แก้เฉพาะแห่งที่สอง**
แห่งแรกเป็นของ component ย่อยคนละตัวในไฟล์เดียวกัน

- [ ] **Step 5: รันทั้งชุด**

Run: `npm test && npm run lint && npm run build`
Expected: PASS ทั้งหมด

- [ ] **Step 6: ตรวจของจริงในเบราว์เซอร์ — บังคับ ห้ามข้าม**

Run: `npm run dev` แล้วเปิดตรวจทุกหน้าใหม่ที่ความกว้าง 360px, 768px และ 1440px

| หน้า | ต้องเห็น |
|---|---|
| `/` | สี่ประตูขนาดเท่ากัน กดได้ทุกอัน |
| `/find` | ตอบคำถามแล้วเดินไปข้อถัดไปได้ ปุ่มถอยกลับใช้ได้ |
| `/find?stem=rosette` | บอกตรง ๆ ว่ายังไม่มีคู่มือของทรงนี้ ไม่ตัน |
| `/form/climbing-vine-visible-node` | การ์ดจุดสังเกตครบ กล่อง "ยังไม่มีภาพ" แสดงอยู่ |
| `/search?q=ปลาทอง` | ไม่แกล้งมีคำตอบ และมีทางไป `/find` |
| `/start` | เรียงตามความยาก |
| `/problem` แล้วกดอาการหนึ่ง | เห็นสาเหตุ วิธีแยก และสิ่งที่ต้องทำ |
| `/guide/pink-princess/step/4` | คำว่า "ข้อ" แตะแล้วกางคำอธิบายได้ และไม่ทำให้บรรทัดเพี้ยน |
| `/my/rounds/<id>/step/1` | คอนทราสต์สูงกว่าหน้าสาธารณะ |

ตรวจทั้งโหมดสว่างและโหมดมืด **บันทึกผลลง `handoff.md` ตามธรรมเนียมของโปรเจกต์**

`npm run ui:verify` เดิมอ้างอิงเส้นทางและ class ของ UI รุ่นก่อน ให้รันดูแล้วบันทึกไว้ว่าพังตรงไหน
แต่**อย่าเพิ่งแก้ในรอบนี้** ให้เขียนเป็นรายการค้างไว้ใน `handoff.md`

- [ ] **Step 7: Commit**

```bash
git add src/app/guide.css src/components/rounds/step-runner.tsx handoff.md
git commit -m "feat: split reading and doing voices from one token set"
```

---

### Task 10: อัปเดตเอกสารระบบ

**Files:**
- Modify: `project_summary.md`

**Interfaces:**
- Consumes: ผลของ Task 1–9
- Produces: ไม่มีโค้ด

- [ ] **Step 1: แก้ตารางเส้นทางในส่วนที่ 2**

แทนที่ตารางโซนสาธารณะด้วย

```markdown
| เส้นทาง | หน้าที่ |
|---|---|
| `/` | สี่ประตูตามสถานะตั้งต้นของผู้ใช้ |
| `/find` | ไล่คำถามจากลักษณะต้นเพื่อหาทรง ขับด้วย query string |
| `/form/<formId>` | หน้าทรง จุดสังเกตที่ต้องหา และตำแหน่งตัด |
| `/search?q=` | ค้นชนิด สกุล และทรง พร้อมทางออกเมื่อค้นไม่เจอ |
| `/start` | ทรงเรียงตามความยากสำหรับมือใหม่ |
| `/problem?symptom=` | เข้าจากอาการที่เห็น |
| `/guide/<slug>` | แผนที่ขั้นของพืชนั้น พร้อมระดับหลักฐานรายขั้น |
| `/guide/<slug>/step/<n>` | เนื้อหาขั้นเดียว พร้อมคำศัพท์ที่แตะดูความหมายได้ |
```

- [ ] **Step 2: เพิ่มส่วนใหม่ท้ายไฟล์**

```markdown
## 15 · ประตูและหน้าทรง (เพิ่ม 5 สิงหาคม 2026)

เฟส 1 ของ redesign รอบสอง เปิดหน้าจอที่ใช้ชั้นทรงจากเฟส 0

**ทุก flow ขับด้วย URL ไม่ใช่ state ในเบราว์เซอร์** `/find?stem=vine&node=visible` และ
`/search?q=` และ `/problem?symptom=` ทำให้ทุกหน้ายังเป็น Server Component ล้วน
ทดสอบด้วย `renderToStaticMarkup` ได้ และใช้งานได้แม้ JavaScript ไม่ทำงาน
**ไม่มี client component ใหม่ในเฟสนี้เลย**

**คำอธิบายศัพท์ใช้ `<details>` ของ HTML** ไม่ใช่ overlay ที่ต้องใช้ JS ด้วยเหตุผลเดียวกัน
ข้อจำกัดที่ตามมาคือ `<details>` ซ้อนใน `<a>` ไม่ได้ตามมาตรฐาน HTML ดังนั้นการ์ดที่ทั้งใบเป็นลิงก์
(เช่นใน `step-map.tsx`) จึงใช้ `plainText` ส่วน `RichText` ใช้ที่หน้าขั้นเดียวซึ่งไม่ได้อยู่ในลิงก์

**เส้นทางที่ยังไม่มีของ ต้องบอกตรง ๆ** `finder.ts` มีธง `planned` สำหรับทรงที่อยู่ในแผนแต่ยังไม่ได้เขียน
หน้าจอจะบอกว่ายังไม่มีคู่มือของทรงนั้น แทนที่จะซ่อนตัวเลือกจนผู้ใช้คิดว่าต้นของตัวเองไม่มีในระบบ
และแทนที่จะยกคู่มือของทรงอื่นมาให้

**สองสำเนียงจาก token ชุดเดียว** โหมดอ่านคือค่าตั้งต้น โหมดลงมือคือ `.pl-do`
ที่ครอบตัวเดินขั้นตอน ต่างกันแค่คอนทราสต์และขนาดตัวเลข
```

- [ ] **Step 3: แก้บรรทัดสถานะบนหัวไฟล์**

เปลี่ยนจำนวนเทสต์ให้ตรงกับผลจริงจาก `npm test`

- [ ] **Step 4: รันทั้งชุดครั้งสุดท้าย**

Run: `npm test && npm run lint && npm run build`
Expected: PASS ทั้งหมด

- [ ] **Step 5: Commit**

```bash
git add project_summary.md
git commit -m "docs: document the doors, the form page and the two voices"
```
