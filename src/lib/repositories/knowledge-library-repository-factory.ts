import { createFirestoreKnowledgeLibraryRepository } from "../firebase/firestore-knowledge-library-repository";
import { createMemoryKnowledgeLibraryRepository } from "./memory-knowledge-library-repository";
import type { KnowledgeLibraryRepository } from "./knowledge-library-repository";

const demos = new Map<string, KnowledgeLibraryRepository>();
export function getKnowledgeLibraryRepository(ownerId: string, authenticated: boolean): KnowledgeLibraryRepository {
  if (authenticated) return createFirestoreKnowledgeLibraryRepository(ownerId);
  const existing = demos.get(ownerId); if (existing) return existing;
  const repository = createMemoryKnowledgeLibraryRepository(ownerId); demos.set(ownerId, repository); return repository;
}
