"use client";

import { useState, type FormEvent } from "react";
import { validateObservationInput } from "../../lib/domain/experiment-validation";
import type { Observation, ObservationInput } from "../../lib/domain/models";

type ObservationFormProps = { defaultStage: string; editing?: Observation | null; onCancel?: () => void; onSubmit: (input: ObservationInput) => Promise<void> };
function blank(stage: string): ObservationInput { return { observedAt: new Date().toISOString().slice(0, 16), status: "Healthy", stage, note: "", shootCount: null, rootCount: null, contaminationCount: null }; }
function count(value: string): number | null { return value === "" ? null : Number(value); }

export function ObservationForm({ defaultStage, editing = null, onCancel, onSubmit }: ObservationFormProps) {
  const [value, setValue] = useState<ObservationInput>(() => editing ?? blank(defaultStage));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pending, setPending] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const update = <K extends keyof ObservationInput>(field: K, next: ObservationInput[K]) => setValue((current) => ({ ...current, [field]: next }));
  async function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); const result = validateObservationInput(value); if (!result.ok) return setErrors(result.errors); setErrors({}); setSubmitError(""); setPending(true); try { await onSubmit(result.value); if (!editing) setValue(blank(defaultStage)); } catch (error) { setSubmitError(error instanceof Error ? error.message : "บันทึก observation ไม่สำเร็จ"); } finally { setPending(false); } }
  return <form className="observation-form" noValidate onSubmit={submit}>
    <div className="observation-form-heading"><div><p className="eyebrow">{editing ? "EDIT RECORD" : "NEW RECORD"}</p><h2>{editing ? "แก้ไข Observation" : "เพิ่ม Observation"}</h2></div>{editing && onCancel && <button className="quiet-button" onClick={onCancel} type="button">ยกเลิก</button>}</div>
    {submitError && <p className="form-alert" role="alert">{submitError}</p>}
    <div className="observation-grid">
      <Field error={errors.observedAt} label="วันที่สังเกต"><input onChange={(e) => update("observedAt", e.target.value)} type="datetime-local" value={value.observedAt} /></Field>
      <Field error={errors.status} label="สถานะ"><select onChange={(e) => update("status", e.target.value as ObservationInput["status"])} value={value.status}><option>Healthy</option><option>Review</option><option>At risk</option><option>Contaminated</option></select></Field>
      <Field error={errors.stage} label="Stage"><input onChange={(e) => update("stage", e.target.value)} value={value.stage} /></Field>
      <Field error={errors.shootCount} label="จำนวนยอด"><input min="0" onChange={(e) => update("shootCount", count(e.target.value))} type="number" value={value.shootCount ?? ""} /></Field>
      <Field error={errors.rootCount} label="จำนวนราก"><input min="0" onChange={(e) => update("rootCount", count(e.target.value))} type="number" value={value.rootCount ?? ""} /></Field>
      <Field error={errors.contaminationCount} label="จุดปนเปื้อน"><input min="0" onChange={(e) => update("contaminationCount", count(e.target.value))} type="number" value={value.contaminationCount ?? ""} /></Field>
      <label className="form-field observation-note"><span>บันทึก</span><textarea onChange={(e) => update("note", e.target.value)} rows={4} value={value.note} />{errors.note && <small className="field-error">{errors.note}</small>}</label>
    </div>
    <button className="primary-button" disabled={pending} type="submit">{pending ? "กำลังบันทึก…" : editing ? "บันทึกการแก้ไข" : "เพิ่ม Observation"}</button>
  </form>;
}
function Field({ children, error, label }: { children: React.ReactNode; error?: string; label: string }) { return <label className="form-field"><span>{label}</span>{children}{error && <small className="field-error">{error}</small>}</label>; }
