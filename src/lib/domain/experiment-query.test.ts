import { describe, expect, it } from "vitest";

import type { ExperimentLot } from "./models";
import { filterLots } from "./experiment-query";

const lots: ExperimentLot[] = [
  { id: "PPP-001", ownerId: "u1", plant: "Pink Princess", protocolId: "p1", protocolTitle: "Nodal", stage: "Establishment", status: "Healthy", startedAt: "2026-07-20", createdAt: "2026-07-20", updatedAt: "2026-07-20" },
  { id: "VIO-002", ownerId: "u1", plant: "Violin Variegated", protocolId: "p1", protocolTitle: "Nodal", stage: "Rinse", status: "Review", startedAt: "2026-07-22", createdAt: "2026-07-22", updatedAt: "2026-07-22" },
  { id: "PPP-003", ownerId: "u1", plant: "Pink Princess", protocolId: "p1", protocolTitle: "Nodal", stage: "Culture", status: "Contaminated", startedAt: "2026-07-21", createdAt: "2026-07-21", updatedAt: "2026-07-21" },
];

describe("filterLots", () => {
  it("searches lot id and plant case-insensitively", () => {
    expect(filterLots(lots, "vio", "All").map((lot) => lot.id)).toEqual(["VIO-002"]);
    expect(filterLots(lots, "pink princess", "All").map((lot) => lot.id)).toEqual(["PPP-003", "PPP-001"]);
  });

  it("combines search and status filters", () => {
    expect(filterLots(lots, "ppp", "Contaminated").map((lot) => lot.id)).toEqual(["PPP-003"]);
  });

  it("sorts newest started lots first without mutating input", () => {
    const original = lots.map((lot) => lot.id);
    expect(filterLots(lots, "", "All").map((lot) => lot.id)).toEqual(["VIO-002", "PPP-003", "PPP-001"]);
    expect(lots.map((lot) => lot.id)).toEqual(original);
  });
});
