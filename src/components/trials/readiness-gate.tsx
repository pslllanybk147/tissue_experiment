"use client";

import Link from "next/link";
import type { TrialReadiness } from "@/lib/equipment/trial-readiness";

export function ReadinessGate({ loading, readiness, starting, confirmed, onConfirmed, onStart }: {
  loading: boolean;
  readiness: TrialReadiness | null;
  starting: boolean;
  confirmed: boolean;
  onConfirmed: (confirmed: boolean) => void;
  onStart: () => void;
}) {
  const experimental = readiness?.overall === "experimental";
  const canStart = !loading && Boolean(readiness) && (readiness?.overall === "ready" || (experimental && confirmed));

  return (
    <section className="pl-card" style={{ marginTop: "18px", background: readiness?.overall === "blocked" ? "var(--pl-stop)" : "var(--pl-sunk)" }}>
      <h2 className="pl-h2">ตรวจความพร้อมก่อนสร้างห้ารอบ</h2>

      {loading ? <p className="pl-lede" role="status" style={{ marginTop: "8px" }}>กำลังตรวจอุปกรณ์และวิธีฆ่าเชื้อ…</p> : null}

      {!loading && !readiness ? (
        <p className="pl-lede" style={{ marginTop: "8px" }}>ยังไม่มีข้อมูลอุปกรณ์ จึงยังเริ่มไม่ได้</p>
      ) : null}

      {readiness?.overall === "blocked" ? (
        <>
          <p className="pl-lede" style={{ marginTop: "8px" }}>ยังเริ่มชุดทดลองจริงไม่ได้ แก้รายการต่อไปนี้ก่อน</p>
          <ul style={{ margin: "10px 0 0", paddingLeft: "20px" }}>
            {readiness.blockers.map((item) => (
              <li key={item.id}><strong>{item.title}</strong> — {item.missing}. {item.next}</li>
            ))}
          </ul>
          <p style={{ marginTop: "12px" }}><Link className="pl-link" href="/my/equipment">ไปบันทึกและแก้อุปกรณ์</Link></p>
        </>
      ) : null}

      {experimental ? (
        <label className="pl-card" style={{ display: "flex", gap: "10px", alignItems: "flex-start", marginTop: "12px", cursor: "pointer" }}>
          <input type="checkbox" checked={confirmed} onChange={(event) => onConfirmed(event.currentTarget.checked)} style={{ width: "22px", height: "22px", flex: "none" }} />
          <span>ฉันอ่านข้อจำกัดแล้วและยอมรับว่าวิธีนี้เป็นการทดลอง ต้องทำกระปุกเปล่าควบคุมและบันทึกค่าที่ทำจริง</span>
        </label>
      ) : null}

      {readiness?.overall === "ready" ? <p className="pl-lede" style={{ marginTop: "8px" }}>อุปกรณ์และวิธีหลักพร้อมสำหรับเริ่มชุดทดลอง</p> : null}

      <button
        type="button"
        className="pl-chip"
        disabled={!canStart || starting}
        onClick={onStart}
        style={{ marginTop: "14px", background: "var(--pl-yellow)", cursor: canStart && !starting ? "pointer" : "not-allowed", fontSize: "15px", padding: "10px 18px" }}
      >
        {starting ? "กำลังเปิดห้ารอบ…" : "เริ่มชุดทดลอง"}
      </button>
    </section>
  );
}
