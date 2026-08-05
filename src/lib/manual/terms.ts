import { growthForms } from "./forms/registry";

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

export function termIdsIn(source: string): string[] {
  return [...source.matchAll(pattern)].map((match) => match[1]);
}

/** ทะเบียนคำศัพท์ของทั้งระบบ มาจาก landmarks ของทุกทรง ไม่มีคลังคำแยกต่างหาก */
export function allTermIds(): Set<string> {
  const ids = new Set<string>();
  for (const form of growthForms) for (const landmark of form.landmarks) ids.add(landmark.id);
  return ids;
}
