"use client";

import { useMemo, useState } from "react";

import type { ProtocolStep, ProtocolStepRun } from "@/lib/domain/models";
import { AccessibleAction } from "../common/accessible-action";

export type ProtocolCatchUpSelection = {
  targetStepId: string;
  confirmedTimedStepIds: string[];
  approximateDate?: string;
};

type Props = {
  steps: ProtocolStep[];
  runs: ProtocolStepRun[];
  initialTargetStepId?: string;
  onCancel: () => void;
  onConfirm: (selection: ProtocolCatchUpSelection) => Promise<void>;
};

export function ProtocolCatchUpPanel({
  steps,
  runs,
  initialTargetStepId,
  onCancel,
  onConfirm,
}: Props) {
  const [targetStepId, setTargetStepId] = useState(
    initialTargetStepId ?? steps[0]?.id ?? "",
  );
  const [timersConfirmed, setTimersConfirmed] = useState(false);
  const [approximateDate, setApproximateDate] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const targetIndex = steps.findIndex((step) => step.id === targetStepId);
  const runByStepId = useMemo(
    () => new Map(runs.map((run) => [run.stepId, run])),
    [runs],
  );
  const skippedSteps = targetIndex > 0 ? steps.slice(0, targetIndex) : [];
  const unfinishedSkippedSteps = skippedSteps.filter(
    (step) => runByStepId.get(step.id)?.status !== "Passed",
  );
  const timedSteps = unfinishedSkippedSteps.filter(
    (step) => Boolean(step.durationMinutes),
  );
  const blockingStep = skippedSteps.find((step) => {
    const status = runByStepId.get(step.id)?.status;
    return status === "Needs review" || status === "Failed";
  });

  async function confirm() {
    if (!targetStepId || targetIndex < 0) {
      setMessage("เลือกขั้นที่จะเริ่มทำต่อ");
      return;
    }
    if (blockingStep) {
      setMessage(`ขั้น ${blockingStep.order} มีปัญหาที่บันทึกไว้ ต้องเปิดขั้นนั้นก่อน`);
      return;
    }
    if (timedSteps.length > 0 && !timersConfirmed) {
      setMessage("ยืนยันก่อนว่าขั้นจับเวลาที่ผ่านมาแล้วครบเวลาตามกำหนด");
      return;
    }
    setSaving(true);
    setMessage("");
    try {
      await onConfirm({
        targetStepId,
        confirmedTimedStepIds: timedSteps.map((step) => step.id),
        approximateDate: approximateDate || undefined,
      });
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "ตั้งจุดเริ่มต่อไม่สำเร็จ");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section
      aria-label="ตั้งจุดเริ่มต่อ"
      className="protocol-catch-up-panel"
      role="region"
    >
      <div>
        <p className="eyebrow">ทำงานไปแล้วก่อนเปิดคู่มือ</p>
        <h3>เลือกครั้งเดียวว่าตอนนี้จะเริ่มต่อจากขั้นไหน</h3>
        <p>ไม่ต้องกรอกบันทึก เวลา หรือรูปแยกทุกขั้น</p>
      </div>

      <label className="form-field">
        <span>ฉันจะเริ่มทำต่อจาก</span>
        <select
          onChange={(event) => {
            setTargetStepId(event.target.value);
            setTimersConfirmed(false);
            setMessage("");
          }}
          value={targetStepId}
        >
          {steps.map((step) => (
            <option key={step.id} value={step.id}>
              ขั้น {step.order}: {step.title}
            </option>
          ))}
        </select>
      </label>

      <div className="catch-up-summary">
        <strong>
          {targetIndex > 0
            ? `ขั้น 1–${targetIndex} จะถูกระบุว่าทำไปแล้ว`
            : "ไม่มีขั้นก่อนหน้าที่ต้องปิดย้อนหลัง"}
        </strong>
        <p>ขั้นที่ผ่านอยู่แล้วจะไม่ถูกเขียนทับ</p>
        {unfinishedSkippedSteps.length > 0 ? (
          <ol>
            {unfinishedSkippedSteps.map((step) => (
              <li key={step.id}>ขั้น {step.order}: {step.title}</li>
            ))}
          </ol>
        ) : null}
      </div>

      {timedSteps.length > 0 ? (
        <label className="catch-up-timer-confirmation">
          <input
            checked={timersConfirmed}
            onChange={(event) => setTimersConfirmed(event.target.checked)}
            type="checkbox"
          />
          <span>
            <strong>ฉันยืนยันว่าครบเวลาที่กำหนดแล้ว</strong>
            <small>
              {timedSteps.map((step) => `ขั้น ${step.order} (${step.title})`).join(", ")}
            </small>
          </span>
        </label>
      ) : null}

      <label className="form-field">
        <span>วันที่โดยประมาณ (ไม่บังคับ)</span>
        <input
          onChange={(event) => setApproximateDate(event.target.value)}
          type="date"
          value={approximateDate}
        />
      </label>

      {blockingStep ? (
        <p className="form-alert" role="alert">
          ขั้น {blockingStep.order} มีผลเดิมที่ต้องจัดการก่อน ระบบจะไม่เขียนทับ
        </p>
      ) : null}
      {message ? <p className="form-alert" role="status">{message}</p> : null}

      <div className="catch-up-actions">
        <AccessibleAction disabled={saving} onClick={onCancel}>ยกเลิก</AccessibleAction>
        <AccessibleAction
          disabled={saving || Boolean(blockingStep)}
          intent="primary"
          onClick={() => void confirm()}
        >
          ยืนยันและเริ่มต่อจากขั้นนี้
        </AccessibleAction>
      </div>
    </section>
  );
}
