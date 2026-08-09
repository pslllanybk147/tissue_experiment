"use client";

import type { EquipmentItemId, EquipmentProfileV2 } from "@/lib/equipment/equipment-profile";

const inputStyle = {
  width: "100%",
  padding: "9px 11px",
  border: "2.5px solid var(--pl-line)",
  borderRadius: "10px",
  background: "var(--pl-card)",
  color: "var(--pl-ink)",
  fontSize: "16px",
} as const;

const inventoryLabel: Record<EquipmentItemId, string> = {
  forceps: "คีม forceps",
  scissors: "กรรไกร",
  "scalpel-narrow": "มีดผ่าตัดแบบเรียว",
  "scalpel-wide": "มีดผ่าตัดแบบอ้วน",
  "alcohol-lamp": "ตะเกียงแอลกอฮอล์ (ไม่มีเชื้อเพลิง)",
  "picnic-gas-stove": "เตาแก๊สปิคนิค",
  "aluminium-cup-1l": "แก้วอะลูมิเนียม 1 L",
  "stirring-rod": "แท่งคนสาร",
  cutter: "คัตเตอร์",
  "plastic-culture-jar-50ml": "กระปุกเพาะพลาสติก 50 mL",
  "glass-jar-250ml": "ขวดโหลแก้ว 250 mL",
  "foggy-bottle": "Foggy (ขวด)",
  "pp-beaker": "บีกเกอร์ PP",
  "glass-beaker-1l": "บีกเกอร์แก้ว 1 L",
  "measuring-cup-100ml": "แก้วตวง 100 mL",
  "syringe-5ml": "Syringe 5 mL",
  "syringe-1ml": "Syringe 1 mL",
  "large-tissue": "ทิชชูแห้งแผ่นใหญ่",
  "yellow-label": "สติ๊กเกอร์สีเหลือง",
  "jewelry-scale": "เครื่องชั่ง jewelry",
  "food-scale": "เครื่องชั่งอาหาร",
  "ph-meter": "pH meter",
  "phone-s24fe": "Samsung Galaxy S24 FE",
  sab: "ตู้ SAB",
  "plastic-room-2x2m": "ห้องพลาสติก 2 × 2 m",
};

function NumberField({ id, label, value, onValue, min = 0, step = "any" }: {
  id: string;
  label: string;
  value: number;
  onValue: (value: number) => void;
  min?: number;
  step?: string;
}) {
  return (
    <p style={{ margin: 0 }}>
      <label htmlFor={id} style={{ display: "block", fontWeight: 700, marginBottom: "5px" }}>{label}</label>
      <input id={id} type="number" min={min} step={step} value={value} onChange={(event) => onValue(Number(event.currentTarget.value))} style={inputStyle} />
    </p>
  );
}

function FieldGrid({ children }: { children: React.ReactNode }) {
  return <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: "12px", marginTop: "12px" }}>{children}</div>;
}

function Card({ title, note, children }: { title: string; note?: string; children: React.ReactNode }) {
  return (
    <section className="pl-card" style={{ marginTop: "14px", background: "var(--pl-sunk)" }}>
      <h2 className="pl-h2">{title}</h2>
      {note ? <p className="pl-lede" style={{ marginTop: "6px" }}>{note}</p> : null}
      {children}
    </section>
  );
}

export function ProfileSection({ profile, onChange }: { profile: EquipmentProfileV2; onChange: (profile: EquipmentProfileV2) => void }) {
  const changed = (next: EquipmentProfileV2) => onChange(next);
  return (
    <>
      <Card title="ฉลากสารเคมี" note="กรอกตามฉลาก ห้ามเดาจากชื่อสินค้า และระบบจะไม่เปลี่ยน 75% ให้เป็น 70% เอง">
        <FieldGrid>
          <NumberField id="bleach-percent" label="Haiter (% w/w)" value={profile.chemicals.bleach.percentWw} onValue={(value) => changed({ ...profile, chemicals: { ...profile.chemicals, bleach: { ...profile.chemicals.bleach, percentWw: value } } })} />
          <NumberField id="alcohol-percent" label="แอลกอฮอล์ (%)" value={profile.chemicals.alcohol.percent} onValue={(value) => changed({ ...profile, chemicals: { ...profile.chemicals, alcohol: { percent: value } } })} />
          <NumberField id="nadcc-chlorine" label="NaDCC คลอรีนออกฤทธิ์ (%)" value={profile.chemicals.nadcc.availableChlorinePercent} onValue={(value) => changed({ ...profile, chemicals: { ...profile.chemicals, nadcc: { ...profile.chemicals.nadcc, availableChlorinePercent: value } } })} />
          <NumberField id="nadcc-tablet-mass" label="น้ำหนักต่อเม็ด (g)" value={profile.chemicals.nadcc.tabletMassG} onValue={(value) => changed({ ...profile, chemicals: { ...profile.chemicals, nadcc: { ...profile.chemicals.nadcc, tabletMassG: value } } })} />
          <NumberField id="nadcc-mass" label="NaDCC ต่อเม็ดตามฉลาก (g)" value={profile.chemicals.nadcc.nadccMassGPerTablet} onValue={(value) => changed({ ...profile, chemicals: { ...profile.chemicals, nadcc: { ...profile.chemicals.nadcc, nadccMassGPerTablet: value } } })} />
          <NumberField id="nadcc-count" label="จำนวนเม็ดในกระปุก (เม็ด)" value={profile.chemicals.nadcc.tabletCount} onValue={(value) => changed({ ...profile, chemicals: { ...profile.chemicals, nadcc: { ...profile.chemicals.nadcc, tabletCount: value } } })} />
        </FieldGrid>
      </Card>

      <Card title="น้ำ">
        <FieldGrid>
          <NumberField id="water-ppm" label="ค่าที่ระบุของน้ำ (ppm)" value={profile.water.sourcePpm} onValue={(value) => changed({ ...profile, water: { ...profile.water, sourcePpm: value } })} />
          <p style={{ margin: 0 }}>
            <label htmlFor="water-method" style={{ display: "block", fontWeight: 700, marginBottom: "5px" }}>วิธีฆ่าเชื้อน้ำที่ทำจริง</label>
            <input id="water-method" value={profile.water.sterilizationMethod ?? ""} placeholder="ยังไม่ได้ฆ่าเชื้อ" onChange={(event) => changed({ ...profile, water: { ...profile.water, sterilizationMethod: event.currentTarget.value.trim() || null } })} style={inputStyle} />
          </p>
        </FieldGrid>
        <label htmlFor="water-sterile" className="pl-card" style={{ display: "flex", gap: "10px", alignItems: "center", marginTop: "12px", cursor: "pointer" }}>
          <input id="water-sterile" type="checkbox" checked={profile.water.sterile} onChange={(event) => changed({ ...profile, water: { ...profile.water, sterile: event.currentTarget.checked } })} style={{ width: "22px", height: "22px" }} />
          <span>น้ำนี้ผ่านการฆ่าเชื้อแล้ว</span>
        </label>
      </Card>

      <Card title="เครื่องมือวัด">
        <FieldGrid>
          <NumberField id="jewelry-resolution" label="เครื่องชั่งจิวเวลรี่ อ่านต่ำสุด (g)" value={profile.instruments.balanceResolutionG} onValue={(value) => changed({ ...profile, instruments: { ...profile.instruments, balanceResolutionG: value }, scaleMinimumMg: value * 1000 })} />
          <NumberField id="food-resolution" label="เครื่องชั่งอาหาร อ่านต่ำสุด (g)" value={profile.instruments.foodScaleResolutionG} onValue={(value) => changed({ ...profile, instruments: { ...profile.instruments, foodScaleResolutionG: value } })} />
          <NumberField id="syringe-resolution" label="Syringe ตวงละเอียดสุด (mL)" value={profile.instruments.syringeResolutionMl} onValue={(value) => changed({ ...profile, instruments: { ...profile.instruments, syringeResolutionMl: value }, pipetteMinimumMl: value })} />
        </FieldGrid>
        <label htmlFor="has-ph-meter" className="pl-card" style={{ display: "flex", gap: "10px", alignItems: "center", marginTop: "12px", cursor: "pointer" }}>
          <input id="has-ph-meter" type="checkbox" checked={profile.instruments.phMeter} onChange={(event) => changed({ ...profile, instruments: { ...profile.instruments, phMeter: event.currentTarget.checked } })} style={{ width: "22px", height: "22px" }} />
          <span>มี pH meter</span>
        </label>
      </Card>

      <Card title="ภาชนะและพื้นที่ทำงาน">
        <FieldGrid>
          <NumberField id="culture-jars" label="กระปุกเพาะ 50 mL (ใบ)" value={profile.containers.cultureJar50Ml} onValue={(value) => changed({ ...profile, containers: { ...profile.containers, cultureJar50Ml: value } })} />
          <NumberField id="glass-jars" label="ขวดโหลแก้ว 250 mL (ใบ)" value={profile.containers.glassJar250Ml} onValue={(value) => changed({ ...profile, containers: { ...profile.containers, glassJar250Ml: value } })} />
        </FieldGrid>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", marginTop: "12px" }}>
          <label><input type="checkbox" checked={profile.workspace.sab} onChange={(event) => changed({ ...profile, workspace: { ...profile.workspace, sab: event.currentTarget.checked } })} /> มีตู้ SAB</label>
          <label><input type="checkbox" checked={profile.workspace.plasticRoom} onChange={(event) => changed({ ...profile, workspace: { ...profile.workspace, plasticRoom: event.currentTarget.checked } })} /> มีห้องพลาสติก 2 × 2 m</label>
          <label><input type="checkbox" checked={profile.workspace.openFlameFuelAvailable} onChange={(event) => changed({ ...profile, workspace: { ...profile.workspace, openFlameFuelAvailable: event.currentTarget.checked } })} /> มีเชื้อเพลิงตะเกียงพร้อมใช้</label>
        </div>
      </Card>

      <Card title="วัตถุดิบอาหาร">
        <p style={{ marginTop: "12px" }}>
          <label htmlFor="medium-sterilization" style={{ display: "block", fontWeight: 700, marginBottom: "5px" }}>วิธีฆ่าเชื้ออาหารที่จะใช้</label>
          <select
            id="medium-sterilization"
            value={profile.medium.sterilizationMethod ?? ""}
            onChange={(event) => changed({ ...profile, medium: { ...profile.medium, sterilizationMethod: event.currentTarget.value === "haiter-chemical" ? "haiter-chemical" : event.currentTarget.value === "nadcc-chemical" ? "nadcc-chemical" : null } })}
            style={inputStyle}
          >
            <option value="">ยังไม่ได้เลือก</option>
            <option value="haiter-chemical">Haiter แบบเคมี · ต้องมีกระปุกเปล่าควบคุม</option>
            <option value="nadcc-chemical">NaDCC แบบเคมี · ต้องมีกระปุกเปล่าควบคุม</option>
          </select>
        </p>
        <FieldGrid>
          <NumberField id="ms-rate" label="MS ตามฉลาก (g/L)" value={profile.medium.msRateGPerL} onValue={(value) => changed({ ...profile, medium: { ...profile.medium, msRateGPerL: value }, msRateGPerL: value, msLabelRateGPerL: value })} />
          <NumberField id="naa-stock" label="NAA stock (mg/mL)" value={profile.medium.naaMgPerMl} onValue={(value) => changed({ ...profile, medium: { ...profile.medium, naaMgPerMl: value }, naaStockMgPerMl: value })} />
          <NumberField id="ba-stock" label="BA stock (mg/mL)" value={profile.medium.baMgPerMl} onValue={(value) => changed({ ...profile, medium: { ...profile.medium, baMgPerMl: value }, baStockMgPerMl: value })} />
          <NumberField id="iba-stock" label="IBA stock (mg/mL)" value={profile.medium.ibaMgPerMl} onValue={(value) => changed({ ...profile, medium: { ...profile.medium, ibaMgPerMl: value }, ibaStockMgPerMl: value })} />
        </FieldGrid>
        <p className="pl-lede" style={{ marginTop: "10px" }}>น้ำตาลทรายขาวเกรดบริโภค · pH up/down · ผงวุ้น{profile.medium.agarBrand}</p>
      </Card>

      <Card title="จำนวนของแต่ละชิ้น" note="รายการนี้บันทึกของที่รายงานจริง จำนวนที่ไม่ได้ระบุไว้ตั้งต้นเป็น 1 ชิ้น ไม่ใช่ 0">
        <FieldGrid>
          {profile.inventory.map((entry) => (
            <NumberField
              key={entry.id}
              id={`inventory-${entry.id}`}
              label={`${inventoryLabel[entry.id]} (${entry.unit === "bottle" ? "ขวด" : entry.unit === "pack" ? "แพ็ก" : entry.unit === "set" ? "ชุด" : "ชิ้น"})`}
              value={entry.quantity}
              onValue={(value) => changed({ ...profile, inventory: profile.inventory.map((item) => item.id === entry.id ? { ...item, quantity: value } : item) })}
            />
          ))}
        </FieldGrid>
      </Card>
    </>
  );
}
