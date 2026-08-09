# Rinse Readiness Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** เชื่อม chlorinated rinse เดิมเข้ากับ readiness และชุดทดลองโดยแยกจาก sterile water, ตรวจความพร้อมรายแขน และบันทึกการเตรียมจริงก่อนอนุญาตเริ่มชุด 5 แขน

**Architecture:** เพิ่มข้อมูล preparation record ที่ normalize ได้ทั้ง profile และ lot, สร้าง resolver รายแขนที่รู้ requirement ของ Control-A/T1/T2/T3, และให้ UI หน้าอุปกรณ์เป็นจุดยืนยันการเตรียม rinse ส่วน protocol T1/T2 จะใช้ rinse 300 ppm 3 รอบโดยไม่มี final sterile-water rinse

**Tech Stack:** Next.js 16.2.11, React 19, TypeScript, Vitest, ESLint

## Global Constraints

- ห้ามใช้ chlorinated rinse เป็นค่าแทน `water.sterile`
- T1/T2 ใช้ 300 ppm 3 รอบและไม่มี final sterile-water rinse
- Control-A และ T3 ยังต้องใช้น้ำปลอดเชื้อ
- ข้อมูลเก่าที่ไม่มี rinse record ต้องอ่านได้และถือเป็น `planned` ไม่ใช่ `prepared`
- ทุก production change ต้องมี failing test ก่อน implementation

---

### Task 1: เพิ่ม model สำหรับ rinse preparation และ backward-compatible normalization

**Files:**
- Modify: `src/lib/domain/models.ts`
- Modify: `src/lib/equipment/equipment-profile.ts`
- Modify: `src/lib/domain/experiment-migration.ts`
- Modify: `src/lib/domain/rinse-water-planning.ts`
- Test: `src/lib/domain/rinse-water-planning.test.ts`
- Test: `src/lib/equipment/equipment-profile.test.ts`
- Test: `src/lib/domain/experiment-migration.test.ts`

**Interfaces:**
- `RinsePreparationStatus = "planned" | "prepared"`
- `RinseWaterSnapshot` gains `status`, `productName`, `batchOrLot`, `actualChlorinePpm`, `stockVolumeMl`, `finalVolumeMl`, and `preparedAt` optional fields; builders return `status: "planned"`
- `EquipmentProfileV2.rinseWater` stores nullable records for `lowDoseHypochlorite` and `nadcc`
- `normalizeEquipmentProfile` defaults absent records to `null`
- `normalizeExperimentLot` normalizes a legacy `sterilization.rinseWater` without status to `status: "planned"`

- [ ] **Step 1: Write failing tests** for builders returning planned status, profile defaults, and legacy lot normalization to planned.
- [ ] **Step 2: Run the focused tests** with `npm test -- src/lib/domain/rinse-water-planning.test.ts src/lib/equipment/equipment-profile.test.ts src/lib/domain/experiment-migration.test.ts`; confirm the new assertions fail because fields do not exist.
- [ ] **Step 3: Add the types and defaults** without changing the existing target of `0.03%` and 3 containers.
- [ ] **Step 4: Run the focused tests** and confirm they pass.
- [ ] **Step 5: Run existing rinse and migration tests** to confirm legacy values remain readable.

### Task 2: Implement per-arm readiness without conflating water types

**Files:**
- Modify: `src/lib/equipment/trial-readiness.ts`
- Create: `src/lib/trials/trial-readiness.ts`
- Test: `src/lib/equipment/trial-readiness.test.ts`
- Test: `src/lib/trials/trial-readiness.test.ts`

**Interfaces:**
- `TrialArmReadiness` contains `armRole`, `title`, `status`, `requiredResources`, `blockers`, and `next`
- `resolveTrialArmReadiness(profile, armRole)` returns one arm’s status
- `resolveTrialReadiness(profile)` retains existing capability output and adds `arms`, `armBlockers`, and an overall status equal to the weakest required arm
- T1 requires Haiter plus prepared low-dose hypochlorite; T2 requires Haiter plus prepared NaDCC rinse; Control-A requires sterile water; T3 requires prepared sterile water and NaDCC; Control-B has no explant water requirement

- [ ] **Step 1: Write failing tests** proving T1/T2 become `experimental` only when the corresponding rinse record is prepared, while Control-A/T3 remain blocked without sterile water.
- [ ] **Step 2: Run the focused readiness tests** and confirm the expected failures.
- [ ] **Step 3: Add arm requirement definitions and resolver**; preserve the existing capability cards for the equipment page.
- [ ] **Step 4: Make overall readiness use required arm statuses**, so T1/T2 readiness cannot hide a blocked Control-A/T3.
- [ ] **Step 5: Run readiness tests** and confirm all status combinations pass.

### Task 3: Add beginner-facing rinse preparation confirmation in equipment profile

**Files:**
- Modify: `src/components/equipment/profile-section.tsx`
- Modify: `src/app/my/equipment/page.tsx`
- Create: `src/components/equipment/rinse-preparation-card.tsx`
- Test: `src/components/equipment/profile-section.test.tsx`
- Test: `src/components/equipment/path-summary.test.tsx`

**Interfaces:**
- `RinsePreparationCard` receives one method, the current record, and `onChange`
- UI must show target `300 ppm`, total 3 containers, volume per container, product, batch/lot, actual ppm, stock/final volume, prepared date, and an explicit confirmation checkbox
- Confirmation must not set `status: "prepared"` unless product, batch, actual ppm, final volume, and date are present
- Equipment summary must explain that chlorinated rinse is experimental rinse water and is not sterile water

- [ ] **Step 1: Write failing component tests** for missing-field validation, successful confirmation, and explicit distinction from sterile water.
- [ ] **Step 2: Run the component tests** and confirm they fail because the card and fields are absent.
- [ ] **Step 3: Implement the card using existing design primitives and existing profile save flow.**
- [ ] **Step 4: Run focused component tests** and confirm they pass.
- [ ] **Step 5: Verify demo profile defaults** show both rinse methods as planned/unprepared rather than silently ready.

### Task 4: Make T1/T2 protocol and snapshots consistent

**Files:**
- Modify: `src/lib/trials/project-trial-steps.ts`
- Modify: `src/components/rounds/sterilization-method-banner.tsx`
- Modify: `src/lib/trials/nadcc-vs-haiter-trial.ts`
- Modify: `src/lib/trials/trial-overview.ts`
- Test: `src/lib/trials/project-trial-steps.test.ts`
- Test: `src/lib/trials/nadcc-vs-haiter-trial.test.ts`
- Test: `src/lib/trials/trial-overview.test.ts`

**Interfaces:**
- T1/T2 actions contain exactly three low-dose rinse cycles and no final sterile-water action or required `final-rinse` measurement
- Control-A keeps three sterile-water washes
- T3 keeps three sterile-water washes after the 24–48 hour NaDCC soak
- Newly created T1/T2 snapshots retain `status: "planned"` until the user confirms preparation

- [ ] **Step 1: Change existing tests** to assert the locked protocol and add a failing assertion that T1/T2 have no final sterile-water requirement.
- [ ] **Step 2: Run the focused trial tests** and confirm they fail against the old mixed protocol.
- [ ] **Step 3: Update the action text, materials, measurements, and banner** to one consistent protocol.
- [ ] **Step 4: Update overview labels and snapshot expectations** without changing T3’s separate semantics.
- [ ] **Step 5: Run all trial tests** and confirm they pass.

### Task 5: Gate new-trial creation using per-arm readiness

**Files:**
- Modify: `src/app/my/trials/new/page.tsx`
- Modify: `src/components/trials/readiness-gate.tsx`
- Test: `src/components/trials/readiness-gate.test.tsx`
- Test: `src/app/my/trials/new/page.test.tsx`

**Interfaces:**
- Gate renders arm-by-arm status before the aggregate blocker list
- Aggregate start remains disabled if any required arm is blocked
- Experimental arms can start only through the existing acknowledgement checkbox
- The message for T1/T2 says prepared chlorinated rinse is required; it must not tell the user to mark source water sterile

- [ ] **Step 1: Write failing tests** for arm-level rendering and the aggregate block when Control-A/T3 lack sterile water despite prepared T1/T2 rinse.
- [ ] **Step 2: Run focused gate tests** and confirm failures.
- [ ] **Step 3: Render arm statuses and wire the existing `allowed` calculation to the new aggregate status.**
- [ ] **Step 4: Run focused gate tests** and confirm they pass.
- [ ] **Step 5: Verify the demo profile remains blocked for the correct reason.**

### Task 6: Verify, document, commit, push, and merge

**Files:**
- Modify: `docs/superpowers/specs/2026-08-09-rinse-readiness-integration-design.md`
- Modify: `docs/superpowers/plans/2026-08-09-rinse-readiness-integration.md`

- [ ] **Step 1: Run the full test suite** with `npm test` and record the exact pass/fail count.
- [ ] **Step 2: Run lint** with `npm run lint` and fix only issues caused by this work.
- [ ] **Step 3: Run build** with `npm run build`.
- [ ] **Step 4: Run UI and manual verification** with `npm run ui:verify` and `npm run manuals:verify`.
- [ ] **Step 5: Inspect `git diff` and `git status`** to confirm only this scope is included.
- [ ] **Step 6: Commit with `fix: connect rinse readiness by trial arm`**.
- [ ] **Step 7: Push the current branch with tracking** and open/update a PR targeting `master`.
- [ ] **Step 8: Merge the PR into `master` only after fresh checks and confirm the resulting master commit.**
