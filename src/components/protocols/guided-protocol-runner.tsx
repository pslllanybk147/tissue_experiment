"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import type { GuidedStepStatus, ObservationMedia, ProtocolStep, ProtocolStepRun } from "@/lib/domain/models";
import { MediaStrip } from "../media/media-strip";
import { MediaUploader } from "../media/media-uploader";
import { AccessibleAction } from "../common/accessible-action";
import { BeginnerStepGuide } from "./beginner-step-guide";
import { createHaiterActionPlan } from "../../lib/domain/haiter-guidance";

type HaiterDefaults = {
  labelPercent?: number;
  targetPercent?: number;
  mediumVolumeMl?: number;
  minimumToolVolumeMl?: number;
};

type Props = {
  lotId: string;
  protocolId: string;
  versionId: string;
  steps: ProtocolStep[];
  runs: ProtocolStepRun[];
  onSave: (run: Omit<ProtocolStepRun, "id" | "ownerId" | "updatedAt">) => Promise<void>;
  mediaByStep?: Record<string, ObservationMedia[]>;
  onMediaUploaded?: (media: ObservationMedia) => Promise<void>;
  onMediaDelete?: (observationId: string, mediaId: string) => Promise<void>;
  onMediaRestore?: (observationId: string, mediaId: string) => Promise<void>;
  haiterDefaults?: HaiterDefaults;
  recipeHref?: string;
  recipeSummary?: string[];
};

const statuses: GuidedStepStatus[] = ["Passed", "Needs review", "Failed"];
const statusLabels: Record<GuidedStepStatus, string> = {
  Pending: "ยังไม่เริ่ม",
  Passed: "ผ่าน",
  "Needs review": "ต้องตรวจซ้ำ",
  Failed: "ไม่ผ่าน",
};

export function persistedStatusForSave(mode: "draft" | "confirm", status: GuidedStepStatus): GuidedStepStatus {
  return mode === "draft" ? "Pending" : status;
}

export function GuidedProtocolRunner({ lotId, protocolId, versionId, steps, runs, onSave, mediaByStep = {}, onMediaUploaded, onMediaDelete, onMediaRestore, haiterDefaults, recipeHref, recipeSummary = [] }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [stepsOpen, setStepsOpen] = useState(false);
  const [workspaceView, setWorkspaceView] = useState<"manual" | "record">("manual");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [readinessConfirmed, setReadinessConfirmed] = useState(false);
  const contentRef = useRef<HTMLElement>(null);
  const step = steps[activeIndex];
  const run = useMemo(() => runs.find((item) => item.stepId === step?.id), [runs, step]);
  const canProceed = run?.status === "Passed";
  const [status, setStatus] = useState<GuidedStepStatus>(run?.status ?? "Pending");
  const [note, setNote] = useState(run?.note ?? "");
  const [measurements, setMeasurements] = useState<Record<string, number | null>>({
    "haiter-source-percent": haiterDefaults?.labelPercent ?? null,
    "medium-volume-ml": haiterDefaults?.mediumVolumeMl ?? null,
    "minimum-tool-volume-ml": haiterDefaults?.minimumToolVolumeMl ?? null,
    ...(run?.measurements ?? {}),
  });
  const isHaiterCalculation = step?.id === "calculate-haiter-dose";
  const isMediumPreparation = step?.workflowPhase === "medium-preparation"
    || step?.id.includes("prepare-haiter-medium")
    || step?.id.includes("prepare-pressure-medium")
    || step?.id.includes("medium-preparation");
  const haiterPlan = useMemo(() => {
    if (!isHaiterCalculation) return null;
    return createHaiterActionPlan({
      labelPercent: measurements["haiter-source-percent"] ?? null,
      targetPercent: haiterDefaults?.targetPercent ?? 0.003,
      mediumVolumeMl: measurements["medium-volume-ml"] ?? 0,
      minimumToolVolumeMl: measurements["minimum-tool-volume-ml"] ?? 0,
      permittedDiluent: "น้ำปลอดเชื้อ",
    });
  }, [haiterDefaults?.targetPercent, isHaiterCalculation, measurements]);
  const readinessIndex = steps.findIndex((item) => item.workflowPhase === "readiness");
  const readinessRun = readinessIndex >= 0
    ? runs.find((item) => item.stepId === steps[readinessIndex]?.id)
    : undefined;
  const readinessPassed = readinessIndex < 0 || readinessRun?.status === "Passed";

  function focusStepTop() {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const behavior = window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "auto"
          : "smooth";
        contentRef.current?.focus({ preventScroll: true });
        contentRef.current?.scrollIntoView({ behavior, block: "start" });
      });
    });
  }

  function switchWorkspace(view: "manual" | "record") {
    setWorkspaceView(view);
    focusStepTop();
  }

  function select(index: number) {
    const next = steps[index];
    const nextRun = runs.find((item) => item.stepId === next?.id);
    const nextMeasurements = next?.id === "calculate-haiter-dose"
      ? {
          "haiter-source-percent": haiterDefaults?.labelPercent ?? null,
          "medium-volume-ml": haiterDefaults?.mediumVolumeMl ?? null,
          "minimum-tool-volume-ml": haiterDefaults?.minimumToolVolumeMl ?? null,
          ...(nextRun?.measurements ?? {}),
        }
      : nextRun?.measurements ?? {};
    setActiveIndex(index); setWorkspaceView("manual"); setStatus(nextRun?.status ?? "Pending"); setNote(nextRun?.note ?? ""); setMeasurements(nextMeasurements); setReadinessConfirmed(false); setMessage("");
    focusStepTop();
  }

  async function save(mode: "draft" | "confirm") {
    if (!step) return;
    if (mode === "confirm" && step.beginner && !readinessConfirmed) { setMessage("กรุณาตรวจรายการความพร้อมให้ครบก่อนยืนยันผล"); return; }
    const required = step.requiredEvidence ?? [];
    if (mode === "confirm" && required.includes("note") && !note.trim()) { setMessage("ขั้นนี้ต้องมี note ก่อนยืนยันผล"); return; }
    const missingMeasurement = (step.measurements ?? []).some((item) => item.required && measurements[item.id] == null);
    if (mode === "confirm" && required.includes("measurement") && missingMeasurement) { setMessage("กรุณากรอกค่าที่วัดให้ครบ"); return; }
    const photoCount = mediaByStep[step.id]?.filter((item) => !item.deletedAt).length ?? 0;
    if (mode === "confirm" && required.includes("photo") && photoCount === 0) { setMessage("ขั้นนี้ต้องมีรูปหลักฐานอย่างน้อย 1 รูปก่อนยืนยันผล"); return; }
    setSaving(true); setMessage("");
    try {
      await onSave({ lotId, protocolId, versionId, stepId: step.id, status: persistedStatusForSave(mode, status), note, measurements, mediaIds: run?.mediaIds ?? [], evidenceObservationId: run?.evidenceObservationId, observedAt: new Date().toISOString() });
      setMessage(mode === "draft" ? "บันทึกร่างแล้ว คุณกลับมาแก้หรือเพิ่มรูปได้" : "ยืนยันผลขั้นนี้แล้ว");
    } catch (error) { setMessage(error instanceof Error ? error.message : "บันทึกผลไม่สำเร็จ"); }
    finally { setSaving(false); }
  }

  if (!step) return <p className="route-state">ยังไม่มีขั้นตอนใน Protocol version นี้</p>;
  return <div className={`guided-runner-shell${stepsOpen ? " steps-open" : ""}`}>
    <button aria-controls="guided-protocol-step-list" aria-expanded={stepsOpen} className="guided-steps-toggle" onClick={() => setStepsOpen((open) => !open)} type="button"><span aria-hidden="true">☰</span>{stepsOpen ? "ซ่อนรายการขั้นตอน" : "เปิดรายการขั้นตอน"}<small>ขั้นที่ {activeIndex + 1} / {steps.length}</small></button>
    <div className="guided-runner">
    <aside className="guided-step-list" aria-label="รายการขั้นตอน" id="guided-protocol-step-list">
      <p className="eyebrow">GUIDED PROTOCOL</p>
      {steps.map((item, index) => { const itemRun = runs.find((entry) => entry.stepId === item.id); const locked = readinessIndex >= 0 && index > readinessIndex && !readinessPassed; return <button aria-disabled={locked} className={index === activeIndex ? "active" : ""} disabled={locked} key={item.id} onClick={() => select(index)} type="button"><span>{itemRun?.status === "Passed" ? "✓" : locked ? "🔒" : index + 1}</span><strong>{item.title}</strong><small>{locked ? "รอตรวจความพร้อม" : statusLabels[itemRun?.status ?? "Pending"]}</small></button>; })}
    </aside>
    <section className="guided-step-content" aria-live="polite" ref={contentRef} tabIndex={-1}>
      <div className="guided-step-heading"><div><span className="step-kicker">ขั้นที่ {activeIndex + 1} / {steps.length}</span><h3>{step.title}</h3></div><span className={`evidence-label evidence-${step.evidenceState.toLowerCase().replaceAll(" ", "-")}`}>{step.evidenceState}</span></div>
      {!readinessPassed && activeIndex <= readinessIndex && <div className="guided-readiness-warning" role="note"><strong>อย่าเพิ่งตัดต้นไม้</strong><span>ขั้นตัดจะเปิดเมื่ออาหารและพื้นที่พร้อม และบันทึก Blank test หรือเหตุผลที่ข้ามแล้ว</span></div>}
      <div className="guided-workspace-tabs" role="tablist" aria-label="คู่มือและแบบบันทึก">
        <button aria-selected={workspaceView === "manual"} className={workspaceView === "manual" ? "active" : ""} onClick={() => switchWorkspace("manual")} role="tab" type="button">1. อ่านคู่มือ</button>
        <button aria-selected={workspaceView === "record"} className={workspaceView === "record" ? "active" : ""} onClick={() => switchWorkspace("record")} role="tab" type="button">2. บันทึกผลขั้นนี้</button>
      </div>
      <div className="guided-manual-pane" hidden={workspaceView !== "manual"} role="tabpanel">
      {isMediumPreparation && recipeHref ? (
        <aside className="guided-recipe-link" role="note">
          <div>
            <strong>สูตรอาหารของ Lot นี้</strong>
            {haiterDefaults?.mediumVolumeMl ? <p><strong>ปริมาตรของ Lot: {haiterDefaults.mediumVolumeMl} mL</strong></p> : null}
            {recipeSummary.length ? <ul>{recipeSummary.map((item) => <li key={item}>{item}</li>)}</ul> : <p>เปิดเครื่องคำนวณตามจำนวนกระปุก พร้อมตารางส่วนผสม pH และวิธีเจือจาง stock ปริมาตรเล็ก</p>}
          </div>
          <Link className="primary-button" href={recipeHref} target="_blank" rel="noreferrer">เปิดสูตรอาหารและเครื่องคำนวณ ↗</Link>
        </aside>
      ) : null}
      {step.beginner ? (
        <BeginnerStepGuide
          key={step.id}
          instruction={step.beginner}
          onReadinessChange={setReadinessConfirmed}
          onUncertainty={(path) => {
            setStatus(path.blocksCompletion ? "Needs review" : status);
            setNote(path.safeAction);
            setMessage(path.safeAction);
          }}
        />
      ) : (
        <div className="migration-state" role="note">
          <strong>คู่มือเวอร์ชันเก่ายังไม่มีคำอธิบายสำหรับมือใหม่</strong>
          <p>หยุดไว้ก่อนและสร้าง Lot จาก Wizard ด้วย Protocol เวอร์ชันล่าสุด</p>
        </div>
      )}
      <button className="accessible-action accessible-action-primary guided-next-pane" onClick={() => switchWorkspace("record")} type="button">อ่านจบแล้ว ไปบันทึกผลขั้นนี้</button>
      </div>
      <div className="guided-record-pane" hidden={workspaceView !== "record"} role="tabpanel">
      <div className="guided-record-intro">
        <strong>แบบบันทึกขั้นที่ {activeIndex + 1}</strong>
        <p>กรอกเฉพาะสิ่งที่ทำและเห็นจริง หากจำวิธีทำไม่ได้ให้กลับไปอ่านคู่มือก่อน</p>
        <button className="secondary-button" onClick={() => switchWorkspace("manual")} type="button">ย้อนกลับไปอ่านคู่มือ</button>
      </div>
      {(step.measurements?.length ?? 0) > 0 && <div className={`guided-measurements${isHaiterCalculation ? " haiter-inline-calculator" : ""}`}><h4>{isHaiterCalculation ? "กรอกตัวเลข 3 ช่องนี้" : "ค่าที่ต้องวัด"}</h4>{isHaiterCalculation && <p className="muted-copy">ใช้ตัวเลขที่เห็นจริง ระบบใช้ค่าคลอรีนเป้าหมาย {haiterDefaults?.targetPercent ?? 0.003}% ตาม Protocol นี้</p>}{step.measurements?.map((item) => <label className="form-field" key={item.id}><span>{item.label} ({item.unit}){item.required ? " *" : ""}</span><input min={item.min} max={item.max} onChange={(event) => setMeasurements((current) => ({ ...current, [item.id]: event.target.value === "" ? null : Number(event.target.value) }))} type="number" value={measurements[item.id] ?? ""} /></label>)}{haiterPlan && <div className={`haiter-plan haiter-plan-${haiterPlan.state}`} role="status">{haiterPlan.state === "blocked" ? <><strong>ยังคำนวณไม่ได้</strong><p>{haiterPlan.reason}</p><p>{haiterPlan.safeAction}</p></> : <><strong>{haiterPlan.primaryInstruction}</strong><ol>{haiterPlan.actions.map((action) => <li key={action}>{action}</li>)}</ol></>}</div>}</div>}
      <label className="form-field guided-note"><span>บันทึก note {step.requiredEvidence?.includes("note") ? "*" : ""}</span><textarea onChange={(event) => setNote(event.target.value)} rows={4} value={note} placeholder="เขียนสิ่งที่พบจริง เช่น สี เนื้อเยื่อ กลิ่น หรือปัญหา" /></label>
      {step.allowPhoto && <div className="guided-photo-evidence"><h4>หลักฐานภาพของขั้นนี้</h4>{run?.evidenceObservationId && onMediaUploaded ? <><MediaStrip items={mediaByStep[step.id] ?? []} onDelete={async (mediaId) => { if (onMediaDelete) await onMediaDelete(run.evidenceObservationId!, mediaId); }} onRestore={async (mediaId) => { if (onMediaRestore) await onMediaRestore(run.evidenceObservationId!, mediaId); }} /><MediaUploader actionLabel="เลือกหรือถ่ายรูปของขั้นนี้" lotId={lotId} observationId={run.evidenceObservationId} onUploaded={onMediaUploaded} purpose="ใช้ยืนยันว่าคุณทำขั้นตอนนี้กับของจริง" requiredFrame={step.beginner?.evidencePrompt ?? []} /></> : <p className="muted-copy">กด “บันทึกร่าง” ก่อน แล้วระบบจะเปิดพื้นที่อัปโหลดภาพของขั้นนี้ จากนั้นจึงยืนยันผล</p>}</div>}
      <div className="guided-status"><span>ผลลัพธ์</span>{statuses.map((item) => <label key={item}><input aria-label={statusLabels[item]} checked={status === item} onChange={() => setStatus(item)} name={`status-${step.id}`} type="radio" /> {statusLabels[item]}</label>)}</div>
      {message && <p className="form-alert" role="status">{message}</p>}
      <div className="guided-next"><p><strong>ถ้าผ่าน:</strong> {step.nextActionOnPass}</p><p><strong>ถ้าไม่ผ่าน:</strong> {step.nextActionOnFail}</p></div>
      <div className="form-actions"><AccessibleAction disabled={activeIndex === 0} onClick={() => select(activeIndex - 1)}>ไปขั้นก่อนหน้า</AccessibleAction><AccessibleAction disabled={saving} onClick={() => void save("draft")}>บันทึกร่าง</AccessibleAction><AccessibleAction intent="primary" disabled={saving || Boolean(step.beginner && !readinessConfirmed)} onClick={() => void save("confirm")}>{saving ? "กำลังบันทึก…" : "ยืนยันผลของขั้นนี้"}</AccessibleAction><AccessibleAction aria-describedby={!canProceed ? `next-step-help-${step.id}` : undefined} disabled={activeIndex === steps.length - 1 || !canProceed} onClick={() => select(activeIndex + 1)}>ไปขั้นถัดไป</AccessibleAction></div>
      {!canProceed && activeIndex < steps.length - 1 && <p className="muted-copy" id={`next-step-help-${step.id}`}>{run?.status === "Failed" ? "ขั้นนี้ไม่ผ่าน ให้ทำตามคำแนะนำการแก้ไขแล้วบันทึกผลใหม่ก่อน" : run?.status === "Needs review" ? "ขั้นนี้ต้องตรวจซ้ำตาม self-check และบันทึกผลใหม่ก่อน จึงจะไปขั้นถัดไปได้" : "บันทึกผลขั้นนี้ก่อน จึงจะไปขั้นถัดไปได้"}</p>}
      </div>
    </section>
    </div>
  </div>;
}
