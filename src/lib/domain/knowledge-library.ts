import type { EvidenceState } from "./models";

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

export const starterTaxa: TaxonRecord[] = [
  { id: "family-araceae", scientificName: "Araceae", displayName: "Araceae", rank: "family", parentId: null, synonyms: [], commonNames: ["วงศ์บอน"], confidence: "High", evidenceState: "Pending review", sourceIds: [], createdAt: "", updatedAt: "" },
  { id: "genus-philodendron", scientificName: "Philodendron", displayName: "Philodendron", rank: "genus", parentId: "family-araceae", synonyms: [], commonNames: [], confidence: "High", evidenceState: "Pending review", sourceIds: [], createdAt: "", updatedAt: "" },
  { id: "species-philodendron-erubescens", scientificName: "Philodendron erubescens", displayName: "Philodendron erubescens", rank: "species", parentId: "genus-philodendron", synonyms: [], commonNames: [], confidence: "Medium", evidenceState: "Pending review", sourceIds: [], createdAt: "", updatedAt: "" },
  { id: "cultivar-pink-princess", scientificName: "Philodendron erubescens", displayName: "Pink Princess", rank: "cultivar", parentId: "species-philodendron-erubescens", synonyms: [], commonNames: ["PPP"], confidence: "Medium", evidenceState: "Pending review", sourceIds: [], createdAt: "", updatedAt: "" },
  { id: "species-philodendron-bipennifolium", scientificName: "Philodendron bipennifolium", displayName: "Philodendron bipennifolium", rank: "species", parentId: "genus-philodendron", synonyms: [], commonNames: [], confidence: "Medium", evidenceState: "Pending review", sourceIds: [], createdAt: "", updatedAt: "" },
  { id: "trade-name-violin-variegated", scientificName: "Philodendron bipennifolium", displayName: "Violin variegated", rank: "trade-name", parentId: "species-philodendron-bipennifolium", synonyms: ["Violin"], commonNames: [], confidence: "Low", evidenceState: "Pending review", sourceIds: [], createdAt: "", updatedAt: "" },
];

export function findTaxonByName(records: TaxonRecord[], value: string): TaxonRecord | null {
  const query = value.trim().toLowerCase();
  if (!query) return null;
  return records.find(record => [record.scientificName, record.displayName, ...record.synonyms, ...record.commonNames].some(name => name.toLowerCase() === query)) ?? null;
}
