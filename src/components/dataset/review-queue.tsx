"use client";
/* Cloudinary URLs are user-configured at runtime; next/image domains are intentionally not hard-coded here. */
/* eslint-disable @next/next/no-img-element */

import { useMemo, useState } from "react";
import type { DatasetConfidence, DatasetItem, DatasetReviewStatus } from "@/lib/domain/models";

type ReviewQueueProps = {
  items: DatasetItem[];
  onReviewProvenance: (itemId: string, status: DatasetReviewStatus, note: string) => Promise<void>;
  onSetLabel: (itemId: string, input: { scientificName: string; cultivarName: string; confidence: DatasetConfidence; note: string }) => Promise<void>;
  onExport?: () => Promise<void>;
};

const statuses: Array<DatasetReviewStatus | "All"> = ["All", "Pending review", "Approved", "Rejected"];

function statusClass(status: DatasetReviewStatus) {
  return status === "Approved" ? "dataset-status approved" : status === "Rejected" ? "dataset-status rejected" : "dataset-status pending";
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("th-TH", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

export function ReviewQueue({ items, onReviewProvenance, onSetLabel, onExport }: ReviewQueueProps) {
  const [filter, setFilter] = useState<(typeof statuses)[number]>("Pending review");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [reviewNote, setReviewNote] = useState("");
  const [scientificName, setScientificName] = useState("");
  const [cultivarName, setCultivarName] = useState("");
  const [confidence, setConfidence] = useState<DatasetConfidence>("Medium");
  const [labelNote, setLabelNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const visibleItems = useMemo(() => filter === "All" ? items : items.filter(item => item.reviewStatus === filter), [filter, items]);
  const selected = items.find(item => item.id === selectedId) ?? visibleItems[0] ?? null;

  function selectItem(item: DatasetItem) {
    setSelectedId(item.id); setReviewNote(""); setScientificName(item.label?.scientificName ?? ""); setCultivarName(item.label?.cultivarName ?? ""); setConfidence(item.label?.confidence ?? "Medium"); setLabelNote(item.label?.note ?? ""); setMessage(null); setError(null);
  }

  async function run(action: () => Promise<void>, success: string) {
    setBusy(true); setError(null); setMessage(null);
    try { await action(); setMessage(success); } catch (caught) { setError(caught instanceof Error ? caught.message : "บันทึกไม่สำเร็จ"); } finally { setBusy(false); }
  }

  async function submitLabel(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selected) return;
    await run(() => onSetLabel(selected.id, { scientificName, cultivarName, confidence, note: labelNote }), "บันทึก label แล้ว — รายการนี้พร้อมเป็น training candidate");
  }

  return <div className="dataset-review" aria-label="Dataset review queue">
    <section className="dataset-review-summary"><div><p className="eyebrow">IMAGE DATASET / HUMAN REVIEW</p><h2>Review Queue</h2><p>ตรวจที่มาของภาพก่อน แล้วจึงยืนยัน label สำหรับการทดลอง image processing</p></div><div className="dataset-review-count"><strong>{items.filter(item => item.reviewStatus === "Pending review").length}</strong><span>รอตรวจ</span>{onExport && <button className="secondary-button" disabled={busy} onClick={() => void run(onExport, "ดาวน์โหลด manifest แล้ว")} type="button">Export manifest</button>}</div></section>
    <div className="dataset-review-filters" role="tablist" aria-label="กรองสถานะ">{statuses.map(status => <button aria-selected={filter === status} className={filter === status ? "active" : ""} key={status} onClick={() => setFilter(status)} role="tab" type="button">{status}</button>)}</div>
    {message && <p className="dataset-feedback success" role="status">{message}</p>}{error && <p className="dataset-feedback error" role="alert">{error}</p>}
    {!visibleItems.length ? <div className="dataset-empty"><h3>ยังไม่มีรายการในคิวนี้</h3><p>เมื่อมีรูปจาก Observation ที่ผ่านการตรวจ target แล้ว รายการจะปรากฏที่นี่ก่อนนำไปสร้าง dataset</p></div> : <div className="dataset-review-grid"><div className="dataset-review-list" aria-label="รายการภาพ">{visibleItems.map(item => <button className={`dataset-review-row ${selected?.id === item.id ? "active" : ""}`} key={item.id} onClick={() => selectItem(item)} type="button"><img alt="" src={item.assetUrl} /><span><strong>{item.label?.cultivarName || "ยังไม่ติด label"}</strong><small>{item.lotId} · {item.provenance.kind === "user-captured" ? "ภาพจากผู้ใช้" : "ภาพอ้างอิง"}</small><small>{formatDate(item.createdAt)}</small></span><span className={statusClass(item.reviewStatus)}>{item.reviewStatus}</span></button>)}</div>
      {selected && <article className="dataset-review-detail"><div className="dataset-review-image"><img alt="ภาพที่กำลังตรวจ" src={selected.assetUrl} /><div><code>{selected.id}</code><a href={selected.assetUrl} target="_blank" rel="noreferrer">เปิดภาพต้นฉบับ ↗</a></div></div>
        <div className="dataset-detail-block"><p className="eyebrow">PROVENANCE</p><h3>ตรวจที่มาภาพ</h3><dl className="data-list"><dt>ประเภท</dt><dd>{selected.provenance.kind === "user-captured" ? "ผู้ใช้ถ่ายเอง" : "ภาพอ้างอิงมีใบอนุญาต"}</dd><dt>Source</dt><dd>{selected.provenance.sourceUrl ? <a href={selected.provenance.sourceUrl} target="_blank" rel="noreferrer">{selected.provenance.sourceUrl}</a> : "ไม่มี URL — ตรวจจากบันทึกการทดลอง"}</dd><dt>License</dt><dd>{selected.provenance.license || "ไม่ระบุ"}</dd><dt>สถานะ</dt><dd><span className={statusClass(selected.provenance.status)}>{selected.provenance.status}</span></dd></dl><label className="dataset-field">บันทึกการตรวจ<textarea value={reviewNote} onChange={event => setReviewNote(event.target.value)} placeholder="เช่น ตรวจเทียบกับภาพต้นฉบับแล้ว" /></label><div className="dataset-actions"><button className="secondary-button" disabled={busy} onClick={() => void run(() => onReviewProvenance(selected.id, "Rejected", reviewNote), "ทำเครื่องหมาย Rejected แล้ว")} type="button">Reject</button><button className="primary-button" disabled={busy || !reviewNote.trim()} onClick={() => void run(() => onReviewProvenance(selected.id, "Approved", reviewNote), "อนุมัติ provenance แล้ว — ขั้นต่อไปคือยืนยัน label")} type="button">Approve provenance</button></div></div>
        <form className="dataset-detail-block" onSubmit={submitLabel}><p className="eyebrow">HUMAN LABEL</p><h3>ยืนยันชนิดพืช</h3>{selected.provenance.status !== "Approved" && <p className="dataset-warning">ต้อง Approve provenance ก่อนจึงจะบันทึก label และนำรายการนี้เป็น training candidate ได้</p>}<div className="dataset-form-grid"><label className="dataset-field">Scientific name<input required value={scientificName} onChange={event => setScientificName(event.target.value)} /></label><label className="dataset-field">Cultivar / ชื่อการค้า<input required value={cultivarName} onChange={event => setCultivarName(event.target.value)} /></label><label className="dataset-field">Confidence<select value={confidence} onChange={event => setConfidence(event.target.value as DatasetConfidence)}><option value="Low">Low</option><option value="Medium">Medium</option><option value="High">High</option><option value="Unknown">Unknown</option></select></label><label className="dataset-field dataset-field-wide">เหตุผลหรือหมายเหตุ<textarea required value={labelNote} onChange={event => setLabelNote(event.target.value)} placeholder="ระบุว่าตรวจจากลักษณะใด หรือมีผู้เชี่ยวชาญยืนยันอย่างไร" /></label></div><button className="primary-button" disabled={busy || selected.provenance.status !== "Approved"} type="submit">บันทึก label</button></form>
        <div className="dataset-detail-meta"><span className={selected.includedInTraining ? "dataset-training ready" : "dataset-training"}>{selected.includedInTraining ? "พร้อมเป็น training candidate" : "ยังไม่รวมใน training"}</span><small>สร้างเมื่อ {formatDate(selected.createdAt)} · Lot {selected.lotId} · Observation {selected.observationId}</small></div>
      </article>}</div>}
  </div>;
}
