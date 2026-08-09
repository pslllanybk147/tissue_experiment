import { growthForms } from "./forms/registry";
import { substances } from "./substances";

export type TermSpan =
  | { kind: "text"; text: string }
  | { kind: "term"; termId: string; text: string };

export type ContextualTerm = { id: string; labels: string[]; definition: string; practicalCue: string };

export const contextualTerms: ContextualTerm[] = [
  { id: "explant", labels: ["explant", "ชิ้นพืชสำหรับเพาะ"], definition: "ส่วนของต้นแม่ที่ตัดออกมาเพื่อนำเข้าอาหารเลี้ยง เช่น ยอด ข้อ หรือชิ้นใบ", practicalCue: "มองหาชิ้นที่ยังแข็ง สีปกติ และมีส่วนเจริญตามคู่มือของต้นนั้น" },
  { id: "node", labels: ["ข้อ"], definition: "วงหรือจุดบนลำต้นที่ใบ ตาข้าง หรือรากอากาศงอกออกมา", practicalCue: "ไล่นิ้วตามลำต้นแล้วหาจุดที่ก้านใบต่อกับลำต้น" },
  { id: "stock-solution", labels: ["stock", "น้ำยาแม่"], definition: "สารละลายเข้มข้นที่เตรียมไว้ก่อน แล้วตวงเพียงบางส่วนไปเจือจางตอนใช้งาน", practicalCue: "ดูฉลากที่ต้องมีชื่อสาร ความเข้มข้น วันที่ทำ และเลข batch" },
  { id: "working-dilution", labels: ["working dilution", "น้ำยาแม่เจือจาง"], definition: "น้ำยาแม่ที่เจือจางลงอีกขั้น เพื่อให้ปริมาตรที่ต้องตวงใหญ่พอสำหรับ syringe หรือเครื่องมือที่มี", practicalCue: "ใช้เมื่อเครื่องคำนวณบอกว่าปริมาตรจาก stock เล็กกว่าขีดที่อ่านได้" },
  { id: "ppm", labels: ["ppm"], definition: "หน่วยส่วนในล้านส่วน ในน้ำเจือจางประมาณได้ว่า 1 ppm เท่ากับสาร 1 มิลลิกรัมต่อน้ำ 1 ลิตร", practicalCue: "อ่านตัวเลขจากเครื่องคำนวณหรือฉลาก อย่ากะจากกลิ่นหรือสี" },
  { id: "sterile-water", labels: ["น้ำปลอดเชื้อ"], definition: "น้ำที่ผ่านวิธีฆ่าเชื้อที่ตรวจสอบได้และเก็บในภาชนะปิด ไม่ใช่เพียงน้ำดื่มหรือน้ำที่ค่า ppm ต่ำ", practicalCue: "ต้องมีวิธีฆ่าเชื้อ วันที่ทำ และภาชนะที่ยังไม่ถูกเปิดปนเปื้อน" },
  { id: "blank-control", labels: ["กระปุกเปล่าควบคุม", "กระปุกเปล่า"], definition: "กระปุกที่มีอาหารจาก batch เดียวกันแต่ไม่มีวัสดุพืช ใช้ตรวจเชื้อจากอาหาร ภาชนะ หรือขั้นตอนแบ่งอาหาร", practicalCue: "ฉลากต้องเป็น Control-B และภายในต้องไม่มีชิ้นพืช" },
  { id: "browning", labels: ["browning", "เกิดสีน้ำตาล"], definition: "เนื้อพืชและบางครั้งวุ้นรอบแผลเปลี่ยนเป็นน้ำตาลจากสารที่ออกมาหลังเนื้อเยื่อบาดเจ็บ", practicalCue: "เริ่มดูจากขอบรอยตัด ถ้าสีน้ำตาลเข้มลามออกไปและวุ้นเปลี่ยนสีให้บันทึกทันที" },
];

export function contextualTermById(id: string): ContextualTerm | null {
  return contextualTerms.find((term) => term.id === id) ?? null;
}

const autoLabels = contextualTerms
  .flatMap((term) => term.labels.map((label) => ({ termId: term.id, label })))
  .sort((a, b) => b.label.length - a.label.length);

export function parseContextualTerms(source: string): TermSpan[] {
  if (!source) return [];
  const escaped = autoLabels.map(({ label }) => label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const regex = new RegExp(`(${escaped.join("|")})`, "gi");
  return source.split(regex).filter(Boolean).map((text) => {
    const found = autoLabels.find((item) => item.label.toLocaleLowerCase() === text.toLocaleLowerCase());
    return found ? { kind: "term" as const, termId: found.termId, text } : { kind: "text" as const, text };
  });
}

/** ห่อคำด้วยมือเป็น [[landmarkId|ข้อความ]] แทนการจับคำอัตโนมัติ
 *  เพราะภาษาไทยไม่มีช่องว่างคั่นคำ การจับอัตโนมัติจะทำให้ "ข้อ" ไปโดน
 *  "ข้อมูล" และ "ข้อควรระวัง" ซึ่งผิดความหมายคนละเรื่อง */
const pattern = /\[\[([a-z0-9-]+)\|([^\]]+)\]\]/g;

export function parseTerms(source: string): TermSpan[] {
  const spans: TermSpan[] = [];
  let cursor = 0;

  for (const match of source.matchAll(pattern)) {
    const start = match.index;
    if (start > cursor) spans.push({ kind: "text", text: source.slice(cursor, start) });
    spans.push({ kind: "term", termId: match[1], text: match[2] });
    cursor = start + match[0].length;
  }

  if (cursor < source.length) spans.push({ kind: "text", text: source.slice(cursor) });
  return spans;
}

/** คืนข้อความล้วนโดยถอดเครื่องหมายห่อออก ใช้ที่จุดเรนเดอร์ซึ่งยังไม่รองรับการแตะดูคำ
 *  เฟส 1 จะแทนที่ด้วยคอมโพเนนต์ที่เรนเดอร์ TermSpan เป็นปุ่มเปิดคำอธิบาย */
export function plainText(source: string): string {
  return parseTerms(source)
    .map((span) => span.text)
    .join("");
}

export function termIdsIn(source: string): string[] {
  return [...source.matchAll(pattern)].map((match) => match[1]);
}

/** จับ [[...]] ทุกอันโดยไม่สนรูปแบบ ใช้เทียบกับ pattern จริงเพื่อหาอันที่เขียนผิด
 *  เช่นใส่ id เป็นภาษาไทย หรือลืมขีดคั่น ซึ่งจะหลุดออกไปแสดงเป็นข้อความดิบให้ผู้ใช้เห็น */
const loosePattern = /\[\[[^\]]*\]\]/g;

/** ตำแหน่งที่พยายามห่อคำแต่เขียนรูปแบบผิด จนระบบไม่รู้จัก */
export function malformedTermsIn(source: string): string[] {
  const valid = new Set(source.match(pattern) ?? []);
  return (source.match(loosePattern) ?? []).filter((found) => !valid.has(found));
}

/** ทะเบียนคำศัพท์ของทั้งระบบ มาจาก landmarks ของทุกทรง รวมกับสารในคลังสาร (substances.ts)
 *  สองทะเบียนนี้ไม่ทับ id กันเพราะคนละหมวดหมู่ (จุดสังเกตบนต้น vs สารเคมี) จึงรวมเป็นเนมสเปซเดียวได้
 *  RichText เป็นตัวตัดสินว่า id หนึ่งเป็น landmark หรือสาร แล้วเรนเดอร์การ์ดที่ตรงชนิด */
export function allTermIds(): Set<string> {
  const ids = new Set<string>();
  for (const form of growthForms) for (const landmark of form.landmarks) ids.add(landmark.id);
  for (const substance of substances) ids.add(substance.id);
  for (const term of contextualTerms) ids.add(term.id);
  return ids;
}
