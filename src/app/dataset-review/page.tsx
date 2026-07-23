"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AuthGate } from "@/components/auth/auth-gate";
import { useAuth } from "@/components/auth/auth-provider";
import { LabShell } from "@/components/lab/lab-shell";
import { ReviewQueue } from "@/components/dataset/review-queue";
import { PreprocessingJobs } from "@/components/dataset/preprocessing-jobs";
import type { DatasetConfidence, DatasetItem, DatasetReviewStatus } from "@/lib/domain/models";
import type { PreprocessingJob } from "@/lib/image/preprocessing-job";
import { getDatasetRepository } from "@/lib/repositories/dataset-repository-factory";
import { getFirebaseServices } from "@/lib/firebase/client";

export default function DatasetReviewPage() {
  const { session, signOut } = useAuth();
  const ownerId = session.user?.uid ?? "demo-owner";
  const authenticated = session.status === "authenticated";
  const repository = useMemo(() => getDatasetRepository(ownerId, authenticated), [authenticated, ownerId]);
  const [items, setItems] = useState<DatasetItem[]>([]);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const [jobs, setJobs] = useState<PreprocessingJob[]>([]);
  const [jobMessage, setJobMessage] = useState<string | null>(null);
  const [jobError, setJobError] = useState<string | null>(null);

  async function load() {
    setState("loading");
    try { setItems(await repository.list(ownerId)); setState("ready"); } catch { setState("error"); }
  }

  const loadJobs = useCallback(async () => {
    if (!authenticated) return;
    const user = getFirebaseServices()?.auth.currentUser;
    if (!user) return;
    const token = await user.getIdToken();
    const response = await fetch("/api/dataset/preprocess?limit=20", { headers: { authorization: `Bearer ${token}` }, cache: "no-store" });
    if (!response.ok) throw new Error("โหลด preprocessing jobs ไม่สำเร็จ");
    const body = await response.json() as { jobs?: PreprocessingJob[] };
    setJobs(body.jobs ?? []);
  }, [authenticated]);

  useEffect(() => {
    if (session.status !== "authenticated" && session.status !== "demo") return;
    let active = true;
    repository.list(ownerId).then(value => { if (active) { setItems(value); setState("ready"); } }).catch(() => { if (active) setState("error"); });
    queueMicrotask(() => { void loadJobs().catch(() => undefined); });
    return () => { active = false; };
  }, [loadJobs, ownerId, repository, session.status]);

  async function reviewProvenance(itemId: string, status: DatasetReviewStatus, note: string) {
    await repository.reviewProvenance(ownerId, itemId, status, ownerId, note);
    await load();
  }

  async function setLabel(itemId: string, input: { scientificName: string; cultivarName: string; confidence: DatasetConfidence; note: string }) {
    await repository.setLabel(ownerId, itemId, { ...input, source: "owner", reviewedBy: ownerId, reviewedAt: new Date().toISOString() });
    await load();
  }

  async function exportManifest() {
    const user = getFirebaseServices()?.auth.currentUser;
    if (!user) throw new Error("กรุณาเข้าสู่ระบบก่อน export manifest");
    const token = await user.getIdToken(true);
    const response = await fetch("/api/dataset/export", { method: "POST", headers: { authorization: `Bearer ${token}` } });
    if (!response.ok) { const body = await response.json().catch(() => ({})) as { error?: string }; throw new Error(body.error || "Export manifest ไม่สำเร็จ"); }
    const manifest = await response.json();
    const blob = new Blob([JSON.stringify(manifest, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a"); anchor.href = url; anchor.download = `philodendron-image-dataset-${new Date().toISOString().slice(0, 10)}.json`; anchor.click(); URL.revokeObjectURL(url);
  }

  async function createExportAndPreprocess(retryOf?: string) {
    const user = getFirebaseServices()?.auth.currentUser;
    if (!user) throw new Error("กรุณาเข้าสู่ระบบก่อนเริ่ม preprocessing");
    const token = await user.getIdToken(true);
    const exportResponse = await fetch("/api/dataset/export", { method: "POST", headers: { authorization: `Bearer ${token}` } });
    const exportBody = await exportResponse.json().catch(() => ({})) as { exportId?: string; error?: string };
    if (!exportResponse.ok || !exportBody.exportId) throw new Error(exportBody.error || "สร้าง export ไม่สำเร็จ");
    const response = await fetch("/api/dataset/preprocess", { method: "POST", headers: { authorization: `Bearer ${token}`, "content-type": "application/json" }, body: JSON.stringify({ exportId: exportBody.exportId, ...(retryOf ? { retryOf } : {}) }) });
    const body = await response.json().catch(() => ({})) as PreprocessingJob & { error?: string };
    if (!response.ok && response.status !== 207) throw new Error(body.error || "เริ่ม preprocessing ไม่สำเร็จ");
    setJobs(current => [body, ...current.filter(job => job.id !== body.id)]);
  }

  async function startPreprocessing() {
    setJobMessage(null); setJobError(null);
    try { await createExportAndPreprocess(); setJobMessage("สร้าง preprocessing job แล้ว"); await loadJobs(); } catch (error) { setJobError(error instanceof Error ? error.message : "เริ่ม preprocessing ไม่สำเร็จ"); }
  }

  async function retryPreprocessing(job: PreprocessingJob) {
    setJobMessage(null); setJobError(null);
    try { await createExportAndPreprocess(job.id); setJobMessage("สร้าง retry job แล้ว"); await loadJobs(); } catch (error) { setJobError(error instanceof Error ? error.message : "สร้าง retry ไม่สำเร็จ"); }
  }

  async function exportModelReady(job: PreprocessingJob) {
    setJobMessage(null); setJobError(null);
    try {
      const user = getFirebaseServices()?.auth.currentUser;
      if (!user) throw new Error("กรุณาเข้าสู่ระบบก่อน export dataset");
      const token = await user.getIdToken(true);
      const response = await fetch("/api/dataset/model-export", { method: "POST", headers: { authorization: `Bearer ${token}`, "content-type": "application/json" }, body: JSON.stringify({ jobId: job.id }) });
      const body = await response.json().catch(() => ({})) as { error?: string; exportId?: string };
      if (!response.ok) throw new Error(body.error || "สร้าง model-ready manifest ไม่สำเร็จ");
      const blob = new Blob([JSON.stringify(body, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob); const anchor = document.createElement("a"); anchor.href = url; anchor.download = `philodendron-model-ready-${job.id}.json`; anchor.click(); URL.revokeObjectURL(url);
      setJobMessage(`ส่งออก model-ready manifest แล้ว (${body.exportId})`);
    } catch (error) { setJobError(error instanceof Error ? error.message : "ส่งออก dataset ไม่สำเร็จ"); }
  }

  async function exportTrainingReport(job: PreprocessingJob) {
    setJobMessage(null); setJobError(null);
    try {
      const user = getFirebaseServices()?.auth.currentUser;
      if (!user) throw new Error("กรุณาเข้าสู่ระบบก่อนตรวจ dataset");
      const token = await user.getIdToken(true);
      const response = await fetch("/api/dataset/training-report", { method: "POST", headers: { authorization: `Bearer ${token}`, "content-type": "application/json" }, body: JSON.stringify({ jobId: job.id }) });
      const body = await response.json().catch(() => ({})) as { error?: string; reportId?: string; ready?: boolean; warnings?: string[] };
      if (!response.ok) throw new Error(body.error || "สร้าง training readiness report ไม่สำเร็จ");
      const blob = new Blob([JSON.stringify(body, null, 2)], { type: "application/json" }); const url = URL.createObjectURL(blob); const anchor = document.createElement("a"); anchor.href = url; anchor.download = `philodendron-training-readiness-${job.id}.json`; anchor.click(); URL.revokeObjectURL(url);
      setJobMessage(body.ready ? `dataset พร้อมตรวจขั้นต่อไปแล้ว (${body.reportId})` : `พบ ${body.warnings?.length ?? 0} จุดที่ควรตรวจ — ดาวน์โหลดรายงานแล้ว`);
    } catch (error) { setJobError(error instanceof Error ? error.message : "ตรวจความพร้อม dataset ไม่สำเร็จ"); }
  }

  return <AuthGate><LabShell section="Image review" sessionLabel={authenticated ? "FIREBASE" : "DEMO"} onSignOut={() => void signOut()}><header className="route-heading"><div><p className="eyebrow">IMAGE PROCESSING / PHASE 1</p><h1>Image Review</h1><p>ตรวจ provenance และยืนยัน label ก่อนนำภาพไปใช้ฝึกโมเดล</p></div></header>{state === "loading" && <p className="route-state" role="status">กำลังโหลดรายการตรวจ…</p>}{state === "error" && <div className="route-state error" role="alert">โหลด Review Queue ไม่สำเร็จ <button className="quiet-button" onClick={() => void load()} type="button">ลองใหม่</button></div>}{state === "ready" && <><ReviewQueue items={items} onReviewProvenance={reviewProvenance} onSetLabel={setLabel} onExport={authenticated ? exportManifest : undefined} />{authenticated && <><div className="dataset-feedback-stack">{jobMessage && <p className="dataset-feedback success" role="status">{jobMessage}</p>}{jobError && <p className="dataset-feedback error" role="alert">{jobError}</p>}</div><PreprocessingJobs jobs={jobs} onStart={startPreprocessing} onRetry={retryPreprocessing} onExport={exportModelReady} onReport={exportTrainingReport} /></>}</>}</LabShell></AuthGate>;
}
