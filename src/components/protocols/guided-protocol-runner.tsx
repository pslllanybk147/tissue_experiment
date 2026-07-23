"use client";

import { useMemo, useState } from "react";
import type { GuidedStepStatus, ProtocolStep, ProtocolStepRun } from "@/lib/domain/models";

type Props = {
  lotId: string;
  protocolId: string;
  versionId: string;
  steps: ProtocolStep[];
  runs: ProtocolStepRun[];
  onSave: (run: Omit<ProtocolStepRun, "id" | "ownerId" | "updatedAt">) => Promise<void>;
};

const statuses: GuidedStepStatus[] = ["Passed", "Needs review", "Failed"];

export function GuidedProtocolRunner({ lotId, protocolId, versionId, steps, runs, onSave }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const step = steps[activeIndex];
  const run = useMemo(() => runs.find((item) => item.stepId === step?.id), [runs, step]);
  const [status, setStatus] = useState<GuidedStepStatus>(run?.status ?? "Pending");
  const [note, setNote] = useState(run?.note ?? "");
  const [measurements, setMeasurements] = useState<Record<string, number | null>>(run?.measurements ?? {});

  function select(index: number) {
    const next = steps[index];
    const nextRun = runs.find((item) => item.stepId === next?.id);
    setActiveIndex(index); setStatus(nextRun?.status ?? "Pending"); setNote(nextRun?.note ?? ""); setMeasurements(nextRun?.measurements ?? {}); setMessage("");
  }

  async function save() {
    if (!step) return;
    const required = step.requiredEvidence ?? [];
    if (required.includes("note") && !note.trim()) { setMessage("ขั้นนี้ต้องมี note ก่อนบันทึก"); return; }
    const missingMeasurement = (step.measurements ?? []).some((item) => item.required && measurements[item.id] == null);
    if (required.includes("measurement") && missingMeasurement) { setMessage("กรุณากรอกค่าที่วัดให้ครบ"); return; }
    setSaving(true); setMessage("");
    try {
      await onSave({ lotId, protocolId, versionId, stepId: step.id, status, note, measurements, mediaIds: run?.mediaIds ?? [], observedAt: new Date().toISOString() });
      setMessage("บันทึกผลแล้ว");
    } catch (error) { setMessage(error instanceof Error ? error.message : "บันทึกผลไม่สำเร็จ"); }
    finally { setSaving(false); }
  }

  if (!step) return <p className="route-state">ยังไม่มีขั้นตอนใน Protocol version นี้</p>;
  return <div className="guided-runner">
    <aside className="guided-step-list" aria-label="รายการขั้นตอน">
      <p className="eyebrow">GUIDED PROTOCOL</p>
      {steps.map((item, index) => { const itemRun = runs.find((entry) => entry.stepId === item.id); return <button className={index === activeIndex ? "active" : ""} key={item.id} onClick={() => select(index)} type="button"><span>{itemRun?.status === "Passed" ? "✓" : index + 1}</span><strong>{item.title}</strong><small>{itemRun?.status ?? "ยังไม่เริ่ม"}</small></button>; })}
    </aside>
    <section className="guided-step-content" aria-live="polite">
      <div className="guided-step-heading"><div><span className="step-kicker">ขั้นที่ {activeIndex + 1} / {steps.length}</span><h3>{step.title}</h3></div><span className={`evidence-label evidence-${step.evidenceState.toLowerCase().replaceAll(" ", "-")}`}>{step.evidenceState}</span></div>
      <GuideBlock title="ทำอะไร" value={step.objective ?? step.instruction} />
      <GuideBlock title="ทำไมสำคัญ" value={step.whyItMatters} />
      <GuideList title="เตรียมอะไร" items={step.materials} />
      <GuideBlock title="วิธีทำ" value={step.instruction} />
      <GuideList title="จุดควบคุมและความปลอดภัย" items={[...(step.criticalControls ?? []), ...(step.safetyNotes ?? [])]} />
      <GuideBlock title="ผลที่ควรเห็น" value={step.expectedResult} />
      <div className="guided-criteria"><GuideList title="ผ่านเมื่อ" items={step.passCriteria} /><GuideList title="ไม่ผ่านเมื่อ" items={step.failCriteria} /></div>
      {(step.measurements?.length ?? 0) > 0 && <div className="guided-measurements"><h4>ค่าที่ต้องวัด</h4>{step.measurements?.map((item) => <label className="form-field" key={item.id}><span>{item.label} ({item.unit}){item.required ? " *" : ""}</span><input min={item.min} max={item.max} onChange={(event) => setMeasurements((current) => ({ ...current, [item.id]: event.target.value === "" ? null : Number(event.target.value) }))} type="number" value={measurements[item.id] ?? ""} /></label>)}</div>}
      <label className="form-field guided-note"><span>บันทึก note {step.requiredEvidence?.includes("note") ? "*" : ""}</span><textarea onChange={(event) => setNote(event.target.value)} rows={4} value={note} placeholder="เขียนสิ่งที่พบจริง เช่น สี เนื้อเยื่อ กลิ่น หรือปัญหา" /></label>
      <div className="guided-status"><span>ผลลัพธ์</span>{statuses.map((item) => <label key={item}><input checked={status === item} onChange={() => setStatus(item)} name={`status-${step.id}`} type="radio" /> {item}</label>)}</div>
      {message && <p className="form-alert" role="status">{message}</p>}
      <div className="guided-next"><p><strong>ถ้าผ่าน:</strong> {step.nextActionOnPass}</p><p><strong>ถ้าไม่ผ่าน:</strong> {step.nextActionOnFail}</p></div>
      <div className="form-actions"><button className="quiet-button" disabled={activeIndex === 0} onClick={() => select(activeIndex - 1)} type="button">ก่อนหน้า</button><button className="primary-button" disabled={saving} onClick={() => void save()} type="button">{saving ? "กำลังบันทึก…" : "บันทึกผลขั้นนี้"}</button><button className="quiet-button" disabled={activeIndex === steps.length - 1} onClick={() => select(activeIndex + 1)} type="button">ถัดไป</button></div>
    </section>
  </div>;
}

function GuideBlock({ title, value }: { title: string; value?: string }) { return value ? <div className="guide-block"><h4>{title}</h4><p>{value}</p></div> : null; }
function GuideList({ title, items }: { title: string; items?: string[] }) { return items?.length ? <div className="guide-block"><h4>{title}</h4><ul>{items.map((item) => <li key={item}>{item}</li>)}</ul></div> : null; }
