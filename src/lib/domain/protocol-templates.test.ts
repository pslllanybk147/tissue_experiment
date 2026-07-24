import { describe, expect, it } from "vitest";
import { protocolTemplates, stepsForTemplate, templateIdForTaxon } from "./protocol-templates";

describe("guided protocol templates", () => {
  it("contains a beginner path for each supported scope", () => {
    expect(protocolTemplates).toHaveLength(3);
    expect(stepsForTemplate("template-generic-philodendron")).toHaveLength(13);
    expect(stepsForTemplate("template-generic-philodendron")[0]).toMatchObject({ title: "รับต้นไม้และบันทึก baseline", objective: expect.any(String), passCriteria: expect.any(Array) });
  });

  it("marks direct Pink Princess evidence without upgrading the fallback", () => {
    expect(stepsForTemplate("template-pink-princess-nodal")).toHaveLength(18);
    expect(stepsForTemplate("template-pink-princess-nodal").some((step) => step.referenceIds.includes("source-pp-2023"))).toBe(true);
    expect(stepsForTemplate("template-violin-nodal")).toHaveLength(18);
    expect(stepsForTemplate("template-violin-nodal").every((step) => step.evidenceState !== "Verified")).toBe(true);
  });

  it("selects a stable template from a Taxon relation", () => {
    expect(templateIdForTaxon("cultivar-pink-princess")).toBe("template-pink-princess-nodal");
    expect(templateIdForTaxon("trade-name-violin-variegated")).toBe("template-violin-nodal");
    expect(templateIdForTaxon("unknown-taxon")).toBe("template-generic-philodendron");
  });
});
