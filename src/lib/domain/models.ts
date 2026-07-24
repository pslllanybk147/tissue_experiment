export type EvidenceState = "Verified" | "Adapted" | "Experimental" | "Pending review";
export type ProtocolStatus = "Draft" | "Active" | "Archived";

export type ProtocolStep = {
  id: string; order: number; title: string; instruction: string; durationMinutes: number | null;
  criticalControls: string[]; safetyNotes: string[]; referenceIds: string[]; evidenceState: EvidenceState;
  objective?: string;
  whyItMatters?: string;
  prerequisites?: string[];
  materials?: string[];
  measurements?: StepMeasurement[];
  expectedResult?: string;
  passCriteria?: string[];
  failCriteria?: string[];
  nextActionOnPass?: string;
  nextActionOnFail?: string;
  requiredEvidence?: Array<"note" | "photo" | "measurement">;
  allowPhoto?: boolean;
  allowNote?: boolean;
};

export type MeasurementUnit = "mL" | "g" | "mg/L" | "%" | "min" | "°C" | "pH" | "count";
export type StepMeasurement = { id: string; label: string; unit: MeasurementUnit; required?: boolean; min?: number; max?: number };
export type GuidedStepStatus = "Pending" | "Passed" | "Needs review" | "Failed";

export type PlantRecord = {
  id: string;
  ownerId: string;
  sellerName: string;
  suspectedSpecies: string;
  taxonId?: string;
  identificationConfidence: "Unknown" | "Low" | "Medium" | "High";
  source: string;
  receivedAt: string;
  health: ExperimentStatus;
  notes: string;
  baselineMediaIds: string[];
  createdAt: string;
  updatedAt: string;
};

export type ProtocolTemplate = {
  id: string;
  title: string;
  plantScope: string;
  method: "shoot-tip" | "nodal" | "generic";
  evidenceState: EvidenceState;
  description: string;
  protocolId?: string;
};

export type ProtocolStepRun = {
  id: string;
  ownerId: string;
  lotId: string;
  protocolId: string;
  versionId: string;
  stepId: string;
  status: GuidedStepStatus;
  note: string;
  measurements: Record<string, number | null>;
  mediaIds: string[];
  evidenceObservationId?: string;
  observedAt: string;
  updatedAt: string;
};

export type UnifiedAuditEvent = {
  id: string;
  ownerId: string;
  lotId: string;
  entityType: "lot" | "observation" | "media" | "protocol-progress" | "protocol" | "plant";
  entityId: string;
  action: string;
  occurredAt: string;
  before?: Record<string, unknown> | null;
  after?: Record<string, unknown> | null;
};

export type ProtocolDraftInput = {
  title: string; plantScope: string; evidenceState: EvidenceState; summary: string; changeNote: string; steps: ProtocolStep[]; claimIds?: string[]; sourceIds?: string[];
};

export type ProtocolRecord = {
  id: string; ownerId: string; title: string; slug: string; plantScope: string; evidenceState: EvidenceState;
  status: ProtocolStatus; currentVersionId: string; createdAt: string; updatedAt: string; deletedAt: string | null;
};

export type ProtocolVersion = {
  id: string; protocolId: string; ownerId: string; version: string; summary: string; changeNote: string; claimIds?: string[]; sourceIds?: string[];
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
  plantId?: string;
  templateId?: string;
  method?: "shoot-tip" | "nodal" | "generic";
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
  kind?: "manual" | "protocol-step-evidence";
  protocolStepId?: string;
};

export type Observation = ObservationInput & {
  id: string;
  lotId: string;
  ownerId: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  kind?: "manual" | "protocol-step-evidence";
  protocolStepId?: string;
};

export type AuditEvent = {
  id: string;
  lotId: string;
  ownerId: string;
  entityType: "lot" | "observation" | "media" | "protocol-progress" | "protocol" | "plant";
  entityId: string;
  action: "created" | "updated" | "deleted" | "restored" | "completed" | "dataset_queued";
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

export type DatasetReviewStatus = "Pending review" | "Approved" | "Rejected";
export type DatasetProvenanceKind = "user-captured" | "licensed-reference";
export type DatasetLabelSource = "owner" | "expert" | "imported";
export type DatasetConfidence = "Unknown" | "Low" | "Medium" | "High";

export type DatasetProvenance = {
  kind: DatasetProvenanceKind;
  sourceUrl: string | null;
  license: string | null;
  attribution: string | null;
  provenanceId: string;
  status: DatasetReviewStatus;
  reviewedBy: string | null;
  reviewedAt: string | null;
  note: string;
};

export type DatasetLabel = {
  scientificName: string;
  cultivarName: string;
  confidence: DatasetConfidence;
  source: DatasetLabelSource;
  reviewedBy: string | null;
  reviewedAt: string | null;
  note: string;
};

export type DatasetItem = {
  id: string;
  ownerId: string;
  mediaId: string;
  lotId: string;
  observationId: string;
  assetUrl: string;
  width?: number;
  height?: number;
  format?: "jpg" | "jpeg" | "png" | "webp";
  bytes?: number;
  provenance: DatasetProvenance;
  label: DatasetLabel | null;
  reviewStatus: DatasetReviewStatus;
  includedInTraining: boolean;
  createdAt: string;
  updatedAt: string;
};
