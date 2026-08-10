"use client";

import { useCallback, useState, type FormEvent } from "react";
import { HaiterCalculator } from "@/components/calculators/haiter-calculator";
import { NadccCalculator } from "@/components/calculators/nadcc-calculator";
import type { HaiterAutoResult } from "@/lib/domain/haiter-calculations";
import type { NadccAutoResult } from "@/lib/domain/nadcc-calculations";
import type {
  ChemicalPreparationSnapshot,
  DoseValue,
  LotSterilizationSnapshot,
  PreparationStatus,
} from "@/lib/domain/models";

type EditableStepId = "prep-media" | "sterilize";

function calculatedDose(plan: HaiterAutoResult | NadccAutoResult | null): DoseValue | undefined {
  if (!plan) return undefined;
  if ("actionableVolumeMl" in plan) return { value: plan.actionableVolumeMl, unit: "mL" };
  return { value: plan.mode === "direct" ? plan.sourceVolumeMl : plan.workingDoseMl, unit: "mL" };
}

function dateTimeValue(value?: string) {
  return value ? value.slice(0, 16) : "";
}

export function ChemicalPreparation({
  stepId,
  sterilization,
  onConfirm,
}: {
  stepId: EditableStepId;
  sterilization: LotSterilizationSnapshot;
  onConfirm: (snapshot: LotSterilizationSnapshot) => Promise<void>;
}) {
  const key = stepId === "prep-media" ? "mediumPreparation" : "surfacePreparation";
  const preparation = sterilization[key];
  const [productName, setProductName] = useState(preparation?.productName ?? "");
  const [batchOrLot, setBatchOrLot] = useState(preparation?.batchOrLot ?? "");
  const [targetPpm, setTargetPpm] = useState(preparation?.targetPpm?.toString() ?? "");
  const [finalVolumeMl, setFinalVolumeMl] = useState(preparation?.finalVolumeMl?.toString() ?? "");
  const [actualDose, setActualDose] = useState(preparation?.actualDose?.value.toString() ?? "");
  const [actualPpm, setActualPpm] = useState(preparation?.actualPpm?.toString() ?? "");
  const [preparedAt, setPreparedAt] = useState(dateTimeValue(preparation?.preparedAt));
  const [status, setStatus] = useState<PreparationStatus>(preparation?.status ?? "planned");
  const [plan, setPlan] = useState<HaiterAutoResult | NadccAutoResult | null>(null);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const onHaiterPlanChange = useCallback((next: HaiterAutoResult | null) => setPlan(next), []);
  const onNadccPlanChange = useCallback((next: NadccAutoResult | null) => setPlan(next), []);

  if (!preparation || preparation.method === "pressure-sterilization") return null;

  const lockedPreparation: ChemicalPreparationSnapshot = preparation;
  const isNadcc = lockedPreparation.method === "nadcc-chemical" || lockedPreparation.method === "nadcc-soak";
  const target = Number(targetPpm);
  const volume = Number(finalVolumeMl);
  const dose = calculatedDose(plan) ?? lockedPreparation.calculatedDose;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    const actualDoseValue = Number(actualDose);
    const actualPpmValue = Number(actualPpm);
    if (!productName.trim() || !batchOrLot.trim() || !(target > 0) || !(volume > 0) || !preparedAt) {
      setMessage("กรอกผลิตภัณฑ์ batch/lot เป้าหมาย ปริมาตร และวันเวลาที่เตรียมให้ครบ");
      return;
    }
    if (status !== "planned" && (!(actualDoseValue > 0) || !dose)) {
      setMessage("สถานะ prepared/verified ต้องมีทั้งค่าคำนวณและปริมาณที่ใช้จริง");
      return;
    }
    if (status === "verified" && !(actualPpmValue > 0)) {
      setMessage("สถานะ verified ต้องบันทึกความเข้มข้นที่ตรวจได้จริง");
      return;
    }

    const now = new Date().toISOString();
    const next: ChemicalPreparationSnapshot = {
      ...lockedPreparation,
      status,
      productName: productName.trim(),
      batchOrLot: batchOrLot.trim(),
      targetPpm: target,
      finalVolumeMl: volume,
      calculatedDose: dose,
      actualDose: status === "planned" ? undefined : { value: actualDoseValue, unit: dose!.unit },
      actualPpm: status === "verified" ? actualPpmValue : undefined,
      preparedAt: new Date(preparedAt).toISOString(),
      confirmedAt: status === "planned" ? undefined : now,
    };
    setSaving(true);
    try {
      await onConfirm({ ...sterilization, [key]: next });
      setMessage("บันทึก preparation snapshot แล้ว");
    } catch {
      setMessage("บันทึก preparation snapshot ไม่สำเร็จ ค่าที่กรอกยังอยู่ในฟอร์ม");
    } finally {
      setSaving(false);
    }
  }

  const inputStyle = { width: "100%", padding: "9px 10px", border: "2px solid var(--pl-line)", borderRadius: "9px", background: "var(--pl-sunk)" } as const;

  return (
    <section className="pl-card" style={{ marginBottom: "18px" }}>
      <h2 className="pl-h2">ยืนยันการเตรียมสาร</h2>
      <p className="pl-meta" style={{ marginTop: "6px" }}>
        โปรโตคอล {preparation.protocolVersion} · สถานะที่ล็อกไว้ {preparation.status}
      </p>
      <form onSubmit={(event) => void submit(event)}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "10px", marginTop: "12px" }}>
          <label>ผลิตภัณฑ์<input style={inputStyle} value={productName} onChange={(event) => setProductName(event.currentTarget.value)} /></label>
          <label>Batch / lot<input style={inputStyle} value={batchOrLot} onChange={(event) => setBatchOrLot(event.currentTarget.value)} /></label>
          <label>เป้าหมาย (ppm)<input style={inputStyle} type="number" step="any" value={targetPpm} onChange={(event) => setTargetPpm(event.currentTarget.value)} /></label>
          <label>ปริมาตรสุดท้าย (mL)<input style={inputStyle} type="number" step="any" value={finalVolumeMl} onChange={(event) => setFinalVolumeMl(event.currentTarget.value)} /></label>
          <label>วันเวลาที่เตรียม<input style={inputStyle} type="datetime-local" value={preparedAt} onChange={(event) => setPreparedAt(event.currentTarget.value)} /></label>
          <label>สถานะ<select style={inputStyle} value={status} onChange={(event) => setStatus(event.currentTarget.value as PreparationStatus)}><option value="planned">planned</option><option value="prepared">prepared</option><option value="verified">verified</option></select></label>
          <label>ปริมาณที่ใช้จริง ({dose?.unit ?? "หน่วยตามผลคำนวณ"})<input style={inputStyle} type="number" step="any" value={actualDose} onChange={(event) => setActualDose(event.currentTarget.value)} /></label>
          <label>ความเข้มข้นที่ตรวจได้จริง (ppm)<input style={inputStyle} type="number" step="any" value={actualPpm} onChange={(event) => setActualPpm(event.currentTarget.value)} /></label>
        </div>

        {!(target > 0) || !(volume > 0) ? (
          <p className="pl-soft-card" role="alert" style={{ marginTop: "12px", background: "var(--pl-stop)" }}>
            ต้องระบุ target concentration และ final volume จากโปรโตคอลที่ทบทวนแล้วก่อน ระบบจะไม่สร้างค่าทางวิทยาศาสตร์ให้เอง
          </p>
        ) : isNadcc ? (
          <NadccCalculator
            initialInput={{
              tabletMg: (sterilization.chemistry?.nadccMassGPerTablet ?? 2.97) * 1000,
              availableChlorinePercent: preparation.labelConcentration ?? sterilization.chemistry?.nadccAvailableChlorinePercent,
              stockVolumeMl: preparation.stockVolumeMl ?? 100,
              targetPpm: target,
              finalVolumeMl: volume,
              minimumMeasurableMl: sterilization.minimumToolVolumeMl,
            }}
            onPlanChange={onNadccPlanChange}
          />
        ) : (
          <HaiterCalculator
            initialInput={{
              sourcePercent: preparation.labelConcentration,
              targetPercent: target / 10_000,
              finalVolumeMl: volume,
              minimumMeasurableMl: sterilization.minimumToolVolumeMl,
            }}
            initialLabelBasis={preparation.labelBasis === "w/w" ? "w/w" : "w/v"}
            onPlanChange={onHaiterPlanChange}
          />
        )}

        {dose ? <p className="pl-mono" style={{ marginTop: "12px" }}>ค่าคำนวณล่าสุด: {dose.value} {dose.unit}</p> : null}
        <button className="pl-action-primary" type="submit" disabled={saving} style={{ marginTop: "12px" }}>{saving ? "กำลังบันทึก…" : "บันทึก preparation snapshot"}</button>
        {message ? <p role="status" className="pl-meta" style={{ marginTop: "8px" }}>{message}</p> : null}
      </form>
    </section>
  );
}
