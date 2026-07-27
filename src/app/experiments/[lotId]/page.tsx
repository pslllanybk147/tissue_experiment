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
import type { LotRecipePlan } from "@/components/protocols/inline-lot-recipe";
import { MediaStrip } from "@/components/media/media-strip";
import { MediaUploader } from "@/components/media/media-uploader";
import type { AuditEvent, ExperimentLot, Observation, ObservationInput, ObservationMedia, ProtocolStepRun, ProtocolVersion } from "@/lib/domain/models";
import { getExperimentRepository } from "@/lib/repositories/experiment-repository-factory";
import { getProtocolRepository } from "@/lib/repositories/protocol-repository-factory";
import { getMediaRepository } from "@/lib/repositories/media-repository-factory";
import { getStepRunRepository } from "@/lib/repositories/step-run-repository-factory";
import { composeGuidedSteps, profileById } from "@/lib/domain/sterilization-profiles";
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
  const [editing, setEditing] = useState<Observation | null>(null);
  const [showDeleted, setShowDeleted] = useState(false);
  const [state, setState] = useState<"loading" | "ready" | "missing" | "error">("loading");
  const [protocolVersion, setProtocolVersion] = useState<ProtocolVersion | null>(null);
  const [media, setMedia] = useState<Record<string,ObservationMedia[]>>({});
  const [stepRuns, setStepRuns] = useState<ProtocolStepRun[]>([]);
  const stepMedia = Object.fromEntries(stepRuns.map((run) => [run.stepId, media[run.evidenceObservationId ?? ""] ?? []]));
  const recipeHref = lot?.taxonId
    ? `/knowledge/taxa/${encodeURIComponent(lot.taxonId)}#media-recipes`
    : lot?.protocolId.includes("pink-princess") || lot?.protocolTitle.toLowerCase().includes("pink princess")
      ? "/knowledge/taxa/cultivar-pink-princess#media-recipes"
      : lot?.protocolId.includes("violin") || lot?.protocolTitle.toLowerCase().includes("violin")
        ? "/knowledge/taxa/trade-name-violin-variegated#media-recipes"
        : "/knowledge";
  const recipePlan = useMemo<LotRecipePlan | undefined>(() => {
    if (!lot?.sterilization?.mediumVolumeMl) return undefined;
    const taxonId = lot.taxonId
      ?? (lot.protocolTitle.toLowerCase().includes("pink princess") ? "cultivar-pink-princess"
        : lot.protocolTitle.toLowerCase().includes("violin") ? "trade-name-violin-variegated" : "");
    const recipe = monographForTaxon(taxonId)?.tissueCulture.mediaRecipes.find((item) => item.id === "establishment");
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
        amount: item.unit === "×" ? item.amountPerLiter : Number((item.amountPerLiter * volume / 1000).toFixed(6)),
        unit: item.unit === "×" ? "×" : item.unit.replace("/L", ""),
        note: item.note,
      })),
    };
  }, [lot]);
  const guidedSteps = useMemo(() => {
    if (!lot?.sterilization || !protocolVersion) return null;
    try {
      const composed = composeGuidedSteps(
        protocolVersion.steps,
        profileById(lot.sterilization.profileId),
        lot.sterilization.workspace,
      );
      if (!recipePlan) return composed;
      const exactActions = [
        `ใช้สูตร “${recipePlan.title}” สถานะหลักฐาน ${recipePlan.evidenceState}`,
        `เตรียมอาหารรวม ${recipePlan.volumeMl} mL ตาม batch ที่บันทึกไว้ ห้ามเปลี่ยนจำนวนกระปุกในขั้นนี้`,
        ...recipePlan.ingredients.map((item) => item.unit === "mg"
          ? `${item.name}: ต้องมี ${item.amount} mg — กรอกความเข้มข้นบนฉลาก stock ในเครื่องคำนวณที่แสดงบนหน้านี้ แล้วทำตามคำสั่งตวง`
          : item.unit === "×"
            ? `${item.name}: ใช้ ${item.amount}× และอ่านอัตราผสมจากฉลากสำหรับปริมาตร ${recipePlan.volumeMl} mL`
            : `${item.name}: ชั่ง ${item.amount} ${item.unit}`),
        `เติมน้ำให้ใกล้ ${recipePlan.volumeMl} mL คนให้ละลาย แล้วปรับ pH เป็น ${recipePlan.pH}`,
        `ปรับปริมาตรสุดท้ายให้ครบ ${recipePlan.volumeMl} mL จากนั้นทำให้วุ้นละลายตามวิธีของห้อง`,
        "แบ่งลงภาชนะตามจำนวนใน batch ปิดฝา และติดฉลากรหัส Lot สูตร ปริมาตร วันที่ และวิธีฆ่าเชื้อ",
      ];
      return composed.map((step) => {
        const isMedium = step.id.includes("prepare-haiter-medium")
          || step.id.includes("prepare-pressure-medium");
        if (!isMedium || !step.beginner) return step;
        return {
          ...step,
          beginner: {
            ...step.beginner,
            currentAction: `เตรียมสูตร ${recipePlan.title} ปริมาตร ${recipePlan.volumeMl} mL ตาม batch ของ Lot นี้`,
            actions: exactActions,
            whatToFind: [
              `ชื่อสูตร ${recipePlan.title}`,
              `ปริมาตรรวม ${recipePlan.volumeMl} mL`,
              `pH ${recipePlan.pH}`,
              "ฉลากทุกภาชนะตรงกับ Lot และ batch เดียวกัน",
            ],
          },
        };
      });
    } catch {
      return null;
    }
  }, [lot, protocolVersion, recipePlan]);

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
  async function save(input: ObservationInput) { if (editing) await repository.updateObservation(ownerId, lotId, editing.id, input); else await repository.createObservation(ownerId, lotId, input); setEditing(null); await load(); }
  async function remove(id: string) { if (!window.confirm("ซ่อน observation นี้จาก timeline? สามารถกู้คืนได้ภายหลัง")) return; await repository.softDeleteObservation(ownerId, lotId, id); await load(); }
  async function restore(id: string) { await repository.restoreObservation(ownerId, lotId, id); await load(); }
  async function saveMedia(item:ObservationMedia){await mediaRepository.save(ownerId,item);setMedia(current=>({...current,[item.observationId]:[...(current[item.observationId]??[]),item]}));}
  async function addToDataset(item: ObservationMedia) {
    const user = (await import("@/lib/firebase/client")).getFirebaseServices()?.auth.currentUser;
    if (!user) throw new Error("กรุณาเข้าสู่ระบบก่อนส่งรูปเข้า Image review");
    const token = await user.getIdToken(true);
    const response = await fetch("/api/dataset/intake", { method: "POST", headers: { authorization: `Bearer ${token}`, "content-type": "application/json" }, body: JSON.stringify({ lotId, observationId: item.observationId, mediaId: item.id }) });
    if (!response.ok) { const body = await response.json().catch(() => ({})) as { error?: string }; throw new Error(body.error || "ส่งรูปเข้า Image review ไม่สำเร็จ"); }
  }
  async function deleteMedia(observationId:string,mediaId:string){const deleted=await mediaRepository.softDelete(ownerId,lotId,observationId,mediaId);setMedia(current=>({...current,[observationId]:(current[observationId]??[]).map(item=>item.id===mediaId?deleted:item)}));}
  async function restoreMedia(observationId:string,mediaId:string){await mediaRepository.restore(ownerId,lotId,observationId,mediaId);setMedia(current=>({...current,[observationId]:(current[observationId]??[]).map(item=>item.id===mediaId?{...item,deletedAt:null}:item)})); await load();}
  async function deleteLot() { if (!lot || !window.confirm(`เก็บ Lot ${lot.id} เข้าถังขยะ? ข้อมูลจะยังอยู่และกู้คืนได้`)) return; await repository.softDeleteLot(ownerId, lotId); await load(); }
  async function restoreLot() { await repository.restoreLot(ownerId, lotId); await load(); }
  async function saveStepRun(input: Omit<ProtocolStepRun, "id" | "ownerId" | "updatedAt">) {
    let evidenceObservationId = input.evidenceObservationId;
    if (!evidenceObservationId) {
      const evidence = await repository.createObservation(ownerId, lotId, { observedAt: input.observedAt, status: "Review", stage: `Protocol step evidence: ${input.stepId}`, note: "ระบบสร้าง container สำหรับเก็บภาพหลักฐานของ Guided Protocol step", shootCount: null, rootCount: null, contaminationCount: null, kind: "protocol-step-evidence", protocolStepId: input.stepId });
      evidenceObservationId = evidence.id;
      setObservations((current) => [...current, { ...evidence, kind: "protocol-step-evidence", protocolStepId: input.stepId }]);
    }
    await stepRunRepository.save(ownerId, { ...input, evidenceObservationId });
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
        <section className="lot-work-column">{protocolVersion && guidedSteps && <section className="experiment-surface protocol-lot-runner"><div className="timeline-heading"><div><p className="eyebrow">PROTOCOL PROGRESS</p><h2>{lot.protocolTitle}</h2><p className="muted-copy">ทำตามทีละขั้น บันทึกผลจริง แล้วระบบจะเก็บหลักฐานไว้กับ Lot นี้</p></div><Link href={`/protocols/${lot.protocolId}`}>เปิด Protocol</Link></div><GuidedProtocolRunner haiterDefaults={lot.sterilization?.method === "haiter-chemical" ? { labelPercent: lot.sterilization.activeChlorinePercent, targetPercent: lot.sterilization.targetChlorinePercent, mediumVolumeMl: lot.sterilization.mediumVolumeMl, minimumToolVolumeMl: lot.sterilization.minimumToolVolumeMl } : undefined} lotId={lotId} protocolId={lot.protocolId} versionId={protocolVersion.id} steps={guidedSteps} runs={stepRuns} onSave={saveStepRun} mediaByStep={stepMedia} onMediaUploaded={saveMedia} onMediaDelete={deleteMedia} onMediaRestore={restoreMedia} recipeHref={recipeHref} recipePlan={recipePlan} /></section>}
          {protocolVersion && !lot.sterilization && <section className="experiment-surface migration-state" role="alert"><p className="eyebrow">LEGACY LOT</p><h2>Lot นี้ยังไม่ได้เลือกวิธีฆ่าเชื้ออาหาร</h2><p>เพื่อไม่แก้ประวัติเดิม ระบบจะไม่เดาวิธีให้ กรุณาสร้าง Lot รอบใหม่ผ่าน Wizard แล้วเลือก Haiter หรือหม้อนึ่งแรงดันก่อนเริ่ม</p><Link className="primary-button" href={`/experiments/new?plant=${encodeURIComponent(lot.plant)}${lot.taxonId ? `&taxon=${encodeURIComponent(lot.taxonId)}` : ""}`}>สร้าง Lot ใหม่ด้วย Wizard</Link></section>}
          {protocolVersion && lot.sterilization && !guidedSteps && <section className="route-state error" role="alert">ไม่พบ Sterilization Profile version ที่ Lot นี้ใช้ กรุณาตรวจ audit และ profile ID</section>}
          <ObservationForm defaultStage={lot.stage} editing={editing} key={editing?.id ?? "new"} onCancel={() => setEditing(null)} onSubmit={save} />
          <div className="timeline-heading"><div><p className="eyebrow">OBSERVATION TIMELINE</p><h2>บันทึกผล</h2></div><label><input checked={showDeleted} onChange={(e) => setShowDeleted(e.target.checked)} type="checkbox" /> แสดงรายการที่ลบ</label></div>
          <ObservationTimeline observations={observations.filter((item) => item.kind !== "protocol-step-evidence")} onDelete={remove} onEdit={setEditing} onRestore={restore} renderMedia={item=><div className="observation-media"><MediaStrip items={(media[item.id]??[]).filter((mediaItem) => showDeleted || !mediaItem.deletedAt)} onDelete={id=>deleteMedia(item.id,id)} onRestore={id=>restoreMedia(item.id,id)} onAddToDataset={addToDataset} />{!item.deletedAt&&<MediaUploader lotId={lotId} observationId={item.id} onUploaded={saveMedia}/>}</div>} />
        </section>
        <aside className="lot-audit-column"><p className="eyebrow">AUDIT HISTORY</p><h2>ประวัติการเปลี่ยนแปลง</h2><AuditHistory events={audits} /></aside>
      </div>
    </>}
  </LabShell></AuthGate>;
}
