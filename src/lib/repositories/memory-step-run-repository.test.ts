import { describe, expect, it } from "vitest";
import { createMemoryStepRunRepository } from "./memory-step-run-repository";

describe("memory step-run typed responses", () => {
  it("บันทึกและอ่าน responses กลับโดยยังเก็บ measurements สำหรับข้อมูลเก่า", async () => {
    const repository = createMemoryStepRunRepository("typed-owner");
    await repository.save("typed-owner", {
      lotId: "lot-typed",
      protocolId: "violin-variegated",
      versionId: "v2",
      stepId: "sterilize",
      status: "Passed",
      note: "",
      measurements: { "actual-ppm": 300 },
      responses: { "actual-ppm": 300, batch: "N60-A", date: "2026-08-09", "final-rinse": true },
      mediaIds: [],
      observedAt: "2026-08-09T10:00:00.000Z",
    });

    expect((await repository.list("typed-owner", "lot-typed"))[0]).toMatchObject({
      measurements: { "actual-ppm": 300 },
      responses: { "actual-ppm": 300, batch: "N60-A", date: "2026-08-09", "final-rinse": true },
    });
  });
});
