import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import type { MediaRecipe } from "../../lib/domain/philodendron-knowledge";
import { MediaRecipeCalculator } from "./media-recipe-calculator";

const recipe: MediaRecipe = {
  id: "establishment",
  title: "Establishment",
  evidenceState: "Adapted",
  sourceIds: [],
  pH: "5.7–5.8",
  batchVolumes: [100, 250],
  ingredients: [
    { name: "Sucrose", amountPerLiter: 30, unit: "g/L" },
    { name: "BAP", amountPerLiter: 0.5, unit: "mg/L", note: "ใช้ stock solution" },
  ],
  note: "test",
};

describe("MediaRecipeCalculator", () => {
  it("shows an interactive jar-based batch plan and calculated ingredients", () => {
    const html = renderToStaticMarkup(<MediaRecipeCalculator recipes={[recipe]} />);
    expect(html).toContain("คำนวณสูตรจากจำนวนกระปุกจริง");
    expect(html).toContain("เตรียมอาหาร 138 mL สำหรับ 5 กระปุก");
    expect(html).toContain("4.14 g");
    expect(html).toContain("0.069 mg");
  });
});
