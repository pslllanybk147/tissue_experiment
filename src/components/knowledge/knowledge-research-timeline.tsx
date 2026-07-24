"use client";

import { useState } from "react";
import type { KnowledgeLibraryRecord } from "@/lib/domain/knowledge-library";
import type { KnowledgeSource, SourceClaim, SourceClaimAuditEvent } from "@/lib/domain/knowledge-sources";

type Props = { sources: KnowledgeSource[]; claims: SourceClaim[]; claimAudits: SourceClaimAuditEvent[]; records: KnowledgeLibraryRecord[] };
type TimelineItem = { id: string; at: string; title: string; detail: string; state: string };

export function KnowledgeResearchTimeline({ sources, claims, claimAudits, records }: Props) {
  const [sourceFilter, setSourceFilter] = useState("");
  const [taxonFilter, setTaxonFilter] = useState("");
  const claimById = new Map(claims.map(claim => [claim.id, claim]));
  const filteredAudits = claimAudits.filter(audit => (!sourceFilter || audit.sourceId === sourceFilter) && (!taxonFilter || audit.taxonId === taxonFilter));
  const items: TimelineItem[] = sources.filter(source => !sourceFilter || source.id === sourceFilter).flatMap(source => [
    { id: `${source.id}-created`, at: source.createdAt, title: "ลงทะเบียน source", detail: source.title, state: "Source" },
    ...(source.updatedAt !== source.createdAt ? [{ id: `${source.id}-updated`, at: source.updatedAt, title: "แก้ไข source metadata", detail: source.title, state: "Source" }] : []),
  ]).concat(filteredAudits.map(audit => { const claim = claimById.get(audit.claimId); return { id: audit.id, at: audit.occurredAt, title: audit.action === "created" ? "สร้าง claim draft" : `ทบทวน claim: ${claim?.reviewState ?? "ไม่ทราบสถานะ"}`, detail: claim?.statement ?? audit.claimId, state: claim?.evidenceState ?? "Pending review" }; })).sort((a, b) => b.at.localeCompare(a.at)).slice(0, 12);

  return <section className="knowledge-timeline" aria-label="Research activity timeline"><div className="knowledge-section-heading"><div><p className="eyebrow">RESEARCH ACTIVITY</p><h2>ประวัติ source และ claim</h2><p>รวมการลงทะเบียน แก้ metadata สร้าง draft และ review ไว้ใน feed เดียว</p></div></div><div className="knowledge-timeline-filters"><label>Source<select value={sourceFilter} onChange={event => setSourceFilter(event.target.value)}><option value="">ทั้งหมด</option>{sources.map(source => <option key={source.id} value={source.id}>{source.title}</option>)}</select></label><label>Taxon<select value={taxonFilter} onChange={event => setTaxonFilter(event.target.value)}><option value="">ทั้งหมด</option>{records.map(record => <option key={record.taxon.id} value={record.taxon.id}>{record.taxon.displayName}</option>)}</select></label></div>{!items.length ? <p className="muted-copy">ยังไม่มี activity ตามตัวกรอง</p> : <ol>{items.map(item => <li key={item.id}><span className="knowledge-timeline-mark" aria-hidden="true" /><div><div className="knowledge-timeline-top"><strong>{item.title}</strong><span className="badge">{item.state}</span></div><p>{item.detail}</p><time dateTime={item.at}>{new Date(item.at).toLocaleString("th-TH")}</time></div></li>)}</ol>}</section>;
}
