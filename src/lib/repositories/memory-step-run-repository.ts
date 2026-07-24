import type { ProtocolStepRun } from "../domain/models";
import type { StepRunRepository } from "./step-run-repository";

export function createMemoryStepRunRepository(uid: string): StepRunRepository {
  const records = new Map<string, ProtocolStepRun>(); const guard = (ownerId: string) => { if (ownerId !== uid) throw new Error("Owner mismatch"); };
  return {
    async list(ownerId, lotId) { guard(ownerId); return structuredClone([...records.values()].filter((item) => item.lotId === lotId)); },
    async save(ownerId, input) { guard(ownerId); const id = input.lotId + ":" + input.stepId; const item: ProtocolStepRun = { ...structuredClone(input), id, ownerId: uid, updatedAt: new Date().toISOString() }; records.set(id, item); return structuredClone(item); },
  };
}
