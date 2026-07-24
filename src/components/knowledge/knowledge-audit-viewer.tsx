"use client";

import { useMemo, useState } from "react";
import type { KnowledgeLibraryRecord } from "@/lib/domain/knowledge-library";
import type { KnowledgeSource } from "@/lib/domain/knowledge-sources";

export type KnowledgeAuditItem = { id: string; entityType: "source" | "claim"; sourceId: string; taxonId?: string; action: string; occurredAt: string; before: Record<string, unknown> | null; after: Record<string, unknown> | null };
type Props = { sources: KnowledgeSource[]; records: KnowledgeLibraryRecord[]; events: KnowledgeAuditItem[] };

const actionLabels: Record<string, string> = { created: "สร้าง", updated: "แก้ไข metadata", reviewed: "review claim" };

export function KnowledgeAuditViewer({ sources, records, events }: Props) {
  const [sourceFilter, setSourceFilter] = useState("");
  const [taxonFilter, setTaxonFilter] = useState("");
  const filtered = useMemo(() => events.filter(event => (!sourceFilter || event.sourceId === sourceFilter) && (!taxonFilter || event.taxonId === taxonFilter)).sort((a, b) => b.occurredAt.localeCompare(a.occurredAt)), [events, sourceFilter, taxonFilter]);
  return <section className="knowledge-audit-viewer" aria-label="Knowledge audit viewer"><div className="knowledge-section-heading"><div><p className="eyebrow">AUDIT EXPLORER</p><h2>กรอง audit</h2><p>ตรวจการเปลี่ยนแปลง source และ claim พร้อม before / after</p></div></div><div className="knowledge-audit-filters"><label>Source<select value={sourceFilter} onChange={event => setSourceFilter(event.target.value)}><option value="">ทั้งหมด</option>{sources.map(source => <option key={source.id} value={source.id}>{source.title}</option>)}</select></label><label>Taxon<select value={taxonFilter} onChange={event => setTaxonFilter(event.target.value)}><option value="">ทั้งหมด</option>{records.map(record => <option key={record.taxon.id} value={record.taxon.id}>{record.taxon.displayName}</option>)}</select></label></div>{!filtered.length ? <p className="muted-copy">ไม่พบ audit ตามตัวกรอง</p> : <ol className="knowledge-audit-list">{filtered.map(event => <li key={event.id}><div className="knowledge-audit-row"><div><strong>{actionLabels[event.action] ?? event.action}</strong><small>{event.entityType} · {sources.find(source => source.id === event.sourceId)?.title ?? event.sourceId}</small><time dateTime={event.occurredAt}>{new Date(event.occurredAt).toLocaleString("th-TH")}</time></div><span className="badge">{event.taxonId ? records.find(record => record.taxon.id === event.taxonId)?.taxon.displayName ?? event.taxonId : "Source"}</span></div>{(event.before || event.after) && <details><summary>ดู before / after</summary><pre>{JSON.stringify({ before: event.before, after: event.after }, null, 2)}</pre></details>}</li>)}</ol>}</section>;
}
