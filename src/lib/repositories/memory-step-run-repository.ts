import type { ProtocolStepRun } from "../domain/models";
import type { StepRunRepository } from "./step-run-repository";
import { demoStorageKey, readDemoState, writeDemoState } from "./demo-storage";

export function createMemoryStepRunRepository(uid: string): StepRunRepository {
  const storageKey = demoStorageKey(uid, "step-runs");
  const records = new Map<string, ProtocolStepRun>(readDemoState<ProtocolStepRun[]>(storageKey, []).map((item) => [item.id, item])); const guard = (ownerId: string) => { if (ownerId !== uid) throw new Error("Owner mismatch"); };
  return {
    async list(ownerId, lotId) { guard(ownerId); return structuredClone([...records.values()].filter((item) => item.lotId === lotId)); },
    async save(ownerId, input) { guard(ownerId); const id = input.lotId + ":" + input.stepId; const item: ProtocolStepRun = { ...structuredClone(input), id, ownerId: uid, updatedAt: new Date().toISOString() }; records.set(id, item); writeDemoState(storageKey, [...records.values()]); return structuredClone(item); },
  };
}
