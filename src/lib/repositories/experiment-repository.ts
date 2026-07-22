import type { AuditEvent, CreateLotInput, ExperimentLot, Observation, ObservationInput } from "@/lib/domain/models";

export interface ExperimentRepository {
  listLots(ownerId: string): Promise<ExperimentLot[]>;
  getLot(ownerId: string, lotId: string): Promise<ExperimentLot | null>;
  createLot(ownerId: string, input: CreateLotInput): Promise<ExperimentLot>;
  listObservations(ownerId: string, lotId: string, includeDeleted?: boolean): Promise<Observation[]>;
  createObservation(ownerId: string, lotId: string, input: ObservationInput): Promise<Observation>;
  updateObservation(ownerId: string, lotId: string, observationId: string, input: ObservationInput): Promise<Observation>;
  softDeleteObservation(ownerId: string, lotId: string, observationId: string): Promise<Observation>;
  restoreObservation(ownerId: string, lotId: string, observationId: string): Promise<Observation>;
  listAuditEvents(ownerId: string, lotId: string): Promise<AuditEvent[]>;
}
