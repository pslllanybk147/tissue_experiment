import { describe, expect, it } from "vitest";
import { auditBeginnerCopy } from "./beginner-copy";
import { illustrationMetaById } from "./illustration-metadata";
import { allSlugs, resolveBySlug } from "./registry";
import { allTermIds, termIdsIn } from "./terms";

function textFields(step: NonNullable<ReturnType<typeof resolveBySlug>>["steps"][number]): string[] {
  return [step.title, step.summary, step.why, ...step.materials, ...step.actions, ...step.passCriteria, ...step.stopConditions, ...step.safetyNotes];
}

function humanIssues(slug: string): string[] {
  const manual = resolveBySlug(slug);
  if (!manual) return [`${slug} > manual > resolution-failed`];
  const issues = auditBeginnerCopy(manual).map((issue) => `${slug} > ${issue.stepId} > ${issue.code}`);
  const knownTerms = allTermIds();
  const stepIds = new Set<string>();

  manual.steps.forEach((step, index) => {
    if (step.order !== index) issues.push(`${slug} > ${step.id} > wrong-order`);
    if (stepIds.has(step.id)) issues.push(`${slug} > ${step.id} > duplicate-step`);
    stepIds.add(step.id);

    for (const source of textFields(step)) {
      for (const termId of termIdsIn(source)) {
        if (!knownTerms.has(termId)) issues.push(`${slug} > ${step.id} > unknown-term:${termId}`);
      }
    }

    if (step.illustrationId && !illustrationMetaById(step.illustrationId)) {
      issues.push(`${slug} > ${step.id} > missing-illustration-metadata:${step.illustrationId}`);
    }

    const measurementIds = new Set<string>();
    for (const field of step.measurements) {
      if (measurementIds.has(field.id)) issues.push(`${slug} > ${step.id} > duplicate-field:${field.id}`);
      measurementIds.add(field.id);
      if (!field.label.trim()) issues.push(`${slug} > ${step.id} > empty-field-label:${field.id}`);
      if (field.min != null && field.max != null && field.min > field.max) issues.push(`${slug} > ${step.id} > invalid-field-range:${field.id}`);
      if (field.kind === "select" && (!field.options || field.options.length < 2)) issues.push(`${slug} > ${step.id} > invalid-select:${field.id}`);
    }
  });

  return issues;
}

describe("all manuals are usable by a first-time human", () => {
  it.each(allSlugs())("%s passes resolution, copy, glossary, illustration, sequence, and field checks", (slug) => {
    expect(humanIssues(slug)).toEqual([]);
  });
});
