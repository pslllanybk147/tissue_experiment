import { describe, expect, it } from "vitest";
import { extractOpenAlexId, extractPubMedId, normalizeDoi } from "./source-discovery";

describe("source discovery identifiers", () => {
  it("normalizes DOI forms", () => {
    expect(normalizeDoi("https://doi.org/10.1000/example.")).toBe("10.1000/example");
    expect(normalizeDoi("not-a-doi")).toBeNull();
  });
  it("extracts supported database identifiers", () => {
    expect(extractPubMedId("https://pubmed.ncbi.nlm.nih.gov/12345678/")).toBe("12345678");
    expect(extractOpenAlexId("https://openalex.org/W123456789")).toBe("W123456789");
  });
});
