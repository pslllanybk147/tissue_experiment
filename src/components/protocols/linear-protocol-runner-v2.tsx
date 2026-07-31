"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import type { ProtocolStep, ProtocolStepRun } from "@/lib/domain/models";
import { planProtocolCatchUp } from "../../lib/domain/protocol-catch-up";
import { planRetrospectiveCompletion } from "../../lib/domain/retrospective-step-completion";
import { AccessibleAction } from "../common/accessible-action";
import { InlineLotRecipe, type LotRecipePlan } from "./inline-lot-recipe";
import {
  ProtocolCatchUpPanel,
  type ProtocolCatchUpSelection,
} from "./protocol-catch-up-panel";

type Props = {
  lotId: string;
  protocolId: string;
  versionId: string;
  steps: ProtocolStep[];
  runs: ProtocolStepRun[];
  recipePlan?: LotRecipePlan;
  onSave: (
    run: Omit<ProtocolStepRun, "id" | "ownerId" | "updatedAt">,
  ) => Promise<void>;
  onSaveMany: (
    runs: Array<Omit<ProtocolStepRun, "id" | "ownerId" | "updatedAt">>,
  ) => Promise<void>;
};

function timerLabel(minutes: number): string {
  if (minutes > 2880 && minutes % 1440 === 0) return `${minutes / 1440} วัน`;
  if (minutes % 60 === 0) return `${minutes / 60} ชั่วโมง`;
  return `${minutes} นาที`;
}

function remainingLabel(endsAt: string, now: number): string {
  const remaining = Math.max(0, new Date(endsAt).getTime() - now);
  if (remaining === 0) return "ครบเวลาแล้ว";
  const totalSeconds = Math.ceil(remaining / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return [
    days ? `${days} วัน` : "",
    hours ? `${hours} ชม.` : "",
    minutes ? `${minutes} นาที` : "",
    !days && !hours ? `${seconds} วินาที` : "",
  ].filter(Boolean).join(" ");
}

export function LinearProtocolRunnerV2({
  lotId,
  protocolId,
  versionId,
  steps,
  runs,
  recipePlan,
  onSave,
  onSaveMany,
}: Props) {
  const [activeIndex, setActiveIndex] = useState(() => {
    const firstUnfinished = steps.findIndex((candidate) => (
      runs.find((run) => run.stepId === candidate.id)?.status !== "Passed"
    ));
    return firstUnfinished >= 0 ? firstUnfinished : Math.max(0, steps.length - 1);
  });
  const [showSteps, setShowSteps] = useState(false);
  const [problemOpen, setProblemOpen] = useState(false);
  const [retrospectiveOpen, setRetrospectiveOpen] = useState(false);
  const [catchUpOpen, setCatchUpOpen] = useState(false);
  const [retrospectiveApproximateDate, setRetrospectiveApproximateDate] = useState("");
  const [retrospectiveTimerConfirmed, setRetrospectiveTimerConfirmed] = useState(false);
  const [note, setNote] = useState("");
  const [measurements, setMeasurements] = useState<Record<string, number | null>>({});
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [now, setNow] = useState(() => Date.now());
  const topRef = useRef<HTMLElement>(null);
  const step = steps[activeIndex];
  const run = useMemo(
    () => runs.find((candidate) => candidate.stepId === step?.id),
    [runs, step],
  );
  const timerEndsAt = run?.timerEndsAt;
  const timerComplete = !step?.durationMinutes
    || Boolean(timerEndsAt && new Date(timerEndsAt).getTime() <= now);
  const readiness = step?.beginner?.readyChecklist ?? [];
  const readinessComplete = readiness.every((_, index) => checked[String(index)]);
  const measurementsComplete = (step?.measurements ?? [])
    .every((item) => !item.required || measurements[item.id] != null);
  const canComplete = timerComplete && readinessComplete && measurementsComplete;

  useEffect(() => {
    if (!timerEndsAt || timerComplete) return;
    const interval = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(interval);
  }, [timerComplete, timerEndsAt]);

  function focusTop() {
    requestAnimationFrame(() => {
      topRef.current?.focus({ preventScroll: true });
      topRef.current?.scrollIntoView({
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "auto"
          : "smooth",
        block: "start",
      });
    });
  }

  function select(index: number) {
    const next = steps[index];
    const nextRun = runs.find((candidate) => candidate.stepId === next?.id);
    setActiveIndex(index);
    setProblemOpen(false);
    setRetrospectiveOpen(false);
    setRetrospectiveApproximateDate("");
    setRetrospectiveTimerConfirmed(false);
    setNote(nextRun?.note ?? "");
    setMeasurements(nextRun?.measurements ?? {});
    setChecked({});
    setMessage("");
    focusTop();
  }

  async function startTimer() {
    if (!step?.durationMinutes) return;
    const timerStartedAt = new Date().toISOString();
    const timerEndsAt = new Date(
      new Date(timerStartedAt).getTime() + step.durationMinutes * 60_000,
    ).toISOString();
    setSaving(true);
    try {
      await onSave({
        lotId,
        protocolId,
        versionId,
        stepId: step.id,
        status: "Pending",
        note,
        measurements,
        mediaIds: [],
        timerStartedAt,
        timerEndsAt,
        completionMode: "live",
        observedAt: timerStartedAt,
      });
      setNow(Date.now());
      setMessage(`เริ่มจับเวลา ${timerLabel(step.durationMinutes)} แล้ว ปิดหน้านี้ได้ เวลาไม่รีเซ็ต`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "เริ่มจับเวลาไม่สำเร็จ");
    } finally {
      setSaving(false);
    }
  }

  async function saveResult(status: "Passed" | "Needs review") {
    if (!step) return;
    if (status === "Passed" && !canComplete) {
      setMessage(
        !timerComplete
          ? "ยังทำขั้นนี้เสร็จไม่ได้จนกว่า Timer จะครบ"
          : "ตรวจรายการและกรอกค่าที่มีเครื่องหมาย * ให้ครบ",
      );
      return;
    }
    if (status === "Needs review" && !note.trim()) {
      setMessage("เขียนสิ่งที่พบก่อนบันทึกปัญหา");
      return;
    }
    setSaving(true);
    const completedAt = status === "Passed" ? new Date().toISOString() : undefined;
    try {
      await onSave({
        lotId,
        protocolId,
        versionId,
        stepId: step.id,
        status,
        note,
        measurements,
        mediaIds: [],
        timerStartedAt: run?.timerStartedAt,
        timerEndsAt: run?.timerEndsAt,
        completedAt,
        completionMode: "live",
        observedAt: new Date().toISOString(),
      });
      setMessage(status === "Passed" ? "บันทึกว่าทำขั้นนี้เสร็จแล้ว" : "บันทึกปัญหาแล้ว ขั้นถัดไปยังล็อกอยู่");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "บันทึกไม่สำเร็จ");
    } finally {
      setSaving(false);
    }
  }

  async function saveRetrospectiveResult() {
    if (!step) return;
    if (step.durationMinutes && !retrospectiveTimerConfirmed) {
      setMessage("ยืนยันก่อนว่าขั้นนี้ครบเวลาที่กำหนดแล้ว หรือใช้ตัวจับเวลาปกติ");
      return;
    }

    const plan = planRetrospectiveCompletion({
      completedAt: !step.durationMinutes && retrospectiveApproximateDate
        ? retrospectiveApproximateDate
        : undefined,
      durationMinutes: step.durationMinutes,
      elapsedConfirmed: retrospectiveTimerConfirmed,
    });
    if (plan.state === "invalid") {
      setMessage(plan.reason);
      return;
    }
    if (
      plan.state === "complete"
      && (!readinessComplete || !measurementsComplete)
    ) {
      setMessage("ตรวจรายการความพร้อมและกรอกค่าที่มีเครื่องหมาย * ให้ครบก่อนยืนยันว่าขั้นนี้เสร็จแล้ว");
      return;
    }

    const recordedAt = new Date().toISOString();
    setSaving(true);
    try {
      await onSave({
        lotId,
        protocolId,
        versionId,
        stepId: step.id,
        status: plan.state === "complete" ? "Passed" : "Pending",
        note,
        measurements,
        mediaIds: [],
        timerStartedAt: "timerStartedAt" in plan ? plan.timerStartedAt : undefined,
        timerEndsAt: "timerEndsAt" in plan ? plan.timerEndsAt : undefined,
        completedAt: plan.state === "complete" ? plan.completedAt : undefined,
        completionMode: "retrospective",
        retrospectiveRecordedAt: recordedAt,
        retrospectiveApproximateDate: retrospectiveApproximateDate || undefined,
        observedAt: recordedAt,
      });
      setRetrospectiveOpen(false);
      setMessage(
        plan.state === "complete"
          ? "บันทึกย้อนหลังแล้ว ขั้นนี้ผ่านตามวันที่และเวลาจริง"
          : `บันทึกย้อนหลังแล้ว ยังเหลือประมาณ ${timerLabel(plan.remainingMinutes)}`,
      );
      setNow(Date.now());
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "บันทึกย้อนหลังไม่สำเร็จ");
    } finally {
      setSaving(false);
    }
  }

  async function confirmCatchUp(selection: ProtocolCatchUpSelection) {
    const recordedAt = new Date().toISOString();
    const plan = planProtocolCatchUp({
      lotId,
      protocolId,
      versionId,
      steps,
      runs,
      targetStepId: selection.targetStepId,
      confirmedTimedStepIds: selection.confirmedTimedStepIds,
      recordedAt,
      approximateDate: selection.approximateDate,
    });
    if (plan.state !== "ready") throw new Error(plan.reason);
    await onSaveMany(plan.runs);
    setCatchUpOpen(false);
    select(plan.targetIndex);
    setMessage(
      plan.runs.length > 0
        ? `ปิดย้อนหลัง ${plan.runs.length} ขั้นแล้ว เริ่มต่อจากขั้น ${plan.targetIndex + 1}`
        : `เปิดขั้น ${plan.targetIndex + 1} แล้ว`,
    );
  }

  if (!step) return <p className="route-state">ยังไม่มีขั้นตอนใน Protocol v2</p>;

  return (
    <section className="linear-protocol-v2" ref={topRef} tabIndex={-1}>
      <header className="linear-step-header">
        <div>
          <p className="step-kicker">ขั้นที่ {activeIndex + 1} จาก {steps.length}</p>
          <h2>{step.title}</h2>
          <p>{step.objective}</p>
        </div>
        <div className="linear-header-actions">
          <button
            aria-expanded={catchUpOpen}
            className="secondary-button"
            onClick={() => setCatchUpOpen((value) => !value)}
            type="button"
          >
            ตั้งจุดเริ่มต่อ
          </button>
          <button
            aria-controls="linear-step-list"
            aria-expanded={showSteps}
            className="secondary-button"
            onClick={() => setShowSteps((value) => !value)}
            type="button"
          >
            {showSteps ? "ซ่อนรายการขั้น" : "ดูทุกขั้น"}
          </button>
        </div>
      </header>

      <div className="linear-progress" aria-label={`ทำเสร็จ ${runs.filter((item) => item.status === "Passed").length} จาก ${steps.length} ขั้น`}>
        <span style={{ width: `${(runs.filter((item) => item.status === "Passed").length / steps.length) * 100}%` }} />
      </div>

      {catchUpOpen ? (
        <ProtocolCatchUpPanel
          initialTargetStepId={step.id}
          onCancel={() => setCatchUpOpen(false)}
          onConfirm={confirmCatchUp}
          runs={runs}
          steps={steps}
        />
      ) : null}

      <ol className="linear-step-list" hidden={!showSteps} id="linear-step-list">
        {steps.map((item, index) => {
          const itemRun = runs.find((candidate) => candidate.stepId === item.id);
          const locked = index > 0 && runs.find((candidate) => candidate.stepId === steps[index - 1]?.id)?.status !== "Passed";
          return (
            <li key={item.id}>
              <button
                aria-current={index === activeIndex ? "step" : undefined}
                disabled={locked}
                onClick={() => select(index)}
                type="button"
              >
                <span>{itemRun?.status === "Passed" ? "✓" : index + 1}</span>
                {item.title}
              </button>
            </li>
          );
        })}
      </ol>

      <section className="linear-guide-block">
        <h3>ของที่ต้องเตรียม</h3>
        <ul>
          {(step.beginner?.materials ?? []).map((item) => (
            <li key={item.name}><strong>{item.name}</strong>{item.quantity ? ` — ${item.quantity}` : ""}</li>
          ))}
        </ul>
      </section>

      <section className="linear-guide-block">
        <h3>ทำตามนี้ทีละข้อ</h3>
        <ol className="linear-actions">
          {(step.beginner?.actions ?? [step.instruction]).map((action, index) => (
            <li key={`${index}-${action}`}><span>{index + 1}</span><p>{action}</p></li>
          ))}
        </ol>
      </section>

      {step.id === "v2-prepare-medium" && recipePlan ? (
        <InlineLotRecipe plan={recipePlan} />
      ) : null}

      {step.durationMinutes ? (
        <section className="linear-timer" aria-live="polite">
          <h3>ตัวจับเวลา</h3>
          {timerEndsAt ? (
            <>
              <strong>{remainingLabel(timerEndsAt, now)}</strong>
              <p>เวลาเริ่มและเวลาสิ้นสุดถูกบันทึกกับ Lot นี้ ปิดหน้าหรือรีเฟรชได้</p>
            </>
          ) : (
            <>
              <AccessibleAction disabled={saving} intent="primary" onClick={() => void startTimer()}>
                เริ่มจับเวลา {timerLabel(step.durationMinutes)}
              </AccessibleAction>
              <p>ยังทำขั้นนี้เสร็จไม่ได้จนกว่า Timer จะครบ</p>
            </>
          )}
        </section>
      ) : null}

      {(step.measurements?.length ?? 0) > 0 ? (
        <section className="linear-guide-block">
          <h3>ค่าที่ต้องบันทึก</h3>
          {step.measurements?.map((item) => (
            <label className="form-field" key={item.id}>
              <span>{item.label} ({item.unit}){item.required ? " *" : ""}</span>
              <input
                max={item.max}
                min={item.min}
                onChange={(event) => setMeasurements((current) => ({
                  ...current,
                  [item.id]: event.target.value === "" ? null : Number(event.target.value),
                }))}
                type="number"
                value={measurements[item.id] ?? ""}
              />
            </label>
          ))}
        </section>
      ) : null}

      <section className="linear-guide-block">
        <h3>ตรวจว่าพร้อมไปต่อหรือยัง</h3>
        <div className="linear-checks">
          {readiness.map((item, index) => (
            <label key={`${index}-${item}`}>
              <input
                checked={Boolean(checked[String(index)])}
                onChange={(event) => setChecked((current) => ({
                  ...current,
                  [String(index)]: event.target.checked,
                }))}
                type="checkbox"
              />
              <span>{item}</span>
            </label>
          ))}
        </div>
      </section>

      {problemOpen ? (
        <section className="linear-problem" role="region" aria-label="บันทึกปัญหา">
          <h3>เกิดอะไรขึ้น</h3>
          <ul>{step.failCriteria?.map((item) => <li key={item}>{item}</li>)}</ul>
          <label className="form-field">
            <span>เขียนสิ่งที่เห็นจริง *</span>
            <textarea onChange={(event) => setNote(event.target.value)} rows={4} value={note} />
          </label>
          <AccessibleAction disabled={saving} onClick={() => void saveResult("Needs review")}>
            บันทึกปัญหาและหยุดขั้นนี้
          </AccessibleAction>
        </section>
      ) : null}

      {retrospectiveOpen ? (
        <section
          aria-label="บันทึกขั้นที่ทำไปแล้ว"
          className="linear-retrospective"
          role="region"
        >
          <div>
            <h3>บันทึกขั้นที่ทำไปแล้ว</h3>
            <p>
              ไม่ต้องเขียนบันทึกหรือกรอกเวลาหลายช่อง
            </p>
          </div>
          {step.durationMinutes ? (
            <label className="catch-up-timer-confirmation">
              <input
                checked={retrospectiveTimerConfirmed}
                onChange={(event) => setRetrospectiveTimerConfirmed(event.target.checked)}
                type="checkbox"
              />
              <span>
                <strong>ฉันยืนยันว่าครบเวลา {timerLabel(step.durationMinutes)} แล้ว</strong>
                <small>ถ้ายังไม่ครบ ให้ยกเลิกและใช้ตัวจับเวลาปกติ</small>
              </span>
            </label>
          ) : null}
          <label className="form-field">
            <span>วันที่โดยประมาณ (ไม่บังคับ)</span>
            <input
              onChange={(event) => setRetrospectiveApproximateDate(event.target.value)}
              type="date"
              value={retrospectiveApproximateDate}
            />
          </label>
          <div className="retrospective-actions">
            <AccessibleAction
              disabled={saving}
              onClick={() => setRetrospectiveOpen(false)}
            >
              ยกเลิก
            </AccessibleAction>
            <AccessibleAction
              disabled={saving}
              intent="primary"
              onClick={() => void saveRetrospectiveResult()}
            >
              บันทึกตามเวลาจริง
            </AccessibleAction>
          </div>
        </section>
      ) : null}

      <details className="linear-evidence-details">
        <summary>ที่มาของคำแนะนำและข้อจำกัด</summary>
        <p>{step.whyItMatters}</p>
        <p>ระดับหลักฐาน: {step.evidenceState}</p>
        {step.referenceIds.length ? <p>รหัสแหล่งอ้างอิง: {step.referenceIds.join(", ")}</p> : <p>ขั้นนี้ยังไม่มีแหล่งอ้างอิงตรงพันธุ์ จึงไม่แสดงเป็น Verified</p>}
      </details>

      {message ? <p className="form-alert" role="status">{message}</p> : null}

      <div className="linear-step-actions">
        <AccessibleAction onClick={() => setProblemOpen((value) => !value)}>
          ฉันพบปัญหา
        </AccessibleAction>
        <AccessibleAction
          aria-expanded={retrospectiveOpen}
          onClick={() => {
            setProblemOpen(false);
            setRetrospectiveOpen((value) => !value);
            setMessage("");
          }}
        >
          ฉันทำขั้นนี้ไว้แล้ว
        </AccessibleAction>
        <AccessibleAction disabled={saving || !canComplete} intent="primary" onClick={() => void saveResult("Passed")}>
          ทำขั้นนี้เสร็จแล้ว
        </AccessibleAction>
      </div>

      {run?.status === "Passed" && activeIndex < steps.length - 1 ? (
        <AccessibleAction intent="primary" onClick={() => select(activeIndex + 1)}>
          ไปขั้นถัดไป
        </AccessibleAction>
      ) : null}
    </section>
  );
}
