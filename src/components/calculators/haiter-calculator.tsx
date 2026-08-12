"use client";

import { useEffect, useMemo, useState } from "react";
import {
  planHaiterCleaningDose,
  toWeightPerVolumePercent,
  type LabelBasis,
  type HaiterAutoInput,
  type HaiterAutoResult,
  type HaiterRounding,
} from "@/lib/domain/haiter-calculations";
import { CalculatorField } from "./calculator-field";
import { FieldGroup } from "@/components/common/field-group";

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

/** แสดงผลแบบเดียวกับเครื่องคำนวณ NaDCC: ค่าคำนวณ → ค่าที่ตวงได้จริง → ผลหลังปัด
 *  เดิมฝั่ง Haiter โชว์เลขทศนิยมหกตำแหน่งเฉย ๆ ซึ่งตวงไม่ได้และไม่บอกว่าเพี้ยนแค่ไหน */
function Rounding({
  rounding,
  source,
  targetPercent,
}: {
  rounding: HaiterRounding;
  source: string;
  targetPercent: number;
}) {
  const directionLabel = { up: "ปัดขึ้น", down: "ปัดลง", none: "ตวงได้พอดี" }[rounding.roundingDirection];
  return (
    <>
      <p className="pl-meta" style={{ marginTop: "8px" }}>ค่าคำนวณก่อนปัด {rounding.calculatedVolumeMl} mL</p>
      <p style={{ margin: "4px 0 0", fontSize: "26px", fontWeight: 800, fontVariantNumeric: "tabular-nums" }}>
        ตวงจริง {rounding.actionableVolumeMl} mL
      </p>
      <p className="pl-meta" style={{ marginTop: "4px" }}>ตวงจาก{source} · ความละเอียด {rounding.resolutionMl} mL · {directionLabel}</p>
      {rounding.roundingDirection !== "none" ? (
        <p className="pl-meta" style={{ marginTop: "4px" }}>
          หลังปัดจะได้ประมาณ {rounding.actionableTargetPercent}% ไม่ใช่ {targetPercent}% พอดี
        </p>
      ) : null}
    </>
  );
}

export function HaiterCalculator({
  initialInput,
  initialLabelBasis,
  onPlanChange,
}: {
  /** ตั้งค่าเริ่มต้นจากอุปกรณ์ของผู้ใช้ (minimumMeasurableMl) และใช้ในเทสต์ */
  initialInput?: Partial<HaiterAutoInput>;
  /** ถ้าโปรไฟล์มีฉลาก 6% w/w ให้เปิดหน้าด้วยหน่วยนี้ ไม่บังคับให้ผู้ใช้จำได้เอง */
  initialLabelBasis?: LabelBasis;
  onPlanChange?: (plan: HaiterAutoResult | null) => void;
}) {
  const merged = { ...defaultInput, ...initialInput };
  const [sourcePercent, setSourcePercent] = useState(merged.sourcePercent);
  // ฉลากบอกได้สองแบบและไม่เท่ากัน ต้องแปลงเป็น w/v ก่อนเข้าสูตรทุกครั้ง
  const [labelBasis, setLabelBasis] = useState<LabelBasis>(initialLabelBasis ?? "w/v");
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

  useEffect(() => {
    onPlanChange?.(plan.ok ? plan.result : null);
  }, [onPlanChange, plan]);

  return (
    <section className="cl-calculator cl-haiter-calculator cl-atlas-form-section">
      <h2 className="pl-h2">ไฮเตอร์ / สารฟอกฆ่าเชื้อ</h2>

      <div className="cl-calculator-body">
        <div className="cl-atlas-field-grid">
          <CalculatorField
            id="hd-source"
            label="ความเข้มข้นบนฉลากขวด"
            unit="%"
            value={sourcePercent}
            onChange={setSourcePercent}
            hint="ตัวเลข % ที่เขียนบนฉลากไฮเตอร์ เช่น 6"
          />
          <FieldGroup id="hd-label-basis" label="ฉลากเขียนกำกับว่า" hint="ไม่แน่ใจให้เลือกตัวแรก ฉลากบ้านเราส่วนใหญ่เป็นแบบนี้">
            <select
              id="hd-label-basis"
              value={labelBasis}
              onChange={(event) => setLabelBasis(event.target.value as LabelBasis)}
              className="cl-input"
            >
              <option value="w/v">w/v หรือไม่ได้ระบุ</option>
              <option value="w/w">w/w</option>
            </select>
          </FieldGroup>
          <CalculatorField
            id="hd-target"
            label="อยากได้น้ำยาความเข้มข้นเท่าไหร่"
            unit="%"
            value={targetPercent}
            onChange={setTargetPercent}
            hint="ดูจากสูตร/คู่มือที่ใช้อยู่"
          />
          <CalculatorField
            id="hd-volume"
            label="อยากได้น้ำยาทั้งหมด"
            unit="mL"
            value={finalVolumeMl}
            onChange={setFinalVolumeMl}
          />
          <CalculatorField
            id="hd-min"
            label="อุปกรณ์ตวงที่มีละเอียดสุด"
            unit="mL"
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
          <div className="cl-calculator-result cl-atlas-result" aria-live="polite" aria-label="ผลการคำนวณไฮเตอร์">
            <p className="cl-result-disclaimer">ค่าจากสูตร ยังไม่ใช่ค่าตรวจ</p>
            <p className="pl-mono">{plan.result.formula}</p>
            <Rounding rounding={plan.result.rounding} source="ขวดน้ำยาฟอกโดยตรง" targetPercent={targetPercent} />
          </div>
        ) : null}

        {plan.ok && plan.result.mode === "working-dilution" ? (
          <div className="cl-calculator-result cl-atlas-result" aria-live="polite" aria-label="ผลการคำนวณไฮเตอร์">
            <p className="cl-result-disclaimer">ค่าจากสูตร ยังไม่ใช่ค่าตรวจ</p>
            <p className="pl-mono">ขั้น 1: เตรียมน้ำยาเจือจางก่อน</p>
            <p style={{ margin: "4px 0 0" }}>
              ตวงไฮเตอร์ {plan.result.sourceVolumeMl} mL + น้ำ {plan.result.diluentVolumeMl} mL รวมเป็น{" "}
              {plan.result.workingVolumeMl} mL
            </p>
            <p className="pl-mono" style={{ marginTop: "12px" }}>ขั้น 2: จากน้ำยาเจือจางที่เตรียมไว้</p>
            <p style={{ margin: "4px 0 0" }}>
              ตวงจาก<strong>น้ำยาเจือจาง</strong>ที่เพิ่งทำ (ไม่ใช่จากขวดเดิม) แล้วผสมน้ำให้ครบ {finalVolumeMl} mL
            </p>
            <Rounding rounding={plan.result.rounding} source={`น้ำยาเจือจาง ${plan.result.workingPercent}%`} targetPercent={targetPercent} />
            <p className="pl-meta" style={{ marginTop: "10px" }}>
              (เจือจาง 1:{plan.result.dilutionFactor} ได้น้ำยาเจือจางเข้มข้น {plan.result.workingPercent}%)
            </p>
          </div>
        ) : null}

        {!plan.ok ? (
          <p className="cl-calculator-error" role="alert">{plan.message}</p>
        ) : null}
      </div>
    </section>
  );
}
