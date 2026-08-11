import type { ExperimentLot, RinseWaterSnapshot, TrialArmRole } from "@/lib/domain/models";
import type { EvidenceRef, Measurement, ResolvedStep } from "@/lib/manual/types";

type BlankStepInput = {
  id: string;
  title: string;
  summary: string;
  why: string;
  materials: string[];
  actions: string[];
  passCriteria: string[];
  stopConditions: string[];
  measurements?: Measurement[];
  evidenceRequirement?: "none" | "one-photo" | "photo-with-caption";
  illustrationId?: string;
  durationMinutes: number;
};

function blankStep(input: BlankStepInput, order: number): ResolvedStep {
  return {
    ...input,
    safetyNotes: [],
    measurements: input.measurements ?? [],
    evidence: {
      level: "adapted",
      sourceIds: ["source-merck-media-sterilization"],
      note: "ประยุกต์หลักควบคุมภาชนะและอาหารเปล่าเพื่อแยกแหล่งการปนเปื้อน",
    },
    order,
    origin: "core",
  };
}

function buildBlankSteps(): ResolvedStep[] {
  const steps: BlankStepInput[] = [
    {
      id: "blank-prepare",
      title: "เตรียมพื้นที่และติดฉลาก",
      summary: "เตรียมพื้นที่สะอาดและระบุว่าเป็น Control-B",
      why: "ฉลากช่วยป้องกันการสลับกับกระปุกแขนงอื่น",
      materials: ["ตู้ SAB", "แอลกอฮอล์สำหรับเช็ดพื้นผิว", "ฉลาก", "ปากกา"],
      actions: ["เช็ดพื้นผิวด้านในตู้ SAB", "รอให้ละอองแอลกอฮอล์ระเหย", "เขียนรหัส Control-B และวันที่บนฉลาก"],
      passCriteria: ["พื้นที่แห้งและฉลากอ่านได้"],
      stopConditions: ["ยังมีละอองแอลกอฮอล์ในอากาศ", "ฉลากอ่านไม่ออก"],
      durationMinutes: 10,
    },
    {
      id: "blank-medium",
      title: "เตรียมอาหารชุดเดียวกับแขนงอื่น",
      summary: "ใช้อาหารจาก batch เดียวกันเพื่อให้เปรียบเทียบได้",
      why: "ถ้าใช้อาหารคนละ batch จะระบุแหล่งปนเปื้อนได้ยาก",
      materials: ["อาหาร batch เดียวกับแขนงอื่น", "บันทึกรหัส batch"],
      actions: ["ตรวจรหัส batch ของอาหาร", "จดรหัส batch ที่ใช้"],
      passCriteria: ["รหัส batch ตรงกับแขนงอื่น"],
      stopConditions: ["ไม่ทราบว่าอาหารมาจาก batch ใด"],
      durationMinutes: 5,
    },
    {
      id: "blank-container",
      title: "เตรียมกระปุกเปล่า",
      summary: "ตรวจสภาพกระปุกและฝาก่อนแบ่งอาหาร",
      why: "รอยแตกหรือฝาที่ปิดไม่สนิททำให้ผลควบคุมใช้ไม่ได้",
      materials: ["กระปุกเพาะพร้อมฝา"],
      actions: ["ตรวจว่ากระปุกไม่มีรอยแตก", "ตรวจว่าฝาปิดได้สนิท", "วางกระปุกในพื้นที่สะอาด"],
      passCriteria: ["กระปุกและฝาสมบูรณ์"],
      stopConditions: ["กระปุกแตก", "ฝาปิดไม่สนิท"],
      measurements: [{ id: "blank-container-total", label: "จำนวนกระปุกเปล่า", unit: "count", required: true, min: 1 }],
      durationMinutes: 5,
    },
    {
      id: "blank-pour",
      title: "แบ่งอาหารโดยไม่ใส่วัสดุพืช",
      summary: "แบ่งอาหารลงกระปุกและปล่อยกระปุกว่าง",
      why: "กระปุกนี้ใช้ตรวจเชื้อจากอาหาร ภาชนะ และขั้นตอนแบ่งอาหาร",
      materials: ["อาหาร batch ที่บันทึกไว้", "กระปุก Control-B"],
      actions: ["เปิดฝากระปุกให้น้อยที่สุด", "แบ่งอาหารปริมาตรเดียวกับแขนงอื่น", "ไม่ใส่วัสดุพืชลงในกระปุก"],
      passCriteria: ["แบ่งอาหารครบและไม่ใส่วัสดุพืช"],
      stopConditions: ["มีสิ่งอื่นตกลงในกระปุก", "อาหารหกที่ขอบฝา"],
      illustrationId: "blank-control-compare",
      durationMinutes: 10,
    },
    {
      id: "blank-seal",
      title: "ปิดฝาและบันทึก",
      summary: "ปิดกระปุกทันทีและเก็บภาพเริ่มต้น",
      why: "ภาพเริ่มต้นช่วยแยกคราบเดิมออกจากเชื้อที่เกิดภายหลัง",
      materials: ["ฝาที่เข้าคู่กับกระปุก", "โทรศัพท์"],
      actions: ["ปิดฝาให้สนิท", "ตรวจฉลากอีกครั้ง", "ถ่ายภาพกระปุกหลังปิดฝา"],
      passCriteria: ["ฝาปิดสนิท ฉลากอ่านได้ และมีภาพเริ่มต้น"],
      stopConditions: ["ฝาหลวม", "ไม่มีรหัส Control-B บนกระปุก"],
      evidenceRequirement: "one-photo",
      durationMinutes: 5,
    },
    {
      id: "blank-incubate",
      title: "บ่มร่วมกับชุดทดลอง",
      summary: "วาง Control-B ในสภาพเดียวกับแขนงอื่น",
      why: "ตำแหน่งและสภาพบ่มที่ต่างกันทำให้เปรียบเทียบไม่ได้",
      materials: ["พื้นที่บ่มชุดเดียวกับแขนงอื่น"],
      actions: ["วาง Control-B ในพื้นที่บ่มเดียวกับแขนงอื่น", "จดตำแหน่งที่วาง", "ไม่เปิดฝาระหว่างบ่ม"],
      passCriteria: ["บันทึกตำแหน่งและไม่เปิดฝา"],
      stopConditions: ["ฝาเปิดหรือรั่วระหว่างบ่ม"],
      durationMinutes: 5,
    },
    {
      id: "blank-observe",
      title: "ตรวจการปนเปื้อน",
      summary: "ตรวจทุกกระปุกผ่านผนังโดยไม่เปิดฝา",
      why: "ผลนี้บอกว่าการปนเปื้อนอาจมาจากอาหาร ภาชนะ หรือขั้นตอนแบ่งอาหาร",
      materials: ["โทรศัพท์", "พื้นที่แยกกระปุกที่มีปัญหา"],
      actions: ["ตรวจความขุ่น เมือก และเส้นใยโดยไม่เปิดฝา", "ถ่ายภาพกระปุกที่ผิดปกติ", "แยกกระปุกที่ผิดปกติออกจากพื้นที่สะอาด", "จดจำนวนทั้งหมดและจำนวนที่ยังใส"],
      passCriteria: ["ตรวจและบันทึกครบทุกกระปุก"],
      stopConditions: ["เปิดฝากระปุกในพื้นที่สะอาด"],
      evidenceRequirement: "photo-with-caption",
      measurements: [
        { id: "container-total", label: "จำนวนกระปุกทั้งหมด", unit: "count", required: true, min: 1 },
        { id: "container-clean", label: "จำนวนกระปุกที่ยังใส", unit: "count", required: true, min: 0 },
        { id: "observed-date", label: "วันที่ตรวจผล", unit: "date", kind: "date", required: true },
        {
          id: "contamination-result",
          label: "ผลรวมที่เห็น",
          unit: "text",
          kind: "select",
          required: true,
          options: [
            { value: "clean", label: "ยังใสทุกกระปุก" },
            { value: "mixed", label: "มีทั้งใสและปนเปื้อน" },
            { value: "contaminated", label: "ปนเปื้อนทั้งหมด" },
          ],
        },
      ],
      durationMinutes: 10,
    },
  ];

  return steps.map(blankStep);
}

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

function fixedSterilizeStep(
  step: ResolvedStep,
  role: Exclude<TrialArmRole, "control-b">,
  rinseWater?: RinseWaterSnapshot,
): ResolvedStep {
  const base = cloneStep(step);

  const batchFields: Measurement[] = [
    { id: "stock-product", label: "ชื่อผลิตภัณฑ์ที่ใช้จริง", unit: "text", kind: "text", required: true },
    { id: "stock-batch", label: "เลข batch/lot หรือข้อความบนฉลาก", unit: "text", kind: "text", required: true },
    { id: "active-chlorine-percent", label: "คลอรีนออกฤทธิ์ที่ใช้จริง", unit: "%", kind: "number", required: true, min: 0.01 },
    { id: "stock-volume-ml", label: "ปริมาตร stock ที่ตวงจริง", unit: "mL", kind: "number", required: true, min: 0 },
    { id: "final-volume-ml", label: "ปริมาตรรวมที่เตรียมจริง", unit: "mL", kind: "number", required: true, min: 1 },
  ];

  if (role === "t3") {
    const executionInstructions = [
      {
        label: "เตรียมภาชนะ S",
        action: "ติดป้ายกระปุก S ว่า NaDCC 300 ppm และวางไว้ในพื้นที่ทำงาน",
        quantity: "เตรียมสารละลายให้มีคลอรีนออกฤทธิ์ 300 ppm ตามค่าที่ระบบคำนวณจากฉลากจริง",
        container: "S",
        completion: "กระปุกมีป้ายและสารละลายถูกเตรียมตาม batch ที่บันทึกไว้",
      },
      {
        label: "แช่ชิ้นพืชใน S",
        action: "ใส่ชิ้นพืชให้จมทั้งหมดในสารละลาย S แล้วเริ่มจับเวลา",
        container: "S",
        durationLabel: "24 ถึง 48 ชั่วโมง",
        completion: "ครบเวลาที่เลือกแล้วและจดเวลาจริงไว้",
      },
      {
        label: "ล้างหลังแช่",
        action: "ย้ายชิ้นพืชลงภาชนะ R1, R2 และ R3 ตามลำดับ ใช้น้ำปลอดเชื้อภาชนะละหนึ่งรอบ",
        quantity: "R1–R3 ภาชนะละ 50 mL",
        container: "R1 → R2 → R3",
        completion: "ล้างครบ 3 รอบแล้ว ไม่เติมน้ำล้างคลอรีนต่ำเพิ่ม",
      },
    ];
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
      executionInstructions,
      passCriteria: ["ล้างครบตามจำนวนรอบที่จด", "เนื้อเยื่อยังไม่ขาวซีดหรือเปื่อย"],
      safetyNotes: ["สวมถุงมือและแว่นตา", "ห้ามผสม NaDCC กับกรด แอมโมเนีย หรือแอลกอฮอล์"],
      measurements: [
        ...batchFields,
        { id: "nadcc-actual-ppm", label: "NaDCC ที่ได้จริง", unit: "ppm", kind: "number", required: true, min: 1 },
        { id: "soak-hours", label: "เวลาแช่จริง", unit: "hour", kind: "number", required: true, min: 1 },
        { id: "sterile-washes", label: "จำนวนรอบที่ล้างจริง", unit: "count", kind: "number", required: true, min: 1 },
      ],
      evidence: {
        level: "adapted",
        sourceIds: ["source-nadcc-explant-sterilisation"],
        note: "300 ppm นาน 24 ถึง 48 ชั่วโมงมาจากงานกับ shoot explant ภาคสนาม ไม่ใช่งานตรงพันธุ์หรือวงศ์นี้",
      },
      durationMinutes: 2880,
      doses: undefined,
      evidenceRequirement: "one-photo",
    };
  }

  const rinseActions = role === "control-a"
    ? ["ครบเวลาแล้วล้างด้วยน้ำปลอดเชื้อ 3 รอบ รอบละประมาณหนึ่งนาที"]
    : role === "t1"
      ? [
          "ครบเวลาแล้วล้างต่อด้วยน้ำ NaClO 300 ppm จำนวน 3 รอบ รอบละประมาณหนึ่งนาที",
        ]
      : [
          "ครบเวลาแล้วล้างต่อด้วยน้ำ NaDCC 300 ppm จำนวน 3 รอบ รอบละประมาณหนึ่งนาที",
      ];
  const rinseName = role === "control-a" ? "น้ำปลอดเชื้อ" : role === "t1" ? "น้ำล้างคลอรีนต่ำ 300 ppm จาก NaClO" : "น้ำล้างคลอรีนต่ำ 300 ppm จาก NaDCC";
  const rinseVolume = rinseWater?.volumePerContainerMl ?? 50;
  const executionInstructions = [
    {
      label: "เตรียมและติดป้ายภาชนะ",
      action: "วางกระปุก S สำหรับฟอก และกระปุก R1, R2, R3 สำหรับล้างตามลำดับบนพื้นที่ทำงาน",
      quantity: `S 1 ใบ · R1–R3 ภาชนะละ ${rinseVolume} mL`,
      container: "S · R1 · R2 · R3",
      completion: "ป้ายทุกใบอ่านได้และวางเรียงจาก S ไป R3",
    },
    {
      label: "เตรียมน้ำยาฟอก",
      action: "เตรียม Haiter ตามค่าที่ระบบคำนวณจากฉลากจริง แล้วเทสารละลายลงใน S",
      quantity: "คลอรีนออกฤทธิ์จุดตั้งต้น 1.0% · ใช้ปริมาณจากเครื่องคำนวณ ไม่ต้องคำนวณเอง",
      container: "S",
      completion: "สารละลายอยู่ใน S และชิ้นพืชจะจมได้ทั้งหมด",
    },
    {
      label: "ฟอกและเริ่มจับเวลา",
      action: "ใส่ชิ้นพืชลงใน S ให้จมทั้งหมด แล้วเริ่มจับเวลาหลังใส่ชิ้นสุดท้าย",
      container: "S",
      durationMinutes: 12,
      completion: "ครบ 12 นาทีและชิ้นพืชยังไม่ขาวซีดหรือเปื่อย",
    },
    {
      label: "เขย่าเบา ๆ ระหว่างฟอก",
      action: "เขย่าหรือหมุน S เบา ๆ เป็นระยะ เพื่อให้สารละลายสัมผัสผิวชิ้นพืชทั่วถึง",
      container: "S",
      durationLabel: "ทำเป็นระยะตลอดช่วงฟอก 12 นาที ไม่ใช่แช่เพิ่มอีก 12 นาที",
      completion: "ทำต่อเนื่องจนหมดเวลาฟอก โดยไม่เขย่าแรง",
    },
    ...[1, 2, 3].map((round) => ({
      label: `ล้างรอบที่ ${round}`,
      action: `เทสารละลายจากรอบก่อนทิ้ง แล้วล้างชิ้นพืชด้วย${rinseName}ใน R${round}`,
      quantity: `ภาชนะละ ${rinseVolume} mL`,
      container: `R${round}`,
      durationMinutes: 1,
      completion: `ครบ 1 นาทีแล้วเทน้ำจาก R${round} ทิ้ง${round === 3 ? " และไปขั้นตัดแต่ง" : " ก่อนย้ายไปรอบถัดไป"}`,
    })),
  ];

  const rinseFields: Measurement[] = role === "control-a" ? [] : [
    { id: "rinse-product", label: "ผลิตภัณฑ์ที่ใช้ทำน้ำ rinse", unit: "text", kind: "text", required: true },
    { id: "rinse-batch", label: "เลข batch/lot ของสาร rinse", unit: "text", kind: "text", required: true },
    { id: "rinse-actual-ppm", label: "คลอรีนในน้ำ rinse ที่ได้จริง", unit: "ppm", kind: "number", required: true, min: 1 },
    { id: "rinse-stock-volume-ml", label: "ปริมาตร stock rinse ที่ตวงจริง", unit: "mL", kind: "number", required: true, min: 0 },
    { id: "rinse-final-volume-ml", label: "ปริมาตรน้ำ rinse รวม", unit: "mL", kind: "number", required: true, min: 1 },
  ];
  const finalRinseField: Measurement = { id: "final-rinse", label: "ทำ final rinse ด้วยน้ำปลอดเชื้อ", unit: "boolean", kind: "checkbox", required: false };

  return {
    ...base,
    materials: [
      ...haiterMaterials,
      ...(role === "control-a" ? ["น้ำปลอดเชื้อสำหรับล้าง"] : []),
      ...(role === "t1" ? ["น้ำ NaClO 300 ppm"] : role === "t2" ? ["น้ำ NaDCC 300 ppm"] : []),
    ],
    actions: [...haiterActions, ...rinseActions, "จดเวลาและจำนวนรอบที่ทำจริง"],
    executionInstructions,
    measurements: [
      ...batchFields,
      { id: "sterilize-minutes", label: "เวลาฟอกที่ใช้จริง", unit: "min", kind: "number", required: true, min: 1 },
      ...rinseFields,
      { id: "sterile-rinses", label: role === "control-a" ? "จำนวนรอบที่ล้างด้วยน้ำปลอดเชื้อจริง" : "จำนวนรอบที่ล้างด้วยน้ำ rinse จริง", unit: "count", kind: "number", required: true, min: 1 },
      ...(role === "control-a" ? [finalRinseField] : []),
    ],
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
    evidenceRequirement: "one-photo",
    illustrationId: role === "t2" ? "sterilant-sequence" : base.illustrationId,
  };
}

function projectArmStep(step: ResolvedStep, role: TrialArmRole, lot: ExperimentLot): ResolvedStep {
  if (step.id === "check-contamination" && (role === "t1" || role === "t2")) {
    return {
      ...cloneStep(step),
      measurements: [
        { id: "container-total", label: "จำนวนกระปุกทั้งหมด", unit: "count", required: true, min: 1 },
        { id: "container-clean", label: "จำนวนกระปุกไม่ติดเชื้อ", unit: "count", required: true, min: 0 },
        { id: "container-usable", label: "จำนวนที่ยังใช้ได้", unit: "count", required: true, min: 0 },
        { id: "observed-date", label: "วันที่ตรวจผล", unit: "date", kind: "date", required: true },
        {
          id: "contamination-result",
          label: "ผลรวมที่เห็น",
          unit: "text",
          kind: "select",
          required: true,
          options: [
            { value: "clean", label: "ยังใสทุกกระปุก" },
            { value: "mixed", label: "มีทั้งใสและปนเปื้อน" },
            { value: "contaminated", label: "ปนเปื้อนทั้งหมด" },
          ],
        },
      ],
      evidenceRequirement: "photo-with-caption",
    };
  }
  if (step.id !== "sterilize" || role === "control-b") return cloneStep(step);
  return fixedSterilizeStep(step, role, lot.sterilization?.rinseWater);
}

export function projectTrialSteps(steps: ResolvedStep[], lot: ExperimentLot): ResolvedStep[] {
  if (lot.isBlank && !lot.armRole) {
    return buildBlankSteps();
  }

  if (!lot.armRole) return steps.map(cloneStep);

  if (lot.armRole === "control-b") {
    return buildBlankSteps();
  }

  return steps.map((step) => projectArmStep(step, lot.armRole!, lot));
}
