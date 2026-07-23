import { describe, expect, it } from "vitest";
import { createMemoryKnowledgeSourceRepository } from "./memory-knowledge-source-repository";

describe("knowledge source repository", () => {
  it("keeps new claims pending until review", async () => {
    const repository = createMemoryKnowledgeSourceRepository("owner-1");
    const source = await repository.createSource("owner-1", { title: "Example paper", sourceType: "journal", url: "https://example.com/paper", doi: "10.0000/example", authors: "Author", publishedAt: null, license: null, notes: "" });
    const claim = await repository.createClaim("owner-1", { sourceId: source.id, taxonId: "cultivar-pink-princess", category: "tissue-culture", statement: "Example claim", evidenceState: "Adapted" });
    expect(claim.reviewState).toBe("Pending review");
    expect((await repository.reviewClaim("owner-1", claim.id, "Approved", "checked")).reviewedBy).toBe("owner-1");
  });

  it("rejects duplicate source URLs and DOIs", async () => {
    const repository = createMemoryKnowledgeSourceRepository("owner-1");
    await repository.createSource("owner-1", { title: "Example paper", sourceType: "journal", url: "https://example.com/paper", doi: "10.0000/example", authors: "Author", publishedAt: null, license: null, notes: "" });
    await expect(repository.createSource("owner-1", { title: "Same URL", sourceType: "journal", url: "https://example.com/paper/?utm_source=test", doi: null, authors: "", publishedAt: null, license: null, notes: "" })).rejects.toThrow("Source already registered");
    await expect(repository.createSource("owner-1", { title: "Same DOI", sourceType: "journal", url: "https://other.example/paper", doi: "https://doi.org/10.0000/example", authors: "", publishedAt: null, license: null, notes: "" })).rejects.toThrow("Source already registered");
  });
});
