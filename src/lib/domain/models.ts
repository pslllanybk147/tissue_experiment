export type EvidenceState = "Verified" | "Adapted" | "Experimental" | "Pending review";
export type ProtocolStatus = "Draft" | "Active" | "Archived";

export type BeginnerMaterial = {
  name: string;
  appearance: string;
  purpose: string;
  quantity?: string;
  specification?: string;
  allowedSubstitutes?: string[];
};

export type SelfCheckPlan = {
  title: string;
  checks: string[];
  passCriteria: string[];
  resolutionAction: string;
  failAction: string;
  requiredEvidence: Array<"note" | "photo" | "measurement">;
};

export type UncertaintyPath = {
  id: "cannot-find" | "not-sure" | "missing-equipment" | string;
  label: string;
  safeAction: string;
  blocksCompletion: boolean;
  selfCheck?: SelfCheckPlan;
};

export type ProtocolVisualAid = {
  id: string;
  kind: "node-cut-diagram" | "medium-placement-diagram" | "process-flow-diagram" | "contamination-diagram";
  title: string;
  caption: string;
  evidenceState: EvidenceState;
  sourceLabel?: string;
  sourceUrl?: string;
  labels?: string[];
};

export type BeginnerGlossaryTerm = {
  term: string;
  plainMeaning: string;
};

export type BeginnerInstruction = {
  currentAction: string;
  doNotDoYet: string[];
  whatToFind: string[];
  materials: BeginnerMaterial[];
  actions: string[];
  stopConditions: string[];
  evidencePrompt: string[];
  readyChecklist: string[];
  uncertaintyPaths: UncertaintyPath[];
  scienceNote: string;
  visualAids?: ProtocolVisualAid[];
  glossary?: BeginnerGlossaryTerm[];
};

export type ProtocolStep = {
  id: string; order: number; title: string; instruction: string; durationMinutes: number | null;
  criticalControls: string[]; safetyNotes: string[]; referenceIds: string[]; evidenceState: EvidenceState;
  workflowPhase?: "baseline" | "mark-explant" | "medium-preparation" | "readiness" | "explant-cut" | "surface-sterilization" | "culture";
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
  beginner?: BeginnerInstruction;
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

/** "nadcc-soak" คือ T3 ของ new_idea.md หัวข้อ 15: แช่ NaDCC 300 ppm นาน 24-48 ชม. แทนขั้น Haiter ทั้งขั้น
 *  ไม่ใช่ rinse หลัง Haiter แบบ RinseWaterMethod ("nadcc") ซึ่งเป็นคนละกลไกกัน */
export type SterilizationMethod = "haiter-chemical" | "pressure-sterilization" | "nadcc-soak";
export type RinseWaterMethod = "low-dose-hypochlorite" | "nadcc" | "commercial-sterile" | "pressure-steam";
export type MediumSterilizationMethod = "haiter-chemical" | "nadcc-chemical" | "pressure-sterilization";

/** แนวทางที่ผู้ใช้เลือกตอนตั้งค่ารอบ และล็อกไว้กับรอบนั้นตลอด
 *  "full" คือเส้นทางเดิมที่เก็บข้อมูลครบเพื่อเอาไปเทียบรอบต่อรอบ
 *  "simple" คือเส้นทางแบบคลิปสาธิต ทำตามได้จนจบโดยไม่ต้องกรอกงานบันทึกผล
 *  ทั้งสองแนวทางใช้คู่มือ สูตร และแหล่งอ้างอิงชุดเดียวกัน ต่างกันแค่ว่าอะไรถูกบังคับ
 *  ข้อที่ไม่ต่างกันเลยคือความปลอดภัยและเงื่อนไขให้หยุด ดู round-mode.ts */
export type RoundMode = "simple" | "full";
export type PreparationStatus = "planned" | "prepared" | "verified";
export type RinsePreparationStatus = PreparationStatus;
export type DoseValue = { value: number; unit: "mL" | "g" | "tablet" };
export type ChemicalPreparationSnapshot = {
  method: MediumSterilizationMethod | SterilizationMethod | RinseWaterMethod;
  protocolVersion: string;
  status: PreparationStatus;
  productName?: string;
  batchOrLot?: string;
  labelConcentration?: number;
  labelBasis?: "w/w" | "w/v" | "available-chlorine";
  targetPpm?: number;
  actualPpm?: number;
  calculatedDose?: DoseValue;
  actualDose?: DoseValue;
  stockVolumeMl?: number;
  finalVolumeMl?: number;
  containerCount?: number;
  preparedAt?: string;
  confirmedAt?: string;
  lockedAt: string;
};
export type BlankDecision = "completed" | "skipped";
export type WorkspaceType = "still-air-box" | "laminar-flow-cabinet";
export type WorkspaceDisinfectant = "alcohol-70" | "haiter-label";
export type WorkspaceApplicator = "wipe" | "spray-to-wipe";

export type WorkspaceSetupSnapshot = {
  workspaceType: WorkspaceType;
  disinfectant: WorkspaceDisinfectant;
  applicator: WorkspaceApplicator;
  alcoholPercent?: number;
  haiterSourcePercent?: number;
  haiterTargetPercent?: number;
  solutionVolumeMl?: number;
  minimumToolVolumeMl?: number;
  calculatedHaiterMl?: number;
  contactTimeMinutes: number;
  customEquipment: string[];
};

export type MediumBatchSnapshot = {
  explantCount: number;
  cultureJarCount: number;
  blankJarCount: number;
  spareJarCount: number;
  totalJarCount: number;
  mediumPerJarMl: number;
  lossPercent: number;
  baseVolumeMl: number;
  lossAllowanceMl: number;
  totalVolumeMl: number;
};

export type RinseWaterSnapshot = {
  method: RinseWaterMethod;
  /** Legacy lots may omit this; omitted means planned, never prepared. */
  status?: RinsePreparationStatus;
  protocolVersion?: string;
  containerCount: 3;
  volumePerContainerMl: number;
  preparationVolumeMl?: number;
  targetChlorinePercent?: number;
  minimumWaitMinutes?: number;
  productName?: string;
  batchOrLot?: string;
  actualChlorinePpm?: number;
  stockVolumeMl?: number;
  finalVolumeMl?: number;
  calculatedDose?: DoseValue;
  actualDose?: DoseValue;
  preparedAt?: string;
  confirmedAt?: string;
  lockedAt?: string;
};

export type RoundSetupChemistry = {
  bleachPercentWw: number;
  nadccAvailableChlorinePercent: number;
  nadccTabletMassG: number;
  nadccMassGPerTablet: number;
};

export type SterilizationProfile = {
  id: string;
  title: string;
  method: SterilizationMethod;
  version: string;
  evidenceState: EvidenceState;
  referenceIds: string[];
  equipmentRequirements: string[];
  steps: ProtocolStep[];
  blankPolicy: "required" | "recommended-skippable" | "optional";
};

export type LotSterilizationSnapshot = {
  profileId: string;
  profileVersion: string;
  method: SterilizationMethod;
  /** ไม่มีค่าในรอบที่สร้างก่อนมีโหมดง่าย รอบเหล่านั้นอ่านเป็น "full" เสมอ */
  mode?: RoundMode;
  mediumSterilizationMethod?: MediumSterilizationMethod;
  rinseMethod?: RinseWaterMethod;
  chemistry?: RoundSetupChemistry;
  lockedAt?: string;
  activeChlorinePercent?: number;
  targetChlorinePercent?: number;
  mediumVolumeMl?: number;
  minimumToolVolumeMl?: number;
  calculatedDoseMl?: number;
  mediumBatch?: MediumBatchSnapshot;
  mediumPreparation?: ChemicalPreparationSnapshot;
  surfacePreparation?: ChemicalPreparationSnapshot;
  rinseWater?: RinseWaterSnapshot;
  workspace?: WorkspaceSetupSnapshot;
  blankDecision?: BlankDecision;
  blankSkipReason?: string;
};

export type SterilizationReadiness = {
  mediumReady: boolean;
  containersReady: boolean;
  workspaceReady: boolean;
  toolsReady: boolean;
  blankDecision: BlankDecision;
  blankSkipReason: string;
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
  responses?: Record<string, number | string | boolean | null>;
  mediaIds: string[];
  evidenceObservationId?: string;
  timerStartedAt?: string;
  timerEndsAt?: string;
  completedAt?: string;
  completionMode?: "live" | "retrospective" | "carried-forward";
  retrospectiveRecordedAt?: string;
  retrospectiveApproximateDate?: string;
  carryForwardRecordedAt?: string;
  carryForwardTargetStepId?: string;
  carryForwardApproximateDate?: string;
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

/** บทบาทของแต่ละแขนงในชุดทดลองเปรียบเทียบ ล็อกตาม new_idea.md หัวข้อ 15
 *  ยังไม่ใช่ enum ทั่วไปสำหรับสร้างชุดทดลองเองได้ทุกแบบ แค่พอสำหรับแม่แบบนี้แม่แบบเดียว */
export type TrialArmRole = "control-a" | "control-b" | "t1" | "t2" | "t3";

export type T3Override = {
  reason: string;
  acknowledged: boolean;
  recordedAt: string;
  mode: "risk-override" | "demo-only";
};

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
  deletedAt?: string | null;
  plantId?: string;
  taxonId?: string;
  templateId?: string;
  method?: "shoot-tip" | "nodal" | "generic";
  sterilization?: LotSterilizationSnapshot;
  workflowVersion?: "v1" | "v2";
  /** lot หลายใบที่มี trialId เดียวกันคือแขนงต่าง ๆ ของชุดทดลองเปรียบเทียบเดียวกัน
   *  ไม่มี entity แยกสำหรับชุดทดลอง กลุ่มคือ lot ที่ trialId ตรงกันเท่านั้น */
  trialId?: string;
  armRole?: TrialArmRole;
  armLabel?: string;
  /** true เฉพาะกระปุกควบคุมที่ไม่มี explant ใช้แยกว่าปนเปื้อนมาจากอาหาร/ภาชนะ ไม่ใช่จาก explant
   *  ตัวแปรนี้ตัดสินว่า Guided Runner ข้ามขั้นที่ต้องมี explant หรือไม่ (ดู round-adapter.ts) */
  isBlank?: boolean;
  /** บันทึกการยอมรับความเสี่ยงเมื่อผู้ใช้ปลดล็อก T3 ก่อนมีผล T1/T2 ครบ */
  t3Override?: T3Override;
  /** จำนวนภาชนะที่กันไว้ให้แขนนี้ ณ ตอนสร้างชุดทดลอง ไม่เปลี่ยนตาม inventory ภายหลัง */
  plannedContainerCount?: number;
  trialContainerPlan?: { total: number; reserved: number };
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
  action: "created" | "updated" | "deleted" | "restored" | "completed" | "dataset_queued" | "carried_forward";
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
  url?: string;
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
