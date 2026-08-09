"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { EvidenceBadge } from "@/components/guide/evidence-badge";
import { Illustration } from "@/components/guide/illustrations";
import { RichText } from "@/components/guide/rich-text";
import { formatDurationMinutes } from "@/lib/manual/duration";
import { troubleshootingById } from "@/lib/manual/troubleshooting";
import type { GuidedStepStatus } from "@/lib/domain/models";
import type { ObservationMedia } from "@/lib/domain/models";
import type { CalibrationEntry } from "@/lib/domain/calibration";
import type { RoundStep, RoundView } from "@/lib/rounds/round-adapter";
import { bracketKey, buildBracketPlan, jarsPerArmKey } from "@/lib/rounds/bracket";
import { evaluateStepEvidence } from "@/lib/rounds/evidence-policy";
import { MEDIUM_CALCULATOR_STEP_IDS, initialRecipeIdForStep } from "@/lib/rounds/medium-steps";
import { BracketTable } from "./bracket-table";
import { MediumCalculator } from "./medium-calculator";
import { OnlineStatus } from "./online-status";
import { StepPhotos } from "./step-photos";
import { SterilizationMethodBanner } from "./sterilization-method-banner";

export type StepPhotoProps = {
  observationId: string | null;
  media: ObservationMedia[];
  canAttach: boolean;
  reason: string;
  onUploaded: (item: ObservationMedia) => Promise<void>;
};

export type StepSaveInput = {
  status: GuidedStepStatus;
  note: string;
  measurements: Record<string, number | null>;
};

function List({ title, items }: { title: string; items: string[] }) {
  if (items.length === 0) return null;
  return (
    <section style={{ marginTop: "18px" }}>
      <h2 className="pl-h2">{title}</h2>
      <ul style={{ margin: "8px 0 0", paddingLeft: "20px", display: "flex", flexDirection: "column", gap: "6px" }}>
        {items.map((item) => <li key={item}><RichText source={item} /></li>)}
      </ul>
    </section>
  );
}

export function StepRunner({
  view,
  step,
  onSave,
  photos,
  tools,
  remembered,
  locked = false,
  lockReason = "",
  demoMode = false,
}: {
  view: RoundView;
  step: RoundStep;
  onSave: (input: StepSaveInput) => Promise<void>;
  photos?: StepPhotoProps;
  tools?: { scaleMinimumMg: number; pipetteMinimumMl: number; msLabelRateGPerL: number };
  remembered?: CalibrationEntry | null;
  locked?: boolean;
  lockReason?: string;
  demoMode?: boolean;
}) {
  const bracketPlan = buildBracketPlan(step);
  const number = step.displayNumber;
  const total = view.steps.length;
  const previous = number > 1 ? number - 1 : null;
  const next = number < total ? number + 1 : null;
  const demoSkipHref = next ? `/my/rounds/${view.lotId}/step/${next}` : `/my/rounds/${view.lotId}`;
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState("");
  const [measurementValues, setMeasurementValues] = useState<Record<string, number | null>>(
    () => ({ ...step.state.measurements }),
  );
  const [evidenceMedia, setEvidenceMedia] = useState<ObservationMedia[]>(
    () => (photos?.media ?? []).filter((item) => !item.deletedAt),
  );
  const gate = evaluateStepEvidence(step, measurementValues, evidenceMedia);

  const gateMessages = [
    ...(gate.missingFieldIds.length > 0 ? ["กรอกช่องที่ระบุว่าต้องกรอกให้ครบ"] : []),
    ...(gate.missingPhotoCount > 0 ? ["ต้องแนบอย่างน้อย 1 รูป"] : []),
    ...(gate.missingCaptionCount > 0 ? ["ต้องมีคำบรรยายอย่างน้อย 1 รูป"] : []),
    ...(locked ? [lockReason || "ขั้นนี้ยังถูกล็อก"] : []),
  ];

  // ปุ่มทั้งสองเป็น submit ปุ่มจริง แล้วแยกเจตนาด้วยค่า intent ที่ติดมากับปุ่ม
  // วิธีนี้ทำให้กด Enter ในฟอร์มแล้วได้ผลเดียวกับกดปุ่มผ่าน และไม่ต้องปลอม event
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const submitter = (event.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null;
    const status: GuidedStepStatus = submitter?.value === "failed" ? "Failed" : "Passed";
    const form = new FormData(event.currentTarget);
    const measurements: Record<string, number | null> = {};
    for (const measurement of step.measurements) {
      const raw = String(form.get(measurement.id) ?? "").trim();
      measurements[measurement.id] = raw === "" ? null : Number(raw);
    }
    // ค่าของตารางทดสอบช่วงใช้ name ที่มาจากฟังก์ชันสร้างคีย์ จึงอ่านด้วยวิธีเดียวกับช่องอื่น
    if (bracketPlan) {
      const keys = [jarsPerArmKey()];
      for (const arm of bracketPlan.arms) {
        for (const field of ["clean", "alive", "usable"] as const) keys.push(bracketKey(arm.armId, field));
        // ความเข้มข้นระบบเป็นคนเขียน ไม่ใช่ผู้ใช้กรอก เก็บไว้ให้ย้อนดูได้ว่ารอบนั้นทดสอบค่าอะไร
        // แม้คู่มือจะแก้ช่วงภายหลัง
        measurements[bracketKey(arm.armId, "dose")] = arm.dose;
      }
      for (const key of keys) {
        const raw = String(form.get(key) ?? "").trim();
        measurements[key] = raw === "" ? null : Number(raw);
      }
    }

    const submissionGate = evaluateStepEvidence(step, measurements, evidenceMedia);
    if (status === "Passed" && (!submissionGate.canPass || locked)) {
      setSaved("ยังบันทึกว่าผ่านไม่ได้ กรุณากรอกข้อมูลและแนบหลักฐานให้ครบ");
      return;
    }

    setSaving(true);
    setSaved("");
    try {
      await onSave({ status, note: String(form.get("note") ?? ""), measurements });
      setSaved(status === "Passed" ? "บันทึกว่าผ่านแล้ว" : "บันทึกปัญหาไว้แล้ว");
    } finally {
      setSaving(false);
    }
  }

  const troubleshooting = (step.troubleshootingIds ?? [])
    .map((id) => troubleshootingById(id))
    .filter((entry) => entry !== null);

  return (
    <div className="pl-do">
      <OnlineStatus />
      <p className="pl-mono">
        <Link className="pl-link" href={`/my/rounds/${view.lotId}`} style={{ color: "inherit" }}>{view.title}</Link>
        {" · "}ขั้นที่ {number} จาก {total}
      </p>
      <h1 className="pl-h1" style={{ marginTop: "8px" }}>{step.title}</h1>
      <p style={{ marginTop: "6px" }}>
        <EvidenceBadge level={step.evidence.level} />
        {step.durationMinutes != null ? (
          <>{" "}<span className="pl-mono">ใช้เวลาราว {formatDurationMinutes(step.durationMinutes)}</span></>
        ) : null}
      </p>
      <p className="pl-lede" style={{ marginTop: "12px" }}><RichText source={step.summary} /></p>

      {step.id === "sterilize" && !view.trialArmRole ? (
        <SterilizationMethodBanner sterilization={view.sterilization} />
      ) : null}

      {MEDIUM_CALCULATOR_STEP_IDS.has(step.id) ? (
        // อยู่ก่อนคำสั่งลงมือทำตั้งใจ เพราะขั้นตอนด้านล่างอ้างถึง "ตามสูตร"/"ตามที่คำนวณ" อยู่หลายจุด
        // (เช่น pH, ปริมาณสาร) ผู้ใช้ต้องเห็นตัวเลขจริงก่อนจะอ่านคำสั่งที่อ้างถึงมัน ไม่ใช่ไล่หาทีหลัง
        // ชุดอุปกรณ์โหลดมาแบบ async หลังหน้าเรนเดอร์แล้ว การใส่ key ทำให้เครื่องคำนวณ
        // เริ่มใหม่ด้วยค่าที่โหลดมาจริง แทนที่จะค้างอยู่กับค่าเริ่มต้นตอน mount
        <MediumCalculator
          key={`${step.id}-${tools?.scaleMinimumMg ?? ""}-${tools?.pipetteMinimumMl ?? ""}-${tools?.msLabelRateGPerL ?? ""}`}
          recipes={view.mediaRecipes}
          initialRecipeId={initialRecipeIdForStep(step.id)}
          tools={tools}
        />
      ) : null}

      {step.illustrationId ? (
        <div className="pl-card" style={{ marginTop: "18px", padding: 0, overflow: "hidden" }}>
          <Illustration id={step.illustrationId} />
        </div>
      ) : null}

      {step.safetyNotes.length > 0 ? (
        <div className="pl-card" style={{ background: "var(--pl-stop)", marginTop: "18px" }}>
          <p className="pl-mono" style={{ color: "var(--pl-ink-2)" }}>ความปลอดภัย</p>
          <ul style={{ margin: "8px 0 0", paddingLeft: "20px", display: "flex", flexDirection: "column", gap: "6px" }}>
            {step.safetyNotes.map((item) => <li key={item}><RichText source={item} /></li>)}
          </ul>
        </div>
      ) : null}

      <List title="ของที่ต้องเตรียม" items={step.materials} />

      <section style={{ marginTop: "18px" }}>
        <h2 className="pl-h2">ลงมือทำ</h2>
        <ol style={{ margin: "8px 0 0", paddingLeft: "20px", display: "flex", flexDirection: "column", gap: "8px" }}>
          {step.actions.map((action) => <li key={action}><RichText source={action} /></li>)}
        </ol>
      </section>

      <List title="ผ่านเมื่อ" items={step.passCriteria} />
      <List title="หยุดทันทีถ้า" items={step.stopConditions} />

      {troubleshooting.length > 0 ? (
        <section style={{ marginTop: "24px" }}>
          <h2 className="pl-h2">ถ้าเจออาการแบบนี้</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "10px" }}>
            {troubleshooting.map((entry) => (
              <article className="pl-card" key={entry.id} style={{ background: "var(--pl-sunk)" }}>
                <p style={{ margin: 0, fontWeight: 700 }}>{entry.symptom}</p>
                {entry.distinguish ? (
                  <p className="pl-lede" style={{ marginTop: "8px" }}>
                    <strong>วิธีแยกจากอาการที่คล้ายกัน</strong> {entry.distinguish}
                  </p>
                ) : null}
                <ol style={{ margin: "10px 0 0", paddingLeft: "20px", display: "flex", flexDirection: "column", gap: "6px" }}>
                  {entry.actions.map((action) => <li key={action}><RichText source={action} /></li>)}
                </ol>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      <form
        className="pl-card"
        style={{ marginTop: "26px" }}
        onSubmit={(event) => void submit(event)}
      >
        <h2 className="pl-h2">บันทึกผลของขั้นนี้</h2>

        {/* ตารางทดสอบช่วงต้องอยู่ในฟอร์มนี้ ไม่ใช่ข้างนอก ไม่งั้น FormData มองไม่เห็นช่องของมัน
            แล้วค่าที่ผู้ใช้กรอกจะถูกบันทึกเป็น null เงียบ ๆ */}
        {bracketPlan ? (
          <BracketTable plan={bracketPlan} saved={step.state.measurements} remembered={remembered ?? null} />
        ) : null}

        {step.measurements.map((measurement) => (
          <p key={measurement.id} style={{ marginTop: "14px" }}>
            <label htmlFor={measurement.id} style={{ display: "block", fontWeight: 600, marginBottom: "6px" }}>
              {measurement.label} ({measurement.unit}){measurement.required ? " · ต้องกรอก" : ""}
            </label>
            <input
              id={measurement.id}
              name={measurement.id}
              type="number"
              step="any"
              inputMode="decimal"
              defaultValue={step.state.measurements[measurement.id] ?? ""}
              onChange={(event) => {
                const raw = event.currentTarget.value.trim();
                setMeasurementValues((current) => ({
                  ...current,
                  [measurement.id]: raw === "" ? null : Number(raw),
                }));
              }}
              aria-required={measurement.required ? "true" : undefined}
              required={measurement.required}
              min={measurement.min}
              max={measurement.max}
              style={{
                width: "100%",
                padding: "10px 12px",
                border: "2.5px solid var(--pl-line)",
                borderRadius: "10px",
                background: "var(--pl-sunk)",
                color: "var(--pl-ink)",
                fontSize: "16px",
              }}
            />
          </p>
        ))}

        <p style={{ marginTop: "14px" }}>
          <label htmlFor="note" style={{ display: "block", fontWeight: 600, marginBottom: "6px" }}>
            จดสิ่งที่เห็นจริง
          </label>
          <textarea
            id="note"
            name="note"
            rows={4}
            defaultValue={step.state.note}
            placeholder="เช่น สีของชิ้นพืชหลังล้าง กลิ่น หรือปัญหาที่เจอ"
            style={{
              width: "100%",
              padding: "10px 12px",
              border: "2.5px solid var(--pl-line)",
              borderRadius: "10px",
              background: "var(--pl-sunk)",
              color: "var(--pl-ink)",
              fontSize: "16px",
              fontFamily: "inherit",
            }}
          />
        </p>

        <div style={{ display: "flex", gap: "10px", marginTop: "16px", flexWrap: "wrap" }}>
          <button
            type="submit"
            disabled={saving || !gate.canPass || locked}
            className="pl-chip"
            style={{ background: "var(--pl-green)", cursor: saving || !gate.canPass || locked ? "not-allowed" : "pointer", fontSize: "15px", padding: "10px 18px" }}
          >
            บันทึกว่าผ่าน
          </button>
          <button
            type="submit"
            name="intent"
            value="failed"
            disabled={saving}
            // ตอนติดปัญหาอาจยังไม่มีค่าให้กรอก จึงต้องข้ามการบังคับกรอกของฟอร์ม
            formNoValidate
            className="pl-chip"
            style={{ background: "var(--pl-red)", cursor: "pointer", fontSize: "15px", padding: "10px 18px" }}
          >
            ติดปัญหา
          </button>
        </div>

        {gateMessages.length > 0 ? (
          <div className="pl-soft-card" role="alert" style={{ marginTop: "12px", background: "var(--pl-stop)" }}>
            <p style={{ margin: 0, fontWeight: 700 }}>ยังบันทึกว่าผ่านไม่ได้</p>
            <ul style={{ margin: "6px 0 0", paddingLeft: "20px" }}>
              {gateMessages.map((message) => <li key={message}>{message}</li>)}
            </ul>
          </div>
        ) : null}

        {demoMode && (!gate.canPass || locked) ? (
          <div className="pl-soft-card" style={{ marginTop: "12px", background: "var(--pl-sunk)" }}>
            <Link className="pl-link" href={demoSkipHref} style={{ fontWeight: 800 }}>
              ข้ามเพื่อทดสอบหน้าจอ
            </Link>
            <p className="pl-meta" style={{ marginTop: "6px" }}>
              ไปดูขั้นถัดไปเท่านั้น ระบบไม่บันทึกว่าผ่านและไม่นับเป็นผลทดลองจริง
            </p>
          </div>
        ) : null}

        {saved ? <p className="pl-mono" role="status" style={{ marginTop: "12px" }}>{saved}</p> : null}
      </form>

      {photos ? (
        <StepPhotos
          lotId={view.lotId}
          observationId={photos.observationId}
          media={evidenceMedia}
          canAttach={photos.canAttach}
          reason={photos.reason}
          onUploaded={async (item) => {
            await photos.onUploaded(item);
            setEvidenceMedia((current) => [...current.filter((mediaItem) => mediaItem.id !== item.id), item]);
          }}
        />
      ) : null}

      <nav style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
        {previous ? (
          <Link
            className="pl-card pl-link"
            href={`/my/rounds/${view.lotId}/step/${previous}`}
            style={{ flex: 1, textAlign: "center", color: "inherit", textDecoration: "none", fontWeight: 700 }}
          >
            ‹ ขั้นที่ {previous}
          </Link>
        ) : null}
        {next ? (
          <Link
            className="pl-card pl-link"
            href={`/my/rounds/${view.lotId}/step/${next}`}
            style={{ flex: 1, textAlign: "center", background: "var(--pl-yellow)", color: "var(--pl-chip-ink)", textDecoration: "none", fontWeight: 700 }}
          >
            ขั้นที่ {next} ›
          </Link>
        ) : null}
      </nav>
    </div>
  );
}
