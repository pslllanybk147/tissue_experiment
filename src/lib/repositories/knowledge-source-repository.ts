import type { KnowledgeSource, KnowledgeSourceAuditEvent, SourceClaim, SourceClaimAuditEvent } from "../domain/knowledge-sources";

export type KnowledgeSourceInput = Omit<KnowledgeSource, "id" | "ownerId" | "createdAt" | "updatedAt">;
export type SourceClaimInput = Omit<SourceClaim, "id" | "ownerId" | "createdAt" | "updatedAt" | "reviewState" | "reviewerNote" | "reviewedBy" | "reviewedAt">;

export interface KnowledgeSourceRepository {
  listSources(ownerId: string): Promise<KnowledgeSource[]>;
  createSource(ownerId: string, input: KnowledgeSourceInput): Promise<KnowledgeSource>;
  updateSource(ownerId: string, sourceId: string, input: KnowledgeSourceInput): Promise<KnowledgeSource>;
  listSourceAuditEvents(ownerId: string, sourceId: string): Promise<KnowledgeSourceAuditEvent[]>;
  listClaims(ownerId: string): Promise<SourceClaim[]>;
  createClaim(ownerId: string, input: SourceClaimInput): Promise<SourceClaim>;
  listClaimAuditEvents(ownerId: string, claimId: string): Promise<SourceClaimAuditEvent[]>;
  reviewClaim(ownerId: string, claimId: string, reviewState: Exclude<SourceClaim["reviewState"], "Pending review">, reviewerNote: string): Promise<SourceClaim>;
}
