"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { AuthGate } from "@/components/auth/auth-gate";
import { useAuth } from "@/components/auth/auth-provider";
import { GuideShell } from "@/components/guide/guide-shell";
import { ThemeToggle } from "@/components/guide/theme-toggle";
import { resolveBySlug } from "@/lib/manual/registry";
import { newLotInput } from "@/lib/rounds/round-adapter";
import { getExperimentRepository } from "@/lib/repositories/experiment-repository-factory";

function CreateRound() {
  const router = useRouter();
  const params = useSearchParams();
  const slug = params.get("slug") ?? "";
  const { session } = useAuth();
  const ownerId = session.user?.uid ?? "demo-owner";
  const authenticated = session.status === "authenticated";
  const repository = useMemo(() => getExperimentRepository(ownerId, authenticated), [ownerId, authenticated]);
  // ตรวจ slug ตอน render ไม่ใช่ใน effect เพราะเป็นค่าที่คำนวณได้จาก props ตรง ๆ
  const manual = resolveBySlug(slug);
  const [failed, setFailed] = useState(false);
  // สร้างรอบได้ครั้งเดียวต่อการเข้าหน้านี้ ป้องกันการสร้างซ้ำเมื่อ effect ถูกเรียกสองรอบ
  const started = useRef(false);

  useEffect(() => {
    if (!manual) return;
    if (!["demo", "authenticated"].includes(session.status)) return;
    if (started.current) return;
    started.current = true;
    const startedAt = new Date().toISOString().slice(0, 10);
    repository
      .createLot(ownerId, newLotInput(manual, startedAt))
      .then((lot) => router.replace(`/my/rounds/${lot.id}`))
      .catch(() => setFailed(true));
  }, [manual, ownerId, repository, router, session.status]);

  const error = !manual
    ? "ไม่รู้จักคู่มือที่ขอ กลับไปเลือกต้นจากหน้าแรกอีกครั้ง"
    : failed
      ? "สร้างรอบไม่สำเร็จ ลองใหม่อีกครั้ง"
      : "";

  return (
    <GuideShell action={<ThemeToggle />}>
      {error ? (
        <p className="pl-card" role="alert" style={{ background: "var(--pl-stop)" }}>{error}</p>
      ) : (
        <p className="pl-lede" role="status">กำลังเปิดรอบเพาะให้…</p>
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
