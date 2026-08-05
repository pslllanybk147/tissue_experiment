import { resolveBySlug } from "./registry";
import type { EvidenceLevel, StepOrigin } from "./types";

export type ManualSummary = {
  slug: string;
  stepCount: number;
  byOrigin: Record<StepOrigin, number>;
  byEvidence: Record<EvidenceLevel, number>;
  unsupportedStepIds: string[];
};

export function manualSummary(slug: string): ManualSummary | null {
  const manual = resolveBySlug(slug);
  if (!manual) return null;

  const byOrigin: Record<StepOrigin, number> = { core: 0, override: 0, pack: 0 };
  const byEvidence: Record<EvidenceLevel, number> = {
    "species-direct": 0,
    adapted: 0,
    unsupported: 0,
    "botanical-fact": 0,
  };
  const unsupportedStepIds: string[] = [];

  for (const step of manual.steps) {
    byOrigin[step.origin] += 1;
    byEvidence[step.evidence.level] += 1;
    if (step.evidence.level === "unsupported") unsupportedStepIds.push(step.id);
  }

  return { slug, stepCount: manual.steps.length, byOrigin, byEvidence, unsupportedStepIds };
}
