export type EvidenceState = "Verified" | "Adapted" | "Experimental" | "Pending review";
export type ProtocolStatus = "Draft" | "Active" | "Archived";

export type ProtocolStep = {
  id: string; order: number; title: string; instruction: string; durationMinutes: number | null;
  criticalControls: string[]; safetyNotes: string[]; referenceIds: string[]; evidenceState: EvidenceState;
};

export type ProtocolDraftInput = {
  title: string; plantScope: string; evidenceState: EvidenceState; summary: string; changeNote: string; steps: ProtocolStep[];
};

export type ProtocolRecord = {
  id: string; ownerId: string; title: string; slug: string; plantScope: string; evidenceState: EvidenceState;
  status: ProtocolStatus; currentVersionId: string; createdAt: string; updatedAt: string; deletedAt: string | null;
};

export type ProtocolVersion = {
  id: string; protocolId: string; ownerId: string; version: string; summary: string; changeNote: string;
  steps: ProtocolStep[]; createdBy: string; createdAt: string; publishedAt: string | null;
};
export type ProtocolProgressState = "Pending" | "Completed" | "Skipped";
export type ProtocolStepProgress = { stepId: string; protocolId: string; versionId: string; lotId: string; ownerId: string; state: ProtocolProgressState; note: string; completedBy: string | null; completedAt: string | null; updatedAt: string };
export type ObservationMedia={id:string;ownerId:string;lotId:string;observationId:string;cloudinaryPublicId:string;secureUrl:string;width:number;height:number;format:"jpg"|"jpeg"|"png"|"webp";bytes:number;caption:string;capturedAt:string|null;createdBy:string;createdAt:string;updatedAt:string;deletedAt:string|null};
export type ExperimentStatus = "Healthy" | "Review" | "At risk" | "Contaminated";
export type LotStatus = ExperimentStatus;

export type ExperimentLot = {
  id: string;
  ownerId: string;
  plant: string;
  protocolId: string;
  protocolTitle: string;
  protocolVersionId?: string;
  stage: string;
  status: ExperimentStatus;
  startedAt: string;
  createdAt: string;
  updatedAt: string;
};

export type CreateLotInput = Omit<ExperimentLot, "ownerId" | "createdAt" | "updatedAt">;

export type ObservationInput = {
  observedAt: string;
  status: ExperimentStatus;
  stage: string;
  note: string;
  shootCount: number | null;
  rootCount: number | null;
  contaminationCount: number | null;
};

export type Observation = ObservationInput & {
  id: string;
  lotId: string;
  ownerId: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};

export type AuditEvent = {
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

export type Protocol = {
  id: string;
  ownerId: string;
  title: string;
  version: string;
  activeStepIndex: number;
  stepCount: number;
};

export type ResearchSource = {
  id: string;
  ownerId: string;
  title: string;
  source: string;
  evidence: EvidenceState;
  note: string;
};
