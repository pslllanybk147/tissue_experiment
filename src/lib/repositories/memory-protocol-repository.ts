import type { ProtocolRecord, ProtocolVersion } from "../domain/models";
import type { KnowledgeSource, SourceClaim } from "../domain/knowledge-sources";
import { createPlaybookDraftInput } from "../domain/approved-claim-gate";
import { nextDraftVersion } from "../domain/protocol-versioning";
import type { ProtocolAuditEvent, ProtocolRepository } from "./protocol-repository";

const clone = <T,>(value: T): T => structuredClone(value);
const slugify = (value: string) => value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "protocol";

export function createMemoryProtocolRepository(uid: string): ProtocolRepository {
  const protocols = new Map<string, ProtocolRecord>();
  const versions = new Map<string, ProtocolVersion[]>();
  const audit = new Map<string, ProtocolAuditEvent[]>();
  const guard = (ownerId: string) => { if (ownerId !== uid) throw new Error("Owner mismatch"); };
  const event = (protocolId: string, action: ProtocolAuditEvent["action"], before: unknown, after: unknown) => {
    const item: ProtocolAuditEvent = { id: crypto.randomUUID(), protocolId, ownerId: uid, action, occurredAt: new Date().toISOString(), before: before as Record<string, unknown> | null, after: after as Record<string, unknown> | null };
    audit.set(protocolId, [...(audit.get(protocolId) ?? []), item]);
  };
  return {
    async list(ownerId, includeArchived = false) { guard(ownerId); return clone([...protocols.values()].filter(p => includeArchived || p.status !== "Archived")); },
    async get(ownerId, protocolId) { guard(ownerId); const protocol = protocols.get(protocolId); return protocol ? clone({ protocol, versions: versions.get(protocolId) ?? [] }) : null; },
    async createDraft(ownerId, input) {
      guard(ownerId); const now = new Date().toISOString(); const id = `protocol-${crypto.randomUUID()}`; const versionId = `version-${crypto.randomUUID()}`;
      const protocol: ProtocolRecord = { id, ownerId, title: input.title, slug: slugify(input.title), plantScope: input.plantScope, evidenceState: input.evidenceState, status: "Draft", currentVersionId: versionId, createdAt: now, updatedAt: now, deletedAt: null };
      const version: ProtocolVersion = { id: versionId, protocolId: id, ownerId, version: "0.1.0", summary: input.summary, changeNote: input.changeNote, steps: clone(input.steps), createdBy: ownerId, createdAt: now, publishedAt: null };
      protocols.set(id, protocol); versions.set(id, [version]); event(id, "created", null, protocol); return clone(protocol);
    },
    async createDraftFromClaim(ownerId, claim: SourceClaim, source: KnowledgeSource) {
      guard(ownerId); const input = createPlaybookDraftInput(claim, source); const now = new Date().toISOString(); const id = `protocol-${crypto.randomUUID()}`; const versionId = `version-${crypto.randomUUID()}`;
      const protocol: ProtocolRecord = { id, ownerId, title: input.title, slug: slugify(input.title), plantScope: input.plantScope, evidenceState: input.evidenceState, status: "Draft", currentVersionId: versionId, createdAt: now, updatedAt: now, deletedAt: null };
      const version: ProtocolVersion = { id: versionId, protocolId: id, ownerId, version: "0.1.0", summary: input.summary, changeNote: input.changeNote, steps: [], claimIds: input.claimIds, sourceIds: input.sourceIds, createdBy: ownerId, createdAt: now, publishedAt: null };
      protocols.set(id, protocol); versions.set(id, [version]); event(id, "created_from_claim", null, { protocol, version }); return clone(protocol);
    },
    async saveDraftVersion(ownerId, protocolId, versionId, input) {
      guard(ownerId); const protocol = protocols.get(protocolId); const items = versions.get(protocolId) ?? []; const current = items.find(v => v.id === versionId);
      if (!protocol || !current) throw new Error("Protocol not found");
      if (current.publishedAt) throw new Error("Published versions are immutable");
      const updated = { ...current, summary: input.summary, changeNote: input.changeNote, steps: clone(input.steps) }; versions.set(protocolId, items.map(v => v.id === versionId ? updated : v)); event(protocolId, "updated", current, updated); return clone(updated);
    },
    async createDraftVersion(ownerId, protocolId, sourceVersionId, changeNote) {
      guard(ownerId); const protocol = protocols.get(protocolId); const items = versions.get(protocolId) ?? []; const source = items.find(v => v.id === sourceVersionId);
      if (!protocol || !source) throw new Error("Protocol not found");
      const now = new Date().toISOString(); const draft: ProtocolVersion = { ...clone(source), id: `version-${crypto.randomUUID()}`, version: nextDraftVersion(source.version), changeNote, createdAt: now, createdBy: ownerId, publishedAt: null };
      const next = { ...protocol, status: "Draft" as const, currentVersionId: draft.id, updatedAt: now }; versions.set(protocolId, [...items, draft]); protocols.set(protocolId, next); event(protocolId, "version_created", source, draft); return clone(draft);
    },
    async activateVersion(ownerId, protocolId, versionId) {
      guard(ownerId); const protocol = protocols.get(protocolId); const items = versions.get(protocolId) ?? []; const current = items.find(v => v.id === versionId);
      if (!protocol || !current) throw new Error("Protocol not found");
      if (protocol.status === "Active" && protocol.currentVersionId === versionId && current.publishedAt) return clone(protocol);
      const now = new Date().toISOString(); const activated = { ...protocol, status: "Active" as const, currentVersionId: versionId, updatedAt: now }; versions.set(protocolId, items.map(v => v.id === versionId ? { ...v, publishedAt: now } : v)); protocols.set(protocolId, activated); event(protocolId, "activated", protocol, activated); return clone(activated);
    },
    async archive(ownerId, protocolId) { guard(ownerId); const current = protocols.get(protocolId); if (!current) throw new Error("Protocol not found"); if (current.status === "Archived") return clone(current); const next = { ...current, status: "Archived" as const, updatedAt: new Date().toISOString() }; protocols.set(protocolId, next); event(protocolId, "archived", current, next); return clone(next); },
    async listAuditEvents(ownerId, protocolId) { guard(ownerId); return clone(audit.get(protocolId) ?? []); },
  };
}
