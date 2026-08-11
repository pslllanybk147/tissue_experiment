"use client";

import Link from "next/link";
import { useCallback, useState, type FormEvent } from "react";
import { ActionBar } from "@/components/common/action-bar";
import { StatusNotice } from "@/components/common/status-notice";
import { EvidenceBadge } from "@/components/guide/evidence-badge";
import { Illustration } from "@/components/guide/illustrations";
import { RichText } from "@/components/guide/rich-text";
import { formatDurationMinutes } from "@/lib/manual/duration";
import { troubleshootingById } from "@/lib/manual/troubleshooting";
import type { DoseValue, GuidedStepStatus, LotSterilizationSnapshot } from "@/lib/domain/models";
import type { ObservationMedia } from "@/lib/domain/models";
import type { CalibrationEntry } from "@/lib/domain/calibration";
import type { RoundStep, RoundView } from "@/lib/rounds/round-adapter";
import { bracketKey, buildBracketPlan, jarsPerArmKey } from "@/lib/rounds/bracket";
import { evaluateStepEvidence } from "@/lib/rounds/evidence-policy";
import { encodeStepValues, type StepResponses } from "@/lib/rounds/field-values";
import { MEDIUM_CALCULATOR_STEP_IDS, initialRecipeIdForStep, recipeIdsForStep } from "@/lib/rounds/medium-steps";
import { defaultMediumExecutionContext, type MediumExecutionContext } from "@/lib/rounds/medium-execution";
import { BracketTable } from "./bracket-table";
import { ChemicalPreparation } from "./chemical-preparation";
import { MediumCalculator } from "./medium-calculator";
import { OnlineStatus } from "./online-status";
import { StepPhotos } from "./step-photos";
import { StepSections } from "./step-section";

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
  responses: StepResponses;
};

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
  onConfirmPreparation,
}: {
  view: RoundView;
  step: RoundStep;
  onSave: (input: StepSaveInput) => Promise<void>;
  photos?: StepPhotoProps;
  tools?: {
    scaleMinimumMg: number;
    pipetteMinimumMl: number;
    msLabelRateGPerL: number;
    bcdLabelRateGPerL?: number;
    naaStockMgPerMl?: number;
    baStockMgPerMl?: number;
    bapStockMgPerMl?: number;
    ibaStockMgPerMl?: number;
  };
  remembered?: CalibrationEntry | null;
  locked?: boolean;
  lockReason?: string;
  demoMode?: boolean;
  onConfirmPreparation?: (snapshot: LotSterilizationSnapshot) => Promise<void>;
}) {
  const bracketPlan = buildBracketPlan(step);
  const number = step.displayNumber;
  const total = view.steps.length;
  const previous = number > 1 ? number - 1 : null;
  const next = number < total ? number + 1 : null;
  const demoSkipHref = next ? `/my/rounds/${view.lotId}/step/${next}` : `/my/rounds/${view.lotId}`;
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState("");
  const [mediumContext, setMediumContext] = useState<MediumExecutionContext | null>(() => (
    MEDIUM_CALCULATOR_STEP_IDS.has(step.id) && recipeIdsForStep(view.mediaRecipes, step.id, view.mediaRecipeIdsByStep).length > 0
      ? defaultMediumExecutionContext(view.mediaRecipes, initialRecipeIdForStep(step.id, view.mediaRecipes, view.mediaRecipeIdsByStep), tools)
      : null
  ));
  const preparationKey = step.id === "prep-media" ? "mediumPreparation" : "surfacePreparation";
  const [chemicalDose, setChemicalDose] = useState<DoseValue | undefined>(
    () => view.sterilization?.[preparationKey]?.calculatedDose,
  );
  const mediumHaiterTargetPpm = step.id === "prep-media" && view.sterilization?.mediumPreparation?.method === "haiter-chemical"
    ? Math.round((view.sterilization.mediumPreparation.labelConcentration ?? 6) * 20 * 100) / 100
    : undefined;
  const onMediumPlanChange = useCallback((context: MediumExecutionContext | null) => setMediumContext(context), []);
  const [measurementValues, setMeasurementValues] = useState<StepResponses>(
    () => ({ ...step.state.measurements, ...(step.state.responses ?? {}) }),
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
    const values: StepResponses = {};
    for (const measurement of step.measurements) {
      if (measurement.kind === "checkbox") {
        values[measurement.id] = form.has(measurement.id);
      } else {
        const raw = String(form.get(measurement.id) ?? "").trim();
        values[measurement.id] = raw === "" ? null : measurement.kind && measurement.kind !== "number" ? raw : Number(raw);
      }
    }
    // ค่าของตารางทดสอบช่วงใช้ name ที่มาจากฟังก์ชันสร้างคีย์ จึงอ่านด้วยวิธีเดียวกับช่องอื่น
    if (bracketPlan) {
      const keys = [jarsPerArmKey()];
      for (const arm of bracketPlan.arms) {
        for (const field of ["clean", "alive", "usable"] as const) keys.push(bracketKey(arm.armId, field));
        // ความเข้มข้นระบบเป็นคนเขียน ไม่ใช่ผู้ใช้กรอก เก็บไว้ให้ย้อนดูได้ว่ารอบนั้นทดสอบค่าอะไร
        // แม้คู่มือจะแก้ช่วงภายหลัง
        values[bracketKey(arm.armId, "dose")] = arm.dose;
      }
      for (const key of keys) {
        const raw = String(form.get(key) ?? "").trim();
        values[key] = raw === "" ? null : Number(raw);
      }
    }

    const submissionGate = evaluateStepEvidence(step, values, evidenceMedia);
    if (status === "Passed" && (!submissionGate.canPass || locked)) {
      setSaved("ยังบันทึกว่าผ่านไม่ได้ กรุณากรอกข้อมูลและแนบหลักฐานให้ครบ");
      return;
    }

    setSaving(true);
    setSaved("");
    try {
      const encoded = encodeStepValues(values);
      await onSave({ status, note: String(form.get("note") ?? ""), ...encoded });
      setSaved(status === "Passed" ? "บันทึกว่าผ่านแล้ว" : "บันทึกปัญหาไว้แล้ว");
    } finally {
      setSaving(false);
    }
  }

  const troubleshooting = (step.troubleshootingIds ?? [])
    .map((id) => troubleshootingById(id))
    .filter((entry) => entry !== null);

  return (
    <article className="cl-protocol">
      <OnlineStatus />
      <header className="cl-protocol-header">
        <p><Link className="pl-link" href={`/my/rounds/${view.lotId}`}>{view.title}</Link>{" · "}ขั้นที่ {number} จาก {total}</p>
        <h1>{step.title}</h1>
        <p><EvidenceBadge level={step.evidence.level} />{step.durationMinutes != null ? <>{" "}<span>ใช้เวลาราว {formatDurationMinutes(step.durationMinutes)}</span></> : null}</p>
      </header>
      <StepSections
        step={step}
        mediumContext={mediumContext}
        chemicalDose={chemicalDose}
        actionPrelude={(
          <>
            {view.sterilization && onConfirmPreparation && (step.id === "prep-media" || step.id === "sterilize") ? (
              <ChemicalPreparation
                stepId={step.id}
                sterilization={view.sterilization}
                onConfirm={onConfirmPreparation}
                onDoseChange={setChemicalDose}
                defaultTargetPpm={mediumHaiterTargetPpm}
                defaultFinalVolumeMl={step.id === "prep-media" ? mediumContext?.plan.totalVolumeMl : undefined}
              />
            ) : null}
            {MEDIUM_CALCULATOR_STEP_IDS.has(step.id) ? (
              <MediumCalculator
                key={`${step.id}-${tools?.scaleMinimumMg ?? ""}-${tools?.pipetteMinimumMl ?? ""}-${tools?.msLabelRateGPerL ?? ""}-${tools?.bcdLabelRateGPerL ?? ""}-${tools?.naaStockMgPerMl ?? ""}-${tools?.baStockMgPerMl ?? ""}-${tools?.bapStockMgPerMl ?? ""}-${tools?.ibaStockMgPerMl ?? ""}`}
                recipes={view.mediaRecipes}
                availableRecipeIds={recipeIdsForStep(view.mediaRecipes, step.id, view.mediaRecipeIdsByStep)}
                initialRecipeId={initialRecipeIdForStep(step.id, view.mediaRecipes, view.mediaRecipeIdsByStep)}
                tools={tools}
                onPlanChange={onMediumPlanChange}
              />
            ) : null}
            {step.illustrationId ? (
              <div className="cl-protocol-media"><Illustration id={step.illustrationId} /></div>
            ) : null}
          </>
        )}
      />

      {troubleshooting.length > 0 ? (
        <section className="cl-protocol-section">
          <h2>ถ้าเจออาการแบบนี้</h2>
          <div className="cl-troubleshooting-list">
            {troubleshooting.map((entry) => (
              <article className="cl-troubleshooting-item" key={entry.id}>
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
        className="cl-protocol-form"
        onSubmit={(event) => void submit(event)}
      >
        <h2 className="pl-h2">บันทึกผล</h2>

        {/* ตารางทดสอบช่วงต้องอยู่ในฟอร์มนี้ ไม่ใช่ข้างนอก ไม่งั้น FormData มองไม่เห็นช่องของมัน
            แล้วค่าที่ผู้ใช้กรอกจะถูกบันทึกเป็น null เงียบ ๆ */}
        {bracketPlan ? (
          <BracketTable plan={bracketPlan} saved={step.state.measurements} remembered={remembered ?? null} />
        ) : null}

        {step.measurements.map((measurement) => {
          const kind = measurement.kind ?? "number";
          const savedValue = step.state.responses?.[measurement.id] ?? step.state.measurements[measurement.id];
          const fieldStyle = {
            width: "100%",
            padding: "10px 12px",
            border: "2.5px solid var(--pl-line)",
            borderRadius: "10px",
            background: "var(--pl-sunk)",
            color: "var(--pl-ink)",
            fontSize: "16px",
          } as const;
          const label = `${measurement.label}${["number"].includes(kind) ? ` (${measurement.unit})` : ""}${measurement.required ? " · ต้องกรอก" : ""}`;
          const updateText = (raw: string) => setMeasurementValues((currentValues) => ({
            ...currentValues,
            [measurement.id]: raw.trim() === "" ? null : raw,
          }));

          if (kind === "checkbox") {
            return (
              <label key={measurement.id} htmlFor={measurement.id} className="cl-check-row">
                <input
                  id={measurement.id}
                  name={measurement.id}
                  type="checkbox"
                  defaultChecked={savedValue === true}
                  onChange={(event) => setMeasurementValues((currentValues) => ({ ...currentValues, [measurement.id]: event.currentTarget.checked }))}
                  aria-required={measurement.required ? "true" : undefined}
                  style={{ width: "22px", height: "22px", flex: "none" }}
                />
                <span>{label}</span>
              </label>
            );
          }

          return (
            <p key={measurement.id} style={{ marginTop: "14px" }}>
              <label htmlFor={measurement.id} style={{ display: "block", fontWeight: 600, marginBottom: "6px" }}>{label}</label>
              {kind === "select" ? (
                <select id={measurement.id} name={measurement.id} defaultValue={typeof savedValue === "string" ? savedValue : ""} onChange={(event) => updateText(event.currentTarget.value)} required={measurement.required} aria-required={measurement.required ? "true" : undefined} style={fieldStyle}>
                  <option value="">เลือก…</option>
                  {(measurement.options ?? []).map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                </select>
              ) : kind === "text" ? (
                <textarea id={measurement.id} name={measurement.id} rows={3} defaultValue={typeof savedValue === "string" ? savedValue : ""} onChange={(event) => updateText(event.currentTarget.value)} required={measurement.required} aria-required={measurement.required ? "true" : undefined} style={{ ...fieldStyle, fontFamily: "inherit" }} />
              ) : (
                <input
                  id={measurement.id}
                  name={measurement.id}
                  type={kind === "date" ? "date" : "number"}
                  step={kind === "number" ? "any" : undefined}
                  inputMode={kind === "number" ? "decimal" : undefined}
                  defaultValue={savedValue == null ? "" : String(savedValue)}
                  onChange={(event) => {
                    const raw = event.currentTarget.value.trim();
                    setMeasurementValues((currentValues) => ({
                      ...currentValues,
                      [measurement.id]: raw === "" ? null : kind === "number" ? Number(raw) : raw,
                    }));
                  }}
                  aria-required={measurement.required ? "true" : undefined}
                  required={measurement.required}
                  min={measurement.min}
                  max={measurement.max}
                  style={fieldStyle}
                />
              )}
            </p>
          );
        })}

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

        <ActionBar
          primary={<button type="submit" disabled={saving || !gate.canPass || locked} className="cl-button-primary">บันทึกว่าผ่าน</button>}
          secondary={<button type="submit" name="intent" value="failed" disabled={saving} formNoValidate className="cl-button-danger">ติดปัญหา</button>}
        />

        {gateMessages.length > 0 ? (
          <StatusNotice tone="blocked" title="ยังบันทึกว่าผ่านไม่ได้">
            <ul style={{ margin: "6px 0 0", paddingLeft: "20px" }}>
              {gateMessages.map((message) => <li key={message}>{message}</li>)}
            </ul>
          </StatusNotice>
        ) : null}

        {demoMode && (!gate.canPass || locked) ? (
          <div className="cl-demo-skip">
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

      <nav className="cl-step-pagination" aria-label="เปลี่ยนขั้นตอน">
        {previous ? (
          <Link
            className="cl-button-secondary pl-link"
            href={`/my/rounds/${view.lotId}/step/${previous}`}
          >
            ‹ ขั้นที่ {previous}
          </Link>
        ) : null}
        {next ? (
          <Link
            className="cl-button-primary pl-link"
            href={`/my/rounds/${view.lotId}/step/${next}`}
          >
            ขั้นที่ {next} ›
          </Link>
        ) : null}
      </nav>
    </article>
  );
}
