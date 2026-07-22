"use client";

import { useState, type FormEvent } from "react";

import { validateLotInput } from "../../lib/domain/experiment-validation";
import type { CreateLotInput, ExperimentStatus } from "../../lib/domain/models";

type LotFormProps = { onSubmit: (input: CreateLotInput) => Promise<void> };

const initial: CreateLotInput = { id: "", plant: "", protocolId: "protocol-nodal-v01", protocolTitle: "Nodal establishment v0.1", stage: "Establishment", status: "Healthy", startedAt: new Date().toISOString().slice(0, 10) };

export function LotForm({ onSubmit }: LotFormProps) {
  const [value, setValue] = useState(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pending, setPending] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const update = (field: keyof CreateLotInput, next: string) => setValue((current) => ({ ...current, [field]: next }));

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = validateLotInput(value);
    if (!result.ok) return setErrors(result.errors);
    setErrors({}); setSubmitError(""); setPending(true);
    try { await onSubmit(result.value); } catch (error) { setSubmitError(error instanceof Error ? error.message : "บันทึก Lot ไม่สำเร็จ"); } finally { setPending(false); }
  }

  return <form className="lot-form experiment-surface" noValidate onSubmit={submit}>
    <div className="form-heading"><p className="eyebrow">NEW EXPERIMENT</p><h1>สร้าง Experiment Lot</h1><p>เก็บรหัสพืช สูตรตั้งต้น และวันที่เริ่มในโครงสร้างเดียวกัน</p></div>
    {submitError && <p className="form-alert" role="alert">{submitError}</p>}
    <div className="form-grid">
      <Field error={errors.id} label="Lot ID"><input aria-invalid={Boolean(errors.id)} onChange={(e) => update("id", e.target.value)} placeholder="PPP-001" value={value.id} /></Field>
      <Field error={errors.plant} label="ชื่อพืช"><input aria-invalid={Boolean(errors.plant)} onChange={(e) => update("plant", e.target.value)} placeholder="Pink Princess" value={value.plant} /></Field>
      <Field error={errors.protocolTitle} label="Protocol"><input aria-invalid={Boolean(errors.protocolTitle)} onChange={(e) => update("protocolTitle", e.target.value)} value={value.protocolTitle} /></Field>
      <Field error={errors.protocolId} label="Protocol ID"><input aria-invalid={Boolean(errors.protocolId)} onChange={(e) => update("protocolId", e.target.value)} value={value.protocolId} /></Field>
      <Field error={errors.stage} label="Stage"><input aria-invalid={Boolean(errors.stage)} onChange={(e) => update("stage", e.target.value)} value={value.stage} /></Field>
      <Field error={errors.startedAt} label="วันที่เริ่ม"><input aria-invalid={Boolean(errors.startedAt)} onChange={(e) => update("startedAt", e.target.value)} type="date" value={value.startedAt} /></Field>
      <Field error={errors.status} label="สถานะ"><select onChange={(e) => update("status", e.target.value as ExperimentStatus)} value={value.status}><option>Healthy</option><option>Review</option><option>At risk</option><option>Contaminated</option></select></Field>
    </div>
    <div className="form-actions"><button className="primary-button" disabled={pending} type="submit">{pending ? "กำลังบันทึก…" : "สร้าง Lot"}</button></div>
  </form>;
}

function Field({ children, error, label }: { children: React.ReactNode; error?: string; label: string }) {
  return <label className="form-field"><span>{label}</span>{children}{error && <small className="field-error">{error}</small>}</label>;
}
