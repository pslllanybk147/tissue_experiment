import { describe, expect, it } from "vitest";

import { createDemoLabRepository } from "./demo-lab-repository";

describe("demo lab repository", () => {
  it("returns only lots belonging to the requested owner", async () => {
    const repository = createDemoLabRepository();
    const lots = await repository.listLots("demo-owner");

    expect(lots.map((lot) => lot.id)).toEqual(["PPP-001", "VIO-001", "BLK-004"]);
    expect(lots.every((lot) => lot.ownerId === "demo-owner")).toBe(true);
    expect(lots[0]).toMatchObject({
      protocolId: "protocol-nodal-v01",
      protocolTitle: "Nodal establishment v0.1",
      startedAt: "2026-07-10",
    });
    expect(lots.every((lot) => Boolean(lot.createdAt && lot.updatedAt))).toBe(true);
  });

  it("advances protocol progress without exceeding the final step", async () => {
    const repository = createDemoLabRepository();

    const first = await repository.completeProtocolStep("demo-owner", "protocol-nodal-v01", 2);
    const final = await repository.completeProtocolStep("demo-owner", "protocol-nodal-v01", 99);

    expect(first.activeStepIndex).toBe(3);
    expect(final.activeStepIndex).toBe(5);
  });
});
