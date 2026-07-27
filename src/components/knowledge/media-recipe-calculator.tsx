"use client";

import { useMemo, useState } from "react";

import type { MediaRecipe } from "../../lib/domain/philodendron-knowledge";

function amountFor(amountPerLiter: number, unit: string, volumeMl: number, msLabelRate: number) {
  if (unit === "×") return msLabelRate > 0
    ? `${Number((msLabelRate * amountPerLiter * volumeMl / 1000).toFixed(4))} g (อัตราฉลาก ${msLabelRate} g/L × ${amountPerLiter})`
    : `${amountPerLiter}× = เต็มสูตร; กรอกอัตรา g/L จากฉลากก่อน`;
  const amount = amountPerLiter * volumeMl / 1000;
  return `${Number(amount.toFixed(4))} ${unit.replace("/L", "")}`;
}

export function MediaRecipeCalculator({ recipes }: { recipes: MediaRecipe[] }) {
  const [recipeId, setRecipeId] = useState(recipes[0]?.id ?? "");
  const [cultureJars, setCultureJars] = useState(3);
  const [blankJars, setBlankJars] = useState(1);
  const [spareJars, setSpareJars] = useState(1);
  const [perJarMl, setPerJarMl] = useState(25);
  const [lossPercent, setLossPercent] = useState(10);
  const [msLabelRate, setMsLabelRate] = useState(0);
  const recipe = recipes.find((item) => item.id === recipeId) ?? recipes[0];
  const plan = useMemo(() => {
    const jars = Math.max(0, cultureJars) + Math.max(0, blankJars) + Math.max(0, spareJars);
    const base = jars * Math.max(0, perJarMl);
    return {
      jars,
      base,
      loss: base * Math.max(0, lossPercent) / 100,
      total: Math.ceil(base * (1 + Math.max(0, lossPercent) / 100)),
    };
  }, [blankJars, cultureJars, lossPercent, perJarMl, spareJars]);

  if (!recipe) return null;

  return (
    <section className="media-recipe-calculator" aria-labelledby="recipe-calculator-title">
      <div className="knowledge-detail-heading">
        <div>
          <p className="eyebrow">LOT RECIPE CALCULATOR</p>
          <h3 id="recipe-calculator-title">คำนวณสูตรจากจำนวนกระปุกจริง</h3>
          <p>กรอกจำนวนภาชนะ ระบบจะรวม Blank กระปุกสำรอง และเผื่อสูญเสียให้</p>
        </div>
      </div>
      <div className="form-grid">
        <label className="form-field"><span>ระยะอาหาร</span><select value={recipeId} onChange={(event) => setRecipeId(event.target.value)}>{recipes.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}</select></label>
        <label className="form-field"><span>กระปุกเพาะ</span><input min="1" type="number" value={cultureJars} onChange={(event) => setCultureJars(Number(event.target.value))} /></label>
        <label className="form-field"><span>Blank control</span><input min="0" type="number" value={blankJars} onChange={(event) => setBlankJars(Number(event.target.value))} /></label>
        <label className="form-field"><span>กระปุกสำรอง</span><input min="0" type="number" value={spareJars} onChange={(event) => setSpareJars(Number(event.target.value))} /></label>
        <label className="form-field"><span>อาหารต่อกระปุก (mL)</span><input min="1" type="number" value={perJarMl} onChange={(event) => setPerJarMl(Number(event.target.value))} /></label>
        <label className="form-field"><span>เผื่อสูญเสีย (%)</span><input min="0" type="number" value={lossPercent} onChange={(event) => setLossPercent(Number(event.target.value))} /></label>
        <label className="form-field"><span>อัตรา MS basal salts บนฉลาก (g/L)</span><input min="0" step="any" type="number" value={msLabelRate || ""} placeholder="อ่านจากฉลาก ห้ามเดา" onChange={(event) => setMsLabelRate(Number(event.target.value))} /></label>
      </div>
      <div className="medium-batch-result" role="status">
        <strong>เตรียมอาหาร {plan.total} mL สำหรับ {plan.jars} กระปุก</strong>
        <p>ใช้จริง {plan.base} mL + เผื่อสูญเสีย {Number(plan.loss.toFixed(1))} mL · pH เป้าหมาย {recipe.pH}</p>
      </div>
      <div className="media-recipe-table-wrap">
        <table className="media-recipe-table">
          <thead><tr><th>สาร/องค์ประกอบ</th><th>ปริมาณสำหรับ {plan.total} mL</th><th>วิธีใช้</th></tr></thead>
          <tbody>{recipe.ingredients.map((ingredient) => <tr key={ingredient.name}><th>{ingredient.name}</th><td data-label="ปริมาณ">{amountFor(ingredient.amountPerLiter, ingredient.unit, plan.total, msLabelRate)}</td><td data-label="วิธีใช้">{ingredient.unit === "×" ? "1× หมายถึงความเข้มข้นเต็มสูตร ไม่ใช่ 1 กรัม" : ingredient.note || "เติมตามลำดับในคู่มือ"}</td></tr>)}</tbody>
        </table>
      </div>
      <p className="form-alert"><strong>ฮอร์โมนหน่วย mg ต้องเตรียมเป็น stock solution:</strong> ตัวเลขในตารางคือมวลสารที่ต้องมีในอาหาร ไม่ใช่ปริมาตร stock ที่ตวง ให้ใช้คู่มือ working stock ด้านล่างและตรวจความเข้มข้นบนฉลาก stock ก่อนเติม</p>
    </section>
  );
}
