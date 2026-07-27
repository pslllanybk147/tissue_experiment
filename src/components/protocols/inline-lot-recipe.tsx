"use client";

import { useState } from "react";

import { calculateWorkingStock, formatNumber } from "../../lib/domain/working-stock-calculator";

export type LotRecipeIngredient = {
  name: string;
  amount: number;
  unit: string;
  note?: string;
};

export type LotRecipePlan = {
  title: string;
  evidenceState: string;
  volumeMl: number;
  pH: string;
  ingredients: LotRecipeIngredient[];
  jarSummary?: string;
  minimumToolVolumeMl?: number;
};

export function InlineLotRecipe({ plan }: { plan: LotRecipePlan }) {
  const msIngredient = plan.ingredients.find((ingredient) => ingredient.unit === "×");
  return (
    <aside className="guided-inline-recipe" aria-label="สูตรอาหารและเครื่องคำนวณของ Lot นี้">
      <header>
        <div>
          <span className="eyebrow">สูตรที่ใช้จริงใน LOT นี้</span>
          <h4>{plan.title}</h4>
          <p><strong>เตรียมทั้งหมด {formatNumber(plan.volumeMl)} mL</strong>{plan.jarSummary ? ` · ${plan.jarSummary}` : ""}</p>
        </div>
        <span className="evidence-label">{plan.evidenceState}</span>
      </header>
      <div className="inline-recipe-table-wrap">
        <table className="inline-recipe-table">
          <thead><tr><th>สาร</th><th>ค่าที่ต้องใช้</th><th>ทำอย่างไร</th></tr></thead>
          <tbody>
            {plan.ingredients.map((ingredient) => (
              <tr key={ingredient.name}>
                <th>{ingredient.name}</th>
                <td>{ingredient.unit === "×" ? `${ingredient.amount}× (เต็มสูตร)` : `${formatNumber(ingredient.amount)} ${ingredient.unit}`}</td>
                <td>{ingredient.unit === "×" ? "ไม่ใช่ 1 กรัม — กรอกอัตรา g/L จากฉลากด้านล่าง" : ingredient.unit === "mg" ? "กรอกความเข้มข้น stock ด้านล่าง ระบบจะคำนวณปริมาตรให้" : ingredient.note || "ชั่งหรือตวงตามค่านี้"}</td>
              </tr>
            ))}
            <tr><th>pH</th><td>{plan.pH}</td><td>ปรับหลังสารละลายครบ ก่อนทำให้วุ้นแข็ง</td></tr>
          </tbody>
        </table>
      </div>
      {msIngredient ? <InlineMsDose concentrationMultiplier={msIngredient.amount} volumeMl={plan.volumeMl} /> : null}
      <div className="inline-stock-grid">
        {plan.ingredients.filter((ingredient) => ingredient.unit === "mg").map((ingredient) => (
          <InlineStockDose
            ingredient={ingredient}
            key={ingredient.name}
            minimumToolVolumeMl={plan.minimumToolVolumeMl ?? 0.1}
          />
        ))}
      </div>
      <p className="form-alert"><strong>ค่าที่ระบบดึงให้อัตโนมัติ:</strong> สูตรและปริมาตรรวมมาจาก batch ที่บันทึกตอนสร้าง Lot โดยตรง ไม่คำนวณจำนวนกระปุกใหม่ในหน้านี้</p>
    </aside>
  );
}

function InlineMsDose({
  concentrationMultiplier,
  volumeMl,
}: {
  concentrationMultiplier: number;
  volumeMl: number;
}) {
  const [labelRate, setLabelRate] = useState("");
  const grams = Number(labelRate) > 0
    ? Number((Number(labelRate) * concentrationMultiplier * volumeMl / 1000).toFixed(6))
    : null;
  return (
    <section className="inline-ms-calculator">
      <h5>แปลง MS {concentrationMultiplier}× เป็นกรัม</h5>
      <p><strong>{concentrationMultiplier}× หมายถึงความเข้มข้นเต็มสูตรตามฉลาก ไม่ใช่ {concentrationMultiplier} กรัม</strong></p>
      <label className="form-field">
        <span>ฉลากระบุให้ใช้ MS basal salts กี่กรัมต่อน้ำ 1 ลิตร (g/L)</span>
        <input inputMode="decimal" min="0" onChange={(event) => setLabelRate(event.target.value)} placeholder="เช่น อ่านค่าจากฉลากผลิตภัณฑ์" step="any" type="number" value={labelRate} />
      </label>
      {grams === null ? (
        <p className="calculation-placeholder">ยังคำนวณกรัมไม่ได้: อ่านอัตรา g/L จากฉลากก่อน ห้ามใช้ตัวอย่างของผลิตภัณฑ์อื่นแทน</p>
      ) : (
        <div className="calculation-result" role="status">
          <strong>ชั่ง MS basal salts {formatNumber(grams)} g สำหรับอาหาร {formatNumber(volumeMl)} mL</strong>
          <p>คำนวณจากอัตราฉลาก {labelRate} g/L × {concentrationMultiplier}× × {volumeMl}/1000</p>
        </div>
      )}
    </section>
  );
}

function InlineStockDose({
  ingredient,
  minimumToolVolumeMl,
}: {
  ingredient: LotRecipeIngredient;
  minimumToolVolumeMl: number;
}) {
  const [sourceConcentration, setSourceConcentration] = useState("");
  const [workingVolume, setWorkingVolume] = useState("10");
  const result = sourceConcentration
    ? calculateWorkingStock({
        requiredMassMg: ingredient.amount,
        sourceConcentrationMgPerMl: Number(sourceConcentration),
        minimumToolVolumeMl,
        workingSolutionVolumeMl: Number(workingVolume),
      })
    : null;

  return (
    <section className="inline-stock-card">
      <h5>คำนวณ {ingredient.name} จากขวด stock</h5>
      <p>ต้องมี {formatNumber(ingredient.amount)} mg ในอาหาร Lot นี้</p>
      <label className="form-field">
        <span>ความเข้มข้นที่เขียนบนขวด {ingredient.name} stock (mg/mL)</span>
        <input inputMode="decimal" min="0" onChange={(event) => setSourceConcentration(event.target.value)} placeholder="อ่านจากฉลาก ห้ามเดา" type="number" value={sourceConcentration} />
      </label>
      <label className="form-field">
        <span>ถ้าต้องเจือจาง จะเตรียม working stock กี่ mL</span>
        <input inputMode="decimal" min="0" onChange={(event) => setWorkingVolume(event.target.value)} type="number" value={workingVolume} />
      </label>
      {!result ? <p className="calculation-placeholder">กรอกความเข้มข้นบนฉลาก แล้วระบบจะแสดงคำสั่งตวงทีละข้อ</p> : result.state === "blocked" ? (
        <div className="calculation-result" role="alert"><strong>ยังคำนวณไม่ได้</strong><p>{result.reason}</p><p>{result.safeAction}</p></div>
      ) : (
        <div className="calculation-result" role="status">
          <strong>{result.state === "direct" ? "ตวงจาก stock เดิมได้โดยตรง" : `ต้องทำ working stock เจือจาง ${result.dilutionFactor} เท่า`}</strong>
          <ol>{result.actions.map((action) => <li key={action}>{action}</li>)}</ol>
        </div>
      )}
    </section>
  );
}
