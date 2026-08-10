"use client";

import { useState } from "react";
import { ActionBar } from "@/components/common/action-bar";
import { FieldGroup } from "@/components/common/field-group";
import { MethodSelector, type MethodOption } from "@/components/common/method-selector";
import { StatusNotice } from "@/components/common/status-notice";
import { WorkflowShell } from "@/components/common/workflow-shell";
import type { RoundSetupChemistry } from "@/lib/domain/models";
import type { EquipmentProfileV2 } from "@/lib/equipment/equipment-profile";
import { resolvePath } from "@/lib/equipment/resolve-path";
import type { ResolvedManual } from "@/lib/manual/types";
import { buildRoundSetupInput, type RoundSetupInput, type RoundSetupSelection } from "@/lib/rounds/round-setup";
import { PreparationSummary } from "./preparation-summary";

type Props = {
  profile: EquipmentProfileV2;
  manual: ResolvedManual;
  onConfirm: (result: RoundSetupInput & { profile: EquipmentProfileV2 }) => void | Promise<void>;
  onBack: () => void;
};

export type RoundSetupResult = RoundSetupInput & { profile: EquipmentProfileV2 };
type SelectionGroup = "mediumMethod" | "surfaceMethod" | "rinseMethod";

function ChemicalField({ id, label, value, onChange, unit }: { id: string; label: string; value: number; onChange: (value: number) => void; unit: string }) {
  const invalid = !Number.isFinite(value) || value <= 0;
  return (
    <FieldGroup id={id} label={label} unit={unit} error={invalid ? "ต้องมากกว่าศูนย์" : undefined}>
      <input id={id} type="number" min={0} step="any" value={value} aria-invalid={invalid} onChange={(event) => onChange(Number(event.currentTarget.value))} />
    </FieldGroup>
  );
}

function ChemicalFields({ profile, onChange }: { profile: EquipmentProfileV2; onChange: (profile: EquipmentProfileV2) => void }) {
  const updateChemistry = (chemistry: Partial<RoundSetupChemistry>) => {
    onChange({
      ...profile,
      chemicals: {
        ...profile.chemicals,
        bleach: { ...profile.chemicals.bleach, ...(chemistry.bleachPercentWw !== undefined ? { percentWw: chemistry.bleachPercentWw } : {}) },
        nadcc: {
          ...profile.chemicals.nadcc,
          ...(chemistry.nadccAvailableChlorinePercent !== undefined ? { availableChlorinePercent: chemistry.nadccAvailableChlorinePercent } : {}),
          ...(chemistry.nadccTabletMassG !== undefined ? { tabletMassG: chemistry.nadccTabletMassG } : {}),
          ...(chemistry.nadccMassGPerTablet !== undefined ? { nadccMassGPerTablet: chemistry.nadccMassGPerTablet } : {}),
        },
      },
    });
  };

  return (
    <section className="cl-setup-section" aria-labelledby="chemical-heading">
      <header className="cl-section-heading">
        <p>ขั้นที่ 1</p>
        <h2 id="chemical-heading">ข้อมูลสารที่มีในมือ</h2>
        <p>NaDCC และ Haiter แสดงพร้อมกันและจะไม่หายเมื่อเลือกวิธี</p>
      </header>
      <div className="cl-chemical-grid">
        <section className="cl-chemical-group">
          <h3>NaDCC {profile.chemicals.nadcc.availableChlorinePercent}%</h3>
          <p>เม็ดฟู่ · ใช้ค่าฉลากนี้เมื่อเลือก NaDCC</p>
          <ChemicalField id="nadcc-available-chlorine" label="คลอรีนออกฤทธิ์" unit="%" value={profile.chemicals.nadcc.availableChlorinePercent} onChange={(value) => updateChemistry({ nadccAvailableChlorinePercent: value })} />
          <ChemicalField id="nadcc-tablet-mass" label="น้ำหนักเม็ด" unit="g" value={profile.chemicals.nadcc.tabletMassG} onChange={(value) => updateChemistry({ nadccTabletMassG: value })} />
          <ChemicalField id="nadcc-active-mass" label="สารออกฤทธิ์ต่อเม็ด" unit="g/เม็ด" value={profile.chemicals.nadcc.nadccMassGPerTablet} onChange={(value) => updateChemistry({ nadccMassGPerTablet: value })} />
        </section>
        <section className="cl-chemical-group">
          <h3>Haiter / NaOCl</h3>
          <p>สารละลาย · ใช้ค่าฉลากนี้เมื่อเลือก Haiter</p>
          <ChemicalField id="bleach-concentration" label="ความเข้มข้นตามฉลาก" unit="% w/w" value={profile.chemicals.bleach.percentWw} onChange={(value) => updateChemistry({ bleachPercentWw: value })} />
        </section>
      </div>
    </section>
  );
}

function MethodGroup({ legend, note, group, value, options, onSelect, onClear }: {
  legend: string;
  note: string;
  group: SelectionGroup;
  value: string | null;
  options: MethodOption[];
  onSelect: (group: SelectionGroup, value: string) => void;
  onClear: (group: SelectionGroup) => void;
}) {
  return (
    <section className="cl-method-group">
      <p>{note}</p>
      <MethodSelector legend={legend} name={group} value={value} options={options} onChange={(next) => onSelect(group, next)} />
      <button className="cl-button-quiet" type="button" onClick={() => onClear(group)} disabled={!value}>ยกเลิกการเลือก</button>
    </section>
  );
}

export function RoundSetup({ profile, manual, onConfirm, onBack }: Props) {
  const [draftProfile, setDraftProfile] = useState(() => structuredClone(profile));
  const [currentStep, setCurrentStep] = useState(0);
  const [selection, setSelection] = useState<RoundSetupSelection>({
    mediumMethod: profile.medium.sterilizationMethod,
    surfaceMethod: null,
    rinseMethod: null,
  });
  const selectionsComplete = Boolean(selection.mediumMethod && selection.surfaceMethod && selection.rinseMethod);
  const chemistryComplete = [
    draftProfile.chemicals.nadcc.availableChlorinePercent,
    draftProfile.chemicals.nadcc.tabletMassG,
    draftProfile.chemicals.nadcc.nadccMassGPerTablet,
    draftProfile.chemicals.bleach.percentWw,
  ].every((value) => Number.isFinite(value) && value > 0);
  const sterileMediumMethod = resolvePath(draftProfile).capabilities.find((item) => item.capability === "sterile-medium")?.method;
  const pressureAvailable = sterileMediumMethod?.id === "medium-autoclave" || sterileMediumMethod?.id === "medium-pressure-cooker";
  const chlorinatedRinseDisabled = selection.surfaceMethod === "nadcc-soak";

  function select(group: SelectionGroup, value: string) {
    setSelection((current) => {
      const next = { ...current, [group]: value } as RoundSetupSelection;
      if (group === "surfaceMethod" && value === "nadcc-soak" && ["nadcc", "low-dose-hypochlorite"].includes(current.rinseMethod ?? "")) next.rinseMethod = null;
      return next;
    });
  }

  function clear(group: SelectionGroup) {
    setSelection((current) => ({ ...current, [group]: null } as RoundSetupSelection));
  }

  const summaryValue = { manualName: manual.commonName, profile: draftProfile, selection };
  const primaryAction = currentStep < 2 ? (
    <button className="cl-button-primary" type="button" disabled={currentStep === 0 ? !chemistryComplete : !selectionsComplete} onClick={() => setCurrentStep((step) => Math.min(2, step + 1))}>
      {currentStep === 0 ? "ต่อไป: เลือกวิธี" : "ต่อไป: ตรวจทาน"}
    </button>
  ) : (
    <button className="cl-button-primary" type="button" disabled={!chemistryComplete || !selectionsComplete} onClick={() => void onConfirm({ ...buildRoundSetupInput(selection, draftProfile, new Date().toISOString()), profile: draftProfile })}>
      ยืนยันและเข้า protocol
    </button>
  );

  const secondaryAction = (
    <button className="cl-button-secondary" type="button" onClick={currentStep === 0 ? onBack : () => setCurrentStep((step) => Math.max(0, step - 1))}>
      {currentStep === 0 ? "ย้อนกลับ" : "กลับขั้นก่อนหน้า"}
    </button>
  );

  return (
    <WorkflowShell
      title="ตั้งค่ารอบก่อนเริ่ม"
      description={`${manual.commonName} · เลือกวิธีที่จะทำจริง ระบบจะล็อกค่ากับรอบนี้`}
      steps={["ข้อมูลสาร", "เลือกวิธี", "ตรวจทาน"]}
      currentStep={currentStep}
      aside={<PreparationSummary value={summaryValue} />}
      actions={<ActionBar secondary={secondaryAction} primary={primaryAction} />}
    >
      <div hidden={currentStep !== 0}><ChemicalFields profile={draftProfile} onChange={setDraftProfile} /></div>
      <div className="cl-setup-section cl-method-stage" hidden={currentStep !== 1}>
        <header className="cl-section-heading"><p>ขั้นที่ 2</p><h2>เลือกวิธีที่จะใช้จริง</h2><p>เลือกหนึ่งวิธีในแต่ละหมวด ตัวเลือกอื่นยังคงมองเห็นได้</p></header>
        <MethodGroup legend="อาหารและกระปุก" note="เลือกวิธีทำให้อาหารและกระปุกปลอดเชื้อ 1 วิธี" group="mediumMethod" value={selection.mediumMethod} onSelect={select} onClear={clear} options={[
          { value: "pressure-sterilization", label: "หม้อนึ่งแรงดัน", description: "121°C · 15 psi · 15–20 นาที", status: pressureAvailable ? "อุปกรณ์พร้อม" : undefined, disabled: !pressureAvailable, disabledReason: pressureAvailable ? undefined : "ยังไม่มีอุปกรณ์แรงดันที่รองรับ" },
          { value: "haiter-chemical", label: "Haiter / NaOCl ในอาหาร", description: "ใช้ข้อมูล Haiter ด้านบน ระบบจะคำนวณปริมาณให้", status: "เลือกได้" },
          { value: "nadcc-chemical", label: "NaDCC ในอาหาร", description: "ใช้ข้อมูล NaDCC ด้านบน ระบบจะคำนวณจำนวนเม็ดหรือกรัมให้", status: "ทดลอง" },
        ]} />
        <MethodGroup legend="ฟอกผิวชิ้นพืช" note="ค่าที่เลือกจะไปอยู่ในขั้นฟอกโดยตรง" group="surfaceMethod" value={selection.surfaceMethod} onSelect={select} onClear={clear} options={[
          { value: "haiter-chemical", label: "Haiter / NaOCl", description: "คำนวณปริมาณและเวลาใน protocol", status: "ค่าเริ่มต้น" },
          { value: "nadcc-soak", label: "NaDCC แช่ชิ้นพืช", description: "เป้าหมายเริ่มต้น 300 ppm", status: "ทดลอง" },
        ]} />
        <MethodGroup legend="น้ำล้างหลังฟอก" note="ระบบจะใส่เป็นคำสั่ง R1–R3 ใน protocol" group="rinseMethod" value={selection.rinseMethod} onSelect={select} onClear={clear} options={[
          { value: "commercial-sterile", label: "น้ำปลอดเชื้อธรรมดา", description: "3 รอบ · รอบละ 1 นาที", status: "ค่าเริ่มต้น" },
          { value: "nadcc", label: "NaDCC rinse 300 ppm", description: "R1–R3 รอบละประมาณ 1 นาที", status: "ทดลอง", disabled: chlorinatedRinseDisabled, disabledReason: chlorinatedRinseDisabled ? "หลัง NaDCC soak ต้องใช้น้ำปลอดเชื้อ" : undefined },
          { value: "low-dose-hypochlorite", label: "NaOCl / Haiter rinse 300 ppm", description: "R1–R3 รอบละประมาณ 1 นาที", status: "ทดลอง", disabled: chlorinatedRinseDisabled, disabledReason: chlorinatedRinseDisabled ? "หลัง NaDCC soak ต้องใช้น้ำปลอดเชื้อ" : undefined },
        ]} />
      </div>
      <div className="cl-setup-section" hidden={currentStep !== 2}>
        <header className="cl-section-heading"><p>ขั้นที่ 3</p><h2>ตรวจทานก่อนล็อกค่ากับรอบ</h2></header>
        <PreparationSummary value={summaryValue} />
        {chemistryComplete && selectionsComplete ? (
          <StatusNotice tone="success" title="พร้อมยืนยัน">ระบบจะเก็บข้อมูล NaDCC และ Haiter ทั้งคู่ แล้วล็อกเฉพาะวิธีที่เลือกไว้ในรอบนี้</StatusNotice>
        ) : (
          <StatusNotice tone="blocked" title="ยังไม่พร้อมยืนยัน">ต้องเลือกให้ครบทุกหมวด: อาหารและกระปุก, ฟอกผิวชิ้นพืช, น้ำล้าง</StatusNotice>
        )}
      </div>
    </WorkflowShell>
  );
}
