"use client";

import { useMemo, useState } from "react";
import {
  calculateWorkingStock,
  formatNumber,
  formatVolume,
  type WorkingStockInput,
} from "@/lib/domain/working-stock-calculator";
import { CalculatorField } from "./calculator-field";

const defaultInput: WorkingStockInput = {
  requiredMassMg: 5,
  sourceConcentrationMgPerMl: 1,
  minimumToolVolumeMl: 0.2,
  workingSolutionVolumeMl: 50,
};

export function WorkingStockCalculator({
  initialInput,
}: {
  /** ตั้งค่าเริ่มต้นจากอุปกรณ์ของผู้ใช้ (pipetteMinimumMl) และใช้ในเทสต์เพื่อ render สถานะใดสถานะหนึ่งตรง ๆ */
  initialInput?: Partial<WorkingStockInput>;
}) {
  const merged = { ...defaultInput, ...initialInput };
  const [requiredMassMg, setRequiredMassMg] = useState(merged.requiredMassMg);
  const [sourceConcentrationMgPerMl, setSourceConcentrationMgPerMl] = useState(merged.sourceConcentrationMgPerMl);
  const [minimumToolVolumeMl, setMinimumToolVolumeMl] = useState(merged.minimumToolVolumeMl);
  const [workingSolutionVolumeMl, setWorkingSolutionVolumeMl] = useState(merged.workingSolutionVolumeMl);

  const result = useMemo(
    () =>
      calculateWorkingStock({
        requiredMassMg,
        sourceConcentrationMgPerMl,
        minimumToolVolumeMl,
        workingSolutionVolumeMl,
      }),
    [requiredMassMg, sourceConcentrationMgPerMl, minimumToolVolumeMl, workingSolutionVolumeMl],
  );

  return (
    <section className="cl-calculator cl-working-stock-calculator cl-atlas-form-section">
      <h2 className="pl-h2">น้ำยาแม่ (working stock)</h2>
      <p className="pl-lede" style={{ marginTop: "6px" }}>
        ใช้เมื่อปริมาณสารที่ต้องใช้น้อยเกินกว่าจะตวงจาก stock เดิมได้ตรง ๆ
      </p>

      <div className="cl-calculator-body">
        <div className="cl-atlas-field-grid">
          <CalculatorField id="ws-mass" label="มวลที่ต้องการ" unit="mg" value={requiredMassMg} onChange={setRequiredMassMg} />
          <CalculatorField
            id="ws-source"
            label="ความเข้มข้น stock เดิม"
            unit="mg/mL"
            value={sourceConcentrationMgPerMl}
            onChange={setSourceConcentrationMgPerMl}
          />
          <CalculatorField
            id="ws-tool-min"
            label="ตวงได้ละเอียดสุด"
            unit="mL"
            value={minimumToolVolumeMl}
            onChange={setMinimumToolVolumeMl}
            hint="ดึงจากอุปกรณ์ของคุณถ้าตั้งค่าไว้"
          />
          <CalculatorField
            id="ws-volume"
            label="ปริมาตร working solution ที่จะเตรียม"
            unit="mL"
            value={workingSolutionVolumeMl}
            onChange={setWorkingSolutionVolumeMl}
          />
        </div>
      </div>

      {result.state === "blocked" ? (
        <div className="cl-calculator-error" role="alert">
          <p className="cl-result-title">{result.reason}</p>
          <p>{result.safeAction}</p>
        </div>
      ) : null}

      {result.state === "direct" ? (
        <div className="cl-calculator-result cl-atlas-result" aria-live="polite" aria-label="ผลการคำนวณน้ำยาแม่">
          <p className="cl-result-disclaimer">ค่าจากสูตร ยังไม่ใช่ค่าตรวจ</p>
          <p className="pl-mono">ตวงตรงจาก stock เดิม</p>
          <p style={{ margin: "4px 0 0", fontSize: "26px", fontWeight: 800, fontVariantNumeric: "tabular-nums" }}>
            {formatVolume(result.directDoseMl)} mL
          </p>
          <ol style={{ margin: "10px 0 0", paddingLeft: "20px", display: "flex", flexDirection: "column", gap: "6px" }}>
            {result.actions.map((action) => <li key={action}>{action}</li>)}
          </ol>
        </div>
      ) : null}

      {result.state === "working-dilution" ? (
        <div className="cl-calculator-result cl-atlas-result" aria-live="polite" aria-label="ผลการคำนวณน้ำยาแม่">
          <p className="cl-result-disclaimer">ค่าจากสูตร ยังไม่ใช่ค่าตรวจ</p>
          <p className="pl-mono">ต้องทำ working stock อัตราส่วน 1:{result.dilutionFactor}</p>
          <p style={{ margin: "4px 0 0", fontSize: "18px", fontWeight: 700 }}>
            ความเข้มข้น {formatNumber(result.workingConcentrationMgPerMl)} mg/mL
          </p>
          <ol style={{ margin: "10px 0 0", paddingLeft: "20px", display: "flex", flexDirection: "column", gap: "6px" }}>
            {result.actions.map((action) => <li key={action}>{action}</li>)}
          </ol>
        </div>
      ) : null}
    </section>
  );
}
