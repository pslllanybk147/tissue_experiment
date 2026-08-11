"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { ActionBar } from "@/components/common/action-bar";
import { FieldGroup } from "@/components/common/field-group";
import { StatusNotice } from "@/components/common/status-notice";
import { HaiterCalculator } from "@/components/calculators/haiter-calculator";
import { NadccCalculator } from "@/components/calculators/nadcc-calculator";
import { toWeightPerVolumePercent, type HaiterAutoResult } from "@/lib/domain/haiter-calculations";
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

function roundPpm(value: number): number {
  return Number(value.toFixed(3));
}

export function estimatePpmFromDose(
  plan: HaiterAutoResult | NadccAutoResult,
  preparation: { labelConcentration?: number; labelBasis?: string },
  doseMl: number,
  finalVolumeMl: number,
): number | undefined {
  if (!Number.isFinite(doseMl) || doseMl <= 0 || !Number.isFinite(finalVolumeMl) || finalVolumeMl <= 0) {
    return undefined;
  }

  if ("stockPpm" in plan) {
    const stockPpm = plan.mode === "working-dilution" ? plan.workingPpm : plan.stockPpm;
    return roundPpm((stockPpm * doseMl) / finalVolumeMl);
  }

  if (!Number.isFinite(preparation.labelConcentration) || !preparation.labelConcentration || preparation.labelBasis === undefined) {
    return undefined;
  }
  const sourcePercent = preparation.labelBasis === "w/w"
    ? toWeightPerVolumePercent(preparation.labelConcentration, "w/w")
    : preparation.labelBasis === "w/v"
      ? toWeightPerVolumePercent(preparation.labelConcentration, "w/v")
      : undefined;
  if (sourcePercent === undefined) return undefined;
  const concentrationPercent = plan.mode === "working-dilution" ? plan.workingPercent : sourcePercent;
  return roundPpm((concentrationPercent * doseMl * 10_000) / finalVolumeMl);
}

function dateTimeValue(value?: string) {
  if (!value) return "";
  const date = new Date(value);
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
}

export function ChemicalPreparation({
  stepId,
  sterilization,
  onConfirm,
  onDoseChange,
  defaultTargetPpm,
  defaultFinalVolumeMl,
}: {
  stepId: EditableStepId;
  sterilization: LotSterilizationSnapshot;
  onConfirm: (snapshot: LotSterilizationSnapshot) => Promise<void>;
  onDoseChange?: (dose: DoseValue | undefined) => void;
  defaultTargetPpm?: number;
  defaultFinalVolumeMl?: number;
}) {
  const key = stepId === "prep-media" ? "mediumPreparation" : "surfacePreparation";
  const preparation = sterilization[key];
  const [productName, setProductName] = useState(preparation?.productName ?? "");
  const [batchOrLot, setBatchOrLot] = useState(preparation?.batchOrLot ?? "");
  const [targetPpm, setTargetPpm] = useState(preparation?.targetPpm?.toString() ?? defaultTargetPpm?.toString() ?? "");
  const [finalVolumeMl, setFinalVolumeMl] = useState(preparation?.finalVolumeMl?.toString() ?? defaultFinalVolumeMl?.toString() ?? "");
  const [actualDose, setActualDose] = useState(preparation?.actualDose?.value.toString() ?? "");
  const [actualPpm, setActualPpm] = useState(preparation?.actualPpm?.toString() ?? "");
  const [preparedAt, setPreparedAt] = useState(dateTimeValue(preparation?.preparedAt));
  const [status, setStatus] = useState<PreparationStatus>(preparation?.status ?? "planned");
  const [plan, setPlan] = useState<HaiterAutoResult | NadccAutoResult | null>(null);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const onHaiterPlanChange = useCallback((next: HaiterAutoResult | null) => setPlan(next), []);
  const onNadccPlanChange = useCallback((next: NadccAutoResult | null) => setPlan(next), []);
  const dose = calculatedDose(plan) ?? preparation?.calculatedDose;
  const doseValue = dose?.value;
  const doseUnit = dose?.unit;

  useEffect(() => {
    onDoseChange?.(doseValue === undefined || doseUnit === undefined ? undefined : { value: doseValue, unit: doseUnit });
  }, [doseUnit, doseValue, onDoseChange]);

  if (!preparation || preparation.method === "pressure-sterilization") return null;

  const lockedPreparation: ChemicalPreparationSnapshot = preparation;
  const isNadcc = lockedPreparation.method === "nadcc-chemical" || lockedPreparation.method === "nadcc-soak";
  const isMediumHaiter = stepId === "prep-media" && lockedPreparation.method === "haiter-chemical";
  const target = Number(targetPpm);
  const volume = Number(finalVolumeMl);
  const enteredDose = Number(actualDose);
  const doseForEstimate = enteredDose > 0 ? enteredDose : dose?.value;
  const estimatedPpm = plan && doseForEstimate !== undefined
    ? estimatePpmFromDose(plan, lockedPreparation, doseForEstimate, volume)
    : undefined;
  const actualDoseHint = dose
    ? `ผลคำนวณ ${dose.value} ${dose.unit} เป็นค่าทางสูตร ไม่ใช่ค่าที่ต้องเดา · ตวงด้วย syringe หรือเครื่องชั่ง แล้วกรอกค่าที่ตวงจริงตามที่อ่านได้ (ถ้าขีดละเอียด 0.1 mL ให้ปัดตามขีด เช่น 1.281481 mL อ่านเป็นประมาณ 1.3 mL)`
    : "ผลคำนวณด้านล่างเป็นค่าทางสูตร ไม่ใช่ค่าที่ต้องเดา · ตวงด้วย syringe หรือเครื่องชั่ง แล้วกรอกค่าที่ตวงจริงตามที่อ่านได้ (ถ้าขีดละเอียด 0.1 mL ให้ปัดตามขีด)";
  const actualPpmHint = [
    estimatedPpm !== undefined
      ? `จากปริมาตร ${doseForEstimate} mL ระบบคำนวณได้ประมาณ ${estimatedPpm} ppm (ค่าจากสูตร ยังไม่ใช่ค่าตรวจ)`
      : null,
    "ถ้าจะบันทึกค่าตรวจจริง ให้เก็บตัวอย่างหลังผสมแล้ววัดด้วยชุดทดสอบคลอรีนอิสระ (free chlorine เช่น DPD) หรือเครื่องที่ระบุว่าวัด free chlorine โดยตรง",
    "กรอกค่าที่อ่านได้จากเครื่องเท่านั้น · เครื่องวัด ppm ในน้ำทั่วไปมักวัด TDS/EC ไม่ใช่คลอรีน ห้ามกรอกแทนค่าคลอรีน · ถ้าไม่มีชุดตรวจ ให้ยังไม่เลือก verified",
  ].filter(Boolean).join(" · ");

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

  return (
    <section className="cl-chemical-preparation">
      <h2>ยืนยันการเตรียมสาร</h2>
      <p className="cl-meta">
        โปรโตคอล {preparation.protocolVersion} · สถานะที่ล็อกไว้ {preparation.status}
      </p>
      {isMediumHaiter ? (
        <p className="cl-lede" style={{ marginTop: "8px" }}>
          ขั้นอาหารใช้ค่าเริ่มต้นตาม protocol: อัตรา Haiter 2 mL/L · ระบบเติมเป้าหมายและปริมาตร batch ให้แล้ว แก้ได้เมื่อมีเหตุผลและควรจดไว้กับรอบ
        </p>
      ) : null}
      <form onSubmit={(event) => void submit(event)}>
        <div className="cl-preparation-fields">
          <FieldGroup id="preparation-product" label="ผลิตภัณฑ์"><input id="preparation-product" value={productName} onChange={(event) => setProductName(event.currentTarget.value)} /></FieldGroup>
          <FieldGroup id="preparation-batch" label="Batch / lot"><input id="preparation-batch" value={batchOrLot} onChange={(event) => setBatchOrLot(event.currentTarget.value)} /></FieldGroup>
          <FieldGroup id="preparation-target" label={isMediumHaiter ? "เป้าหมายคลอรีนออกฤทธิ์ (จาก 2 mL/L)" : "เป้าหมาย"} unit="ppm"><input id="preparation-target" type="number" step="any" value={targetPpm} onChange={(event) => setTargetPpm(event.currentTarget.value)} /></FieldGroup>
          <FieldGroup id="preparation-volume" label={isMediumHaiter ? "ปริมาตรอาหาร batch นี้" : "ปริมาตรสุดท้าย"} unit="mL"><input id="preparation-volume" type="number" step="any" value={finalVolumeMl} onChange={(event) => setFinalVolumeMl(event.currentTarget.value)} /></FieldGroup>
          <FieldGroup id="preparation-time" label="วันเวลาที่เตรียม"><input id="preparation-time" type="datetime-local" value={preparedAt} onChange={(event) => setPreparedAt(event.currentTarget.value)} /></FieldGroup>
          <FieldGroup id="preparation-status" label="สถานะ"><select id="preparation-status" value={status} onChange={(event) => setStatus(event.currentTarget.value as PreparationStatus)}><option value="planned">planned</option><option value="prepared">prepared</option><option value="verified">verified</option></select></FieldGroup>
          <FieldGroup id="preparation-actual-dose" label="ปริมาณที่ใช้จริง" hint={actualDoseHint} unit={dose?.unit ?? "mL"}><input id="preparation-actual-dose" type="number" step="any" value={actualDose} onChange={(event) => setActualDose(event.currentTarget.value)} /></FieldGroup>
          <FieldGroup id="preparation-actual-ppm" label="ความเข้มข้นที่ตรวจได้จริง" hint={actualPpmHint} unit="ppm"><input id="preparation-actual-ppm" type="number" step="any" value={actualPpm} onChange={(event) => setActualPpm(event.currentTarget.value)} /></FieldGroup>
        </div>

        {!(target > 0) || !(volume > 0) ? (
          <StatusNotice tone="blocked" title="ยังคำนวณไม่ได้">
            ต้องระบุ target concentration และ final volume จากโปรโตคอลที่ทบทวนแล้วก่อน ระบบจะไม่สร้างค่าทางวิทยาศาสตร์ให้เอง
          </StatusNotice>
        ) : isNadcc ? (
          <NadccCalculator
            initialInput={{
              tabletMg: (sterilization.chemistry?.nadccMassGPerTablet ?? 2.97) * 1000,
              availableChlorinePercent: preparation.labelConcentration ?? sterilization.chemistry?.nadccAvailableChlorinePercent,
              stockVolumeMl: preparation.stockVolumeMl ?? 100,
              targetPpm: target,
              finalVolumeMl: volume,
              ...(sterilization.minimumToolVolumeMl !== undefined
                ? { minimumMeasurableMl: sterilization.minimumToolVolumeMl }
                : {}),
            }}
            onPlanChange={onNadccPlanChange}
          />
        ) : (
          <HaiterCalculator
            initialInput={{
              sourcePercent: preparation.labelConcentration,
              targetPercent: target / 10_000,
              finalVolumeMl: volume,
              ...(sterilization.minimumToolVolumeMl !== undefined
                ? { minimumMeasurableMl: sterilization.minimumToolVolumeMl }
                : {}),
            }}
            initialLabelBasis={preparation.labelBasis === "w/w" ? "w/w" : "w/v"}
            onPlanChange={onHaiterPlanChange}
          />
        )}

        {dose ? <p className="cl-calculated-dose">ค่าคำนวณล่าสุด: {dose.value} {dose.unit}</p> : null}
        <ActionBar primary={<button className="cl-button-primary" type="submit" disabled={saving}>{saving ? "กำลังบันทึก…" : "บันทึก preparation snapshot"}</button>} />
        {message ? <p role="status" className="cl-meta">{message}</p> : null}
      </form>
    </section>
  );
}
