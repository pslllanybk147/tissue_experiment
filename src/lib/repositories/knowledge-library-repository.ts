import type { KnowledgeLibraryRecord, TaxonRecord } from "../domain/knowledge-library";

export interface KnowledgeLibraryRepository {
  list(ownerId: string): Promise<KnowledgeLibraryRecord[]>;
  get(ownerId: string, taxonId: string): Promise<KnowledgeLibraryRecord | null>;
  upsert(ownerId: string, taxon: TaxonRecord): Promise<KnowledgeLibraryRecord>;
}
