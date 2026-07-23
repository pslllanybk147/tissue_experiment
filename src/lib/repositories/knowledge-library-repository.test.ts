import { describe, expect, it } from "vitest";
import { createMemoryKnowledgeLibraryRepository } from "./memory-knowledge-library-repository";

describe("knowledge library repository", () => {
  it("lists starter taxonomy and protects owner scope", async () => {
    const repository = createMemoryKnowledgeLibraryRepository("owner-1");
    expect((await repository.list("owner-1")).length).toBeGreaterThan(0);
    await expect(repository.list("owner-2")).rejects.toThrow("Owner mismatch");
  });
});
