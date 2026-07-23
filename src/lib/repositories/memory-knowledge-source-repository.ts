import type { KnowledgeSource, SourceClaim } from "../domain/knowledge-sources";
import type { KnowledgeSourceInput, KnowledgeSourceRepository, SourceClaimInput } from "./knowledge-source-repository";

export function createMemoryKnowledgeSourceRepository(uid: string): KnowledgeSourceRepository {
  const sources = new Map<string, KnowledgeSource>();
  const claims = new Map<string, SourceClaim>();
  const guard = (ownerId: string) => { if (ownerId !== uid) throw new Error("Owner mismatch"); };
  const now = () => new Date().toISOString();
  return {
    async listSources(ownerId) { guard(ownerId); return structuredClone([...sources.values()]); },
    async createSource(ownerId, input: KnowledgeSourceInput) { guard(ownerId); const timestamp = now(); const source: KnowledgeSource = { ...structuredClone(input), id: `source-${crypto.randomUUID()}`, ownerId: uid, createdAt: timestamp, updatedAt: timestamp }; sources.set(source.id, source); return structuredClone(source); },
    async listClaims(ownerId) { guard(ownerId); return structuredClone([...claims.values()]); },
    async createClaim(ownerId, input: SourceClaimInput) { guard(ownerId); if (!sources.has(input.sourceId)) throw new Error("Source not found"); const timestamp = now(); const claim: SourceClaim = { ...structuredClone(input), id: `claim-${crypto.randomUUID()}`, ownerId: uid, reviewState: "Pending review", reviewerNote: "", reviewedBy: null, reviewedAt: null, createdAt: timestamp, updatedAt: timestamp }; claims.set(claim.id, claim); return structuredClone(claim); },
    async reviewClaim(ownerId, claimId, reviewState, reviewerNote) { guard(ownerId); const current = claims.get(claimId); if (!current) throw new Error("Claim not found"); const next: SourceClaim = { ...current, reviewState, reviewerNote, reviewedBy: uid, reviewedAt: now(), updatedAt: now() }; claims.set(claimId, next); return structuredClone(next); },
  };
}
