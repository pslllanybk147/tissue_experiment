"use client";

import { useEffect, useMemo, useState } from "react";
import { EvidenceBadge } from "@/components/guide/evidence-badge";
import type { MediaRecipe } from "@/lib/manual/types";
import { planMediumBatch, type IngredientLine } from "@/lib/rounds/medium-plan";
import { antiBrowningOptions, batchRange } from "@/lib/rounds/anti-browning";
import type { MediumExecutionContext } from "@/lib/rounds/medium-execution";

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
  const scale = 10 ** digits;
  return (Math.round((value + Number.EPSILON) * scale) / scale).toString();
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
        {line.name} · ใช้น้ำยาแม่
      </p>
      <p className="pl-lede" style={{ marginTop: "6px" }}>
        สูตรต้องการสาร {round(line.requiredMg, 4)} มิลลิกรัม
        {line.stockConcentrationMgPerMl > 0
          ? ` · stock ที่บันทึกไว้เข้มข้น ${round(line.stockConcentrationMgPerMl, 4)} mg/mL`
          : " · ยังไม่มี stock ที่ระบุความเข้มข้นได้"}
      </p>
      {line.plan.state === "blocked" ? (
        <p className="pl-lede" style={{ marginTop: "8px" }}>{line.plan.reason} · {line.plan.safeAction}</p>
      ) : (
        <ol style={{ margin: "10px 0 0", paddingLeft: "20px", display: "flex", flexDirection: "column", gap: "6px" }}>
          {line.plan.actions.map((action) => <li key={action}>{action}</li>)}
        </ol>
      )}
    </div>
  );
}

export function MediumCalculator({
  recipes,
  initialRecipeId,
  tools,
  onPlanChange,
}: {
  recipes: MediaRecipe[];
  initialRecipeId?: string;
  /** ค่าจากชุดอุปกรณ์ที่ผู้ใช้บันทึกไว้ ถ้าไม่ส่งมาจะใช้ค่ากลางแล้วให้แก้เอง */
  tools?: {
    scaleMinimumMg: number;
    pipetteMinimumMl: number;
    msLabelRateGPerL: number;
    bcdLabelRateGPerL?: number;
    naaStockMgPerMl?: number;
    baStockMgPerMl?: number;
    ibaStockMgPerMl?: number;
  };
  onPlanChange?: (context: MediumExecutionContext | null) => void;
}) {
  const initialRecipe = initialRecipeId
    ? recipes.find((item) => item.id === initialRecipeId)
    : recipes[0];
  const [recipeId, setRecipeId] = useState(initialRecipe?.id ?? "");
  const [cultureJars, setCultureJars] = useState(4);
  const [blankJars, setBlankJars] = useState(1);
  const [spareJars, setSpareJars] = useState(1);
  const [mlPerJar, setMlPerJar] = useState(25);
  const [lossPercent, setLossPercent] = useState(15);
  const [scaleMinimumMg, setScaleMinimumMg] = useState(tools?.scaleMinimumMg ?? 10);
  const [pipetteMinimumMl, setPipetteMinimumMl] = useState(tools?.pipetteMinimumMl ?? 0.2);
  const [msLabelRateGPerL, setMsLabelRateGPerL] = useState(tools?.msLabelRateGPerL ?? 4.43);
  const [bcdLabelRateGPerL, setBcdLabelRateGPerL] = useState(tools?.bcdLabelRateGPerL ?? 0);
  const [naaStockMgPerMl, setNaaStockMgPerMl] = useState(tools?.naaStockMgPerMl ?? 0);
  const [baStockMgPerMl, setBaStockMgPerMl] = useState(tools?.baStockMgPerMl ?? 0);
  const [ibaStockMgPerMl, setIbaStockMgPerMl] = useState(tools?.ibaStockMgPerMl ?? 0);

  const recipe = recipeId ? recipes.find((item) => item.id === recipeId) : undefined;

  const plan = useMemo(() => {
    if (!recipe) return null;
    try {
      return planMediumBatch(
        recipe,
        { cultureJars, blankJars, spareJars, mlPerJar, lossPercent },
        { scaleMinimumMg, pipetteMinimumMl, msLabelRateGPerL, bcdLabelRateGPerL, naaStockMgPerMl, baStockMgPerMl, ibaStockMgPerMl },
      );
    } catch {
      return null;
    }
  }, [baStockMgPerMl, bcdLabelRateGPerL, blankJars, cultureJars, ibaStockMgPerMl, lossPercent, mlPerJar, msLabelRateGPerL, naaStockMgPerMl, pipetteMinimumMl, recipe, scaleMinimumMg, spareJars]);

  useEffect(() => {
    onPlanChange?.(plan && recipe ? { recipe, plan, mlPerJar } : null);
  }, [mlPerJar, onPlanChange, plan, recipe]);

  if (!recipe) {
    return (
      <section style={{ marginTop: "26px" }}>
        <h2 className="pl-h2">ยังไม่มีสูตรอาหารของขั้นนี้ในระบบ</h2>
        <p className="pl-card" role="alert" style={{ marginTop: "14px", background: "var(--pl-stop)" }}>
          คู่มือยังไม่มีตัวเลขที่ตรวจสอบได้สำหรับขั้นนี้ ระบบจึงไม่แสดงสูตรของขั้นอื่นแทน และไม่ควรเดาค่าเอง
        </p>
      </section>
    );
  }

  return (
    <section style={{ marginTop: "26px" }}>
      <h2 className="pl-h2">จะทำอาหารเท่าไหร่ และชั่งอะไรกี่กรัม</h2>
      <p className="pl-lede" style={{ marginTop: "6px" }}>
        บอกจำนวนกระปุกที่อยากได้ ระบบคิดปริมาตรและปริมาณสารให้ พร้อมบอกตรง ๆ เมื่อสารบางตัวน้อยจนชั่งไม่ได้
      </p>
      <p style={{ marginTop: "10px" }}><EvidenceBadge level={recipe.evidence.level} /></p>

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
          <Field id="bcd-label" label="อัตรา BCD บนฉลาก (ก./ล.)" value={bcdLabelRateGPerL} onChange={setBcdLabelRateGPerL} step="any" hint="ถ้าไม่มี ให้ใช้สูตรที่แจกแจงสาร BCD ทีละตัว" />
          <Field id="naa-stock" label="NAA stock (มก./มล.)" value={naaStockMgPerMl} onChange={setNaaStockMgPerMl} step="any" />
          <Field id="ba-stock" label="BA/BAP stock (มก./มล.)" value={baStockMgPerMl} onChange={setBaStockMgPerMl} step="any" />
          <Field id="iba-stock" label="IBA stock (มก./มล.)" value={ibaStockMgPerMl} onChange={setIbaStockMgPerMl} step="any" />
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
          <div className="pl-card" style={{ marginTop: "10px", background: "var(--pl-sunk)" }}>
            <p style={{ margin: 0, fontWeight: 700 }}>ถ้าเจอชิ้นพืชดำ: ทางเลือกทดลอง ไม่ใช่ส่วนบังคับของสูตร</p>
            <p className="pl-meta" style={{ marginTop: "6px" }}>
              ค่านี้เป็นช่วงจากงานคนละชนิดพืช ระบบจึงไม่แอบเติมลงอาหารให้ และควรเริ่มค่าต่ำสุดก่อน
            </p>
            <ul style={{ margin: "10px 0 0", paddingLeft: "20px", display: "flex", flexDirection: "column", gap: "7px" }}>
              {antiBrowningOptions.map((option) => {
                const [low, high] = batchRange(option, plan.totalVolumeMl);
                return (
                  <li key={option.id}>
                    <strong>{option.name}:</strong> {round(low, option.unit === "g/L" ? 3 : 2)}–{round(high, option.unit === "g/L" ? 3 : 2)} {option.unit.replace("/L", "")} สำหรับ batch นี้ · {option.use}. {option.note}
                  </li>
                );
              })}
            </ul>
          </div>
        </>
      ) : (
        <p className="pl-card" role="alert" style={{ marginTop: "14px", background: "var(--pl-stop)" }}>
          ตัวเลขที่กรอกยังคำนวณไม่ได้ ต้องมีกระปุกเพาะและปริมาตรต่อกระปุกอย่างน้อยหนึ่ง
        </p>
      )}
    </section>
  );
}
