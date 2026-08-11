import { describe, expect, it } from "vitest";
import { allSlugs, resolveBySlug } from "./registry";
import { initialRecipeIdForStep, recipeIdsForStep } from "@/lib/rounds/medium-steps";
import { resolveSterilizationStep } from "@/lib/rounds/sterilization-plan";
import type { LotSterilizationSnapshot } from "@/lib/domain/models";

function instructionText(step: NonNullable<ReturnType<typeof resolveBySlug>>["steps"][number]): string {
  return (step.executionInstructions ?? [])
    .map((item) => `${item.label} ${item.action} ${item.quantity ?? ""} ${item.completion ?? ""} ${item.next ?? ""}`)
    .join(" ");
}

function operationalSterilizationText(step: NonNullable<ReturnType<typeof resolveBySlug>>["steps"][number]): string {
  return JSON.stringify({
    materials: step.materials,
    actions: step.actions,
    executionInstructions: step.executionInstructions,
    measurements: step.measurements,
    troubleshootingIds: step.troubleshootingIds,
  });
}

describe("protocol logic audit", () => {
  it("resolves a complete execution graph for every plant", () => {
    for (const slug of allSlugs()) {
      const manual = resolveBySlug(slug);
      expect(manual, `${slug} must resolve`).not.toBeNull();
      expect(manual!.steps.length, `${slug} must have steps`).toBeGreaterThan(0);
      for (const step of manual!.steps) {
        expect(step.executionInstructions?.length, `${slug}/${step.id} must have execution instructions`).toBeGreaterThan(0);
        expect(new Set(step.materials).size, `${slug}/${step.id} must not duplicate materials`).toBe(step.materials.length);
      }
    }
  });

  it.each(allSlugs())("%s exposes logically ordered medium preparation", (slug) => {
    const manual = resolveBySlug(slug)!;
    const step = manual.steps.find((item) => item.id === "prep-media")!;
    const labels = (step.executionInstructions ?? []).map((item) => item.label);
    expect(labels.indexOf("ละลายส่วนผสมหลัก")).toBeGreaterThanOrEqual(0);
    expect(labels.indexOf("ปรับ pH")).toBeGreaterThan(labels.indexOf("เติมน้ำยาแม่"));
    expect(labels.indexOf("เติมผงวุ้น")).toBeGreaterThan(labels.indexOf("ปรับ pH"));
    expect(labels.indexOf("แบ่งและติดป้าย")).toBeGreaterThan(labels.indexOf("เติมผงวุ้น"));
    expect(instructionText(step), `${slug}/prep-media must use partial initial water`).toMatch(/น้ำตั้งต้น.*ยังไม่ใช่ปริมาตรสุดท้าย/);
    expect(instructionText(step), `${slug}/prep-media must define a heating step after agar`).toMatch(/ต้ม|ให้ความร้อน|ละลาย.*หมด/);
    expect(instructionText(step), `${slug}/prep-media must distinguish initial water from final volume`).toMatch(/เติมน้ำ.*ครบ|ปรับปริมาตร|ปริมาตรสุดท้าย|น้ำเริ่มต้น/);
  });

  it("does not silently bind a stage to the wrong or unavailable recipe", () => {
    const expected: Record<string, Record<string, string | null>> = {
      "pink-princess": { "prep-media": "establishment", multiply: "multiplication", root: "rooting" },
      "violin-variegated": { "prep-media": "establishment", multiply: "multiplication", root: "rooting" },
      "thai-constellation": { "prep-media": "establishment", multiply: "multiplication", root: "rooting" },
      "scindapsus-exotica": { "prep-media": "establishment", multiply: "multiplication", root: null },
      "rhaphidophora-tetrasperma-variegata": { "prep-media": "establishment", multiply: "multiplication", root: null },
      "generic-philodendron": { "prep-media": "establishment", multiply: null, root: null },
      "java-fern": { "prep-media": "ggb-induction", multiply: "ggb-induction", root: "sporophyte-regeneration" },
      "bolbitis-heudelotii": { "prep-media": "spore-germination", multiply: "gametophyte-growth", root: "sporophyte-development" },
      "hemianthus-callitrichoides-cuba": { "prep-media": "multiplication", multiply: "multiplication", root: "rooting" },
      "christmas-moss": { "prep-media": "bcdat-modified", multiply: "bcdat-modified", root: "bcdat-modified" },
      "java-moss": { "prep-media": "bcdat-modified", multiply: "bcdat-modified", root: "bcdat-modified" },
    };
    const expectedIds: Record<string, Record<string, string[]>> = {
      "pink-princess": { "prep-media": ["establishment", "establishment-ba", "establishment-bap-iba"], multiply: ["multiplication"], root: ["rooting", "rooting-naa"] },
      "violin-variegated": { "prep-media": ["establishment", "establishment-ba", "establishment-bap-iba"], multiply: ["multiplication"], root: ["rooting", "rooting-naa"] },
      "thai-constellation": { "prep-media": ["establishment", "establishment-ba", "establishment-bap-iba"], multiply: ["multiplication"], root: ["rooting"] },
      "scindapsus-exotica": { "prep-media": ["establishment", "establishment-ba", "establishment-bap-iba"], multiply: ["multiplication"], root: [] },
      "rhaphidophora-tetrasperma-variegata": { "prep-media": ["establishment", "establishment-ba", "establishment-bap-iba"], multiply: ["multiplication"], root: [] },
      "generic-philodendron": { "prep-media": ["establishment", "establishment-ba", "establishment-bap-iba"], multiply: [], root: [] },
      "java-fern": { "prep-media": ["ggb-induction"], multiply: ["ggb-induction", "sporophyte-regeneration"], root: ["sporophyte-regeneration"] },
      "bolbitis-heudelotii": { "prep-media": ["spore-germination"], multiply: ["gametophyte-growth", "sporophyte-development"], root: ["sporophyte-development"] },
      "hemianthus-callitrichoides-cuba": { "prep-media": ["multiplication"], multiply: ["multiplication"], root: ["rooting"] },
      "christmas-moss": { "prep-media": ["bcdat-modified"], multiply: ["bcdat-modified"], root: ["bcdat-modified"] },
      "java-moss": { "prep-media": ["bcdat-modified"], multiply: ["bcdat-modified"], root: ["bcdat-modified"] },
    };

    for (const slug of allSlugs()) {
      const manual = resolveBySlug(slug)!;
      for (const stepId of ["prep-media", "multiply", "root"] as const) {
        const chosen = initialRecipeIdForStep(stepId, manual.mediaRecipes, manual.mediaRecipeIdsByStep) ?? null;
        const recipeIds = recipeIdsForStep(manual.mediaRecipes, stepId, manual.mediaRecipeIdsByStep);
        expect(chosen, `${slug}/${stepId} selected recipe`).toBe(expected[slug][stepId]);
        expect(recipeIds, `${slug}/${stepId} mapping must be exact`).toEqual(expectedIds[slug][stepId]);
        expect(recipeIds.length > 0, `${slug}/${stepId} mapping must be explicit`).toBe(expected[slug][stepId] !== null);
      }
    }
  });

  it.each(allSlugs())("%s does not present a standard sterilization action before method selection", (slug) => {
    const step = resolveBySlug(slug)!.steps.find((item) => item.id === "prep-media")!;
    const labels = (step.executionInstructions ?? []).map((item) => item.label);
    expect(labels.indexOf("เลือกวิธีฆ่าเชื้ออาหาร"), `${slug}/prep-media method selection`).toBeLessThan(
      labels.indexOf("ฆ่าเชื้ออาหารด้วยวิธีมาตรฐาน"),
    );
  });

  it.each(allSlugs())("%s keeps optional rinse as an explicit alternative", (slug) => {
    const step = resolveBySlug(slug)!.steps.find((item) => item.id === "sterilize")!;
    const instructions = step.executionInstructions ?? [];
    const optionalIndex = instructions.findIndex((item) => /ทางเลือกทดลอง/.test(item.label));
    const standardIndex = instructions.findIndex((item) => item.label === "ล้างรอบที่ 1");
    expect(optionalIndex, `${slug}/sterilize optional rinse`).toBeGreaterThanOrEqual(0);
    expect(standardIndex, `${slug}/sterilize default rinse`).toBeGreaterThanOrEqual(0);
    expect(standardIndex, `${slug}/sterilize default rinse must be shown before optional branch`).toBeLessThan(optionalIndex);
    expect(instructions.filter((item) => item.label === "ล้างรอบที่ 1")).toHaveLength(1);
    expect(instructions[optionalIndex].action).toMatch(/แทน|ไม่ต้อง.*ซ้ำ/);
  });

  it("does not move a pre-wash out of a species sterilization path", () => {
    for (const slug of ["java-fern", "christmas-moss", "java-moss", "hemianthus-callitrichoides-cuba"]) {
      const step = resolveBySlug(slug)!.steps.find((item) => item.id === "sterilize")!;
      const prewash = step.executionInstructions?.find((item) => /น้ำไหล/.test(item.action));
      expect(prewash, `${slug} must keep its running-water pre-wash`).toBeDefined();
    }
  });

  it("inserts a rinse between alcohol and chlorine when both are used", () => {
    const step = resolveBySlug("java-fern")!.steps.find((item) => item.id === "sterilize")!;
    const actions = (step.executionInstructions ?? []).map((item) => item.action);
    const alcohol = actions.findIndex((action) => /แอลกอฮอล์/.test(action));
    const chlorine = actions.findIndex((action) => /ไฮโปคลอไรต์/.test(action));
    const rinse = actions.findIndex((action, index) => index > alcohol && index < chlorine && /ล้าง|น้ำ/.test(action));
    expect(alcohol).toBeGreaterThanOrEqual(0);
    expect(chlorine).toBeGreaterThan(alcohol);
    expect(rinse, "alcohol must be removed before chlorine is introduced").toBeGreaterThan(alcohol);
  });

  it.each(allSlugs())("%s does not count concurrent agitation as a second soak", (slug) => {
    const step = resolveBySlug(slug)!.steps.find((item) => item.id === "sterilize")!;
    const instructions = step.executionInstructions ?? [];
    for (const [index, instruction] of instructions.entries()) {
      if (!/เขย่า|หมุน.*เป็นระยะ/.test(instruction.action)) continue;
      const previous = instructions[index - 1];
      if (previous?.container === instruction.container && previous.durationMinutes != null) {
        expect(instruction.durationMinutes, `${slug}/sterilize agitation must share the soak timer`).toBeUndefined();
      }
    }
  });

  it.each(allSlugs())("%s retains non-rinse materials and pre-wash actions for selected rinse branches", (slug) => {
    const step = resolveBySlug(slug)!.steps.find((item) => item.id === "sterilize")!;
    const snapshot: LotSterilizationSnapshot = {
      profileId: "audit-v1",
      profileVersion: "1.0.0",
      method: "haiter-chemical",
      rinseMethod: "commercial-sterile",
    };
    const resolved = resolveSterilizationStep(step, snapshot);
    const originalNonRinseMaterials = step.materials.filter((material) => !/สารฟอกตามที่ระบบจัดให้|น้ำปลอดเชื้อ|NaDCC|NaOCl|rinse/i.test(material));
    for (const material of originalNonRinseMaterials) {
      if (material === "ภาชนะแช่") {
        expect(resolved.materials.some((item) => /ภาชนะแช่/.test(item)), `${slug}/sterilize lost material ${material}`).toBe(true);
      } else {
        expect(resolved.materials, `${slug}/sterilize lost material ${material}`).toContain(material);
      }
    }
    for (const instruction of step.executionInstructions ?? []) {
      if (/น้ำไหล/.test(instruction.action)) {
        expect(resolved.executionInstructions?.some((item) => item.action === instruction.action), `${slug}/sterilize lost pre-wash`).toBe(true);
      }
    }
  });

  it.each(allSlugs())("%s resolves every locked medium and surface sterilization branch", (slug) => {
    const manual = resolveBySlug(slug)!;
    const prep = manual.steps.find((item) => item.id === "prep-media")!;
    const sterilize = manual.steps.find((item) => item.id === "sterilize")!;
    const baseSnapshot = {
      profileId: "audit-matrix-v1",
      profileVersion: "1.0.0",
      method: "haiter-chemical" as const,
    } satisfies Pick<LotSterilizationSnapshot, "profileId" | "profileVersion" | "method">;

    for (const mediumMethod of ["pressure-sterilization", "haiter-chemical", "nadcc-chemical"] as const) {
      const resolved = resolveSterilizationStep(prep, {
        ...baseSnapshot,
        mediumSterilizationMethod: mediumMethod,
      });
      const labels = (resolved.executionInstructions ?? []).map((item) => item.label);
      const topUp = labels.indexOf("เติมน้ำให้ครบปริมาตรสุดท้าย");
      const divide = labels.indexOf("แบ่งและติดป้าย");
      expect(new Set(resolved.materials).size, `${slug}/${mediumMethod} must not duplicate materials`).toBe(resolved.materials.length);
      expect(topUp, `${slug}/${mediumMethod} must top up`).toBeGreaterThanOrEqual(0);
      expect(divide, `${slug}/${mediumMethod} must divide`).toBeGreaterThan(topUp);
      if (mediumMethod === "pressure-sterilization") {
        expect(labels.indexOf("นึ่งฆ่าเชื้ออาหาร"), `${slug}/${mediumMethod} must sterilize after division`).toBeGreaterThan(divide);
      } else {
        const chemicalLabel = mediumMethod === "nadcc-chemical" ? "ฆ่าเชื้ออาหารด้วย NaDCC" : "ฆ่าเชื้ออาหารด้วย Haiter";
        expect(labels.indexOf(chemicalLabel), `${slug}/${mediumMethod} must sterilize before final top-up`).toBeGreaterThanOrEqual(0);
        expect(labels.indexOf(chemicalLabel)).toBeLessThan(topUp);
      }
    }

    for (const rinseMethod of ["commercial-sterile", "nadcc", "low-dose-hypochlorite"] as const) {
      const resolved = resolveSterilizationStep(sterilize, {
        ...baseSnapshot,
        rinseMethod,
      });
      const text = operationalSterilizationText(resolved);
      expect(new Set(resolved.materials).size, `${slug}/${rinseMethod} must not duplicate materials`).toBe(resolved.materials.length);
      expect(text, `${slug}/${rinseMethod} must include R1–R3`).toMatch(/R1.*R3/);
      expect(text, `${slug}/${rinseMethod} must not include R4`).not.toMatch(/R4|final rinse/i);
      if (rinseMethod === "commercial-sterile") {
        expect(text).toContain("น้ำปลอดเชื้อธรรมดา");
        expect(text).not.toMatch(/น้ำ NaDCC|น้ำ NaOCl/);
      } else if (rinseMethod === "nadcc") {
        expect(text).toContain("น้ำ NaDCC 300 ppm");
        expect(text).not.toContain("น้ำ NaOCl 300 ppm");
      } else {
        expect(text).toContain("น้ำ NaOCl 300 ppm");
        expect(text).not.toContain("น้ำ NaDCC 300 ppm");
      }
    }

    const soak = resolveSterilizationStep(sterilize, {
      ...baseSnapshot,
      method: "nadcc-soak",
      rinseMethod: "commercial-sterile",
    });
    const soakText = operationalSterilizationText(soak);
    expect(new Set(soak.materials).size, `${slug}/nadcc-soak must not duplicate materials`).toBe(soak.materials.length);
    expect(soakText).toMatch(/NaDCC.*24 ถึง 48 ชั่วโมง/s);
    expect(soakText).not.toMatch(/Haiter|NaOCl/);
  });
});
