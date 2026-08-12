import type { ExecutionInstruction, ManualStepDef } from "./types";

const stepLabels: Record<string, string[]> = {
  receive: ["ติดรหัสต้น", "ถ่ายรูปต้นทั้งต้น", "ถ่ายรูปส่วนที่จะใช้"],
  quarantine: ["แยกต้น", "ตรวจสุขภาพ", "บันทึกผลตรวจ"],
  identify: ["เทียบลักษณะต้น", "เลือกระดับความมั่นใจ", "ตัดสินใจเลือกคู่มือ"],
  "select-explant": ["หาตำแหน่งข้อและตาข้าง", "เลือกข้อที่สมบูรณ์", "ติดเบอร์และถ่ายรูป", "เก็บข้อสำรอง"],
  cut: ["เตรียมน้ำพักชิ้น", "ตัดใต้ข้อ", "เว้นเนื้อไว้จับชิ้น", "หย่อนชิ้นลงน้ำทันที", "วัดและบันทึก", "เข้าขั้นฟอกทันที"],
  "prep-tools": ["ต้มเครื่องมือ", "เช็ดตู้ทำงาน", "นำของเข้าตู้", "พักตู้ก่อนเริ่ม", "เตรียมมือ", "รักษาความสะอาดระหว่างงาน"],
  initiate: ["ตัดส่วนช้ำ", "จัดด้านชิ้นพืช", "ปิดฝาแต่ละกระปุก", "ติดวันที่และรหัสรอบ"],
  "check-contamination": ["ตรวจทุกกระปุก", "แยกราและแบคทีเรีย", "ตรวจสีน้ำตาล", "ถ่ายรูปและแยกกระปุก"],
  multiply: ["คัดกระปุกที่จะย้าย", "แยกและย้ายยอด", "นับและบันทึกยอด", "แยกลักษณะผิดปกติ"],
  root: ["คัดยอดแข็งแรง", "ย้ายลงอาหารออกราก", "นับและวัดราก"],
  acclimatize: ["ล้างวุ้นออกจากราก", "ตรวจว่าวุ้นออกหมด", "ปลูกในวัสดุชุ่มน้ำ", "คลุมรักษาความชื้น", "เริ่มเปิดระบาย", "เปิดฝาถาวรเมื่อผ่านเกณฑ์", "จัดแสงรำไร"],
  monitor: ["ถ่ายรูปเทียบ", "นับแยกลักษณะ", "บันทึกข้อสรุป"],
  "close-round": ["ทบทวนค่าจริง", "วิเคราะห์ผล", "เลือกตัวแปรรอบหน้า", "ปิดรอบ"],
};

const forbiddenVagueText = /ตามสูตรที่เลือก|ตามค่าเริ่มต้น|ช่วงของสูตร|เลือกวิธีใดวิธีหนึ่ง/g;

function cleanAction(action: string): string {
  return action
    .replace(forbiddenVagueText, "ตามค่าที่แสดงในขั้นนี้")
    .replace(/\s+/g, " ")
    .trim();
}

/** ตัวเลขที่เขียนเป็นคำต้องแปลงกลับเป็นเลขก่อนแสดง ไม่งั้นจะได้ "หนึ่ง วัน" ที่มีเว้นวรรคคั่นกลาง
 *  และไม่ตรงกับ "1 วัน" ที่หัวขั้นแสดงจาก durationMinutes ของค่าเดียวกัน */
const spelledNumbers: Record<string, string> = { หนึ่ง: "1", สอง: "2", สาม: "3", ครึ่ง: "ครึ่ง" };

function durationFrom(action: string): string | undefined {
  const explicit = action.match(/(\d+(?:\s*ถึง\s*\d+)?|หนึ่ง|สอง|สาม|ครึ่ง)\s*(นาที|วินาที|ชั่วโมง|วัน)/);
  if (explicit) {
    const amount = spelledNumbers[explicit[1]] ?? explicit[1];
    return amount === "ครึ่ง" ? `ครึ่ง${explicit[2]}` : `${amount} ${explicit[2]}`;
  }
  if (/รอบละ(?:ประมาณ)?หนึ่งนาที/.test(action)) return "รอบละ 1 นาที";
  if (/รอบสั้น ๆ|รอบสั้นๆ/.test(action)) return "รอบสั้น ๆ — บันทึกเวลาจริงของแต่ละรอบ";
  return undefined;
}

function completionFor(step: ManualStepDef, index: number, total: number): string {
  if (index === total - 1) return step.passCriteria.join(" · ");
  return "ทำรายการนี้ครบแล้ว ตรวจของหรือข้อมูลให้พร้อมก่อนทำข้อต่อไป";
}

function nextFor(labels: string[], index: number, total: number): string | undefined {
  if (index >= total - 1) return undefined;
  return `ไปข้อ ${index + 2}${labels[index + 1] ? ` (${labels[index + 1]})` : ""}`;
}

/** ป้ายสำรองเมื่อใช้ป้ายชุดสำเร็จรูปไม่ได้ ย่อจากคำสั่งจริงให้อ่านรู้เรื่องกว่า "ขั้น — ข้อ 3"
 *  ตัดที่คำเชื่อมหรือเครื่องหมายวรรคตอนตัวแรก เพื่อให้ได้ใจความสั้น ๆ ของข้อนั้น */
function derivedLabel(action: string, fallback: string): string {
  const head = action.split(/[,·:(]|\sแล้ว\s|\sจากนั้น\s|\sเพื่อ\s/)[0].trim();
  if (head.length === 0) return fallback;
  if (head.length <= 34) return head;
  const words = head.slice(0, 34).split(" ");
  return `${words.length > 1 ? words.slice(0, -1).join(" ") : words[0]}…`;
}

function genericInstructions(step: ManualStepDef): ExecutionInstruction[] {
  // ป้ายหัวข้อจับคู่กับคำสั่งด้วยลำดับ index ล้วน ๆ ถ้าพันธุ์ไหน override actions จนจำนวนไม่ตรง
  // ป้ายจะเลื่อนไปติดคำสั่งคนละข้อแบบเงียบ ๆ (เคยเกิดจริงที่ขั้น cut ของ violin-variegated
  // จนป้าย "เตรียมน้ำพักชิ้น" ไปอยู่บนคำสั่ง "ตัดยอดอ่อน") จำนวนไม่ตรงเมื่อไหร่ให้เลิกใช้ป้ายชุดนี้
  const canned = stepLabels[step.id] ?? [];
  const labels = canned.length === step.actions.length ? canned : [];
  return step.actions.map((rawAction, index) => {
    const action = cleanAction(rawAction);
    const instruction: ExecutionInstruction = {
      label: labels[index] ?? derivedLabel(action, `${step.title} — ข้อ ${index + 1}`),
      action,
      completion: completionFor(step, index, step.actions.length),
      next: nextFor(labels, index, step.actions.length),
    };

    const duration = durationFrom(action);
    if (duration) instruction.durationLabel = duration;
    return instruction;
  });
}

function rinseInstructions(action: string): ExecutionInstruction[] {
  const duration = durationFrom(action) ?? "ยังไม่มีเวลาล้างที่ยืนยันในข้อมูลของขั้นนี้ — บันทึกเวลาจริงก่อนเริ่ม";
  const rounds = /3\s*รอบ/.test(action) ? 3 : 1;
  return Array.from({ length: rounds }, (_, index) => ({
    label: `ล้างรอบที่ ${index + 1}`,
    action: `เทน้ำจากภาชนะรอบก่อนทิ้ง แล้วเติมน้ำปลอดเชื้อใน R${index + 1} ให้ชิ้นพืชจม จากนั้นเขย่าเบา ๆ`,
    quantity: "ภาชนะละ 50 mL",
    container: `R${index + 1}`,
    durationLabel: duration,
    completion: `ครบเวลารอบที่ ${index + 1} แล้วเทน้ำทิ้ง${index === rounds - 1 ? " และไปขั้นถัดไป" : " ก่อนย้ายไปรอบถัดไป"}`,
    next: index === rounds - 1 ? undefined : `ล้างรอบที่ ${index + 2}`,
  }));
}

function optionalRinseInstructions(): ExecutionInstruction[] {
  return [
    {
      label: "ทางเลือกทดลอง: เตรียมน้ำ rinse คลอรีนต่ำ",
      action: "ถ้าจะทดสอบน้ำ rinse คลอรีนต่ำ ให้เตรียมน้ำ 300 ppm แยกจากสารฟอกหลัก ใช้แทนการล้าง R1–R3 ไม่ใช่ทำเพิ่ม",
      materials: ["NaDCC หรือ NaOCl ที่อ่านค่าคลอรีนออกฤทธิ์ได้", "น้ำสำหรับ rinse", "ภาชนะ R1–R4"],
      quantity: "คลอรีนออกฤทธิ์ประมาณ 300 ppm · เป็นชุดทดลองที่ยังไม่ยืนยันกับพันธุ์นี้",
      container: "ภาชนะสำหรับเตรียมน้ำ rinse",
      completion: "มีน้ำ rinse แยกจากสารฟอกหลัก และติดป้าย R1–R4 แล้ว",
      tone: "warning",
    },
    ...[1, 2, 3].map((round) => ({
      label: `ล้าง rinse รอบที่ ${round}`,
      action: `เติมน้ำ rinse ลง R${round} ให้ชิ้นพืชจม แล้วเขย่าเบา ๆ`,
      quantity: "ภาชนะละ 50 mL",
      container: `R${round}`,
      durationMinutes: 1,
      completion: `ครบ 1 นาทีแล้วเทน้ำ rinse จาก R${round} ทิ้ง${round === 3 ? " ก่อนล้างน้ำปลอดเชื้อรอบสุดท้าย" : " แล้วไป R" + (round + 1)}`,
      next: round === 3 ? "ล้างน้ำปลอดเชื้อรอบสุดท้ายใน R4" : `ล้าง rinse รอบที่ ${round + 1}`,
      tone: "warning" as const,
    })),
    {
      label: "ล้างน้ำปลอดเชื้อรอบสุดท้าย",
      action: "หลังเทน้ำ rinse รอบที่ 3 ทิ้งแล้ว เติมน้ำปลอดเชื้อใน R4 เพื่อล้างคลอรีนที่อาจค้างอยู่ก่อนตัดแต่งและวางลงอาหาร",
      quantity: "R4 · 50 mL",
      container: "R4",
      durationLabel: "ล้างให้หมดคลอรีนตกค้าง แล้วบันทึกเวลาจริง",
      completion: "เทน้ำจาก R4 ทิ้ง และชิ้นพืชพร้อมเข้าขั้นตัดแต่งโดยไม่มีกลิ่นคลอรีน",
      tone: "warning",
    },
  ];
}

function sterilizeInstructions(step: ManualStepDef): ExecutionInstruction[] {
  const instructions: ExecutionInstruction[] = [];
  let hasKnownTreatmentTime = false;
  let optionalRinse: ExecutionInstruction[] | null = null;

  for (const [index, rawAction] of step.actions.entries()) {
    const action = cleanAction(rawAction);
    if (/ทางเลือกทดลอง|300\s*ppm|น้ำ rinse/.test(action)) {
      if (!optionalRinse) optionalRinse = optionalRinseInstructions();
      continue;
    }
    if (/ถ้าไม่มั่นใจให้ใช้|^แนวคิดคือ/.test(action)) continue;
    // ข้อความที่บอกว่า rinse ทางเลือกใช้แทนรอบมาตรฐาน ไม่ใช่รอบล้างเพิ่ม
    if (/ถ้าเลือกทางเลือกทดลอง|หรืออีกหนึ่งรอบสุดท้าย/.test(action) && /ล้าง/.test(action)) continue;
    if (/ล้าง.*3\s*รอบ|3\s*รอบ.*ล้าง/.test(action)) {
      instructions.push(...rinseInstructions(action));
      continue;
    }
    const duration = durationFrom(action);
    if (duration && /แช่|ฟอก|แอลกอฮอล์|ฆ่าเชื้อ/.test(action)) hasKnownTreatmentTime = true;
    instructions.push({
      label: index === 0 ? "เตรียมสารและชิ้นพืช" : `ฟอกฆ่าเชื้อ — ข้อ ${index + 1}`,
      action,
      materials: index === 0 ? step.materials : undefined,
      container: /ฟอก|แช่|สารฟอก|แอลกอฮอล์/.test(action) ? "S" : undefined,
      durationLabel: duration,
      completion: "ทำรายการนี้ครบแล้ว ตรวจชิ้นพืชและบันทึกค่าจริงก่อนทำข้อต่อไป",
    });
  }

  if (!instructions.some((item) => /ล้างรอบที่ 1/.test(item.label))) {
    instructions.push(...rinseInstructions("ล้างด้วยน้ำปลอดเชื้อธรรมดา 3 รอบ รอบละประมาณหนึ่งนาที"));
  }

  if (!hasKnownTreatmentTime) {
    instructions.splice(1, 0, {
      label: "หยุดเพื่อยืนยันเวลาฟอก",
      action: "ยังไม่มีเวลาฟอกที่ยืนยันกับพันธุ์นี้ ห้ามจับเวลาแบบเดา ให้เลือกเวลาที่มีแหล่งอ้างอิงและบันทึกไว้ก่อน",
      completion: "มีเวลาฟอกที่ตัดสินใจและบันทึกแหล่งที่มาก่อนใส่ชิ้นพืชลงสารฟอก",
      tone: "stop",
    });
  }
  return optionalRinse ? [...instructions, ...optionalRinse] : instructions;
}

/** Materialize a complete beginner-facing protocol only when the pack has not supplied one. */
export function materializeExecutionInstructions(step: ManualStepDef): ExecutionInstruction[] {
  if (step.executionInstructions?.length) return step.executionInstructions;
  if (step.id === "sterilize") return sterilizeInstructions(step);
  return genericInstructions(step);
}

/** Add the optional rinse card to an explicit sterilization protocol without replacing its tested steps. */
export function ensureSterilizeOption(instructions: ExecutionInstruction[], step: ManualStepDef): ExecutionInstruction[] {
  if (step.id !== "sterilize" || instructions.some((item) => /300\s*ppm|ทางเลือกทดลอง/.test(`${item.label} ${item.action}`))) return instructions;
  return [
    ...instructions,
    ...optionalRinseInstructions(),
  ];
}
