"use client";

import { useState, type FormEvent } from "react";
import type { T3Eligibility } from "@/lib/trials/t3-eligibility";

const missingLabel: Record<string, string> = {
  "container-total": "จำนวนกระปุกทั้งหมด",
  "container-clean": "จำนวนกระปุกไม่ติดเชื้อ",
  "container-usable": "จำนวนชิ้นที่ยังใช้ได้",
  "observed-at": "วันที่สังเกต",
  "result-run": "ยังไม่ได้บันทึกขั้นตรวจการปนเปื้อน",
};

function explainMissing(value: string): string {
  const [role, field] = value.split(":");
  return `${role.toUpperCase()} · ${missingLabel[field] ?? field}`;
}

export function canSubmitT3Override(acknowledged: boolean, reason: string): boolean {
  return acknowledged && reason.trim().length >= 20;
}

export function T3LockPanel({
  eligibility,
  demoMode,
  onOverride,
  initialAcknowledged = false,
  initialReason = "",
}: {
  eligibility: T3Eligibility;
  demoMode: boolean;
  onOverride: (reason: string) => Promise<void>;
  initialAcknowledged?: boolean;
  initialReason?: string;
}) {
  const [acknowledged, setAcknowledged] = useState(initialAcknowledged);
  const [reason, setReason] = useState(initialReason);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  if (eligibility.unlocked) {
    return (
      <section className="pl-card" style={{ marginTop: "18px", background: "var(--pl-sunk)" }}>
        <p className="pl-h2">T3 ปลดล็อกแล้ว</p>
        <p className="pl-meta" style={{ marginTop: "6px" }}>
          {eligibility.reason === "override" ? "ปลดล็อกจากการยืนยันความเสี่ยง" : "มีผล T1 และ T2 ครบแล้ว"}
        </p>
        {demoMode ? (
          <p className="pl-mono" style={{ marginTop: "8px" }}>
            demo-only · ทดสอบหน้าจอได้ แต่ไม่ถูกนับเป็นผลทดลองจริง
          </p>
        ) : null}
      </section>
    );
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmitT3Override(acknowledged, reason) || saving) return;
    setSaving(true);
    setMessage("");
    try {
      await onOverride(reason.trim());
      setMessage("บันทึกการยืนยันแล้ว");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "บันทึกการยืนยันไม่สำเร็จ ลองใหม่อีกครั้ง");
    } finally {
      setSaving(false);
    }
  }

  const valid = canSubmitT3Override(acknowledged, reason);

  return (
    <section className="pl-card" style={{ marginTop: "18px", background: "var(--pl-stop)" }}>
      <h2 className="pl-h2">T3 ยังถูกล็อก</h2>
      <p className="pl-lede" style={{ marginTop: "8px" }}>
        อ่าน protocol ได้ แต่ยังเริ่มจับเวลาหรือบันทึกว่าผ่านไม่ได้ จนกว่า T1 และ T2 จะมีผลครบ
      </p>
      <ul style={{ margin: "10px 0 0", paddingLeft: "20px" }}>
        {eligibility.missing.map((item) => <li key={item}>{explainMissing(item)}</li>)}
      </ul>

      {demoMode ? (
        <p className="pl-mono" style={{ marginTop: "12px" }}>
          demo-only · ทดสอบหน้าจอได้ แต่ไม่ถูกนับเป็นผลทดลองจริง
        </p>
      ) : null}

      <form onSubmit={(event) => void submit(event)} style={{ marginTop: "16px" }}>
        <fieldset disabled={saving} style={{ border: 0, padding: 0, margin: 0 }}>
          <legend style={{ fontWeight: 800 }}>ปลดล็อกก่อนมีผลครบ</legend>
          <label style={{ display: "flex", gap: "8px", alignItems: "flex-start", marginTop: "10px" }}>
            <input
              type="checkbox"
              checked={acknowledged}
              onChange={(event) => setAcknowledged(event.currentTarget.checked)}
            />
            <span>ฉันเข้าใจว่า T3 ไม่มีงานตรงพันธุ์และมีความเสี่ยงสูงกว่าแขนงอื่น</span>
          </label>
          <label htmlFor="t3-override-reason" style={{ display: "block", fontWeight: 700, marginTop: "12px" }}>
            เหตุผลที่ต้องเริ่มตอนนี้ (อย่างน้อย 20 ตัวอักษร)
          </label>
          <textarea
            id="t3-override-reason"
            minLength={20}
            required
            rows={4}
            value={reason}
            onChange={(event) => setReason(event.currentTarget.value)}
            style={{ width: "100%", marginTop: "6px", padding: "10px 12px", border: "2.5px solid var(--pl-line)", borderRadius: "10px", background: "var(--pl-sunk)", color: "var(--pl-ink)", font: "inherit" }}
          />
          <button
            type="submit"
            className="pl-chip"
            disabled={!valid || saving}
            style={{ marginTop: "12px", background: "var(--pl-red)", cursor: valid && !saving ? "pointer" : "not-allowed" }}
          >
            {saving ? "กำลังบันทึก…" : "ยืนยันและปลดล็อก"}
          </button>
        </fieldset>
      </form>

      {message ? <p role="status" className="pl-mono" style={{ marginTop: "10px" }}>{message}</p> : null}
    </section>
  );
}
