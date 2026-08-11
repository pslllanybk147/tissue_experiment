"use client";

import { useEffect, useMemo, useState } from "react";
import { CalculatorField } from "@/components/calculators/calculator-field";
import { EvidenceBadge } from "@/components/guide/evidence-badge";
import type { MediaRecipe } from "@/lib/manual/types";
import { planMediumBatch, type IngredientLine } from "@/lib/rounds/medium-plan";
import { antiBrowningOptions, batchRange } from "@/lib/rounds/anti-browning";
import type { MediumExecutionContext } from "@/lib/rounds/medium-execution";

function round(value: number, digits: number): string {
  const scale = 10 ** digits;
  return (Math.round((value + Number.EPSILON) * scale) / scale).toString();
}

function Line({ line }: { line: IngredientLine }) {
  if (line.kind === "needs-label-rate") {
    return (
      <div className="cl-medium-line" data-state="blocked">
        <p style={{ margin: 0, fontWeight: 700 }}>{line.name}</p>
        <p className="pl-lede" style={{ marginTop: "6px" }}>{line.message}</p>
      </div>
    );
  }

  if (line.kind === "weigh" || line.kind === "measure") {
    return (
      <div className="cl-medium-line">
        <span style={{ fontWeight: 700 }}>{line.name}{line.note ? <small style={{ display: "block", fontWeight: 400, marginTop: "4px" }}>{line.note}</small> : null}</span>
        <span style={{ marginLeft: "auto", fontWeight: 800, fontSize: "18px", fontVariantNumeric: "tabular-nums" }}>
          {round(line.amount, line.unit === "g" ? 3 : 2)} {line.unit}
        </span>
      </div>
    );
  }

  return (
    <div className="cl-medium-line" data-state="blocked">
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
  availableRecipeIds,
  initialRecipeId,
  tools,
  onPlanChange,
}: {
  recipes: MediaRecipe[];
  /** สูตรที่ประกาศว่าใช้ในขั้นนี้จริง; ถ้าเป็น [] ให้หยุดแทนการหยิบสูตรแรกมาเดา */
  availableRecipeIds?: string[];
  initialRecipeId?: string;
  /** ค่าจากชุดอุปกรณ์ที่ผู้ใช้บันทึกไว้ ถ้าไม่ส่งมาจะใช้ค่ากลางแล้วให้แก้เอง */
  tools?: {
    scaleMinimumMg: number;
    pipetteMinimumMl: number;
    msLabelRateGPerL: number;
    bcdLabelRateGPerL?: number;
    naaStockMgPerMl?: number;
    baStockMgPerMl?: number;
    bapStockMgPerMl?: number;
    ibaStockMgPerMl?: number;
  };
  onPlanChange?: (context: MediumExecutionContext | null) => void;
}) {
  const visibleRecipes = availableRecipeIds
    ? recipes.filter((item) => availableRecipeIds.includes(item.id))
    : recipes;
  const initialRecipe = initialRecipeId
    ? visibleRecipes.find((item) => item.id === initialRecipeId)
    : visibleRecipes[0];
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
  const [bapStockMgPerMl, setBapStockMgPerMl] = useState(tools?.bapStockMgPerMl ?? 0);
  const [ibaStockMgPerMl, setIbaStockMgPerMl] = useState(tools?.ibaStockMgPerMl ?? 0);

  const effectiveRecipeId = recipeId && visibleRecipes.some((item) => item.id === recipeId)
    ? recipeId
    : initialRecipe?.id ?? "";
  const recipe = effectiveRecipeId ? visibleRecipes.find((item) => item.id === effectiveRecipeId) : undefined;

  const plan = useMemo(() => {
    if (!recipe) return null;
    try {
      return planMediumBatch(
        recipe,
        { cultureJars, blankJars, spareJars, mlPerJar, lossPercent },
        { scaleMinimumMg, pipetteMinimumMl, msLabelRateGPerL, bcdLabelRateGPerL, naaStockMgPerMl, baStockMgPerMl, bapStockMgPerMl, ibaStockMgPerMl },
      );
    } catch {
      return null;
    }
  }, [baStockMgPerMl, bapStockMgPerMl, bcdLabelRateGPerL, blankJars, cultureJars, ibaStockMgPerMl, lossPercent, mlPerJar, msLabelRateGPerL, naaStockMgPerMl, pipetteMinimumMl, recipe, scaleMinimumMg, spareJars]);

  useEffect(() => {
    onPlanChange?.(plan && recipe ? { recipe, plan, mlPerJar } : null);
  }, [mlPerJar, onPlanChange, plan, recipe]);

  if (!recipe) {
    return (
      <section className="cl-medium-calculator cl-atlas-form-section">
        <h2 className="pl-h2">ยังไม่มีสูตรอาหารของขั้นนี้ในระบบ</h2>
        <p className="cl-calculator-error" role="alert">
          คู่มือยังไม่มีตัวเลขที่ตรวจสอบได้สำหรับขั้นนี้ ระบบจึงไม่แสดงสูตรของขั้นอื่นแทน และไม่ควรเดาค่าเอง
        </p>
      </section>
    );
  }

  return (
    <section className="cl-medium-calculator cl-atlas-form-section">
      <h2 className="pl-h2">จะทำอาหารเท่าไหร่ และชั่งอะไรกี่กรัม</h2>
      <p className="pl-lede" style={{ marginTop: "6px" }}>
        บอกจำนวนกระปุกที่อยากได้ ระบบคิดปริมาตรและปริมาณสารให้ พร้อมบอกตรง ๆ เมื่อสารบางตัวน้อยจนชั่งไม่ได้
      </p>
      <p style={{ marginTop: "10px" }}><EvidenceBadge level={recipe.evidence.level} /></p>
      {recipe.evidence.note ? <p className="pl-meta" style={{ marginTop: "6px" }}>{recipe.evidence.note}</p> : null}

      <div className="cl-medium-controls">
        <div className="cl-field-group">
          <label className="cl-field-label" htmlFor="recipe">
            สูตรที่จะทำ
          </label>
          <select className="cl-input" id="recipe" value={recipe.id} onChange={(event) => setRecipeId(event.target.value)}>
            {visibleRecipes.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}
          </select>
        </div>

        <div className="cl-atlas-field-grid">
          <CalculatorField id="culture-jars" label="กระปุกเพาะที่อยากได้" value={cultureJars} onChange={setCultureJars} step="1" />
          <CalculatorField id="blank-jars" label="กระปุกเปล่าคุม" value={blankJars} onChange={setBlankJars} hint="ไว้ตรวจว่าอาหารปลอดเชื้อจริง" step="1" allowZero />
          <CalculatorField id="spare-jars" label="กระปุกสำรอง" value={spareJars} onChange={setSpareJars} step="1" allowZero />
          <CalculatorField id="ml-per-jar" label="อาหารต่อกระปุก" unit="มล." value={mlPerJar} onChange={setMlPerJar} step="1" />
          <CalculatorField id="loss-percent" label="เผื่อสูญเสีย" unit="%" value={lossPercent} onChange={setLossPercent} hint="งานเล็กเผื่อมากกว่างานใหญ่" step="1" allowZero />
        </div>

        <div className="cl-atlas-field-grid">
          <CalculatorField id="scale-min" label="เครื่องชั่งอ่านต่ำสุด" unit="มก." value={scaleMinimumMg} onChange={setScaleMinimumMg} />
          <CalculatorField id="pipette-min" label="ตวงได้ละเอียดสุด" unit="มล." value={pipetteMinimumMl} onChange={setPipetteMinimumMl} />
          <CalculatorField id="ms-label" label="อัตรา MS บนฉลาก" unit="ก./ล." value={msLabelRateGPerL} onChange={setMsLabelRateGPerL} hint="ดูจากถุงที่คุณซื้อมา" />
          <CalculatorField id="bcd-label" label="อัตรา BCD บนฉลาก" unit="ก./ล." value={bcdLabelRateGPerL} onChange={setBcdLabelRateGPerL} hint="ถ้าไม่มี ให้ใช้สูตรที่แจกแจงสาร BCD ทีละตัว" allowZero />
          <CalculatorField id="naa-stock" label="NAA stock" unit="มก./มล." value={naaStockMgPerMl} onChange={setNaaStockMgPerMl} allowZero />
          <CalculatorField id="ba-stock" label="BA stock" unit="มก./มล." value={baStockMgPerMl} onChange={setBaStockMgPerMl} allowZero />
          <CalculatorField id="bap-stock" label="BAP stock" unit="มก./มล." value={bapStockMgPerMl} onChange={setBapStockMgPerMl} allowZero />
          <CalculatorField id="iba-stock" label="IBA stock" unit="มก./มล." value={ibaStockMgPerMl} onChange={setIbaStockMgPerMl} allowZero />
        </div>
        <p className="pl-meta" style={{ margin: 0 }}>ตรวจชื่อบนฉลากให้ตรงกับชื่อในสูตร ระบบจะไม่ใช้ BA และ BAP แทนกันอัตโนมัติ</p>
        {visibleRecipes.length > 1 ? <p className="pl-meta" style={{ margin: 0 }}>ขั้นนี้มีมากกว่าหนึ่งสูตรย่อย ให้เลือกและทำทีละสูตรตามช่วงที่ระบุในคู่มือ</p> : null}
      </div>

      {plan ? (
        <>
          <div className="cl-medium-total cl-atlas-result" aria-live="polite" aria-label="ผลการคำนวณปริมาตรอาหาร">
            <p className="cl-result-disclaimer">ค่าจากสูตร ยังไม่ใช่ค่าตรวจ</p>
            <p className="pl-mono" style={{ color: "var(--pl-chip-ink)" }}>รวมต้องทำอาหาร</p>
            <p style={{ margin: "4px 0 0", fontSize: "30px", fontWeight: 800, fontVariantNumeric: "tabular-nums" }}>
              {plan.totalVolumeMl} มิลลิลิตร
            </p>
            <p style={{ margin: "6px 0 0", fontSize: "14px" }}>
              {plan.totalJars} กระปุก × {mlPerJar} มล. = {plan.baseVolumeMl} แล้วเผื่อสูญเสีย {lossPercent}%
            </p>
            <p style={{ margin: "6px 0 0", fontSize: "14px" }}>
              น้ำตั้งต้น {plan.initialWaterMl} มล. ({plan.initialWaterPercent}%) แล้วเติมน้ำให้ครบ {plan.finalVolumeMl} มล. หลังรวมส่วนผสม
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
          <div className="cl-medium-note">
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
        <p className="cl-calculator-error" role="alert">
          ตัวเลขที่กรอกยังคำนวณไม่ได้ ต้องมีกระปุกเพาะและปริมาตรต่อกระปุกอย่างน้อยหนึ่ง
        </p>
      )}
    </section>
  );
}
