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
