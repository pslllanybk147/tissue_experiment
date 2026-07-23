import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { SEED_PLANT_PROFILES } from "../../lib/domain/plant-profile";
import { PlantCard } from "./plant-card";

describe("PlantCard", () => {
  it("renders cultivar name, difficulty, and provenance license badge", () => {
    const profile = SEED_PLANT_PROFILES[0];
    const html = renderToStaticMarkup(<PlantCard profile={profile} />);

    expect(html).toContain("Pink Princess");
    expect(html).toContain("Chimeric");
    expect(html).toContain("iNaturalist");
    expect(html).toContain("CC-BY 4.0");
  });
});
