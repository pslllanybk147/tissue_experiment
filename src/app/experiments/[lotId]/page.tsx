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
import { GuidedProtocolRunner } from "@/components/protocols/guided-protocol-runner";
import { MediaStrip } from "@/components/media/media-strip";
import { MediaUploader } from "@/components/media/media-uploader";
import type { AuditEvent, ExperimentLot, Observation, ObservationInput, ObservationMedia, ProtocolStepRun, ProtocolVersion } from "@/lib/domain/models";
import { getExperimentRepository } from "@/lib/repositories/experiment-repository-factory";
import { getProtocolRepository } from "@/lib/repositories/protocol-repository-factory";
import { getMediaRepository } from "@/lib/repositories/media-repository-factory";
import { getStepRunRepository } from "@/lib/repositories/step-run-repository-factory";

export default function ExperimentDetailPage() {
  const params = useParams<{ lotId: string }>();
  const lotId = decodeURIComponent(params.lotId);
  const { session, signOut } = useAuth();
  const ownerId = session.user?.uid ?? "demo-owner";
  const repository = useMemo(() => getExperimentRepository(ownerId, session.status === "authenticated"), [ownerId, session.status]);
  const protocolRepository = useMemo(() => getProtocolRepository(ownerId, session.status === "authenticated"), [ownerId, session.status]);
  const mediaRepository = useMemo(() => getMediaRepository(ownerId, session.status === "authenticated"), [ownerId, session.status]);
  const stepRunRepository = useMemo(() => getStepRunRepository(ownerId, session.status === "authenticated"), [ownerId, session.status]);
  const [lot, setLot] = useState<ExperimentLot | null>(null);
  const [observations, setObservations] = useState<Observation[]>([]);
  const [audits, setAudits] = useState<AuditEvent[]>([]);
  const [editing, setEditing] = useState<Observation | null>(null);
  const [showDeleted, setShowDeleted] = useState(false);
  const [state, setState] = useState<"loading" | "ready" | "missing" | "error">("loading");
  const [protocolVersion, setProtocolVersion] = useState<ProtocolVersion | null>(null);
  const [media, setMedia] = useState<Record<string,ObservationMedia[]>>({});
  const [stepRuns, setStepRuns] = useState<ProtocolStepRun[]>([]);

  async function load() {
    const nextLot = await repository.getLot(ownerId, lotId);
    if (!nextLot) { setState("missing"); return; }
    const [nextObservations, nextAudits, nextMediaAudits] = await Promise.all([repository.listObservations(ownerId, lotId, showDeleted), repository.listAuditEvents(ownerId, lotId), mediaRepository.listAuditEvents(ownerId, lotId)]);
    const normalizedMediaAudits: AuditEvent[] = nextMediaAudits.map((event) => ({ id: event.id, lotId: event.lotId, ownerId: event.ownerId, entityType: "media", entityId: event.mediaId, action: event.action, actorId: event.ownerId, occurredAt: event.occurredAt, before: null, after: null }));
    setLot(nextLot); setObservations(nextObservations); setAudits([...nextAudits, ...normalizedMediaAudits].sort((a, b) => b.occurredAt.localeCompare(a.occurredAt))); setState("ready");
  }
  useEffect(() => {
    if (session.status !== "authenticated" && session.status !== "demo") return;
    let active = true;
    repository.getLot(ownerId, lotId).then(async (nextLot) => {
        if (!active) return;
        if (!nextLot) { setState("missing"); return; }
        const [nextObservations, nextAudits, nextMediaAudits] = await Promise.all([repository.listObservations(ownerId, lotId, showDeleted), repository.listAuditEvents(ownerId, lotId), mediaRepository.listAuditEvents(ownerId, lotId)]);
        if (!active) return;
        const normalizedMediaAudits: AuditEvent[] = nextMediaAudits.map((event) => ({ id: event.id, lotId: event.lotId, ownerId: event.ownerId, entityType: "media", entityId: event.mediaId, action: event.action, actorId: event.ownerId, occurredAt: event.occurredAt, before: null, after: null }));
        setLot(nextLot); setObservations(nextObservations); setAudits([...nextAudits, ...normalizedMediaAudits].sort((a, b) => b.occurredAt.localeCompare(a.occurredAt))); setState("ready");
      })
      .catch(() => { if (active) setState("error"); });
    return () => { active = false; };
  }, [lotId, ownerId, repository, mediaRepository, session.status, showDeleted]);
  useEffect(() => { if (!lot) return; let active=true; Promise.all([protocolRepository.get(ownerId,lot.protocolId),stepRunRepository.list(ownerId,lotId)]).then(([protocol,nextRuns])=>{if(!active)return;const version=protocol?.versions.find(item=>item.id===(lot.protocolVersionId??protocol.protocol.currentVersionId))??null;setProtocolVersion(version);setStepRuns(nextRuns)}).catch(()=>undefined);return()=>{active=false};},[lot,lotId,ownerId,protocolRepository,stepRunRepository]);
  useEffect(()=>{let active=true;Promise.all(observations.map(async item=>[item.id,await mediaRepository.list(ownerId,lotId,item.id,showDeleted)]as const)).then(entries=>{if(active)setMedia(Object.fromEntries(entries))}).catch(()=>undefined);return()=>{active=false}},[observations,lotId,mediaRepository,ownerId,showDeleted]);
  async function save(input: ObservationInput) { if (editing) await repository.updateObservation(ownerId, lotId, editing.id, input); else await repository.createObservation(ownerId, lotId, input); setEditing(null); await load(); }
  async function remove(id: string) { if (!window.confirm("ซ่อน observation นี้จาก timeline? สามารถกู้คืนได้ภายหลัง")) return; await repository.softDeleteObservation(ownerId, lotId, id); await load(); }
  async function restore(id: string) { await repository.restoreObservation(ownerId, lotId, id); await load(); }
  async function saveMedia(item:ObservationMedia){await mediaRepository.save(ownerId,item);setMedia(current=>({...current,[item.observationId]:[...(current[item.observationId]??[]),item]}));}
  async function deleteMedia(observationId:string,mediaId:string){await mediaRepository.softDelete(ownerId,lotId,observationId,mediaId);setMedia(current=>({...current,[observationId]:(current[observationId]??[]).filter(item=>item.id!==mediaId)}));}
  async function restoreMedia(observationId:string,mediaId:string){await mediaRepository.restore(ownerId,lotId,observationId,mediaId);setMedia(current=>({...current,[observationId]:(current[observationId]??[]).map(item=>item.id===mediaId?{...item,deletedAt:null}:item)})); await load();}
  async function saveStepRun(input: Omit<ProtocolStepRun, "id" | "ownerId" | "updatedAt">) { await stepRunRepository.save(ownerId, input); setStepRuns(await stepRunRepository.list(ownerId, lotId)); }

  return <AuthGate><LabShell onSignOut={() => void signOut()} section="Experiments" sessionLabel={session.status === "authenticated" ? "FIREBASE" : "DEMO"}>
    <Link className="route-back" href="/experiments">← Experiment Lots</Link>
    {state === "loading" && <div className="route-state" role="status">กำลังโหลด Lot…</div>}
    {state === "error" && <div className="route-state error" role="alert">โหลดข้อมูล Lot ไม่สำเร็จ</div>}
    {state === "missing" && <div className="route-state"><strong>ไม่พบ Lot {lotId}</strong></div>}
    {state === "ready" && lot && <>
      <header className="lot-detail-heading"><div><p className="eyebrow">EXPERIMENT LOT</p><h1>{lot.id}</h1><p>{lot.plant} · {lot.protocolTitle}</p></div><span className={`badge badge-${lot.status.toLowerCase().replaceAll(" ", "-")}`}>{lot.status}</span></header>
      <div className="lot-detail-grid">
        <section className="lot-work-column">{protocolVersion && <section className="experiment-surface protocol-lot-runner"><div className="timeline-heading"><div><p className="eyebrow">PROTOCOL PROGRESS</p><h2>{lot.protocolTitle}</h2><p className="muted-copy">ทำตามทีละขั้น บันทึกผลจริง แล้วระบบจะเก็บหลักฐานไว้กับ Lot นี้</p></div><Link href={`/protocols/${lot.protocolId}`}>เปิด Protocol</Link></div><GuidedProtocolRunner lotId={lotId} protocolId={lot.protocolId} versionId={protocolVersion.id} steps={protocolVersion.steps} runs={stepRuns} onSave={saveStepRun} /></section>}<ObservationForm defaultStage={lot.stage} editing={editing} key={editing?.id ?? "new"} onCancel={() => setEditing(null)} onSubmit={save} />
          <div className="timeline-heading"><div><p className="eyebrow">OBSERVATION TIMELINE</p><h2>บันทึกผล</h2></div><label><input checked={showDeleted} onChange={(e) => setShowDeleted(e.target.checked)} type="checkbox" /> แสดงรายการที่ลบ</label></div>
          <ObservationTimeline observations={observations} onDelete={remove} onEdit={setEditing} onRestore={restore} renderMedia={item=><div className="observation-media"><MediaStrip items={media[item.id]??[]} onDelete={id=>deleteMedia(item.id,id)} onRestore={id=>restoreMedia(item.id,id)} />{!item.deletedAt&&<MediaUploader lotId={lotId} observationId={item.id} onUploaded={saveMedia}/>}</div>} />
        </section>
        <aside className="lot-audit-column"><p className="eyebrow">AUDIT HISTORY</p><h2>ประวัติการเปลี่ยนแปลง</h2><AuditHistory events={audits} /></aside>
      </div>
    </>}
  </LabShell></AuthGate>;
}
