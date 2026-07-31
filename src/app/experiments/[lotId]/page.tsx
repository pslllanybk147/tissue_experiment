"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { AuthGate } from "@/components/auth/auth-gate";
import { useAuth } from "@/components/auth/auth-provider";
import { AuditHistory } from "@/components/experiments/audit-history";
import { ObservationTimeline } from "@/components/experiments/observation-timeline";
import { LabShell } from "@/components/lab/lab-shell";
import { LinearProtocolRunnerV2 } from "@/components/protocols/linear-protocol-runner-v2";
import type { LotRecipePlan } from "@/components/protocols/inline-lot-recipe";
import type { AuditEvent, ExperimentLot, Observation, ObservationMedia, ProtocolStepRun, ProtocolVersion } from "@/lib/domain/models";
import { getExperimentRepository } from "@/lib/repositories/experiment-repository-factory";
import { getProtocolRepository } from "@/lib/repositories/protocol-repository-factory";
import { getMediaRepository } from "@/lib/repositories/media-repository-factory";
import { getStepRunRepository } from "@/lib/repositories/step-run-repository-factory";
import { buildPinkPrincessHaiterProtocolV2, canRunGuidedProtocolV2 } from "@/lib/domain/guided-protocol-v2";
import { monographForTaxon } from "@/lib/domain/philodendron-knowledge";

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
  const [showDeleted, setShowDeleted] = useState(false);
  const [state, setState] = useState<"loading" | "ready" | "missing" | "error">("loading");
  const [protocolVersion, setProtocolVersion] = useState<ProtocolVersion | null>(null);
  const [media, setMedia] = useState<Record<string,ObservationMedia[]>>({});
  const [stepRuns, setStepRuns] = useState<ProtocolStepRun[]>([]);
  const guidedStepsV2 = useMemo(
    () => lot && canRunGuidedProtocolV2(lot)
      ? buildPinkPrincessHaiterProtocolV2(lot)
      : null,
    [lot],
  );
  const recipePlan = useMemo<LotRecipePlan | undefined>(() => {
    if (!lot?.sterilization?.mediumVolumeMl) return undefined;
    const recipe = monographForTaxon("cultivar-pink-princess")
      ?.tissueCulture.mediaRecipes.find((item) => item.id === "establishment");
    if (!recipe) return undefined;
    const volume = lot.sterilization.mediumVolumeMl;
    const batch = lot.sterilization.mediumBatch;
    return {
      title: recipe.title,
      evidenceState: recipe.evidenceState,
      volumeMl: volume,
      pH: recipe.pH,
      minimumToolVolumeMl: lot.sterilization.minimumToolVolumeMl ?? 0.1,
      jarSummary: batch
        ? `${batch.totalJarCount} กระปุก (เพาะ ${batch.cultureJarCount}, Blank ${batch.blankJarCount}, สำรอง ${batch.spareJarCount})`
        : undefined,
      ingredients: recipe.ingredients.map((item) => ({
        name: item.name,
        amount: item.unit === "×"
          ? item.amountPerLiter
          : Number((item.amountPerLiter * volume / 1000).toFixed(6)),
        unit: item.unit === "×" ? "×" : item.unit.replace("/L", ""),
        note: item.note,
      })),
    };
  }, [lot]);

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
  useEffect(()=>{let active=true;Promise.all(observations.map(async item=>[item.id,await mediaRepository.list(ownerId,lotId,item.id,true)]as const)).then(entries=>{if(active)setMedia(Object.fromEntries(entries))}).catch(()=>undefined);return()=>{active=false}},[observations,lotId,mediaRepository,ownerId,showDeleted]);
  async function deleteLot() { if (!lot || !window.confirm(`เก็บ Lot ${lot.id} เข้าถังขยะ? ข้อมูลจะยังอยู่และกู้คืนได้`)) return; await repository.softDeleteLot(ownerId, lotId); await load(); }
  async function restoreLot() { await repository.restoreLot(ownerId, lotId); await load(); }
  async function saveStepRunV2(input: Omit<ProtocolStepRun, "id" | "ownerId" | "updatedAt">) {
    await stepRunRepository.save(ownerId, input);
    setStepRuns(await stepRunRepository.list(ownerId, lotId));
  }
  async function saveStepRunsV2(inputs: Array<Omit<ProtocolStepRun, "id" | "ownerId" | "updatedAt">>) {
    await stepRunRepository.saveMany(ownerId, inputs);
    setStepRuns(await stepRunRepository.list(ownerId, lotId));
  }

  return <AuthGate><LabShell onSignOut={() => void signOut()} section="Experiments" sessionLabel={session.status === "authenticated" ? "FIREBASE" : "DEMO"}>
    <Link className="route-back" href="/experiments">← Experiment Lots</Link>
    {state === "loading" && <div className="route-state" role="status">กำลังโหลด Lot…</div>}
    {state === "error" && <div className="route-state error" role="alert">โหลดข้อมูล Lot ไม่สำเร็จ</div>}
    {state === "missing" && <div className="route-state"><strong>ไม่พบ Lot {lotId}</strong></div>}
    {state === "ready" && lot && <>
      {lot.deletedAt && <div className="form-alert" role="status">Lot นี้อยู่ในถังขยะ ข้อมูลยังไม่ถูกลบถาวร</div>}
      <header className="lot-detail-heading"><div><p className="eyebrow">EXPERIMENT LOT</p><h1>{lot.id}</h1><p>{lot.plant} · {lot.protocolTitle}</p></div><div className="route-actions">{lot.deletedAt ? <button className="primary-button" onClick={() => void restoreLot()} type="button">กู้คืน Lot</button> : <button className="quiet-button" onClick={() => void deleteLot()} type="button">เก็บเข้าถังขยะ</button>}<span className={`badge badge-${lot.status.toLowerCase().replaceAll(" ", "-")}`}>{lot.status}</span></div></header>
      <div className="lot-detail-grid">
        <section className="lot-work-column">
          {protocolVersion && guidedStepsV2 && <section className="experiment-surface protocol-lot-runner protocol-lot-runner-v2"><LinearProtocolRunnerV2 lotId={lotId} protocolId={lot.protocolId} versionId={protocolVersion.id} steps={guidedStepsV2} runs={stepRuns} onSave={saveStepRunV2} onSaveMany={saveStepRunsV2} recipePlan={recipePlan} /></section>}
          {!guidedStepsV2 && <section className="experiment-surface migration-state" role="alert"><p className="eyebrow">ประวัติ LOT</p><h2>Lot นี้ใช้คู่มือรุ่นเดิม</h2><p>ระบบเก็บข้อมูลเดิมไว้อ่านอย่างเดียวและจะไม่เดาหรือย้ายสถานะขั้นเก่าเข้าคู่มือใหม่</p><Link className="primary-button" href={`/experiments/new?plant=${encodeURIComponent(lot.plant)}${lot.taxonId ? `&taxon=${encodeURIComponent(lot.taxonId)}` : ""}`}>สร้าง Lot v2 ใหม่</Link></section>}
          <div className="timeline-heading"><div><p className="eyebrow">LOT HISTORY</p><h2>ประวัติเดิม</h2></div><label><input checked={showDeleted} onChange={(e) => setShowDeleted(e.target.checked)} type="checkbox" /> แสดงรายการที่ลบ</label></div>
          <ObservationTimeline observations={observations.filter((item) => item.kind !== "protocol-step-evidence")} onDelete={async () => undefined} onEdit={() => undefined} onRestore={async () => undefined} readOnly renderMedia={item=><div className="observation-media-readonly">{(media[item.id]??[]).filter((mediaItem) => showDeleted || !mediaItem.deletedAt).map((mediaItem) => <a href={mediaItem.secureUrl} key={mediaItem.id} rel="noreferrer" target="_blank"><Image alt={mediaItem.caption || "ภาพจากประวัติ Lot"} height={120} src={mediaItem.secureUrl} unoptimized width={160} /></a>)}</div>} />
        </section>
        <aside className="lot-audit-column"><p className="eyebrow">AUDIT HISTORY</p><h2>ประวัติการเปลี่ยนแปลง</h2><AuditHistory events={audits} /></aside>
      </div>
    </>}
  </LabShell></AuthGate>;
}
