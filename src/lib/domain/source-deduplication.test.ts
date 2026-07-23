import { describe, expect, it } from "vitest";
import { canonicalSourceUrl, isDuplicateSource } from "./source-deduplication";

describe("source deduplication", () => {
  it("canonicalizes tracking parameters and trailing slash", () => {
    expect(canonicalSourceUrl("https://example.com/paper/?utm_source=test")).toBe("https://example.com/paper");
  });
  it("matches duplicate DOI before saving", () => {
    const source = { id: "source-1", ownerId: "owner", title: "Paper", sourceType: "journal" as const, url: "https://doi.org/10.1000/example", doi: "10.1000/example", authors: "", publishedAt: null, license: null, notes: "", createdAt: "", updatedAt: "" };
    expect(isDuplicateSource({ doi: "https://doi.org/10.1000/example", url: "https://other.example" }, [source])?.id).toBe("source-1");
  });
});
