import type { ProtocolDraftInput, ProtocolRecord, ProtocolVersion } from "../domain/models";
import type { KnowledgeSource, SourceClaim } from "../domain/knowledge-sources";

export type ProtocolAuditEvent = { id: string; protocolId: string; ownerId: string; action: "created" | "created_from_claim" | "updated" | "version_created" | "activated" | "archived"; occurredAt: string; before: Record<string, unknown> | null; after: Record<string, unknown> | null };

export interface ProtocolRepository {
  list(ownerId: string, includeArchived?: boolean): Promise<ProtocolRecord[]>;
  get(ownerId: string, protocolId: string): Promise<{ protocol: ProtocolRecord; versions: ProtocolVersion[] } | null>;
  createDraft(ownerId: string, input: ProtocolDraftInput): Promise<ProtocolRecord>;
  createDraftFromClaim(ownerId: string, claim: SourceClaim, source: KnowledgeSource): Promise<ProtocolRecord>;
  saveDraftVersion(ownerId: string, protocolId: string, versionId: string, input: ProtocolDraftInput): Promise<ProtocolVersion>;
  createDraftVersion(ownerId: string, protocolId: string, sourceVersionId: string, changeNote: string): Promise<ProtocolVersion>;
  activateVersion(ownerId: string, protocolId: string, versionId: string): Promise<ProtocolRecord>;
  archive(ownerId: string, protocolId: string): Promise<ProtocolRecord>;
  listAuditEvents(ownerId: string, protocolId: string): Promise<ProtocolAuditEvent[]>;
}
