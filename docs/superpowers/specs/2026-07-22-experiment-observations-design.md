# Experiment Lots and Structured Observations — Design Specification

## Objective

Build the first production data-entry workflow for Philodendron Lab: users can create experiment lots, record structured observations, edit observations, soft-delete and restore them, and inspect an audit history. All records remain owner-scoped under the authenticated Firebase UID.

## Scope

This increment includes:

- experiment lot list, search, and status filters;
- experiment lot creation;
- experiment lot detail;
- structured observation creation and editing;
- soft deletion and restoration;
- audit history for lot and observation mutations;
- responsive desktop, tablet, and mobile states;
- loading, empty, validation, success, and error states.

This increment excludes Cloudinary uploads and the Protocol editor. Observation records reserve a stable identity for media metadata to be added in the next increment.

## Architecture Decision

Use Firebase client SDK writes through an owner-scoped repository. Each observation mutation and its audit event use one Firestore batch so both succeed or both fail. This provides useful internal traceability for a personal research workspace without introducing Firebase Admin credentials or Cloud Functions.

The audit trail is not regulatory-grade or tamper-proof against the authenticated owner. Repository interfaces must keep UI components independent of the persistence implementation so writes can later move to a Next.js server route or Cloud Function.

## Routes

- `/experiments`: searchable and filterable lot list.
- `/experiments/new`: lot creation form.
- `/experiments/[lotId]`: lot summary, observation timeline, observation form, deleted-item controls, and audit history.

The existing dashboard links to these routes but remains a summary surface.

## Firestore Model

```text
users/{uid}/lots/{lotId}
users/{uid}/lots/{lotId}/observations/{observationId}
users/{uid}/lots/{lotId}/auditEvents/{eventId}
```

### ExperimentLot

```ts
type ExperimentLot = {
  id: string;
  ownerId: string;
  plant: string;
  protocolId: string;
  protocolTitle: string;
  stage: string;
  status: "Healthy" | "Review" | "At risk" | "Contaminated";
  startedAt: string;
  createdAt: string;
  updatedAt: string;
};
```

### Observation

```ts
type Observation = {
  id: string;
  lotId: string;
  ownerId: string;
  observedAt: string;
  status: "Healthy" | "Review" | "At risk" | "Contaminated";
  stage: string;
  note: string;
  shootCount: number | null;
  rootCount: number | null;
  contaminationCount: number | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};
```

### AuditEvent

```ts
type AuditEvent = {
  id: string;
  lotId: string;
  ownerId: string;
  entityType: "lot" | "observation";
  entityId: string;
  action: "created" | "updated" | "deleted" | "restored";
  actorId: string;
  occurredAt: string;
  before: Record<string, unknown> | null;
  after: Record<string, unknown> | null;
};
```

Timestamps use ISO strings in this increment to remain compatible with the existing domain model and deterministic tests. A later migration may adopt Firestore Timestamp without changing component contracts.

## Repository Contract

The experiment repository exposes owner-checked operations:

```ts
interface ExperimentRepository {
  listLots(ownerId: string): Promise<ExperimentLot[]>;
  getLot(ownerId: string, lotId: string): Promise<ExperimentLot | null>;
  createLot(ownerId: string, input: CreateLotInput): Promise<ExperimentLot>;
  listObservations(ownerId: string, lotId: string, includeDeleted?: boolean): Promise<Observation[]>;
  createObservation(ownerId: string, lotId: string, input: ObservationInput): Promise<Observation>;
  updateObservation(ownerId: string, lotId: string, observationId: string, input: ObservationInput): Promise<Observation>;
  softDeleteObservation(ownerId: string, lotId: string, observationId: string): Promise<Observation>;
  restoreObservation(ownerId: string, lotId: string, observationId: string): Promise<Observation>;
  listAuditEvents(ownerId: string, lotId: string): Promise<AuditEvent[]>;
}
```

Every method rejects an owner ID different from the authenticated repository UID. Update, delete, and restore operations reject missing records. Soft delete sets `deletedAt`; restore clears it.

## Validation

Lot validation requires:

- non-empty lot ID, plant, protocol, and stage;
- lot ID normalized to uppercase and limited to letters, digits, and hyphens;
- a valid start date;
- a supported status.

Observation validation requires:

- a valid observation date/time;
- a supported status;
- non-empty stage and note;
- numeric counts that are either absent or non-negative integers.

Invalid forms stay populated and show field-level messages. Submission is disabled while a write is in progress.

## User Experience

### Experiment list

- Search Lot ID and plant name case-insensitively.
- Filter by all supported statuses.
- Show newest-started lots first.
- Use a dense table on desktop and stacked rows on mobile.
- Provide explicit loading, empty, and error surfaces.

### Experiment detail

- Header displays Lot ID, plant, protocol, stage, status, and start date.
- Timeline sorts observations newest first.
- Structured form supports create and edit modes.
- Each active observation offers Edit and Delete.
- “Show deleted” reveals deleted entries with Restore.
- Audit history is visually separate and lists action, actor, timestamp, and a concise change summary.
- A media placeholder communicates that photo attachments arrive in the next increment.

### Navigation and visual contract

Reuse the existing Gridgeist-derived shell, typography, evidence-oriented density, restrained borders, badges, focus states, and responsive breakpoints. Desktop and mobile use the same components, not parallel implementations.

## Error and Permission Behavior

- Firestore errors appear inline and do not clear form input.
- Missing or unauthorized lots render a neutral not-found state that does not reveal whether another owner has the ID.
- Duplicate lot IDs show a clear validation/write-conflict message.
- Buttons prevent duplicate submissions while pending.
- Deleted observations are excluded by default.

## Security Rules

Existing owner-only recursive rules cover the new subcollections. All documents include `ownerId`, and create/update rules require it to equal the route UID. No data is written outside `users/{uid}`.

## Testing

Unit tests cover:

- lot and observation validation;
- search and status filtering;
- create, update, soft delete, and restore behavior;
- deleted-item filtering;
- audit `before` and `after` snapshots;
- owner mismatch rejection;
- missing-record errors.

Pre-delivery verification covers:

- `npm test`;
- `npm run lint`;
- `npm run build`;
- desktop 1440px, tablet 1024px, and mobile 390px;
- list search/filter;
- lot creation;
- observation create/edit/delete/restore;
- audit history;
- keyboard focus and horizontal overflow;
- loading, empty, validation, and error states;
- production Firebase behavior after preview deployment.

## Delivery Strategy

Implement on `feature/experiment-observations` and open a Draft PR. Deploy through Vercel Preview first. Merge to `master` only after automated checks and sandbox verification pass. Update `handoff.md` at every session boundary.
