# Step Evidence Photos Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** ให้ผู้ใช้แนบรูปเป็นหลักฐานของขั้นตอนที่กำลังทำได้ และเห็นรูปที่แนบไว้แล้วเมื่อกลับมาดู

**Architecture:** รูปผูกกับ observation ตามโครงข้อมูลเดิม โดยแต่ละขั้นของแต่ละรอบมี observation หนึ่งรายการชนิด `protocol-step-evidence` ทำหน้าที่เป็นที่แขวนรูป ระบบสร้าง observation นั้นให้อัตโนมัติเมื่อผู้ใช้จะแนบรูปครั้งแรก แล้วเก็บ id ไว้ที่ `ProtocolStepRun.evidenceObservationId` การอัปโหลดยังใช้ `MediaUploader` เดิมที่ผ่าน `/api/media/sign` และ Cloudinary

**Tech Stack:** TypeScript, Next.js 16, React 19, Firestore, Cloudinary, Vitest 4

## สิ่งที่ค้นพบก่อนเริ่ม และเปลี่ยนวิธีทำ

**ระบบเดิมไม่เคยต่อการแนบรูปรายขั้นให้เสร็จ** `guided-protocol-runner.tsx` อ่านค่า `run?.evidenceObservationId`
เพื่อตัดสินใจว่าจะเปิดพื้นที่อัปโหลดไหม แต่ไล่ทั้ง repo แล้วไม่มีที่ไหนเขียนค่านั้นเลย ผู้ใช้จึงเห็นข้อความ
`กด บันทึกร่าง ก่อน แล้วระบบจะเปิดพื้นที่อัปโหลดภาพของขั้นนี้` ค้างอยู่ตลอด แผนนี้จึงเป็นการสร้างของใหม่
ไม่ใช่การย้ายของเดิม

## Global Constraints

- ห้ามเรียก Firestore SDK ตรงจาก component ต้องผ่าน repository interface
- **ห้ามแสดงปุ่มแนบรูปเมื่อออฟไลน์หรือเมื่ออยู่ในโหมดสาธิต** เพราะการอัปโหลดต้องใช้ผู้ใช้จริงและต้องมีเครือข่าย
  ต้องอธิบายเหตุผลแทนการซ่อนเงียบ ๆ
- ใช้ token `--pl-` และ class `pl-`
- ห้าม commit `package-lock.json`
- รัน `npm test` และ `npm run lint` ก่อน commit ทุกครั้ง

---

### Task 1: Evidence observation helper

**Files:**
- Create: `src/lib/rounds/step-evidence.ts`
- Test: `src/lib/rounds/step-evidence.test.ts`

**Interfaces:**
- Produces: `evidenceObservationInput(stepId: string, observedAt: string): ObservationInput`
  และ `findEvidenceObservation(observations: Observation[], stepId: string): Observation | null`

- [ ] **Step 1: Write the failing test** ครอบคลุมว่า
  - input ที่สร้างมี `kind` เป็น `protocol-step-evidence` และ `protocolStepId` ตรงกับขั้น
  - ค่านับต่าง ๆ เป็น null เพราะเป็นที่แขวนรูป ไม่ใช่การสังเกตผล
  - `findEvidenceObservation` หาเจอเฉพาะรายการที่เป็นหลักฐานของขั้นนั้น ไม่ปนกับ observation ที่ผู้ใช้จดเอง
  - รายการที่ถูกลบแล้วไม่ถูกเลือก
- [ ] **Step 2: Run test to verify it fails**
- [ ] **Step 3: Write the helper as pure functions**
- [ ] **Step 4: Run test to verify it passes**
- [ ] **Step 5: Commit**

---

### Task 2: Step photos component

**Files:**
- Create: `src/components/rounds/step-photos.tsx`
- Test: `src/components/rounds/step-photos.test.tsx`

**Interfaces:**
- Produces: `StepPhotos({ lotId, observationId, media, canAttach, reason, onUploaded })`

- [ ] **Step 1: Write the failing tests**
  - เมื่อ `canAttach` เป็นจริงและมี `observationId` แสดงตัวอัปโหลด
  - เมื่อ `canAttach` เป็นเท็จ **ไม่แสดงตัวอัปโหลด แต่แสดงเหตุผลที่ส่งมา**
  - รูปที่แนบไว้แล้วแสดงเป็นลิงก์เปิดดูภาพเต็ม พร้อม `alt` ที่มีความหมาย
  - เมื่อยังไม่มีรูป แสดงข้อความว่ายังไม่มีรูปของขั้นนี้
- [ ] **Step 2: Run tests to verify they fail**
- [ ] **Step 3: Write the component** ใช้ `MediaUploader` เดิมเมื่อแนบได้
- [ ] **Step 4: Run tests to verify they pass**
- [ ] **Step 5: Commit**

---

### Task 3: Wire photos into the step runner

**Files:**
- Modify: `src/components/rounds/step-runner.tsx`
- Modify: `src/components/rounds/step-runner.test.tsx`
- Modify: `src/app/my/rounds/[roundId]/step/[step]/page.tsx`

- [ ] **Step 1: Update the failing tests**
  - แทนเทสต์เดิมที่ยืนยันว่าไม่มีปุ่มถ่ายรูป ด้วยเทสต์ว่าแสดงส่วนหลักฐานภาพ
  - เมื่อแนบไม่ได้ ต้องอธิบายเหตุผล ไม่ใช่หายไปเฉย ๆ
- [ ] **Step 2: Run tests to verify they fail**
- [ ] **Step 3: Add the photos section to `StepRunner`** โดยรับ props ที่ตัดสินแล้วจากหน้า ไม่ตัดสินเอง
- [ ] **Step 4: Wire the page** สร้าง observation เมื่อจะแนบรูปครั้งแรก เก็บ id ลง step run แล้วโหลดรูปมาแสดง
- [ ] **Step 5: Run tests, lint, and build**
- [ ] **Step 6: Commit**

---

### Task 4: Verify what can be verified, and say what cannot

**Files:**
- Modify: `handoff.md`

- [ ] **Step 1: Run the whole suite, lint, and build**
- [ ] **Step 2: Walk the flow in demo mode** ยืนยันว่าเห็นส่วนหลักฐานภาพพร้อมคำอธิบายว่าทำไมยังแนบไม่ได้
- [ ] **Step 3: Test offline** ยืนยันว่าเหตุผลเปลี่ยนเป็นเรื่องออฟไลน์
- [ ] **Step 4: Record honestly in `handoff.md`**

**ต้องเขียนให้ชัดว่าการอัปโหลดจริงยังไม่ได้ทดสอบ** เพราะต้องใช้ Firebase Auth กับ Cloudinary credentials
ที่เครื่องนี้ไม่มี ห้ามเขียนว่าผ่าน ให้ระบุว่าเป็นสิ่งที่ต้องยืนยันบน deployment ที่ตั้งค่าแล้ว

- [ ] **Step 5: Commit**

---

## Self-Review Notes

**ไม่อยู่ในแผนนี้** การลบ runner เดิมทั้งสี่ตัว การลบเส้นทางเก่า และการลบ `philodendron-knowledge.ts`
เหตุผลคือไล่สายพึ่งพาแล้วพบว่า `philodendron-knowledge.ts` มีของพึ่งพา 9 จุด รวมถึง
`firestore-protocol-repository.ts` ซึ่งเป็น repository ที่ตกลงไว้ตั้งแต่เฟส 1 ว่าจะเก็บ และหน้า `/knowledge`
ที่จะถูกลบยังเป็นที่อยู่ของเครื่องคำนวณสูตรอาหารสองตัวที่คู่มือใหม่อ้างถึงในขั้นทำอาหาร
การลบจึงต้องรอให้เฟส 4 สร้างของทดแทนก่อน มิฉะนั้นจะเหลือคู่มือที่ชี้ไปยังเครื่องมือที่ไม่มีอยู่จริง

**ความเสี่ยงที่รู้ตัว** แผนนี้ยืนยัน end to end ในเครื่องไม่ได้ เพราะการอัปโหลดต้องมีผู้ใช้จริงและ
credentials ของ Cloudinary สิ่งที่ยืนยันได้คือตรรกะ การแสดงผล และเงื่อนไขว่าเมื่อไหร่ควรเปิดหรือปิดการแนบรูป
