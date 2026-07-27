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
                <td>{ingredient.unit === "×" ? `${ingredient.amount}×` : `${formatNumber(ingredient.amount)} ${ingredient.unit}`}</td>
                <td>{ingredient.unit === "mg" ? "กรอกความเข้มข้น stock ด้านล่าง ระบบจะคำนวณปริมาตรให้" : ingredient.note || "ชั่งหรือตวงตามค่านี้"}</td>
              </tr>
            ))}
            <tr><th>pH</th><td>{plan.pH}</td><td>ปรับหลังสารละลายครบ ก่อนทำให้วุ้นแข็ง</td></tr>
          </tbody>
        </table>
      </div>
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
