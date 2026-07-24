import Link from "next/link";

import type { ExperimentLot } from "@/lib/domain/models";
import { protocolTemplates } from "../../lib/domain/protocol-templates";

export type PlantExperimentSummaryItem = { lot: ExperimentLot; recordedSteps: number; passedSteps: number };

export function PlantExperimentSummary({ items, plantId }: { items: PlantExperimentSummaryItem[]; plantId?: string }) {
  const createLotHref = plantId ? `/experiments/new?plantId=${encodeURIComponent(plantId)}` : "/experiments/new";
  return <section className="experiment-surface plant-lot-summary"><div className="timeline-heading"><div><p className="eyebrow">EXPERIMENT HISTORY</p><h2>Experiment Lots ของต้นนี้</h2><p>Protocol ที่ใช้จริงและความคืบหน้าจะรวมอยู่ที่นี่</p></div><Link className="quiet-button" href={createLotHref}>สร้าง Lot ใหม่</Link></div>{items.length ? <div className="record-list">{items.map(({ lot, recordedSteps, passedSteps }) => { const template = protocolTemplates.find((item) => item.id === lot.templateId); return <Link className="record-row" href={`/experiments/${lot.id}`} key={lot.id}><div><strong>{lot.id}</strong><p>{lot.protocolTitle} · {lot.protocolVersionId ?? "ไม่ระบุ version"}</p><small>{template?.title ?? lot.method ?? "ไม่ระบุ template"} · {template?.evidenceState ?? "Pending review"}</small><small>{passedSteps}/{recordedSteps || 0} ขั้นผ่าน · แก้ไขล่าสุด {new Date(lot.updatedAt).toLocaleDateString("th-TH")}</small></div><span>เปิด Lot · </span><span className={`badge badge-${lot.status.toLowerCase().replaceAll(" ", "-")}`}>{lot.status}</span></Link>; })}</div> : <div className="empty-state"><h3>ยังไม่มี Experiment Lot</h3><p>เริ่ม Lot แรกจากต้นนี้เพื่อให้ระบบนำทางตาม Protocol</p><Link className="quiet-button" href={createLotHref}>เริ่ม Lot แรก</Link></div>}</section>;
}
