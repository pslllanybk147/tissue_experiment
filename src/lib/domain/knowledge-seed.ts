import {
  starterTaxa,
  type KnowledgeClaim,
  type KnowledgeLibraryRecord,
  type TissueCulturePlaybook,
} from "./knowledge-library";
import { monographForTaxon } from "./philodendron-knowledge";

function monographClaims(taxonId: string): KnowledgeClaim[] {
  const monograph = monographForTaxon(taxonId);
  if (!monograph) return [];
  return monograph.sections.flatMap((section) => section.claims.map((claim) => ({
    id: claim.id,
    taxonId,
    category: section.id,
    statement: claim.statement,
    evidenceState: claim.evidenceState,
    sourceIds: claim.sourceIds,
    reviewedBy: claim.sourceIds.length ? "system-seed" : null,
    reviewedAt: claim.sourceIds.length ? monograph.lastReviewedAt : null,
  })));
}

function monographPlaybooks(taxonId: string): TissueCulturePlaybook[] {
  const monograph = monographForTaxon(taxonId);
  if (!monograph) return [];
  const isPinkPrincess = taxonId === "cultivar-pink-princess";
  return [{
    id: `playbook-${taxonId}-nodal`,
    taxonId,
    method: "nodal",
    protocolId: isPinkPrincess
      ? "protocol-pink-princess-nodal"
      : "protocol-violin-nodal",
    evidenceState: monograph.tissueCulture.steps.some((step) => step.evidenceState === "Experimental")
      ? "Experimental"
      : monograph.sections.some((section) =>
        section.claims.some((claim) => claim.evidenceState === "Adapted"))
        ? "Adapted"
        : "Verified",
    claimIds: monograph.sections.flatMap((section) =>
      section.claims.map((claim) => claim.id)),
    status: "Active",
    version: "0.1.0",
  }];
}

export function starterKnowledgeRecords(): KnowledgeLibraryRecord[] {
  return starterTaxa.map((taxon) => ({
    taxon,
    claims: monographClaims(taxon.id),
    playbooks: monographPlaybooks(taxon.id),
  }));
}

export function hydrateKnowledgeRecord(
  record: KnowledgeLibraryRecord,
): KnowledgeLibraryRecord {
  const seeded = starterKnowledgeRecords().find((item) => item.taxon.id === record.taxon.id);
  if (!seeded) return record;
  return {
    taxon: record.taxon,
    claims: record.claims.length ? record.claims : seeded.claims,
    playbooks: record.playbooks.length ? record.playbooks : seeded.playbooks,
  };
}
