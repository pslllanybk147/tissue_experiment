# Shared Troubleshooting Knowledge Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** ทำให้คู่มือตอบคำถาม "ตัดแล้วเจออะไร ต้องทำอะไรต่อ" ได้ ด้วยคลังอาการที่ใช้ร่วมกันทุกพืช ไม่ใช่ความรู้เฉพาะ Pink Princess

**Architecture:** อาการเก็บเป็นคลังกลางที่ `src/lib/manual/troubleshooting.ts` แต่ละขั้นอ้างถึงด้วย `troubleshootingIds` แล้ว resolve ตอน render เหมือนที่ `sourceById` ทำอยู่ จึงไม่ต้องแก้ signature ของ `resolveManual` และแผ่นเสริมรายชนิดทับรายการอาการได้ผ่าน `overrides` ตามกลไกเดิม

**Tech Stack:** TypeScript, Next.js 16, React 19, Vitest 4

## Global Constraints

- อาการต้องอยู่ในคลังกลาง ห้ามเขียนฝังในขั้นของพืชชนิดใดชนิดหนึ่ง เว้นแต่เป็นอาการเฉพาะพันธุ์จริง
- ทุกอาการที่ `evidence.level` ไม่ใช่ `unsupported` ต้องมี `sourceIds` อย่างน้อย 1 รายการ
- ตัวเลขความเข้มข้นสารฟอกต้องระบุให้ชัดว่าเป็น **คลอรีนออกฤทธิ์** หรือ **สัดส่วนน้ำยาจากขวด** ห้ามเขียนลอย ๆ ว่ากี่เปอร์เซ็นต์
- ห้าม commit `package-lock.json`
- รัน `npm test` และ `npm run lint` ก่อน commit ทุกครั้ง

---

### Task 1: Troubleshooting library

**Files:**
- Modify: `src/lib/manual/types.ts`
- Create: `src/lib/manual/troubleshooting.ts`
- Test: `src/lib/manual/troubleshooting.test.ts`
- Modify: `src/lib/manual/sources.ts`

**Interfaces:**
- Produces: `TroubleshootingEntry`, `troubleshootingEntries: Record<string, TroubleshootingEntry>`, `troubleshootingById(id: string): TroubleshootingEntry | null` และฟิลด์ใหม่ `ManualStepDef.troubleshootingIds?: string[]`

- [ ] **Step 1: Write the failing test** — ครอบคลุมว่าแยกสาเหตุการดำสองแบบได้ และทุกอาการที่อ้างหลักฐานมีแหล่ง
- [ ] **Step 2: Run test to verify it fails**
- [ ] **Step 3: Add `TroubleshootingEntry` และ `troubleshootingIds` ใน types**
- [ ] **Step 4: Write the library with browning and contamination entries**
- [ ] **Step 5: Add the four new sources**
- [ ] **Step 6: Run test to verify it passes**
- [ ] **Step 7: Commit**

### Task 2: Wire troubleshooting into the core steps

**Files:**
- Modify: `src/lib/manual/core-steps.ts`
- Modify: `src/lib/manual/core-steps.test.ts`

**Interfaces:**
- Consumes: `troubleshootingById` จาก Task 1

- [ ] **Step 1: Add the failing assertion** ว่าขั้นตัด ฟอก และตรวจเชื้อ ต้องมีอาการผูกอยู่ และทุก id ต้อง resolve ได้
- [ ] **Step 2: Run test to verify it fails**
- [ ] **Step 3: Attach ids to `cut`, `sterilize`, `check-contamination`**
- [ ] **Step 4: Add the sterilant strength guidance and the cross-step acid warning to `sterilize`**
- [ ] **Step 5: Run test to verify it passes**
- [ ] **Step 6: Commit**

### Task 3: Show troubleshooting on the step page

**Files:**
- Modify: `src/components/guide/step-detail.tsx`
- Modify: `src/components/guide/step-detail.test.tsx`
- Modify: `src/components/guide/illustrations.tsx`
- Modify: `src/lib/manual/core-steps.ts`

**Interfaces:**
- Consumes: `troubleshootingById`, `EvidenceBadge`

- [ ] **Step 1: Add failing tests** ว่าแสดงหัวข้ออาการ วิธีแยก และสิ่งที่ต้องทำต่อ
- [ ] **Step 2: Run tests to verify they fail**
- [ ] **Step 3: Render the troubleshooting section**
- [ ] **Step 4: Add the browning comparison illustration**
- [ ] **Step 5: Run tests, lint, and build**
- [ ] **Step 6: Commit**

### Task 4: Record the Pink Princess evidence update

**Files:**
- Modify: `src/lib/manual/species/pink-princess.ts`
- Modify: `src/lib/manual/registry.test.ts`
- Modify: `docs/philodendron/pink-princess.md`
- Modify: `docs/superpowers/manual-authoring-protocol.md`

- [ ] **Step 1: Add failing test** ว่าขั้นเพิ่มยอดอ้างสองแหล่งแล้ว และมีทางเลือกออกรากที่สอง
- [ ] **Step 2: Run test to verify it fails**
- [ ] **Step 3: Add the Thai paper to the multiply and root evidence**
- [ ] **Step 4: Update the docs and the authoring protocol**
- [ ] **Step 5: Run the full suite and commit**
