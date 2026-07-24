import type { EvidenceState } from "./models";
import { philodendronTaxa } from "./philodendron-knowledge";

export type TaxonRank = "family" | "genus" | "species" | "cultivar" | "hybrid" | "trade-name";

export type TaxonRecord = {
  id: string;
  scientificName: string;
  displayName: string;
  rank: TaxonRank;
  parentId: string | null;
  synonyms: string[];
  commonNames: string[];
  confidence: "Unknown" | "Low" | "Medium" | "High";
  evidenceState: EvidenceState;
  sourceIds: string[];
  createdAt: string;
  updatedAt: string;
};

export type KnowledgeClaim = {
  id: string;
  taxonId: string;
  category: "taxonomy" | "biology" | "ecology" | "toxicity" | "propagation" | "tissue-culture" | "identification";
  statement: string;
  evidenceState: EvidenceState;
  sourceIds: string[];
  reviewedBy: string | null;
  reviewedAt: string | null;
};

export type TissueCulturePlaybook = {
  id: string;
  taxonId: string;
  method: "shoot-tip" | "nodal" | "generic";
  protocolId: string | null;
  evidenceState: EvidenceState;
  claimIds: string[];
  status: "Draft" | "Active" | "Archived";
  version: string;
};

export type KnowledgeLibraryRecord = {
  taxon: TaxonRecord;
  claims: KnowledgeClaim[];
  playbooks: TissueCulturePlaybook[];
};

export const starterTaxa: TaxonRecord[] = philodendronTaxa;

export function findTaxonByName(records: TaxonRecord[], value: string): TaxonRecord | null {
  const query = value.trim().toLowerCase();
  if (!query) return null;
  return records.find(record => [record.scientificName, record.displayName, ...record.synonyms, ...record.commonNames].some(name => name.toLowerCase() === query)) ?? null;
}
