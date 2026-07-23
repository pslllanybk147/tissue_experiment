import type { KnowledgeSource, SourceClaim } from "../domain/knowledge-sources";

export type KnowledgeSourceInput = Omit<KnowledgeSource, "id" | "ownerId" | "createdAt" | "updatedAt">;
export type SourceClaimInput = Omit<SourceClaim, "id" | "ownerId" | "createdAt" | "updatedAt" | "reviewState" | "reviewerNote" | "reviewedBy" | "reviewedAt">;

export interface KnowledgeSourceRepository {
  listSources(ownerId: string): Promise<KnowledgeSource[]>;
  createSource(ownerId: string, input: KnowledgeSourceInput): Promise<KnowledgeSource>;
  listClaims(ownerId: string): Promise<SourceClaim[]>;
  createClaim(ownerId: string, input: SourceClaimInput): Promise<SourceClaim>;
  reviewClaim(ownerId: string, claimId: string, reviewState: Exclude<SourceClaim["reviewState"], "Pending review">, reviewerNote: string): Promise<SourceClaim>;
}
