"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { useCalculatorOverlay } from "@/components/nav/calculator-overlay-context";
import { defaultKit, type EquipmentKit } from "@/lib/equipment/resolve-path";
import { plantPacks } from "@/lib/manual/registry";
import { getEquipmentRepository } from "@/lib/repositories/equipment-repository-factory";
import { MediumCalculator } from "@/components/rounds/medium-calculator";
import { HaiterCalculator } from "./haiter-calculator";
import { WorkingStockCalculator } from "./working-stock-calculator";

const pickerItems = [
  { screen: "medium" as const, title: "สูตรอาหาร", description: "คำนวณปริมาณสารต่อชุดอาหารที่จะทำ" },
  { screen: "working-stock" as const, title: "น้ำยาแม่ (working stock)", description: "เมื่อสารต้องใช้น้อยจนตวงตรง ๆ ไม่ได้" },
  { screen: "haiter" as const, title: "ไฮเตอร์ฆ่าเชื้อ", description: "เจือจางสารฟอกให้ได้ % ที่ต้องการ" },
];

export function CalculatorOverlay() {
  const { state, select, back, close } = useCalculatorOverlay();
  const { session } = useAuth();
  const ownerId = session.user?.uid ?? "demo-owner";
  const authenticated = session.status === "authenticated";
  const repository = useMemo(() => getEquipmentRepository(ownerId, authenticated), [ownerId, authenticated]);
  const [kit, setKit] = useState<EquipmentKit>(defaultKit);
  const [selectedPlantSlug, setSelectedPlantSlug] = useState(plantPacks[0]?.slug ?? "");

  useEffect(() => {
    if (!state.isOpen) return;
    if (!["demo", "authenticated"].includes(session.status)) return;
    let active = true;
    repository
      .get(ownerId)
      .then((found) => {
        if (active && found) setKit({ ...defaultKit, ...found });
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [ownerId, repository, session.status, state.isOpen]);

  useEffect(() => {
    if (!state.isOpen) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") close();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [state.isOpen, close]);

  if (!state.isOpen) return null;

  const toolsKey = `${kit.scaleMinimumMg}-${kit.pipetteMinimumMl}-${kit.msLabelRateGPerL}`;
  const selectedPlant = plantPacks.find((pack) => pack.slug === selectedPlantSlug) ?? plantPacks[0];

  return (
    <div className="pl-overlay-root">
      <button type="button" className="pl-overlay-backdrop" aria-label="ปิดเครื่องคำนวณ" onClick={close} />
      <div className="pl-overlay-panel" role="dialog" aria-modal="true" aria-label="เครื่องคำนวณ">
        <button type="button" className="pl-overlay-handle" aria-label="ปิดเครื่องคำนวณ" onClick={close} />
        <div className="pl-overlay-header">
          {state.screen !== "picker" ? (
            <button type="button" className="pl-overlay-back" aria-label="กลับไปเลือกเครื่องคำนวณ" onClick={back}>
              ←
            </button>
          ) : null}
          <button type="button" className="pl-overlay-close" aria-label="ปิดเครื่องคำนวณ" onClick={close}>
            ×
          </button>
        </div>

        <div className="pl-overlay-body">
          {state.screen === "picker" ? (
            <div className="pl-calc-picker-grid">
              {pickerItems.map((item) => (
                <button
                  key={item.screen}
                  type="button"
                  className="pl-calc-picker-card pl-soft-card"
                  onClick={() => select(item.screen)}
                >
                  <p style={{ margin: 0, fontWeight: 700 }}>{item.title}</p>
                  <p className="pl-lede" style={{ marginTop: "6px" }}>{item.description}</p>
                </button>
              ))}
            </div>
          ) : null}

          {state.screen === "medium" && selectedPlant ? (
            <>
              <p style={{ margin: "0 0 12px" }}>
                <label htmlFor="calc-plant" style={{ display: "block", fontWeight: 600, marginBottom: "5px", fontSize: "14px" }}>
                  พืชที่จะทำอาหาร
                </label>
                <select
                  id="calc-plant"
                  value={selectedPlant.slug}
                  onChange={(event) => setSelectedPlantSlug(event.target.value)}
                  style={{
                    width: "100%",
                    padding: "9px 11px",
                    border: "1.5px solid var(--pl-line-soft)",
                    borderRadius: "12px",
                    background: "var(--pl-card)",
                    color: "var(--pl-ink)",
                    fontSize: "16px",
                  }}
                >
                  {plantPacks.map((pack) => (
                    <option key={pack.slug} value={pack.slug}>{pack.commonName}</option>
                  ))}
                </select>
              </p>
              <MediumCalculator key={`${selectedPlant.slug}-${toolsKey}`} recipes={selectedPlant.mediaRecipes} tools={kit} />
            </>
          ) : null}

          {state.screen === "working-stock" ? (
            <WorkingStockCalculator key={toolsKey} initialInput={{ minimumToolVolumeMl: kit.pipetteMinimumMl }} />
          ) : null}

          {state.screen === "haiter" ? (
            <HaiterCalculator key={toolsKey} initialInput={{ minimumMeasurableMl: kit.pipetteMinimumMl }} />
          ) : null}
        </div>
      </div>
    </div>
  );
}
