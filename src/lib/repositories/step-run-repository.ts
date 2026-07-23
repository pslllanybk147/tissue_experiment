import type { ProtocolStepRun } from "../domain/models";

export type StepRunInput = Pick<ProtocolStepRun, "status" | "note" | "measurements" | "mediaIds" | "observedAt">;
export interface StepRunRepository {
  list(ownerId: string, lotId: string): Promise<ProtocolStepRun[]>;
  save(ownerId: string, run: Omit<ProtocolStepRun, "id" | "ownerId" | "updatedAt">): Promise<ProtocolStepRun>;
}
