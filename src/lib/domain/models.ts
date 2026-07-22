export type EvidenceState = "Verified" | "Adapted" | "Experimental" | "Pending review";
export type LotStatus = "Healthy" | "Review" | "At risk";

export type ExperimentLot = {
  id: string;
  ownerId: string;
  plant: string;
  protocol: string;
  stage: string;
  day: number;
  status: LotStatus;
  startedAtLabel: string;
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
