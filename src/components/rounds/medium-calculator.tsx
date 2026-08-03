"use client";

import { useMemo, useState } from "react";
import type { MediaRecipe } from "@/lib/manual/types";
import { planMediumBatch, type IngredientLine } from "@/lib/rounds/medium-plan";

const inputStyle = {
  width: "100%",
  padding: "9px 11px",
  border: "2.5px solid var(--pl-line)",
  borderRadius: "10px",
  background: "var(--pl-card)",
  color: "var(--pl-ink)",
  fontSize: "16px",
} as const;

function Field({
  id,
  label,
  value,
  onChange,
  hint,
  step = "1",
}: {
  id: string;
  label: string;
  value: number;
  onChange: (next: number) => void;
  hint?: string;
  step?: string;
}) {
  return (
    <p style={{ margin: 0 }}>
      <label htmlFor={id} style={{ display: "block", fontWeight: 600, marginBottom: "5px", fontSize: "14px" }}>
        {label}
      </label>
      <input
        id={id}
        type="number"
        min="0"
        step={step}
        inputMode="decimal"
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        style={inputStyle}
      />
      {hint ? <span className="pl-meta" style={{ display: "block", marginTop: "4px" }}>{hint}</span> : null}
    </p>
  );
}

function round(value: number, digits: number): string {
  return Number(value.toFixed(digits)).toString();
}

function Line({ line }: { line: IngredientLine }) {
  if (line.kind === "needs-label-rate") {
    return (
      <div className="pl-card" style={{ background: "var(--pl-stop)" }}>
        <p style={{ margin: 0, fontWeight: 700 }}>{line.name}</p>
        <p className="pl-lede" style={{ marginTop: "6px" }}>{line.message}</p>
      </div>
    );
  }

  if (line.kind === "weigh" || line.kind === "measure") {
    return (
      <div className="pl-card" style={{ display: "flex", alignItems: "baseline", gap: "12px" }}>
        <span style={{ fontWeight: 700 }}>{line.name}</span>
        <span style={{ marginLeft: "auto", fontWeight: 800, fontSize: "18px", fontVariantNumeric: "tabular-nums" }}>
          {round(line.amount, line.unit === "g" ? 3 : 2)} {line.unit}
        </span>
      </div>
    );
  }

  return (
    <div className="pl-card" style={{ background: "var(--pl-stop)" }}>
      <p style={{ margin: 0, fontWeight: 700 }}>
        {line.name} · ชั่งไม่ได้
      </p>
      <p className="pl-lede" style={{ marginTop: "6px" }}>
        สูตรต้องการ {round(line.requiredMg, 4)} มิลลิกรัม ซึ่งต่ำกว่าที่เครื่องชั่งของคุณอ่านได้ ต้องทำน้ำยาแม่แล้วตวงแทน
      </p>
      {line.plan.state === "blocked" ? (
        <p className="pl-lede" style={{ marginTop: "8px" }}>{line.plan.reason} · {line.plan.safeAction}</p>
      ) : (
        <ol style={{ margin: "10px 0 0", paddingLeft: "20px", display: "flex", flexDirection: "column", gap: "6px" }}>
          <li>
            ถ้ายังไม่มีน้ำยาแม่ ให้ชั่งผง {line.name} {round(line.sourceStock.massMg, 0)} มิลลิกรัม
            ละลายน้ำเป็น {round(line.sourceStock.volumeMl, 0)} มิลลิลิตร จะได้ความเข้มข้น{" "}
            {line.sourceStock.concentrationMgPerMl} mg/mL
          </li>
          {line.plan.actions.map((action) => <li key={action}>{action}</li>)}
        </ol>
      )}
    </div>
  );
}

export function MediumCalculator({ recipes, initialRecipeId }: { recipes: MediaRecipe[]; initialRecipeId?: string }) {
  const [recipeId, setRecipeId] = useState(initialRecipeId ?? recipes[0]?.id ?? "");
  const [cultureJars, setCultureJars] = useState(4);
  const [blankJars, setBlankJars] = useState(1);
  const [spareJars, setSpareJars] = useState(1);
  const [mlPerJar, setMlPerJar] = useState(25);
  const [lossPercent, setLossPercent] = useState(15);
  const [scaleMinimumMg, setScaleMinimumMg] = useState(10);
  const [pipetteMinimumMl, setPipetteMinimumMl] = useState(0.2);
  const [msLabelRateGPerL, setMsLabelRateGPerL] = useState(4.43);

  const recipe = recipes.find((item) => item.id === recipeId) ?? recipes[0];

  const plan = useMemo(() => {
    if (!recipe) return null;
    try {
      return planMediumBatch(
        recipe,
        { cultureJars, blankJars, spareJars, mlPerJar, lossPercent },
        { scaleMinimumMg, pipetteMinimumMl, msLabelRateGPerL },
      );
    } catch {
      return null;
    }
  }, [blankJars, cultureJars, lossPercent, mlPerJar, msLabelRateGPerL, pipetteMinimumMl, recipe, scaleMinimumMg, spareJars]);

  if (!recipe) return null;

  return (
    <section style={{ marginTop: "26px" }}>
      <h2 className="pl-h2">จะทำอาหารเท่าไหร่ และชั่งอะไรกี่กรัม</h2>
      <p className="pl-lede" style={{ marginTop: "6px" }}>
        บอกจำนวนกระปุกที่อยากได้ ระบบคิดปริมาตรและปริมาณสารให้ พร้อมบอกตรง ๆ เมื่อสารบางตัวน้อยจนชั่งไม่ได้
      </p>

      <div className="pl-card" style={{ marginTop: "14px", background: "var(--pl-sunk)", display: "flex", flexDirection: "column", gap: "12px" }}>
        <p style={{ margin: 0 }}>
          <label htmlFor="recipe" style={{ display: "block", fontWeight: 600, marginBottom: "5px", fontSize: "14px" }}>
            สูตรที่จะทำ
          </label>
          <select id="recipe" value={recipe.id} onChange={(event) => setRecipeId(event.target.value)} style={inputStyle}>
            {recipes.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}
          </select>
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "12px" }}>
          <Field id="culture-jars" label="กระปุกเพาะที่อยากได้" value={cultureJars} onChange={setCultureJars} />
          <Field id="blank-jars" label="กระปุกเปล่าคุม" value={blankJars} onChange={setBlankJars} hint="ไว้ตรวจว่าอาหารปลอดเชื้อจริง" />
          <Field id="spare-jars" label="กระปุกสำรอง" value={spareJars} onChange={setSpareJars} />
          <Field id="ml-per-jar" label="อาหารต่อกระปุก (มล.)" value={mlPerJar} onChange={setMlPerJar} />
          <Field id="loss-percent" label="เผื่อสูญเสีย (%)" value={lossPercent} onChange={setLossPercent} hint="งานเล็กเผื่อมากกว่างานใหญ่" />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "12px" }}>
          <Field id="scale-min" label="เครื่องชั่งอ่านต่ำสุด (มก.)" value={scaleMinimumMg} onChange={setScaleMinimumMg} step="any" />
          <Field id="pipette-min" label="ตวงได้ละเอียดสุด (มล.)" value={pipetteMinimumMl} onChange={setPipetteMinimumMl} step="any" />
          <Field id="ms-label" label="อัตรา MS บนฉลาก (ก./ล.)" value={msLabelRateGPerL} onChange={setMsLabelRateGPerL} step="any" hint="ดูจากถุงที่คุณซื้อมา" />
        </div>
      </div>

      {plan ? (
        <>
          <div className="pl-card" style={{ marginTop: "14px", background: "var(--pl-yellow)", color: "var(--pl-chip-ink)" }}>
            <p className="pl-mono" style={{ color: "var(--pl-chip-ink)" }}>รวมต้องทำอาหาร</p>
            <p style={{ margin: "4px 0 0", fontSize: "30px", fontWeight: 800, fontVariantNumeric: "tabular-nums" }}>
              {plan.totalVolumeMl} มิลลิลิตร
            </p>
            <p style={{ margin: "6px 0 0", fontSize: "14px" }}>
              {plan.totalJars} กระปุก × {mlPerJar} มล. = {plan.baseVolumeMl} แล้วเผื่อสูญเสีย {lossPercent}%
            </p>
          </div>

          {plan.warnings.length > 0 ? (
            <ul style={{ margin: "12px 0 0", paddingLeft: "20px", display: "flex", flexDirection: "column", gap: "6px" }}>
              {plan.warnings.map((warning) => <li key={warning}>{warning}</li>)}
            </ul>
          ) : null}

          <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "14px" }}>
            {plan.lines.map((line) => <Line key={line.name} line={line} />)}
          </div>

          <p className="pl-meta" style={{ marginTop: "12px" }}>ปรับ pH ให้อยู่ในช่วง {recipe.pH} ก่อนใส่วุ้น</p>
        </>
      ) : (
        <p className="pl-card" role="alert" style={{ marginTop: "14px", background: "var(--pl-stop)" }}>
          ตัวเลขที่กรอกยังคำนวณไม่ได้ ต้องมีกระปุกเพาะและปริมาตรต่อกระปุกอย่างน้อยหนึ่ง
        </p>
      )}
    </section>
  );
}
