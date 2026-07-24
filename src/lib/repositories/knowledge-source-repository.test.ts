import { describe, expect, it } from "vitest";
import { createMemoryKnowledgeSourceRepository } from "./memory-knowledge-source-repository";

describe("knowledge source repository", () => {
  it("keeps new claims pending until review", async () => {
    const repository = createMemoryKnowledgeSourceRepository("owner-1");
    const source = await repository.createSource("owner-1", { title: "Example paper", sourceType: "journal", url: "https://example.com/paper", doi: "10.0000/example", authors: "Author", publishedAt: null, license: null, notes: "" });
    const claim = await repository.createClaim("owner-1", { sourceId: source.id, taxonId: "cultivar-pink-princess", category: "tissue-culture", statement: "Example claim", evidenceExcerpt: "Supporting excerpt", evidenceLocation: "p. 4, Table 2", evidenceState: "Adapted" });
    expect(claim.reviewState).toBe("Pending review");
    expect((await repository.reviewClaim("owner-1", claim.id, "Approved", "checked")).reviewedBy).toBe("owner-1");
    expect((await repository.listClaimAuditEvents("owner-1", claim.id)).map(event => event.action)).toEqual(["created", "reviewed"]);
  });

  it("requires an evidence excerpt for a claim draft", async () => {
    const repository = createMemoryKnowledgeSourceRepository("owner-1");
    const source = await repository.createSource("owner-1", { title: "Paper", sourceType: "journal", url: "https://example.com/paper", doi: null, authors: "", publishedAt: null, license: null, notes: "" });
    await expect(repository.createClaim("owner-1", { sourceId: source.id, taxonId: "cultivar-pink-princess", category: "biology", statement: "Claim", evidenceState: "Adapted" })).rejects.toThrow("Evidence excerpt required");
    await expect(repository.createClaim("owner-1", { sourceId: source.id, taxonId: "cultivar-pink-princess", category: "biology", statement: "Claim", evidenceExcerpt: "Excerpt", evidenceState: "Adapted" })).rejects.toThrow("Evidence location required");
  });

  it("rejects duplicate source URLs and DOIs", async () => {
    const repository = createMemoryKnowledgeSourceRepository("owner-1");
    await repository.createSource("owner-1", { title: "Example paper", sourceType: "journal", url: "https://example.com/paper", doi: "10.0000/example", authors: "Author", publishedAt: null, license: null, notes: "" });
    await expect(repository.createSource("owner-1", { title: "Same URL", sourceType: "journal", url: "https://example.com/paper/?utm_source=test", doi: null, authors: "", publishedAt: null, license: null, notes: "" })).rejects.toThrow("Source already registered");
    await expect(repository.createSource("owner-1", { title: "Same DOI", sourceType: "journal", url: "https://other.example/paper", doi: "https://doi.org/10.0000/example", authors: "", publishedAt: null, license: null, notes: "" })).rejects.toThrow("Source already registered");
  });

  it("updates source metadata without changing its identity", async () => {
    const repository = createMemoryKnowledgeSourceRepository("owner-1");
    const source = await repository.createSource("owner-1", { title: "Draft paper", sourceType: "journal", url: "https://example.com/draft", doi: null, authors: "Author", publishedAt: null, license: null, notes: "" });
    const updated = await repository.updateSource("owner-1", source.id, { title: "Reviewed paper", sourceType: source.sourceType, url: source.url, doi: source.doi, authors: source.authors, publishedAt: source.publishedAt, license: source.license, notes: "Added review context" });
    expect(updated.id).toBe(source.id);
    expect(updated.title).toBe("Reviewed paper");
    expect(updated.createdAt).toBe(source.createdAt);
    expect((await repository.listSourceAuditEvents("owner-1", source.id)).map(event => event.action)).toEqual(["created", "updated"]);
  });
});
