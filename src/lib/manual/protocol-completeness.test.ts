import { describe, expect, it } from "vitest";
import { allSlugs, resolveBySlug } from "./registry";

const vaguePlaceholders = /ตามสูตรที่เลือก|ตามค่าเริ่มต้น|ช่วงของสูตร|เลือกวิธีใดวิธีหนึ่ง/;

describe("every plant has a runnable beginner protocol", () => {
  it("generic manual instructions never tell a locked round to choose externally", () => {
    for (const slug of allSlugs()) {
      const text = JSON.stringify(resolveBySlug(slug)?.steps ?? []);
      expect(text).not.toContain("ห้ามเปิดเครื่องคำนวณแยกจาก protocol");
    }
  });

  it.each(allSlugs())("%s exposes complete execution instructions for every step", (slug) => {
    const manual = resolveBySlug(slug);
    expect(manual, `${slug} must resolve`).not.toBeNull();

    for (const step of manual!.steps) {
      expect(step.executionInstructions?.length, `${slug}/${step.id} needs instructions`).toBeGreaterThan(0);

      for (const instruction of step.executionInstructions ?? []) {
        expect(instruction.label.trim(), `${slug}/${step.id} has an empty instruction label`).not.toBe("");
        expect(instruction.action.trim(), `${slug}/${step.id} has an empty instruction action`).not.toBe("");
        expect(
          instruction.completion?.trim() || instruction.tone === "stop",
          `${slug}/${step.id}/${instruction.label} needs a completion or stop condition`,
        ).toBeTruthy();
        expect(`${instruction.action} ${instruction.quantity ?? ""}`, `${slug}/${step.id} contains vague copy`).not.toMatch(vaguePlaceholders);
      }
    }
  });

  it.each(allSlugs())("%s renders explicit medium and sterilization checkpoints", (slug) => {
    const manual = resolveBySlug(slug)!;
    const mediumSteps = manual.steps.filter((step) => ["prep-media", "multiply", "root"].includes(step.id));
    for (const step of mediumSteps) {
      const text = (step.executionInstructions ?? []).map((item) => `${item.action} ${item.quantity ?? ""}`).join(" ");
      expect(text, `${slug}/${step.id} must expose a concrete pH target`).toMatch(/pH/);
      expect(text, `${slug}/${step.id} must expose calculator-backed batch quantities`).toMatch(/mL|g/);
      expect(text, `${slug}/${step.id} must name the selected medium`).not.toMatch(/ตามค่าที่แสดงในขั้นนี้/);
    }

    const sterilize = manual.steps.find((step) => step.id === "sterilize");
    expect(sterilize).toBeDefined();
    const sterilizeText = (sterilize!.executionInstructions ?? []).map((item) => `${item.label} ${item.action}`).join(" ");
    expect(sterilizeText, `${slug}/sterilize must name each rinse round`).toMatch(/ล้างรอบที่ 1/);
    expect(sterilizeText, `${slug}/sterilize must expose the experimental rinse as opt-in`).toMatch(/300\s*ppm/);
  });
});
