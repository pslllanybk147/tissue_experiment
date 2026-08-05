import { describe, expect, it } from "vitest";

import { growthForms } from "./forms/registry";
import { allSlugs, resolveBySlug } from "./registry";
import { allTermIds, malformedTermsIn, termIdsIn } from "./terms";
import { troubleshootingEntries } from "./troubleshooting";

/** รวมข้อความทุกชิ้นที่ผู้ใช้จะได้อ่าน พร้อมที่อยู่ของมัน เพื่อให้ error ชี้จุดได้ */
function allProse(): Array<{ where: string; text: string }> {
  const items: Array<{ where: string; text: string }> = [];

  for (const slug of allSlugs()) {
    const manual = resolveBySlug(slug)!;
    for (const step of manual.steps) {
      items.push({ where: `${slug}/${step.id}/summary`, text: step.summary });
      items.push({ where: `${slug}/${step.id}/why`, text: step.why });
      step.actions.forEach((line, i) => items.push({ where: `${slug}/${step.id}/actions[${i}]`, text: line }));
      step.passCriteria.forEach((line, i) => items.push({ where: `${slug}/${step.id}/pass[${i}]`, text: line }));
      step.stopConditions.forEach((line, i) => items.push({ where: `${slug}/${step.id}/stop[${i}]`, text: line }));
    }
  }

  for (const [id, entry] of Object.entries(troubleshootingEntries)) {
    items.push({ where: `trouble/${id}/symptom`, text: entry.symptom });
    items.push({ where: `trouble/${id}/likelyCause`, text: entry.likelyCause });
    entry.actions.forEach((line, i) => items.push({ where: `trouble/${id}/actions[${i}]`, text: line }));
  }

  for (const form of growthForms) {
    items.push({ where: `form/${form.id}/plainDescription`, text: form.plainDescription });
    for (const landmark of form.landmarks) {
      items.push({ where: `form/${form.id}/${landmark.id}/whatItIs`, text: landmark.whatItIs });
      items.push({ where: `form/${form.id}/${landmark.id}/howToFind`, text: landmark.howToFind });
    }
  }

  return items;
}

describe("ความสมบูรณ์ของคำศัพท์ในเนื้อหา", () => {
  it("ทุกคำที่ห่อไว้ต้องมีอยู่จริงในทะเบียน", () => {
    const known = allTermIds();
    for (const item of allProse()) {
      for (const id of termIdsIn(item.text)) {
        expect(known.has(id), `${item.where} ห่อคำ ${id} ที่ไม่มีในทะเบียน`).toBe(true);
      }
    }
  });

  it("ไม่มีวงเล็บห่อคำที่เขียนรูปแบบผิดหลงเหลืออยู่", () => {
    for (const item of allProse()) {
      const broken = malformedTermsIn(item.text);
      expect(broken, `${item.where} ห่อคำผิดรูปแบบ ${broken.join(" ")} จะโผล่เป็นข้อความดิบให้ผู้ใช้เห็น`).toEqual([]);
    }
  });

  it("คำอธิบายของจุดสังเกตห้ามห่อคำศัพท์ซ้อนเข้าไปอีก", () => {
    for (const form of growthForms) {
      for (const landmark of form.landmarks) {
        expect(
          termIdsIn(landmark.whatItIs).length,
          `form/${form.id}/${landmark.id} อธิบายศัพท์ด้วยศัพท์ ทำให้มือใหม่วนลูป`,
        ).toBe(0);
      }
    }
  });
});
