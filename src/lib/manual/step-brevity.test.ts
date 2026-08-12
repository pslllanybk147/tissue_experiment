import { describe, expect, it } from "vitest";
import { allSlugs, resolveBySlug } from "./registry";

/** ความยาวสูงสุดของคำสั่งหนึ่งข้อ นับหลังตัดมาร์กอัปคำศัพท์ออกแล้ว
 *  ตั้งจากที่คนถือมีดอยู่จะกวาดตาอ่านจบในครั้งเดียว คำสั่งที่ยาวกว่านี้แปลว่ามีหลายงานยัดในบรรทัดเดียว
 *  ให้แตกเป็นหลายข้อ หรือย้ายเหตุผลไป why และย้ายข้อควรระวังไป safetyNotes */
const ACTION_MAX_CHARS = 130;

/** why ตอบแค่ "ทำไมต้องทำขั้นนี้" ไม่ใช่ที่เก็บคำสั่ง รายการของที่ต้องซื้อ หรือวิธีแก้อาการ
 *  ของพวกนั้นมีช่องของตัวเองอยู่แล้ว (actions, materials, troubleshootingIds) */
const WHY_MAX_CHARS = 220;

/** คำสั่งไม่ควรอ้างถึงหัวข้อในขั้นอื่นให้ผู้ใช้ไล่หาเอง ระบบมีคลังอาการกลางที่ผูกกับขั้นอยู่แล้ว */
const CROSS_STEP_POINTER = /ท้ายขั้น|หัวข้อ "ถ้าเจออาการแบบนี้"|หัวข้อ “ถ้าเจออาการแบบนี้”/;

/** นับความยาวตามที่ผู้ใช้เห็นจริง มาร์กอัป [[term|คำ]] แสดงผลเป็น "คำ" เท่านั้น */
function visibleLength(source: string): number {
  return source.replace(/\[\[[^\]|]+\|([^\]]+)\]\]/g, "$1").replace(/\[\[([^\]]+)\]\]/g, "$1").length;
}

type Offender = { where: string; length: number; text: string };

function tooLong(items: string[], where: string, cap: number): Offender[] {
  return items
    .map((text) => ({ where, length: visibleLength(text), text }))
    .filter((item) => item.length > cap);
}

function describeOffenders(offenders: Offender[]): string {
  return offenders.map((item) => `${item.where} (${item.length}) — ${item.text.slice(0, 80)}…`).join("\n");
}

describe("a step reads as instructions, not as an essay", () => {
  it.each(allSlugs())("%s keeps every action short enough to follow while working", (slug) => {
    const manual = resolveBySlug(slug);
    expect(manual, `${slug} must resolve`).not.toBeNull();

    const offenders = manual!.steps.flatMap((step) => [
      ...tooLong(step.actions, `${slug}/${step.id}/actions`, ACTION_MAX_CHARS),
      ...tooLong(
        (step.executionInstructions ?? []).map((instruction) => instruction.action),
        `${slug}/${step.id}/executionInstructions`,
        ACTION_MAX_CHARS,
      ),
    ]);

    expect(offenders, `คำสั่งยาวเกิน ${ACTION_MAX_CHARS} ตัวอักษร:\n${describeOffenders(offenders)}`).toEqual([]);
  });

  it.each(allSlugs())("%s keeps why as a reason, not as a second instruction list", (slug) => {
    const manual = resolveBySlug(slug)!;

    const offenders = manual.steps.flatMap((step) => tooLong([step.why], `${slug}/${step.id}/why`, WHY_MAX_CHARS));
    expect(offenders, `why ยาวเกิน ${WHY_MAX_CHARS} ตัวอักษร:\n${describeOffenders(offenders)}`).toEqual([]);
  });

  it.each(allSlugs())("%s never sends the reader to a heading in another step", (slug) => {
    const manual = resolveBySlug(slug)!;

    const offenders = manual.steps
      .flatMap((step) => [step.why, ...step.actions, ...step.materials].map((text) => ({ stepId: step.id, text })))
      .filter((item) => CROSS_STEP_POINTER.test(item.text))
      .map((item) => `${slug}/${item.stepId} — ${item.text.slice(0, 80)}…`);

    expect(offenders, `อ้างหัวข้อข้ามขั้น:\n${offenders.join("\n")}`).toEqual([]);
  });
});
