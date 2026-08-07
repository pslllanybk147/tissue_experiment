"use client";

import { useMemo, useState } from "react";
import {
  calculateHaiterDose,
  planHaiterWorkingDilution,
  toWeightPerVolumePercent,
  type LabelBasis,
  type HaiterDoseInput,
  type HaiterDoseResult,
  type HaiterWorkingDilutionInput,
  type HaiterWorkingDilutionResult,
} from "@/lib/domain/haiter-calculations";
import { CalculatorField } from "./calculator-field";

type Mode = "direct" | "working-dilution";

type Attempt<T> = { ok: true; result: T } | { ok: false; message: string };

const defaultDoseInput: HaiterDoseInput = {
  sourcePercent: 6,
  targetPercent: 1,
  finalVolumeMl: 100,
  minimumMeasurableMl: 1,
};

const defaultDilutionInput: HaiterWorkingDilutionInput = {
  sourcePercent: 6,
  dilutionFactor: 10,
  workingVolumeMl: 100,
  targetPercent: 1,
  finalVolumeMl: 100,
  minimumMeasurableMl: 1,
};

function tryCalculateDose(input: HaiterDoseInput): Attempt<HaiterDoseResult> {
  try {
    return { ok: true, result: calculateHaiterDose(input) };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : String(error) };
  }
}

function tryPlanDilution(input: HaiterWorkingDilutionInput): Attempt<HaiterWorkingDilutionResult> {
  try {
    return { ok: true, result: planHaiterWorkingDilution(input) };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : String(error) };
  }
}

export function HaiterCalculator({
  initialMode = "direct",
  initialDoseInput,
  initialDilutionInput,
}: {
  initialMode?: Mode;
  /** ตั้งค่าเริ่มต้นจากอุปกรณ์ของผู้ใช้ (minimumMeasurableMl) และใช้ในเทสต์ */
  initialDoseInput?: Partial<HaiterDoseInput>;
  initialDilutionInput?: Partial<HaiterWorkingDilutionInput>;
}) {
  const [mode, setMode] = useState<Mode>(initialMode);

  const doseMerged = { ...defaultDoseInput, ...initialDoseInput };
  const [sourcePercent, setSourcePercent] = useState(doseMerged.sourcePercent);
  // ฉลากบอกได้สองแบบและไม่เท่ากัน ต้องแปลงเป็น w/v ก่อนเข้าสูตรทุกครั้ง
  const [labelBasis, setLabelBasis] = useState<LabelBasis>("w/v");
  const effectiveSourcePercent = useMemo(() => {
    try {
      return toWeightPerVolumePercent(sourcePercent, labelBasis);
    } catch {
      return sourcePercent;
    }
  }, [sourcePercent, labelBasis]);
  const [targetPercent, setTargetPercent] = useState(doseMerged.targetPercent);
  const [finalVolumeMl, setFinalVolumeMl] = useState(doseMerged.finalVolumeMl);
  const [minimumMeasurableMl, setMinimumMeasurableMl] = useState(doseMerged.minimumMeasurableMl);

  const dilutionMerged = { ...defaultDilutionInput, ...initialDilutionInput };
  const [dilutionFactor, setDilutionFactor] = useState(dilutionMerged.dilutionFactor);
  const [workingVolumeMl, setWorkingVolumeMl] = useState(dilutionMerged.workingVolumeMl);

  const dose = useMemo(
    () =>
      tryCalculateDose({
        sourcePercent: effectiveSourcePercent,
        targetPercent,
        finalVolumeMl,
        minimumMeasurableMl,
      }),
    [effectiveSourcePercent, targetPercent, finalVolumeMl, minimumMeasurableMl],
  );

  const dilution = useMemo(
    () =>
      tryPlanDilution({
        sourcePercent: effectiveSourcePercent,
        dilutionFactor,
        workingVolumeMl,
        targetPercent,
        finalVolumeMl,
        minimumMeasurableMl,
      }),
    [effectiveSourcePercent, dilutionFactor, workingVolumeMl, targetPercent, finalVolumeMl, minimumMeasurableMl],
  );

  return (
    <section>
      <h2 className="pl-h2">ไฮเตอร์ / สารฟอกฆ่าเชื้อ</h2>

      <div className="pl-calc-tabs" role="tablist" aria-label="โหมดคำนวณไฮเตอร์">
        <button type="button" role="tab" aria-selected={mode === "direct"} className="pl-calc-tab" onClick={() => setMode("direct")}>
          คำนวณตรง
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === "working-dilution"}
          className="pl-calc-tab"
          onClick={() => setMode("working-dilution")}
        >
          Working dilution
        </button>
      </div>

      {mode === "direct" ? (
        <div className="pl-soft-card" style={{ marginTop: "14px", display: "flex", flexDirection: "column", gap: "12px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "12px" }}>
            <CalculatorField id="hd-source" label="% สารต้นทาง" value={sourcePercent} onChange={setSourcePercent} />
            <label style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "14px" }}>
              ฉลากบอกแบบไหน
              <select
                value={labelBasis}
                onChange={(event) => setLabelBasis(event.target.value as LabelBasis)}
                className="pl-input"
              >
                <option value="w/v">w/v หรือไม่ได้ระบุ</option>
                <option value="w/w">w/w</option>
              </select>
            </label>
            <CalculatorField id="hd-target" label="% เป้าหมาย" value={targetPercent} onChange={setTargetPercent} />
            <CalculatorField id="hd-volume" label="ปริมาตรสุดท้าย (mL)" value={finalVolumeMl} onChange={setFinalVolumeMl} />
            <CalculatorField id="hd-min" label="ตวงได้ละเอียดสุด (mL)" value={minimumMeasurableMl} onChange={setMinimumMeasurableMl} />
          </div>

          {labelBasis === "w/w" ? (
            <p className="pl-lede" style={{ margin: 0 }}>
              ฉลาก {sourcePercent}% w/w คิดเป็น {effectiveSourcePercent}% w/v หลังคูณความหนาแน่นของน้ำยาฟอกขาว
              ระบบใช้ค่าหลังแปลงในการคำนวณให้แล้ว
            </p>
          ) : null}
          {dose.ok ? (
            <div className="pl-soft-card" style={{ background: "var(--pl-sunk)" }}>
              <p className="pl-mono">{dose.result.formula}</p>
              <p style={{ margin: "4px 0 0", fontSize: "26px", fontWeight: 800, fontVariantNumeric: "tabular-nums" }}>
                {dose.result.sourceVolumeMl} mL
              </p>
              {dose.result.warning ? (
                <div style={{ marginTop: "10px" }}>
                  <p className="pl-lede">{dose.result.warning}</p>
                  <button type="button" className="pl-calc-tab" onClick={() => setMode("working-dilution")}>
                    ไปทำ working dilution
                  </button>
                </div>
              ) : null}
            </div>
          ) : (
            <p className="pl-soft-card" role="alert" style={{ background: "var(--pl-stop)" }}>{dose.message}</p>
          )}
        </div>
      ) : (
        <div className="pl-soft-card" style={{ marginTop: "14px", display: "flex", flexDirection: "column", gap: "12px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "12px" }}>
            <CalculatorField id="hwd-source" label="% สารต้นทาง" value={sourcePercent} onChange={setSourcePercent} />
            <label style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "14px" }}>
              ฉลากบอกแบบไหน
              <select
                value={labelBasis}
                onChange={(event) => setLabelBasis(event.target.value as LabelBasis)}
                className="pl-input"
              >
                <option value="w/v">w/v หรือไม่ได้ระบุ</option>
                <option value="w/w">w/w</option>
              </select>
            </label>
            <CalculatorField id="hwd-factor" label="เจือจางกี่เท่า" value={dilutionFactor} onChange={setDilutionFactor} />
            <CalculatorField id="hwd-volume" label="ปริมาตร working ที่จะเตรียม (mL)" value={workingVolumeMl} onChange={setWorkingVolumeMl} />
            <CalculatorField id="hwd-target" label="% เป้าหมาย" value={targetPercent} onChange={setTargetPercent} />
            <CalculatorField id="hwd-final" label="ปริมาตรสุดท้าย (mL)" value={finalVolumeMl} onChange={setFinalVolumeMl} />
            <CalculatorField id="hwd-min" label="ตวงได้ละเอียดสุด (mL)" value={minimumMeasurableMl} onChange={setMinimumMeasurableMl} />
          </div>

          {labelBasis === "w/w" ? (
            <p className="pl-lede" style={{ margin: 0 }}>
              ฉลาก {sourcePercent}% w/w คิดเป็น {effectiveSourcePercent}% w/v หลังคูณความหนาแน่นของน้ำยาฟอกขาว
              ระบบใช้ค่าหลังแปลงในการคำนวณให้แล้ว
            </p>
          ) : null}
          {dilution.ok ? (
            <div className="pl-soft-card" style={{ background: "var(--pl-sunk)" }}>
              <p className="pl-mono">working stock {dilution.result.workingPercent}%</p>
              <ol style={{ margin: "10px 0 0", paddingLeft: "20px", display: "flex", flexDirection: "column", gap: "6px" }}>
                <li>ตวงต้นทาง {dilution.result.sourceVolumeMl} mL</li>
                <li>เติมน้ำ {dilution.result.diluentVolumeMl} mL</li>
                <li>ตวง working stock ใส่จริง {dilution.result.workingDoseMl} mL</li>
              </ol>
              {dilution.result.warning ? <p className="pl-lede" style={{ marginTop: "8px" }}>{dilution.result.warning}</p> : null}
            </div>
          ) : (
            <p className="pl-soft-card" role="alert" style={{ background: "var(--pl-stop)" }}>{dilution.message}</p>
          )}
        </div>
      )}
    </section>
  );
}
