import type { AuditEvent } from "../../lib/domain/models";
type AuditHistoryProps = { events: AuditEvent[] };
const actionLabels: Record<string, string> = { dataset_queued: "ส่งเข้า Image review" };

export function AuditHistory({ events }: AuditHistoryProps) {
  if (!events.length) return <p className="audit-empty">ยังไม่มีประวัติการแก้ไข</p>;
  return <ol className="audit-list">{events.map((event) => <li key={event.id}><div><strong>{actionLabels[event.action] || event.action}</strong><time dateTime={event.occurredAt}>{new Date(event.occurredAt).toLocaleString("th-TH")}</time></div><small>{event.entityType} · {event.entityId}</small>{(event.action === "updated" || event.action === "dataset_queued") && <details><summary>ดู before / after</summary><pre>{JSON.stringify({ before: event.before, after: event.after }, null, 2)}</pre></details>}</li>)}</ol>;
}
