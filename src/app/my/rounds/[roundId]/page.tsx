"use client";

import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { AuthGate } from "@/components/auth/auth-gate";
import { useAuth } from "@/components/auth/auth-provider";
import { GuideShell } from "@/components/guide/guide-shell";
import { ThemeToggle } from "@/components/guide/theme-toggle";
import { OnlineStatus } from "@/components/rounds/online-status";
import { RoundProgress } from "@/components/rounds/round-progress";
import { resolveBySlug } from "@/lib/manual/registry";
import { buildRoundView, type RoundView } from "@/lib/rounds/round-adapter";
import { getExperimentRepository } from "@/lib/repositories/experiment-repository-factory";
import { getStepRunRepository } from "@/lib/repositories/step-run-repository-factory";

export default function RoundPage() {
  const { roundId } = useParams<{ roundId: string }>();
  const { session } = useAuth();
  const ownerId = session.user?.uid ?? "demo-owner";
  const authenticated = session.status === "authenticated";
  const lots = useMemo(() => getExperimentRepository(ownerId, authenticated), [ownerId, authenticated]);
  const runs = useMemo(() => getStepRunRepository(ownerId, authenticated), [ownerId, authenticated]);
  const [view, setView] = useState<RoundView | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!["demo", "authenticated"].includes(session.status)) return;
    let active = true;

    async function load() {
      const lot = await lots.getLot(ownerId, roundId);
      if (!lot) {
        if (active) setMessage("ไม่พบรอบนี้ อาจถูกลบไปแล้ว");
        return;
      }
      const manual = resolveBySlug(lot.protocolId);
      if (!manual) {
        if (active) setMessage("รอบนี้อ้างคู่มือที่ไม่มีในระบบแล้ว");
        return;
      }
      const stepRuns = await runs.list(ownerId, roundId);
      if (active) setView(buildRoundView(lot, stepRuns, manual));
    }

    load().catch(() => active && setMessage("โหลดรอบไม่สำเร็จ ลองรีเฟรชอีกครั้ง"));
    return () => {
      active = false;
    };
  }, [lots, ownerId, roundId, runs, session.status]);

  return (
    <AuthGate>
      <GuideShell action={<ThemeToggle />}>
        <OnlineStatus />
        {message ? (
          <p className="pl-card" role="alert" style={{ background: "var(--pl-stop)" }}>{message}</p>
        ) : null}
        {!view && !message ? <p className="pl-lede" role="status">กำลังโหลด…</p> : null}
        {view ? <RoundProgress view={view} /> : null}
      </GuideShell>
    </AuthGate>
  );
}
