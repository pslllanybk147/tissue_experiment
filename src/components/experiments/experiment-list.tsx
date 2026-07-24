"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { filterLots, lotAgeDays } from "../../lib/domain/experiment-query";
import type { ExperimentLot, ExperimentStatus } from "../../lib/domain/models";

type ExperimentListProps = { lots: ExperimentLot[]; showDeleted?: boolean; onShowDeletedChange?: (value: boolean) => void; onDelete?: (lotId: string) => Promise<void>; onRestore?: (lotId: string) => Promise<void> };
type StatusFilter = ExperimentStatus | "All";

const statuses: StatusFilter[] = ["All", "Healthy", "Review", "At risk", "Contaminated"];

export function ExperimentList({ lots, showDeleted = false, onShowDeletedChange, onDelete, onRestore }: ExperimentListProps) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<StatusFilter>("All");
  const visibleLots = useMemo(() => filterLots(lots, search, status), [lots, search, status]);

  return (
    <section aria-labelledby="experiment-list-title" className="experiment-surface">
      <div className="experiment-toolbar">
        <div>
          <p className="eyebrow">LIVE EXPERIMENTS</p>
          <h2 id="experiment-list-title">Experiment Lots</h2>
        </div>
        <div className="route-actions"><label><input checked={showDeleted} onChange={(event) => onShowDeletedChange?.(event.target.checked)} type="checkbox" /> แสดงถังขยะ</label><Link className="primary-button" href="/experiments/new">สร้าง Lot ใหม่</Link></div>
      </div>
      <div className="experiment-filters">
        <label>Search lots<input aria-label="Search lots" onChange={(event) => setSearch(event.target.value)} placeholder="Lot ID หรือชื่อพืช" type="search" value={search} /></label>
        <label>สถานะ<select onChange={(event) => setStatus(event.target.value as StatusFilter)} value={status}>{statuses.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
      </div>
      {visibleLots.length === 0 ? (
        <div className="experiment-empty"><strong>ยังไม่มี Experiment Lot</strong><p>สร้างล็อตแรก หรือเปลี่ยนคำค้นและตัวกรองสถานะ</p></div>
      ) : (
        <div className="experiment-table-wrap">
          <table className="experiment-table">
            <thead><tr><th>Lot ID</th><th>พืช</th><th>Protocol</th><th>Stage</th><th>อายุ</th><th>สถานะ</th><th>การจัดการ</th></tr></thead>
            <tbody>{visibleLots.map((lot) => <tr key={lot.id}>
              <td data-label="Lot ID"><Link className="lot-link" href={`/experiments/${lot.id}`}>{lot.id}</Link></td>
              <td data-label="พืช">{lot.plant}</td><td data-label="Protocol">{lot.protocolTitle}</td><td data-label="Stage">{lot.stage}</td>
              <td data-label="อายุ">D+{lotAgeDays(lot.startedAt)}</td><td data-label="สถานะ">{lot.deletedAt ? <span className="badge badge-review">อยู่ในถังขยะ</span> : <span className={`badge badge-${lot.status.toLowerCase().replaceAll(" ", "-")}`}>{lot.status}</span>}</td>
              <td data-label="การจัดการ">{lot.deletedAt ? <button className="quiet-button" onClick={() => void onRestore?.(lot.id)} type="button">กู้คืน Lot</button> : <button className="quiet-button" onClick={() => void onDelete?.(lot.id)} type="button">เก็บเข้าถังขยะ</button>}</td>
            </tr>)}</tbody>
          </table>
        </div>
      )}
    </section>
  );
}
