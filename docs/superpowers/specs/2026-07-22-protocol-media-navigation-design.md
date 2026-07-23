# Protocol, Navigation, and Experiment Media Design

Date: 2026-07-22  
Status: Approved direction; awaiting written-spec review  
Target release: one production merge after all modules pass Preview validation

## 1. Objective

Turn the existing research dashboard into a functional, owner-scoped workspace. This increment delivers real navigation, a structured protocol workflow, and image attachments for experiment observations without starting the deferred plant-identification project.

The release includes three connected modules:

1. Real dashboard routes and navigation.
2. Protocol authoring, execution, completion, notes, and version history.
3. Cloudinary-backed observation media with Firestore metadata and audit history.

Research review remains a navigable read-only register in this release. Full claim approval and AI drafting are a later increment.

## 2. Locked Decisions

- Keep the existing Next.js App Router application and repository abstraction.
- Use Firebase Authentication and owner-scoped Firestore paths.
- Store image binaries in Cloudinary and image metadata in Firestore.
- Develop all modules on one feature branch with separate commits and Preview checkpoints.
- Merge to `master` once, only after the complete release passes automated, emulator, browser, mobile, and authenticated Preview checks.
- Preserve the current Gridgeist-derived visual direction and use one responsive web application rather than a separate mobile codebase.
- AI or machine-learning image identification is explicitly excluded.

## 3. Information Architecture

### Routes

| Route | Purpose |
|---|---|
| `/` | Dashboard with live summaries and working links |
| `/protocols` | Searchable protocol list and status filters |
| `/protocols/new` | Create a structured protocol draft |
| `/protocols/[protocolId]` | Read and execute a protocol version |
| `/protocols/[protocolId]/edit` | Edit a draft by creating/updating its working version |
| `/experiments` | Existing lot list |
| `/experiments/new` | Existing lot creation with protocol selection |
| `/experiments/[lotId]` | Existing observation timeline plus media |
| `/research` | Read-only evidence-labelled research register |

Dashboard buttons must navigate to these routes. Placeholder state changes that only alter dashboard text are removed.

### Navigation behavior

- Desktop: persistent left navigation with active-route indication.
- Mobile: compact top bar plus a menu exposing the same destinations.
- Keyboard: all navigation is reachable in logical tab order with visible focus.
- Deep links work after refresh and do not depend on dashboard client state.

## 4. Protocol Domain

### Protocol document

Stored at `users/{uid}/protocols/{protocolId}`.

Required fields:

- `id`, `ownerId`, `title`, `slug`
- `plantScope`
- `evidenceState`: `Verified | Adapted | Experimental | Pending review`
- `status`: `Draft | Active | Archived`
- `currentVersionId`
- `createdAt`, `updatedAt`, `deletedAt`

### Protocol version

Stored at `users/{uid}/protocols/{protocolId}/versions/{versionId}`.

Required fields:

- `id`, `protocolId`, `ownerId`
- semantic display version such as `0.1.0`
- `summary`, `changeNote`
- immutable snapshot of ordered steps
- `createdBy`, `createdAt`
- `publishedAt` when activated

Published versions are immutable. Editing an active protocol creates a new draft version. Existing experiment lots continue referencing the version selected when the lot was created.

The repository exposes `createDraftVersion(ownerId, protocolId, sourceVersionId, changeNote)`. It clones the published snapshot, increments the minor semantic version, points the protocol working state at the new draft, and records `version_created` in audit history.

### Protocol step

Each version snapshot contains ordered structured steps:

- stable `id`
- `order`, `title`, `instruction`
- optional `durationMinutes`
- `criticalControls[]`
- `safetyNotes[]`
- `referenceIds[]`
- `evidenceState`

The first release supports add, edit, remove, and reorder through explicit move-up/move-down controls. Drag-and-drop is excluded to keep keyboard and mobile behavior reliable.

### Protocol execution

Completion is lot-specific rather than a global protocol cursor. Stored at:

`users/{uid}/lots/{lotId}/protocolProgress/{stepId}`

Fields:

- `stepId`, `protocolId`, `versionId`, `lotId`, `ownerId`
- `state`: `Pending | Completed | Skipped`
- `note`
- `completedBy`, `completedAt`, `updatedAt`

The protocol detail screen may show a read-only version without a lot. When opened from a lot, it becomes a work surface with completion controls and notes.

## 5. Experiment Media Domain

### Upload flow

1. User selects one or more images in an observation form.
2. Client validates type, count, and size before transfer.
3. A server endpoint creates a signed Cloudinary upload request using server-only credentials.
4. Browser uploads directly to Cloudinary.
5. The application writes media metadata to Firestore and links it to the observation.
6. If metadata persistence fails after upload, the UI reports a recoverable incomplete-upload state; it does not silently claim success.

Unsigned public upload presets are not used.

### Media metadata

Stored at `users/{uid}/lots/{lotId}/observations/{observationId}/media/{mediaId}`.

Fields:

- `id`, `ownerId`, `lotId`, `observationId`
- `cloudinaryPublicId`, `secureUrl`
- `width`, `height`, `format`, `bytes`
- `caption`, `capturedAt`
- `createdBy`, `createdAt`, `updatedAt`, `deletedAt`

Accepted formats are JPEG, PNG, and WebP. Default limits are 8 images per observation and 10 MB per image. These values are constants and can be tightened after real usage data.

### Media lifecycle

- Removing an image is a soft delete in Firestore and produces an audit event.
- Cloudinary destruction is deferred to a cleanup workflow, preventing accidental irreversible loss.
- Restoring a soft-deleted item is allowed while the Cloudinary asset still exists.
- Image processing for species prediction is not triggered by upload.

## 6. Repository Boundaries

New interfaces isolate data access:

- `ProtocolRepository`: list, get, create draft, save draft version, activate version, archive, and soft delete.
- `ProtocolProgressRepository`: read progress, complete, skip, reopen, and save note.
- `MediaRepository`: prepare upload, save metadata, list, update caption, soft delete, and restore.
- Existing experiment repository remains responsible for lots, observations, and experiment audit events.

Memory implementations support deterministic unit tests and local UI sandboxing. Firestore implementations enforce owner matching before every operation and use batch writes for paired data/audit mutations.

## 7. Audit and Evidence Rules

- Protocol creation, version activation, archival, step completion, step reopening, media creation, media update, deletion, and restoration create audit events.
- Audit events record actor, timestamp, entity, action, and relevant before/after data.
- Evidence labels are mandatory on protocols and steps.
- `Pending review` content cannot be presented as `Verified` through UI defaults.
- Research register entries keep source title, URL/DOI when available, evidence label, and note.

## 8. UI Design Contract

### Dashboard

- Live counts come from repositories.
- “Open protocol”, “Review queue”, experiment rows, and navigation items use real links.
- Unimplemented future capabilities are labelled “Coming later” and are not styled as actionable controls.

### Protocol list and editor

- Dense list on desktop and stacked rows on mobile.
- Editor separates protocol metadata from ordered steps.
- Validation errors are shown beside their fields and summarized at submission.
- Destructive actions require confirmation; published versions cannot be overwritten.

### Protocol work surface

- Desktop: step rail, current instruction, and control/reference panel.
- Mobile: ordered vertical sections with a sticky compact action area that does not cover content.
- Completion controls expose pending, success, and error states.

### Observation media

- Thumbnail strip uses stable aspect ratios and Cloudinary transformations.
- Full-size viewing opens an accessible dialog.
- Upload progress, retry, empty, error, and deleted states are visible.
- Captions support long Thai text without overflow.

## 9. Authentication and Security

- All application data remains under `users/{uid}` and requires Firebase authentication.
- Firestore rules verify owner-scoped access for nested collections.
- Cloudinary API secret is server-only and never exposed through `NEXT_PUBLIC_*` variables.
- Signed upload endpoint verifies the authenticated Firebase ID token before signing.
- Allowed file types, maximum size, target folder, and public ID strategy are controlled server-side.
- Vercel environments use separate Cloudinary configuration for Preview and Production where available.

## 10. Error Handling

- Repository errors produce actionable Thai messages without exposing secrets or raw provider payloads.
- Forms retain entered values after recoverable failures.
- Repeated completion/delete/restore requests are idempotent.
- Upload cancellation leaves no Firestore success record.
- Missing protocol versions or Cloudinary assets render recoverable not-found states.
- Offline or permission failures do not optimistically display persisted success.

## 11. Verification Strategy

### Automated

- Domain validation and versioning tests.
- Memory and Firestore repository contract tests.
- Idempotency and audit pairing tests.
- Signed upload endpoint authentication and input validation tests.
- Component rendering and form-state tests.
- Existing regression suite remains green.

### Firebase sandbox

Run Auth and Firestore emulators before each delivery checkpoint. Verify owner isolation, nested protocol/version/progress/media permissions, paired audit writes, and denied cross-owner reads/writes.

### Browser sandbox

Use the production build locally and validate:

- dashboard links and direct route refresh
- protocol create/edit/version/activate workflow
- lot-specific step completion and notes
- image selection, upload mock, metadata rendering, soft delete, and restore
- desktop 1440 px, tablet 1024 px, and mobile 390 px
- keyboard navigation, focus visibility, Thai text, empty/loading/error/success states, image overflow, and reduced motion

### Hosted Preview

- Verify Firebase login and real Firestore round trips.
- Verify signed Cloudinary upload with a non-sensitive test image.
- Confirm secrets are absent from client bundles and logs.
- Merge once after all checks pass and the user explicitly approves.

## 12. Delivery Sequence

1. Shared navigation and real dashboard links.
2. Protocol domain, repositories, routes, editor, and version history.
3. Lot-specific protocol progress.
4. Signed Cloudinary upload and observation media UI.
5. Research register route.
6. Emulator and browser regression pass.
7. Vercel Preview and authenticated service validation.
8. User approval followed by one production merge.

## 13. Exclusions

- Plant species recognition, model training, embeddings, and image similarity.
- Automated AI claim approval or protocol publication.
- Multi-user collaboration, invitations, and public sharing.
- Hard deletion of research records or media during normal UI use.
- Native iOS or Android applications.

## 14. Acceptance Criteria

- Every action-styled dashboard control either navigates or performs a real operation.
- Protocol drafts can be created and edited as ordered structured steps.
- Active versions remain immutable and lots retain their referenced version.
- A lot can complete/reopen protocol steps and save notes with audit history.
- An observation can attach, display, caption, soft delete, and restore images.
- Cross-owner Firestore operations and unauthenticated upload signing are denied.
- Desktop, tablet, and mobile layouts have no horizontal overflow.
- Keyboard and visible-focus checks pass.
- Tests, lint, production build, Firebase emulator verification, browser sandbox, Vercel Preview, and authenticated Firebase/Cloudinary smoke tests pass before merge.
- `handoff.md` records each completed checkpoint and remains headed by the required reminder.
