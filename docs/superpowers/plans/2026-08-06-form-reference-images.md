# เฟส 3a · ภาพอ้างอิงของทรง — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** ทำให้หน้าทรงแสดงภาพต้นจริงพร้อมหมุดชี้จุดสังเกต และให้เจ้าของระบบปักหมุดได้โดยไม่ต้องเดาพิกัด

**Architecture:** ภาพเป็นไฟล์ static ใน `public/forms/` ผูกกับทรงผ่านออบเจกต์ `FormImage` ที่พกเครดิตและใบอนุญาตมาด้วย หมุดวางด้วยเปอร์เซ็นต์จึงไม่ต้องใช้ JavaScript ส่วนภาพซูมของแต่ละการ์ดคำนวณจากภาพใบเดียวกันด้วยฟังก์ชันบริสุทธิ์ เครื่องมือปักหมุดเป็น client component ตัวเดียวในโซน admin

**Tech Stack:** TypeScript · Next.js 16.2.11 · React 19.2.4 · Vitest 4 (ไม่มี jsdom) · sharp (มีอยู่แล้วใน dependencies ใช้สร้างภาพชั่วคราวตอน QA เท่านั้น)

## Global Constraints

- อ่านคู่มือ Next.js ใน `node_modules/next/dist/docs/` ก่อนเขียนโค้ดที่แตะ Next API ตาม `AGENTS.md`
- เทสต์ component ใช้ `renderToStaticMarkup` เท่านั้น ไม่มี jsdom ไม่มี testing-library
- **หน้าสาธารณะทุกหน้ายังเป็น Server Component ล้วน** client component ใหม่อนุญาตเฉพาะใน `/admin` และต้องเขียนเหตุผลกำกับในไฟล์
- ข้อความในโค้ดและคอมเมนต์เป็นภาษาไทย ตามธรรมเนียมไฟล์เดิม
- ห้ามแก้เทสต์ที่มีอยู่เพื่อให้ผ่าน
- CSS ใหม่อยู่ใน `src/app/guide.css` ใช้ token ขึ้นต้น `--pl-` และ class ขึ้นต้น `pl-` ห้ามแตะ `globals.css`
- **ห้าม commit ภาพปลอมเป็นภาพอ้างอิงของทรง** ภาพที่ผู้ใช้เห็นต้องเป็นภาพต้นจริงที่เจ้าของระบบถ่ายเท่านั้น
  งานโค้ดทั้งหมดทดสอบได้โดยไม่ต้องมีไฟล์ภาพจริง ดู Task 3
- ใบอนุญาตของภาพต้องเป็น `"CC BY-SA 4.0"` เท่านั้น
- ทุก task จบด้วย `npm test && npm run lint && npm run build` ผ่าน แล้วจึง commit
- อ้างอิงสเปก: `docs/superpowers/specs/2026-08-06-form-reference-images-design.md`

## ลำดับที่แนะนำ

**ควรรอให้ PR #19 (เฟส 2 · เนื้อหาแปดทรง) merge เข้า master ก่อน** ไม่ใช่เพราะโค้ดชนกัน
(3a แตะ `forms/types.ts`, `forms/registry.test.ts`, `form-detail.tsx` ซึ่ง PR #19 ไม่ได้แตะ)
แต่เพราะการตรวจของจริงจะมีความหมายกว่าเมื่อมีแปดทรงให้เลือกใน `/admin/pin`
ถ้าเริ่มก่อน จะมีทรงเดียวให้ทดสอบ

## File Structure

| ไฟล์ | หน้าที่ |
|---|---|
| `src/lib/manual/forms/types.ts` | **แก้** เพิ่ม `FormImage` และเปลี่ยน `referenceImageId` เป็น `referenceImage` |
| `src/lib/manual/forms/crop.ts` | **ใหม่** `cropStyle` คำนวณ background ของภาพซูม |
| `src/lib/manual/forms/crop.test.ts` | **ใหม่** |
| `src/lib/manual/forms/images.test.ts` | **ใหม่** กฎของไฟล์ภาพและเครดิต |
| `src/lib/manual/forms/registry.test.ts` | **แก้** กฎพิกัดเปลี่ยนไปตรวจฟิลด์ใหม่ |
| `src/components/guide/form-detail.tsx` | **แก้** แสดงภาพ หมุด และภาพซูมในการ์ด |
| `src/components/guide/form-detail.test.tsx` | **แก้** |
| `src/app/guide.css` | **แก้** สไตล์หมุดและช่องซูม |
| `src/components/admin/pin-picker.tsx` | **ใหม่** client component เดียวของเฟสนี้ |
| `src/app/admin/pin/page.tsx` | **ใหม่** |
| `public/forms/.gitkeep` | **ใหม่** ให้โฟลเดอร์มีอยู่ก่อนมีภาพจริง |

---

### Task 1: สคีมา FormImage

**Files:**
- Modify: `src/lib/manual/forms/types.ts`
- Modify: `src/lib/manual/forms/registry.test.ts`
- Modify: `src/components/guide/form-detail.tsx:19`
- Create: `public/forms/.gitkeep`

**Interfaces:**
- Consumes: ไม่มีจาก task อื่น
- Produces: `FormImage` และ `GrowthForm.referenceImage?: FormImage`

- [ ] **Step 1: เขียนเทสต์ที่ยังไม่ผ่าน**

แทนที่เทสต์ `"มีพิกัดได้เมื่อมีภาพอ้างอิงเท่านั้น"` เดิมใน `src/lib/manual/forms/registry.test.ts`

```ts
  it("มีพิกัดได้เมื่อทรงมีภาพเท่านั้น", () => {
    for (const form of growthForms) {
      if (form.referenceImage) continue;
      for (const landmark of form.landmarks) {
        expect(landmark.point, `${form.id}/${landmark.id} มีพิกัดแต่ทรงยังไม่มีภาพ`).toBeUndefined();
      }
    }
  });
```

- [ ] **Step 2: รันให้เห็นว่าพัง**

Run: `npx tsc --noEmit 2>&1 | grep referenceImage`
Expected: error ว่า `referenceImage` ไม่มีใน `GrowthForm`

หมายเหตุ vitest ไม่ตรวจ type จึงต้องดูที่ `tsc` ไม่ใช่ที่ `npm test`

- [ ] **Step 3: เพิ่มสคีมา**

`src/lib/manual/forms/types.ts` แทนที่บรรทัด `referenceImageId?: string;` ใน `GrowthForm`
ด้วย `referenceImage?: FormImage;` แล้วเพิ่มชนิดใหม่เหนือ `GrowthForm`

```ts
/** ภาพอ้างอิงของทรง เป็นภาพต้นจริงของชนิดหนึ่งที่เป็นตัวแทน ไม่ใช่ภาพของทุกชนิดในทรง
 *  ไฟล์ commit ขึ้น public repo จึงต้องพกเครดิตและใบอนุญาตติดตัวมาด้วยเสมอ */
export type FormImage = {
  /** ชื่อไฟล์ใน public/forms/ เช่น "climbing-vine-visible-node.jpg" */
  file: string;
  /** ชนิดที่อยู่ในภาพจริง ๆ ต้องบอกผู้ใช้ตรง ๆ ตามกฎชั้น D ของ newplant_protocol.md */
  speciesShown: string;
  credit: string;
  license: "CC BY-SA 4.0";
  /** ต้องบรรยายโครงสร้างที่เห็น ไม่ใช่ "ภาพต้นไม้" */
  alt: string;
  /** ใช้กันหน้ากระตุกตอนโหลด และใช้คำนวณภาพซูมใน crop.ts */
  width: number;
  height: number;
};
```

- [ ] **Step 4: แก้จุดที่อ้างชื่อฟิลด์เดิม**

`src/components/guide/form-detail.tsx` บรรทัด 19 เปลี่ยน `form.referenceImageId` เป็น `form.referenceImage`

- [ ] **Step 5: สร้างโฟลเดอร์ภาพ**

```bash
mkdir -p public/forms
printf '' > public/forms/.gitkeep
```

- [ ] **Step 6: ตรวจว่าไม่มี error ใหม่**

Run: `npx tsc --noEmit 2>&1 | grep -v "knowledge-audit-viewer.test\|dataset-exporter.test\|dataset-preprocessing.test\|image-preprocessor.test\|^ "`
Expected: ไม่มีบรรทัดใดพิมพ์ออกมา (สี่ไฟล์ที่กรองออกคือ error ที่มีอยู่ก่อนงานนี้)

- [ ] **Step 7: รันทั้งชุด**

Run: `npm test && npm run lint && npm run build`
Expected: PASS ทั้งหมด

- [ ] **Step 8: Commit**

```bash
git add src/lib/manual/forms/types.ts src/lib/manual/forms/registry.test.ts src/components/guide/form-detail.tsx public/forms/.gitkeep
git commit -m "feat: carry credit and licence on growth form images"
```

---

### Task 2: คำนวณภาพซูม

**Files:**
- Create: `src/lib/manual/forms/crop.ts`
- Create: `src/lib/manual/forms/crop.test.ts`

**Interfaces:**
- Consumes: `FormImage` จาก `./types`
- Produces: `cropStyle(point: { x: number; y: number }, image: Pick<FormImage, "width" | "height">, swatchPx?: number, zoom?: number): { backgroundSize: string; backgroundPosition: string }`
  โดยค่าเริ่มต้น `swatchPx = 72` และ `zoom = 3`

- [ ] **Step 1: เขียนเทสต์ที่ยังไม่ผ่าน**

`src/lib/manual/forms/crop.test.ts`

```ts
import { describe, expect, it } from "vitest";

import { cropStyle } from "./crop";

const square = { width: 1000, height: 1000 };
const wide = { width: 1200, height: 600 };

describe("การครอปภาพซูมของการ์ด", () => {
  it("ภาพถูกขยายเป็นสามเท่าของช่องซูมตามค่าเริ่มต้น", () => {
    expect(cropStyle({ x: 0.5, y: 0.5 }, square).backgroundSize).toBe("216px 216px");
  });

  it("ภาพแนวนอนคงสัดส่วนเดิมไว้ ไม่ยืดบิด", () => {
    expect(cropStyle({ x: 0.5, y: 0.5 }, wide).backgroundSize).toBe("216px 108px");
  });

  it("จุดกึ่งกลางภาพถูกวางไว้กลางช่องซูมพอดี", () => {
    // ช่อง 72px กึ่งกลางอยู่ที่ 36px ภาพกว้าง 216px จุด 0.5 อยู่ที่ 108px จากขอบซ้ายภาพ
    // จึงต้องเลื่อนภาพไปทางซ้าย 108 - 36 = 72px
    expect(cropStyle({ x: 0.5, y: 0.5 }, square).backgroundPosition).toBe("-72px -72px");
  });

  it("จุดที่มุมซ้ายบนก็ยังถูกวางไว้กลางช่อง ไม่ใช่ชิดขอบ", () => {
    // นี่คือเคสที่ background-position แบบเปอร์เซ็นต์ทำผิด
    expect(cropStyle({ x: 0, y: 0 }, square).backgroundPosition).toBe("36px 36px");
  });

  it("จุดที่มุมขวาล่างถูกวางไว้กลางช่องเช่นกัน", () => {
    expect(cropStyle({ x: 1, y: 1 }, square).backgroundPosition).toBe("-180px -180px");
  });

  it("เปลี่ยนขนาดช่องและระดับซูมได้", () => {
    const style = cropStyle({ x: 0.5, y: 0.5 }, square, 100, 2);
    expect(style.backgroundSize).toBe("200px 200px");
    expect(style.backgroundPosition).toBe("-50px -50px");
  });
});
```

- [ ] **Step 2: รันให้เห็นว่าพัง**

Run: `npx vitest run src/lib/manual/forms/crop.test.ts`
Expected: FAIL — `Cannot find module './crop'`

- [ ] **Step 3: เขียน implementation**

`src/lib/manual/forms/crop.ts`

```ts
import type { FormImage } from "./types";

/** คืนค่า background ที่ทำให้จุด point อยู่กลางช่องซูมพอดี
 *
 *  ไม่ใช้ background-position แบบเปอร์เซ็นต์ เพราะเปอร์เซ็นต์ของ CSS จัดให้
 *  จุด p ของภาพไปตรงกับจุด p ของกรอบ ซึ่งไม่ใช่การวางจุดนั้นไว้กลางกรอบ
 *  จุดที่อยู่ริมภาพจะเพี้ยนหนักที่สุด คำนวณเป็นพิกเซลจึงได้ค่าที่ตรงทุกจุด */
export function cropStyle(
  point: { x: number; y: number },
  image: Pick<FormImage, "width" | "height">,
  swatchPx = 72,
  zoom = 3,
): { backgroundSize: string; backgroundPosition: string } {
  const displayedWidth = swatchPx * zoom;
  const displayedHeight = displayedWidth * (image.height / image.width);
  const centre = swatchPx / 2;

  const left = centre - point.x * displayedWidth;
  const top = centre - point.y * displayedHeight;

  return {
    backgroundSize: `${displayedWidth}px ${displayedHeight}px`,
    backgroundPosition: `${left}px ${top}px`,
  };
}
```

- [ ] **Step 4: รันเทสต์**

Run: `npx vitest run src/lib/manual/forms/crop.test.ts`
Expected: PASS ทั้ง 6 ข้อ

- [ ] **Step 5: Commit**

```bash
git add src/lib/manual/forms/crop.ts src/lib/manual/forms/crop.test.ts
git commit -m "feat: compute zoom crop that truly centres on a point"
```

---

### Task 3: กฎของไฟล์ภาพและเครดิต

เทสต์ชุดนี้ตรวจทรงที่ **ประกาศภาพไว้แล้ว** ตอนนี้ยังไม่มีทรงใดประกาศ เทสต์จึงผ่านแบบไม่มีอะไรให้ตรวจ
แต่จะจับทันทีที่เจ้าของระบบเพิ่มภาพจริงใบแรก **ห้ามใส่ภาพปลอมเพื่อให้เทสต์มีของตรวจ**

**Files:**
- Create: `src/lib/manual/forms/images.test.ts`

**Interfaces:**
- Consumes: `growthForms` จาก `./registry`
- Produces: ไม่มี API ใหม่

- [ ] **Step 1: เขียนเทสต์**

`src/lib/manual/forms/images.test.ts`

```ts
import { existsSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { growthForms } from "./registry";

const imagesDir = join(process.cwd(), "public", "forms");

/** ทรงที่ประกาศภาพไว้แล้วเท่านั้น ทรงที่ยังไม่มีภาพไม่ผิดกฎข้อใด */
const withImage = growthForms.flatMap((form) =>
  form.referenceImage ? [{ form, image: form.referenceImage }] : [],
);

describe("กฎของภาพอ้างอิงของทรง", () => {
  it("ทุกไฟล์ที่อ้างต้องมีอยู่จริงใน public/forms", () => {
    for (const { form, image } of withImage) {
      expect(existsSync(join(imagesDir, image.file)), `${form.id} อ้างไฟล์ ${image.file} ที่ไม่มีอยู่`).toBe(true);
    }
  });

  it("คำบรรยายภาพต้องยาวพอที่จะบรรยายโครงสร้างได้จริง", () => {
    for (const { form, image } of withImage) {
      expect(image.alt.trim().length, `${form.id} มี alt สั้นเกินกว่าจะช่วยคนที่มองไม่เห็นภาพ`).toBeGreaterThan(20);
    }
  });

  it("ต้องบอกชนิดที่อยู่ในภาพและคนถ่ายเสมอ", () => {
    for (const { form, image } of withImage) {
      expect(image.speciesShown.trim().length, `${form.id} ไม่บอกชนิดที่อยู่ในภาพ`).toBeGreaterThan(0);
      expect(image.credit.trim().length, `${form.id} ไม่บอกคนถ่าย`).toBeGreaterThan(0);
    }
  });

  it("ใบอนุญาตต้องเป็น CC BY-SA 4.0 เท่านั้น", () => {
    for (const { form, image } of withImage) {
      expect(image.license, `${form.id} ใช้ใบอนุญาตอื่น`).toBe("CC BY-SA 4.0");
    }
  });

  it("ขนาดภาพต้องเป็นบวก เพราะใช้คำนวณภาพซูม", () => {
    for (const { form, image } of withImage) {
      expect(image.width, `${form.id} ความกว้างไม่ถูกต้อง`).toBeGreaterThan(0);
      expect(image.height, `${form.id} ความสูงไม่ถูกต้อง`).toBeGreaterThan(0);
    }
  });

  it("ภาพต้องไม่กว้างเกิน 1400 px และไฟล์ต้องไม่เกิน 250 KB", () => {
    // ข้อจำกัดนี้อยู่ในสเปกส่วนที่ 5 ถ้าไม่บังคับด้วยเทสต์ ไฟล์จากกล้องมือถือ
    // ขนาดหลายเมกะไบต์จะหลุดเข้า repo โดยไม่มีใครทักท้วง
    for (const { form, image } of withImage) {
      expect(image.width, `${form.id} ภาพกว้างเกิน 1400 px`).toBeLessThanOrEqual(1400);
      const bytes = statSync(join(imagesDir, image.file)).size;
      expect(bytes, `${form.id} ไฟล์ใหญ่ ${Math.round(bytes / 1024)} KB เกิน 250 KB`).toBeLessThanOrEqual(
        250 * 1024,
      );
    }
  });

  it("พิกัดของทุกจุดสังเกตต้องอยู่ในช่วง 0 ถึง 1", () => {
    for (const { form } of withImage) {
      for (const landmark of form.landmarks) {
        if (!landmark.point) continue;
        expect(landmark.point.x, `${form.id}/${landmark.id} x หลุดกรอบ`).toBeGreaterThanOrEqual(0);
        expect(landmark.point.x, `${form.id}/${landmark.id} x หลุดกรอบ`).toBeLessThanOrEqual(1);
        expect(landmark.point.y, `${form.id}/${landmark.id} y หลุดกรอบ`).toBeGreaterThanOrEqual(0);
        expect(landmark.point.y, `${form.id}/${landmark.id} y หลุดกรอบ`).toBeLessThanOrEqual(1);
      }
    }
  });
});
```

- [ ] **Step 2: รันเทสต์**

Run: `npx vitest run src/lib/manual/forms/images.test.ts`
Expected: PASS ทั้ง 6 ข้อ แบบไม่มีข้อมูลให้ตรวจ เพราะยังไม่มีทรงใดประกาศภาพ

- [ ] **Step 3: พิสูจน์ว่าเทสต์จับของผิดได้จริง**

เพิ่มชั่วคราวใน `src/lib/manual/forms/climbing-vine-visible-node.ts` ใต้ `plainDescription`

```ts
  referenceImage: {
    file: "ไม่มีไฟล์นี้.jpg",
    speciesShown: "ทดสอบ",
    credit: "ทดสอบ",
    license: "CC BY-SA 4.0",
    alt: "สั้น",
    width: 1000,
    height: 1000,
  },
```

Run: `npx vitest run src/lib/manual/forms/images.test.ts`
Expected: FAIL สองข้อ คือไฟล์ไม่มีอยู่ และ alt สั้นเกินไป

**จากนั้นลบบล็อกที่เพิ่งเพิ่มออกให้หมด** แล้วรันซ้ำให้ผ่าน

- [ ] **Step 4: Commit**

```bash
git add src/lib/manual/forms/images.test.ts
git commit -m "test: enforce image credit, licence and alt text rules"
```

---

### Task 4: หน้าทรงแสดงภาพและหมุด

**Files:**
- Modify: `src/components/guide/form-detail.tsx`
- Modify: `src/components/guide/form-detail.test.tsx`
- Modify: `src/app/guide.css`

**Interfaces:**
- Consumes: `cropStyle` จาก `@/lib/manual/forms/crop` · `FormImage` จาก `@/lib/manual/forms/types`
- Produces: ไม่มี API ใหม่ `FormDetail` ยังรับ props เดิม

- [ ] **Step 1: เขียนเทสต์ที่ยังไม่ผ่าน**

เพิ่ม import ที่**หัวไฟล์** `src/components/guide/form-detail.test.tsx` ก่อน แล้วจึงเพิ่ม describe ใหม่ท้ายไฟล์

```tsx
import type { GrowthForm } from "@/lib/manual/forms/types";
```

ท้ายไฟล์

```tsx
const withPhoto: GrowthForm = {
  ...climbingVineVisibleNode,
  referenceImage: {
    file: "demo.jpg",
    speciesShown: "Philodendron hederaceum",
    credit: "เจ้าของระบบ",
    license: "CC BY-SA 4.0",
    alt: "ลำต้นเลื้อยที่เห็นวงนูนของข้อเป็นระยะ พร้อมรากอากาศงอกจากข้อ",
    width: 1200,
    height: 900,
  },
  landmarks: climbingVineVisibleNode.landmarks.map((landmark, index) =>
    index === 0 ? { ...landmark, point: { x: 0.4, y: 0.3 } } : landmark,
  ),
};

describe("หน้าทรงที่มีภาพ", () => {
  const html = renderToStaticMarkup(<FormDetail form={withPhoto} plants={[]} />);

  it("แสดงภาพพร้อมคำบรรยายสำหรับคนที่มองไม่เห็นภาพ", () => {
    expect(html).toContain('src="/forms/demo.jpg"');
    expect(html).toContain("ลำต้นเลื้อยที่เห็นวงนูนของข้อเป็นระยะ");
  });

  it("บอกชนิดที่อยู่ในภาพ คนถ่าย และใบอนุญาต", () => {
    expect(html).toContain("Philodendron hederaceum");
    expect(html).toContain("เจ้าของระบบ");
    expect(html).toContain("CC BY-SA 4.0");
  });

  it("บอกตรง ๆ ว่าภาพนี้ไม่ใช่ภาพของทุกชนิดในทรง", () => {
    expect(html).toContain("ไม่ใช่ภาพของทุกชนิดในทรง");
  });

  it("วางหมุดเฉพาะจุดที่มีพิกัด และวางด้วยเปอร์เซ็นต์", () => {
    expect(html).toContain("left:40%");
    expect(html).toContain("top:30%");
  });

  it("ทรงที่มีภาพแล้ว ต้องไม่แสดงกล่องว่ายังไม่มีภาพ", () => {
    expect(html).not.toContain("ยังไม่มีภาพอ้างอิง");
  });

  it("กำหนดขนาดภาพไว้ล่วงหน้าเพื่อไม่ให้หน้ากระตุกตอนโหลด", () => {
    expect(html).toContain('width="1200"');
    expect(html).toContain('height="900"');
  });
});
```

- [ ] **Step 2: รันให้เห็นว่าพัง**

Run: `npx vitest run src/components/guide/form-detail.test.tsx`
Expected: FAIL ทั้งหกข้อของ describe ใหม่

- [ ] **Step 3: เพิ่มการแสดงภาพและหมุด**

`src/components/guide/form-detail.tsx` แทนที่บล็อก `{form.referenceImage ? null : (...)}` ทั้งก้อน

```tsx
      {form.referenceImage ? (
        <figure className="pl-figure">
          <div className="pl-figure-stage">
            {/* ใช้ img ธรรมดาไม่ใช่ next/image เพราะไฟล์เป็น static ที่เรารู้ขนาดแน่นอนอยู่แล้ว
                และหมุดต้องวางทับด้วยเปอร์เซ็นต์บนกล่องเดียวกัน */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`/forms/${form.referenceImage.file}`}
              alt={form.referenceImage.alt}
              width={form.referenceImage.width}
              height={form.referenceImage.height}
            />
            {form.landmarks.map((landmark, index) =>
              landmark.point ? (
                <span
                  key={landmark.id}
                  className="pl-pin"
                  style={{ left: `${landmark.point.x * 100}%`, top: `${landmark.point.y * 100}%` }}
                  aria-hidden="true"
                >
                  {index + 1}
                </span>
              ) : null,
            )}
          </div>
          <figcaption className="pl-meta" style={{ marginTop: "8px" }}>
            ภาพ: {form.referenceImage.speciesShown} · ถ่ายโดย {form.referenceImage.credit} ·{" "}
            {form.referenceImage.license}
            <br />
            ใช้แสดงโครงสร้างของทรงนี้ ไม่ใช่ภาพของทุกชนิดในทรง
          </figcaption>
        </figure>
      ) : (
        <div className="pl-card" style={{ marginTop: "18px", background: "var(--pl-sunk)" }}>
          <p style={{ margin: 0, fontWeight: 700 }}>ทรงนี้ยังไม่มีภาพอ้างอิง</p>
          <p className="pl-lede" style={{ marginTop: "6px" }}>
            ให้ใช้คำอธิบายวิธีหาข้างล่างเทียบกับต้นจริงที่อยู่ตรงหน้าคุณ
            เราไม่เอาภาพวาดมาแทนเพื่อให้ดูเหมือนมี เพราะภาพที่ไม่ตรงต้นทำให้ตัดผิดตำแหน่งได้
          </p>
        </div>
      )}
```

- [ ] **Step 4: ใส่เลขและภาพซูมในการ์ดจุดสังเกต**

ใน `form-detail.tsx` แทนที่ `<li className="pl-card" key={landmark.id}>` และบรรทัดชื่อจุดสังเกต
ด้วยโครงที่มีเลขกำกับและช่องซูม โดยเพิ่ม `index` เข้าไปใน `map`

```tsx
        {form.landmarks.map((landmark, index) => {
          const swatch =
            form.referenceImage && landmark.point
              ? cropStyle(landmark.point, form.referenceImage)
              : null;

          return (
            <li className="pl-card pl-landmark" key={landmark.id}>
              {swatch ? (
                <span
                  className="pl-swatch"
                  style={{
                    backgroundImage: `url(/forms/${form.referenceImage!.file})`,
                    backgroundSize: swatch.backgroundSize,
                    backgroundPosition: swatch.backgroundPosition,
                  }}
                  aria-hidden="true"
                />
              ) : null}
              <div>
                <p className="pl-h2">
                  {form.referenceImage && landmark.point ? `${index + 1} · ` : ""}
                  {landmark.term}
                </p>
                {landmark.aka?.length ? (
                  <p className="pl-meta" style={{ marginTop: "2px" }}>เรียกอีกอย่างว่า {landmark.aka.join(" · ")}</p>
                ) : null}
                <p className="pl-lede" style={{ marginTop: "8px" }}>{landmark.whatItIs}</p>
                <p className="pl-lede" style={{ marginTop: "6px" }}><b>หายังไง</b> {landmark.howToFind}</p>
                {landmark.confusedWith ? (
                  <p className="pl-lede" style={{ marginTop: "6px" }}><b>อย่าสับสน</b> {landmark.confusedWith}</p>
                ) : null}
              </div>
            </li>
          );
        })}
```

และเพิ่ม import ที่หัวไฟล์

```tsx
import { cropStyle } from "@/lib/manual/forms/crop";
```

- [ ] **Step 5: เพิ่ม CSS**

ต่อท้าย `src/app/guide.css`

```css
/* ภาพอ้างอิงของทรง พร้อมหมุดที่วางด้วยเปอร์เซ็นต์จึงสเกลตามภาพเองโดยไม่ต้องใช้ JavaScript */
.pl-figure {
  margin: 18px 0 0;
}

.pl-figure-stage {
  position: relative;
  line-height: 0;
}

.pl-figure-stage img {
  width: 100%;
  height: auto;
  border-radius: 14px;
  border: 1px solid var(--pl-line-soft);
}

.pl-pin {
  position: absolute;
  transform: translate(-50%, -50%);
  min-width: 26px;
  height: 26px;
  padding: 0 6px;
  border-radius: 999px;
  background: var(--pl-leaf);
  color: #ffffff;
  border: 2px solid #ffffff;
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.35);
  font-size: 13px;
  font-weight: 700;
  line-height: 22px;
  text-align: center;
}

.pl-landmark {
  display: flex;
  gap: 14px;
  align-items: flex-start;
}

/* ภาพซูมของจุดนั้น ครอปมาจากภาพใบเดียวกันด้วย cropStyle ไม่ต้องถ่ายเพิ่ม */
.pl-swatch {
  flex: none;
  width: 72px;
  height: 72px;
  border-radius: 10px;
  border: 1px solid var(--pl-line-soft);
  background-repeat: no-repeat;
}
```

- [ ] **Step 6: รันเทสต์**

Run: `npx vitest run src/components/guide/form-detail.test.tsx`
Expected: PASS ทั้งหมด รวมเทสต์เดิมที่ตรวจทรงที่ยังไม่มีภาพ

- [ ] **Step 7: รันทั้งชุด**

Run: `npm test && npm run lint && npm run build`
Expected: PASS ทั้งหมด

- [ ] **Step 8: Commit**

```bash
git add src/components/guide/form-detail.tsx src/components/guide/form-detail.test.tsx src/app/guide.css
git commit -m "feat: show reference photo with landmark pins and zoom swatches"
```

---

### Task 5: เครื่องมือปักหมุด

**Files:**
- Create: `src/components/admin/pin-picker.tsx`
- Create: `src/app/admin/pin/page.tsx`

**Interfaces:**
- Consumes: `growthForms` จาก `@/lib/manual/forms/registry`
- Produces: `<PinPicker forms={PinPickerForm[]} />` โดย
  `PinPickerForm = { id: string; label: string; file: string | null; landmarks: { id: string; term: string }[] }`

- [ ] **Step 1: เขียน client component**

`src/components/admin/pin-picker.tsx`

```tsx
"use client";

// client component ตัวเดียวที่เฟส 3a เพิ่ม และเป็นข้อยกเว้นของกฎในเฟส 1 ที่ห้ามเพิ่ม
// client component ใหม่ เหตุผลคือการรับพิกัดจากการคลิกต้องใช้ JavaScript จริง
// ยกเว้นได้เพราะอยู่ในโซน /admin ซึ่งไม่ใช่หน้าผู้ใช้ หน้าสาธารณะทุกหน้ายังเป็น
// Server Component ล้วนตามเดิม ดูสเปก 2026-08-06-form-reference-images-design.md ส่วนที่ 6

import { useState } from "react";

export type PinPickerForm = {
  id: string;
  label: string;
  /** ชื่อไฟล์ใน public/forms/ หรือ null เมื่อทรงนั้นยังไม่ประกาศภาพ */
  file: string | null;
  landmarks: { id: string; term: string }[];
};

type Picked = { landmarkId: string; x: number; y: number };

export function PinPicker({ forms }: { forms: PinPickerForm[] }) {
  const [formId, setFormId] = useState(forms[0]?.id ?? "");
  const [picked, setPicked] = useState<Picked[]>([]);

  const form = forms.find((item) => item.id === formId) ?? null;

  function handleClick(event: React.MouseEvent<HTMLImageElement>) {
    if (!form) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = Number(((event.clientX - rect.left) / rect.width).toFixed(3));
    const y = Number(((event.clientY - rect.top) / rect.height).toFixed(3));
    const next = form.landmarks[picked.length];
    if (!next) return;
    setPicked([...picked, { landmarkId: next.id, x, y }]);
  }

  const nextLandmark = form?.landmarks[picked.length] ?? null;

  const snippet = picked
    .map((item) => `// ${item.landmarkId}\n  point: { x: ${item.x}, y: ${item.y} },`)
    .join("\n");

  return (
    <main style={{ padding: "32px", fontFamily: "system-ui, sans-serif", maxWidth: "900px" }}>
      <h1>ปักหมุดจุดสังเกตบนภาพของทรง</h1>

      <p>
        <label>
          ทรง{" "}
          <select value={formId} onChange={(event) => { setFormId(event.target.value); setPicked([]); }}>
            {forms.map((item) => (
              <option key={item.id} value={item.id}>{item.label}</option>
            ))}
          </select>
        </label>{" "}
        <button type="button" onClick={() => setPicked([])}>เริ่มปักใหม่</button>
      </p>

      {!form ? null : !form.file ? (
        <p>
          ทรงนี้ยังไม่ประกาศภาพ วางไฟล์ไว้ที่ <code>public/forms/{form.id}.jpg</code> แล้วเพิ่ม
          <code> referenceImage </code> ในไฟล์ทรงก่อน จึงจะปักหมุดได้
        </p>
      ) : (
        <>
          <p>
            {nextLandmark
              ? `คลิกบนภาพเพื่อปักหมุดของ "${nextLandmark.term}"`
              : "ปักครบทุกจุดแล้ว คัดลอกโค้ดข้างล่างไปวางในไฟล์ทรง"}
          </p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`/forms/${form.file}`}
            alt={`ภาพของทรง ${form.label} สำหรับปักหมุด`}
            onClick={handleClick}
            style={{ maxWidth: "100%", cursor: nextLandmark ? "crosshair" : "default" }}
          />
        </>
      )}

      {picked.length > 0 ? (
        <>
          <h2>โค้ดสำหรับคัดลอก</h2>
          <pre style={{ background: "#f4f4f4", padding: "12px", overflowX: "auto" }}>{snippet}</pre>
        </>
      ) : null}
    </main>
  );
}
```

- [ ] **Step 2: เขียนหน้า**

`src/app/admin/pin/page.tsx`

```tsx
import { PinPicker, type PinPickerForm } from "@/components/admin/pin-picker";
import { growthForms } from "@/lib/manual/forms/registry";

export default function AdminPinPage() {
  const forms: PinPickerForm[] = growthForms.map((form) => ({
    id: form.id,
    label: form.label,
    file: form.referenceImage?.file ?? null,
    landmarks: form.landmarks.map((landmark) => ({ id: landmark.id, term: landmark.term })),
  }));

  return <PinPicker forms={forms} />;
}
```

- [ ] **Step 3: รันทั้งชุดและ build**

Run: `npm test && npm run lint && npm run build`
Expected: PASS ทั้งหมด · build แสดงเส้นทาง `/admin/pin`

หน้านี้ไม่มีเทสต์ เพราะเป็น client component ที่มีค่าอยู่ที่การคลิกจริง ซึ่ง `renderToStaticMarkup`
ตรวจไม่ได้ และเป็นเครื่องมือภายในที่ไม่ได้อยู่ในเส้นทางของผู้ใช้ ตรวจด้วยการเปิดใช้จริงใน Task 6 แทน

- [ ] **Step 4: Commit**

```bash
git add src/components/admin/pin-picker.tsx src/app/admin/pin/page.tsx
git commit -m "feat: add admin pin picker for landmark coordinates"
```

---

### Task 6: ตรวจของจริงในเบราว์เซอร์

สามเฟสที่ผ่านมาพบข้อบกพร่องที่เทสต์จับไม่ได้ทุกเฟส ขั้นนี้บังคับ ห้ามข้าม

**Files:**
- Modify: `handoff.md`

**Interfaces:**
- Consumes: ผลของ Task 1–5
- Produces: ไม่มีโค้ด

- [ ] **Step 1: สร้างภาพชั่วคราวสำหรับตรวจ**

ต้องมีไฟล์ภาพจึงจะเห็นหมุดและช่องซูมได้ **ภาพนี้ห้าม commit** ใช้ `sharp` ที่มีอยู่แล้วสร้าง

```bash
node -e "const s=require('sharp');s({create:{width:1200,height:900,channels:3,background:{r:120,g:150,b:90}}}).jpeg().toFile('public/forms/__qa.jpg').then(()=>console.log('ok'))"
```

- [ ] **Step 2: ผูกภาพชั่วคราวกับทรงหนึ่ง**

เพิ่มชั่วคราวใน `src/lib/manual/forms/climbing-vine-visible-node.ts` ใต้ `plainDescription`

```ts
  referenceImage: {
    file: "__qa.jpg",
    speciesShown: "ภาพทดสอบชั่วคราว ไม่ใช่ภาพจริง",
    credit: "ภาพทดสอบ",
    license: "CC BY-SA 4.0",
    alt: "ภาพทดสอบสีเขียวล้วน ใช้ตรวจตำแหน่งหมุดและช่องซูมเท่านั้น",
    width: 1200,
    height: 900,
  },
```

และเพิ่ม `point` ให้ทั้งสาม landmark ของทรงนั้น เช่น `{ x: 0.35, y: 0.25 }`, `{ x: 0.5, y: 0.55 }`, `{ x: 0.7, y: 0.2 }`

- [ ] **Step 3: ตรวจในเบราว์เซอร์**

Run: `npm run dev` แล้วเปิดตรวจ

| หน้า | ต้องเห็น |
|---|---|
| `/form/climbing-vine-visible-node` | ภาพเต็มความกว้าง หมุด ① ② ③ อยู่ตรงตำแหน่งที่กำหนด |
| หน้าเดียวกัน การ์ดจุดสังเกต | ช่องซูมด้านซ้าย และเลขนำหน้าชื่อจุดตรงกับหมุด |
| หน้าเดียวกัน ใต้ภาพ | บอกชนิดในภาพ คนถ่าย ใบอนุญาต และประโยคว่าไม่ใช่ภาพของทุกชนิด |
| `/form/rhizome-bud` (หรือทรงใดที่ไม่มีภาพ) | กล่อง "ยังไม่มีภาพอ้างอิง" ยังแสดงเหมือนเดิม |
| `/admin/pin` | เลือกทรงได้ คลิกบนภาพแล้วได้พิกัด และโค้ดที่พิมพ์ออกมาคัดลอกไปใช้ได้ |

ตรวจทั้งโหมดสว่างและโหมดมืด **และตรวจว่าหมุดยังอยู่ตรงจุดเดิมเมื่อย่อหน้าต่างให้แคบลง**
เพราะนั่นคือสิ่งที่การวางด้วยเปอร์เซ็นต์ควรรับประกัน

- [ ] **Step 4: ลบของชั่วคราวออกให้หมด**

```bash
rm public/forms/__qa.jpg
```

แล้วลบบล็อก `referenceImage` และ `point` ทั้งสามที่เพิ่มไว้ใน Step 2 ออกจากไฟล์ทรง

Run: `git status --short`
Expected: ไม่มี `public/forms/__qa.jpg` และไม่มีการแก้ไฟล์ทรงค้างอยู่

- [ ] **Step 5: บันทึกผลลง handoff.md**

ต่อท้าย `handoff.md` ตามโครงนี้ **ห้ามเขียนว่าผ่านในข้อที่ยังไม่ได้ลอง**

```markdown
## <วันที่> · เฟส 3a ชั้นภาพของทรง · QA ผ่านเบราว์เซอร์จริง

ตรวจด้วย Chrome บน `npm run dev` โดยใช้ภาพทดสอบชั่วคราวที่ลบออกแล้วหลังตรวจเสร็จ

### ผ่านแล้ว
| หน้า | ผล |
|---|---|
| ... | ... |

### บั๊กที่เจอจากการเปิดดูของจริง
1. ...

### ยังไม่ได้ตรวจ
- **ภาพจริงจากกล้อง** ยังไม่มีสักใบ ตรวจด้วยภาพสีเดียวเท่านั้น
  ซึ่งไม่บอกว่าหมุดอ่านออกไหมบนภาพที่มีรายละเอียดเยอะ
- ...
```

- [ ] **Step 6: รันทั้งชุดครั้งสุดท้าย**

Run: `npm test && npm run lint && npm run build`
Expected: PASS ทั้งหมด

- [ ] **Step 7: Commit**

```bash
git add handoff.md
git commit -m "docs: record browser QA for the form image layer"
```

---

### Task 7: อัปเดตเอกสารระบบ

**Files:**
- Modify: `project_summary.md`

- [ ] **Step 1: เพิ่มเส้นทางใหม่ในตารางโซนหลังบ้านในส่วนที่ 2**

```markdown
| `/admin/pin` | ปักหมุดจุดสังเกตบนภาพของทรง แล้วคัดลอกพิกัดไปวางในไฟล์ทรง |
```

- [ ] **Step 2: เพิ่มกฎใหม่ในตารางกฎที่บังคับด้วยเทสต์ในส่วนที่ 4**

```markdown
| ทุกไฟล์ภาพที่อ้าง ต้องมีอยู่จริงใน `public/forms/` | `forms/images.test.ts` |
| ภาพต้องบอกชนิดในภาพ คนถ่าย และใบอนุญาต CC BY-SA 4.0 | `forms/images.test.ts` |
| `alt` ของภาพต้องยาวเกิน 20 ตัวอักษร | `forms/images.test.ts` |
| พิกัดหมุดต้องอยู่ในช่วง 0 ถึง 1 | `forms/images.test.ts` |
| `cropStyle` ต้องวางจุดไว้กลางช่องซูมจริง | `forms/crop.test.ts` |
```

- [ ] **Step 3: เพิ่มส่วนใหม่ท้ายไฟล์**

```markdown
## 16 · ชั้นภาพของทรง (เพิ่ม 6 สิงหาคม 2026)

เฟส 3a ของ redesign รอบสอง เหตุผลเต็มอยู่ใน
`docs/superpowers/specs/2026-08-06-form-reference-images-design.md`

**หนึ่งทรง หนึ่งภาพ** ภาพเดียวมีหมุดของทุกจุดสังเกต เพราะมือใหม่ต้องเห็นก่อนว่าจุดต่าง ๆ
อยู่ตรงไหนเทียบกัน ซึ่งเป็นสิ่งเดียวที่ภาพให้ได้แต่ข้อความให้ไม่ได้

**ภาพของทรงคือภาพต้นจริงของชนิดหนึ่งที่เป็นตัวแทน** จึงต้องติดคำบรรยายบอกชนิดในภาพเสมอ
ตามกฎชั้น D ของ `newplant_protocol.md` ขั้นที่ 5 และต้องพกเครดิตกับใบอนุญาต CC BY-SA 4.0
ติดตัวมาด้วยเพราะไฟล์ commit ขึ้น public repo

**หมุดวางด้วยเปอร์เซ็นต์ ภาพซูมคำนวณเป็นพิกเซล** หมุดใช้เปอร์เซ็นต์จึงสเกลตามภาพเองโดยไม่ต้องใช้
JavaScript ส่วนช่องซูมของแต่ละการ์ดใช้ `cropStyle` คำนวณเป็นพิกเซล เพราะ `background-position`
แบบเปอร์เซ็นต์จัดให้จุด p ของภาพไปตรงกับจุด p ของกรอบ ซึ่งไม่ใช่การวางจุดนั้นไว้กลางกรอบ
และจะเพี้ยนหนักที่สุดกับจุดที่อยู่ริมภาพ

**`/admin/pin` เป็นข้อยกเว้นของกฎห้ามเพิ่ม client component** เพราะการรับพิกัดจากการคลิก
ต้องใช้ JavaScript จริง ยกเว้นเฉพาะโซน `/admin` ซึ่งไม่ใช่หน้าผู้ใช้
หน้าสาธารณะทุกหน้ายังเป็น Server Component ล้วนตามเดิม

**ยังไม่มีภาพจริงสักใบ** ทุกทรงยังแสดงกล่องว่ายังไม่มีภาพอ้างอิง กลไกพร้อมแล้วและมีเทสต์คุมครบ
รอเจ้าของระบบถ่ายภาพแล้วทยอยเติมทีละทรง
```

- [ ] **Step 4: แก้จำนวนเทสต์บนหัวไฟล์ให้ตรงกับผลจริงจาก `npm test`**

- [ ] **Step 5: รันทั้งชุด**

Run: `npm test && npm run lint && npm run build`
Expected: PASS ทั้งหมด

- [ ] **Step 6: Commit**

```bash
git add project_summary.md
git commit -m "docs: document the form image layer and the pin tool"
```
