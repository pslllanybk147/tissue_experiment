import type { Dose } from "@/lib/manual/forms/types";
import type { ResolvedStep } from "@/lib/manual/types";
import type { RinseWaterMethod, SterilizationMethod } from "@/lib/domain/models";

export type BracketArmId = "a" | "b" | "c";
export type BracketField = "dose" | "clean" | "alive" | "usable";

export type BracketPlan = {
  doseKey: string;
  dose: Dose;
  arms: { armId: BracketArmId; dose: number }[];
};

/** คีย์ของบันทึกต้องสร้างจากที่นี่ที่เดียว พิมพ์ตรง ๆ กระจายตามไฟล์แล้วพิมพ์ผิดจะเงียบ
 *  ซึ่งเป็นความผิดพลาดแบบเดียวกับที่เคยเจอในชั้นสกุลและในเมนูนำทาง */
export function bracketKey(armId: BracketArmId, field: BracketField): string {
  return `bracket-${armId}-${field}`;
}

export function jarsPerArmKey(): string {
  return "bracket-jars-per-arm";
}

/** ปัดให้เหลือทศนิยมสองตำแหน่ง เพราะค่ากลางของช่วงมักได้ทศนิยมยาวจนอ่านไม่รู้เรื่อง
 *  และความละเอียดเกินสองตำแหน่งไม่มีความหมายกับการตวงที่บ้านอยู่แล้ว */
function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

/** durationMin บางรายการต้น-ปลายเท่ากัน (เช่น [1, 1] แปลว่า "1 นาทีเป๊ะ" ไม่ใช่ช่วง)
 *  เขียนเป็น "1 ถึง 1 นาที" ตรง ๆ อ่านแล้วดูเหมือนพิมพ์ผิด ต้องยุบเหลือค่าเดียวเมื่อต้น-ปลายเท่ากัน */
export function formatDurationMinRange([low, high]: [number, number]): string {
  return low === high ? `${low}` : `${low} ถึง ${high}`;
}

/** สารที่รอบนี้ล็อกไว้จริง ใช้กรองว่าช่วงทดสอบไหนเกี่ยวกับรอบนี้
 *  ค่า undefined แปลว่าไม่รู้ (เช่นหน้าคู่มืออ่านอย่างเดียว) ให้แสดงตามเดิม */
export type BracketMethodContext = {
  surfaceMethod?: SterilizationMethod | null;
  rinseMethod?: RinseWaterMethod | null;
};

/** map วิธีระดับรอบให้เป็นชื่อสารของ dose bracket */
function activeDoseMethods(context: BracketMethodContext): Set<NonNullable<Dose["method"]>> {
  const methods = new Set<NonNullable<Dose["method"]>>();
  if (context.surfaceMethod === "haiter-chemical") methods.add("haiter");
  if (context.surfaceMethod === "nadcc-soak") methods.add("nadcc");
  if (context.rinseMethod === "nadcc") methods.add("nadcc");
  if (context.rinseMethod === "low-dose-hypochlorite") methods.add("haiter");
  return methods;
}

/** คืนแผนทดสอบเมื่อขั้นนั้นมีค่าช่วงและยังไม่มีงานตรงพันธุ์
 *  ขั้นที่มีงานตรงพันธุ์แล้วไม่ต้องให้ผู้ใช้ทดลองเอง
 *
 *  เดิมฟังก์ชันนี้หยิบ dose key แรกตามลำดับตัวอักษรโดยไม่ดูว่ารอบนั้นล็อกวิธีอะไรไว้
 *  รอบที่เลือก "น้ำปลอดเชื้อธรรมดา" จึงยังเจอตารางทดสอบช่วงของน้ำ rinse NaDCC ให้กรอก
 *  ทั้งที่ไม่ได้ใช้ NaDCC เลย เป็นปัญหาเดียวกับที่แก้ไปแล้วในฝั่งคำสั่งลงมือทำ */
export function buildBracketPlan(step: ResolvedStep, context?: BracketMethodContext): BracketPlan | null {
  if (step.evidence.level === "species-direct") return null;
  const entries = Object.entries(step.doses ?? {}).sort(([left], [right]) => left.localeCompare(right));
  if (entries.length === 0) return null;

  // ถ้ารู้ว่ารอบนี้ใช้วิธีอะไร ให้เหลือเฉพาะช่วงของสารที่ใช้จริง
  // dose ที่ไม่ระบุ method ถือว่าเป็นช่วงกลางของขั้น ใช้ได้กับทุกวิธี
  const relevant = context
    ? entries.filter(([, dose]) => !dose.method || activeDoseMethods(context).has(dose.method))
    : entries;
  const chosen = relevant[0];
  if (!chosen) return null;
  const [doseKey, dose] = chosen;
  const middle = round2((dose.low + dose.high) / 2);

  return {
    doseKey,
    dose,
    arms: [
      { armId: "a", dose: round2(dose.low) },
      { armId: "b", dose: middle },
      { armId: "c", dose: round2(dose.high) },
    ],
  };
}

export type BracketResult = {
  armId: BracketArmId;
  dose: number;
  clean: number;
  alive: number;
  usable: number;
};

export type BracketOutcome =
  | { kind: "winner"; armId: BracketArmId; dose: number; note: string }
  | { kind: "all-failed"; direction: "up" | "down" | "both"; note: string }
  | { kind: "incomplete"; note: string };

const armLabel: Record<BracketArmId, string> = { a: "A", b: "B", c: "C" };

/** ข้อความนี้ต้องติดไปกับผลทุกครั้ง สามกระปุกต่อชุดไม่มีนัยสำคัญทางสถิติ
 *  การแสดงค่าโดยไม่กำกับจะสร้างความมั่นใจปลอม */
const caveat =
  "จากการทดสอบ 3 กระปุกต่อชุดในรอบเดียว ใช้เป็นจุดตั้งต้นที่ดีกว่าเดา ไม่ใช่ข้อพิสูจน์";

/** ตัดสินว่าชุดไหนใช้ได้ ถ้าไม่มีเลยก็บอกทิศทางที่ควรขยับ
 *
 *  เสมอกันให้เลือกชุดที่เข้มข้นต่ำกว่าเสมอ เพราะเสียหายกับเนื้อเยื่อน้อยกว่า
 *  และใช้สารน้อยกว่า ซึ่งเป็นทิศทางที่ปลอดภัยกว่าเมื่อข้อมูลบอกไม่ต่างกัน */
export function chooseBracketWinner(results: BracketResult[], jarsPerArm: number): BracketOutcome {
  if (results.length < 3 || jarsPerArm <= 0) {
    return { kind: "incomplete", note: "ยังกรอกไม่ครบทั้งสามชุด จึงยังสรุปไม่ได้" };
  }

  const usable = results.filter((item) => item.usable > 0);
  if (usable.length > 0) {
    const best = [...usable].sort((a, b) => b.usable - a.usable || a.dose - b.dose)[0];
    return {
      kind: "winner",
      armId: best.armId,
      dose: best.dose,
      note: `ชุด ${armLabel[best.armId]} ใช้ได้ ${best.usable} จาก ${jarsPerArm} กระปุก · ${caveat}`,
    };
  }

  const totalJars = jarsPerArm * results.length;
  const contaminated = totalJars - results.reduce((sum, item) => sum + item.clean, 0);
  const browned = totalJars - results.reduce((sum, item) => sum + item.alive, 0);

  if (contaminated > browned) {
    return {
      kind: "all-failed",
      direction: "up",
      note: "ทุกชุดล้มเพราะติดเชื้อเป็นหลัก แปลว่าฟอกไม่พอ ให้เพิ่มความเข้มข้นหรือเวลาแล้วทดสอบใหม่",
    };
  }
  if (browned > contaminated) {
    return {
      kind: "all-failed",
      direction: "down",
      note: "ทุกชุดล้มเพราะชิ้นดำเป็นหลัก แปลว่าฟอกแรงเกิน ให้ลดลงแล้วทดสอบใหม่ และดูวิธีแก้ยางดำ",
    };
  }
  return {
    kind: "all-failed",
    direction: "both",
    note: "เจอทั้งติดเชื้อและชิ้นดำพอ ๆ กัน ให้แยกอาการก่อนว่าอันไหนเกิดกับกระปุกไหน แล้วค่อยเลือกทิศทาง",
  };
}

/** ตัวเลขที่ขัดกันเองต้องเตือนตอนกรอก ไม่ใช่ปล่อยผ่านแล้วคำนวณผิด
 *  เพราะผลลัพธ์จะดูสมเหตุสมผลทั้งที่ข้อมูลเข้าเป็นไปไม่ได้ */
export function validateBracket(results: BracketResult[], jarsPerArm: number): string[] {
  const messages: string[] = [];
  for (const item of results) {
    const label = armLabel[item.armId];
    if (item.usable > jarsPerArm) messages.push(`ชุด ${label} ใช้ได้จริงมากกว่าจำนวนกระปุกทั้งหมด`);
    if (item.usable > item.clean) messages.push(`ชุด ${label} ใช้ได้จริงมากกว่ากระปุกที่ไม่ติดเชื้อ`);
    if (item.usable > item.alive) messages.push(`ชุด ${label} ใช้ได้จริงมากกว่ากระปุกที่ชิ้นยังเขียว`);
    if (item.clean > jarsPerArm) messages.push(`ชุด ${label} กระปุกที่ไม่ติดเชื้อมากกว่าจำนวนกระปุกทั้งหมด`);
    if (item.alive > jarsPerArm) messages.push(`ชุด ${label} กระปุกที่ชิ้นยังเขียวมากกว่าจำนวนกระปุกทั้งหมด`);
  }
  return messages;
}
