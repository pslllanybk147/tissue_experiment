import type { ExperimentLot, TrialArmRole } from "@/lib/domain/models";
import type { EvidenceRef, ResolvedStep } from "@/lib/manual/types";

const BLANK_SKIP_STEP_IDS = new Set(["select-explant", "cut"]);

function cloneStep(step: ResolvedStep): ResolvedStep {
  return {
    ...step,
    materials: [...step.materials],
    actions: [...step.actions],
    passCriteria: [...step.passCriteria],
    stopConditions: [...step.stopConditions],
    safetyNotes: [...step.safetyNotes],
    measurements: step.measurements.map((measurement) => ({ ...measurement })),
    ...(step.doses ? { doses: structuredClone(step.doses) } : {}),
    evidence: structuredClone(step.evidence),
    ...(step.troubleshootingIds ? { troubleshootingIds: [...step.troubleshootingIds] } : {}),
    ...(step.referenceImages ? { referenceImages: step.referenceImages.map((image) => ({ ...image })) } : {}),
  };
}

const haiterMaterials = [
  "Haiter 6% w/w",
  "น้ำปลอดเชื้อสำหรับล้าง",
  "ภาชนะแช่",
  "ตัวจับเวลา",
  "[[surfactant|สารลดแรงตึงผิว]]",
  "syringe ที่อ่านปริมาตรได้เหมาะกับค่าที่คำนวณ",
];

const haiterActions = [
  "อ่านฉลาก Haiter แล้วคำนวณให้ได้คลอรีนออกฤทธิ์ 0.5 ถึง 1.0 เปอร์เซ็นต์",
  "ตวง Haiter ด้วย syringe ตามค่าที่คำนวณ",
  "หยดน้ำยาล้างจาน 1 ถึง 2 หยดต่อสารฟอก 100 มิลลิลิตร แล้วคนเบา ๆ",
  "ใส่ชิ้นพืชให้จมในสารฟอกที่เจือจางแล้ว",
  "เริ่มจับเวลาหลังใส่ชิ้นสุดท้าย",
  "เขย่าหรือคนเบา ๆ ตลอดเวลาที่แช่",
];

const haiterEvidence: EvidenceRef = {
  level: "adapted",
  sourceIds: ["source-sigma-explant-sterilization", "source-anthurium-review-2010"],
  note: "ช่วง Haiter เป็นจุดตั้งต้นระดับวงศ์และต้องบันทึกค่าที่ใช้จริง",
};

function fixedSterilizeStep(step: ResolvedStep, role: Exclude<TrialArmRole, "control-b">): ResolvedStep {
  const base = cloneStep(step);

  if (role === "t3") {
    return {
      ...base,
      summary: "แช่ชิ้นพืชด้วย NaDCC เดี่ยว แล้วล้างออกด้วยน้ำปลอดเชื้อ",
      why: "แขนงเสี่ยงสูงนี้ทดสอบการใช้ NaDCC เป็นสารฟอกหลัก จึงต้องบันทึกเวลาและอาการบาดเจ็บอย่างละเอียด",
      materials: ["NaDCC ที่ฉลากระบุปริมาณสารออกฤทธิ์", "น้ำปลอดเชื้อ", "ภาชนะแช่", "ตัวจับเวลา"],
      actions: [
        "เตรียม NaDCC ให้ได้คลอรีนออกฤทธิ์ 300 ppm",
        "ใส่ชิ้นพืชให้จมในสารละลาย",
        "แช่นาน 24 ถึง 48 ชั่วโมง",
        "ครบเวลาแล้วล้างด้วยน้ำปลอดเชื้อ 3 รอบ",
        "จดความเข้มข้น เวลา และจำนวนรอบที่ทำจริง",
      ],
      passCriteria: ["ล้างครบตามจำนวนรอบที่จด", "เนื้อเยื่อยังไม่ขาวซีดหรือเปื่อย"],
      safetyNotes: ["สวมถุงมือและแว่นตา", "ห้ามผสม NaDCC กับกรด แอมโมเนีย หรือแอลกอฮอล์"],
      measurements: base.measurements.map((measurement) =>
        measurement.id === "sterile-rinses" ? { ...measurement, id: "sterile-washes", label: "จำนวนรอบที่ล้าง" } : measurement,
      ),
      evidence: {
        level: "adapted",
        sourceIds: ["source-nadcc-explant-sterilisation"],
        note: "300 ppm นาน 24 ถึง 48 ชั่วโมงมาจากงานกับ shoot explant ภาคสนาม ไม่ใช่งานตรงพันธุ์หรือวงศ์นี้",
      },
      durationMinutes: 2880,
      doses: undefined,
    };
  }

  const rinseActions = role === "control-a"
    ? ["ครบเวลาแล้วล้างด้วยน้ำปลอดเชื้อ 3 รอบ รอบละประมาณหนึ่งนาที"]
    : role === "t1"
      ? [
          "ครบเวลาแล้วล้างสารฟอกออกด้วยน้ำปลอดเชื้อ",
          "ล้างต่อด้วยน้ำ NaClO 300 ppm จำนวน 3 รอบ รอบละประมาณหนึ่งนาที",
          "ล้างครั้งสุดท้ายด้วยน้ำปลอดเชื้อ",
        ]
      : [
          "ครบเวลาแล้วล้างสารฟอกออกด้วยน้ำปลอดเชื้อ",
          "ล้างต่อด้วยน้ำ NaDCC 300 ppm จำนวน 3 รอบ รอบละประมาณหนึ่งนาที",
          "ล้างครั้งสุดท้ายด้วยน้ำปลอดเชื้อ",
        ];

  return {
    ...base,
    materials: [
      ...haiterMaterials,
      ...(role === "t1" ? ["น้ำ NaClO 300 ppm"] : role === "t2" ? ["น้ำ NaDCC 300 ppm"] : []),
    ],
    actions: [...haiterActions, ...rinseActions, "จดเวลาและจำนวนรอบที่ทำจริง"],
    safetyNotes: role === "t2"
      ? base.safetyNotes
      : base.safetyNotes.filter((note) => !/NaDCC|nadcc/.test(note)),
    evidence: role === "control-a"
      ? haiterEvidence
      : {
          level: "adapted",
          sourceIds: role === "t2"
            ? ["source-sigma-explant-sterilization", "source-nadcc-explant-sterilisation"]
            : ["source-sigma-explant-sterilization"],
          note: role === "t1"
            ? "แขนงนี้ใช้ Haiter แล้วทดสอบน้ำ NaClO 300 ppm เพิ่มเติม"
            : "แขนงนี้ใช้ Haiter แล้วทดสอบน้ำ NaDCC 300 ppm เพิ่มเติม ยังไม่มีงานตรงพันธุ์",
        },
    doses: undefined,
  };
}

function projectArmStep(step: ResolvedStep, role: TrialArmRole): ResolvedStep {
  if (step.id !== "sterilize" || role === "control-b") return cloneStep(step);
  return fixedSterilizeStep(step, role);
}

export function projectTrialSteps(steps: ResolvedStep[], lot: ExperimentLot): ResolvedStep[] {
  if (lot.isBlank && !lot.armRole) {
    return steps.filter((step) => !BLANK_SKIP_STEP_IDS.has(step.id)).map(cloneStep);
  }

  if (!lot.armRole) return steps.map(cloneStep);

  if (lot.armRole === "control-b") {
    return steps.filter((step) => !BLANK_SKIP_STEP_IDS.has(step.id)).map(cloneStep);
  }

  return steps.map((step) => projectArmStep(step, lot.armRole!));
}
