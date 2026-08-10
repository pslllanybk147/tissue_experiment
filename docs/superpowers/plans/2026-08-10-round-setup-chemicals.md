# Round Setup Chemicals Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** ให้ผู้ใช้กรอกข้อมูล NaDCC และ Haiter พร้อมกัน เลือกวิธีใช้แยกตามหมวดก่อนสร้างรอบ และยกเลิกการเลือกได้โดยไม่ทำให้ข้อมูลสารอีกตัวหาย

**Architecture:** เปลี่ยน `/my/rounds/new` จากหน้าสร้างรอบทันทีเป็น client setup screen ที่โหลด equipment profile เดิม แสดงข้อมูลสารทั้งสองตัว และส่ง selection snapshot เข้า `newLotInput` ตอนยืนยันเท่านั้น การเลือกวิธีจะเป็น state แยกจากข้อมูลสาร และค่า snapshot ของรอบจะไม่ขึ้นกับการแก้ equipment ในภายหลัง

**Tech Stack:** Next.js App Router 16.2.11, React 19 client component, TypeScript, Vitest, existing repository interfaces and CSS tokens.

## Global Constraints

- ห้ามลบหรือซ่อนข้อมูล NaDCC เมื่อเลือก Haiter และห้ามลบหรือซ่อนข้อมูล Haiter เมื่อเลือก NaDCC
- การเลือกในแต่ละหมวดเป็นคนละ state: อาหาร/กระปุก, ฟอกผิวชิ้นพืช, น้ำล้าง
- ทุกหมวดต้องมีปุ่ม “ยกเลิกการเลือก”; เมื่อว่าง ปุ่มยืนยันต้อง disabled
- รอบเก่าที่ไม่มี setup ใหม่ต้องเปิดได้เหมือนเดิม
- ค่าเริ่มต้น NaDCC/Haiter ใช้จาก equipment profile ของผู้ใช้ และต้องบันทึก profile ก่อนสร้างรอบ
- ใช้ `apply_patch` แก้ไฟล์และต้องรัน Vitest, lint, build และ browser smoke test ก่อนสรุปงาน

---

### Task 1: Define the round setup snapshot and failing domain tests

**Files:**
- Modify: `src/lib/domain/models.ts`
- Create: `src/lib/rounds/round-setup.ts`
- Create: `src/lib/rounds/round-setup.test.ts`

**Interfaces:**
- Produces `RoundSetupSelection`, `MediumSterilizationMethod`, and `buildRoundSterilizationSnapshot()`.
- `RoundSetupSelection` contains `mediumMethod`, `surfaceMethod`, and `rinseMethod`, each nullable until explicitly selected.

- [ ] **Step 1: Write the failing tests**

```ts
it("เก็บข้อมูลสารทั้งสองตัวไว้ใน snapshot แม้เลือกใช้เพียงตัวเดียวในแต่ละขั้น", () => {
  const snapshot = buildRoundSterilizationSnapshot({
    mediumMethod: "nadcc-chemical",
    surfaceMethod: "haiter-chemical",
    rinseMethod: "nadcc",
  }, {
    bleachPercentWw: 6,
    nadccAvailableChlorinePercent: 60,
    nadccTabletMassG: 5.4,
    nadccMassGPerTablet: 2.97,
  });

  expect(snapshot.mediumSterilizationMethod).toBe("nadcc-chemical");
  expect(snapshot.method).toBe("haiter-chemical");
  expect(snapshot.rinseWater?.method).toBe("nadcc");
  expect(snapshot.chemistry).toEqual({
    bleachPercentWw: 6,
    nadccAvailableChlorinePercent: 60,
    nadccTabletMassG: 5.4,
    nadccMassGPerTablet: 2.97,
  });
});

it("ไม่สร้าง snapshot ที่ยืนยันไม่ได้เมื่อยังไม่เลือกวิธีฟอกผิว", () => {
  expect(() => buildRoundSterilizationSnapshot({
    mediumMethod: "haiter-chemical",
    surfaceMethod: null,
    rinseMethod: "commercial-sterile",
  }, {
    bleachPercentWw: 6,
    nadccAvailableChlorinePercent: 60,
    nadccTabletMassG: 5.4,
    nadccMassGPerTablet: 2.97,
  })).toThrow("ต้องเลือกวิธีฟอกผิวชิ้นพืชก่อนสร้างรอบ");
});
```

- [ ] **Step 2: Run the focused test and verify it fails**

Run: `npm test -- src/lib/rounds/round-setup.test.ts`

Expected: FAIL because the setup types and snapshot builder do not exist.

- [ ] **Step 3: Add the types and minimal snapshot builder**

The builder must map `surfaceMethod` to `haiter-chemical-v1` or `nadcc-soak-v1`, map `rinseMethod` to the existing `RinseWaterSnapshot` methods with 50 mL per container and the existing 300 ppm target for chlorinated rinse, and copy both reagent values into `chemistry`.

- [ ] **Step 4: Run the focused test and verify it passes**

Run: `npm test -- src/lib/rounds/round-setup.test.ts`

Expected: PASS.

---

### Task 2: Lock setup into a new lot

**Files:**
- Modify: `src/lib/domain/models.ts`
- Modify: `src/lib/rounds/round-adapter.ts`
- Modify: `src/lib/rounds/round-adapter.test.ts`

**Interfaces:**
- `newLotInput(manual, startedAt, setup?)` remains backward-compatible for old callers.

- [ ] **Step 1: Write the failing regression test**

```ts
it("newLotInput ล็อกวิธีและค่าของ NaDCC/Haiter ไว้กับรอบ", () => {
  const input = newLotInput(manual, "2026-08-10", {
    mediumMethod: "nadcc-chemical",
    surfaceMethod: "haiter-chemical",
    rinseMethod: "nadcc",
    chemistry: {
      bleachPercentWw: 6,
      nadccAvailableChlorinePercent: 60,
      nadccTabletMassG: 5.4,
      nadccMassGPerTablet: 2.97,
    },
  });
  expect(input.sterilization?.mediumSterilizationMethod).toBe("nadcc-chemical");
  expect(input.sterilization?.chemistry?.nadccAvailableChlorinePercent).toBe(60);
  expect(input.sterilization?.rinseWater?.method).toBe("nadcc");
});
```

- [ ] **Step 2: Run the regression test and verify it fails**

Run: `npm test -- src/lib/rounds/round-adapter.test.ts`

Expected: FAIL because `newLotInput` does not accept setup and `LotSterilizationSnapshot` has no chemistry fields.

- [ ] **Step 3: Implement the optional setup parameter and snapshot fields**

Keep the no-setup return unchanged so legacy/new callers that do not use the setup screen still create the same kind of lot.

- [ ] **Step 4: Run the focused tests**

Run: `npm test -- src/lib/rounds/round-adapter.test.ts src/lib/rounds/round-setup.test.ts`

Expected: PASS.

---

### Task 3: Build the interactive setup screen with both chemicals visible

**Files:**
- Create: `src/components/rounds/round-setup.tsx`
- Create: `src/components/rounds/round-setup.test.tsx`

**Interfaces:**
- Props: `profile`, `manual`, `onConfirm`, and `onBack`.
- `onConfirm` receives the selected methods plus both reagent snapshots.

- [ ] **Step 1: Write render regression tests first**

```tsx
it("แสดง NaDCC และ Haiter พร้อมกัน", () => {
  const html = renderToStaticMarkup(<RoundSetup profile={USER_REPORTED_PROFILE} manual={manual} onConfirm={() => {}} onBack={() => {}} />);
  expect(html).toContain("NaDCC 60%");
  expect(html).toContain("Haiter / NaOCl");
  expect(html).toContain("ยกเลิกการเลือก");
  expect(html).toContain("ต้องเลือกให้ครบทุกหมวด");
});

it("ไม่แทนที่ข้อมูล Haiter ด้วยข้อมูล NaDCC ใน DOM", () => {
  const html = renderToStaticMarkup(<RoundSetup profile={USER_REPORTED_PROFILE} manual={manual} onConfirm={() => {}} onBack={() => {}} />);
  expect(html.indexOf("NaDCC 60%")).toBeGreaterThanOrEqual(0);
  expect(html.indexOf("Haiter / NaOCl")).toBeGreaterThanOrEqual(0);
});
```

- [ ] **Step 2: Run the component test and verify it fails**

Run: `npm test -- src/components/rounds/round-setup.test.tsx`

Expected: FAIL because the component does not exist.

- [ ] **Step 3: Implement the minimal interactive component**

Use fieldsets and radio-like cards for the three groups. Keep reagent input state in one profile object, render both chemical cards unconditionally, add one clear button per group, and disable confirm unless all three groups have selections.

- [ ] **Step 4: Run the component test and verify it passes**

Run: `npm test -- src/components/rounds/round-setup.test.tsx`

Expected: PASS.

---

### Task 4: Replace instant round creation with setup-first flow

**Files:**
- Modify: `src/app/my/rounds/new/page.tsx`
- Modify: `src/components/equipment/profile-section.tsx`
- Modify: `src/components/equipment/profile-section.test.tsx`

- [ ] **Step 1: Add the equipment-page regression assertion**

Assert that the equipment form labels the two reagent cards separately and contains both `Haiter` and `NaDCC` after any medium-method selection copy.

- [ ] **Step 2: Run the focused equipment test and verify the new assertion fails**

Run: `npm test -- src/components/equipment/profile-section.test.tsx`

Expected: FAIL until the two cards and explanatory copy are added.

- [ ] **Step 3: Implement the setup-first page**

Load the equipment repository and normalize the profile. Render `RoundSetup` after the manual is resolved. On confirm, save the updated profile, create the lot with `newLotInput(manual, startedAt, setup)`, then navigate to `/my/rounds/[lotId]`. Preserve the existing auth, invalid slug, loading, and error states.

- [ ] **Step 4: Run focused tests**

Run: `npm test -- src/components/equipment/profile-section.test.tsx src/components/rounds/round-setup.test.tsx src/lib/rounds/round-adapter.test.ts src/lib/rounds/round-setup.test.ts`

Expected: PASS.

---

### Task 5: Full verification and browser smoke test

**Files:**
- Modify only files identified by the preceding tasks.

- [ ] **Step 1: Run the full unit suite**

Run: `npm test`

Expected: exit code 0 with no failed tests.

- [ ] **Step 2: Run lint and build**

Run: `npm run lint` and `npm run build`

Expected: both exit code 0.

- [ ] **Step 3: Run the local app and browser smoke test**

Open `/guide/violin-variegated`, start a new round, verify the setup page shows both chemicals, choose NaDCC in one group, verify Haiter remains visible, click “ยกเลิกการเลือก”, verify the group returns to “ยังไม่เลือก” and confirm is disabled, then select all groups and confirm.

- [ ] **Step 4: Inspect diff and summarize evidence**

Run: `git diff --check` and `git status --short`; verify no generated mockup files are included in the production diff and no unrelated files changed.
