"use client";

import { useEffect, useMemo, useState } from "react";
import { AuthGate } from "@/components/auth/auth-gate";
import { useAuth } from "@/components/auth/auth-provider";
import { LabShell } from "@/components/lab/lab-shell";
import { ReviewQueue } from "@/components/dataset/review-queue";
import type { DatasetConfidence, DatasetItem, DatasetReviewStatus } from "@/lib/domain/models";
import { getDatasetRepository } from "@/lib/repositories/dataset-repository-factory";

export default function DatasetReviewPage() {
  const { session, signOut } = useAuth();
  const ownerId = session.user?.uid ?? "demo-owner";
  const authenticated = session.status === "authenticated";
  const repository = useMemo(() => getDatasetRepository(ownerId, authenticated), [authenticated, ownerId]);
  const [items, setItems] = useState<DatasetItem[]>([]);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");

  async function load() {
    setState("loading");
    try { setItems(await repository.list(ownerId)); setState("ready"); } catch { setState("error"); }
  }

  useEffect(() => {
    if (session.status !== "authenticated" && session.status !== "demo") return;
    let active = true;
    repository.list(ownerId).then(value => { if (active) { setItems(value); setState("ready"); } }).catch(() => { if (active) setState("error"); });
    return () => { active = false; };
  }, [ownerId, repository, session.status]);

  async function reviewProvenance(itemId: string, status: DatasetReviewStatus, note: string) {
    await repository.reviewProvenance(ownerId, itemId, status, ownerId, note);
    await load();
  }

  async function setLabel(itemId: string, input: { scientificName: string; cultivarName: string; confidence: DatasetConfidence; note: string }) {
    await repository.setLabel(ownerId, itemId, { ...input, source: "owner", reviewedBy: ownerId, reviewedAt: new Date().toISOString() });
    await load();
  }

  return <AuthGate><LabShell section="Image review" sessionLabel={authenticated ? "FIREBASE" : "DEMO"} onSignOut={() => void signOut()}><header className="route-heading"><div><p className="eyebrow">IMAGE PROCESSING / PHASE 1</p><h1>Image Review</h1><p>ตรวจ provenance และยืนยัน label ก่อนนำภาพไปใช้ฝึกโมเดล</p></div></header>{state === "loading" && <p className="route-state" role="status">กำลังโหลดรายการตรวจ…</p>}{state === "error" && <div className="route-state error" role="alert">โหลด Review Queue ไม่สำเร็จ <button className="quiet-button" onClick={() => void load()} type="button">ลองใหม่</button></div>}{state === "ready" && <ReviewQueue items={items} onReviewProvenance={reviewProvenance} onSetLabel={setLabel} />}</LabShell></AuthGate>;
}
