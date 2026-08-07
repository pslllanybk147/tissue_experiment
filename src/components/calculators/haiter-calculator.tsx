"use client";

import { useMemo, useState } from "react";
import {
  planHaiterCleaningDose,
  toWeightPerVolumePercent,
  type LabelBasis,
  type HaiterAutoInput,
  type HaiterAutoResult,
} from "@/lib/domain/haiter-calculations";
import { CalculatorField } from "./calculator-field";

type Attempt<T> = { ok: true; result: T } | { ok: false; message: string };

const defaultInput: HaiterAutoInput = {
  sourcePercent: 6,
  targetPercent: 1,
  finalVolumeMl: 100,
  minimumMeasurableMl: 1,
};

function tryPlan(input: HaiterAutoInput): Attempt<HaiterAutoResult> {
  try {
    return { ok: true, result: planHaiterCleaningDose(input) };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : String(error) };
  }
}

export function HaiterCalculator({
  initialInput,
}: {
  /** ตั้งค่าเริ่มต้นจากอุปกรณ์ของผู้ใช้ (minimumMeasurableMl) และใช้ในเทสต์ */
  initialInput?: Partial<HaiterAutoInput>;
}) {
  const merged = { ...defaultInput, ...initialInput };
  const [sourcePercent, setSourcePercent] = useState(merged.sourcePercent);
  // ฉลากบอกได้สองแบบและไม่เท่ากัน ต้องแปลงเป็น w/v ก่อนเข้าสูตรทุกครั้ง
  const [labelBasis, setLabelBasis] = useState<LabelBasis>("w/v");
  const effectiveSourcePercent = useMemo(() => {
    try {
      return toWeightPerVolumePercent(sourcePercent, labelBasis);
    } catch {
      return sourcePercent;
    }
  }, [sourcePercent, labelBasis]);
  const [targetPercent, setTargetPercent] = useState(merged.targetPercent);
  const [finalVolumeMl, setFinalVolumeMl] = useState(merged.finalVolumeMl);
  const [minimumMeasurableMl, setMinimumMeasurableMl] = useState(merged.minimumMeasurableMl);

  const plan = useMemo(
    () =>
      tryPlan({
        sourcePercent: effectiveSourcePercent,
        targetPercent,
        finalVolumeMl,
        minimumMeasurableMl,
      }),
    [effectiveSourcePercent, targetPercent, finalVolumeMl, minimumMeasurableMl],
  );

  return (
    <section>
      <h2 className="pl-h2">ไฮเตอร์ / สารฟอกฆ่าเชื้อ</h2>

      <div className="pl-soft-card" style={{ marginTop: "14px", display: "flex", flexDirection: "column", gap: "12px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "12px" }}>
          <CalculatorField
            id="hd-source"
            label="ความเข้มข้นบนฉลากขวด (%)"
            value={sourcePercent}
            onChange={setSourcePercent}
            hint="ตัวเลข % ที่เขียนบนฉลากไฮเตอร์ เช่น 6"
          />
          <label style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "14px" }}>
            ฉลากเขียนกำกับว่า
            <select
              value={labelBasis}
              onChange={(event) => setLabelBasis(event.target.value as LabelBasis)}
              className="pl-input"
            >
              <option value="w/v">w/v หรือไม่ได้ระบุ</option>
              <option value="w/w">w/w</option>
            </select>
            <span className="pl-meta">ไม่แน่ใจให้เลือกตัวแรก ฉลากบ้านเราส่วนใหญ่เป็นแบบนี้</span>
          </label>
          <CalculatorField
            id="hd-target"
            label="อยากได้น้ำยาความเข้มข้นเท่าไหร่ (%)"
            value={targetPercent}
            onChange={setTargetPercent}
            hint="ดูจากสูตร/คู่มือที่ใช้อยู่"
          />
          <CalculatorField
            id="hd-volume"
            label="อยากได้น้ำยาทั้งหมดกี่ mL"
            value={finalVolumeMl}
            onChange={setFinalVolumeMl}
          />
          <CalculatorField
            id="hd-min"
            label="อุปกรณ์ตวงที่มีละเอียดสุดกี่ mL"
            value={minimumMeasurableMl}
            onChange={setMinimumMeasurableMl}
            hint="เช่น syringe เล็กมักละเอียด 0.1–1 mL"
          />
        </div>

        {labelBasis === "w/w" ? (
          <p className="pl-lede" style={{ margin: 0 }}>
            ฉลาก {sourcePercent}% w/w คิดเป็น {effectiveSourcePercent}% w/v หลังคูณความหนาแน่นของน้ำยาฟอกขาว
            ระบบใช้ค่าหลังแปลงในการคำนวณให้แล้ว
          </p>
        ) : null}

        {plan.ok && plan.result.mode === "direct" ? (
          <div className="pl-soft-card" style={{ background: "var(--pl-sunk)" }}>
            <p className="pl-mono">{plan.result.formula}</p>
            <p style={{ margin: "4px 0 0", fontSize: "26px", fontWeight: 800, fontVariantNumeric: "tabular-nums" }}>
              {plan.result.sourceVolumeMl} mL
            </p>
          </div>
        ) : null}

        {plan.ok && plan.result.mode === "working-dilution" ? (
          <div className="pl-soft-card" style={{ background: "var(--pl-sunk)" }}>
            <p className="pl-mono">ขั้น 1: เตรียมน้ำยาเจือจางก่อน</p>
            <p style={{ margin: "4px 0 0" }}>
              ตวงไฮเตอร์ {plan.result.sourceVolumeMl} mL + น้ำ {plan.result.diluentVolumeMl} mL รวมเป็น{" "}
              {plan.result.workingVolumeMl} mL
            </p>
            <p className="pl-mono" style={{ marginTop: "12px" }}>ขั้น 2: จากน้ำยาเจือจางที่เตรียมไว้</p>
            <p style={{ margin: "4px 0 0" }}>
              ตวง {plan.result.workingDoseMl} mL ผสมน้ำให้ครบ {finalVolumeMl} mL
            </p>
            <p className="pl-meta" style={{ marginTop: "10px" }}>
              (เจือจาง 1:{plan.result.dilutionFactor} ได้น้ำยาเจือจางเข้มข้น {plan.result.workingPercent}%)
            </p>
          </div>
        ) : null}

        {!plan.ok ? (
          <p className="pl-soft-card" role="alert" style={{ background: "var(--pl-stop)" }}>{plan.message}</p>
        ) : null}
      </div>
    </section>
  );
}
