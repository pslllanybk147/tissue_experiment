import Link from "next/link";

import type { ExperimentLot } from "@/lib/domain/models";

export type PlantExperimentSummaryItem = { lot: ExperimentLot; recordedSteps: number; passedSteps: number };

export function PlantExperimentSummary({ items }: { items: PlantExperimentSummaryItem[] }) {
  return <section className="experiment-surface plant-lot-summary"><div className="timeline-heading"><div><p className="eyebrow">EXPERIMENT HISTORY</p><h2>Experiment Lots ของต้นนี้</h2></div><Link className="quiet-button" href="/experiments/new">สร้าง Lot ใหม่</Link></div>{items.length ? <div className="record-list">{items.map(({ lot, recordedSteps, passedSteps }) => <Link className="record-row" href={`/experiments/${lot.id}`} key={lot.id}><div><strong>{lot.id}</strong><p>{lot.protocolTitle} · {lot.stage}</p><small>{passedSteps}/{recordedSteps || 0} ขั้นผ่าน · แก้ไขล่าสุด {new Date(lot.updatedAt).toLocaleDateString("th-TH")}</small></div><span>เปิด Lot · </span><span className={`badge badge-${lot.status.toLowerCase().replaceAll(" ", "-")}`}>{lot.status}</span></Link>)}</div> : <div className="empty-state"><h3>ยังไม่มี Experiment Lot</h3><p>เริ่ม Lot แรกจากต้นนี้เพื่อให้ระบบนำทางตาม Protocol</p><Link className="quiet-button" href="/experiments/new">เริ่ม Lot แรก</Link></div>}</section>;
}
