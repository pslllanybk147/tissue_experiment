# Protocol, Navigation, and Experiment Media Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver working dashboard navigation, versioned protocols with lot-specific progress, and signed Cloudinary observation media in one production release.

**Architecture:** Extend the existing Next.js App Router application with focused protocol, progress, and media repositories. Firebase Auth and owner-scoped Firestore remain the source of application state; Cloudinary stores image binaries behind a signed server endpoint while Firestore stores recoverable metadata and audit history.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Firebase Auth/Firestore, Cloudinary Upload API, Vitest, Firebase Emulator Suite, Vercel Preview.

## Global Constraints

- Keep the Gridgeist-derived visual direction and one responsive web application for desktop and mobile.
- Use owner-scoped paths under `users/{uid}` and deny cross-owner access.
- Published protocol versions are immutable; editing an active protocol creates a draft version.
- Protocol progress belongs to a lot and references a fixed protocol version.
- Cloudinary secrets are server-only; do not create `NEXT_PUBLIC_*` secret variables.
- Images are JPEG, PNG, or WebP, at most 10 MB each and 8 per observation.
- Media deletion is soft delete; Cloudinary asset destruction is excluded from normal UI operations.
- Research is read-only in this release.
- Machine learning and image identification remain deferred.
- Run Firebase emulator and rendered browser sandbox checks before every delivery checkpoint.
- Merge to `master` once, only after complete Preview validation and explicit user approval.

---

### Task 1: Real Navigation and Route Shell

**Files:**
- Modify: `src/components/lab/lab-shell.tsx`
- Modify: `src/components/lab/lab-shell.test.tsx`
- Modify: `src/app/page.tsx`
- Create: `src/app/research/page.tsx`
- Create: `src/components/research/research-register.tsx`
- Create: `src/components/research/research-register.test.tsx`
- Modify: `src/app/globals.css`

**Interfaces:**
- Consumes: `LabShell`, `ResearchSource`, existing auth/repository factories.
- Produces: `LabSection = "Overview" | "Protocols" | "Experiments" | "Research"` and navigable `/protocols`, `/experiments`, `/research` destinations.

- [ ] **Step 1: Write failing navigation tests**

```tsx
const html = renderToStaticMarkup(
  <LabShell section="Protocols" sessionLabel="DEMO" onSignOut={() => undefined}>body</LabShell>,
);
expect(html).toContain('href="/protocols"');
expect(html).toContain('href="/research"');
expect(html).toContain('aria-current="page"');
```

- [ ] **Step 2: Verify RED**

Run: `npm test -- src/components/lab/lab-shell.test.tsx src/components/research/research-register.test.tsx`  
Expected: FAIL because Protocols/Research links and register do not exist.

- [ ] **Step 3: Implement route-based navigation**

```tsx
export type LabSection = "Overview" | "Protocols" | "Experiments" | "Research";

const destinations = [
  { label: "Overview", href: "/" },
  { label: "Protocols", href: "/protocols" },
  { label: "Experiments", href: "/experiments" },
  { label: "Research", href: "/research" },
] as const;
```

Render links with `aria-current={section === item.label ? "page" : undefined}`. Replace dashboard state-only buttons with `Link` elements. Implement `/research` as an authenticated, evidence-labelled read-only list.

- [ ] **Step 4: Verify GREEN and responsiveness styles**

Run: `npm test -- src/components/lab/lab-shell.test.tsx src/components/research/research-register.test.tsx`  
Expected: PASS.

- [ ] **Step 5: Commit**

```text
git add src/app src/components/lab src/components/research
git commit -m "Add real research and protocol navigation"
```

---

### Task 2: Protocol Domain and Validation

**Files:**
- Modify: `src/lib/domain/models.ts`
- Create: `src/lib/domain/protocol-validation.ts`
- Create: `src/lib/domain/protocol-validation.test.ts`
- Create: `src/lib/domain/protocol-versioning.ts`
- Create: `src/lib/domain/protocol-versioning.test.ts`

**Interfaces:**
- Produces: `ProtocolRecord`, `ProtocolVersion`, `ProtocolStep`, `ProtocolDraftInput`, `validateProtocolDraft(input)`, `nextDraftVersion(activeVersion)`.

- [ ] **Step 1: Write failing domain tests**

```ts
expect(validateProtocolDraft({ title: "", plantScope: "", evidenceState: "Pending review", steps: [] })).toEqual({
  title: "กรุณาระบุชื่อ Protocol",
  plantScope: "กรุณาระบุขอบเขตพืช",
  steps: "ต้องมีอย่างน้อย 1 ขั้นตอน",
});
expect(nextDraftVersion("1.2.3")).toBe("1.3.0");
```

- [ ] **Step 2: Verify RED**

Run: `npm test -- src/lib/domain/protocol-validation.test.ts src/lib/domain/protocol-versioning.test.ts`  
Expected: FAIL because modules are missing.

- [ ] **Step 3: Implement explicit types and pure functions**

```ts
export type ProtocolStatus = "Draft" | "Active" | "Archived";
export type ProtocolStep = {
  id: string; order: number; title: string; instruction: string;
  durationMinutes: number | null; criticalControls: string[];
  safetyNotes: string[]; referenceIds: string[]; evidenceState: EvidenceState;
};
export type ProtocolDraftInput = {
  title: string; plantScope: string; evidenceState: EvidenceState;
  summary: string; changeNote: string; steps: ProtocolStep[];
};
export type ProtocolRecord = {
  id: string; ownerId: string; title: string; slug: string; plantScope: string;
  evidenceState: EvidenceState; status: ProtocolStatus; currentVersionId: string;
  createdAt: string; updatedAt: string; deletedAt: string | null;
};
export type ProtocolVersion = {
  id: string; protocolId: string; ownerId: string; version: string;
  summary: string; changeNote: string; steps: ProtocolStep[];
  createdBy: string; createdAt: string; publishedAt: string | null;
};
```

Validation must reject duplicate step IDs, blank titles/instructions, invalid order, and negative duration. Version parsing accepts only `major.minor.patch` numeric triples.

- [ ] **Step 4: Verify GREEN**

Run: `npm test -- src/lib/domain/protocol-validation.test.ts src/lib/domain/protocol-versioning.test.ts`  
Expected: PASS.

- [ ] **Step 5: Commit**

```text
git add src/lib/domain
git commit -m "Define versioned protocol domain"
```

---

### Task 3: Protocol Repository Contracts and Memory Implementation

**Files:**
- Create: `src/lib/repositories/protocol-repository.ts`
- Create: `src/lib/repositories/memory-protocol-repository.ts`
- Create: `src/lib/repositories/memory-protocol-repository.test.ts`
- Create: `src/lib/repositories/protocol-repository-factory.ts`

**Interfaces:**
- Produces: `ProtocolRepository` with list/get/create/save/activate/archive operations.

- [ ] **Step 1: Write repository contract tests**

```ts
const created = await repository.createDraft(ownerId, input);
const active = await repository.activateVersion(ownerId, created.id, created.currentVersionId);
await expect(repository.saveDraftVersion(ownerId, active.id, active.currentVersionId, input))
  .rejects.toThrow("Published versions are immutable");
expect((await repository.listAuditEvents(ownerId, active.id)).map(event => event.action))
  .toEqual(["created", "activated"]);
```

- [ ] **Step 2: Verify RED**

Run: `npm test -- src/lib/repositories/memory-protocol-repository.test.ts`  
Expected: FAIL because repository is missing.

- [ ] **Step 3: Implement memory repository**

```ts
export interface ProtocolRepository {
  list(ownerId: string, includeArchived?: boolean): Promise<ProtocolRecord[]>;
  get(ownerId: string, protocolId: string): Promise<{ protocol: ProtocolRecord; versions: ProtocolVersion[] } | null>;
  createDraft(ownerId: string, input: ProtocolDraftInput): Promise<ProtocolRecord>;
  saveDraftVersion(ownerId: string, protocolId: string, versionId: string, input: ProtocolDraftInput): Promise<ProtocolVersion>;
  activateVersion(ownerId: string, protocolId: string, versionId: string): Promise<ProtocolRecord>;
  archive(ownerId: string, protocolId: string): Promise<ProtocolRecord>;
  listAuditEvents(ownerId: string, protocolId: string): Promise<AuditEvent[]>;
}
```

Clone returned records, enforce owner matching, create immutable activated snapshots, and make repeated activation idempotent.

- [ ] **Step 4: Verify GREEN**

Run: `npm test -- src/lib/repositories/memory-protocol-repository.test.ts`  
Expected: PASS.

- [ ] **Step 5: Commit**

```text
git add src/lib/repositories
git commit -m "Add protocol repository contract"
```

---

### Task 4: Firestore Protocol Persistence and Rules

**Files:**
- Create: `src/lib/firebase/firestore-protocol-repository.ts`
- Create: `src/lib/firebase/firestore-protocol-repository.test.ts`
- Modify: `src/lib/repositories/protocol-repository-factory.ts`
- Modify: `firestore.rules`
- Create: `test/firestore-rules.test.ts`
- Modify: `package.json`

**Interfaces:**
- Consumes: `ProtocolRepository`, Firebase adapter primitives.
- Produces: Firestore implementation using protocol/version/audit batches.

- [ ] **Step 1: Write failing adapter and rules tests**

```ts
await repository.activateVersion(ownerId, protocolId, versionId);
expect(adapter.commits.at(-1)?.writes.map(write => write.path)).toEqual([
  `users/${ownerId}/protocols/${protocolId}`,
  `users/${ownerId}/protocols/${protocolId}/versions/${versionId}`,
  `users/${ownerId}/protocols/${protocolId}/audit/evt-1`,
]);
```

Rules tests authenticate `owner-a`, assert access below `users/owner-a`, and assert denial below `users/owner-b`.

- [ ] **Step 2: Verify RED**

Run: `npm test -- src/lib/firebase/firestore-protocol-repository.test.ts test/firestore-rules.test.ts`  
Expected: FAIL because Firestore repository and rules test harness are missing.

- [ ] **Step 3: Implement batch writes and exact nested rules**

```text
users/{uid}/protocols/{protocolId}
users/{uid}/protocols/{protocolId}/versions/{versionId}
users/{uid}/protocols/{protocolId}/audit/{eventId}
```

Every stored record includes `ownerId`. Keep the existing recursive owner rule, then test its behavior explicitly rather than weakening it.

- [ ] **Step 4: Verify unit and emulator tests**

Run: `npm test -- src/lib/firebase/firestore-protocol-repository.test.ts`  
Expected: PASS.  
Run: `npm run firebase:verify`  
Expected: Auth/Firestore emulators start; owner tests pass; process exits 0.

- [ ] **Step 5: Commit**

```text
git add src/lib/firebase src/lib/repositories firestore.rules test package.json
git commit -m "Persist versioned protocols in Firestore"
```

---

### Task 5: Protocol List, Editor, and Version History UI

**Files:**
- Create: `src/app/protocols/page.tsx`
- Create: `src/app/protocols/new/page.tsx`
- Create: `src/app/protocols/[protocolId]/page.tsx`
- Create: `src/app/protocols/[protocolId]/edit/page.tsx`
- Create: `src/components/protocols/protocol-list.tsx`
- Create: `src/components/protocols/protocol-list.test.tsx`
- Create: `src/components/protocols/protocol-editor.tsx`
- Create: `src/components/protocols/protocol-editor.test.tsx`
- Create: `src/components/protocols/protocol-history.tsx`
- Modify: `src/app/globals.css`

**Interfaces:**
- Consumes: `ProtocolRepository`, protocol validation/versioning.
- Produces: list/create/detail/edit workflows and immutable history presentation.

- [ ] **Step 1: Write failing component tests**

```tsx
expect(renderToStaticMarkup(<ProtocolList protocols={records} />)).toContain("/protocols/protocol-1");
expect(renderToStaticMarkup(<ProtocolEditor initialValue={draft} onSubmit={async () => undefined} />))
  .toContain("เพิ่มขั้นตอน");
```

- [ ] **Step 2: Verify RED**

Run: `npm test -- src/components/protocols`  
Expected: FAIL because components do not exist.

- [ ] **Step 3: Implement editor without drag-and-drop**

Use explicit `ขึ้น`, `ลง`, and `ลบ` buttons. Keep step IDs stable, renumber `order` after movement, show field errors, preserve values after repository failure, and disable submit while pending.

```tsx
<button type="button" disabled={index === 0} onClick={() => moveStep(index, -1)}>ขึ้น</button>
<button type="button" disabled={index === steps.length - 1} onClick={() => moveStep(index, 1)}>ลง</button>
```

- [ ] **Step 4: Verify GREEN and build**

Run: `npm test -- src/components/protocols && npm run build`  
Expected: component tests pass and routes compile.

- [ ] **Step 5: Commit**

```text
git add src/app/protocols src/components/protocols src/app/globals.css
git commit -m "Build protocol authoring workflow"
```

---

### Task 6: Lot-Specific Protocol Progress

**Files:**
- Modify: `src/lib/domain/models.ts`
- Create: `src/lib/repositories/protocol-progress-repository.ts`
- Create: `src/lib/repositories/memory-protocol-progress-repository.ts`
- Create: `src/lib/repositories/memory-protocol-progress-repository.test.ts`
- Create: `src/lib/firebase/firestore-protocol-progress-repository.ts`
- Create: `src/lib/firebase/firestore-protocol-progress-repository.test.ts`
- Create: `src/components/protocols/protocol-runner.tsx`
- Create: `src/components/protocols/protocol-runner.test.tsx`
- Modify: `src/app/experiments/[lotId]/page.tsx`

**Interfaces:**
- Produces: `ProtocolStepProgress` and idempotent `complete`, `skip`, `reopen`, `saveNote` operations.

- [ ] **Step 1: Write failing progress tests**

```ts
await repository.complete(ownerId, lotId, protocolId, versionId, stepId, "done");
await repository.complete(ownerId, lotId, protocolId, versionId, stepId, "done");
expect(await repository.listAuditEvents(ownerId, lotId)).toHaveLength(1);
```

- [ ] **Step 2: Verify RED**

Run: `npm test -- src/lib/repositories/memory-protocol-progress-repository.test.ts src/lib/firebase/firestore-protocol-progress-repository.test.ts`  
Expected: FAIL because progress repositories are missing.

- [ ] **Step 3: Implement progress and runner**

```ts
export type ProtocolProgressState = "Pending" | "Completed" | "Skipped";
export type ProtocolStepProgress = {
  stepId: string; protocolId: string; versionId: string; lotId: string; ownerId: string;
  state: ProtocolProgressState; note: string; completedBy: string | null;
  completedAt: string | null; updatedAt: string;
};
export interface ProtocolProgressRepository {
  list(ownerId: string, lotId: string): Promise<ProtocolStepProgress[]>;
  complete(ownerId: string, lotId: string, protocolId: string, versionId: string, stepId: string, note: string): Promise<ProtocolStepProgress>;
  skip(ownerId: string, lotId: string, protocolId: string, versionId: string, stepId: string, note: string): Promise<ProtocolStepProgress>;
  reopen(ownerId: string, lotId: string, stepId: string): Promise<ProtocolStepProgress>;
  saveNote(ownerId: string, lotId: string, stepId: string, note: string): Promise<ProtocolStepProgress>;
}
```

Store progress under `users/{uid}/lots/{lotId}/protocolProgress/{stepId}` and pair mutations with lot audit events. Add a link from lot detail to the fixed protocol version and render the runner in lot context.

- [ ] **Step 4: Verify GREEN**

Run: `npm test -- src/lib/repositories/memory-protocol-progress-repository.test.ts src/lib/firebase/firestore-protocol-progress-repository.test.ts src/components/protocols/protocol-runner.test.tsx`  
Expected: PASS.

- [ ] **Step 5: Commit**

```text
git add src/lib src/components/protocols src/app/experiments
git commit -m "Track protocol progress per experiment lot"
```

---

### Task 7: Signed Cloudinary Upload Endpoint

**Files:**
- Create: `src/lib/cloudinary/config.ts`
- Create: `src/lib/cloudinary/config.test.ts`
- Create: `src/lib/cloudinary/signature.ts`
- Create: `src/lib/cloudinary/signature.test.ts`
- Create: `src/lib/firebase/admin.ts`
- Create: `src/app/api/media/sign/route.ts`
- Create: `src/app/api/media/sign/route.test.ts`
- Modify: `.env.example`
- Modify: `package.json`

**Interfaces:**
- Produces: authenticated `POST /api/media/sign` returning `{ timestamp, signature, cloudName, apiKey, folder, publicId }`.

- [ ] **Step 1: Write failing endpoint tests**

```ts
expect((await POST(requestWithoutToken)).status).toBe(401);
expect((await POST(requestWithInvalidMime)).status).toBe(400);
expect(await response.json()).toMatchObject({ cloudName: "demo", folder: `users/${uid}/lots/${lotId}` });
```

- [ ] **Step 2: Verify RED**

Run: `npm test -- src/lib/cloudinary src/app/api/media/sign/route.test.ts`  
Expected: FAIL because config, signature, and endpoint are missing.

- [ ] **Step 3: Implement server-only validation and signing**

Required server variables:

```text
CLOUDINARY_CLOUD_NAME
CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET
FIREBASE_ADMIN_PROJECT_ID
FIREBASE_ADMIN_CLIENT_EMAIL
FIREBASE_ADMIN_PRIVATE_KEY
```

Verify `Authorization: Bearer <Firebase ID token>`, accept only JPEG/PNG/WebP, reject bytes over `10_000_000`, and constrain folders to the verified UID and requested lot/observation IDs.

- [ ] **Step 4: Verify GREEN and client-secret boundary**

Run: `npm test -- src/lib/cloudinary src/app/api/media/sign/route.test.ts`  
Expected: PASS.  
Run: `npm run build`  
Expected: build passes and no server secret appears in generated client chunks when searched by variable value in a local test environment.

- [ ] **Step 5: Commit**

```text
git add src/lib/cloudinary src/lib/firebase/admin.ts src/app/api/media .env.example package.json package-lock.json
git commit -m "Add authenticated Cloudinary upload signing"
```

---

### Task 8: Media Metadata Repository and Observation UI

**Files:**
- Modify: `src/lib/domain/models.ts`
- Create: `src/lib/repositories/media-repository.ts`
- Create: `src/lib/repositories/memory-media-repository.ts`
- Create: `src/lib/repositories/memory-media-repository.test.ts`
- Create: `src/lib/firebase/firestore-media-repository.ts`
- Create: `src/lib/firebase/firestore-media-repository.test.ts`
- Create: `src/components/media/media-uploader.tsx`
- Create: `src/components/media/media-uploader.test.tsx`
- Create: `src/components/media/media-strip.tsx`
- Create: `src/components/media/media-strip.test.tsx`
- Modify: `src/components/experiments/observation-timeline.tsx`
- Modify: `src/app/experiments/[lotId]/page.tsx`
- Modify: `src/app/globals.css`

**Interfaces:**
- Produces: `ObservationMedia`, `MediaRepository`, upload-progress UI, captions, soft delete, and restore.

- [ ] **Step 1: Write failing repository and UI tests**

```ts
expect(validateMediaSelection(files)).toEqual([]);
await repository.softDelete(ownerId, lotId, observationId, mediaId);
await repository.softDelete(ownerId, lotId, observationId, mediaId);
expect((await repository.listAuditEvents(ownerId, lotId)).filter(e => e.action === "deleted")).toHaveLength(1);
```

- [ ] **Step 2: Verify RED**

Run: `npm test -- src/lib/repositories/memory-media-repository.test.ts src/lib/firebase/firestore-media-repository.test.ts src/components/media`  
Expected: FAIL because media modules are missing.

- [ ] **Step 3: Implement metadata persistence and upload state machine**

```ts
export type ObservationMedia = {
  id: string; ownerId: string; lotId: string; observationId: string;
  cloudinaryPublicId: string; secureUrl: string; width: number; height: number;
  format: "jpg" | "jpeg" | "png" | "webp"; bytes: number; caption: string;
  capturedAt: string | null; createdBy: string; createdAt: string;
  updatedAt: string; deletedAt: string | null;
};
export interface MediaRepository {
  list(ownerId: string, lotId: string, observationId: string, includeDeleted?: boolean): Promise<ObservationMedia[]>;
  save(ownerId: string, media: ObservationMedia): Promise<ObservationMedia>;
  updateCaption(ownerId: string, lotId: string, observationId: string, mediaId: string, caption: string): Promise<ObservationMedia>;
  softDelete(ownerId: string, lotId: string, observationId: string, mediaId: string): Promise<ObservationMedia>;
  restore(ownerId: string, lotId: string, observationId: string, mediaId: string): Promise<ObservationMedia>;
}
export type MediaUploadState =
  | { kind: "idle" }
  | { kind: "signing"; fileName: string }
  | { kind: "uploading"; fileName: string; percent: number }
  | { kind: "saving"; publicId: string }
  | { kind: "failed"; message: string; retryable: boolean }
  | { kind: "complete"; mediaId: string };
```

Upload sequentially to cap memory, save Firestore metadata only after Cloudinary success, show retry on metadata failure, and preserve captions. Use Cloudinary transformed thumbnail URLs and an accessible dialog for full view.

- [ ] **Step 4: Verify GREEN**

Run: `npm test -- src/lib/repositories/memory-media-repository.test.ts src/lib/firebase/firestore-media-repository.test.ts src/components/media`  
Expected: PASS.

- [ ] **Step 5: Commit**

```text
git add src/lib src/components/media src/components/experiments src/app/experiments src/app/globals.css
git commit -m "Attach audited media to observations"
```

---

### Task 9: Dashboard Integration and Loading/Error States

**Files:**
- Modify: `src/app/page.tsx`
- Modify: `src/lib/repositories/lab-repository.ts`
- Modify: `src/lib/firebase/firestore-lab-repository.ts`
- Modify: `src/lib/repositories/demo-lab-repository.ts`
- Create: `src/components/lab/dashboard-summary.tsx`
- Create: `src/components/lab/dashboard-summary.test.tsx`
- Modify: `src/app/globals.css`

**Interfaces:**
- Produces: live dashboard counts, actionable links, and truthful future-feature labels.

- [ ] **Step 1: Write failing dashboard tests**

```tsx
const html = renderToStaticMarkup(<DashboardSummary snapshot={snapshot} />);
expect(html).toContain('href="/protocols/protocol-nodal-v01"');
expect(html).toContain('href="/experiments"');
expect(html).not.toContain("local preview");
```

- [ ] **Step 2: Verify RED**

Run: `npm test -- src/components/lab/dashboard-summary.test.tsx`  
Expected: FAIL because summary component is missing.

- [ ] **Step 3: Implement repository-backed summaries**

Remove dashboard-only active navigation state and mock modal. Load protocol, lot, research, and pending-step counts from repositories. Render unavailable future features as non-button text labelled `Coming later`.

- [ ] **Step 4: Verify GREEN**

Run: `npm test -- src/components/lab/dashboard-summary.test.tsx src/lib/repositories/demo-lab-repository.test.ts`  
Expected: PASS.

- [ ] **Step 5: Commit**

```text
git add src/app/page.tsx src/components/lab src/lib/repositories src/lib/firebase src/app/globals.css
git commit -m "Connect dashboard to live workflows"
```

---

### Task 10: Full Verification, Preview, and Handoff

**Files:**
- Modify: `handoff.md`
- Modify: `firestore.indexes.json` only if emulator/query output proves an index is required.
- Create: `docs/verification/protocol-media-release.md`

**Interfaces:**
- Consumes: all release modules.
- Produces: evidence for merge readiness; does not merge without user approval.

- [ ] **Step 1: Run fresh automated verification**

Run: `npm test`  
Expected: all tests pass once, with `.worktrees` excluded.  
Run: `npm run lint`  
Expected: exit 0.  
Run: `npm run build`  
Expected: all dashboard, protocol, experiment, research, and API routes compile.

- [ ] **Step 2: Run Firebase sandbox**

Run: `npm run firebase:verify`  
Expected: emulator process exits 0; owner access passes; cross-owner access is denied; protocol/progress/media audit pairs persist.

- [ ] **Step 3: Run rendered browser sandbox**

Start the production build locally. Check 1440×900, 1024×768, and 390×844. Verify navigation, direct refresh, protocol creation/edit/activation, lot progress, upload mock, captions, soft delete/restore, keyboard focus, reduced motion, Thai overflow, and all empty/loading/error/success states. Record exact results in `docs/verification/protocol-media-release.md`.

- [ ] **Step 4: Push feature branch and validate Vercel Preview**

Push the branch and open one draft PR. Wait for Vercel checks. User signs into Preview; verify real Firestore protocol/progress writes and one non-sensitive Cloudinary image upload. Search client output/logs to confirm no API secret exposure.

- [ ] **Step 5: Update handoff and commit**

Keep the first line exactly `ต้องมีการบันทึกทุกครั้งที่งานจบ`. Record commits, routes, emulator results, browser dimensions, Preview URL, test records, known limitations, and the next approval gate.

```text
git add handoff.md docs/verification/protocol-media-release.md
git commit -m "Record protocol media release verification"
```

- [ ] **Step 6: Request explicit merge approval**

Do not merge automatically. Present test, emulator, browser, Firebase, Cloudinary, and Vercel evidence. Merge once only after the user selects the merge option.
