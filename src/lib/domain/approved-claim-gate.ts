import type { EvidenceState } from "./models";
import type { KnowledgeSource, SourceClaim } from "./knowledge-sources";

export type PlaybookDraftSeed = {
  title: string;
  plantScope: string;
  evidenceState: EvidenceState;
  summary: string;
  changeNote: string;
  steps: [];
  status: "Draft";
  claimIds: string[];
  sourceIds: string[];
};

export function canCreatePlaybookDraft(claim: SourceClaim | null, source: KnowledgeSource | null): { allowed: boolean; reason: string | null } {
  if (!claim) return { allowed: false, reason: "Claim not found" };
  if (!source) return { allowed: false, reason: "Source not found" };
  if (claim.reviewState !== "Approved") return { allowed: false, reason: "Claim must be Approved" };
  if (!claim.evidenceExcerpt?.trim()) return { allowed: false, reason: "Evidence excerpt required" };
  if (!claim.evidenceLocation?.trim()) return { allowed: false, reason: "Evidence location required" };
  return { allowed: true, reason: null };
}

export function createPlaybookDraftInput(claim: SourceClaim, source: KnowledgeSource): PlaybookDraftSeed {
  const gate = canCreatePlaybookDraft(claim, source);
  if (!gate.allowed) throw new Error(gate.reason ?? "Claim cannot create playbook draft");
  return { title: `${claim.statement.slice(0, 70)} — playbook draft`, plantScope: claim.taxonId, evidenceState: claim.evidenceState, summary: claim.statement, changeNote: `Seeded from approved claim ${claim.id} and source ${source.id}`, steps: [], status: "Draft", claimIds: [claim.id], sourceIds: [source.id] };
}
