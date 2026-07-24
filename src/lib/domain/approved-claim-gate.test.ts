import { describe, expect, it } from "vitest";
import type { KnowledgeSource, SourceClaim } from "./knowledge-sources";
import { canCreatePlaybookDraft, createPlaybookDraftInput } from "./approved-claim-gate";

const source: KnowledgeSource = { id: "source-1", ownerId: "owner-1", title: "Pink Princess paper", sourceType: "journal", url: "https://example.com/paper", doi: null, authors: "Author", publishedAt: null, license: null, notes: "", createdAt: "2026-07-24T00:00:00.000Z", updatedAt: "2026-07-24T00:00:00.000Z" };
const approvedClaim: SourceClaim = { id: "claim-1", ownerId: "owner-1", sourceId: source.id, taxonId: "cultivar-pink-princess", category: "tissue-culture", statement: "Use a nodal explant for the draft playbook.", evidenceExcerpt: "Supporting excerpt", evidenceLocation: "p. 4, Table 2", evidenceState: "Verified", reviewState: "Approved", reviewerNote: "checked", reviewedBy: "owner-1", reviewedAt: "2026-07-24T01:00:00.000Z", createdAt: "2026-07-24T00:00:00.000Z", updatedAt: "2026-07-24T01:00:00.000Z" };

describe("approved claim gate", () => {
  it("allows an Approved claim with evidence and creates a Draft seed", () => {
    expect(canCreatePlaybookDraft(approvedClaim, source)).toEqual({ allowed: true, reason: null });
    expect(createPlaybookDraftInput(approvedClaim, source)).toMatchObject({ claimIds: ["claim-1"], sourceIds: ["source-1"], status: "Draft", evidenceState: "Verified" });
  });

  it("rejects claims that are not Approved or lack traceable evidence", () => {
    expect(canCreatePlaybookDraft({ ...approvedClaim, reviewState: "Pending review" }, source).allowed).toBe(false);
    expect(canCreatePlaybookDraft({ ...approvedClaim, reviewState: "Rejected" }, source).allowed).toBe(false);
    expect(canCreatePlaybookDraft({ ...approvedClaim, evidenceExcerpt: "" }, source).allowed).toBe(false);
    expect(canCreatePlaybookDraft({ ...approvedClaim, evidenceLocation: "" }, source).allowed).toBe(false);
    expect(canCreatePlaybookDraft(approvedClaim, null).allowed).toBe(false);
  });
});
