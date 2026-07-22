import type { ExperimentLot, ExperimentStatus } from "./models";

export type LotStatusFilter = ExperimentStatus | "All";

export function filterLots(lots: ExperimentLot[], search: string, status: LotStatusFilter): ExperimentLot[] {
  const query = search.trim().toLocaleLowerCase();
  return [...lots]
    .filter((lot) => {
      const matchesQuery = !query
        || lot.id.toLocaleLowerCase().includes(query)
        || lot.plant.toLocaleLowerCase().includes(query);
      const matchesStatus = status === "All" || lot.status === status;
      return matchesQuery && matchesStatus;
    })
    .sort((left, right) => right.startedAt.localeCompare(left.startedAt));
}

export function lotAgeDays(startedAt: string, now = new Date()): number {
  const start = new Date(`${startedAt}T00:00:00Z`);
  if (Number.isNaN(start.getTime())) return 0;
  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  return Math.max(0, Math.floor((today - start.getTime()) / 86_400_000));
}
