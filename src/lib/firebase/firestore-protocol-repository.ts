import { collection, doc, getDoc, getDocs, writeBatch, type Firestore } from "firebase/firestore";
import type { ProtocolRecord, ProtocolVersion } from "../domain/models";
import type { ProtocolAuditEvent, ProtocolRepository } from "../repositories/protocol-repository";
import { getFirebaseServices } from "./client";

export type ProtocolMutation = { protocol: ProtocolRecord; version: ProtocolVersion; audit: ProtocolAuditEvent };
export interface ProtocolPersistenceAdapter {
  listProtocols(): Promise<ProtocolRecord[]>; getProtocol(id: string): Promise<ProtocolRecord | null>;
  listVersions(id: string): Promise<ProtocolVersion[]>; commitMutation(mutation: ProtocolMutation): Promise<void>;
  listAuditEvents(id: string): Promise<ProtocolAuditEvent[]>;
}
type Options = { adapter?: ProtocolPersistenceAdapter; createId?: () => string; now?: () => string };

function firebaseAdapter(firestore: Firestore, uid: string): ProtocolPersistenceAdapter {
  const protocolRef = (id: string) => doc(firestore, "users", uid, "protocols", id);
  const versionRef = (id: string, versionId: string) => doc(firestore, "users", uid, "protocols", id, "versions", versionId);
  const auditRef = (id: string, eventId: string) => doc(firestore, "users", uid, "protocols", id, "audit", eventId);
  return {
    async listProtocols() { return (await getDocs(collection(firestore, "users", uid, "protocols"))).docs.map(item => item.data() as ProtocolRecord); },
    async getProtocol(id) { const snap = await getDoc(protocolRef(id)); return snap.exists() ? snap.data() as ProtocolRecord : null; },
    async listVersions(id) { return (await getDocs(collection(firestore, "users", uid, "protocols", id, "versions"))).docs.map(item => item.data() as ProtocolVersion); },
    async commitMutation(mutation) { const batch = writeBatch(firestore); batch.set(protocolRef(mutation.protocol.id), mutation.protocol); batch.set(versionRef(mutation.protocol.id, mutation.version.id), mutation.version); batch.set(auditRef(mutation.protocol.id, mutation.audit.id), mutation.audit); await batch.commit(); },
    async listAuditEvents(id) { return (await getDocs(collection(firestore, "users", uid, "protocols", id, "audit"))).docs.map(item => item.data() as ProtocolAuditEvent); },
  };
}

export function createFirestoreProtocolRepository(uid: string, options: Options = {}): ProtocolRepository {
  const services = options.adapter ? null : getFirebaseServices(); if (!options.adapter && !services) throw new Error("Firebase is not configured");
  const adapter = options.adapter ?? firebaseAdapter(services!.firestore, uid); const createId = options.createId ?? (() => crypto.randomUUID()); const now = options.now ?? (() => new Date().toISOString());
  const guard = (ownerId: string) => { if (ownerId !== uid) throw new Error("Owner mismatch"); };
  const audit = (protocolId: string, action: ProtocolAuditEvent["action"], before: unknown, after: unknown): ProtocolAuditEvent => ({ id: createId(), protocolId, ownerId: uid, action, occurredAt: now(), before: before as Record<string, unknown> | null, after: after as Record<string, unknown> | null });
  const required = async (id: string) => { const protocol = await adapter.getProtocol(id); if (!protocol) throw new Error("Protocol not found"); return protocol; };
  return {
    async list(ownerId, includeArchived = false) { guard(ownerId); return (await adapter.listProtocols()).filter(item => includeArchived || item.status !== "Archived"); },
    async get(ownerId, id) { guard(ownerId); const protocol = await adapter.getProtocol(id); return protocol ? { protocol, versions: await adapter.listVersions(id) } : null; },
    async createDraft(ownerId, input) { guard(ownerId); const timestamp = now(); const id = `protocol-${createId()}`; const versionId = `version-${createId()}`; const protocol: ProtocolRecord = { id, ownerId, title: input.title, slug: input.title.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "protocol", plantScope: input.plantScope, evidenceState: input.evidenceState, status: "Draft", currentVersionId: versionId, createdAt: timestamp, updatedAt: timestamp, deletedAt: null }; const version: ProtocolVersion = { id: versionId, protocolId: id, ownerId, version: "0.1.0", summary: input.summary, changeNote: input.changeNote, steps: structuredClone(input.steps), createdBy: ownerId, createdAt: timestamp, publishedAt: null }; await adapter.commitMutation({ protocol, version, audit: audit(id, "created", null, protocol) }); return protocol; },
    async saveDraftVersion(ownerId, id, versionId, input) { guard(ownerId); const protocol = await required(id); const current = (await adapter.listVersions(id)).find(item => item.id === versionId); if (!current) throw new Error("Protocol version not found"); if (current.publishedAt) throw new Error("Published versions are immutable"); const version = { ...current, summary: input.summary, changeNote: input.changeNote, steps: structuredClone(input.steps) }; await adapter.commitMutation({ protocol: { ...protocol, title: input.title, plantScope: input.plantScope, evidenceState: input.evidenceState, updatedAt: now() }, version, audit: audit(id, "updated", current, version) }); return version; },
    async activateVersion(ownerId, id, versionId) { guard(ownerId); const protocol = await required(id); const current = (await adapter.listVersions(id)).find(item => item.id === versionId); if (!current) throw new Error("Protocol version not found"); if (protocol.status === "Active" && protocol.currentVersionId === versionId && current.publishedAt) return protocol; const timestamp = now(); const next = { ...protocol, status: "Active" as const, currentVersionId: versionId, updatedAt: timestamp }; const version = { ...current, publishedAt: timestamp }; await adapter.commitMutation({ protocol: next, version, audit: audit(id, "activated", protocol, next) }); return next; },
    async archive(ownerId, id) { guard(ownerId); const protocol = await required(id); if (protocol.status === "Archived") return protocol; const version = (await adapter.listVersions(id)).find(item => item.id === protocol.currentVersionId); if (!version) throw new Error("Protocol version not found"); const next = { ...protocol, status: "Archived" as const, updatedAt: now() }; await adapter.commitMutation({ protocol: next, version, audit: audit(id, "archived", protocol, next) }); return next; },
    async listAuditEvents(ownerId, id) { guard(ownerId); return adapter.listAuditEvents(id); },
  };
}
