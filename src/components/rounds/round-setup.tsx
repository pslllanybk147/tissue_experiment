"use client";

import { useState } from "react";
import type { EquipmentProfileV2 } from "@/lib/equipment/equipment-profile";
import type { ResolvedManual } from "@/lib/manual/types";
import type { RoundSetupChemistry } from "@/lib/domain/models";
import type { RoundSetupInput, RoundSetupSelection } from "@/lib/rounds/round-setup";

type Props = {
  profile: EquipmentProfileV2;
  manual: ResolvedManual;
  onConfirm: (result: RoundSetupInput & { profile: EquipmentProfileV2 }) => void | Promise<void>;
  onBack: () => void;
};

export type RoundSetupResult = RoundSetupInput & { profile: EquipmentProfileV2 };

type SelectionGroup = "mediumMethod" | "surfaceMethod" | "rinseMethod";

const inputStyle = {
  width: "100%",
  padding: "9px 10px",
  border: "2px solid var(--pl-line)",
  borderRadius: "9px",
  background: "var(--pl-sunk)",
  color: "var(--pl-ink)",
  fontSize: "16px",
} as const;

const choiceStyle = {
  display: "grid",
  gridTemplateColumns: "auto 1fr auto",
  gap: "12px",
  alignItems: "start",
  width: "100%",
  padding: "14px",
  border: "2px solid var(--pl-line)",
  borderRadius: "12px",
  background: "var(--pl-sunk)",
  color: "inherit",
  textAlign: "left" as const,
  cursor: "pointer",
};

const selectedChoiceStyle = {
  ...choiceStyle,
  borderColor: "var(--pl-neon-2)",
  background: "var(--pl-card)",
  boxShadow: "inset 4px 0 0 var(--pl-neon-2)",
};

function ChemicalField({ label, value, onChange, step = "any" }: { label: string; value: number; onChange: (value: number) => void; step?: string }) {
  return (
    <label style={{ display: "grid", gap: "5px", fontWeight: 700 }}>
      {label}
      <input type="number" min={0} step={step} value={value} onChange={(event) => onChange(Number(event.currentTarget.value))} style={inputStyle} />
    </label>
  );
}

function ChemicalCards({ profile, onChange }: { profile: EquipmentProfileV2; onChange: (profile: EquipmentProfileV2) => void }) {
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
    <section className="pl-card" style={{ marginTop: "18px", background: "var(--pl-sunk)" }}>
      <p className="pl-mono" style={{ margin: 0 }}>ข้อมูลสารที่มีในมือ</p>
      <h2 className="pl-h2" style={{ marginTop: "5px" }}>NaDCC และ Haiter แสดงพร้อมกัน</h2>
      <p className="pl-lede" style={{ marginTop: "6px" }}>กรอกข้อมูลสารที่มีไว้ก่อน การเลือกว่าจะใช้สารใดในแต่ละขั้นอยู่ด้านล่างและไม่ลบข้อมูลอีกตัว</p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "14px", marginTop: "14px" }}>
        <article className="pl-card" style={{ background: "var(--pl-card)", borderTop: "4px solid var(--pl-neon)" }}>
          <h3 className="pl-h2">NaDCC {profile.chemicals.nadcc.availableChlorinePercent}% <span className="pl-meta">เม็ดฟู่</span></h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "10px", marginTop: "12px" }}>
            <ChemicalField label="คลอรีนออกฤทธิ์ (%)" value={profile.chemicals.nadcc.availableChlorinePercent} onChange={(value) => updateChemistry({ nadccAvailableChlorinePercent: value })} />
            <ChemicalField label="น้ำหนักเม็ด (g)" value={profile.chemicals.nadcc.tabletMassG} onChange={(value) => updateChemistry({ nadccTabletMassG: value })} />
            <ChemicalField label="สารออกฤทธิ์ (g/เม็ด)" value={profile.chemicals.nadcc.nadccMassGPerTablet} onChange={(value) => updateChemistry({ nadccMassGPerTablet: value })} />
          </div>
          <p className="pl-meta" style={{ marginTop: "10px" }}>ระบบจะใช้ค่าฉลากนี้คำนวณเมื่อเลือก NaDCC</p>
        </article>

        <article className="pl-card" style={{ background: "var(--pl-card)", borderTop: "4px solid var(--pl-neon-2)" }}>
          <h3 className="pl-h2">Haiter / NaOCl <span className="pl-meta">สารละลาย</span></h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "10px", marginTop: "12px" }}>
            <ChemicalField label="ความเข้มข้น (%)" value={profile.chemicals.bleach.percentWw} onChange={(value) => updateChemistry({ bleachPercentWw: value })} />
            <p style={{ margin: 0 }}><label style={{ display: "grid", gap: "5px", fontWeight: 700 }}>ฐานฉลาก<input value="% w/w" readOnly style={inputStyle} /></label></p>
          </div>
          <p className="pl-meta" style={{ marginTop: "10px" }}>ระบบจะใช้ค่าฉลากนี้คำนวณเมื่อเลือก Haiter</p>
        </article>
      </div>
    </section>
  );
}

function Choice({ selected, title, description, tag, onClick, disabled = false }: { selected: boolean; title: string; description: string; tag?: string; onClick: () => void; disabled?: boolean }) {
  return (
    <button type="button" disabled={disabled} aria-pressed={selected} onClick={onClick} style={{ ...(selected ? selectedChoiceStyle : choiceStyle), ...(disabled ? { opacity: 0.5, cursor: "not-allowed" } : {}) }}>
      <span aria-hidden="true" style={{ width: "20px", height: "20px", border: `2px solid ${selected ? "var(--pl-neon-2)" : "var(--pl-ink-3)"}`, borderRadius: "50%", position: "relative", marginTop: "1px" }}>
        {selected ? <span style={{ position: "absolute", inset: "4px", borderRadius: "50%", background: "var(--pl-neon-2)" }} /> : null}
      </span>
      <span><strong>{title}</strong><small style={{ display: "block", marginTop: "4px", color: "var(--pl-ink-2)", lineHeight: 1.5 }}>{description}</small></span>
      {tag ? <span className="pl-choice-tag">{tag}</span> : <span />}
    </button>
  );
}

function MethodGroup({ title, note, group, value, options, onSelect, onClear }: {
  title: string;
  note: string;
  group: SelectionGroup;
  value: string | null;
  options: Array<{ value: string; title: string; description: string; tag?: string; disabled?: boolean }>;
  onSelect: (group: SelectionGroup, value: string) => void;
  onClear: (group: SelectionGroup) => void;
}) {
  return (
    <fieldset className="pl-card" style={{ margin: 0, background: "var(--pl-card)" }}>
      <legend className="pl-h2" style={{ padding: "0 8px" }}>{title}</legend>
      <p className="pl-lede" style={{ marginTop: "0" }}>{note}</p>
      <div style={{ display: "flex", justifyContent: "space-between", gap: "10px", alignItems: "center", marginTop: "12px", padding: "9px 11px", background: "var(--pl-sunk)", borderRadius: "9px" }}>
        <span className="pl-meta">สถานะ: <strong>{value ? "เลือกแล้ว" : "ยังไม่เลือก"}</strong></span>
        <button type="button" className="pl-action-secondary" onClick={() => onClear(group)} disabled={!value} style={{ cursor: value ? "pointer" : "not-allowed", padding: "7px 10px", fontSize: "13px" }}>ยกเลิกการเลือก</button>
      </div>
      <div style={{ display: "grid", gap: "10px", marginTop: "12px" }}>
        {options.map((option) => (
          <Choice key={option.value} selected={value === option.value} title={option.title} description={option.description} tag={option.tag} disabled={option.disabled} onClick={() => onSelect(group, option.value)} />
        ))}
      </div>
    </fieldset>
  );
}

export function RoundSetup({ profile, manual, onConfirm, onBack }: Props) {
  const [draftProfile, setDraftProfile] = useState(() => structuredClone(profile));
  const [selection, setSelection] = useState<RoundSetupSelection>({
    mediumMethod: profile.medium.sterilizationMethod,
    surfaceMethod: null,
    rinseMethod: null,
  });
  const complete = Boolean(selection.mediumMethod && selection.surfaceMethod && selection.rinseMethod);
  const chemistry: RoundSetupChemistry = {
    bleachPercentWw: draftProfile.chemicals.bleach.percentWw,
    nadccAvailableChlorinePercent: draftProfile.chemicals.nadcc.availableChlorinePercent,
    nadccTabletMassG: draftProfile.chemicals.nadcc.tabletMassG,
    nadccMassGPerTablet: draftProfile.chemicals.nadcc.nadccMassGPerTablet,
  };

  function select(group: SelectionGroup, value: string) {
    setSelection((current) => ({ ...current, [group]: value } as RoundSetupSelection));
  }

  function clear(group: SelectionGroup) {
    setSelection((current) => ({ ...current, [group]: null } as RoundSetupSelection));
  }

  return (
    <>
      <p className="pl-mono">เริ่มรอบใหม่ · ตั้งค่าก่อนเข้า protocol</p>
      <h1 className="pl-h1" style={{ marginTop: "8px" }}>ตั้งค่ารอบก่อนเริ่ม</h1>
      <p className="pl-lede" style={{ marginTop: "6px" }}>{manual.commonName}</p>
      <p className="pl-lede" style={{ marginTop: "8px" }}>เลือกวิธีที่คุณจะทำจริง ระบบจะล็อกค่าที่เลือกไว้กับรอบนี้ก่อนพาเข้า protocol</p>

      <ChemicalCards profile={draftProfile} onChange={setDraftProfile} />

      <section style={{ display: "grid", gap: "14px", marginTop: "18px" }}>
        <MethodGroup
          title="อาหารและกระปุก"
          note="เลือกวิธีทำให้อาหารและกระปุกปลอดเชื้อ 1 วิธี"
          group="mediumMethod"
          value={selection.mediumMethod}
          onSelect={select}
          onClear={clear}
          options={[
            { value: "pressure-sterilization", title: "หม้อนึ่งแรงดัน", description: "121°C · 15 psi · 15–20 นาที", tag: "ยังไม่มีอุปกรณ์", disabled: true },
            { value: "haiter-chemical", title: "Haiter / NaOCl ในอาหาร", description: "ใช้ข้อมูล Haiter ด้านบน ระบบจะคำนวณปริมาณให้", tag: "เลือกได้" },
            { value: "nadcc-chemical", title: "NaDCC ในอาหาร", description: "ใช้ข้อมูล NaDCC ด้านบน ระบบจะคำนวณจำนวนเม็ด/กรัมให้", tag: "ทดลอง" },
          ]}
        />
        <MethodGroup
          title="ฟอกผิวชิ้นพืช"
          note="เลือกวิธีฟอกผิว 1 วิธี ค่าจะไปอยู่ในขั้นฟอกโดยตรง"
          group="surfaceMethod"
          value={selection.surfaceMethod}
          onSelect={select}
          onClear={clear}
          options={[
            { value: "haiter-chemical", title: "Haiter / NaOCl", description: "ใช้ข้อมูล Haiter ด้านบน คำนวณปริมาณและเวลาใน protocol", tag: "ค่าเริ่มต้น" },
            { value: "nadcc-soak", title: "NaDCC แช่ชิ้นพืช", description: "ใช้ข้อมูล NaDCC ด้านบน · เป้าหมายเริ่มต้น 300 ppm", tag: "ทดลอง" },
          ]}
        />
        <MethodGroup
          title="น้ำล้างหลังฟอก"
          note="เลือกวิธีล้าง 1 วิธี ระบบจะใส่เป็นคำสั่ง R1–R3 ใน protocol"
          group="rinseMethod"
          value={selection.rinseMethod}
          onSelect={select}
          onClear={clear}
          options={[
            { value: "commercial-sterile", title: "น้ำปลอดเชื้อธรรมดา", description: "3 รอบ · รอบละ 1 นาที", tag: "ค่าเริ่มต้น" },
            { value: "nadcc", title: "NaDCC rinse 300 ppm", description: "ใช้ข้อมูล NaDCC ด้านบนคำนวณน้ำ rinse · ล้างน้ำปลอดเชื้อใน R4 ต่อ", tag: "ทดลอง" },
            { value: "low-dose-hypochlorite", title: "NaOCl / Haiter rinse 300 ppm", description: "ใช้ข้อมูล Haiter ด้านบนคำนวณน้ำ rinse · ล้างน้ำปลอดเชื้อใน R4 ต่อ", tag: "ทดลอง" },
          ]}
        />
      </section>

      <section className="pl-card" style={{ marginTop: "18px", background: complete ? "var(--pl-yellow)" : "var(--pl-stop)" }}>
        <h2 className="pl-h2">{complete ? "พร้อมยืนยัน" : "ยังไม่พร้อมยืนยัน"}</h2>
        <p className="pl-lede" style={{ marginTop: "6px", color: complete ? "var(--pl-chip-ink)" : undefined }}>
          {complete ? "ระบบจะเก็บข้อมูล NaDCC และ Haiter ทั้งคู่ แล้วล็อกเฉพาะวิธีที่เลือกไว้ในรอบนี้" : "ต้องเลือกให้ครบทุกหมวด: อาหารและกระปุก, ฟอกผิวชิ้นพืช, น้ำล้าง"}
        </p>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginTop: "14px" }}>
          <button type="button" className="pl-action-secondary" onClick={onBack} style={{ cursor: "pointer" }}>ย้อนกลับ</button>
          <button type="button" className="pl-action-primary" disabled={!complete} onClick={() => complete && void onConfirm({ ...selection, chemistry, profile: draftProfile })} style={{ cursor: complete ? "pointer" : "not-allowed" }}>
            ยืนยันและเข้า protocol
          </button>
        </div>
      </section>
    </>
  );
}
