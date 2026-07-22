import { createMemoryProtocolRepository } from "./memory-protocol-repository";
import type { ProtocolRepository } from "./protocol-repository";
import { createFirestoreProtocolRepository } from "../firebase/firestore-protocol-repository";

const demos = new Map<string, ProtocolRepository>();

export function getProtocolRepository(ownerId: string, authenticated: boolean): ProtocolRepository {
  if (authenticated) return createFirestoreProtocolRepository(ownerId);
  const existing = demos.get(ownerId); if (existing) return existing;
  const repository = createMemoryProtocolRepository(ownerId); demos.set(ownerId, repository); return repository;
}
