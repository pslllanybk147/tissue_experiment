import type { ExperimentLot, Protocol, ResearchSource } from "@/lib/domain/models";

export type LabSnapshot = {
  lots: ExperimentLot[];
  protocol: Protocol;
  research: ResearchSource[];
};

export interface LabRepository {
  getSnapshot(ownerId: string): Promise<LabSnapshot>;
  listLots(ownerId: string): Promise<ExperimentLot[]>;
  completeProtocolStep(ownerId: string, protocolId: string, activeStepIndex: number): Promise<Protocol>;
}
