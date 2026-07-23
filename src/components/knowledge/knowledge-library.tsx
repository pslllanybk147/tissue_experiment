"use client";

import { useMemo, useState } from "react";
import type { KnowledgeLibraryRecord } from "@/lib/domain/knowledge-library";

function evidenceClass(value: string) { return `evidence-label evidence-${value.toLowerCase().replaceAll(" ", "-")}`; }

export function KnowledgeLibrary({ records }: { records: KnowledgeLibraryRecord[] }) {
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const visible = useMemo(() => { const term = query.trim().toLowerCase(); return records.filter(({ taxon }) => !term || [taxon.scientificName, taxon.displayName, ...taxon.synonyms, ...taxon.commonNames].join(" ").toLowerCase().includes(term)); }, [query, records]);
  const selected = records.find(item => item.taxon.id === selectedId) ?? visible[0] ?? null;
  return <section className="knowledge-library" aria-label="Knowledge library">
    <div className="knowledge-toolbar"><label className="knowledge-search"><span>ค้น taxonomy, synonym หรือชื่อการค้า</span><input value={query} onChange={event => setQuery(event.target.value)} placeholder="เช่น Pink Princess หรือ bipennifolium" /></label><span className="muted-copy">{visible.length} รายการ</span></div>
    {!visible.length ? <div className="route-state">ยังไม่พบรายการ — ลองค้นด้วยชื่อวิทยาศาสตร์หรือชื่อการค้า</div> : <div className="knowledge-grid"><div className="knowledge-list">{visible.map(record => <button className={`knowledge-row ${selected?.taxon.id === record.taxon.id ? "active" : ""}`} key={record.taxon.id} onClick={() => setSelectedId(record.taxon.id)} type="button"><span><strong>{record.taxon.displayName}</strong><small>{record.taxon.scientificName} · {record.taxon.rank}</small></span><span className={evidenceClass(record.taxon.evidenceState)}>{record.taxon.evidenceState}</span></button>)}</div>{selected && <article className="knowledge-detail"><div className="knowledge-detail-heading"><div><p className="eyebrow">TAXON RECORD / {selected.taxon.rank}</p><h2>{selected.taxon.displayName}</h2><p>{selected.taxon.scientificName}</p></div><span className={evidenceClass(selected.taxon.evidenceState)}>{selected.taxon.evidenceState}</span></div><dl className="data-list"><dt>ชื่ออื่น</dt><dd>{[...selected.taxon.synonyms, ...selected.taxon.commonNames].join(", ") || "ยังไม่มี"}</dd><dt>Parent</dt><dd>{records.find(item => item.taxon.id === selected.taxon.parentId)?.taxon.displayName || "ระดับบนสุด"}</dd><dt>แหล่งอ้างอิง</dt><dd>{selected.taxon.sourceIds.length ? `${selected.taxon.sourceIds.length} sources` : "ยังไม่มี — ต้องทำ source review"}</dd></dl><div className="knowledge-section"><p className="eyebrow">BIOLOGY & EVIDENCE</p><h3>Claims ที่ตรวจแล้ว</h3>{selected.claims.length ? <ul>{selected.claims.map(claim => <li key={claim.id}>{claim.statement} <span className={evidenceClass(claim.evidenceState)}>{claim.evidenceState}</span></li>)}</ul> : <p className="muted-copy">ยังไม่มี claim ที่ผ่านการ review ระบบจะไม่เติมข้อมูลอัตโนมัติโดยไม่มี source</p>}</div><div className="knowledge-section"><p className="eyebrow">TISSUE CULTURE</p><h3>Playbook</h3>{selected.playbooks.length ? <ul>{selected.playbooks.map(playbook => <li key={playbook.id}>{playbook.method} · v{playbook.version} · {playbook.status}</li>)}</ul> : <p className="muted-copy">ยังไม่มี playbook ที่ publish สำหรับรายการนี้</p>}</div></article>}</div>}
  </section>;
}
