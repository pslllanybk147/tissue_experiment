import type {
  CreateLotInput,
  ExperimentLot,
  GuidedStepStatus,
  LotSterilizationSnapshot,
  ProtocolStepRun,
  TrialArmRole,
} from "@/lib/domain/models";
import type { MediaRecipe, ResolvedManual, ResolvedStep } from "@/lib/manual/types";
import { projectTrialSteps } from "@/lib/trials/project-trial-steps";
import { evaluateT3Eligibility, type T3Eligibility } from "@/lib/trials/t3-eligibility";
import { decodeStepValues, type StepResponses } from "./field-values";

/** รุ่นของโครงเนื้อหาที่ใช้ตอนบันทึก เก็บไว้เพื่อให้ย้อนดูได้ว่ารอบนั้นเดินตามคู่มือรุ่นไหน */
export const MANUAL_VERSION_ID = "manual-v1";

export type RoundStepState = {
  stepId: string;
  status: GuidedStepStatus;
  note: string;
  measurements: Record<string, number | null>;
  responses?: StepResponses;
  observedAt?: string;
};

/** displayNumber คือตำแหน่งจริงใน view.steps (หลังกรองขั้นของกระปุกเปล่าออกแล้ว) ใช้แทน step.order
 *  เสมอเมื่อจะแสดงเลขขั้นหรือสร้างลิงก์ /step/N เพราะ step.order มาจากตำแหน่งในคู่มือเต็ม 15 ขั้น
 *  ก่อนกรอง ถ้ากระปุกเปล่าข้ามสองขั้น step.order จะไม่ตรงกับตำแหน่งจริงในหน้า /step/[step] อีกต่อไป
 *  (บั๊กที่พบจริง: URL /step/6 ของกระปุกเปล่าเปิดขั้นที่ order บอกว่าเป็น "ขั้นที่ 8") */
export type RoundStep = ResolvedStep & { state: RoundStepState; displayNumber: number };

export type RoundView = {
  lotId: string;
  slug: string;
  title: string;
  startedAt: string;
  steps: RoundStep[];
  mediaRecipes: MediaRecipe[];
  currentStepNumber: number;
  passedCount: number;
  /** มีค่าเมื่อรอบนี้เป็นแขนงหนึ่งของชุดทดลองเปรียบเทียบ (ดู src/lib/trials) ใช้แสดงแบนเนอร์
   *  บอกวิธีฟอกฆ่าเชื้อของแขนงนี้ตรงขั้นฟอกฆ่าเชื้อ โดยไม่ต้องแยกเนื้อหาคู่มือเป็นคนละชุดต่อแขนง */
  trialArmRole?: TrialArmRole;
  trialArmLabel?: string;
  sterilization?: LotSterilizationSnapshot;
  t3Eligibility?: T3Eligibility;
};

export type RoundTrialContext = {
  trialLots: ExperimentLot[];
  trialRuns: ProtocolStepRun[];
};

const emptyState = (stepId: string): RoundStepState => ({
  stepId,
  status: "Pending",
  note: "",
  measurements: {},
  responses: {},
});

/**
 * ประกอบมุมมองของรอบเพาะจาก lot ที่เก็บไว้ บวกบันทึกรายขั้น บวกคู่มือที่ resolve แล้ว
 * บันทึกที่อ้างขั้นซึ่งไม่มีในคู่มือแล้วจะถูกข้าม เพื่อให้คู่มือที่แก้ลำดับขั้นภายหลัง
 * ไม่ทำให้รอบเก่าเปิดไม่ได้
 */
export function buildRoundView(
  lot: ExperimentLot,
  runs: ProtocolStepRun[],
  manual: ResolvedManual,
  trialContext?: RoundTrialContext,
): RoundView {
  const byStepId = new Map<string, ProtocolStepRun>();
  for (const run of runs) byStepId.set(run.stepId, run);

  const applicableSteps = projectTrialSteps(manual.steps, lot);

  const steps: RoundStep[] = applicableSteps.map((step, index) => {
    const run = byStepId.get(step.id);
    const state: RoundStepState = run
      ? {
          stepId: step.id,
          status: run.status,
          note: run.note,
          measurements: { ...run.measurements },
          responses: decodeStepValues(run),
          observedAt: run.observedAt,
        }
      : emptyState(step.id);
    return { ...step, state, displayNumber: index + 1 };
  });

  const passedCount = steps.filter((step) => step.state.status === "Passed").length;
  const firstUnfinished = steps.findIndex((step) => step.state.status !== "Passed");
  const currentStepNumber = firstUnfinished === -1 ? steps.length : firstUnfinished + 1;

  return {
    lotId: lot.id,
    slug: lot.protocolId,
    title: manual.commonName,
    startedAt: lot.startedAt,
    steps,
    mediaRecipes: manual.mediaRecipes,
    currentStepNumber,
    passedCount,
    ...(lot.armRole ? { trialArmRole: lot.armRole } : {}),
    ...(lot.armLabel ? { trialArmLabel: lot.armLabel } : {}),
    ...(lot.sterilization ? { sterilization: lot.sterilization } : {}),
    ...(lot.armRole === "t3" && trialContext
      ? { t3Eligibility: evaluateT3Eligibility(trialContext.trialLots, trialContext.trialRuns) }
      : {}),
  };
}

export function newLotInput(manual: ResolvedManual, startedAt: string): CreateLotInput {
  return {
    id: `round-${Date.now().toString(36)}`,
    plant: manual.commonName,
    protocolId: manual.slug,
    protocolTitle: manual.scientificName,
    protocolVersionId: MANUAL_VERSION_ID,
    stage: manual.steps[0]?.id ?? "",
    status: "Healthy",
    startedAt,
    workflowVersion: "v2",
  };
}
