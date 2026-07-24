import type { KnowledgeSource, KnowledgeSourceAuditEvent, SourceClaim, SourceClaimAuditEvent } from "../domain/knowledge-sources";
import { isDuplicateSource } from "../domain/source-deduplication";
import type { KnowledgeSourceInput, KnowledgeSourceRepository, SourceClaimInput } from "./knowledge-source-repository";

export function createMemoryKnowledgeSourceRepository(uid: string): KnowledgeSourceRepository {
  const sources = new Map<string, KnowledgeSource>();
  const claims = new Map<string, SourceClaim>();
  const audits = new Map<string, KnowledgeSourceAuditEvent[]>();
  const claimAudits = new Map<string, SourceClaimAuditEvent[]>();
  const guard = (ownerId: string) => { if (ownerId !== uid) throw new Error("Owner mismatch"); };
  const now = () => new Date().toISOString();
  return {
    async listSources(ownerId) { guard(ownerId); return structuredClone([...sources.values()]); },
    async createSource(ownerId, input: KnowledgeSourceInput) { guard(ownerId); if (isDuplicateSource(input, [...sources.values()])) throw new Error("Source already registered"); const timestamp = now(); const source: KnowledgeSource = { ...structuredClone(input), id: `source-${crypto.randomUUID()}`, ownerId: uid, createdAt: timestamp, updatedAt: timestamp }; sources.set(source.id, source); audits.set(source.id, [{ id: crypto.randomUUID(), ownerId: uid, sourceId: source.id, action: "created", occurredAt: timestamp, before: null, after: structuredClone(source) }]); return structuredClone(source); },
    async updateSource(ownerId, sourceId, input) { guard(ownerId); const current = sources.get(sourceId); if (!current) throw new Error("Source not found"); if (isDuplicateSource(input, [...sources.values()].filter(item => item.id !== sourceId))) throw new Error("Source already registered"); const source: KnowledgeSource = { ...current, ...structuredClone(input), updatedAt: now() }; sources.set(sourceId, source); const event: KnowledgeSourceAuditEvent = { id: crypto.randomUUID(), ownerId: uid, sourceId, action: "updated", occurredAt: source.updatedAt, before: structuredClone(current), after: structuredClone(source) }; audits.set(sourceId, [...(audits.get(sourceId) ?? []), event]); return structuredClone(source); },
    async listSourceAuditEvents(ownerId, sourceId) { guard(ownerId); if (!sources.has(sourceId)) throw new Error("Source not found"); return structuredClone(audits.get(sourceId) ?? []); },
    async listClaims(ownerId) { guard(ownerId); return structuredClone([...claims.values()]); },
    async createClaim(ownerId, input: SourceClaimInput) { guard(ownerId); if (!sources.has(input.sourceId)) throw new Error("Source not found"); if (!input.evidenceExcerpt?.trim()) throw new Error("Evidence excerpt required"); if (!input.evidenceLocation?.trim()) throw new Error("Evidence location required"); const timestamp = now(); const claim: SourceClaim = { ...structuredClone(input), id: `claim-${crypto.randomUUID()}`, ownerId: uid, reviewState: "Pending review", reviewerNote: "", reviewedBy: null, reviewedAt: null, createdAt: timestamp, updatedAt: timestamp }; claims.set(claim.id, claim); claimAudits.set(claim.id, [{ id: crypto.randomUUID(), ownerId: uid, claimId: claim.id, sourceId: claim.sourceId, taxonId: claim.taxonId, action: "created", occurredAt: timestamp, before: null, after: structuredClone(claim) }]); return structuredClone(claim); },
    async listClaimAuditEvents(ownerId, claimId) { guard(ownerId); if (!claims.has(claimId)) throw new Error("Claim not found"); return structuredClone(claimAudits.get(claimId) ?? []); },
    async reviewClaim(ownerId, claimId, reviewState, reviewerNote) { guard(ownerId); const current = claims.get(claimId); if (!current) throw new Error("Claim not found"); const timestamp = now(); const next: SourceClaim = { ...current, reviewState, reviewerNote, reviewedBy: uid, reviewedAt: timestamp, updatedAt: timestamp }; claims.set(claimId, next); const event: SourceClaimAuditEvent = { id: crypto.randomUUID(), ownerId: uid, claimId, sourceId: next.sourceId, taxonId: next.taxonId, action: "reviewed", occurredAt: timestamp, before: structuredClone(current), after: structuredClone(next) }; claimAudits.set(claimId, [...(claimAudits.get(claimId) ?? []), event]); return structuredClone(next); },
  };
}
