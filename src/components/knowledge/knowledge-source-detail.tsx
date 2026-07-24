"use client";

import Link from "next/link";
import { useState } from "react";
import type { KnowledgeSource, KnowledgeSourceAuditEvent, SourceClaim } from "@/lib/domain/knowledge-sources";
import type { KnowledgeSourceInput } from "@/lib/repositories/knowledge-source-repository";

type Props = {
  source: KnowledgeSource;
  claims: SourceClaim[];
  audits: KnowledgeSourceAuditEvent[];
  updateSource: (input: KnowledgeSourceInput) => Promise<void>;
};

export function KnowledgeSourceDetail({ source, claims, audits, updateSource }: Props) {
  const [form, setForm] = useState<KnowledgeSourceInput>({ title: source.title, sourceType: source.sourceType, url: source.url, doi: source.doi, authors: source.authors, publishedAt: source.publishedAt, license: source.license, notes: source.notes });
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    setError("");
    try {
      await updateSource(form);
      setMessage("อัปเดต metadata ของ source แล้ว");
    } catch (reason) {
      setError(reason instanceof Error && reason.message === "Source already registered" ? "DOI หรือ URL นี้ซ้ำกับ source อื่นใน registry" : "อัปเดต source ไม่สำเร็จ");
    } finally {
      setBusy(false);
    }
  }

  return <section className="knowledge-source-detail" aria-label="Knowledge source detail">
    <div className="route-actions"><Link className="quiet-button" href="/knowledge">← กลับ Knowledge Library</Link><a className="secondary-button" href={source.url} target="_blank" rel="noreferrer">เปิด source ต้นฉบับ</a></div>
    <header className="knowledge-detail-heading"><div><p className="eyebrow">SOURCE DETAIL · {source.sourceType}</p><h2>{source.title}</h2><p>{source.doi ?? "ไม่มี DOI"} · สร้างเมื่อ {new Date(source.createdAt).toLocaleDateString("th-TH")}</p></div><span className="badge badge-pending-review">metadata แก้ไขได้</span></header>
    {message && <p className="dataset-feedback success" role="status">{message}</p>}
    {error && <p className="dataset-feedback error" role="alert">{error}</p>}
    <div className="knowledge-source-detail-grid">
      <form className="knowledge-form" onSubmit={submit}>
        <h3>แก้ไข metadata</h3>
        <label>ชื่อแหล่งข้อมูล<input required value={form.title} onChange={event => setForm({ ...form, title: event.target.value })} /></label>
        <label>URL<input required type="url" value={form.url} onChange={event => setForm({ ...form, url: event.target.value })} /></label>
        <label>DOI<input value={form.doi ?? ""} onChange={event => setForm({ ...form, doi: event.target.value || null })} /></label>
        <label>ประเภท<select value={form.sourceType} onChange={event => setForm({ ...form, sourceType: event.target.value as KnowledgeSource["sourceType"] })}><option value="journal">Journal</option><option value="database">Database</option><option value="website">Website</option><option value="book">Book</option><option value="user-note">User note</option></select></label>
        <label>ผู้เขียน<input value={form.authors} onChange={event => setForm({ ...form, authors: event.target.value })} /></label>
        <label>วันที่เผยแพร่<input type="date" value={form.publishedAt ?? ""} onChange={event => setForm({ ...form, publishedAt: event.target.value || null })} /></label>
        <label>License<input value={form.license ?? ""} onChange={event => setForm({ ...form, license: event.target.value || null })} /></label>
        <label>หมายเหตุ<textarea value={form.notes} onChange={event => setForm({ ...form, notes: event.target.value })} /></label>
        <button className="primary-button" disabled={busy} type="submit">{busy ? "กำลังบันทึก…" : "บันทึก metadata"}</button>
      </form>
      <aside className="knowledge-source-claims"><p className="eyebrow">LINKED CLAIMS</p><h3>Claims ที่อ้าง source นี้ ({claims.length})</h3>{!claims.length ? <p className="muted-copy">ยังไม่มี claim ที่เชื่อมกับ source นี้</p> : claims.map(claim => <article className="knowledge-source-claim" key={claim.id}><div className="claim-row-heading"><strong>{claim.statement}</strong><span className={claim.reviewState === "Approved" ? "dataset-status approved" : claim.reviewState === "Rejected" ? "dataset-status rejected" : "dataset-status pending"}>{claim.reviewState}</span></div><p>{claim.evidenceExcerpt ?? "ไม่มี excerpt รุ่นเก่า"}</p><small>ตำแหน่ง: {claim.evidenceLocation ?? "ยังไม่ระบุ"} · Evidence: {claim.evidenceState}</small><Link href={`/knowledge?claim=${claim.id}`}>เปิดใน claim review →</Link></article>)}<div className="knowledge-source-audit"><p className="eyebrow">AUDIT HISTORY</p><h3>ประวัติ metadata ({audits.length})</h3>{!audits.length ? <p className="muted-copy">ยังไม่มี audit</p> : audits.slice().reverse().map(event => <article key={event.id}><strong>{event.action === "updated" ? "แก้ไข metadata" : "สร้าง source"}</strong><time dateTime={event.occurredAt}>{new Date(event.occurredAt).toLocaleString("th-TH")}</time>{event.action === "updated" && <details><summary>ดู before / after</summary><pre>{JSON.stringify({ before: event.before, after: event.after }, null, 2)}</pre></details>}</article>)}</div></aside>
    </div>
  </section>;
}
