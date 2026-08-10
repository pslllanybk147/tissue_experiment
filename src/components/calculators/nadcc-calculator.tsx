"use client";

import { useEffect, useMemo, useState } from "react";
import { planNadccCleaningDose, type NadccAutoInput, type NadccAutoResult } from "@/lib/domain/nadcc-calculations";
import { CalculatorField } from "./calculator-field";

type Attempt<T> = { ok: true; result: T } | { ok: false; message: string };

// ค่าเริ่มต้นตามตัวอย่างที่คำนวณไว้จริงใน new_idea.md หัวข้อ 12 (เม็ดฟู่ 5.4 g, NaDCC 2.97 g/เม็ด)
const defaultInput: NadccAutoInput = {
  tabletMg: 2970,
  availableChlorinePercent: 60,
  stockVolumeMl: 100,
  targetPpm: 300,
  finalVolumeMl: 100,
  minimumMeasurableMl: 1,
};

function tryPlan(input: NadccAutoInput): Attempt<NadccAutoResult> {
  try {
    return { ok: true, result: planNadccCleaningDose(input) };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : String(error) };
  }
}

export function NadccCalculator({
  initialInput,
  onPlanChange,
}: {
  /** ตั้งค่าเริ่มต้นจากอุปกรณ์ของผู้ใช้ (minimumMeasurableMl) และใช้ในเทสต์ */
  initialInput?: Partial<NadccAutoInput>;
  onPlanChange?: (plan: NadccAutoResult | null) => void;
}) {
  const merged = { ...defaultInput, ...initialInput };
  const [tabletMg, setTabletMg] = useState(merged.tabletMg);
  const [availableChlorinePercent, setAvailableChlorinePercent] = useState(merged.availableChlorinePercent);
  const [stockVolumeMl, setStockVolumeMl] = useState(merged.stockVolumeMl);
  const [targetPpm, setTargetPpm] = useState(merged.targetPpm);
  const [finalVolumeMl, setFinalVolumeMl] = useState(merged.finalVolumeMl);
  const [minimumMeasurableMl, setMinimumMeasurableMl] = useState(merged.minimumMeasurableMl);

  const plan = useMemo(
    () =>
      tryPlan({
        tabletMg,
        availableChlorinePercent,
        stockVolumeMl,
        targetPpm,
        finalVolumeMl,
        minimumMeasurableMl,
      }),
    [tabletMg, availableChlorinePercent, stockVolumeMl, targetPpm, finalVolumeMl, minimumMeasurableMl],
  );

  useEffect(() => {
    onPlanChange?.(plan.ok ? plan.result : null);
  }, [onPlanChange, plan]);

  return (
    <section>
      <h2 className="pl-h2">NaDCC (เม็ดคลอรีน)</h2>
      <p className="pl-lede" style={{ marginTop: "6px" }}>
        ทางเลือกทดลอง ยังไม่มีงานยืนยันเจาะจงพืชส่วนใหญ่ในระบบ ใช้เป็นจุดเริ่มต้นการทดสอบเอง ไม่ใช่สูตรสำเร็จ
      </p>
      <p className="pl-meta" style={{ marginTop: "8px" }}>
        ค่าตั้งต้นจากฉลากที่ผู้ใช้ส่ง: เม็ดทั้งเม็ด 5.4 g มี NaDCC 2.97 g และระบุคลอรีนออกฤทธิ์ 60%
      </p>

      <div className="pl-soft-card" style={{ marginTop: "14px", display: "flex", flexDirection: "column", gap: "12px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "12px" }}>
          <CalculatorField
            id="nd-tablet"
            label="NaDCC บริสุทธิ์ต่อเม็ด (mg)"
            value={tabletMg}
            onChange={setTabletMg}
            hint="ดูจากฉลาก ไม่ใช่น้ำหนักเม็ดทั้งเม็ด เช่นเม็ด 5.4 g มี NaDCC 2970 mg"
          />
          <CalculatorField
            id="nd-percent"
            label="Available chlorine ของ NaDCC (%)"
            value={availableChlorinePercent}
            onChange={setAvailableChlorinePercent}
            hint="ไม่ทราบให้ใช้ค่ามาตรฐาน 60"
          />
          <CalculatorField
            id="nd-stock-vol"
            label="ละลายเม็ดในน้ำกี่ mL (stock)"
            value={stockVolumeMl}
            onChange={setStockVolumeMl}
          />
          <CalculatorField
            id="nd-target"
            label="อยากได้น้ำ rinse ความเข้มข้นเท่าไหร่ (ppm)"
            value={targetPpm}
            onChange={setTargetPpm}
            hint="ดูจากสูตร/คู่มือที่ใช้อยู่"
          />
          <CalculatorField
            id="nd-volume"
            label="อยากได้น้ำ rinse ทั้งหมดกี่ mL"
            value={finalVolumeMl}
            onChange={setFinalVolumeMl}
          />
          <CalculatorField
            id="nd-min"
            label="อุปกรณ์ตวงที่มีละเอียดสุดกี่ mL"
            value={minimumMeasurableMl}
            onChange={setMinimumMeasurableMl}
            hint="เช่น syringe เล็กมักละเอียด 0.1–1 mL"
          />
        </div>

        {plan.ok ? (
          <p className="pl-meta" style={{ margin: 0 }}>
            stock ที่ได้จากการละลายเม็ด ≈ {plan.result.stockPpm} ppm available chlorine
          </p>
        ) : null}

        {plan.ok && plan.result.mode === "direct" ? (
          <div className="pl-soft-card" style={{ background: "var(--pl-sunk)" }}>
            <p className="pl-mono">{plan.result.formula}</p>
            <p className="pl-meta" style={{ marginTop: "8px" }}>
              ค่าคำนวณก่อนปัด {plan.result.calculatedVolumeMl} mL
            </p>
            <p style={{ margin: "4px 0 0", fontSize: "26px", fontWeight: 800, fontVariantNumeric: "tabular-nums" }}>
              ตวงจริง {plan.result.actionableVolumeMl} mL
            </p>
            <p className="pl-meta" style={{ marginTop: "6px" }}>
              ความละเอียด {plan.result.resolutionMl} mL · {plan.result.roundingDirection === "up" ? "ปัดขึ้น" : plan.result.roundingDirection === "down" ? "ปัดลง" : "ไม่ต้องปัด"}
            </p>
            <p className="pl-meta" style={{ marginTop: "4px" }}>หลังปัดจะได้ประมาณ {plan.result.actionableTargetPpm} ppm ไม่ใช่ 300 ppm พอดี</p>
          </div>
        ) : null}

        {plan.ok && plan.result.mode === "working-dilution" ? (
          <div className="pl-soft-card" style={{ background: "var(--pl-sunk)" }}>
            <p className="pl-mono">ขั้น 1: เตรียม stock เจือจางก่อน</p>
            <p style={{ margin: "4px 0 0" }}>
              ตวง stock {plan.result.sourceVolumeMl} mL + น้ำ {plan.result.diluentVolumeMl} mL รวมเป็น{" "}
              {plan.result.workingVolumeMl} mL
            </p>
            <p className="pl-mono" style={{ marginTop: "12px" }}>ขั้น 2: จากที่เจือจางไว้</p>
            <p style={{ margin: "4px 0 0" }}>
              ค่าคำนวณก่อนปัด {plan.result.calculatedVolumeMl} mL; ตวงจริง {plan.result.actionableVolumeMl} mL แล้วผสมน้ำให้ครบ {finalVolumeMl} mL
            </p>
            <p className="pl-meta" style={{ marginTop: "10px" }}>
              ความละเอียด {plan.result.resolutionMl} mL · {plan.result.roundingDirection === "up" ? "ปัดขึ้น" : plan.result.roundingDirection === "down" ? "ปัดลง" : "ไม่ต้องปัด"} · เจือจาง 1:{plan.result.dilutionFactor} ได้ {plan.result.workingPpm} ppm
            </p>
            <p className="pl-meta" style={{ marginTop: "4px" }}>หลังปัดจะได้ประมาณ {plan.result.actionableTargetPpm} ppm</p>
          </div>
        ) : null}

        {!plan.ok ? (
          <p className="pl-soft-card" role="alert" style={{ background: "var(--pl-stop)" }}>{plan.message}</p>
        ) : null}
      </div>
    </section>
  );
}
