import { createFirestoreKnowledgeSourceRepository } from "../firebase/firestore-knowledge-source-repository";
import { createMemoryKnowledgeSourceRepository } from "./memory-knowledge-source-repository";
import type { KnowledgeSourceRepository } from "./knowledge-source-repository";

const demos = new Map<string, KnowledgeSourceRepository>();
export function getKnowledgeSourceRepository(ownerId: string, authenticated: boolean): KnowledgeSourceRepository { if (authenticated) return createFirestoreKnowledgeSourceRepository(ownerId); const existing = demos.get(ownerId); if (existing) return existing; const repository = createMemoryKnowledgeSourceRepository(ownerId); demos.set(ownerId, repository); return repository; }
