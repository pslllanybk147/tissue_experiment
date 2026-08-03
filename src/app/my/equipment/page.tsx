"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AuthGate } from "@/components/auth/auth-gate";
import { useAuth } from "@/components/auth/auth-provider";
import { GuideShell } from "@/components/guide/guide-shell";
import { ThemeToggle } from "@/components/guide/theme-toggle";
import { PathSummary } from "@/components/equipment/path-summary";
import { OnlineStatus } from "@/components/rounds/online-status";
import { equipmentHint, equipmentIds, equipmentLabel, type EquipmentId } from "@/lib/equipment/capabilities";
import { defaultKit, resolvePath, type EquipmentKit } from "@/lib/equipment/resolve-path";
import { getEquipmentRepository } from "@/lib/repositories/equipment-repository-factory";

const numberStyle = {
  width: "100%",
  padding: "9px 11px",
  border: "2.5px solid var(--pl-line)",
  borderRadius: "10px",
  background: "var(--pl-card)",
  color: "var(--pl-ink)",
  fontSize: "16px",
} as const;

export default function EquipmentPage() {
  const { session } = useAuth();
  const ownerId = session.user?.uid ?? "demo-owner";
  const authenticated = session.status === "authenticated";
  const repository = useMemo(() => getEquipmentRepository(ownerId, authenticated), [ownerId, authenticated]);
  const [kit, setKit] = useState<EquipmentKit>(defaultKit);
  const [saved, setSaved] = useState("");

  useEffect(() => {
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
  }, [ownerId, repository, session.status]);

  function toggle(id: EquipmentId) {
    setKit((current) => ({
      ...current,
      owned: current.owned.includes(id) ? current.owned.filter((item) => item !== id) : [...current.owned, id],
    }));
    setSaved("");
  }

  async function persist() {
    await repository.save(ownerId, kit);
    setSaved("บันทึกแล้ว ระบบจะใช้ค่านี้กับทุกรอบเพาะของคุณ");
  }

  const path = resolvePath(kit);

  return (
    <AuthGate>
      <GuideShell action={<ThemeToggle />}>
        <OnlineStatus />
        <h1 className="pl-h1">ของที่ฉันมี</h1>
        <p className="pl-lede" style={{ marginBottom: "20px" }}>
          บอกเราว่าคุณมีอะไร แล้วเราจะจัดคู่มือให้ตรงกับของที่มีจริง คู่มือบอกว่าต้องได้อะไร ระบบบอกว่าจะได้มายังไง
        </p>

        <section className="pl-card" style={{ background: "var(--pl-sunk)", display: "flex", flexDirection: "column", gap: "10px" }}>
          <h2 className="pl-h2">อุปกรณ์</h2>
          {equipmentIds.map((id) => (
            <label
              key={id}
              htmlFor={id}
              className="pl-card"
              style={{ display: "flex", gap: "12px", alignItems: "flex-start", cursor: "pointer" }}
            >
              <input
                id={id}
                type="checkbox"
                checked={kit.owned.includes(id)}
                onChange={() => toggle(id)}
                style={{ width: "22px", height: "22px", marginTop: "2px", flex: "none" }}
              />
              <span>
                <span style={{ fontWeight: 700, display: "block" }}>{equipmentLabel[id]}</span>
                {equipmentHint[id] ? <span className="pl-meta">{equipmentHint[id]}</span> : null}
              </span>
            </label>
          ))}
        </section>

        <section className="pl-card" style={{ marginTop: "14px", background: "var(--pl-sunk)" }}>
          <h2 className="pl-h2">ความละเอียดของเครื่องมือ</h2>
          <p className="pl-lede" style={{ marginTop: "6px" }}>
            ใช้ตัดสินว่าสารตัวไหนชั่งหรือตวงได้จริง เครื่องคำนวณจะหยิบค่านี้ไปใช้ให้เอง
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "12px", marginTop: "12px" }}>
            <p style={{ margin: 0 }}>
              <label htmlFor="scale" style={{ display: "block", fontWeight: 600, marginBottom: "5px", fontSize: "14px" }}>
                เครื่องชั่งอ่านต่ำสุด (มก.)
              </label>
              <input
                id="scale"
                type="number"
                min="0"
                step="any"
                value={kit.scaleMinimumMg}
                onChange={(event) => { setKit((c) => ({ ...c, scaleMinimumMg: Number(event.target.value) })); setSaved(""); }}
                style={numberStyle}
              />
            </p>
            <p style={{ margin: 0 }}>
              <label htmlFor="pipette" style={{ display: "block", fontWeight: 600, marginBottom: "5px", fontSize: "14px" }}>
                ตวงได้ละเอียดสุด (มล.)
              </label>
              <input
                id="pipette"
                type="number"
                min="0"
                step="any"
                value={kit.pipetteMinimumMl}
                onChange={(event) => { setKit((c) => ({ ...c, pipetteMinimumMl: Number(event.target.value) })); setSaved(""); }}
                style={numberStyle}
              />
            </p>
            <p style={{ margin: 0 }}>
              <label htmlFor="ms-rate" style={{ display: "block", fontWeight: 600, marginBottom: "5px", fontSize: "14px" }}>
                อัตรา MS บนฉลาก (ก./ล.)
              </label>
              <input
                id="ms-rate"
                type="number"
                min="0"
                step="any"
                value={kit.msLabelRateGPerL}
                onChange={(event) => { setKit((c) => ({ ...c, msLabelRateGPerL: Number(event.target.value) })); setSaved(""); }}
                style={numberStyle}
              />
            </p>
          </div>
        </section>

        <p style={{ marginTop: "16px", display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
          <button
            type="button"
            className="pl-chip"
            onClick={() => void persist()}
            style={{ background: "var(--pl-green)", cursor: "pointer", fontSize: "15px", padding: "10px 18px" }}
          >
            บันทึกของที่มี
          </button>
          <Link className="pl-link" href="/my/rounds">กลับไปรอบเพาะของฉัน</Link>
        </p>
        {saved ? <p className="pl-mono" role="status" style={{ marginTop: "10px" }}>{saved}</p> : null}

        <PathSummary path={path} />
      </GuideShell>
    </AuthGate>
  );
}
