import { describe, expect, it } from "vitest";
import { createMemoryProtocolProgressRepository } from "./memory-protocol-progress-repository";

describe("protocol progress repository", () => {
  it("completes and reopens a step idempotently", async () => {
    const repo = createMemoryProtocolProgressRepository("o1");
    await repo.complete("o1", "lot1", "p1", "v1", "s1", "done"); await repo.complete("o1", "lot1", "p1", "v1", "s1", "done");
    expect((await repo.list("o1", "lot1"))[0].state).toBe("Completed"); expect(await repo.listAuditEvents("o1", "lot1")).toHaveLength(1);
    await repo.reopen("o1", "lot1", "s1"); expect((await repo.list("o1", "lot1"))[0].state).toBe("Pending");
  });
});
