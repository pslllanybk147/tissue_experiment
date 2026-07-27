"use client";

import { useMemo, useState } from "react";
import { calculateWorkingStock, formatNumber, formatVolume } from "../../lib/domain/working-stock-calculator";

export function WorkingStockCalculator() {
  const [substance, setSubstance] = useState("BAP");
  const [requiredMassMg, setRequiredMassMg] = useState(0.0065);
  const [sourceConcentration, setSourceConcentration] = useState(1);
  const [minimumVolume, setMinimumVolume] = useState(0.1);
  const [workingVolume, setWorkingVolume] = useState(10);
  const result = useMemo(() => calculateWorkingStock({
    requiredMassMg,
    sourceConcentrationMgPerMl: sourceConcentration,
    minimumToolVolumeMl: minimumVolume,
    workingSolutionVolumeMl: workingVolume,
  }), [minimumVolume, requiredMassMg, sourceConcentration, workingVolume]);

  return (
    <section className="media-recipe-calculator working-stock-calculator" id="working-stock-calculator" aria-labelledby="working-stock-title">
      <div className="knowledge-detail-heading">
        <div><p className="eyebrow">WORKING STOCK CALCULATOR</p><h3 id="working-stock-title">คำนวณเมื่อปริมาตรน้อยเกินกว่าจะตวง</h3><p>กรอกค่าจากสูตร ฉลาก stock และเครื่องมือตวง ระบบจะเขียนวิธีตวงให้ทีละข้อ</p></div>
      </div>
      <div className="form-grid">
        <label className="form-field"><span>ชื่อสาร</span><input value={substance} onChange={(event) => setSubstance(event.target.value)} /></label>
        <label className="form-field"><span>มวลสารที่สูตรต้องการ (mg)</span><input min="0" step="any" type="number" value={requiredMassMg} onChange={(event) => setRequiredMassMg(Number(event.target.value))} /></label>
        <label className="form-field"><span>ความเข้มข้น stock เดิมบนฉลาก (mg/mL)</span><input min="0" step="any" type="number" value={sourceConcentration} onChange={(event) => setSourceConcentration(Number(event.target.value))} /></label>
        <label className="form-field"><span>เครื่องมือตวงได้ต่ำสุด (mL)</span><input min="0" step="any" type="number" value={minimumVolume} onChange={(event) => setMinimumVolume(Number(event.target.value))} /></label>
        <label className="form-field"><span>ปริมาตร working stock ที่จะเตรียม (mL)</span><input min="0" step="any" type="number" value={workingVolume} onChange={(event) => setWorkingVolume(Number(event.target.value))} /></label>
      </div>
      <div className={`haiter-plan haiter-plan-${result.state}`} role="status">
        {result.state === "blocked" ? <><strong>ยังคำนวณไม่ได้</strong><p>{result.reason}</p><p>{result.safeAction}</p></> : (
          <>
            <strong>{substance || "สารนี้"}: สูตรต้องการ {formatNumber(requiredMassMg)} mg</strong>
            <p>ถ้าตวงจาก stock เดิมโดยตรง ต้องตวง {formatVolume(result.directDoseMl)} mL {result.state === "direct" ? "ซึ่งเครื่องมือวัดได้" : `ซึ่งต่ำกว่า ${formatVolume(minimumVolume)} mL จึงไม่ควรเดาปริมาตร`}</p>
            {result.state === "working-dilution" && <p><strong>ระบบเลือกเจือจาง 1:{result.dilutionFactor}</strong> เพื่อให้ปริมาตรที่ต้องตวงทุกครั้งอยู่ในช่วงของเครื่องมือ</p>}
            <ol>{result.actions.map((action) => <li key={action}>{action}</li>)}</ol>
          </>
        )}
      </div>
      <div className="form-alert"><strong>สำคัญ:</strong> mg คือมวลสาร ส่วน mL คือปริมาตรของเหลว คนละหน่วยกัน ห้ามตวง 0.0065 mL แทน 0.0065 mg และห้ามสมมติว่าใช้น้ำเป็นตัวทำละลาย ให้ใช้เฉพาะตัวทำละลาย/วิธีละลายที่ฉลากหรือเอกสารของสารนั้นอนุญาต</div>
    </section>
  );
}
