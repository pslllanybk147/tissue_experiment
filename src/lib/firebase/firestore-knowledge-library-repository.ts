import { collection, doc, getDoc, getDocs, setDoc, type Firestore } from "firebase/firestore";
import { starterTaxa, type KnowledgeLibraryRecord } from "../domain/knowledge-library";
import type { KnowledgeLibraryRepository } from "../repositories/knowledge-library-repository";
import { getFirebaseServices } from "./client";

function adapter(db: Firestore, uid: string): KnowledgeLibraryRepository {
  const ref = (id: string) => doc(db, "users", uid, "knowledgeTaxa", id);
  return {
    async list(ownerId) {
      if (ownerId !== uid) throw new Error("Owner mismatch");
      const records = (await getDocs(collection(db, "users", uid, "knowledgeTaxa"))).docs.map(item => item.data() as KnowledgeLibraryRecord);
      return records.length ? records : starterTaxa.map(taxon => ({ taxon, claims: [], playbooks: [] }));
    },
    async get(ownerId, taxonId) {
      if (ownerId !== uid) throw new Error("Owner mismatch");
      const item = await getDoc(ref(taxonId));
      if (item.exists()) return item.data() as KnowledgeLibraryRecord;
      const fallback = starterTaxa.find(taxon => taxon.id === taxonId);
      return fallback ? { taxon: fallback, claims: [], playbooks: [] } : null;
    },
    async upsert(ownerId, taxon) {
      if (ownerId !== uid) throw new Error("Owner mismatch");
      const current = await this.get(ownerId, taxon.id);
      const record: KnowledgeLibraryRecord = { taxon, claims: current?.claims ?? [], playbooks: current?.playbooks ?? [] };
      await setDoc(ref(taxon.id), record);
      return record;
    },
  };
}

export function createFirestoreKnowledgeLibraryRepository(uid: string): KnowledgeLibraryRepository {
  const services = getFirebaseServices(); if (!services) throw new Error("Firebase is not configured"); return adapter(services.firestore, uid);
}
