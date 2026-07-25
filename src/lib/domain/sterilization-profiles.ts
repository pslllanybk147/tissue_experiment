import type {
  ProtocolStep,
  SterilizationProfile,
  SterilizationReadiness,
} from "./models";

function profileStep(
  id: string,
  title: string,
  instruction: string,
  evidenceState: ProtocolStep["evidenceState"] = "Experimental",
): ProtocolStep {
  return {
    id,
    order: 0,
    title,
    instruction,
    durationMinutes: null,
    criticalControls: [],
    safetyNotes: [],
    referenceIds: [],
    evidenceState,
    workflowPhase: "medium-preparation",
    allowNote: true,
    allowPhoto: true,
    requiredEvidence: ["note"],
  };
}

const commonBlankStep = profileStep(
  "record-blank-decision",
  "ตรวจ Blank หรือบันทึกเหตุผลที่ข้าม",
  "ตรวจภาชนะ Blank ตามช่วงเวลาที่ Protocol กำหนด หากข้ามต้องบันทึกเหตุผลและยอมรับความเสี่ยง",
  "Adapted",
);

export const sterilizationProfiles: SterilizationProfile[] = [
  {
    id: "haiter-chemical-v1",
    title: "Haiter / sodium hypochlorite สำหรับ Home Lab",
    method: "haiter-chemical",
    version: "1.0.0",
    evidenceState: "Experimental",
    referenceIds: [],
    equipmentRequirements: [
      "ฉลากที่ระบุ % sodium hypochlorite หรือ active chlorine",
      "อุปกรณ์วัดปริมาตรที่อ่านค่าต่ำสุดได้",
      "ภาชนะอาหารและภาชนะ Blank",
    ],
    blankPolicy: "recommended-skippable",
    steps: [
      profileStep(
        "read-haiter-label",
        "อ่านความเข้มข้นจากฉลาก Haiter",
        "บันทึก % sodium hypochlorite หรือ active chlorine ตามฉลาก ห้ามคาดเดาจากชื่อสินค้า",
      ),
      profileStep(
        "calculate-haiter-dose",
        "คำนวณปริมาตร Haiter",
        "ใช้ C1V1 = C2V2 และตรวจว่าปริมาตรที่ได้วัดได้ด้วยอุปกรณ์จริง หากน้อยเกินไปให้ทำ working dilution",
      ),
      profileStep(
        "prepare-haiter-medium",
        "เตรียมอาหารแบบ Haiter",
        "เลือกสูตรตาม Protocol version ชั่ง MS น้ำตาล วุ้น และ stock hormones ปรับ pH ติด batch id แล้วเติม Haiter ตามค่าที่คำนวณ",
      ),
      commonBlankStep,
    ],
  },
  {
    id: "pressure-sterilization-v1",
    title: "หม้อนึ่งแรงดัน",
    method: "pressure-sterilization",
    version: "1.0.0",
    evidenceState: "Adapted",
    referenceIds: [],
    equipmentRequirements: [
      "หม้อนึ่งแรงดันหรือ autoclave",
      "ภาชนะทนความร้อนและความดัน",
      "ตัวบันทึกเวลาและเงื่อนไขการฆ่าเชื้อ",
    ],
    blankPolicy: "recommended-skippable",
    steps: [
      profileStep(
        "prepare-pressure-medium",
        "เตรียมอาหารสำหรับหม้อนึ่งแรงดัน",
        "เลือกสูตรตาม Protocol version ชั่ง MS น้ำตาล วุ้น และ stock hormones ปรับ pH บรรจุภาชนะ และติดป้าย batch ก่อนฆ่าเชื้อ",
        "Adapted",
      ),
      profileStep(
        "pressure-sterilize-medium",
        "ฆ่าเชื้ออาหารด้วยความดัน",
        "ใช้เงื่อนไขอุณหภูมิ ความดัน และเวลาตาม Protocol version แล้วทำให้อาหารเย็นก่อนตรวจ",
        "Adapted",
      ),
      commonBlankStep,
    ],
  },
];

export function profileById(profileId: string): SterilizationProfile {
  const profile = sterilizationProfiles.find((candidate) => candidate.id === profileId);
  if (!profile) throw new Error(`ไม่พบ Sterilization Profile: ${profileId}`);
  return structuredClone(profile);
}

export function canUnlockExplantSteps(readiness: SterilizationReadiness): boolean {
  const physicalChecks = readiness.mediumReady
    && readiness.containersReady
    && readiness.workspaceReady
    && readiness.toolsReady;
  const blankRecorded = readiness.blankDecision === "completed"
    || readiness.blankSkipReason.trim().length > 0;
  return physicalChecks && blankRecorded;
}

function readinessStep(): ProtocolStep {
  return {
    ...profileStep(
      "sterilization-readiness-gate",
      "ตรวจความพร้อมก่อนตัดต้น",
      "ยืนยันว่าอาหาร ภาชนะ เครื่องมือ และพื้นที่พร้อม รวมทั้งบันทึกผล Blank หรือเหตุผลที่ข้าม",
      "Adapted",
    ),
    workflowPhase: "readiness",
    criticalControls: ["อย่าเพิ่งตัดต้นไม้จนกว่าขั้นนี้จะผ่าน"],
  };
}

function classifyBaseStep(step: ProtocolStep): ProtocolStep {
  const title = step.title.toLowerCase();
  if (
    title.includes("baseline")
    || title.includes("รับต้นไม้")
    || title.includes("ตรวจสุขภาพ")
    || title.includes("ยืนยันชนิด")
  ) {
    return { ...step, workflowPhase: "baseline" };
  }
  if (
    title.includes("เลือกตำแหน่ง")
    || title.includes("เลือกยอด/ข้อ/ตาข้าง")
  ) {
    return {
      ...step,
      title: "ทำเครื่องหมายตำแหน่ง explant (ยังไม่ตัด)",
      instruction: `${step.instruction} ขั้นนี้ให้ถ่ายรูปและทำเครื่องหมายเท่านั้น ยังไม่ตัดต้นแม่`,
      workflowPhase: "mark-explant",
    };
  }
  if (
    title.includes("ตัดและเตรียมชิ้นพืช")
    || title.includes("ตัดและเตรียม explant")
  ) {
    return { ...step, workflowPhase: "explant-cut" };
  }
  if (title.includes("ฟอกฆ่าเชื้อ")) {
    return {
      ...step,
      title: "ฟอกฆ่าเชื้อผิว explant",
      workflowPhase: "surface-sterilization",
    };
  }
  if (title.includes("เตรียมพื้นที่ปลอดเชื้อ")) {
    return { ...step, workflowPhase: "medium-preparation" };
  }
  return { ...step, workflowPhase: "culture" };
}

export function composeGuidedSteps(
  baseSteps: ProtocolStep[],
  profile: SterilizationProfile,
): ProtocolStep[] {
  const classified = baseSteps.map(classifyBaseStep);
  const beforeCut = classified.filter((step) =>
    step.workflowPhase !== "explant-cut"
    && step.workflowPhase !== "surface-sterilization"
    && !step.title.includes("เตรียมอาหารและอุปกรณ์"));
  const cutAndSurface = classified.filter((step) =>
    step.workflowPhase === "explant-cut" || step.workflowPhase === "surface-sterilization");
  const remaining = beforeCut.filter((step) => step.workflowPhase === "culture");
  const preparation = beforeCut.filter((step) =>
    step.workflowPhase === "baseline" || step.workflowPhase === "mark-explant");
  const workspace = beforeCut.filter((step) => step.workflowPhase === "medium-preparation");
  const composed = [
    ...preparation,
    ...profile.steps.map((step) => structuredClone(step)),
    ...workspace,
    readinessStep(),
    ...cutAndSurface,
    ...remaining,
  ];

  return composed.map((step, order) => ({ ...step, order }));
}
