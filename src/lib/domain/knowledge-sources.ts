import type { EvidenceState } from "./models";

export type KnowledgeSourceType = "journal" | "book" | "database" | "website" | "user-note";
export type ClaimReviewState = "Pending review" | "Approved" | "Rejected";

export type KnowledgeSource = {
  id: string;
  ownerId: string;
  title: string;
  sourceType: KnowledgeSourceType;
  url: string;
  doi: string | null;
  authors: string;
  publishedAt: string | null;
  license: string | null;
  notes: string;
  createdAt: string;
  updatedAt: string;
};

export type SourceClaim = {
  id: string;
  ownerId: string;
  sourceId: string;
  taxonId: string;
  category: "taxonomy" | "biology" | "ecology" | "toxicity" | "propagation" | "tissue-culture" | "identification";
  statement: string;
  evidenceExcerpt?: string;
  evidenceLocation?: string;
  evidenceState: EvidenceState;
  reviewState: ClaimReviewState;
  reviewerNote: string;
  reviewedBy: string | null;
  reviewedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type KnowledgeSourceAuditEvent = {
  id: string;
  ownerId: string;
  sourceId: string;
  action: "created" | "updated";
  occurredAt: string;
  before: Record<string, unknown> | null;
  after: Record<string, unknown> | null;
};
