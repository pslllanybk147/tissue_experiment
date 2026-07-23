"use client";

import { useState } from "react";
import type { KnowledgeLibraryRecord } from "@/lib/domain/knowledge-library";
import type { KnowledgeSource, SourceClaim } from "@/lib/domain/knowledge-sources";
import { isDuplicateSource } from "../../lib/domain/source-deduplication";
import type { DiscoveredSourceMetadata } from "@/lib/domain/source-discovery";

type Props = {
  records: KnowledgeLibraryRecord[];
  sources: KnowledgeSource[];
  claims: SourceClaim[];
  onCreateSource: (input: Omit<KnowledgeSource, "id" | "ownerId" | "createdAt" | "updatedAt">) => Promise<void>;
  onCreateClaim: (input: Omit<SourceClaim, "id" | "ownerId" | "createdAt" | "updatedAt" | "reviewState" | "reviewerNote" | "reviewedBy" | "reviewedAt">) => Promise<void>;
  onReviewClaim: (id: string, state: "Approved" | "Rejected", note: string) => Promise<void>;
  onDiscover: (identifier: string) => Promise<DiscoveredSourceMetadata>;
};

export function KnowledgeSourceRegister({ records, sources, claims, onCreateSource, onCreateClaim, onReviewClaim, onDiscover }: Props) {
  const [source, setSource] = useState({ title: "", url: "", doi: "", authors: "", sourceType: "journal" as KnowledgeSource["sourceType"], publishedAt: "", license: "", notes: "" });
  const [identifier, setIdentifier] = useState("");
  const [discovering, setDiscovering] = useState(false);
  const [discoveryError, setDiscoveryError] = useState("");
  const [claim, setClaim] = useState({ sourceId: "", taxonId: records[0]?.taxon.id ?? "", category: "tissue-culture" as SourceClaim["category"], statement: "", evidenceExcerpt: "", evidenceLocation: "", evidenceState: "Adapted" as SourceClaim["evidenceState"] });
  const [evidenceAuthorized, setEvidenceAuthorized] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  const duplicate = source.url.trim() ? isDuplicateSource({ doi: source.doi || null, url: source.url }, sources) : null;

  async function submitSource(event: React.FormEvent) {
    event.preventDefault();
    if (duplicate) return;
    setBusy(true);
    try {
      await onCreateSource({ ...source, doi: source.doi || null, publishedAt: source.publishedAt || null, license: source.license || null });
      setSource(current => ({ ...current, title: "", url: "", doi: "", authors: "", notes: "" }));
      setMessage("บันทึก source แล้ว");
      setDiscoveryError("");
    } catch (error) {
      setDiscoveryError(error instanceof Error && error.message === "Source already registered" ? "แหล่งอ้างอิงนี้มีอยู่แล้วใน registry — ตรวจ DOI หรือ URL ก่อนบันทึก" : "บันทึก source ไม่สำเร็จ");
    } finally {
      setBusy(false);
    }
  }

  async function discover() {
    setDiscovering(true);
    setDiscoveryError("");
    try {
      const metadata = await onDiscover(identifier);
      setSource(current => ({ ...current, title: metadata.title, url: metadata.url, doi: metadata.doi ?? current.doi, authors: metadata.authors, sourceType: metadata.sourceType, publishedAt: metadata.publishedAt ?? "" }));
      setMessage(`ดึง metadata จาก ${metadata.provider} แล้ว — ตรวจข้อมูลก่อนบันทึก`);
    } catch (error) {
      setDiscoveryError(error instanceof Error ? error.message : "ดึง metadata ไม่สำเร็จ");
    } finally {
      setDiscovering(false);
    }
  }

  async function submitClaim(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    try {
      if (!evidenceAuthorized) { setDiscoveryError("ยืนยันก่อนว่า excerpt นี้มาจาก source ที่คุณมีสิทธิ์ใช้"); return; }
      await onCreateClaim(claim);
      setClaim(current => ({ ...current, statement: "", evidenceExcerpt: "", evidenceLocation: "" }));
      setEvidenceAuthorized(false);
      setMessage("บันทึก claim draft แล้ว — รอ review");
      setDiscoveryError("");
    } catch (error) {
      setDiscoveryError(error instanceof Error && error.message === "Evidence excerpt required" ? "ต้องมีข้อความจาก source ก่อนสร้าง claim draft" : error instanceof Error && error.message === "Evidence location required" ? "ต้องระบุตำแหน่งของหลักฐาน เช่น หน้า, section, ตาราง หรือย่อหน้า" : "บันทึก claim draft ไม่สำเร็จ");
    } finally {
      setBusy(false);
    }
  }

  return <section className="knowledge-sources" aria-label="Knowledge source registry">
    <div className="knowledge-section-heading"><div><p className="eyebrow">EVIDENCE PIPELINE</p><h2>Source Registry & Claim Review</h2><p>ลงทะเบียน DOI/URL และแยก claim draft ออกจากข้อสรุป เพื่อป้องกันข้อมูลที่ยังไม่ตรวจถูกแสดงเป็นความจริง</p></div></div>
    {message && <p className="dataset-feedback success" role="status">{message}</p>}
    {discoveryError && <p className="dataset-feedback error" role="alert">{discoveryError}</p>}
    <div className="knowledge-source-grid">
      <form className="knowledge-form" onSubmit={submitSource}>
        <h3>เพิ่มแหล่งอ้างอิง</h3>
        <div className="knowledge-discovery"><input aria-label="DOI หรือ URL สำหรับค้น metadata" value={identifier} onChange={e => setIdentifier(e.target.value)} placeholder="DOI, PubMed URL หรือ OpenAlex URL" /><button className="secondary-button" disabled={discovering || !identifier.trim()} onClick={() => void discover()} type="button">{discovering ? "กำลังค้น…" : "ดึง metadata"}</button></div>
        <label>ชื่อแหล่งข้อมูล<input required value={source.title} onChange={e => setSource({ ...source, title: e.target.value })} /></label>
        <label>URL<input required type="url" value={source.url} onChange={e => setSource({ ...source, url: e.target.value })} /></label>
        <label>DOI<input value={source.doi} onChange={e => setSource({ ...source, doi: e.target.value })} placeholder="10.xxxx/..." /></label>
        <label>ประเภท<select value={source.sourceType} onChange={e => setSource({ ...source, sourceType: e.target.value as KnowledgeSource["sourceType"] })}><option value="journal">Journal</option><option value="database">Database</option><option value="website">Website</option><option value="book">Book</option><option value="user-note">User note</option></select></label>
        {duplicate && <p className="knowledge-inline-warning" role="alert">ซ้ำกับ: {duplicate.title} — เปลี่ยน DOI หรือ URL ก่อนบันทึก</p>}
        <button className="primary-button" disabled={busy || Boolean(duplicate)} type="submit">บันทึก source</button>
      </form>
      <form className="knowledge-form" onSubmit={submitClaim}>
        <h3>สร้าง claim draft จาก source</h3>
        <label>Source<select required value={claim.sourceId} onChange={e => setClaim({ ...claim, sourceId: e.target.value })}><option value="">เลือก source</option>{sources.map(item => <option key={item.id} value={item.id}>{item.title}</option>)}</select></label>
        <label>Taxon<select required value={claim.taxonId} onChange={e => setClaim({ ...claim, taxonId: e.target.value })}>{records.map(item => <option key={item.taxon.id} value={item.taxon.id}>{item.taxon.displayName}</option>)}</select></label>
        <label>หมวดข้อมูล<select value={claim.category} onChange={e => setClaim({ ...claim, category: e.target.value as SourceClaim["category"] })}><option value="tissue-culture">Tissue culture</option><option value="biology">Biology</option><option value="taxonomy">Taxonomy</option><option value="identification">Identification</option><option value="propagation">Propagation</option></select></label>
        <label>ข้อความ claim<textarea required value={claim.statement} onChange={e => setClaim({ ...claim, statement: e.target.value })} placeholder="เขียนเฉพาะข้อความที่แหล่งข้อมูลรองรับ" /></label>
        <label>ข้อความจาก source ที่อนุญาต<textarea required value={claim.evidenceExcerpt} onChange={e => setClaim({ ...claim, evidenceExcerpt: e.target.value })} placeholder="วาง excerpt หรือสรุปจาก full text ที่คุณมีสิทธิ์ใช้" /></label>
        <label>ตำแหน่งหลักฐาน<input required value={claim.evidenceLocation} onChange={e => setClaim({ ...claim, evidenceLocation: e.target.value })} placeholder="เช่น หน้า 4, Table 2, Results ย่อหน้า 3 หรือ URL#section" /></label>
        <label className="knowledge-check"><input type="checkbox" checked={evidenceAuthorized} onChange={e => setEvidenceAuthorized(e.target.checked)} />ยืนยันว่า excerpt นี้มาจาก source ที่ฉันมีสิทธิ์ใช้</label>
        <label>ระดับหลักฐาน<select value={claim.evidenceState} onChange={e => setClaim({ ...claim, evidenceState: e.target.value as SourceClaim["evidenceState"] })}><option>Verified</option><option>Adapted</option><option>Experimental</option><option>Pending review</option></select></label>
        <button className="primary-button" disabled={busy || !sources.length} type="submit">บันทึก claim draft</button>
      </form>
    </div>
    <div className="source-registry-list"><div className="knowledge-section-heading"><div><p className="eyebrow">REGISTERED SOURCES</p><h3>แหล่งอ้างอิงในระบบ ({sources.length})</h3></div></div>{!sources.length ? <p className="muted-copy">ยังไม่มี source — เพิ่ม DOI หรือ URL ด้านบน</p> : sources.map(item => <article className="source-row" key={item.id}><div><strong>{item.title}</strong><small>{item.sourceType} · {item.doi ?? "ไม่มี DOI"}</small></div><a href={item.url} target="_blank" rel="noreferrer">เปิด source</a></article>)}</div>
    <div className="claim-queue"><h3>Claims รอตรวจ</h3>{!claims.length ? <p className="muted-copy">ยังไม่มี claim</p> : claims.map(item => <article className="claim-row" key={item.id}><div><strong>{item.statement}</strong><small>{records.find(record => record.taxon.id === item.taxonId)?.taxon.displayName ?? item.taxonId} · {sources.find(sourceItem => sourceItem.id === item.sourceId)?.title ?? item.sourceId}</small><small>หลักฐาน: {item.evidenceLocation ?? "ยังไม่ระบุ"}</small></div><span className={item.reviewState === "Approved" ? "dataset-status approved" : item.reviewState === "Rejected" ? "dataset-status rejected" : "dataset-status pending"}>{item.reviewState}</span>{item.reviewState === "Pending review" && <div className="dataset-actions"><button className="secondary-button" onClick={() => void onReviewClaim(item.id, "Rejected", "ยังไม่ผ่านการตรวจ")} type="button">Reject</button><button className="primary-button" onClick={() => void onReviewClaim(item.id, "Approved", "ตรวจ source แล้ว")} type="button">Approve</button></div>}</article>)}</div>
  </section>;
}
