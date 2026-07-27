"use client";

import { useState, type FormEvent } from "react";
import type { EvidenceState, ProtocolDraftInput, ProtocolStep } from "../../lib/domain/models";
import { validateProtocolDraft } from "../../lib/domain/protocol-validation";
import { createBeginnerInstruction } from "../../lib/domain/zero-knowledge-protocol";

const splitLines = (value: string) => value.split("\n").map((item) => item.trim()).filter(Boolean);

function beginnerStep(order: number, source?: ProtocolStep): ProtocolStep {
  const title = source?.title || "";
  const instruction = source?.instruction || "";
  const materials = source?.materials?.length ? source.materials : ["แบบบันทึก", "อุปกรณ์ที่ระบุในขั้นนี้"];
  const passCriteria = source?.passCriteria?.length ? source.passCriteria : ["ทำครบตามวิธีและผลตรงกับเกณฑ์"];
  const failCriteria = source?.failCriteria?.length ? source.failCriteria : ["ข้อมูล อุปกรณ์ หรือผลไม่ตรงกับคำแนะนำ"];
  return {
    ...(source ?? {}),
    id: source?.id ?? crypto.randomUUID(),
    order,
    title,
    instruction,
    durationMinutes: source?.durationMinutes ?? null,
    criticalControls: source?.criticalControls ?? ["ห้ามเดาค่าหรือข้ามขั้น"],
    safetyNotes: source?.safetyNotes ?? ["หยุดเมื่อสภาพไม่ตรงกับคำแนะนำ"],
    referenceIds: source?.referenceIds ?? [],
    evidenceState: source?.evidenceState ?? "Pending review",
    objective: source?.objective || title || "ระบุเป้าหมายของขั้นนี้",
    whyItMatters: source?.whyItMatters || "อธิบายว่าขั้นนี้ช่วยควบคุมผลหรือความเสี่ยงอย่างไร",
    prerequisites: source?.prerequisites ?? ["อ่านขั้นก่อนหน้าและตรวจความพร้อม"],
    materials,
    expectedResult: source?.expectedResult || "ระบุผลที่มองเห็นหรือวัดได้",
    passCriteria,
    failCriteria,
    nextActionOnPass: source?.nextActionOnPass || "ไปขั้นถัดไป",
    nextActionOnFail: source?.nextActionOnFail || "หยุด บันทึกผล และทำ self-check ของขั้นนี้",
    requiredEvidence: source?.requiredEvidence?.length ? source.requiredEvidence : ["note"],
    allowPhoto: source?.allowPhoto ?? true,
    allowNote: source?.allowNote ?? true,
    beginner: source?.beginner ?? createBeginnerInstruction({
      currentAction: title || "ระบุสิ่งที่ผู้ใช้ต้องทำ",
      actions: instruction ? [instruction] : ["เขียนวิธีทำเป็นข้อสั้น ๆ ตามลำดับ"],
      materials,
      whatToFind: [source?.expectedResult || "ระบุสิ่งที่ต้องมองหา"],
      stopConditions: failCriteria,
      readyChecklist: passCriteria,
      evidencePrompt: ["บันทึกสิ่งที่ทำและผลที่เห็นจริง"],
      scienceNote: source?.whyItMatters || "อธิบายเหตุผลทางวิทยาศาสตร์ของขั้นนี้",
    }),
  };
}

export function ProtocolEditor({ initialValue, onSubmit }: { initialValue: ProtocolDraftInput; onSubmit: (value: ProtocolDraftInput) => Promise<void> }) {
  const [value, setValue] = useState(initialValue);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const updateStep = (index: number, patch: Partial<ProtocolStep>) => setValue((current) => ({ ...current, steps: current.steps.map((step, itemIndex) => itemIndex === index ? { ...step, ...patch } : step) }));
  const move = (index: number, delta: number) => setValue((current) => {
    const steps = [...current.steps];
    const target = index + delta;
    if (target < 0 || target >= steps.length) return current;
    [steps[index], steps[target]] = [steps[target], steps[index]];
    return { ...current, steps: steps.map((step, order) => ({ ...step, order })) };
  });
  const add = () => setValue((current) => ({ ...current, steps: [...current.steps, beginnerStep(current.steps.length)] }));

  async function submit(event: FormEvent) {
    event.preventDefault();
    const errors = validateProtocolDraft(value);
    if (Object.keys(errors).length) {
      const stepMessages = errors.stepFields ? Object.values(errors.stepFields) : [];
      setError([...Object.values(errors).filter((item) => typeof item === "string"), ...stepMessages].join(" · "));
      return;
    }
    setError("");
    setPending(true);
    try { await onSubmit(value); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "บันทึก Protocol ไม่สำเร็จ"); }
    finally { setPending(false); }
  }

  return (
    <form className="protocol-editor experiment-surface" onSubmit={submit}>
      <div className="form-heading"><p className="eyebrow">PROTOCOL DRAFT</p><h1>Protocol editor</h1><p>Published version แก้ตรง ๆ ไม่ได้ และทุกขั้นต้องผ่าน Beginner-Complete Standard ก่อนเผยแพร่</p></div>
      {error && <p className="form-alert" role="alert">{error}</p>}
      <div className="form-grid">
        <label className="form-field"><span>ชื่อ Protocol</span><input value={value.title} onChange={(event) => setValue({ ...value, title: event.target.value })} /></label>
        <label className="form-field"><span>ขอบเขตพืช</span><input value={value.plantScope} onChange={(event) => setValue({ ...value, plantScope: event.target.value })} /></label>
        <label className="form-field"><span>Evidence</span><select value={value.evidenceState} onChange={(event) => setValue({ ...value, evidenceState: event.target.value as EvidenceState })}><option>Verified</option><option>Adapted</option><option>Experimental</option><option>Pending review</option></select></label>
        <label className="form-field"><span>สรุป</span><textarea value={value.summary} onChange={(event) => setValue({ ...value, summary: event.target.value })} /></label>
        <label className="form-field"><span>Source IDs</span><input aria-label="Source IDs" value={(value.sourceIds ?? []).join(", ")} onChange={(event) => setValue({ ...value, sourceIds: event.target.value.split(",").map((item) => item.trim()).filter(Boolean) })} /></label>
        <label className="form-field"><span>Claim IDs</span><input aria-label="Claim IDs" value={(value.claimIds ?? []).join(", ")} onChange={(event) => setValue({ ...value, claimIds: event.target.value.split(",").map((item) => item.trim()).filter(Boolean) })} /></label>
        <label className="form-field"><span>บันทึกเวอร์ชัน</span><input value={value.changeNote} onChange={(event) => setValue({ ...value, changeNote: event.target.value })} /></label>
      </div>
      <div className="protocol-step-heading"><h2>ขั้นตอน</h2><button type="button" className="quiet-button" onClick={add}>เพิ่มขั้นตอน</button></div>
      {value.steps.map((step, index) => (
        <section className="protocol-step-editor" key={step.id}>
          <strong>ขั้นที่ {index + 1}</strong>
          {!step.beginner && <button className="quiet-button" onClick={() => updateStep(index, beginnerStep(index, step))} type="button">สร้างโครงคู่มือมือใหม่สำหรับขั้นนี้</button>}
          <input aria-label={`ชื่อขั้นตอน ${index + 1}`} placeholder="ชื่อขั้นตอน" value={step.title} onChange={(event) => updateStep(index, { title: event.target.value })} />
          <textarea aria-label={`คำสั่ง ${index + 1}`} placeholder="วิธีทำทีละข้อ" value={step.instruction} onChange={(event) => updateStep(index, { instruction: event.target.value })} />
          <label className="form-field"><span>เป้าหมาย</span><input value={step.objective ?? ""} onChange={(event) => updateStep(index, { objective: event.target.value })} /></label>
          <label className="form-field"><span>ทำไมขั้นนี้สำคัญ</span><textarea value={step.whyItMatters ?? ""} onChange={(event) => updateStep(index, { whyItMatters: event.target.value })} /></label>
          <label className="form-field"><span>อุปกรณ์/สาร — หนึ่งรายการต่อบรรทัด</span><textarea value={(step.materials ?? []).join("\n")} onChange={(event) => updateStep(index, { materials: splitLines(event.target.value) })} /></label>
          <label className="form-field"><span>ผลที่ควรเห็น</span><textarea value={step.expectedResult ?? ""} onChange={(event) => updateStep(index, { expectedResult: event.target.value })} /></label>
          <label className="form-field"><span>เกณฑ์ผ่าน — หนึ่งข้อต่อบรรทัด</span><textarea value={(step.passCriteria ?? []).join("\n")} onChange={(event) => updateStep(index, { passCriteria: splitLines(event.target.value) })} /></label>
          <label className="form-field"><span>เกณฑ์ไม่ผ่าน — หนึ่งข้อต่อบรรทัด</span><textarea value={(step.failCriteria ?? []).join("\n")} onChange={(event) => updateStep(index, { failCriteria: splitLines(event.target.value) })} /></label>
          <label className="form-field"><span>Reference IDs ของขั้นนี้</span><input value={step.referenceIds.join(", ")} onChange={(event) => updateStep(index, { referenceIds: event.target.value.split(",").map((item) => item.trim()).filter(Boolean) })} /></label>
          <div className="step-controls"><button disabled={index === 0} type="button" onClick={() => move(index, -1)}>ขึ้น</button><button disabled={index === value.steps.length - 1} type="button" onClick={() => move(index, 1)}>ลง</button><button type="button" onClick={() => setValue((current) => ({ ...current, steps: current.steps.filter((_, itemIndex) => itemIndex !== index).map((item, order) => ({ ...item, order })) }))}>ลบ</button></div>
        </section>
      ))}
      <div className="form-actions"><button className="primary-button" disabled={pending} type="submit">{pending ? "กำลังบันทึก…" : "บันทึกร่าง"}</button></div>
    </form>
  );
}
