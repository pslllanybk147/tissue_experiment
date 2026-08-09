"use client";

import type { TrialArmRole } from "@/lib/domain/models";

const labels: Record<TrialArmRole, string> = {
  "control-a": "Control-A (ใบ)",
  "control-b": "Control-B กระปุกเปล่า (ใบ)",
  t1: "T1 (ใบ)",
  t2: "T2 (ใบ)",
  t3: "T3 (ใบ)",
};
const roles = ["control-a", "control-b", "t1", "t2", "t3"] as const;

const style = { width: "100%", padding: "9px 11px", border: "2.5px solid var(--pl-line)", borderRadius: "10px", background: "var(--pl-card)", color: "var(--pl-ink)", fontSize: "16px" } as const;

export function JarAllocationPanel({ total, reserved, allocations, onReserved, onAllocation }: {
  total: number;
  reserved: number;
  allocations: Record<TrialArmRole, number>;
  onReserved: (value: number) => void;
  onAllocation: (role: TrialArmRole, value: number) => void;
}) {
  const used = Object.values(allocations).reduce((sum, value) => sum + value, 0) + reserved;
  const valid = used <= total && reserved >= 0 && Object.values(allocations).every((value) => Number.isInteger(value) && value > 0);
  return (
    <section className="pl-card" style={{ marginTop: "18px", background: "var(--pl-sunk)" }}>
      <h2 className="pl-h2">แบ่งกระปุกก่อนสร้างรอบ</h2>
      <p className="pl-lede" style={{ marginTop: "6px" }}>มีทั้งหมด {total} ใบ จำนวนนี้มาจากหน้าอุปกรณ์</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "12px", marginTop: "12px" }}>
        {roles.map((role) => (
          <p key={role} style={{ margin: 0 }}>
            <label htmlFor={`jar-${role}`} style={{ display: "block", fontWeight: 700, marginBottom: "5px" }}>{labels[role]}</label>
            <input id={`jar-${role}`} type="number" min="1" step="1" value={allocations[role]} onChange={(event) => onAllocation(role, Number(event.currentTarget.value))} style={style} />
          </p>
        ))}
        <p style={{ margin: 0 }}>
          <label htmlFor="jar-reserved" style={{ display: "block", fontWeight: 700, marginBottom: "5px" }}>สำรอง (ใบ)</label>
          <input id="jar-reserved" type="number" min="0" step="1" value={reserved} onChange={(event) => onReserved(Number(event.currentTarget.value))} style={style} />
        </p>
      </div>
      <p className="pl-mono" role={valid ? undefined : "alert"} style={{ marginTop: "12px", color: valid ? undefined : "var(--pl-red)" }}>
        ใช้ {used} จาก {total} ใบ · เหลือ {total - used} ใบ{valid ? "" : " · ทุกแขนต้องมีอย่างน้อย 1 ใบและห้ามใช้เกินของที่มี"}
      </p>
    </section>
  );
}
