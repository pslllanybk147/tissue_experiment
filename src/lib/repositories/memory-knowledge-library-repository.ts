import type { KnowledgeLibraryRecord, TaxonRecord } from "../domain/knowledge-library";
import { hydrateKnowledgeRecord, starterKnowledgeRecords } from "../domain/knowledge-seed";
import type { KnowledgeLibraryRepository } from "./knowledge-library-repository";

export function createMemoryKnowledgeLibraryRepository(uid: string): KnowledgeLibraryRepository {
  const records = new Map<string, KnowledgeLibraryRecord>(
    starterKnowledgeRecords().map((record) => [record.taxon.id, structuredClone(record)]),
  );
  const guard = (ownerId: string) => { if (ownerId !== uid) throw new Error("Owner mismatch"); };
  return {
    async list(ownerId) { guard(ownerId); return structuredClone([...records.values()].map(hydrateKnowledgeRecord)); },
    async get(ownerId, taxonId) { guard(ownerId); const record = records.get(taxonId); return record ? structuredClone(hydrateKnowledgeRecord(record)) : null; },
    async upsert(ownerId, taxon: TaxonRecord) { guard(ownerId); const current = records.get(taxon.id); const record: KnowledgeLibraryRecord = { taxon: structuredClone(taxon), claims: current?.claims ?? [], playbooks: current?.playbooks ?? [] }; records.set(taxon.id, record); return structuredClone(record); },
  };
}
