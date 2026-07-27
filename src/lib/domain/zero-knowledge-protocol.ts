import type {
  BeginnerInstruction,
  BeginnerGlossaryTerm,
  BeginnerMaterial,
  ProtocolStep,
  ProtocolVisualAid,
  UncertaintyPath,
} from "./models";

const prohibitedEscalationTerms = [
  "ผู้มีประสบการณ์",
  "ผู้เชี่ยวชาญ",
  "ผู้ชำนาญ",
  "ขอให้ช่วยตรวจ",
  "ให้ช่วยตรวจ",
];

export function containsProhibitedEscalation(value: string): boolean {
  return prohibitedEscalationTerms.some((term) => value.includes(term));
}

function selfCheckFor(
  id: string,
  safeAction: string,
): UncertaintyPath["selfCheck"] {
  const shared = {
    requiredEvidence: ["note"] as Array<"note" | "photo" | "measurement">,
    resolutionAction: "กลับไปทำขั้นนี้ใหม่ตามข้อมูลที่ตรวจพบและบันทึกผลจริง",
  };
  if (id === "missing-equipment") {
    return {
      ...shared,
      title: "ตรวจอุปกรณ์ที่ขาด",
      checks: [
        "อ่านชื่อและช่วงวัดของอุปกรณ์ที่ขั้นนี้กำหนด",
        "ตรวจรายการของทดแทนที่อนุญาตในหัวข้ออุปกรณ์",
        "ยืนยันว่าของที่มีวัดหรือทำงานได้ครบช่วงที่กำหนด",
      ],
      passCriteria: ["มีอุปกรณ์ตรงข้อกำหนดหรือของทดแทนที่ระบบอนุญาต"],
      resolutionAction: "เลือกอุปกรณ์ที่ผ่านข้อกำหนด แล้วกลับไปเริ่มขั้นนี้ใหม่",
      failAction: "หยุดขั้นนี้และจัดหาอุปกรณ์ตามข้อกำหนด ห้ามใช้ของที่ระบบไม่ได้ระบุว่าใช้แทนได้",
    };
  }
  return {
    ...shared,
    title: id === "cannot-find" ? "ค้นหาจุดหรือข้อมูลอีกครั้ง" : "ตรวจสิ่งที่ไม่แน่ใจอีกครั้ง",
    checks: [
      "อ่านหัวข้อ “ข้อมูลหรือผลที่ต้องตรวจ” ใหม่ทีละข้อ",
      "จัดแสงให้สว่างและมองหรือถ่ายภาพจากอย่างน้อยสองมุม",
      "เทียบสิ่งที่เห็นกับภาพประกอบและเกณฑ์ผ่าน/ไม่ผ่านบนหน้านี้",
      "เขียนเฉพาะสิ่งที่เห็นหรือวัดได้จริง ไม่เดาคำตอบ",
    ],
    passCriteria: ["ระบุข้อมูลหรือผลได้ตรงกับเกณฑ์บนหน้าจอทุกข้อ"],
    failAction: safeAction,
  };
}

export function defaultUncertaintyPaths(safeAction: string): UncertaintyPath[] {
  const missingEquipmentAction = "หยุดขั้นตอนนี้ก่อน ตรวจของทดแทนที่ระบบอนุญาต หากไม่มีให้จัดหาอุปกรณ์ตามข้อกำหนด ห้ามใช้อุปกรณ์อื่นแทนโดยเดาเอง";
  return [
    {
      id: "cannot-find",
      label: "ฉันหาไม่เจอ",
      safeAction,
      blocksCompletion: true,
      selfCheck: selfCheckFor("cannot-find", safeAction),
    },
    {
      id: "not-sure",
      label: "ฉันไม่แน่ใจ",
      safeAction,
      blocksCompletion: true,
      selfCheck: selfCheckFor("not-sure", safeAction),
    },
    {
      id: "missing-equipment",
      label: "ฉันไม่มีอุปกรณ์นี้",
      safeAction: missingEquipmentAction,
      blocksCompletion: true,
      selfCheck: selfCheckFor("missing-equipment", missingEquipmentAction),
    },
  ];
}

export function beginnerInstructionIssues(
  instruction: BeginnerInstruction,
): string[] {
  const issues: string[] = [];
  if (!instruction.currentAction.trim()) issues.push("ต้องบอกว่าตอนนี้กำลังทำอะไร");
  if (!instruction.doNotDoYet.length) issues.push("ต้องบอกสิ่งที่ยังห้ามทำ");
  if (!instruction.whatToFind.length) issues.push("ต้องบอกสิ่งที่ต้องมองหา");
  if (!instruction.materials.length) issues.push("ต้องบอกของที่ต้องหยิบ");
  if (!instruction.actions.length) issues.push("ต้องมีวิธีทำแบบทีละข้อ");
  if (!instruction.stopConditions.length) issues.push("ต้องบอกเงื่อนไขที่ต้องหยุด");
  if (!instruction.evidencePrompt.length) issues.push("ต้องบอกหลักฐานที่ต้องบันทึก");
  if (!instruction.readyChecklist.length) issues.push("ต้องมีรายการตรวจความพร้อม");
  if (!instruction.uncertaintyPaths.length) issues.push("ต้องมีทางเลือกเมื่อผู้ใช้ไม่แน่ใจ");
  if (!instruction.scienceNote.trim()) issues.push("ต้องมีเหตุผลทางวิทยาศาสตร์");
  if (!instruction.glossary?.length) issues.push("ต้องอธิบายคำศัพท์สำหรับมือใหม่");
  if (!instruction.visualAids?.length) issues.push("ต้องมีภาพประกอบหรือภาพจำลอง");
  for (const path of instruction.uncertaintyPaths) {
    if (!path.selfCheck?.checks.length || !path.selfCheck.passCriteria.length || !path.selfCheck.failAction.trim()) {
      issues.push(`ทางเลือก “${path.label}” ต้องมีขั้นตรวจซ้ำและเกณฑ์ตัดสิน`);
    }
  }
  const allText = JSON.stringify(instruction);
  if (containsProhibitedEscalation(allText)) issues.push("ห้ามส่งผู้ใช้ไปหาผู้มีประสบการณ์หรือผู้เชี่ยวชาญ");
  return issues;
}

export function isBeginnerReadyStep(step: ProtocolStep): boolean {
  return Boolean(
    step.beginner
    && beginnerInstructionIssues(step.beginner).length === 0,
  );
}

function describeMaterial(name: string): BeginnerMaterial {
  const normalized = name.toLowerCase();
  if (normalized.includes("โทรศัพท์") || normalized.includes("กล้อง")) {
    return {
      name,
      appearance: "โทรศัพท์หรือกล้องที่เปิดดูภาพหลังถ่ายได้ และเลนส์ไม่เปื้อน",
      purpose: "ถ่ายหลักฐานให้เห็นต้นไม้และตำแหน่งที่กำลังทำงาน",
      quantity: "1 เครื่อง",
      specification: "กล้องโฟกัสได้และดูภาพหลังถ่ายได้",
      allowedSubstitutes: ["กล้องดิจิทัล"],
    };
  }
  if (normalized.includes("ป้าย") || normalized.includes("ฉลาก")) {
    return {
      name,
      appearance: "แผ่นหรือเทปสีอ่อนที่เขียนรหัสด้วยปากกาแล้วอ่านได้ชัด",
      purpose: "ป้องกันการสลับต้น ชิ้นพืช ภาชนะ และสูตรอาหาร",
      quantity: "อย่างน้อย 1 ป้ายต่อชิ้นหรือภาชนะ",
      specification: "เขียนแล้วไม่เลือนเมื่อโดนน้ำ",
      allowedSubstitutes: ["เทปเขียนฉลากที่ทนน้ำ"],
    };
  }
  if (normalized.includes("แบบบันทึก") || normalized.includes("รายการ")) {
    return {
      name,
      appearance: "กระดาษหรือหน้าจอที่มีช่องให้เขียนวันที่ ค่า และสิ่งที่พบ",
      purpose: "เก็บข้อมูลจริงเพื่อย้อนตรวจภายหลัง",
      quantity: "1 ชุดต่อ Lot",
      specification: "มีช่องวันที่ ค่า หน่วย และหมายเหตุ",
      allowedSubstitutes: ["แบบบันทึกในระบบนี้"],
    };
  }
  if (normalized.includes("ใบมีด") || normalized.includes("กรรไกร")) {
    return {
      name,
      appearance: "เครื่องมือตัดคมที่สะอาด ไม่มีสนิม และจับได้มั่นคง",
      purpose: "ตัดชิ้นพืชโดยลดการช้ำของเนื้อเยื่อ",
      quantity: "อย่างน้อย 1 ชิ้น",
      specification: "คม สะอาด ไม่มีสนิม",
      allowedSubstitutes: ["มีดผ่าตัดที่ระบุในขั้นตอน"],
    };
  }
  if (normalized.includes("ถุงมือ")) {
    return {
      name,
      appearance: "ถุงมือใช้ครั้งเดียวที่พอดีมือและไม่มีรอยขาด",
      purpose: "ลดการสัมผัสสารเคมีและลดสิ่งสกปรกจากมือ",
      quantity: "1 คู่ต่อรอบงาน",
      specification: "พอดีมือ ไม่มีรอยขาด",
      allowedSubstitutes: [],
    };
  }
  if (normalized.includes("แว่น")) {
    return {
      name,
      appearance: "แว่นครอบหรือบังด้านหน้าและด้านข้างของดวงตา",
      purpose: "ป้องกันของเหลวหรือเศษชิ้นงานกระเด็นเข้าตา",
      quantity: "1 อัน",
      specification: "บังด้านหน้าและด้านข้าง",
      allowedSubstitutes: [],
    };
  }
  if (normalized.includes("ไม้บรรทัด")) {
    return {
      name,
      appearance: "แถบตรงที่มีตัวเลขและขีดหน่วยมิลลิเมตร",
      purpose: "วัดความยาวชิ้นพืชโดยไม่กะด้วยสายตา",
      quantity: "1 อัน",
      specification: "มีขีดหน่วยมิลลิเมตรอ่านได้ชัด",
      allowedSubstitutes: ["เวอร์เนียร์ที่อ่านหน่วยได้"],
    };
  }
  if (normalized.includes("ปิเปต") || normalized.includes("กระบอกตวง")) {
    return {
      name,
      appearance: "อุปกรณ์ใสหรือมีสเกลตัวเลข หน่วยเป็น mL และมีค่าต่ำสุดที่อ่านได้",
      purpose: "ตวงของเหลวตามตัวเลขที่ระบบคำนวณ",
      quantity: "1 ชุด",
      specification: "ช่วงตวงต้องครอบคลุมค่าที่ระบบคำนวณและมีค่าต่ำสุดระบุชัด",
      allowedSubstitutes: ["อุปกรณ์ตวงชนิดอื่นที่มีช่วงวัดครอบคลุมและผ่านการตรวจสอบ"],
    };
  }
  if (normalized.includes("ph") || normalized.includes("พีเอช")) {
    return {
      name,
      appearance: "เครื่องหรือแถบทดสอบที่แสดงตัวเลขความเป็นกรด–ด่าง",
      purpose: "ตรวจค่าอาหารก่อนทำให้ปลอดเชื้อ",
      quantity: "1 เครื่อง",
      specification: "สอบเทียบหรือมีช่วงตรวจครอบคลุมค่าที่ Protocol กำหนด",
      allowedSubstitutes: ["แถบ pH ช่วงแคบตามที่ Protocol อนุญาต"],
    };
  }
  return {
    name,
    appearance: `มองหาของที่มีชื่อว่า “${name}” บนฉลากหรือรายการอุปกรณ์ ถ้าไม่แน่ใจให้ถ่ายรูปก่อนใช้`,
    purpose: `ใช้สำหรับงาน “${name}” ตามคำแนะนำของขั้นนี้ ห้ามเลือกของคล้ายกันมาแทนเอง`,
    quantity: "ตามจำนวนที่ระบุในวิธีทำ",
    specification: `ต้องมีชื่อหรือคุณสมบัติตรงกับ “${name}”`,
    allowedSubstitutes: [],
  };
}

const glossaryDictionary: Array<[RegExp, BeginnerGlossaryTerm]> = [
  [/explant/i, { term: "explant", plainMeaning: "ชิ้นส่วนพืชที่ตัดมาเพาะในภาชนะอาหาร" }],
  [/\bnode\b|ข้อ|ตาข้าง/i, { term: "ข้อและตาข้าง", plainMeaning: "จุดที่ก้านใบต่อกับลำต้นและมักมีตาที่สามารถแตกเป็นยอดใหม่" }],
  [/\bblank\b/i, { term: "Blank control", plainMeaning: "กระปุกอาหารที่ไม่ใส่ชิ้นพืช ใช้ตรวจว่าอาหารหรือภาชนะปนเปื้อนเองหรือไม่" }],
  [/\bstock\b/i, { term: "stock solution", plainMeaning: "สารละลายเข้มข้นที่เตรียมไว้ แล้วตวงปริมาตรเล็ก ๆ ไปเจือจางในอาหาร" }],
  [/working dilution/i, { term: "working dilution", plainMeaning: "สารที่เจือจางจากขวดตั้งต้นเพื่อให้ตวงปริมาตรได้แม่นยำขึ้น" }],
  [/contamination|ปนเปื้อน/i, { term: "contamination", plainMeaning: "เชื้อรา แบคทีเรีย หรือสิ่งไม่ต้องการที่เจริญในภาชนะเพาะ" }],
  [/\bpH\b|พีเอช/i, { term: "pH", plainMeaning: "ตัวเลขบอกความเป็นกรดหรือด่างของอาหาร" }],
  [/Protocol/i, { term: "Protocol", plainMeaning: "คู่มือเวอร์ชันที่กำหนดวิธี ค่า และเกณฑ์ของการทดลองรอบนี้" }],
];

function glossaryFor(text: string): BeginnerGlossaryTerm[] {
  const found = glossaryDictionary.filter(([pattern]) => pattern.test(text)).map(([, term]) => term);
  return found.length ? found : [{
    term: "ผลที่เห็นจริง",
    plainMeaning: "สิ่งที่มองเห็น วัด หรือนับได้ในขั้นนี้ โดยไม่เขียนจากสิ่งที่คาดว่าจะเกิด",
  }];
}

export function createBeginnerInstruction(input: {
  currentAction: string;
  actions: string[];
  materials?: string[];
  doNotDoYet?: string[];
  whatToFind?: string[];
  stopConditions?: string[];
  evidencePrompt?: string[];
  readyChecklist?: string[];
  scienceNote: string;
  uncertaintyAction?: string;
  visualAids?: ProtocolVisualAid[];
  glossary?: BeginnerGlossaryTerm[];
}): BeginnerInstruction {
  const combinedText = [
    input.currentAction,
    ...input.actions,
    ...(input.materials ?? []),
    ...(input.whatToFind ?? []),
  ].join(" ");
  const safeUncertaintyAction = input.uncertaintyAction
    ?? "หยุดไว้ก่อน ตรวจหัวข้อและภาพประกอบใหม่ ถ่ายหรือวัดซ้ำตาม self-check แล้วบันทึกเฉพาะผลจริง";
  return {
    currentAction: input.currentAction,
    doNotDoYet: input.doNotDoYet?.length
      ? input.doNotDoYet
      : ["อย่าข้ามไปขั้นถัดไปจนกว่าจะตรวจรายการความพร้อมครบ"],
    whatToFind: input.whatToFind?.length
      ? input.whatToFind
      : ["มองหาผลที่ระบุในหัวข้อ “ตรวจว่าพร้อมไปต่อหรือยัง”"],
    materials: (input.materials?.length ? input.materials : ["โทรศัพท์หรือแบบบันทึก"])
      .map(describeMaterial),
    actions: input.actions.length
      ? input.actions
      : ["อ่านคำแนะนำทั้งหมดหนึ่งรอบก่อนเริ่ม", "ทำตามลำดับโดยไม่ข้ามข้อ"],
    stopConditions: input.stopConditions?.length
      ? input.stopConditions
      : ["หยุดเมื่อผลที่เห็นไม่ตรงกับคำอธิบาย หรือเมื่อไม่แน่ใจ"],
    evidencePrompt: input.evidencePrompt?.length
      ? input.evidencePrompt
      : ["เขียนสิ่งที่ทำและสิ่งที่เห็นด้วยคำของตนเอง"],
    readyChecklist: input.readyChecklist?.length
      ? input.readyChecklist
      : ["ฉันทำครบทุกข้อ", "ฉันบันทึกผลที่เห็นจริงแล้ว"],
    uncertaintyPaths: defaultUncertaintyPaths(
      safeUncertaintyAction,
    ),
    scienceNote: input.scienceNote,
    visualAids: input.visualAids?.length ? input.visualAids : [{
      id: `process-${input.currentAction.replace(/\s+/g, "-").slice(0, 40)}`,
      kind: "process-flow-diagram",
      title: `ภาพสรุปขั้น: ${input.currentAction}`,
      caption: "อ่านจากซ้ายไปขวาและทำตามลำดับ หยุดเมื่อผลไม่ตรงกับเกณฑ์บนหน้าจอ",
      evidenceState: "Adapted",
      labels: input.actions.slice(0, 3),
    }],
    glossary: input.glossary?.length ? input.glossary : glossaryFor(combinedText),
  };
}
