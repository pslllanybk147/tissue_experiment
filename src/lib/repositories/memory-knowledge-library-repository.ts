import { starterTaxa, type KnowledgeLibraryRecord, type TaxonRecord } from "../domain/knowledge-library";
import type { KnowledgeLibraryRepository } from "./knowledge-library-repository";

export function createMemoryKnowledgeLibraryRepository(uid: string): KnowledgeLibraryRepository {
  const records = new Map<string, KnowledgeLibraryRecord>(starterTaxa.map(taxon => [taxon.id, { taxon: { ...taxon }, claims: [], playbooks: [] }]));
  const guard = (ownerId: string) => { if (ownerId !== uid) throw new Error("Owner mismatch"); };
  return {
    async list(ownerId) { guard(ownerId); return structuredClone([...records.values()]); },
    async get(ownerId, taxonId) { guard(ownerId); const record = records.get(taxonId); return record ? structuredClone(record) : null; },
    async upsert(ownerId, taxon: TaxonRecord) { guard(ownerId); const current = records.get(taxon.id); const record: KnowledgeLibraryRecord = { taxon: structuredClone(taxon), claims: current?.claims ?? [], playbooks: current?.playbooks ?? [] }; records.set(taxon.id, record); return structuredClone(record); },
  };
}
