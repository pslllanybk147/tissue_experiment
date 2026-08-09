import type { RinseWaterMethod, RinseWaterSnapshot } from "@/lib/domain/models";
import { buildLowDoseRinseWaterSnapshot, buildNaDccRinseWaterSnapshot } from "@/lib/domain/rinse-water-planning";

type ChlorinatedRinseMethod = Extract<RinseWaterMethod, "low-dose-hypochlorite" | "nadcc">;

const methodLabels: Record<ChlorinatedRinseMethod, string> = {
  "low-dose-hypochlorite": "NaClO / Haiter",
  nadcc: "NaDCC",
};

const fieldStyle = {
  display: "block",
  width: "100%",
  marginTop: "5px",
  padding: "9px 11px",
  border: "2.5px solid var(--pl-line)",
  borderRadius: "10px",
  background: "var(--pl-card)",
  color: "var(--pl-ink)",
  font: "inherit",
  boxSizing: "border-box",
} as const;

export function canConfirmRinsePreparation(snapshot: RinseWaterSnapshot): boolean {
  return Boolean(snapshot.productName?.trim())
    && Boolean(snapshot.batchOrLot?.trim())
    && typeof snapshot.actualChlorinePpm === "number"
    && snapshot.actualChlorinePpm > 0
    && typeof snapshot.stockVolumeMl === "number"
    && snapshot.stockVolumeMl > 0
    && typeof snapshot.finalVolumeMl === "number"
    && snapshot.finalVolumeMl > 0
    && Boolean(snapshot.preparedAt);
}

function initialSnapshot(method: ChlorinatedRinseMethod): RinseWaterSnapshot {
  return method === "nadcc" ? buildNaDccRinseWaterSnapshot(50) : buildLowDoseRinseWaterSnapshot(50);
}

function numberValue(value: number | undefined): string {
  return typeof value === "number" ? String(value) : "";
}

export function RinsePreparationCard({
  method,
  value,
  onChange,
}: {
  method: ChlorinatedRinseMethod;
  value: RinseWaterSnapshot | null;
  onChange: (snapshot: RinseWaterSnapshot) => void;
}) {
  const snapshot = value ?? initialSnapshot(method);
  const update = (changes: Partial<RinseWaterSnapshot>) => onChange({ ...snapshot, ...changes, status: "planned" });
  const confirmed = snapshot.status === "prepared" && canConfirmRinsePreparation(snapshot);

  return (
    <article className="pl-card" style={{ marginTop: "12px", background: "var(--pl-card)" }}>
      <p className="pl-mono">น้ำ rinse ทดลอง 300 ppm · {methodLabels[method]}</p>
      <p className="pl-lede" style={{ marginTop: "6px" }}>
        เป้าหมายคลอรีนออกฤทธิ์ 300 ppm (0.03%) · เตรียม 3 ภาชนะ ภาชนะละ {snapshot.volumePerContainerMl} mL · พักอย่างน้อย {snapshot.minimumWaitMinutes ?? 60} นาที
      </p>
      <p className="pl-meta" style={{ marginTop: "6px" }}>น้ำ rinse ไม่ใช่น้ำปลอดเชื้อ และใช้เฉพาะ T1/T2 ตาม protocol ทดลอง</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "10px", marginTop: "12px" }}>
        <label>ผลิตภัณฑ์<input style={fieldStyle} value={snapshot.productName ?? ""} onChange={(event) => update({ productName: event.currentTarget.value })} /></label>
        <label>Batch/Lot<input style={fieldStyle} value={snapshot.batchOrLot ?? ""} onChange={(event) => update({ batchOrLot: event.currentTarget.value })} /></label>
        <label>ppm ที่ได้จริง<input style={fieldStyle} type="number" min="1" value={numberValue(snapshot.actualChlorinePpm)} onChange={(event) => update({ actualChlorinePpm: Number(event.currentTarget.value) })} /></label>
        <label>stock ที่ใช้ (mL)<input style={fieldStyle} type="number" min="0" step="0.1" value={numberValue(snapshot.stockVolumeMl)} onChange={(event) => update({ stockVolumeMl: Number(event.currentTarget.value) })} /></label>
        <label>ปริมาตรรวม (mL)<input style={fieldStyle} type="number" min="1" value={numberValue(snapshot.finalVolumeMl ?? snapshot.preparationVolumeMl)} onChange={(event) => update({ finalVolumeMl: Number(event.currentTarget.value) })} /></label>
        <label>วันที่เตรียม<input style={fieldStyle} type="date" value={snapshot.preparedAt?.slice(0, 10) ?? ""} onChange={(event) => update({ preparedAt: event.currentTarget.value })} /></label>
      </div>
      <label style={{ display: "flex", gap: "8px", alignItems: "flex-start", marginTop: "12px" }}>
        <input
          type="checkbox"
          checked={confirmed}
          onChange={(event) => onChange({ ...snapshot, status: event.currentTarget.checked && canConfirmRinsePreparation(snapshot) ? "prepared" : "planned" })}
          style={{ width: "22px", height: "22px", flex: "none" }}
        />
        <span>ฉันเตรียมน้ำตามค่าที่กรอกแล้ว และยืนยันให้ระบบใช้เป็นน้ำ rinse ของแขนทดลองนี้</span>
      </label>
      {snapshot.status === "prepared" && !confirmed ? <p role="alert" className="pl-meta" style={{ marginTop: "8px" }}>ข้อมูลยืนยันยังไม่ครบ ระบบจะถือว่ายังไม่ได้เตรียม</p> : null}
    </article>
  );
}
