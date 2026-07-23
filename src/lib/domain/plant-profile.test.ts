import { describe, expect, it } from "vitest";
import { MemoryPlantProfileRepository } from "./plant-profile";

describe("MemoryPlantProfileRepository", () => {
  it("returns all seeded plant profiles", async () => {
    const repo = new MemoryPlantProfileRepository();
    const profiles = await repo.listProfiles();
    expect(profiles.length).toBeGreaterThan(0);
    expect(profiles[0]).toHaveProperty("cultivarName");
    expect(profiles[0]).toHaveProperty("licenseInfo");
  });

  it("filters plant profiles by difficulty and search term", async () => {
    const repo = new MemoryPlantProfileRepository();
    const result = await repo.listProfiles({ difficulty: "High", search: "Princess" });
    expect(result.every(p => p.tcDifficulty === "High")).toBe(true);
    expect(result.every(p => p.cultivarName.includes("Princess"))).toBe(true);
  });

  it("retrieves a plant profile by id", async () => {
    const repo = new MemoryPlantProfileRepository();
    const all = await repo.listProfiles();
    const first = all[0];
    const found = await repo.getProfileById(first.id);
    expect(found).toEqual(first);
  });
});
