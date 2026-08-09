import type { CreateLotInput, ExperimentLot, GuidedStepStatus, ProtocolStepRun } from "@/lib/domain/models";
import type { MediaRecipe, ResolvedManual, ResolvedStep } from "@/lib/manual/types";

/** รุ่นของโครงเนื้อหาที่ใช้ตอนบันทึก เก็บไว้เพื่อให้ย้อนดูได้ว่ารอบนั้นเดินตามคู่มือรุ่นไหน */
export const MANUAL_VERSION_ID = "manual-v1";

export type RoundStepState = {
  stepId: string;
  status: GuidedStepStatus;
  note: string;
  measurements: Record<string, number | null>;
  observedAt?: string;
};

export type RoundStep = ResolvedStep & { state: RoundStepState };

export type RoundView = {
  lotId: string;
  slug: string;
  title: string;
  startedAt: string;
  steps: RoundStep[];
  mediaRecipes: MediaRecipe[];
  currentStepNumber: number;
  passedCount: number;
};

const emptyState = (stepId: string): RoundStepState => ({
  stepId,
  status: "Pending",
  note: "",
  measurements: {},
});

/** กระปุกควบคุมแบบไม่มี explant (Control-B ของชุดทดลองเปรียบเทียบ) ไม่ต้องเลือกหรือตัด explant
 *  เพราะไม่มีชิ้นพืชให้ทำ แต่ยังต้องผ่านฟอกฆ่าเชื้อ ลงอาหาร และเฝ้าดูปนเปื้อนเหมือนกระปุกอื่น
 *  เพราะนั่นคือจุดประสงค์ของกระปุกเปล่า คือแยกว่าปนเปื้อนมาจากอาหาร/ภาชนะ ไม่ใช่จาก explant */
const BLANK_SKIP_STEP_IDS = new Set(["select-explant", "cut"]);

/**
 * ประกอบมุมมองของรอบเพาะจาก lot ที่เก็บไว้ บวกบันทึกรายขั้น บวกคู่มือที่ resolve แล้ว
 * บันทึกที่อ้างขั้นซึ่งไม่มีในคู่มือแล้วจะถูกข้าม เพื่อให้คู่มือที่แก้ลำดับขั้นภายหลัง
 * ไม่ทำให้รอบเก่าเปิดไม่ได้
 */
export function buildRoundView(lot: ExperimentLot, runs: ProtocolStepRun[], manual: ResolvedManual): RoundView {
  const byStepId = new Map<string, ProtocolStepRun>();
  for (const run of runs) byStepId.set(run.stepId, run);

  const applicableSteps = lot.isBlank
    ? manual.steps.filter((step) => !BLANK_SKIP_STEP_IDS.has(step.id))
    : manual.steps;

  const steps: RoundStep[] = applicableSteps.map((step) => {
    const run = byStepId.get(step.id);
    const state: RoundStepState = run
      ? {
          stepId: step.id,
          status: run.status,
          note: run.note,
          measurements: { ...run.measurements },
          observedAt: run.observedAt,
        }
      : emptyState(step.id);
    return { ...step, state };
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
