import type { ExperimentLot, ExperimentStatus } from "./models";

type LegacyLot = Partial<ExperimentLot> & { day?: number; protocol?: string };
const statuses: ExperimentStatus[] = ["Healthy", "Review", "At risk", "Contaminated"];
const stringValue = (value: unknown, fallback: string) => typeof value === "string" && value.trim() ? value : fallback;

export function normalizeExperimentLot(input: LegacyLot, now = new Date()): ExperimentLot {
  const day = Number.isFinite(input.day) ? Math.max(0, Math.floor(input.day!)) : 0;
  const fallbackStartedAt = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - day)).toISOString().slice(0, 10);
  const timestamp = now.toISOString();
  return {
    id: stringValue(input.id, "UNKNOWN"), ownerId: stringValue(input.ownerId, "unknown-owner"), plant: stringValue(input.plant, "Unknown plant"),
    protocolId: stringValue(input.protocolId, "protocol-nodal-v01"), protocolTitle: stringValue(input.protocolTitle, stringValue(input.protocol, "Unspecified protocol")),
    stage: stringValue(input.stage, "Unspecified"), status: statuses.includes(input.status as ExperimentStatus) ? input.status as ExperimentStatus : "Review",
    startedAt: stringValue(input.startedAt, fallbackStartedAt), createdAt: stringValue(input.createdAt, timestamp), updatedAt: stringValue(input.updatedAt, timestamp),
  };
}
