import { describe, expect, it } from "vitest";
import { findTaxonByName, starterTaxa } from "./knowledge-library";

describe("knowledge library foundation", () => {
  it("keeps taxonomy separate from cultivar and trade-name records", () => {
    expect(starterTaxa.find(item => item.id === "species-philodendron-erubescens")?.rank).toBe("species");
    expect(starterTaxa.find(item => item.id === "cultivar-pink-princess")?.parentId).toBe("species-philodendron-erubescens");
  });

  it("finds a taxon from scientific, display, synonym or common name", () => {
    expect(findTaxonByName(starterTaxa, "PPP")?.id).toBe("cultivar-pink-princess");
    expect(findTaxonByName(starterTaxa, "Philodendron bipennifolium")?.id).toBe("species-philodendron-bipennifolium");
  });
});
