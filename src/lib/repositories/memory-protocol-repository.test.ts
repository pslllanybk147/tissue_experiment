import { describe, expect, it } from "vitest";
import type { ProtocolDraftInput } from "../domain/models";
import { createMemoryProtocolRepository } from "./memory-protocol-repository";

const input: ProtocolDraftInput = {
  title: "Nodal establishment", plantScope: "Philodendron", evidenceState: "Adapted",
  summary: "Establish nodal tissue", changeNote: "Initial", steps: [{ id: "s1", order: 0, title: "Wash", instruction: "Wash explant", durationMinutes: 15, criticalControls: [], safetyNotes: [], referenceIds: [], evidenceState: "Adapted" }],
};

describe("memory protocol repository", () => {
  it("creates and activates an immutable version with audit events", async () => {
    const repository = createMemoryProtocolRepository("owner-1");
    const created = await repository.createDraft("owner-1", input);
    const active = await repository.activateVersion("owner-1", created.id, created.currentVersionId);
    expect(active.status).toBe("Active");
    await expect(repository.saveDraftVersion("owner-1", active.id, active.currentVersionId, input)).rejects.toThrow("Published versions are immutable");
    expect((await repository.listAuditEvents("owner-1", active.id)).map(event => event.action)).toEqual(["created", "activated"]);
  });

  it("keeps activation idempotent and protects owners", async () => {
    const repository = createMemoryProtocolRepository("owner-1");
    const created = await repository.createDraft("owner-1", input);
    await repository.activateVersion("owner-1", created.id, created.currentVersionId);
    await repository.activateVersion("owner-1", created.id, created.currentVersionId);
    expect(await repository.listAuditEvents("owner-1", created.id)).toHaveLength(2);
    await expect(repository.list("owner-2")).rejects.toThrow("Owner mismatch");
  });

  it("creates a new editable minor version from a published snapshot", async () => {
    const repository = createMemoryProtocolRepository("owner-1");
    const created = await repository.createDraft("owner-1", input);
    await repository.activateVersion("owner-1", created.id, created.currentVersionId);
    const draft = await repository.createDraftVersion("owner-1", created.id, created.currentVersionId, "Improve controls");
    expect(draft.version).toBe("0.2.0");
    expect(draft.publishedAt).toBeNull();
    expect(draft.steps).toEqual(input.steps);
    expect((await repository.listAuditEvents("owner-1", created.id)).map(event => event.action)).toContain("version_created");
  });
});
