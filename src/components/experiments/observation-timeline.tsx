import type { ReactNode } from "react";
import type { Observation } from "../../lib/domain/models";

type ObservationTimelineProps = { observations: Observation[]; onDelete: (id: string) => Promise<void>; onEdit: (item: Observation) => void; onRestore: (id: string) => Promise<void>; renderMedia?: (item: Observation) => ReactNode };
const metric = (value: number | null) => value === null ? "—" : String(value);
export function ObservationTimeline({ observations, onDelete, onEdit, onRestore, renderMedia }: ObservationTimelineProps) {
  if (!observations.length) return <div className="experiment-empty"><strong>ยังไม่มี Observation</strong><p>บันทึกการเปลี่ยนแปลงครั้งแรกของล็อตนี้</p></div>;
  return <div className="observation-timeline">{observations.map((item) => <article className={`observation-card ${item.deletedAt ? "deleted" : ""}`} key={item.id}>
    <div className="observation-meta"><time dateTime={item.observedAt}>{new Date(item.observedAt).toLocaleString("th-TH")}</time><span className={`badge badge-${item.status.toLowerCase().replaceAll(" ", "-")}`}>{item.status}</span></div>
    <h3>{item.stage}</h3><p>{item.note}</p>
    <dl><div><dt>ยอด</dt><dd>{metric(item.shootCount)}</dd></div><div><dt>ราก</dt><dd>{metric(item.rootCount)}</dd></div><div><dt>ปนเปื้อน</dt><dd>{metric(item.contaminationCount)}</dd></div></dl>
    {renderMedia?.(item)}
    <div className="observation-actions">{item.deletedAt ? <button className="quiet-button" onClick={() => void onRestore(item.id)}>กู้คืน</button> : <><button className="quiet-button" onClick={() => onEdit(item)}>แก้ไข</button><button className="quiet-button danger" onClick={() => void onDelete(item.id)}>ลบ</button></>}</div>
  </article>)}</div>;
}
