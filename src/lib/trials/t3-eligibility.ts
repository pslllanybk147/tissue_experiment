import type { ExperimentLot, ProtocolStepRun, TrialArmRole } from "@/lib/domain/models";

export type T3Eligibility = {
  unlocked: boolean;
  reason: "evidence-complete" | "override" | "missing-results";
  missing: string[];
};

const prerequisiteRoles = ["t1", "t2"] as const;
const resultFieldIds = ["container-total", "container-clean", "container-usable"] as const;

function hasNumber(value: number | null | undefined): boolean {
  return typeof value === "number" && Number.isFinite(value);
}

function missingForRole(
  role: Extract<TrialArmRole, "t1" | "t2">,
  lots: ExperimentLot[],
  runs: ProtocolStepRun[],
): string[] {
  const lot = lots.find((item) => item.armRole === role);
  if (!lot) return [`${role}:result-run`];

  const run = runs.find((item) => item.lotId === lot.id && item.stepId === "check-contamination");
  if (!run) return [`${role}:result-run`];

  const missing = resultFieldIds
    .filter((fieldId) => !hasNumber(run.measurements[fieldId]))
    .map((fieldId) => `${role}:${fieldId}`);
  if (!run.observedAt.trim()) missing.push(`${role}:observed-at`);
  return missing;
}

export function evaluateT3Eligibility(lots: ExperimentLot[], runs: ProtocolStepRun[]): T3Eligibility {
  const override = lots.find((lot) => lot.armRole === "t3")?.t3Override;
  if (override?.acknowledged && override.reason.trim().length >= 20) {
    return { unlocked: true, reason: "override", missing: [] };
  }

  const missing = prerequisiteRoles.flatMap((role) => missingForRole(role, lots, runs));
  return missing.length === 0
    ? { unlocked: true, reason: "evidence-complete", missing: [] }
    : { unlocked: false, reason: "missing-results", missing };
}
