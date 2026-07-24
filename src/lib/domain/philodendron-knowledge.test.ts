import { describe, expect, it } from "vitest";
import { philodendronTaxa, philodendronMonographs, plantPrefillForTaxon, validateKnowledgeContent } from "./philodendron-knowledge";

describe("Philodendron knowledge catalog", () => {
  it("keeps Pink Princess and Violin attached to their accepted species", () => {
    const pink = philodendronTaxa.find((taxon) => taxon.id === "cultivar-pink-princess");
    const violin = philodendronTaxa.find((taxon) => taxon.id === "trade-name-violin-variegated");
    expect(pink).toMatchObject({ rank: "cultivar", parentId: "species-philodendron-erubescens" });
    expect(violin).toMatchObject({ rank: "trade-name", parentId: "species-philodendron-bipennifolium" });
  });

  it("includes the versioned WCVP accepted-species catalog in the searchable records", () => {
    expect(philodendronTaxa.filter((taxon) => taxon.rank === "species").length).toBeGreaterThanOrEqual(628);
    expect(philodendronTaxa.some((taxon) => taxon.scientificName === "Philodendron fragrantissimum")).toBe(true);
  });

  it("provides four monograph sections and all 18 tissue-culture topics", () => {
    for (const monograph of philodendronMonographs) {
      expect(monograph.sections.map((section) => section.id)).toEqual(["taxonomy", "biology", "identification", "tissue-culture"]);
      expect(monograph.tissueCulture.steps).toHaveLength(18);
      expect(monograph.tissueCulture.steps.map((step) => step.id)).toContain("explant-cut-location");
      expect(monograph.tissueCulture.steps.map((step) => step.id)).toContain("medium-preparation");
      expect(monograph.tissueCulture.steps.map((step) => step.id)).toContain("surface-sterilization");
      expect(monograph.tissueCulture.mediaRecipes).toHaveLength(3);
      expect(monograph.tissueCulture.mediaRecipes[0].batchVolumes).toEqual([100, 250, 500, 1000]);
      expect(monograph.tissueCulture.mediaRecipes.flatMap((recipe) => recipe.ingredients.map((ingredient) => ingredient.unit))).toContain("mg/L");
      expect(monograph.tissueCulture.explantGuide.cutDiagram.length).toBeGreaterThan(0);
      expect(monograph.tissueCulture.explantGuide.sterilizationTrials.length).toBeGreaterThanOrEqual(2);
      expect(monograph.tissueCulture.explantGuide.sterilizationTrials.every((trial) => trial.evidenceState !== "Verified")).toBe(true);
    }
  });

  it("rejects Verified content without at least one source", () => {
    const errors = validateKnowledgeContent([{ evidenceState: "Verified", sourceIds: [] }]);
    expect(errors).toEqual(["Verified content requires at least one source"]);
  });

  it("prefills a Plant Record from the selected taxon without claiming cultivar certainty", () => {
    expect(plantPrefillForTaxon("cultivar-pink-princess")).toEqual({ taxonId: "cultivar-pink-princess", suspectedSpecies: "Pink Princess", identificationConfidence: "Medium" });
    expect(plantPrefillForTaxon("missing-taxon")).toBeNull();
  });
});
