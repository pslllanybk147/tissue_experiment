import type {
  BeginnerInstruction,
  BeginnerMaterial,
  ProtocolStep,
  UncertaintyPath,
} from "./models";

export function defaultUncertaintyPaths(safeAction: string): UncertaintyPath[] {
  return [
    {
      id: "cannot-find",
      label: "ฉันหาไม่เจอ",
      safeAction,
      blocksCompletion: true,
    },
    {
      id: "not-sure",
      label: "ฉันไม่แน่ใจ",
      safeAction,
      blocksCompletion: true,
    },
    {
      id: "missing-equipment",
      label: "ฉันไม่มีอุปกรณ์นี้",
      safeAction: "หยุดขั้นตอนนี้ก่อน จัดหาอุปกรณ์ที่ระบุ หรือขอให้ผู้มีประสบการณ์ช่วยตรวจ ห้ามใช้อุปกรณ์อื่นแทนโดยเดาเอง",
      blocksCompletion: true,
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
    };
  }
  if (normalized.includes("ป้าย") || normalized.includes("ฉลาก")) {
    return {
      name,
      appearance: "แผ่นหรือเทปสีอ่อนที่เขียนรหัสด้วยปากกาแล้วอ่านได้ชัด",
      purpose: "ป้องกันการสลับต้น ชิ้นพืช ภาชนะ และสูตรอาหาร",
    };
  }
  if (normalized.includes("แบบบันทึก") || normalized.includes("รายการ")) {
    return {
      name,
      appearance: "กระดาษหรือหน้าจอที่มีช่องให้เขียนวันที่ ค่า และสิ่งที่พบ",
      purpose: "เก็บข้อมูลจริงเพื่อย้อนตรวจภายหลัง",
    };
  }
  if (normalized.includes("ใบมีด") || normalized.includes("กรรไกร")) {
    return {
      name,
      appearance: "เครื่องมือตัดคมที่สะอาด ไม่มีสนิม และจับได้มั่นคง",
      purpose: "ตัดชิ้นพืชโดยลดการช้ำของเนื้อเยื่อ",
    };
  }
  if (normalized.includes("ถุงมือ")) {
    return {
      name,
      appearance: "ถุงมือใช้ครั้งเดียวที่พอดีมือและไม่มีรอยขาด",
      purpose: "ลดการสัมผัสสารเคมีและลดสิ่งสกปรกจากมือ",
    };
  }
  if (normalized.includes("แว่น")) {
    return {
      name,
      appearance: "แว่นครอบหรือบังด้านหน้าและด้านข้างของดวงตา",
      purpose: "ป้องกันของเหลวหรือเศษชิ้นงานกระเด็นเข้าตา",
    };
  }
  if (normalized.includes("ไม้บรรทัด")) {
    return {
      name,
      appearance: "แถบตรงที่มีตัวเลขและขีดหน่วยมิลลิเมตร",
      purpose: "วัดความยาวชิ้นพืชโดยไม่กะด้วยสายตา",
    };
  }
  if (normalized.includes("ปิเปต") || normalized.includes("กระบอกตวง")) {
    return {
      name,
      appearance: "อุปกรณ์ใสหรือมีสเกลตัวเลข หน่วยเป็น mL และมีค่าต่ำสุดที่อ่านได้",
      purpose: "ตวงของเหลวตามตัวเลขที่ระบบคำนวณ",
    };
  }
  if (normalized.includes("ph") || normalized.includes("พีเอช")) {
    return {
      name,
      appearance: "เครื่องหรือแถบทดสอบที่แสดงตัวเลขความเป็นกรด–ด่าง",
      purpose: "ตรวจค่าอาหารก่อนทำให้ปลอดเชื้อ",
    };
  }
  return {
    name,
    appearance: `มองหาของที่มีชื่อว่า “${name}” บนฉลากหรือรายการอุปกรณ์ ถ้าไม่แน่ใจให้ถ่ายรูปก่อนใช้`,
    purpose: `ใช้สำหรับงาน “${name}” ตามคำแนะนำของขั้นนี้ ห้ามเลือกของคล้ายกันมาแทนเอง`,
  };
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
}): BeginnerInstruction {
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
      input.uncertaintyAction ?? "หยุดไว้ก่อน ถ่ายรูปสิ่งที่เห็น และขอให้ตรวจโดยไม่เดาคำตอบ",
    ),
    scienceNote: input.scienceNote,
  };
}
