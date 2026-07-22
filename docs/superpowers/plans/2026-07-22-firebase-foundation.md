# Firebase Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** เชื่อม Philodendron Lab กับ Firebase Auth และ Firestore โดยยัง build และทดลอง UI ได้อย่างปลอดภัยเมื่อยังไม่มี Firebase environment variables.

**Architecture:** ใช้ lazy Firebase client getter เพื่อป้องกัน build crash, แยก domain types และ repository interface ออกจาก Firebase SDK, ใช้ Auth context ครอบ dashboard และมี development demo mode สำหรับ sandbox. Firestore writes ต้องผูกกับ owner UID และ rules ต้องปฏิเสธผู้ไม่ล็อกอิน.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Firebase Web SDK, Firestore Emulator, Firebase Auth Emulator, Vitest.

## Global Constraints

- ห้ามเปิดเผย Firebase secrets หรือ service-account credentials ใน client/source control.
- AI draft ต้องไม่กลายเป็น Verified อัตโนมัติ.
- Firebase SDK ต้อง initialize แบบ lazy และเว็บต้อง build ได้เมื่อ env ไม่ครบ.
- Desktop และ mobile ต้องใช้ feature ชุดเดียวกัน.
- ก่อนส่งงานต้องรัน tests, lint, build และ sandbox emulator verification.

---

### Task 1: Test foundation and Firebase environment contract

**Files:**
- Modify: `package.json`
- Create: `src/lib/firebase/config.test.ts`
- Create: `src/lib/firebase/config.ts`
- Create: `.env.example`

**Interfaces:**
- Produces: `readFirebaseConfig(env): FirebaseClientConfig | null`

- [ ] Write failing tests for complete and incomplete Firebase environment variables.
- [ ] Run tests and confirm failure because the module does not exist.
- [ ] Implement the minimal environment reader without initializing Firebase.
- [ ] Run tests and confirm pass.

### Task 2: Typed research domain and Firestore repository

**Files:**
- Create: `src/lib/domain/models.ts`
- Create: `src/lib/repositories/lab-repository.ts`
- Create: `src/lib/repositories/demo-lab-repository.ts`
- Create: `src/lib/repositories/demo-lab-repository.test.ts`
- Create: `src/lib/firebase/client.ts`
- Create: `src/lib/firebase/firestore-lab-repository.ts`

**Interfaces:**
- Produces: `LabRepository`, `createDemoLabRepository()`, `getFirebaseServices()` and `createFirestoreLabRepository(uid)`.

- [ ] Write failing repository tests for listing owner-scoped lots and completing a protocol step.
- [ ] Run tests and verify expected failure.
- [ ] Implement domain types and in-memory repository.
- [ ] Implement lazy Firebase services and Firestore adapter.
- [ ] Run tests and confirm pass.

### Task 3: Authentication boundary and dashboard integration

**Files:**
- Create: `src/components/auth/auth-provider.tsx`
- Create: `src/components/auth/auth-gate.tsx`
- Create: `src/components/lab-dashboard.tsx`
- Modify: `src/app/layout.tsx`
- Modify: `src/app/page.tsx`
- Modify: `src/app/globals.css`

**Interfaces:**
- Produces: `AuthProvider`, `AuthGate`, authenticated/demo session state and repository-backed dashboard.

- [ ] Add an auth-state reducer test covering loading, signed-out and demo states.
- [ ] Run the test and confirm failure.
- [ ] Implement Auth provider with Google sign-in, sign-out and development demo session.
- [ ] Move dashboard into a focused component and wire session/repository state.
- [ ] Add signed-out, loading and configuration-missing states.
- [ ] Run tests and confirm pass.

### Task 4: Emulator and security rules

**Files:**
- Create: `firebase.json`
- Create: `.firebaserc.example`
- Create: `firestore.rules`
- Create: `firestore.indexes.json`
- Modify: `README.md`

**Interfaces:**
- Firestore collections are scoped by `ownerId`; writes require `request.auth.uid == ownerId`.

- [ ] Add Firebase emulator configuration for Auth and Firestore.
- [ ] Add owner-only Firestore rules.
- [ ] Document local and Vercel environment setup.

### Task 5: Final verification and handoff

**Files:**
- Modify: `handoff.md`

- [ ] Run `npm test`.
- [ ] Run `npm run lint`.
- [ ] Run `npm run build`.
- [ ] Start local sandbox and verify Auth gate plus dashboard at 1440, 1024 and 390 widths.
- [ ] Verify modal, lot selection, step completion, no horizontal overflow and signed-out/demo transitions.
- [ ] Record exact results and remaining Firebase Console actions in `handoff.md`.
