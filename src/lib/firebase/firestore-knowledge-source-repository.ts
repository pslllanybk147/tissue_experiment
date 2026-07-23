import { collection, doc, getDocs, setDoc, type Firestore } from "firebase/firestore";
import type { KnowledgeSource, SourceClaim } from "../domain/knowledge-sources";
import { isDuplicateSource } from "../domain/source-deduplication";
import type { KnowledgeSourceInput, KnowledgeSourceRepository, SourceClaimInput } from "../repositories/knowledge-source-repository";
import { getFirebaseServices } from "./client";

function adapter(db: Firestore, uid: string): KnowledgeSourceRepository {
  const sourceCollection = collection(db, "users", uid, "knowledgeSources");
  const claimCollection = collection(db, "users", uid, "sourceClaims");
  return {
    async listSources(ownerId) { if (ownerId !== uid) throw new Error("Owner mismatch"); return (await getDocs(sourceCollection)).docs.map(item => item.data() as KnowledgeSource); },
    async createSource(ownerId, input: KnowledgeSourceInput) { if (ownerId !== uid) throw new Error("Owner mismatch"); const existing = (await getDocs(sourceCollection)).docs.map(item => item.data() as KnowledgeSource); if (isDuplicateSource(input, existing)) throw new Error("Source already registered"); const timestamp = new Date().toISOString(); const source: KnowledgeSource = { ...input, id: `source-${crypto.randomUUID()}`, ownerId: uid, createdAt: timestamp, updatedAt: timestamp }; await setDoc(doc(sourceCollection, source.id), source); return source; },
    async updateSource(ownerId, sourceId, input) { if (ownerId !== uid) throw new Error("Owner mismatch"); const existing = (await getDocs(sourceCollection)).docs.map(item => item.data() as KnowledgeSource); const current = existing.find(item => item.id === sourceId); if (!current) throw new Error("Source not found"); if (isDuplicateSource(input, existing.filter(item => item.id !== sourceId))) throw new Error("Source already registered"); const source: KnowledgeSource = { ...current, ...input, updatedAt: new Date().toISOString() }; await setDoc(doc(sourceCollection, source.id), source); return source; },
    async listClaims(ownerId) { if (ownerId !== uid) throw new Error("Owner mismatch"); return (await getDocs(claimCollection)).docs.map(item => item.data() as SourceClaim); },
    async createClaim(ownerId, input: SourceClaimInput) { if (ownerId !== uid) throw new Error("Owner mismatch"); if (!input.evidenceExcerpt?.trim()) throw new Error("Evidence excerpt required"); if (!input.evidenceLocation?.trim()) throw new Error("Evidence location required"); const timestamp = new Date().toISOString(); const claim: SourceClaim = { ...input, id: `claim-${crypto.randomUUID()}`, ownerId: uid, reviewState: "Pending review", reviewerNote: "", reviewedBy: null, reviewedAt: null, createdAt: timestamp, updatedAt: timestamp }; await setDoc(doc(claimCollection, claim.id), claim); return claim; },
    async reviewClaim(ownerId, claimId, reviewState, reviewerNote) { if (ownerId !== uid) throw new Error("Owner mismatch"); const timestamp = new Date().toISOString(); const ref = doc(claimCollection, claimId); const claim = (await getDocs(claimCollection)).docs.find(item => item.id === claimId); if (!claim) throw new Error("Claim not found"); const next: SourceClaim = { ...(claim.data() as SourceClaim), reviewState, reviewerNote, reviewedBy: uid, reviewedAt: timestamp, updatedAt: timestamp }; await setDoc(ref, next); return next; },
  };
}

export function createFirestoreKnowledgeSourceRepository(uid: string): KnowledgeSourceRepository { const services = getFirebaseServices(); if (!services) throw new Error("Firebase is not configured"); return adapter(services.firestore, uid); }
