# Equipment Paths Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** คู่มือบอกว่า **ต้องได้อะไร** ส่วนระบบบอกว่า **ด้วยของที่คุณมี จะได้มายังไง** พร้อมระดับหลักฐานที่ซื่อสัตย์

**Architecture:** แยกสามชั้น คือ capability สี่อย่างที่กระบวนการต้องการ, วิธีที่ให้ capability นั้นซึ่งแต่ละวิธีมีอุปกรณ์ที่ต้องใช้และระดับหลักฐานของตัวเอง, และชุดอุปกรณ์ที่ผู้ใช้มี ตัว resolver จับคู่แล้วเลือกวิธีที่หลักฐานดีที่สุดจากของที่มี **ระดับของเส้นทางรวมเท่ากับจุดที่อ่อนที่สุด ไม่ใช่จุดที่แข็งที่สุด** ชุดอุปกรณ์เก็บที่ `users/{uid}/settings/equipment` ซึ่ง security rules เดิมอนุญาตอยู่แล้ว ไม่ต้องแก้ rules

**Tech Stack:** TypeScript, React 19, Next.js 16, Firestore, Vitest 4

## Global Constraints

- **ถามเป็นของที่หาซื้อได้จริง** ต้องมีตัวเลือกหม้ออัดแรงดันทำอาหารแยกจากหม้อนึ่งของแล็บ เพราะที่ 15 psi ได้ 121 °C เท่ากันและเป็นของที่คนทำที่บ้านมี ถ้าถามด้วยคำว่า autoclave ผู้ใช้จะติ๊กว่าไม่มีทั้งที่มีของใช้แทนได้
- **ระดับรวมเท่ากับจุดที่อ่อนที่สุด** ห้ามคิดเป็นค่าเฉลี่ยหรือหยิบจุดที่ดีที่สุด
- **เมื่อไม่มีวิธีใดทำได้เลย ห้ามปล่อยผ่านเงียบ ๆ** ต้องกางทางเลือกพร้อมความเสี่ยงและไม่เลือกให้อัตโนมัติ
- ทุกวิธีที่ระดับไม่ใช่ `unsupported` ต้องมี `sourceIds` และทุกวิธีที่เป็น `unsupported` ต้องมีบันทึกการค้น ตามกฎที่ตั้งไว้แล้ว
- ห้ามเรียก Firestore SDK ตรงจาก component
- ห้าม commit `package-lock.json`

---

### Task 1: Capability model and resolver

**Files:**
- Create: `src/lib/equipment/capabilities.ts`
- Create: `src/lib/equipment/resolve-path.ts`
- Test: `src/lib/equipment/resolve-path.test.ts`

**Interfaces:**
- Produces: `CapabilityId`, `EquipmentId`, `CapabilityMethod`, `capabilityMethods`, `EquipmentKit`,
  `ResolvedCapability`, `ResolvedPath`, `resolvePath(kit: EquipmentKit): ResolvedPath`

- [ ] **Step 1: Write the failing test** ครอบคลุม
  - ครบสี่ capability เสมอ ไม่ว่าจะมีของหรือไม่
  - มีหม้อนึ่งแล้วได้วิธีนึ่งทั้งอาหาร น้ำ และภาชนะ
  - มีแค่หม้ออัดแรงดันทำอาหารก็ได้ผลเทียบเท่า
  - มีแค่ไฮเตอร์ ได้อาหารกับภาชนะแต่ **น้ำปลอดเชื้อยังตัน**
  - ระดับรวมเท่ากับจุดที่อ่อนที่สุด
  - ไม่มีของเลย ทุก capability ตัน และรายงานว่าตันข้อไหนบ้าง
- [ ] **Step 2: Run test to verify it fails**
- [ ] **Step 3: Write the catalogue** อิงหลักฐานที่ตรวจมาแล้ว
  - `sterile-medium` นึ่งด้วยหม้อนึ่งหรือหม้ออัดแรงดัน หรือ **เติมไฮเตอร์ลงในอาหาร** ตามงาน Philodendron รวยทรัพย์
  - `sterile-water` นึ่ง หรือ **ซื้อน้ำเกลือปลอดเชื้อจากร้านขายยา** ส่วนต้มน้ำเดือดเป็น `unsupported` เพราะไม่ฆ่าสปอร์
  - `sterile-vessel` นึ่งภาชนะทนร้อน หรือแช่ไฮเตอร์
  - `surface-decontam` ไฮเตอร์เจือจาง หรือแอลกอฮอล์ตามด้วยไฮเตอร์
- [ ] **Step 4: Write the resolver**
- [ ] **Step 5: Run test to verify it passes**
- [ ] **Step 6: Commit**

---

### Task 2: Extend the evidence rule to the new catalogue

**Files:**
- Modify: `src/lib/manual/evidence-rules.test.ts`

- [ ] **Step 1: Add the catalogue to the collector** กฎเดิมตรวจเฉพาะคู่มือกับคลังอาการ ต้องครอบคลุมวิธีของอุปกรณ์ด้วย
- [ ] **Step 2: Run and fix any claim that fails the rule**
- [ ] **Step 3: Commit**

---

### Task 3: Equipment kit storage

**Files:**
- Create: `src/lib/repositories/equipment-repository.ts`
- Create: `src/lib/repositories/memory-equipment-repository.ts`
- Create: `src/lib/firebase/firestore-equipment-repository.ts`
- Create: `src/lib/repositories/equipment-repository-factory.ts`
- Test: `src/lib/repositories/memory-equipment-repository.test.ts`

**Interfaces:**
- Produces: `EquipmentRepository { get(ownerId): Promise<EquipmentKit | null>; save(ownerId, kit): Promise<EquipmentKit> }`
  เก็บที่ `users/{ownerId}/settings/equipment`

- [ ] **Step 1: Write the failing test** ว่าเก็บแล้วอ่านกลับได้ และยังไม่เคยเก็บคืน null
- [ ] **Step 2: Run test to verify it fails**
- [ ] **Step 3: Write the interface, the memory version, the Firestore version, and the factory**
- [ ] **Step 4: Run test to verify it passes**
- [ ] **Step 5: Commit**

---

### Task 4: Equipment page

**Files:**
- Create: `src/components/equipment/equipment-form.tsx`
- Create: `src/components/equipment/path-summary.tsx`
- Test: `src/components/equipment/path-summary.test.tsx`
- Create: `src/app/my/equipment/page.tsx`
- Modify: `src/components/rounds/round-list.tsx` เพิ่มลิงก์ไปหน้าอุปกรณ์

- [ ] **Step 1: Write the failing tests** ว่า `PathSummary`
  - แสดงครบสี่ capability พร้อมวิธีที่เลือกให้และระดับหลักฐาน
  - แสดงระดับรวมและอธิบายว่ามาจากจุดที่อ่อนที่สุด
  - เมื่อ capability ใดตัน ต้องกางทางเลือกพร้อมความเสี่ยง ไม่ใช่เงียบ
- [ ] **Step 2: Run tests to verify they fail**
- [ ] **Step 3: Write `PathSummary` and `EquipmentForm`**
- [ ] **Step 4: Write the page** โหลดและบันทึกผ่าน repository
- [ ] **Step 5: Run tests, lint, and build**
- [ ] **Step 6: Commit**

---

### Task 5: Feed the kit into the calculator, then verify

**Files:**
- Modify: `src/components/rounds/medium-calculator.tsx`
- Modify: `src/components/rounds/step-runner.tsx`
- Modify: `src/app/my/rounds/[roundId]/step/[step]/page.tsx`
- Modify: `handoff.md`

ปิดวงจรที่ค้างจากแผนก่อน ความละเอียดของเครื่องชั่งและอุปกรณ์ตวงควรมาจากชุดอุปกรณ์ที่บันทึกไว้
ไม่ใช่ให้กรอกซ้ำทุกครั้ง แต่ยังต้องแก้เฉพาะกิจได้

- [ ] **Step 1: Add optional initial tool limits to the calculator** ถ้าไม่ส่งมาให้ใช้ค่าเดิม
- [ ] **Step 2: Pass the saved kit from the step page**
- [ ] **Step 3: Run tests, lint, and build**
- [ ] **Step 4: Verify by hand in the browser** ตั้งค่าอุปกรณ์ แล้วดูว่าเส้นทางเปลี่ยนตาม และเครื่องคำนวณรับค่ามาจริง
- [ ] **Step 5: Record honestly in `handoff.md`**
- [ ] **Step 6: Commit**

---

## Self-Review Notes

**ไม่อยู่ในแผนนี้** การผูกเส้นทางที่เลือกไว้เข้ากับรอบเพาะแบบล็อกค่า ณ เวลาเริ่มรอบ ซึ่ง spec เรียกว่า
`ResolvedPath snapshot` เหตุผลคือต้องมีข้อมูลจริงจากผู้ใช้ก่อนว่าเส้นทางเปลี่ยนบ่อยแค่ไหน
ถ้าล็อกเร็วเกินไปจะกลายเป็นข้อมูลค้างที่ไม่ตรงกับของที่ผู้ใช้มีจริง

**ไม่อยู่ในแผนนี้เช่นกัน** การบังคับกระปุกเปล่าคุมเมื่อเส้นทางเป็น `unsupported` ซึ่งต้องรอให้เส้นทาง
ถูกผูกกับรอบก่อน
