# Rounds and the Single Runner Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** ให้ผู้ใช้ที่ล็อกอินแล้วเริ่มรอบเพาะจากคู่มือ เดินทีละขั้น และบันทึกค่ากับบันทึกข้อความได้ โดยยังจดได้แม้เน็ตหลุด

**Architecture:** ไม่สร้างที่เก็บข้อมูลใหม่ รอบเพาะแมปลงบน `ExperimentLot` และ `ProtocolStepRun` ที่มีอยู่แล้ว โดยใช้ `protocolId` เก็บ slug ของคู่มือและ `stepId` เก็บ id ของขั้นจากแกนกลาง จึงไม่ต้อง migrate Firestore และไม่ต้องแก้ security rules การเขียนทั้งหมดผ่าน repository interface เดิมเท่านั้น ห้ามเรียก Firestore SDK จาก component

**Tech Stack:** TypeScript, Next.js 16, React 19, Firebase Firestore, Vitest 4

## Global Constraints

- **ห้ามเรียก Firestore SDK ตรงจาก component** ต้องผ่าน repository interface เดิมเสมอ
- รอบเพาะใช้ collection เดิม ไม่สร้าง collection ใหม่ ไม่แก้ `firestore.rules`
- หน้าใหม่ใช้ token `--pl-` และ class `pl-` เหมือนเฟส 2
- **ไม่มีการอัปโหลดรูปในแผนนี้** เพราะรูปต้องผ่าน observation กับ Cloudinary และตกลงแล้วว่าออฟไลน์ไม่ต้องถ่ายรูป ให้ไปทำในแผนถัดไปพร้อมการลบของเก่า ห้ามใส่ปุ่มถ่ายรูปที่กดแล้วไม่ทำงาน
- ข้อความที่ผู้ใช้เห็นเป็นภาษาไทย และชื่อระบบคือ Plantlover Lab
- ห้าม commit `package-lock.json`
- รัน `npm test` และ `npm run lint` ก่อน commit ทุกครั้ง

---

### Task 1: Require a search record for unsupported claims

ปิดข้อผูกมัดจากเฟส 3.5 ก่อน เพราะเป็นกฎของชั้นข้อมูลที่ทุกอย่างหลังจากนี้พึ่งพา

**Files:**
- Modify: `src/lib/manual/types.ts`
- Modify: `src/lib/manual/core-steps.ts`
- Modify: `src/lib/manual/troubleshooting.ts`
- Modify: `src/lib/manual/species/*.ts`
- Modify: `src/lib/manual/sources.ts`
- Test: `src/lib/manual/evidence-rules.test.ts`

**Interfaces:**
- Produces: `EvidenceRef` ที่มี `searchedAt?: string` และ `searchQueries?: string[]`

- [ ] **Step 1: Write the failing test**

สร้าง `src/lib/manual/evidence-rules.test.ts`

```ts
import { describe, expect, it } from "vitest";
import { coreSteps } from "./core-steps";
import { allSlugs, resolveBySlug } from "./registry";
import { troubleshootingEntries } from "./troubleshooting";
import type { EvidenceRef } from "./types";

function collect(): Array<{ where: string; evidence: EvidenceRef }> {
  const items: Array<{ where: string; evidence: EvidenceRef }> = [];
  for (const [id, step] of Object.entries(coreSteps)) items.push({ where: `core/${id}`, evidence: step.evidence });
  for (const [id, entry] of Object.entries(troubleshootingEntries)) items.push({ where: `trouble/${id}`, evidence: entry.evidence });
  for (const slug of allSlugs()) {
    const manual = resolveBySlug(slug)!;
    for (const step of manual.steps) items.push({ where: `${slug}/${step.id}`, evidence: step.evidence });
    for (const recipe of manual.mediaRecipes) items.push({ where: `${slug}/recipe/${recipe.id}`, evidence: recipe.evidence });
  }
  return items;
}

describe("กฎของหลักฐาน", () => {
  it("ข้ออ้างว่ามีงานรองรับ ต้องระบุแหล่ง", () => {
    for (const item of collect()) {
      if (item.evidence.level === "unsupported") continue;
      expect(item.evidence.sourceIds.length, `${item.where} ไม่ระบุแหล่ง`).toBeGreaterThan(0);
    }
  });

  it("ข้ออ้างว่าไม่มีงานรองรับ ต้องบันทึกว่าค้นอะไรไปแล้วและค้นเมื่อไหร่", () => {
    for (const item of collect()) {
      if (item.evidence.level !== "unsupported") continue;
      expect(item.evidence.searchedAt, `${item.where} ไม่บันทึกวันที่ค้น`).toBeTruthy();
      expect(item.evidence.searchQueries?.length, `${item.where} ไม่บันทึกคำค้น`).toBeGreaterThan(0);
    }
  });

  it("วันที่ค้นเป็นรูปแบบ YYYY-MM-DD", () => {
    for (const item of collect()) {
      if (!item.evidence.searchedAt) continue;
      expect(item.evidence.searchedAt, `${item.where} รูปแบบวันที่ผิด`).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });
});
```

- [ ] **Step 2: Run test to verify it fails** — `npx vitest run src/lib/manual/evidence-rules.test.ts`
- [ ] **Step 3: Add the two optional fields to `EvidenceRef`**

```ts
export type EvidenceRef = {
  level: EvidenceLevel;
  sourceIds: string[];
  note?: string;
  /** บังคับเมื่อ level เป็น unsupported เพื่อให้ตรวจย้อนได้ว่าช่องว่างจริงหรือค้นไม่พอ */
  searchedAt?: string;
  searchQueries?: string[];
};
```

- [ ] **Step 4: Fill the search record on every `unsupported` claim** ใช้ `searchedAt: "2026-08-02"` และคำค้นจริงที่ใช้ เช่น สำหรับขั้นฟอกของ Pink Princess

```ts
searchedAt: "2026-08-02",
searchQueries: [
  "Philodendron erubescens Pink Princess micropropagation explant",
  "Philodendron erubescens synonyms POWO",
  "Philodendron erubescens sibling cultivars Red Emerald Burgundy micropropagation",
  "การเพาะเลี้ยงเนื้อเยื่อ ฟิโลเดนดรอน พิงค์ปริ๊นเซส",
],
```

- [ ] **Step 5: Fix the IPNI identifier** ใน `sources.ts` เปลี่ยน `source-kew-philodendron` ให้ชี้ระดับสปีชีส์ที่ `87759-1` และเพิ่มรายการระดับสกุลแยกไว้ถ้ายังต้องใช้
- [ ] **Step 6: Run the full suite** — `npm test`
- [ ] **Step 7: Commit** — `git commit -m "feat(manual): require a search record on every unsupported claim"`

---

### Task 2: Round adapter

**Files:**
- Create: `src/lib/rounds/round-adapter.ts`
- Test: `src/lib/rounds/round-adapter.test.ts`

**Interfaces:**
- Produces:
  - `type RoundStepState = { stepId: string; order: number; status: GuidedStepStatus; note: string; measurements: Record<string, number | null>; completedAt?: string }`
  - `type RoundView = { lotId: string; slug: string; title: string; steps: Array<ResolvedStep & { state: RoundStepState }>; currentStepNumber: number; passedCount: number }`
  - `buildRoundView(lot: ExperimentLot, runs: ProtocolStepRun[], manual: ResolvedManual): RoundView`
  - `newLotInput(slug: string, manual: ResolvedManual, startedAt: string): CreateLotInput`

- [ ] **Step 1: Write the failing test** — ครอบคลุมว่า
  - ขั้นที่ยังไม่มี run ได้สถานะ `Pending`
  - `currentStepNumber` คือขั้นแรกที่ยังไม่ `Passed`
  - ถ้าผ่านครบทุกขั้น `currentStepNumber` เท่ากับจำนวนขั้น
  - `newLotInput` ใส่ slug ลง `protocolId` และตั้ง `workflowVersion` เป็น `"v2"`
- [ ] **Step 2: Run test to verify it fails**
- [ ] **Step 3: Write the adapter as pure functions** ไม่มี I/O ไม่มี React
- [ ] **Step 4: Run test to verify it passes**
- [ ] **Step 5: Commit**

---

### Task 3: Offline foundation

**Files:**
- Modify: `src/lib/firebase/client.ts`
- Create: `src/components/rounds/online-status.tsx`
- Test: `src/components/rounds/online-status.test.tsx`

**Interfaces:**
- Produces: `OnlineStatus()` ที่แสดงแถบเตือนเมื่อออฟไลน์

- [ ] **Step 1: Write the failing test** ว่า `OnlineStatus` render เป็น `role="status"` และมีข้อความว่าบันทึกไว้ในเครื่องแล้วจะซิงก์ให้เมื่อกลับมาออนไลน์
- [ ] **Step 2: Run test to verify it fails**
- [ ] **Step 3: Switch Firestore to a persistent local cache**

```ts
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from "firebase/firestore";

const firestore = initializeFirestore(app, {
  localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
});
```

ถ้า `initializeFirestore` ถูกเรียกซ้ำจะโยน error ให้ห่อด้วย `try` แล้ว fallback เป็น `getFirestore(app)`
เพราะโมดูลนี้ถูก import จากหลายหน้า

- [ ] **Step 4: Write `OnlineStatus`** เป็น client component ที่ฟัง `online` และ `offline` บน `window` ห้ามใช้ `setState` ใน effect เปล่า ให้ใช้ `useSyncExternalStore`
- [ ] **Step 5: Run test, lint, and build**
- [ ] **Step 6: Commit**

---

### Task 4: Rounds list and creating a round

**Files:**
- Create: `src/components/rounds/round-list.tsx`
- Test: `src/components/rounds/round-list.test.tsx`
- Create: `src/app/my/rounds/page.tsx`
- Modify: `src/components/guide/step-map.tsx`
- Modify: `src/components/guide/step-map.test.tsx`

- [ ] **Step 1: Write the failing tests**
  - `RoundList` แสดงชื่อคู่มือ วันที่เริ่ม และความคืบหน้าเป็น `ผ่านแล้ว x จาก y ขั้น`
  - เมื่อยังไม่มีรอบ แสดงข้อความชวนให้เลือกต้นจากหน้าคู่มือ พร้อมลิงก์ไป `/`
  - `StepMap` มีปุ่ม `เริ่มรอบเพาะของฉัน` ที่ลิงก์ไป `/my/rounds/new?slug=<slug>`
- [ ] **Step 2: Run tests to verify they fail**
- [ ] **Step 3: Write `RoundList`**
- [ ] **Step 4: Write `/my/rounds/page.tsx`** เป็น client component ที่ห่อด้วย `AuthGate` โหลดผ่าน `getExperimentRepository`
- [ ] **Step 5: Add the call to action to `StepMap`**
- [ ] **Step 6: Run tests and lint**
- [ ] **Step 7: Commit**

---

### Task 5: Round overview

**Files:**
- Create: `src/components/rounds/round-progress.tsx`
- Test: `src/components/rounds/round-progress.test.tsx`
- Create: `src/app/my/rounds/[roundId]/page.tsx`
- Create: `src/app/my/rounds/new/page.tsx`

- [ ] **Step 1: Write the failing test**
  - แสดงทุกขั้นพร้อมสถานะ และไฮไลต์ขั้นปัจจุบัน
  - ขั้นที่ผ่านแล้วแสดงค่าที่บันทึกไว้
  - ลิงก์ของแต่ละขั้นไปที่ `/my/rounds/<id>/step/<n>` โดยเลขเริ่มที่ 1
- [ ] **Step 2: Run test to verify it fails**
- [ ] **Step 3: Write `RoundProgress`**
- [ ] **Step 4: Write the two pages** หน้า `new` สร้าง lot จาก `slug` แล้ว redirect ไปหน้ารอบ
- [ ] **Step 5: Run tests, lint, and build**
- [ ] **Step 6: Commit**

---

### Task 6: The single step runner

**Files:**
- Create: `src/components/rounds/step-runner.tsx`
- Test: `src/components/rounds/step-runner.test.tsx`
- Create: `src/app/my/rounds/[roundId]/step/[step]/page.tsx`

**Interfaces:**
- Consumes: `StepRunRepository.save`, `buildRoundView`
- Produces: `StepRunner({ manual, step, state, onSave, offline })`

- [ ] **Step 1: Write the failing tests**
  - แสดงเนื้อหาขั้นเดียวกับหน้าคู่มือ คือสิ่งที่ต้องลงมือ เกณฑ์ผ่าน จุดที่ต้องหยุด และอาการที่อาจเจอ
  - มีช่องกรอกทุก `measurement` ที่ขั้นนั้นกำหนด และช่องที่ `required` ต้องมี `aria-required`
  - มีปุ่ม `ผ่าน` และ `ติดปัญหา`
  - เมื่อออฟไลน์ยังกดบันทึกได้ และแสดงข้อความว่าบันทึกไว้ในเครื่องแล้ว
  - **ไม่มีปุ่มถ่ายรูปในแผนนี้**
- [ ] **Step 2: Run tests to verify they fail**
- [ ] **Step 3: Write `StepRunner`**
- [ ] **Step 4: Write the page** ที่ต่อ repository เข้ากับ component
- [ ] **Step 5: Run tests, lint, and build**
- [ ] **Step 6: Commit**

---

### Task 7: Brand fix and end to end check

**Files:**
- Modify: `src/components/auth/auth-gate.tsx`
- Modify: `handoff.md`

- [ ] **Step 1: Replace the remaining brand leak** ใน `auth-gate.tsx` ยังเขียนว่า `เข้าสู่ Philodendron Lab` ต้องเปลี่ยนเป็น Plantlover Lab
- [ ] **Step 2: Run `npm run build` แล้ว `npx next start -p 3100`**
- [ ] **Step 3: Walk the whole flow by hand** เปิด `/` เลือกต้น อ่านคู่มือ กดเริ่มรอบ เข้าโหมดสาธิต เดินขั้นที่ 1 บันทึกค่า แล้วดูว่าหน้ารอบอัปเดต
- [ ] **Step 4: Test offline** ปิดเน็ตใน DevTools แล้วบันทึกขั้น ตรวจว่าแถบเตือนขึ้นและค่าที่กรอกไม่หาย
- [ ] **Step 5: Record the result in `handoff.md`** เขียนผลจริงที่เห็น ห้ามเขียนว่าผ่านถ้ายังไม่ได้ลอง
- [ ] **Step 6: Commit**

---

## Self-Review Notes

**ไม่อยู่ในแผนนี้และต้องทำในแผนถัดไป** การอัปโหลดรูปในขั้นตอน, การลบ runner เดิมทั้ง 4 ตัว,
การลบ `philodendron-knowledge.ts` และ `protocol-templates.ts`, การลบเส้นทางเก่าอย่าง `/experiments`
และ `/protocols` เหตุผลที่แยกคือการลบของเก่ามีความเสี่ยงต่อ regression สูงและควรอยู่ใน PR ของตัวเอง
ที่รีวิวแยกได้ ระหว่างนี้เส้นทางเก่ายังทำงานคู่ขนานกับเส้นทางใหม่ได้โดยไม่ชนกัน

**ความเสี่ยงที่รู้ตัว** `initializeFirestore` ต้องถูกเรียกก่อน `getFirestore` ครั้งแรกเสมอ
ถ้ามีโค้ดเดิมเรียก `getFirestore` ก่อน จะได้ instance ที่ไม่มีแคช ต้องตรวจว่า `getFirebaseServices`
เป็นทางเข้าเดียวจริงก่อนแก้
