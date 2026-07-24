# Audit Viewer and Approved Claim Gate Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** เพิ่ม audit viewer ที่กรองตาม source/taxon และ gate สำหรับสร้าง playbook draft จาก Approved claim เท่านั้น

**Architecture:** ขยาย KnowledgeSourceRepository ให้คืน audit แบบ owner-scoped และเพิ่ม domain service สำหรับตรวจ claim eligibility ก่อนสร้าง draft. หน้า Knowledge ใช้ repository เดิมและแสดง audit viewer; playbook draft จะเรียก protocol repository ผ่าน input ที่มี claim/source references โดยไม่ publish.

**Tech Stack:** Next.js App Router, TypeScript, React, Firebase Firestore, Vitest, Firebase Emulator, existing protocol/knowledge repositories.

## Global Constraints

- Claim ที่ยังไม่ `Approved` ห้ามสร้าง playbook draft
- AI draft ต้องไม่แสดงเป็น Verified และห้าม publish อัตโนมัติ
- ห้ามแก้ published protocol โดยตรง
- ต้องรักษา owner boundary ของ Memory และ Firestore
- ต้องอัปเดต `handoff.md` ทุกครั้งที่งานจบ โดยบรรทัดแรกต้องคงเป็น `ต้องมีการบันทึกทุกครั้งที่งานจบ`
- ก่อนส่งงานต้องรัน emulator/sandbox, `npm run firebase:verify`, `npm run lint`, `npm run build`, `git diff --check`

---

### Task 1: Define playbook eligibility domain

**Files:**
- Create: `src/lib/domain/approved-claim-gate.ts`
- Test: `src/lib/domain/approved-claim-gate.test.ts`

**Interfaces:**
- Produces `canCreatePlaybookDraft(claim, source)` returning `{ allowed: boolean; reason: string | null }`
- Produces `createPlaybookDraftInput(claim, source)` returning protocol draft seed with `claimIds`, `sourceIds`, `evidenceState`, and `status: "Draft"`

- [ ] **Step 1: Write the failing test**

```ts
it("allows only an Approved claim with excerpt, location, and source", () => {
  const result = canCreatePlaybookDraft(approvedClaim, source);
  expect(result.allowed).toBe(true);
  expect(createPlaybookDraftInput(approvedClaim, source)).toMatchObject({ claimIds: ["claim-1"], sourceIds: ["source-1"], status: "Draft" });
});

it("rejects pending, rejected, missing excerpt, and missing location claims", () => {
  expect(canCreatePlaybookDraft({ ...approvedClaim, reviewState: "Pending review" }, source).allowed).toBe(false);
  expect(canCreatePlaybookDraft({ ...approvedClaim, reviewState: "Rejected" }, source).allowed).toBe(false);
  expect(canCreatePlaybookDraft({ ...approvedClaim, evidenceExcerpt: "" }, source).allowed).toBe(false);
  expect(canCreatePlaybookDraft({ ...approvedClaim, evidenceLocation: "" }, source).allowed).toBe(false);
});
```

- [ ] **Step 2: Run the focused test and verify it fails**

Run: `npx vitest run src/lib/domain/approved-claim-gate.test.ts`

Expected: FAIL because the gate module and functions do not exist.

- [ ] **Step 3: Implement the minimal gate**

Use exact checks in this order: source exists, `reviewState === "Approved"`, non-empty excerpt, non-empty location. The draft seed must copy the claim statement into the summary and retain source/claim IDs without changing evidence state.

- [ ] **Step 4: Run the focused test and verify it passes**

Run: `npx vitest run src/lib/domain/approved-claim-gate.test.ts`

Expected: PASS with all gate cases green.

- [ ] **Step 5: Commit**

```bash
git add src/lib/domain/approved-claim-gate.ts src/lib/domain/approved-claim-gate.test.ts
git commit -m "Add approved claim playbook gate"
```

### Task 2: Add repository operation for playbook draft creation

**Files:**
- Modify: `src/lib/repositories/protocol-repository.ts`
- Modify: `src/lib/repositories/memory-protocol-repository.ts`
- Modify: `src/lib/firebase/firestore-protocol-repository.ts`
- Test: `src/lib/repositories/memory-protocol-repository.test.ts`

**Interfaces:**
- Add `createDraftFromClaim(ownerId, claim, source): Promise<ProtocolRecord>` or an equivalent repository method that returns a Draft protocol and never activates it.
- Persist `claimIds` and `sourceIds` on the draft/version metadata; use existing versioning conventions.

- [ ] **Step 1: Write the failing repository test**

```ts
it("creates a Draft protocol from an Approved claim and never activates it", async () => {
  const draft = await repository.createDraftFromClaim("owner-1", approvedClaim, source);
  expect(draft.status).toBe("Draft");
  expect(draft.currentVersionId).toBeTruthy();
  expect((await repository.get("owner-1", draft.id))?.versions[0].publishedAt).toBeNull();
});
```

- [ ] **Step 2: Run the focused test and verify it fails**

Run: `npx vitest run src/lib/repositories/memory-protocol-repository.test.ts`

Expected: FAIL because the repository method and persisted reference fields are missing.

- [ ] **Step 3: Implement Memory and Firestore draft creation**

Reuse existing draft creation/versioning helpers, call the domain gate before mutation, set status to `Draft`, keep `publishedAt: null`, and write an audit event identifying the originating claim.

- [ ] **Step 4: Run the focused repository tests**

Run: `npx vitest run src/lib/repositories/memory-protocol-repository.test.ts src/lib/firebase/firestore-protocol-repository.test.ts`

Expected: PASS, including owner mismatch and non-approved rejection cases.

- [ ] **Step 5: Commit**

```bash
git add src/lib/repositories src/lib/firebase/firestore-protocol-repository.ts
git commit -m "Create protocol drafts from approved claims"
```

### Task 3: Build the audit viewer UI

**Files:**
- Create: `src/components/knowledge/knowledge-audit-viewer.tsx`
- Test: `src/components/knowledge/knowledge-audit-viewer.test.tsx`
- Modify: `src/app/knowledge/page.tsx`
- Modify: `src/app/globals.css`

**Interfaces:**
- Component props include `sources`, `records`, `sourceAudits`, `claimAudits`, and `claims`.
- UI emits no direct Firestore writes; it only filters/render events and links to source/claim routes.

- [ ] **Step 1: Write the failing render test**

```tsx
it("renders filtered audit events with before and after details", () => {
  const html = renderToStaticMarkup(<KnowledgeAuditViewer {...fixture} />);
  expect(html).toContain("กรอง audit");
  expect(html).toContain("แก้ไข metadata");
  expect(html).toContain("ดู before / after");
});
```

- [ ] **Step 2: Run the focused test and verify it fails**

Run: `npx vitest run src/components/knowledge/knowledge-audit-viewer.test.tsx`

Expected: FAIL because the component does not exist.

- [ ] **Step 3: Implement viewer**

Provide source and taxon selects, event type label, timestamp, entity link, and expandable before/after JSON. Empty filtered state must be explicit and keyboard-accessible.

- [ ] **Step 4: Run the focused component test**

Run: `npx vitest run src/components/knowledge/knowledge-audit-viewer.test.tsx`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/knowledge/knowledge-audit-viewer.tsx src/components/knowledge/knowledge-audit-viewer.test.tsx src/app/knowledge/page.tsx src/app/globals.css
git commit -m "Add filtered knowledge audit viewer"
```

### Task 4: Add Approved claim to playbook action

**Files:**
- Modify: `src/components/knowledge/knowledge-source-register.tsx`
- Modify: `src/app/knowledge/page.tsx`
- Test: `src/components/knowledge/knowledge-source-register.test.tsx`
- Modify: `src/app/globals.css`

**Interfaces:**
- Page callback `onCreatePlaybookFromClaim(claimId: string): Promise<void>`.
- UI renders the action only for `Approved` claims and reports gate errors without changing review state.

- [ ] **Step 1: Write the failing UI test**

```tsx
it("shows playbook draft action only for Approved claims", () => {
  const html = renderToStaticMarkup(<KnowledgeSourceRegister {...fixtureWithApprovedAndPendingClaims} />);
  expect(html).toContain("สร้าง playbook draft");
  expect(html.match(/สร้าง playbook draft/g)?.length).toBe(1);
});
```

- [ ] **Step 2: Run focused test and verify it fails**

Run: `npx vitest run src/components/knowledge/knowledge-source-register.test.tsx`

Expected: FAIL because the action is not rendered.

- [ ] **Step 3: Implement action and page callback**

Resolve claim/source, call the gated repository operation, refresh data, and show a link to the new protocol draft. Pending/rejected claims must show a short explanation instead of an action.

- [ ] **Step 4: Run focused UI and repository tests**

Run: `npx vitest run src/components/knowledge/knowledge-source-register.test.tsx src/lib/domain/approved-claim-gate.test.ts src/lib/repositories/memory-protocol-repository.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/knowledge/knowledge-source-register.tsx src/app/knowledge/page.tsx src/app/globals.css src/components/knowledge/knowledge-source-register.test.tsx
git commit -m "Link approved claims to playbook drafts"
```

### Task 5: Full verification and handoff

**Files:**
- Modify: `handoff.md`

- [ ] **Step 1: Run full verification**

Run: `npm run firebase:verify; npm run lint; npm run build; git diff --check`

Expected: all commands exit 0; record exact test count and route output.

- [ ] **Step 2: Run sandbox/emulator check**

Start the local app if needed, verify the audit filters, source/taxon links, and Approved-only playbook action. If Firebase config is unavailable, record the exact limitation and do not claim authenticated UI passed.

- [ ] **Step 3: Update handoff**

Append implementation details, verification evidence, sandbox limitation, commit hash, and next step. Preserve the required first line exactly.

- [ ] **Step 4: Commit and push**

```bash
git add handoff.md
git commit -m "Document audit viewer and approved claim workflow"
git push origin feature/protocol-media-navigation
```
