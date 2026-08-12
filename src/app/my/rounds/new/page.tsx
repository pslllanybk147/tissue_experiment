"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import { AuthGate } from "@/components/auth/auth-gate";
import { useAuth } from "@/components/auth/auth-provider";
import { StatusNotice } from "@/components/common/status-notice";
import { GuideShell } from "@/components/guide/guide-shell";
import { ThemeToggle } from "@/components/guide/theme-toggle";
import { RoundSetup, type RoundSetupResult } from "@/components/rounds/round-setup";
import { normalizeEquipmentProfile, USER_REPORTED_PROFILE, type EquipmentProfileV2 } from "@/lib/equipment/equipment-profile";
import { resolveBySlug } from "@/lib/manual/registry";
import { newLotInput } from "@/lib/rounds/round-adapter";
import { getEquipmentRepository } from "@/lib/repositories/equipment-repository-factory";
import { getExperimentRepository } from "@/lib/repositories/experiment-repository-factory";

function CreateRound() {
  const router = useRouter();
  const params = useSearchParams();
  const slug = params.get("slug") ?? "";
  const { session } = useAuth();
  const ownerId = session.user?.uid ?? "demo-owner";
  const authenticated = session.status === "authenticated";
  const repository = useMemo(() => getExperimentRepository(ownerId, authenticated), [ownerId, authenticated]);
  const equipmentRepository = useMemo(() => getEquipmentRepository(ownerId, authenticated), [ownerId, authenticated]);
  // ตรวจ slug ตอน render ไม่ใช่ใน effect เพราะเป็นค่าที่คำนวณได้จาก props ตรง ๆ
  const manual = resolveBySlug(slug);
  const [profile, setProfile] = useState<EquipmentProfileV2 | null>(null);
  const [loadingFailed, setLoadingFailed] = useState(false);
  const [failed, setFailed] = useState(false);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!manual) return;
    if (!["demo", "authenticated"].includes(session.status)) return;
    let active = true;
    equipmentRepository
      .get(ownerId)
      .then((found) => {
        if (!active) return;
        setProfile(found ? normalizeEquipmentProfile(found) : structuredClone(USER_REPORTED_PROFILE));
      })
      .catch(() => active && setLoadingFailed(true));
    return () => {
      active = false;
    };
  }, [equipmentRepository, manual, ownerId, session.status]);

  async function confirmRound(result: RoundSetupResult) {
    if (!manual) return;
    setCreating(true);
    setFailed(false);
    try {
      await equipmentRepository.save(ownerId, result.profile);
      const startedAt = new Date().toISOString().slice(0, 10);
      const lot = await repository.createLot(ownerId, newLotInput(manual, startedAt, result));
      router.replace(`/my/rounds/${lot.id}`);
    } catch {
      setFailed(true);
    } finally {
      setCreating(false);
    }
  }

  if (!manual) {
    // เดิมข้อความบอกให้ "กลับไปเลือกต้นจากหน้าแรก" แต่ไม่มีลิงก์ให้กด และหน้าแรกก็ไม่มีทางกลับมาที่นี่
    // คนที่เปิด /my/rounds/new เปล่า ๆ จึงติดอยู่ตรงนี้
    return (
      <GuideShell action={<ThemeToggle />}>
        <StatusNotice tone="error" title="ยังไม่ได้บอกว่าจะเพาะต้นอะไร">
          <p style={{ margin: 0 }}>
            หน้านี้ใช้ตั้งค่ารอบของต้นที่เลือกไว้แล้ว ให้เลือกต้นก่อน แล้วกดปุ่ม “เริ่มรอบเพาะของฉัน”
            ที่ท้ายหน้าคู่มือของต้นนั้น
          </p>
          <p style={{ margin: "12px 0 0", display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <Link className="cl-button-primary pl-link" href="/start">เลือกต้นที่จะเพาะ</Link>
            <Link className="pl-link" href="/my/rounds">กลับไปรอบเพาะของฉัน</Link>
          </p>
        </StatusNotice>
      </GuideShell>
    );
  }

  const error = loadingFailed
    ? "โหลดข้อมูลของที่มีไม่สำเร็จ ลองใหม่อีกครั้ง"
    : failed
      ? "สร้างรอบไม่สำเร็จ ลองใหม่อีกครั้ง"
      : "";

  return (
    <GuideShell action={<ThemeToggle />}>
      {error ? (
        <StatusNotice tone="error" title="ดำเนินการไม่สำเร็จ">{error}</StatusNotice>
      ) : profile === null ? (
        <StatusNotice title="กำลังโหลดข้อมูลสารและอุปกรณ์…" />
      ) : creating ? (
        <StatusNotice title="กำลังบันทึกค่าและสร้างรอบ…" />
      ) : (
        <RoundSetup
          profile={profile}
          manual={manual}
          onBack={() => router.push(`/guide/${manual.slug}`)}
          onConfirm={confirmRound}
        />
      )}
    </GuideShell>
  );
}

export default function NewRoundPage() {
  return (
    <AuthGate>
      <Suspense fallback={<GuideShell><p className="pl-lede">กำลังเตรียม…</p></GuideShell>}>
        <CreateRound />
      </Suspense>
    </AuthGate>
  );
}
