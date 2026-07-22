export type EvidenceState = "Verified" | "Adapted" | "Experimental" | "Pending review";
export type ExperimentStatus = "Healthy" | "Review" | "At risk" | "Contaminated";
export type LotStatus = ExperimentStatus;

export type ExperimentLot = {
  id: string;
  ownerId: string;
  plant: string;
  protocolId: string;
  protocolTitle: string;
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
