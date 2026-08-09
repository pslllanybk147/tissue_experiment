"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AuthGate } from "@/components/auth/auth-gate";
import { useAuth } from "@/components/auth/auth-provider";
import { GuideShell } from "@/components/guide/guide-shell";
import { ThemeToggle } from "@/components/guide/theme-toggle";
import { PathSummary } from "@/components/equipment/path-summary";
import { ProfileSection } from "@/components/equipment/profile-section";
import { OnlineStatus } from "@/components/rounds/online-status";
import { normalizeEquipmentProfile, USER_REPORTED_PROFILE, type EquipmentProfileV2 } from "@/lib/equipment/equipment-profile";
import { resolveTrialReadiness } from "@/lib/equipment/trial-readiness";
import { getEquipmentRepository } from "@/lib/repositories/equipment-repository-factory";

export default function EquipmentPage() {
  const { session } = useAuth();
  const ownerId = session.user?.uid ?? "demo-owner";
  const authenticated = session.status === "authenticated";
  const repository = useMemo(() => getEquipmentRepository(ownerId, authenticated), [ownerId, authenticated]);
  const [profile, setProfile] = useState<EquipmentProfileV2>(() => structuredClone(USER_REPORTED_PROFILE));
  const [saved, setSaved] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!["demo", "authenticated"].includes(session.status)) return;
    let active = true;
    repository
      .get(ownerId)
      .then((found) => {
        if (active && found) setProfile(normalizeEquipmentProfile(found));
      })
      .catch((error: unknown) => {
        if (active) setSaved(`โหลดข้อมูลอุปกรณ์ไม่สำเร็จ: ${error instanceof Error ? error.message : "ไม่ทราบสาเหตุ"}`);
      });
    return () => {
      active = false;
    };
  }, [ownerId, repository, session.status]);

  async function persist() {
    setSaving(true);
    setSaved("");
    try {
      const stored = await repository.save(ownerId, profile);
      setProfile(stored);
      setSaved("บันทึกแล้ว ระบบจะใช้ค่านี้กับทุกรอบเพาะของคุณ");
    } catch (error) {
      setSaved(`บันทึกไม่สำเร็จ ข้อมูลที่กรอกยังอยู่ในหน้านี้: ${error instanceof Error ? error.message : "ไม่ทราบสาเหตุ"}`);
    } finally {
      setSaving(false);
    }
  }

  const readiness = resolveTrialReadiness(profile);

  return (
    <AuthGate>
      <GuideShell action={<ThemeToggle />}>
        <OnlineStatus />
        <h1 className="pl-h1">ของที่ฉันมี</h1>
        <p className="pl-lede" style={{ marginBottom: "20px" }}>
          บอกเราว่าคุณมีอะไร แล้วเราจะจัดคู่มือให้ตรงกับของที่มีจริง คู่มือบอกว่าต้องได้อะไร ระบบบอกว่าจะได้มายังไง
        </p>

        <ProfileSection profile={profile} onChange={(next) => { setProfile(next); setSaved(""); }} />

        <p style={{ marginTop: "14px" }}>
          <button
            type="button"
            className="pl-chip"
            onClick={() => { setProfile(structuredClone(USER_REPORTED_PROFILE)); setSaved("เติมค่าจากรายการที่แจ้งไว้แล้ว กรุณาตรวจอีกครั้งก่อนบันทึก"); }}
            style={{ background: "var(--pl-sunk)", cursor: "pointer", fontSize: "15px", padding: "10px 18px" }}
          >
            เติมค่าจากรายการที่แจ้งไว้
          </button>
        </p>

        <p style={{ marginTop: "16px", display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
          <button
            type="button"
            className="pl-chip"
            onClick={() => void persist()}
            disabled={saving}
            style={{ background: "var(--pl-green)", cursor: saving ? "wait" : "pointer", fontSize: "15px", padding: "10px 18px" }}
          >
            {saving ? "กำลังบันทึก…" : "บันทึกของที่มี"}
          </button>
          <Link className="pl-link" href="/my/rounds">กลับไปรอบเพาะของฉัน</Link>
        </p>
        {saved ? <p className="pl-mono" role="status" style={{ marginTop: "10px" }}>{saved}</p> : null}

        <PathSummary readiness={readiness} />
      </GuideShell>
    </AuthGate>
  );
}
