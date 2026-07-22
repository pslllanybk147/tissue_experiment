import { describe, expect, it } from "vitest";
import type { ProtocolDraftInput, ProtocolRecord, ProtocolVersion } from "../domain/models";
import type { ProtocolAuditEvent } from "../repositories/protocol-repository";
import { createFirestoreProtocolRepository, type ProtocolMutation, type ProtocolPersistenceAdapter } from "./firestore-protocol-repository";

const input: ProtocolDraftInput = { title: "Nodal", plantScope: "Philodendron", evidenceState: "Adapted", summary: "Summary", changeNote: "Initial", steps: [{ id: "s1", order: 0, title: "Wash", instruction: "Wash", durationMinutes: 10, criticalControls: [], safetyNotes: [], referenceIds: [], evidenceState: "Adapted" }] };

function harness() {
  let protocol: ProtocolRecord | null = null; let versions: ProtocolVersion[] = []; const mutations: ProtocolMutation[] = []; const audits: ProtocolAuditEvent[] = [];
  const adapter: ProtocolPersistenceAdapter = {
    listProtocols: async () => protocol ? [protocol] : [],
    getProtocol: async () => protocol,
    listVersions: async () => versions,
    commitMutation: async mutation => { mutations.push(mutation); protocol = mutation.protocol; versions = versions.filter(v => v.id !== mutation.version.id).concat(mutation.version); audits.push(mutation.audit); },
    listAuditEvents: async () => audits,
  };
  let id = 0;
  return { repository: createFirestoreProtocolRepository("owner-1", { adapter, createId: () => `id-${++id}`, now: () => "2026-07-22T00:00:00.000Z" }), mutations };
}

describe("Firestore protocol repository", () => {
  it("pairs protocol, version and audit in one mutation", async () => {
    const { repository, mutations } = harness(); const created = await repository.createDraft("owner-1", input);
    await repository.activateVersion("owner-1", created.id, created.currentVersionId);
    expect(mutations.map(item => item.audit.action)).toEqual(["created", "activated"]);
    expect(mutations[1].version.publishedAt).not.toBeNull();
  });

  it("rejects owner mismatch before persistence", async () => {
    await expect(harness().repository.list("owner-2")).rejects.toThrow("Owner mismatch");
  });
});
