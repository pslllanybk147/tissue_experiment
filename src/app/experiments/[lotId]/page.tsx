"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { AuthGate } from "@/components/auth/auth-gate";
import { useAuth } from "@/components/auth/auth-provider";
import { AuditHistory } from "@/components/experiments/audit-history";
import { ObservationForm } from "@/components/experiments/observation-form";
import { ObservationTimeline } from "@/components/experiments/observation-timeline";
import { LabShell } from "@/components/lab/lab-shell";
import type { AuditEvent, ExperimentLot, Observation, ObservationInput } from "@/lib/domain/models";
import { getExperimentRepository } from "@/lib/repositories/experiment-repository-factory";

export default function ExperimentDetailPage() {
  const params = useParams<{ lotId: string }>();
  const lotId = decodeURIComponent(params.lotId);
  const { session, signOut } = useAuth();
  const ownerId = session.user?.uid ?? "demo-owner";
  const repository = useMemo(() => getExperimentRepository(ownerId, session.status === "authenticated"), [ownerId, session.status]);
  const [lot, setLot] = useState<ExperimentLot | null>(null);
  const [observations, setObservations] = useState<Observation[]>([]);
  const [audits, setAudits] = useState<AuditEvent[]>([]);
  const [editing, setEditing] = useState<Observation | null>(null);
  const [showDeleted, setShowDeleted] = useState(false);
  const [state, setState] = useState<"loading" | "ready" | "missing" | "error">("loading");

  async function load() {
    const nextLot = await repository.getLot(ownerId, lotId);
    if (!nextLot) { setState("missing"); return; }
    const [nextObservations, nextAudits] = await Promise.all([repository.listObservations(ownerId, lotId, showDeleted), repository.listAuditEvents(ownerId, lotId)]);
    setLot(nextLot); setObservations(nextObservations); setAudits(nextAudits); setState("ready");
  }
  useEffect(() => {
    if (session.status !== "authenticated" && session.status !== "demo") return;
    let active = true;
    repository.getLot(ownerId, lotId).then(async (nextLot) => {
        if (!active) return;
        if (!nextLot) { setState("missing"); return; }
        const [nextObservations, nextAudits] = await Promise.all([repository.listObservations(ownerId, lotId, showDeleted), repository.listAuditEvents(ownerId, lotId)]);
        if (!active) return;
        setLot(nextLot); setObservations(nextObservations); setAudits(nextAudits); setState("ready");
      })
      .catch(() => { if (active) setState("error"); });
    return () => { active = false; };
  }, [lotId, ownerId, repository, session.status, showDeleted]);
  async function save(input: ObservationInput) { if (editing) await repository.updateObservation(ownerId, lotId, editing.id, input); else await repository.createObservation(ownerId, lotId, input); setEditing(null); await load(); }
  async function remove(id: string) { if (!window.confirm("ซ่อน observation นี้จาก timeline? สามารถกู้คืนได้ภายหลัง")) return; await repository.softDeleteObservation(ownerId, lotId, id); await load(); }
  async function restore(id: string) { await repository.restoreObservation(ownerId, lotId, id); await load(); }

  return <AuthGate><LabShell onSignOut={() => void signOut()} section="Experiments" sessionLabel={session.status === "authenticated" ? "FIREBASE" : "DEMO"}>
    <Link className="route-back" href="/experiments">← Experiment Lots</Link>
    {state === "loading" && <div className="route-state" role="status">กำลังโหลด Lot…</div>}
    {state === "error" && <div className="route-state error" role="alert">โหลดข้อมูล Lot ไม่สำเร็จ</div>}
    {state === "missing" && <div className="route-state"><strong>ไม่พบ Lot {lotId}</strong></div>}
    {state === "ready" && lot && <>
      <header className="lot-detail-heading"><div><p className="eyebrow">EXPERIMENT LOT</p><h1>{lot.id}</h1><p>{lot.plant} · {lot.protocolTitle}</p></div><span className={`badge badge-${lot.status.toLowerCase().replaceAll(" ", "-")}`}>{lot.status}</span></header>
      <div className="lot-detail-grid">
        <section className="lot-work-column"><ObservationForm defaultStage={lot.stage} editing={editing} key={editing?.id ?? "new"} onCancel={() => setEditing(null)} onSubmit={save} />
          <div className="timeline-heading"><div><p className="eyebrow">OBSERVATION TIMELINE</p><h2>บันทึกผล</h2></div><label><input checked={showDeleted} onChange={(e) => setShowDeleted(e.target.checked)} type="checkbox" /> แสดงรายการที่ลบ</label></div>
          <ObservationTimeline observations={observations} onDelete={remove} onEdit={setEditing} onRestore={restore} />
        </section>
        <aside className="lot-audit-column"><p className="eyebrow">AUDIT HISTORY</p><h2>ประวัติการเปลี่ยนแปลง</h2><AuditHistory events={audits} /></aside>
      </div>
    </>}
  </LabShell></AuthGate>;
}
