# เฟส 0 · ฐานข้อมูลชั้นทรง — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** สร้างชั้นข้อมูล "ทรงการเติบโต · สกุล · ลักษณะพันธุ์ · คำศัพท์" พร้อมกฎที่บังคับด้วยเทสต์ โดยยังไม่แตะหน้าจอใด ๆ

**Architecture:** ต่อ cascade เดิมของ `resolveManual` จาก `core → override → pack` ให้ยาวขึ้นเป็น `core → form → genus → species` โดยใช้ตรรกะการทับค่าเดิม เพิ่มระดับหลักฐาน `botanical-fact` สำหรับคำนิยามที่ไม่เข้ากฎจุดอ่อนที่สุด และเขียนฟังก์ชันสรุประดับหลักฐานของคู่มือทั้งเล่มขึ้นมาใหม่ (ยังไม่เคยมี)

**Tech Stack:** TypeScript · Next.js 16.2.11 · React 19.2.4 · Vitest 4 (ไม่มี jsdom ไม่มี testing-library)

## Global Constraints

- อ่านคู่มือของ Next.js ใน `node_modules/next/dist/docs/` ก่อนเขียนโค้ดที่แตะ Next API ตาม `AGENTS.md` — เฟสนี้แทบไม่แตะ Next แต่กฎยังบังคับ
- เทสต์ทั้งหมดรันด้วย `npm test` (vitest run) · เทสต์ component ใช้ `renderToStaticMarkup` เท่านั้น
- ตรรกะทั้งหมดในเฟสนี้เป็นฟังก์ชันบริสุทธิ์ ไม่มี React ไม่มี I/O
- ข้อความในโค้ดและคอมเมนต์เป็นภาษาไทย ตามธรรมเนียมไฟล์เดิมใน `src/lib/manual/`
- ห้ามแก้เทสต์ที่มีอยู่เพื่อให้ผ่าน ถ้าเทสต์เดิมพัง แปลว่าโค้ดใหม่ผิด
- ค่าตัวเลขทางวิชาการทุกตัวในเฟสนี้เป็น **โครงสร้างเปล่า** — ห้ามใส่ตัวเลขที่ยังไม่ผ่าน `docs/superpowers/newplant_protocol.md` เนื้อหาจริงเป็นงานเฟส 2
- ทุก task จบด้วย `npm test` ผ่านทั้งชุด แล้วจึง commit
- อ้างอิงสเปก: `docs/superpowers/specs/2026-08-05-growth-form-first-redesign-design.md`

## File Structure

| ไฟล์ | หน้าที่ |
|---|---|
| `src/lib/manual/types.ts` | **แก้** เพิ่ม `"botanical-fact"` ใน `EvidenceLevel` และเพิ่ม `StepOrigin` สองค่า |
| `src/lib/manual/forms/types.ts` | **ใหม่** `Landmark`, `GrowthForm`, `CutMarker`, `Dose` |
| `src/lib/manual/forms/climbing-vine-visible-node.ts` | **ใหม่** ทรงแรก ใช้เป็นตัวอย่างอ้างอิงของทรงอื่น |
| `src/lib/manual/forms/registry.ts` | **ใหม่** รวมทรงทั้งหมด + lookup |
| `src/lib/manual/forms/registry.test.ts` | **ใหม่** ความสมบูรณ์เชิงอ้างอิงของทรง |
| `src/lib/manual/traits.ts` | **ใหม่** ทะเบียนลักษณะพันธุ์ที่ตัดข้ามสกุล |
| `src/lib/manual/traits.test.ts` | **ใหม่** |
| `src/lib/manual/genera/types.ts` | **ใหม่** `GenusPack` |
| `src/lib/manual/genera/philodendron.ts` | **ใหม่** สกุลแรก |
| `src/lib/manual/genera/registry.ts` | **ใหม่** |
| `src/lib/manual/resolve.ts` | **แก้** ต่อ cascade |
| `src/lib/manual/resolve.test.ts` | **แก้** |
| `src/lib/manual/registry.ts` | **แก้** ส่ง form/genus เข้า resolve |
| `src/lib/manual/summary.ts` | **แก้** รองรับ origin ใหม่ |
| `src/lib/manual/evidence-level.ts` | **ใหม่** `manualEvidenceLevel()` — กฎจุดอ่อนที่สุดของคู่มือ |
| `src/lib/manual/evidence-level.test.ts` | **ใหม่** |
| `src/lib/manual/evidence-rules.test.ts` | **แก้** กฎของ `botanical-fact` |
| `src/lib/manual/terms.ts` | **ใหม่** แยกคำศัพท์ที่ถูกห่อออกจากข้อความ |
| `src/lib/manual/terms.test.ts` | **ใหม่** |
| `scripts/report-unwrapped-terms.mjs` | **ใหม่** รายงานคำที่ยังไม่ถูกห่อ (รายงาน ไม่ใช่เทสต์ — ดูหมายเหตุท้ายแผน) |

---

### Task 1: เพิ่มระดับหลักฐาน `botanical-fact`

**Files:**
- Modify: `src/lib/manual/types.ts:1`
- Test: `src/lib/manual/evidence-rules.test.ts`

**Interfaces:**
- Consumes: ไม่มี
- Produces: `EvidenceLevel` ที่มีสี่ค่า `"species-direct" | "adapted" | "unsupported" | "botanical-fact"`

- [ ] **Step 1: เขียนเทสต์ที่ยังไม่ผ่าน**

เพิ่มท้าย `describe("กฎของหลักฐาน", ...)` ใน `src/lib/manual/evidence-rules.test.ts`

```ts
  it("ข้อมูลจากตำราต้องระบุแหล่ง ห้ามใช้เป็นทางเลี่ยงการอ้างอิง", () => {
    for (const item of collect()) {
      if (item.evidence.level !== "botanical-fact") continue;
      expect(item.evidence.sourceIds.length, `${item.where} เป็นข้อมูลจากตำราแต่ไม่ระบุแหล่ง`).toBeGreaterThan(0);
    }
  });
```

- [ ] **Step 2: รันให้เห็นว่าพัง**

Run: `npx vitest run src/lib/manual/evidence-rules.test.ts`
Expected: FAIL — TypeScript ปฏิเสธเพราะ `"botanical-fact"` ไม่ใช่ค่าที่ถูกต้องของ `EvidenceLevel`

- [ ] **Step 3: เพิ่มค่าใหม่ในสคีมา**

`src/lib/manual/types.ts` บรรทัดที่ 1

```ts
/** ระดับหลักฐานของเนื้อหาแต่ละชิ้น
 *  สามค่าแรกใช้กับ "ข้ออ้าง" คือข้อความที่สั่งให้ลงมือทำหรือมีตัวเลขที่ต้องทำตาม
 *  ส่วน botanical-fact ใช้กับ "คำนิยาม" เช่น "ข้อคือวงนูนที่ใบและรากงอกออกมา"
 *  ซึ่งตรวจได้จากตำราก่อนลงมือ จึงไม่เข้ากฎจุดอ่อนที่สุด (ดู evidence-level.ts)
 *  แต่ยังบังคับให้ระบุ sourceIds เหมือนเดิม */
export type EvidenceLevel = "species-direct" | "adapted" | "unsupported" | "botanical-fact";
```

- [ ] **Step 4: อัปเดตที่นับค่าเป็น Record ครบทุกคีย์**

`src/lib/manual/summary.ts:17`

```ts
  const byEvidence: Record<EvidenceLevel, number> = {
    "species-direct": 0,
    adapted: 0,
    unsupported: 0,
    "botanical-fact": 0,
  };
```

- [ ] **Step 5: หาที่อื่นที่ map ครบทุกระดับแล้วแก้ให้ครบ**

Run: `npx tsc --noEmit`
Expected: ชี้ไฟล์ที่ `Record<EvidenceLevel, …>` ยังไม่ครบ อย่างน้อยคือ `src/components/guide/evidence-badge.tsx` และ `src/components/equipment/path-summary.tsx`

ใน `src/components/guide/evidence-badge.tsx` เพิ่มป้ายใหม่

```tsx
  "botanical-fact": "ข้อมูลจากตำรา",
```

ใน `src/lib/equipment/resolve-path.ts` ตาราง `rank` ให้ `botanical-fact` มีอันดับสูงสุด เพราะเส้นทางอุปกรณ์ไม่ควรมีค่านี้อยู่แล้ว และถ้ามีก็ไม่ควรฉุดใคร

```ts
const rank: Record<EvidenceLevel, number> = {
  unsupported: 0,
  adapted: 1,
  "species-direct": 2,
  "botanical-fact": 3,
};
```

- [ ] **Step 6: รันเทสต์ทั้งชุด**

Run: `npm test`
Expected: PASS ทั้งหมด (เทสต์ใหม่ผ่านแบบไม่มีข้อมูลให้ตรวจ เพราะยังไม่มีใครใช้ระดับนี้)

- [ ] **Step 7: Commit**

```bash
git add src/lib/manual/types.ts src/lib/manual/summary.ts src/lib/manual/evidence-rules.test.ts src/components/guide/evidence-badge.tsx src/lib/equipment/resolve-path.ts
git commit -m "feat: add botanical-fact evidence level for definitions"
```

---

### Task 2: ฟังก์ชันกฎจุดอ่อนที่สุดของคู่มือ

กฎนี้เขียนไว้ใน `project_summary.md §4` แต่ยังไม่เคยมีโค้ด มีแต่ของฝั่งอุปกรณ์ที่ `src/lib/equipment/resolve-path.ts:51`

**Files:**
- Create: `src/lib/manual/evidence-level.ts`
- Create: `src/lib/manual/evidence-level.test.ts`

**Interfaces:**
- Consumes: `EvidenceLevel`, `ResolvedManual` จาก `./types`
- Produces: `manualEvidenceLevel(manual: ResolvedManual): EvidenceLevel | null` — คืน `null` เมื่อไม่มีข้ออ้างให้ตัดสินเลย

- [ ] **Step 1: เขียนเทสต์ที่ยังไม่ผ่าน**

`src/lib/manual/evidence-level.test.ts`

```ts
import { describe, expect, it } from "vitest";

import { manualEvidenceLevel } from "./evidence-level";
import type { EvidenceLevel, ResolvedManual, ResolvedStep } from "./types";

function step(id: string, level: EvidenceLevel): ResolvedStep {
  return {
    id,
    title: id,
    summary: "",
    why: "",
    materials: [],
    actions: [],
    passCriteria: [],
    stopConditions: [],
    safetyNotes: [],
    measurements: [],
    evidence: { level, sourceIds: level === "unsupported" ? [] : ["source-x"] },
    durationMinutes: null,
    order: 0,
    origin: "core",
  };
}

function manual(steps: ResolvedStep[]): ResolvedManual {
  return {
    slug: "test",
    scientificName: "Test",
    commonName: "ทดสอบ",
    method: "node",
    summary: "",
    durationLabel: "",
    steps,
    mediaRecipes: [],
    sourceIds: [],
  };
}

describe("กฎจุดอ่อนที่สุดของคู่มือ", () => {
  it("เอาระดับของขั้นที่อ่อนที่สุด ไม่ใช่ที่แข็งที่สุด", () => {
    const result = manualEvidenceLevel(manual([step("a", "species-direct"), step("b", "adapted")]));
    expect(result).toBe("adapted");
  });

  it("ขั้นเดียวที่ไม่มีงานรองรับ ลากทั้งเล่มลง", () => {
    const result = manualEvidenceLevel(manual([step("a", "species-direct"), step("b", "unsupported")]));
    expect(result).toBe("unsupported");
  });

  it("ข้อมูลจากตำราไม่ฉุดคะแนนของเล่ม", () => {
    const result = manualEvidenceLevel(manual([step("a", "species-direct"), step("b", "botanical-fact")]));
    expect(result).toBe("species-direct");
  });

  it("คู่มือที่มีแต่ข้อมูลจากตำรา ยังตัดสินไม่ได้", () => {
    expect(manualEvidenceLevel(manual([step("a", "botanical-fact")]))).toBeNull();
  });

  it("สูตรอาหารนับรวมด้วย ไม่ใช่แค่ขั้นตอน", () => {
    const base = manual([step("a", "species-direct")]);
    base.mediaRecipes = [
      { id: "r1", title: "สูตร", pH: "5.8", ingredients: [], evidence: { level: "unsupported", sourceIds: [] } },
    ];
    expect(manualEvidenceLevel(base)).toBe("unsupported");
  });
});
```

- [ ] **Step 2: รันให้เห็นว่าพัง**

Run: `npx vitest run src/lib/manual/evidence-level.test.ts`
Expected: FAIL — `Cannot find module './evidence-level'`

- [ ] **Step 3: เขียน implementation ที่เล็กที่สุด**

`src/lib/manual/evidence-level.ts`

```ts
import type { EvidenceLevel, ResolvedManual } from "./types";

/** อันดับความแข็งของหลักฐาน ใช้หาค่าต่ำสุด
 *  botanical-fact ไม่อยู่ในตารางนี้เพราะมันไม่ใช่ข้ออ้าง จึงถูกกรองทิ้งก่อนถึงขั้นเทียบ */
const rank: Record<"unsupported" | "adapted" | "species-direct", number> = {
  unsupported: 0,
  adapted: 1,
  "species-direct": 2,
};

function isClaim(level: EvidenceLevel): level is keyof typeof rank {
  return level !== "botanical-fact";
}

/** ระดับหลักฐานของคู่มือทั้งเล่ม เท่ากับข้ออ้างที่อ่อนที่สุดในเล่ม
 *
 *  เหตุผลที่นับเฉพาะข้ออ้าง คือกฎนี้มีไว้เตือนความเสี่ยงที่ต้องลงมือทำแล้วรอผล
 *  ส่วนคำนิยาม (botanical-fact) ตรวจได้จากตำราก่อนลงมือ ถ้านับรวมเข้าไปด้วย
 *  ทุกคู่มือจะถูกลากลงเท่ากันหมดและป้ายจะแยกเล่มไม่ออกอีกต่อไป
 *
 *  คืน null เมื่อไม่มีข้ออ้างเลย ซึ่งแปลว่ายังตัดสินไม่ได้ ไม่ใช่ว่าดีหรือแย่ */
export function manualEvidenceLevel(manual: ResolvedManual): EvidenceLevel | null {
  const levels: Array<keyof typeof rank> = [];
  for (const step of manual.steps) if (isClaim(step.evidence.level)) levels.push(step.evidence.level);
  for (const recipe of manual.mediaRecipes) if (isClaim(recipe.evidence.level)) levels.push(recipe.evidence.level);

  if (levels.length === 0) return null;
  return levels.reduce((weakest, level) => (rank[level] < rank[weakest] ? level : weakest));
}
```

- [ ] **Step 4: รันเทสต์**

Run: `npx vitest run src/lib/manual/evidence-level.test.ts`
Expected: PASS ทั้ง 5 ข้อ

- [ ] **Step 5: รันทั้งชุดและ lint**

Run: `npm test && npm run lint`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add src/lib/manual/evidence-level.ts src/lib/manual/evidence-level.test.ts
git commit -m "feat: implement weakest-link evidence rule for manuals"
```

---

### Task 3: สคีมาชั้นทรง

**Files:**
- Create: `src/lib/manual/forms/types.ts`

**Interfaces:**
- Consumes: `EvidenceRef`, `MeasurementUnit`, `StepOverride` จาก `../types`
- Produces: `Landmark`, `GrowthForm`, `CutMarker`, `Dose`

- [ ] **Step 1: เขียนไฟล์สคีมา**

`src/lib/manual/forms/types.ts`

```ts
import type { EvidenceRef, MeasurementUnit, StepOverride } from "../types";

/** จุดสังเกตบนต้นที่มือใหม่ต้องหาให้เจอ — คือคำศัพท์ที่ชี้ตำแหน่งได้จริง
 *  ทะเบียนคำศัพท์ของทั้งระบบมาจากที่นี่ที่เดียว ไม่มีคลังคำแยกต่างหาก */
export type Landmark = {
  id: string;
  term: string;
  /** คำที่คนพูดจริงแต่ไม่ใช่ชื่อทางการ ใช้ให้ค้นเจอ */
  aka?: string[];
  /** ห้ามใช้ศัพท์เทคนิคอื่นซ้อนในคำอธิบายนี้ */
  whatItIs: string;
  howToFind: string;
  confusedWith?: string;
  /** พิกัด 0–1 บนภาพอ้างอิงของทรง มีได้เมื่อทรงนั้นมี referenceImageId เท่านั้น */
  point?: { x: number; y: number };
  evidence: EvidenceRef;
};

/** หมุดบนภาพต้นจริงของสายพันธุ์ แยกจาก Landmark.point ซึ่งอยู่บนภาพอ้างอิงของทรง */
export type CutMarker = {
  imageId: string;
  landmarkId: string;
  point: { x: number; y: number };
  label: string;
  evidence: EvidenceRef;
};

/** ค่าเชิงปริมาณที่ต้องแสดงเป็นช่วง เพราะตัวแปรที่ขยับมันแรงที่สุดคือที่มาของต้นแม่
 *  และลักษณะเนื้อเยื่อ ไม่ใช่ชนิดพืช การแสดงตัวเลขเดี่ยวจึงแม่นเกินความจริง */
export type Dose = {
  /** ชื่อและรูปแบบที่ใช้จริง เช่น "น้ำยาซักผ้าขาว NaOCl 6%" ไม่ใช่ชื่อสารลอย ๆ */
  form: string;
  low: number;
  high: number;
  unit: MeasurementUnit;
  durationMin: [number, number];
  movesLowerWhen: string[];
  movesHigherWhen: string[];
  evidence: EvidenceRef;
};

export type GrowthForm = {
  id: string;
  label: string;
  /** ให้คนที่ไม่รู้อะไรเลยจำแนกต้นของตัวเองได้ */
  plainDescription: string;
  referenceImageId?: string;
  landmarks: Landmark[];
  defaultExplant: {
    landmarkId: string;
    offsetMm: number;
    direction: "above" | "below";
    sizeMm: [number, number];
    /** เป็นข้ออ้าง ไม่ใช่คำนิยาม จึงต้องมีที่มาและเข้ากฎจุดอ่อนที่สุด */
    evidence: EvidenceRef;
  };
  beginnerDifficulty: 1 | 2 | 3;
  /** เหตุผลจริง ไม่ใช่ดาวลอย ๆ แสดงที่หน้า /start */
  whyThisDifficulty: string;
  /** ทับค่าขั้นจากแกนกลางในระดับทรง เช่น ขั้น select-explant ของทรงเถาเลื้อย */
  stepOverrides?: Record<string, StepOverride>;
  /** ค่าเชิงปริมาณระดับทรง คีย์เป็นชื่อค่าที่ trait อ้างถึงได้ เช่น "sterilize.dose"
   *  ชั้นสกุลทับค่าตรงนี้ได้ด้วยคีย์เดียวกัน */
  defaultDoses?: Record<string, Dose>;
};
```

- [ ] **Step 2: ตรวจว่าคอมไพล์ผ่าน**

Run: `npx tsc --noEmit`
Expected: ไม่มี error

- [ ] **Step 3: Commit**

```bash
git add src/lib/manual/forms/types.ts
git commit -m "feat: add growth form schema"
```

---

### Task 4: ทรงแรกและทะเบียนทรง

**Files:**
- Create: `src/lib/manual/forms/climbing-vine-visible-node.ts`
- Create: `src/lib/manual/forms/registry.ts`
- Create: `src/lib/manual/forms/registry.test.ts`

**Interfaces:**
- Consumes: `GrowthForm` จาก `./types` · `manualSources` จาก `../sources`
- Produces: `growthForms: GrowthForm[]` · `formById(id: string): GrowthForm | null` · `landmarkById(formId, landmarkId): Landmark | null`

- [ ] **Step 1: เขียนเทสต์ความสมบูรณ์เชิงอ้างอิงที่ยังไม่ผ่าน**

`src/lib/manual/forms/registry.test.ts`

```ts
import { describe, expect, it } from "vitest";

import { manualSources } from "../sources";
import { formById, growthForms } from "./registry";

const sourceIds = new Set(manualSources.map((source) => source.id));

describe("ทะเบียนทรงการเติบโต", () => {
  it("ไม่มี id ซ้ำ", () => {
    const ids = growthForms.map((form) => form.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("ทุกแหล่งที่อ้างมีอยู่จริงในทะเบียนแหล่ง", () => {
    for (const form of growthForms) {
      const refs = [form.defaultExplant.evidence, ...form.landmarks.map((landmark) => landmark.evidence)];
      for (const ref of refs) {
        for (const id of ref.sourceIds) {
          expect(sourceIds.has(id), `${form.id} อ้าง ${id} ที่ไม่มีในทะเบียน`).toBe(true);
        }
      }
    }
  });

  it("จุดตัดอ้าง landmark ที่มีอยู่จริงในทรงนั้น", () => {
    for (const form of growthForms) {
      const ids = new Set(form.landmarks.map((landmark) => landmark.id));
      expect(ids.has(form.defaultExplant.landmarkId), `${form.id} ตัดที่ landmark ที่ไม่มีอยู่`).toBe(true);
    }
  });

  it("มีพิกัดได้เมื่อมีภาพอ้างอิงเท่านั้น", () => {
    for (const form of growthForms) {
      if (form.referenceImageId) continue;
      for (const landmark of form.landmarks) {
        expect(landmark.point, `${form.id}/${landmark.id} มีพิกัดแต่ทรงยังไม่มีภาพ`).toBeUndefined();
      }
    }
  });

  it("คำนิยามของจุดสังเกตต้องเป็นข้อมูลจากตำราและระบุแหล่ง", () => {
    for (const form of growthForms) {
      for (const landmark of form.landmarks) {
        expect(landmark.evidence.level, `${form.id}/${landmark.id} ไม่ใช่ข้อมูลจากตำรา`).toBe("botanical-fact");
        expect(landmark.evidence.sourceIds.length, `${form.id}/${landmark.id} ไม่ระบุแหล่ง`).toBeGreaterThan(0);
      }
    }
  });

  it("ค่าเชิงปริมาณต้องระบุรูปแบบที่ใช้จริง และช่วงต้องเรียงถูกทาง", () => {
    for (const form of growthForms) {
      for (const [key, dose] of Object.entries(form.defaultDoses ?? {})) {
        expect(dose.form.trim().length, `${form.id}/${key} ไม่ระบุชื่อและรูปแบบของสารที่ใช้จริง`).toBeGreaterThan(0);
        expect(dose.low, `${form.id}/${key} ปลายต่ำมากกว่าปลายสูง`).toBeLessThanOrEqual(dose.high);
        expect(dose.durationMin[0], `${form.id}/${key} เวลาต้นช่วงมากกว่าปลายช่วง`).toBeLessThanOrEqual(dose.durationMin[1]);
      }
    }
  });

  it("ค้นทรงด้วย id ได้ และคืน null เมื่อไม่มี", () => {
    expect(formById("climbing-vine-visible-node")?.id).toBe("climbing-vine-visible-node");
    expect(formById("ไม่มีทรงนี้")).toBeNull();
  });
});
```

- [ ] **Step 2: รันให้เห็นว่าพัง**

Run: `npx vitest run src/lib/manual/forms/registry.test.ts`
Expected: FAIL — `Cannot find module './registry'`

- [ ] **Step 3: เพิ่มแหล่งอ้างอิงตำราพฤกษศาสตร์**

ต่อท้าย array `manualSources` ใน `src/lib/manual/sources.ts`

```ts
  {
    id: "source-botany-plant-morphology",
    title: "Plant Morphology — node, internode, axillary bud (Encyclopaedia Britannica)",
    url: "https://www.britannica.com/science/stem-plant",
    kind: "technical-guide",
    accessedAt: "2026-08-05",
  },
```

- [ ] **Step 4: เขียนทรงแรก**

`src/lib/manual/forms/climbing-vine-visible-node.ts`

```ts
import type { GrowthForm } from "./types";

/** ทรงที่ง่ายที่สุดสำหรับมือใหม่ เพราะข้อเห็นด้วยตาเปล่า ตัดผิดตำแหน่งได้ยาก
 *  ครอบ Philodendron, Monstera, Epipremnum, Scindapsus, Syngonium และเถาเลื้อยอื่นที่ข้อชัด */
export const climbingVineVisibleNode: GrowthForm = {
  id: "climbing-vine-visible-node",
  label: "เถาเลื้อย ข้อเห็นชัด",
  plainDescription:
    "ลำต้นทอดยาวเลื้อยไปตามพื้นหรือพาดขึ้นหลัก มีวงนูนเป็นระยะ ๆ ตามลำต้น และมักมีรากเล็ก ๆ งอกออกจากวงนูนนั้น",
  landmarks: [
    {
      id: "node",
      term: "ข้อ",
      aka: ["node", "ปม", "ปุ่ม"],
      whatItIs: "วงนูนรอบลำต้นที่ใบและรากงอกออกมา",
      howToFind: "ไล่นิ้วไปตามลำต้น จะสะดุดเป็นปุ่มเป็นระยะ ๆ ปุ่มนั้นคือข้อ",
      confusedWith: "ไม่ใช่ปล้อง ปล้องคือช่วงเรียบยาวระหว่างข้อสองข้อ",
      evidence: { level: "botanical-fact", sourceIds: ["source-botany-plant-morphology"] },
    },
    {
      id: "internode",
      term: "ปล้อง",
      aka: ["internode"],
      whatItIs: "ช่วงลำต้นที่เรียบยาวระหว่างข้อสองข้อ",
      howToFind: "หาข้อสองข้อที่อยู่ติดกัน ช่วงเรียบตรงกลางคือปล้อง",
      confusedWith: "ปล้องไม่มีตา ต่างจากข้อที่มีตาข้างอยู่",
      evidence: { level: "botanical-fact", sourceIds: ["source-botany-plant-morphology"] },
    },
    {
      id: "axillary-bud",
      term: "ตาข้าง",
      aka: ["axillary bud", "ตา"],
      whatItIs: "ปุ่มเล็กที่ซอกระหว่างก้านใบกับลำต้น ซึ่งจะแตกเป็นยอดใหม่ได้",
      howToFind: "มองที่มุมระหว่างก้านใบกับลำต้น จะเห็นปุ่มเล็กสีอ่อนกว่าลำต้น",
      evidence: { level: "botanical-fact", sourceIds: ["source-botany-plant-morphology"] },
    },
  ],
  defaultExplant: {
    landmarkId: "node",
    offsetMm: 10,
    direction: "below",
    sizeMm: [15, 20],
    evidence: {
      level: "unsupported",
      sourceIds: [],
      searchedAt: "2026-08-05",
      searchQueries: [
        "explant size nodal segment aroid micropropagation",
        "nodal cutting length in vitro Araceae",
      ],
      note: "ค่าโครงสร้างตั้งต้นของเฟส 0 ยังไม่ผ่านการค้นหลักฐานเต็มตาม newplant_protocol.md ต้องเติมในเฟส 2",
    },
  },
  beginnerDifficulty: 1,
  whyThisDifficulty:
    "ข้อเห็นด้วยตาเปล่า ตัดผิดตำแหน่งได้ยาก ยางน้อยจึงไม่ค่อยดำ และหาต้นแม่ได้ตามร้านต้นไม้ทั่วไป",
};
```

- [ ] **Step 5: เขียนทะเบียน**

`src/lib/manual/forms/registry.ts`

```ts
import { climbingVineVisibleNode } from "./climbing-vine-visible-node";
import type { GrowthForm } from "./types";

export const growthForms: GrowthForm[] = [climbingVineVisibleNode];

export function formById(id: string): GrowthForm | null {
  return growthForms.find((form) => form.id === id) ?? null;
}
```

ฟังก์ชัน lookup อื่นที่หน้าจอจะต้องใช้ (เช่นค้น landmark รายตัว หรือค้นพืชตามทรง)
ให้เพิ่มตอนเฟส 1 ที่มีคนเรียกจริง ไม่เขียนดักไว้ล่วงหน้าในเฟสนี้

- [ ] **Step 6: รันเทสต์**

Run: `npx vitest run src/lib/manual/forms/registry.test.ts`
Expected: PASS ทั้ง 6 ข้อ

- [ ] **Step 7: รันทั้งชุด**

Run: `npm test && npm run lint`
Expected: PASS

- [ ] **Step 8: Commit**

```bash
git add src/lib/manual/forms src/lib/manual/sources.ts
git commit -m "feat: add first growth form and form registry"
```

---

### Task 5: ทะเบียนลักษณะพันธุ์ที่ตัดข้ามสกุล

**Files:**
- Create: `src/lib/manual/traits.ts`
- Create: `src/lib/manual/traits.test.ts`

**Interfaces:**
- Consumes: `EvidenceRef` จาก `./types`
- Produces: `Trait`, `traits: Trait[]`, `traitById(id: string): Trait | null`

- [ ] **Step 1: เขียนเทสต์ที่ยังไม่ผ่าน**

`src/lib/manual/traits.test.ts`

```ts
import { describe, expect, it } from "vitest";

import { manualSources } from "./sources";
import { traitById, traits } from "./traits";

const sourceIds = new Set(manualSources.map((source) => source.id));

describe("ทะเบียนลักษณะพันธุ์", () => {
  it("ไม่มี id ซ้ำ", () => {
    const ids = traits.map((trait) => trait.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("ทุกการปรับค่าต้องบอกเหตุผลและมีหลักฐาน", () => {
    for (const trait of traits) {
      expect(trait.adjustments.length, `${trait.id} ไม่มีการปรับค่าเลย`).toBeGreaterThan(0);
      for (const adjustment of trait.adjustments) {
        expect(adjustment.why.length, `${trait.id}/${adjustment.target} ไม่บอกเหตุผล`).toBeGreaterThan(0);
        if (adjustment.evidence.level === "unsupported") continue;
        for (const id of adjustment.evidence.sourceIds) {
          expect(sourceIds.has(id), `${trait.id} อ้าง ${id} ที่ไม่มีในทะเบียน`).toBe(true);
        }
      }
    }
  });

  it("ค้นด้วย id ได้ และคืน null เมื่อไม่มี", () => {
    expect(traitById("variegated")?.id).toBe("variegated");
    expect(traitById("ไม่มี")).toBeNull();
  });
});
```

- [ ] **Step 2: รันให้เห็นว่าพัง**

Run: `npx vitest run src/lib/manual/traits.test.ts`
Expected: FAIL — `Cannot find module './traits'`

- [ ] **Step 3: เขียน implementation**

`src/lib/manual/traits.ts`

```ts
import type { EvidenceRef } from "./types";

/** ลักษณะที่ตัดข้ามสกุล เช่นความด่างซึ่งเจอทั้งใน Philodendron, Monstera และ Syngonium
 *  จึงไม่ควรอยู่ในชั้นใดชั้นหนึ่งของ cascade แต่เป็นตัวปรับที่ทาบทับลงไปทีหลัง */
export type Trait = {
  id: string;
  label: string;
  adjustments: {
    /** ชี้ค่าที่ถูกปรับ เช่น "sterilize.dose" หรือ "multiply.cytokinin" */
    target: string;
    direction: "lower" | "shorter" | "add";
    why: string;
    evidence: EvidenceRef;
  }[];
};

export const traits: Trait[] = [
  {
    id: "variegated",
    label: "พันธุ์ด่าง",
    adjustments: [
      {
        target: "sterilize.dose",
        direction: "lower",
        why: "เนื้อส่วนที่ขาวไม่มีคลอโรฟิลล์ ฟื้นตัวช้ากว่าและตายง่ายกว่าเมื่อเจอสารฟอกเข้มข้นเท่ากัน",
        evidence: {
          level: "unsupported",
          sourceIds: [],
          searchedAt: "2026-08-05",
          searchQueries: [
            "variegated explant sensitivity sodium hypochlorite sterilization",
            "chimeral variegation in vitro establishment survival",
          ],
          note: "ต้องค้นเต็มตาม newplant_protocol.md ในเฟส 2",
        },
      },
      {
        target: "multiply.cytokinin",
        direction: "lower",
        why: "cytokinin สูงเกินไปทำให้ได้ยอดเขียวล้วนหรือขาวล้วน ลายด่างหาย ซึ่งทำลายเป้าหมายของการเพาะพันธุ์ด่าง",
        evidence: {
          level: "unsupported",
          sourceIds: [],
          searchedAt: "2026-08-05",
          searchQueries: [
            "cytokinin concentration variegation stability micropropagation",
            "loss of variegation in vitro shoot multiplication BA",
          ],
          note: "ต้องค้นเต็มตาม newplant_protocol.md ในเฟส 2",
        },
      },
    ],
  },
];

export function traitById(id: string): Trait | null {
  return traits.find((trait) => trait.id === id) ?? null;
}
```

- [ ] **Step 4: รันเทสต์**

Run: `npx vitest run src/lib/manual/traits.test.ts`
Expected: PASS ทั้ง 3 ข้อ

- [ ] **Step 5: รันทั้งชุด**

Run: `npm test && npm run lint`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add src/lib/manual/traits.ts src/lib/manual/traits.test.ts
git commit -m "feat: add cross-genus trait registry"
```

---

### Task 6: ชั้นสกุล

**Files:**
- Create: `src/lib/manual/genera/types.ts`
- Create: `src/lib/manual/genera/philodendron.ts`
- Create: `src/lib/manual/genera/registry.ts`
- Create: `src/lib/manual/genera/registry.test.ts`

**Interfaces:**
- Consumes: `StepOverride`, `MediaRecipe` จาก `../types` · `formById` จาก `../forms/registry`
- Produces: `GenusPack` · `generaPacks: GenusPack[]` · `genusById(id: string): GenusPack | null`

- [ ] **Step 1: เขียนเทสต์ที่ยังไม่ผ่าน**

`src/lib/manual/genera/registry.test.ts`

```ts
import { describe, expect, it } from "vitest";

import { formById } from "../forms/registry";
import { generaPacks, genusById } from "./registry";

describe("ทะเบียนสกุล", () => {
  it("ไม่มี id ซ้ำ", () => {
    const ids = generaPacks.map((pack) => pack.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("ทุกสกุลผูกกับทรงที่มีอยู่จริง", () => {
    for (const pack of generaPacks) {
      expect(formById(pack.growthFormId), `${pack.id} ผูกกับทรงที่ไม่มีอยู่`).not.toBeNull();
    }
  });

  it("ค่าที่ยืมมาจากชนิดอื่นต้องบอกว่ายืมมาจากชนิดไหน", () => {
    for (const pack of generaPacks) {
      for (const [stepId, override] of Object.entries(pack.deviations)) {
        if (!override.evidence) continue;
        if (override.evidence.level !== "adapted") continue;
        expect(
          override.evidence.note,
          `${pack.id}/${stepId} เป็นค่าประยุกต์แต่ไม่บอกว่ามาจากชนิดไหน`,
        ).toBeTruthy();
      }
    }
  });

  it("ค้นด้วย id ได้ และคืน null เมื่อไม่มี", () => {
    expect(genusById("philodendron")?.id).toBe("philodendron");
    expect(genusById("ไม่มี")).toBeNull();
  });
});
```

- [ ] **Step 2: รันให้เห็นว่าพัง**

Run: `npx vitest run src/lib/manual/genera/registry.test.ts`
Expected: FAIL — `Cannot find module './registry'`

- [ ] **Step 3: เขียนสคีมา**

`src/lib/manual/genera/types.ts`

```ts
import type { MediaRecipe, StepOverride } from "../types";

/** แผ่นเสริมระดับสกุล เก็บเฉพาะส่วนที่ต่างจากทรง ไม่ใช่คู่มือทั้งเล่ม
 *  ชั้นนี้ทำงานหนักที่สุดในเชิงความครอบคลุม เพราะโปรโตคอลเกาะกลุ่มตามสกุลมากกว่าตามชนิด
 *
 *  ความเสี่ยงที่ต้องระวัง คือการเอาผลจากชนิดเดียวมาวางที่ชั้นสกุลแล้วปล่อยให้ไหลลง
 *  ไปหาทุกชนิดในสกุล ซึ่งดูน่าเชื่อถือเกินจริง เทสต์จึงบังคับว่าค่าระดับ adapted
 *  ต้องเขียน note บอกว่ายืมมาจากชนิดไหน */
export type GenusPack = {
  id: string;
  growthFormId: string;
  scientificName: string;
  commonNames: string[];
  deviations: Record<string, StepOverride>;
  mediaRecipes?: MediaRecipe[];
  sourceIds: string[];
};
```

- [ ] **Step 4: เขียนสกุลแรก**

`src/lib/manual/genera/philodendron.ts`

```ts
import type { GenusPack } from "./types";

/** สกุลแรก ตั้งไว้เป็นโครงให้ชนิดที่มีอยู่แล้วสามชุดผูกขึ้นมาได้
 *  ยังไม่ใส่ค่าเชิงปริมาณ เพราะการค้นหลักฐานเต็มเป็นงานเฟส 2 */
export const philodendron: GenusPack = {
  id: "philodendron",
  growthFormId: "climbing-vine-visible-node",
  scientificName: "Philodendron",
  commonNames: ["ฟิโลเดนดรอน", "ฟิโล"],
  deviations: {},
  sourceIds: ["source-ruaysap-chemical-sterilization"],
};
```

- [ ] **Step 5: เขียนทะเบียน**

`src/lib/manual/genera/registry.ts`

```ts
import { philodendron } from "./philodendron";
import type { GenusPack } from "./types";

export const generaPacks: GenusPack[] = [philodendron];

export function genusById(id: string): GenusPack | null {
  return generaPacks.find((pack) => pack.id === id) ?? null;
}
```

- [ ] **Step 6: รันเทสต์**

Run: `npx vitest run src/lib/manual/genera/registry.test.ts`
Expected: PASS ทั้ง 4 ข้อ

- [ ] **Step 7: รันทั้งชุด**

Run: `npm test && npm run lint`
Expected: PASS

- [ ] **Step 8: Commit**

```bash
git add src/lib/manual/genera
git commit -m "feat: add genus layer between growth form and species"
```

---

### Task 7: ต่อ cascade ใน resolveManual

**Files:**
- Modify: `src/lib/manual/types.ts` (`StepOrigin`, `PlantPack`)
- Modify: `src/lib/manual/resolve.ts`
- Modify: `src/lib/manual/registry.ts`
- Modify: `src/lib/manual/summary.ts:16`
- Test: `src/lib/manual/resolve.test.ts`

**Interfaces:**
- Consumes: `GrowthForm` จาก `./forms/types` · `GenusPack` จาก `./genera/types`
- Produces: `resolveManual(pack: PlantPack, context: ResolveContext): ResolvedManual` โดย
  `ResolveContext = { library: Record<string, ManualStepDef>; form?: GrowthForm | null; genus?: GenusPack | null }`
  และ `StepOrigin = "core" | "form" | "genus" | "override" | "pack"`

- [ ] **Step 1: เขียนเทสต์ที่ยังไม่ผ่าน**

เพิ่มใน `src/lib/manual/resolve.test.ts`

```ts
import { describe, expect, it } from "vitest";

import { resolveManual } from "./resolve";
import type { ManualStepDef, PlantPack } from "./types";
import type { GrowthForm } from "./forms/types";
import type { GenusPack } from "./genera/types";

const evidence = { level: "adapted" as const, sourceIds: ["source-pp-2023"] };

function baseStep(id: string): ManualStepDef {
  return {
    id,
    title: "จากแกนกลาง",
    summary: "",
    why: "",
    materials: [],
    actions: [],
    passCriteria: [],
    stopConditions: [],
    safetyNotes: [],
    measurements: [],
    evidence,
    durationMinutes: null,
  };
}

const library: Record<string, ManualStepDef> = { cut: baseStep("cut") };

const form = {
  id: "f",
  label: "ทรง",
  plainDescription: "",
  landmarks: [],
  defaultExplant: { landmarkId: "node", offsetMm: 10, direction: "below", sizeMm: [15, 20], evidence },
  beginnerDifficulty: 1,
  whyThisDifficulty: "",
  stepOverrides: { cut: { title: "จากทรง" } },
} as unknown as GrowthForm;

const genus: GenusPack = {
  id: "g",
  growthFormId: "f",
  scientificName: "G",
  commonNames: [],
  deviations: { cut: { title: "จากสกุล" } },
  sourceIds: [],
};

function pack(overrides?: PlantPack["overrides"]): PlantPack {
  return {
    slug: "s",
    scientificName: "S",
    commonName: "ส",
    method: "node",
    summary: "",
    durationLabel: "",
    sequence: ["cut"],
    overrides,
    mediaRecipes: [],
    sourceIds: [],
  };
}

describe("การประกอบคู่มือแบบต่อชั้น", () => {
  it("ไม่มีชั้นบนเลย ใช้ค่าจากแกนกลาง", () => {
    const manual = resolveManual(pack(), { library });
    expect(manual.steps[0].title).toBe("จากแกนกลาง");
    expect(manual.steps[0].origin).toBe("core");
  });

  it("ทรงทับแกนกลาง", () => {
    const manual = resolveManual(pack(), { library, form });
    expect(manual.steps[0].title).toBe("จากทรง");
    expect(manual.steps[0].origin).toBe("form");
  });

  it("สกุลทับทรง", () => {
    const manual = resolveManual(pack(), { library, form, genus });
    expect(manual.steps[0].title).toBe("จากสกุล");
    expect(manual.steps[0].origin).toBe("genus");
  });

  it("ชนิดทับสกุล", () => {
    const manual = resolveManual(pack({ cut: { title: "จากชนิด" } }), { library, form, genus });
    expect(manual.steps[0].title).toBe("จากชนิด");
    expect(manual.steps[0].origin).toBe("override");
  });

  it("ชั้นบนที่ไม่ได้พูดถึงฟิลด์ไหน ฟิลด์นั้นตกทอดลงมา", () => {
    const manual = resolveManual(pack({ cut: { summary: "เฉพาะชนิด" } }), { library, form, genus });
    expect(manual.steps[0].title).toBe("จากสกุล");
    expect(manual.steps[0].summary).toBe("เฉพาะชนิด");
  });
});
```

- [ ] **Step 2: รันให้เห็นว่าพัง**

Run: `npx vitest run src/lib/manual/resolve.test.ts`
Expected: FAIL — `resolveManual` รับ argument ที่สองเป็น `Record<string, ManualStepDef>` ไม่ใช่ object

- [ ] **Step 3: ขยาย StepOrigin และ PlantPack**

`src/lib/manual/types.ts`

```ts
export type StepOrigin = "core" | "form" | "genus" | "override" | "pack";
```

และเพิ่มสามฟิลด์ใน `PlantPack`

```ts
export type PlantPack = {
  slug: string;
  scientificName: string;
  commonName: string;
  method: string;
  summary: string;
  durationLabel: string;
  /** ผูกขึ้นชั้นทรง ถ้าไม่ระบุจะ resolve ได้เฉพาะจากแกนกลาง */
  growthFormId?: string;
  genusId?: string;
  /** อ้างทะเบียนใน traits.ts */
  traitIds?: string[];
  sequence: string[];
  overrides?: Record<string, StepOverride>;
  steps?: Record<string, ManualStepDef>;
  mediaRecipes: MediaRecipe[];
  sourceIds: string[];
};
```

- [ ] **Step 4: เขียน resolveManual ใหม่**

`src/lib/manual/resolve.ts`

```ts
import type { GenusPack } from "./genera/types";
import type { GrowthForm } from "./forms/types";
import type { ManualStepDef, PlantPack, ResolvedManual, ResolvedStep, StepOrigin } from "./types";

export type ResolveContext = {
  library: Record<string, ManualStepDef>;
  form?: GrowthForm | null;
  genus?: GenusPack | null;
};

/** ประกอบคู่มือโดยทับค่าจากบนลงล่าง core → form → genus → species
 *  ชั้นล่างชนะเสมอ และฟิลด์ที่ชั้นล่างไม่พูดถึงจะตกทอดจากชั้นบนมาเอง
 *  origin บอกชั้นล่างสุดที่แตะขั้นนั้น ใช้ในหน้าตรวจทานเพื่อให้รู้ว่าค่ามาจากไหน */
export function resolveManual(pack: PlantPack, context: ResolveContext): ResolvedManual {
  const { library, form, genus } = context;
  const seen = new Set<string>();

  const steps: ResolvedStep[] = pack.sequence.map((stepId, index) => {
    if (seen.has(stepId)) throw new Error(`ขั้นตอน ${stepId} ถูกใส่ใน sequence ซ้ำ`);
    seen.add(stepId);

    const packStep = pack.steps?.[stepId];
    const override = pack.overrides?.[stepId];

    if (packStep && override) {
      throw new Error(`ขั้นตอน ${stepId} เป็นของแผ่นเสริมอยู่แล้ว ไม่ต้องใส่ override`);
    }

    const base = packStep ?? library[stepId];
    if (!base) throw new Error(`ไม่พบขั้นตอน ${stepId} ทั้งในแกนกลางและในแผ่นเสริม`);

    const formLayer = packStep ? undefined : form?.stepOverrides?.[stepId];
    const genusLayer = packStep ? undefined : genus?.deviations[stepId];

    let origin: StepOrigin = "core";
    if (packStep) origin = "pack";
    else if (override) origin = "override";
    else if (genusLayer) origin = "genus";
    else if (formLayer) origin = "form";

    return {
      ...structuredClone(base),
      ...(formLayer ?? {}),
      ...(genusLayer ?? {}),
      ...(override ?? {}),
      id: stepId,
      order: index,
      origin,
    };
  });

  return {
    slug: pack.slug,
    scientificName: pack.scientificName,
    commonName: pack.commonName,
    method: pack.method,
    summary: pack.summary,
    durationLabel: pack.durationLabel,
    steps,
    mediaRecipes: structuredClone(pack.mediaRecipes),
    sourceIds: [...pack.sourceIds],
  };
}
```

- [ ] **Step 5: อัปเดตผู้เรียก**

`src/lib/manual/registry.ts`

```ts
import { coreSteps } from "./core-steps";
import { formById } from "./forms/registry";
import { genusById } from "./genera/registry";
import { resolveManual } from "./resolve";
import { genericPhilodendronPack } from "./species/generic-philodendron";
import { pinkPrincessPack } from "./species/pink-princess";
import { violinVariegatedPack } from "./species/violin-variegated";
import type { PlantPack, ResolvedManual } from "./types";

export const plantPacks: PlantPack[] = [pinkPrincessPack, violinVariegatedPack, genericPhilodendronPack];

export function allSlugs(): string[] {
  return plantPacks.map((pack) => pack.slug);
}

export function packBySlug(slug: string): PlantPack | null {
  return plantPacks.find((pack) => pack.slug === slug) ?? null;
}

export function resolveBySlug(slug: string): ResolvedManual | null {
  const pack = packBySlug(slug);
  if (!pack) return null;
  return resolveManual(pack, {
    library: coreSteps,
    form: pack.growthFormId ? formById(pack.growthFormId) : null,
    genus: pack.genusId ? genusById(pack.genusId) : null,
  });
}
```

- [ ] **Step 6: อัปเดตตัวนับ origin**

`src/lib/manual/summary.ts:16`

```ts
  const byOrigin: Record<StepOrigin, number> = { core: 0, form: 0, genus: 0, override: 0, pack: 0 };
```

- [ ] **Step 7: หาที่อื่นที่พังจากการเปลี่ยน StepOrigin**

Run: `npx tsc --noEmit`
Expected: ชี้ `src/app/admin/manual/[slug]/page.tsx` ที่แสดง byOrigin — เพิ่มสองบรรทัดใหม่ในตารางแสดงผลให้ครบห้าค่า โดยใช้ป้าย `form: "ทรง"` และ `genus: "สกุล"`

- [ ] **Step 8: ผูกสามชนิดที่มีอยู่เข้ากับทรงและสกุล**

ในไฟล์ `src/lib/manual/species/pink-princess.ts`, `violin-variegated.ts`, `generic-philodendron.ts` เพิ่มสามบรรทัดต่อไฟล์ ถัดจาก `durationLabel`

```ts
  growthFormId: "climbing-vine-visible-node",
  genusId: "philodendron",
```

และเฉพาะ `pink-princess.ts` กับ `violin-variegated.ts` เพิ่ม

```ts
  traitIds: ["variegated"],
```

- [ ] **Step 9: รันเทสต์ทั้งชุด**

Run: `npm test && npm run lint && npm run build`
Expected: PASS ทั้งหมด · เทสต์เดิม 322 ข้อยังผ่าน เพราะทรงและสกุลยังไม่ทับค่าอะไร

- [ ] **Step 10: Commit**

```bash
git add src/lib/manual
git commit -m "feat: extend resolve cascade to core-form-genus-species"
```

---

### Task 8: การห่อคำศัพท์ในเนื้อหา

เนื้อหาในระบบนี้เป็นสตริงภาษาไทยซึ่งไม่มีช่องว่างคั่นคำ การหาคำอัตโนมัติจึงชนคำอื่นได้ (เช่น "ข้อ" ไปโดน "ข้อมูล" และ "ข้อควรระวัง") ต้องห่อด้วยมือด้วยรูปแบบ `[[landmarkId|ข้อความที่แสดง]]`

**Files:**
- Create: `src/lib/manual/terms.ts`
- Create: `src/lib/manual/terms.test.ts`

**Interfaces:**
- Consumes: `growthForms` จาก `./forms/registry`
- Produces:
  - `TermSpan = { kind: "text"; text: string } | { kind: "term"; termId: string; text: string }`
  - `parseTerms(source: string): TermSpan[]`
  - `termIdsIn(source: string): string[]`
  - `allTermIds(): Set<string>`

- [ ] **Step 1: เขียนเทสต์ที่ยังไม่ผ่าน**

`src/lib/manual/terms.test.ts`

```ts
import { describe, expect, it } from "vitest";

import { allTermIds, parseTerms, termIdsIn } from "./terms";

describe("การห่อคำศัพท์ในเนื้อหา", () => {
  it("ข้อความที่ไม่มีคำห่อ คืนชิ้นเดียว", () => {
    expect(parseTerms("ตัดให้ชิดโคน")).toEqual([{ kind: "text", text: "ตัดให้ชิดโคน" }]);
  });

  it("แยกคำที่ห่อไว้ออกจากข้อความรอบ ๆ", () => {
    expect(parseTerms("ตัดใต้[[node|ข้อ]]หนึ่งเซนติเมตร")).toEqual([
      { kind: "text", text: "ตัดใต้" },
      { kind: "term", termId: "node", text: "ข้อ" },
      { kind: "text", text: "หนึ่งเซนติเมตร" },
    ]);
  });

  it("รองรับหลายคำในประโยคเดียว", () => {
    const spans = parseTerms("[[node|ข้อ]]ไม่ใช่[[internode|ปล้อง]]");
    expect(spans.filter((span) => span.kind === "term")).toHaveLength(2);
  });

  it("ข้อความว่างคืน array ว่าง", () => {
    expect(parseTerms("")).toEqual([]);
  });

  it("เก็บ id ของทุกคำที่ถูกห่อ", () => {
    expect(termIdsIn("[[node|ข้อ]]กับ[[node|ข้อ]]และ[[internode|ปล้อง]]")).toEqual(["node", "node", "internode"]);
  });

  it("ทะเบียนคำศัพท์มาจาก landmarks ของทุกทรง", () => {
    expect(allTermIds().has("node")).toBe(true);
    expect(allTermIds().has("axillary-bud")).toBe(true);
  });
});
```

- [ ] **Step 2: รันให้เห็นว่าพัง**

Run: `npx vitest run src/lib/manual/terms.test.ts`
Expected: FAIL — `Cannot find module './terms'`

- [ ] **Step 3: เขียน implementation**

`src/lib/manual/terms.ts`

```ts
import { growthForms } from "./forms/registry";

export type TermSpan =
  | { kind: "text"; text: string }
  | { kind: "term"; termId: string; text: string };

/** ห่อคำด้วยมือเป็น [[landmarkId|ข้อความ]] แทนการจับคำอัตโนมัติ
 *  เพราะภาษาไทยไม่มีช่องว่างคั่นคำ การจับอัตโนมัติจะทำให้ "ข้อ" ไปโดน
 *  "ข้อมูล" และ "ข้อควรระวัง" ซึ่งผิดความหมายคนละเรื่อง */
const pattern = /\[\[([a-z0-9-]+)\|([^\]]+)\]\]/g;

export function parseTerms(source: string): TermSpan[] {
  const spans: TermSpan[] = [];
  let cursor = 0;

  for (const match of source.matchAll(pattern)) {
    const start = match.index;
    if (start > cursor) spans.push({ kind: "text", text: source.slice(cursor, start) });
    spans.push({ kind: "term", termId: match[1], text: match[2] });
    cursor = start + match[0].length;
  }

  if (cursor < source.length) spans.push({ kind: "text", text: source.slice(cursor) });
  return spans;
}

export function termIdsIn(source: string): string[] {
  return [...source.matchAll(pattern)].map((match) => match[1]);
}

export function allTermIds(): Set<string> {
  const ids = new Set<string>();
  for (const form of growthForms) for (const landmark of form.landmarks) ids.add(landmark.id);
  return ids;
}
```

- [ ] **Step 4: รันเทสต์**

Run: `npx vitest run src/lib/manual/terms.test.ts`
Expected: PASS ทั้ง 6 ข้อ

- [ ] **Step 5: Commit**

```bash
git add src/lib/manual/terms.ts src/lib/manual/terms.test.ts
git commit -m "feat: add explicit term wrapping for Thai content"
```

---

### Task 9: เทสต์บังคับว่าคำที่ห่อไว้ต้องมีอยู่จริง

**Files:**
- Modify: `src/lib/manual/evidence-rules.test.ts`

**Interfaces:**
- Consumes: `parseTerms`, `termIdsIn`, `allTermIds` จาก `./terms` · `resolveBySlug`, `allSlugs` จาก `./registry`
- Produces: ไม่มี API ใหม่

- [ ] **Step 1: เขียนเทสต์ที่ยังไม่ผ่าน**

เพิ่มไฟล์ใหม่ `src/lib/manual/term-integrity.test.ts` แทนการยัดใน evidence-rules เพราะคนละเรื่องกัน

```ts
import { describe, expect, it } from "vitest";

import { allSlugs, resolveBySlug } from "./registry";
import { growthForms } from "./forms/registry";
import { allTermIds, termIdsIn } from "./terms";
import { troubleshootingEntries } from "./troubleshooting";

/** รวมข้อความทุกชิ้นที่ผู้ใช้จะได้อ่าน พร้อมที่อยู่ของมัน เพื่อให้ error ชี้จุดได้ */
function allProse(): Array<{ where: string; text: string }> {
  const items: Array<{ where: string; text: string }> = [];

  for (const slug of allSlugs()) {
    const manual = resolveBySlug(slug)!;
    for (const step of manual.steps) {
      items.push({ where: `${slug}/${step.id}/summary`, text: step.summary });
      items.push({ where: `${slug}/${step.id}/why`, text: step.why });
      step.actions.forEach((line, i) => items.push({ where: `${slug}/${step.id}/actions[${i}]`, text: line }));
      step.passCriteria.forEach((line, i) => items.push({ where: `${slug}/${step.id}/pass[${i}]`, text: line }));
      step.stopConditions.forEach((line, i) => items.push({ where: `${slug}/${step.id}/stop[${i}]`, text: line }));
    }
  }

  for (const [id, entry] of Object.entries(troubleshootingEntries)) {
    items.push({ where: `trouble/${id}/symptom`, text: entry.symptom });
    items.push({ where: `trouble/${id}/likelyCause`, text: entry.likelyCause });
    entry.actions.forEach((line, i) => items.push({ where: `trouble/${id}/actions[${i}]`, text: line }));
  }

  for (const form of growthForms) {
    items.push({ where: `form/${form.id}/plainDescription`, text: form.plainDescription });
    for (const landmark of form.landmarks) {
      items.push({ where: `form/${form.id}/${landmark.id}/whatItIs`, text: landmark.whatItIs });
      items.push({ where: `form/${form.id}/${landmark.id}/howToFind`, text: landmark.howToFind });
    }
  }

  return items;
}

describe("ความสมบูรณ์ของคำศัพท์ในเนื้อหา", () => {
  it("ทุกคำที่ห่อไว้ต้องมีอยู่จริงในทะเบียน", () => {
    const known = allTermIds();
    for (const item of allProse()) {
      for (const id of termIdsIn(item.text)) {
        expect(known.has(id), `${item.where} ห่อคำ ${id} ที่ไม่มีในทะเบียน`).toBe(true);
      }
    }
  });

  it("คำอธิบายของจุดสังเกตห้ามห่อคำศัพท์ซ้อนเข้าไปอีก", () => {
    for (const form of growthForms) {
      for (const landmark of form.landmarks) {
        expect(
          termIdsIn(landmark.whatItIs).length,
          `form/${form.id}/${landmark.id} อธิบายศัพท์ด้วยศัพท์ ทำให้มือใหม่วนลูป`,
        ).toBe(0);
      }
    }
  });
});
```

- [ ] **Step 2: รันเทสต์**

Run: `npx vitest run src/lib/manual/term-integrity.test.ts`
Expected: PASS — ยังไม่มีเนื้อหาไหนห่อคำ เทสต์จึงผ่านแบบไม่มีอะไรให้ตรวจ แต่พร้อมจับทันทีที่เฟส 2 เริ่มเขียนเนื้อหา

- [ ] **Step 3: ห่อคำในขั้นเดียวเพื่อพิสูจน์ว่าเทสต์ทำงาน**

`src/lib/manual/core-steps.ts` ขั้น `select-explant` แก้ `summary`

```ts
    summary: "หา[[node|ข้อ]]ที่มี[[axillary-bud|ตาข้าง]]สมบูรณ์และยังไม่แตกยอด",
```

- [ ] **Step 4: รันเทสต์อีกครั้ง**

Run: `npx vitest run src/lib/manual/term-integrity.test.ts`
Expected: PASS — id ทั้งสองมีอยู่จริง

- [ ] **Step 5: พิสูจน์ว่าเทสต์จับของผิดได้จริง**

แก้ชั่วคราวเป็น `[[ไม่มีคำนี้|ข้อ]]` แล้วรัน
Expected: FAIL พร้อมข้อความ `.../summary ห่อคำ ไม่มีคำนี้ ที่ไม่มีในทะเบียน`
จากนั้น **แก้กลับ** เป็นค่าที่ถูกต้อง

- [ ] **Step 6: รันทั้งชุด**

Run: `npm test && npm run lint`
Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add src/lib/manual/term-integrity.test.ts src/lib/manual/core-steps.ts
git commit -m "test: enforce term references resolve to the registry"
```

---

### Task 10: สคริปต์รายงานคำที่ยังไม่ถูกห่อ

เป็น **รายงาน ไม่ใช่เทสต์ที่ทำให้ build พัง** เพราะภาษาไทยไม่มีช่องว่างคั่นคำ การจับคำอัตโนมัติจะให้ false positive จำนวนมาก (เช่น "ข้อ" ใน "ข้อมูล", "ข้อควรระวัง", "ข้อจำกัด") การบังคับด้วยเทสต์จะทำให้คนเขียนต้องไปแก้ของที่ไม่ผิด

**Files:**
- Create: `scripts/report-unwrapped-terms.mjs`
- Modify: `package.json` (เพิ่ม script)

**Interfaces:**
- Consumes: ไม่มี (อ่านไฟล์ตรง ๆ ด้วย regex ไม่ import โค้ด TypeScript)
- Produces: คำสั่ง `npm run terms:report`

- [ ] **Step 1: เขียนสคริปต์**

`scripts/report-unwrapped-terms.mjs`

```js
// รายงานตำแหน่งที่อาจลืมห่อคำศัพท์ ใช้ตาคนตัดสินอีกที ไม่ใช่เกตอัตโนมัติ
// เหตุผลที่ไม่ทำเป็นเทสต์ อยู่ในหัวข้อ Task 10 ของแผน 2026-08-05-growth-form-foundation.md
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const roots = ["src/lib/manual"];
const skip = /\.test\.ts$/;

// อ่านคำจากไฟล์ทรงโดยตรงด้วย regex เพื่อไม่ต้อง compile TypeScript
function knownTerms() {
  const terms = [];
  for (const file of walk("src/lib/manual/forms")) {
    if (skip.test(file)) continue;
    const text = readFileSync(file, "utf8");
    for (const match of text.matchAll(/id:\s*"([a-z0-9-]+)",\s*\n\s*term:\s*"([^"]+)"/g)) {
      terms.push({ id: match[1], term: match[2] });
    }
  }
  return terms;
}

function* walk(dir) {
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) yield* walk(path);
    else if (path.endsWith(".ts")) yield path;
  }
}

const terms = knownTerms();
let found = 0;

for (const root of roots) {
  for (const file of walk(root)) {
    if (skip.test(file) || file.includes("forms")) continue;
    const lines = readFileSync(file, "utf8").split("\n");
    lines.forEach((line, index) => {
      for (const { id, term } of terms) {
        if (!line.includes(term)) continue;
        if (line.includes(`[[${id}|`)) continue;
        found += 1;
        console.log(`${file}:${index + 1}  อาจลืมห่อ "${term}" (${id})`);
        console.log(`  ${line.trim()}`);
      }
    });
  }
}

console.log(found === 0 ? "ไม่พบคำที่น่าสงสัย" : `พบ ${found} จุดที่ควรตรวจด้วยตา`);
```

- [ ] **Step 2: เพิ่ม script ใน package.json**

`package.json` ในบล็อก `scripts` ต่อจาก `"ui:verify"`

```json
    "terms:report": "node scripts/report-unwrapped-terms.mjs",
```

- [ ] **Step 3: รันดูผล**

Run: `npm run terms:report`
Expected: พิมพ์รายการจุดที่น่าสงสัยและจบด้วยจำนวนรวม โดย exit code เป็น 0 เสมอ

- [ ] **Step 4: Commit**

```bash
git add scripts/report-unwrapped-terms.mjs package.json
git commit -m "chore: add unwrapped-term report script"
```

---

### Task 11: อัปเดตเอกสารระบบ

**Files:**
- Modify: `project_summary.md` (ส่วนที่ 3, 4, และเพิ่มส่วนใหม่)

**Interfaces:**
- Consumes: ผลของ Task 1–10
- Produces: ไม่มีโค้ด

- [ ] **Step 1: แก้ส่วนที่ 3 · โครงเนื้อหาคู่มือ**

เพิ่มบรรทัดในบล็อกโครงสร้างไฟล์

```
forms/            ชั้นทรงการเติบโต คำศัพท์และจุดสังเกต ใช้ร่วมกันข้ามสกุล
genera/           ชั้นสกุล เก็บเฉพาะส่วนที่ต่างจากทรง
traits.ts         ลักษณะพันธุ์ที่ตัดข้ามสกุล เช่นความด่าง
terms.ts          แยกคำศัพท์ที่ห่อด้วย [[id|ข้อความ]] ออกจากข้อความ
evidence-level.ts กฎจุดอ่อนที่สุดของคู่มือ
```

และแก้ประโยคที่อธิบายการประกอบเป็น `core → form → genus → species`

- [ ] **Step 2: แก้ส่วนที่ 4 · ระบบหลักฐาน**

เพิ่มระดับที่สี่และกฎใหม่ในตาราง

```markdown
สี่ระดับ `species-direct` ตรงพันธุ์ · `adapted` ประยุกต์ · `unsupported` ยังไม่มีงานรองรับ
· `botanical-fact` ข้อมูลจากตำรา

| กฎ | ไฟล์ที่บังคับ |
|---|---|
| ข้อมูลจากตำราต้องระบุ `sourceIds` | `evidence-rules.test.ts` |
| ทุก `growthFormId` และ `genusId` ที่อ้าง ต้องมีอยู่จริง | `genera/registry.test.ts` |
| จุดตัดต้องอ้าง landmark ที่มีในทรงนั้น | `forms/registry.test.ts` |
| มีพิกัดได้เมื่อทรงมีภาพอ้างอิงเท่านั้น | `forms/registry.test.ts` |
| คำที่ห่อไว้ต้องมีอยู่จริงในทะเบียน | `term-integrity.test.ts` |
| คำอธิบายจุดสังเกตห้ามห่อศัพท์ซ้อน | `term-integrity.test.ts` |

**กฎจุดอ่อนที่สุด** อยู่ที่ `evidence-level.ts` และ **นับเฉพาะข้ออ้าง ไม่นับ `botanical-fact`**
เหตุผลอยู่ในส่วนที่ 4.4 ของสเปก `2026-08-05-growth-form-first-redesign-design.md`
```

- [ ] **Step 3: เพิ่มกฎเนื้อหาสำหรับมือใหม่ข้อ 3**

ต่อจากข้อ 2 ในส่วนที่ 4

```markdown
3. **ห้ามใช้ศัพท์เทคนิคที่ยังไม่มีในทะเบียนคำศัพท์** ถ้าจะใช้ ต้องเพิ่ม landmark ในทรงที่เกี่ยวข้อง
   พร้อม `howToFind` ก่อน แล้วห่อคำในเนื้อหาเป็น `[[landmarkId|ข้อความ]]`
   ตรวจจุดที่อาจลืมห่อด้วย `npm run terms:report` ซึ่งเป็นรายงานให้คนอ่าน ไม่ใช่เกตอัตโนมัติ
   เพราะภาษาไทยไม่มีช่องว่างคั่นคำ การจับอัตโนมัติจึงให้ false positive มาก
```

- [ ] **Step 4: รันเทสต์ทั้งชุดครั้งสุดท้าย**

Run: `npm test && npm run lint && npm run build`
Expected: PASS ทั้งหมด

- [ ] **Step 5: Commit**

```bash
git add project_summary.md
git commit -m "docs: document the growth form layer and its enforced rules"
```

---

## หมายเหตุที่ต่างจากสเปก

**สเปก §8 ระบุว่า "คำในทะเบียนที่โผล่ในเนื้อหาโดยไม่ถูกห่อ = fail"** แผนนี้ทำเป็น
`npm run terms:report` แทน เพราะภาษาไทยไม่มีช่องว่างคั่นคำ คำว่า "ข้อ" จะไปตรงกับ
"ข้อมูล" "ข้อควรระวัง" "ข้อจำกัด" ทำให้เทสต์แดงจากของที่ไม่ผิด และคนเขียนจะเริ่มหาทางเลี่ยง
สิ่งที่บังคับด้วยเทสต์แทนคือ **ทิศทางกลับกัน** คือทุกคำที่ห่อไว้ต้องมีอยู่จริงในทะเบียน
ซึ่งจับ typo และคำที่ถูกลบทิ้งได้แน่นอนโดยไม่มี false positive

ต้องแก้สเปก §8 ให้ตรงกันก่อนเริ่ม Task 1
