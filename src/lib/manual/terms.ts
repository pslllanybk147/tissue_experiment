import { growthForms } from "./forms/registry";
import { substances } from "./substances";

export type TermSpan =
  | { kind: "text"; text: string }
  | { kind: "term"; termId: string; text: string };

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
  return ids;
}
