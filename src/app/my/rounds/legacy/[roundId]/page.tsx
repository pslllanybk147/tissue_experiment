"use client";

import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { AuthGate } from "@/components/auth/auth-gate";
import { useAuth } from "@/components/auth/auth-provider";
import { GuideShell } from "@/components/guide/guide-shell";
import { ThemeToggle } from "@/components/guide/theme-toggle";
import { LegacyRoundView } from "@/components/rounds/legacy-round-view";
import { OnlineStatus } from "@/components/rounds/online-status";
import type { ExperimentLot, Observation, ProtocolStepRun } from "@/lib/domain/models";
import { getExperimentRepository } from "@/lib/repositories/experiment-repository-factory";
import { getStepRunRepository } from "@/lib/repositories/step-run-repository-factory";

export default function LegacyRoundPage() {
  const { roundId } = useParams<{ roundId: string }>();
  const { session } = useAuth();
  const ownerId = session.user?.uid ?? "demo-owner";
  const authenticated = session.status === "authenticated";
  const lots = useMemo(() => getExperimentRepository(ownerId, authenticated), [ownerId, authenticated]);
  const stepRuns = useMemo(() => getStepRunRepository(ownerId, authenticated), [ownerId, authenticated]);
  const [lot, setLot] = useState<ExperimentLot | null>(null);
  const [observations, setObservations] = useState<Observation[]>([]);
  const [runs, setRuns] = useState<ProtocolStepRun[]>([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!["demo", "authenticated"].includes(session.status)) return;
    let active = true;

    async function load() {
      const found = await lots.getLot(ownerId, roundId);
      if (!found) {
        if (active) setMessage("ไม่พบรอบนี้ อาจถูกลบไปแล้ว");
        return;
      }
      const [obs, srs] = await Promise.all([
        lots.listObservations(ownerId, roundId),
        stepRuns.list(ownerId, roundId),
      ]);
      if (!active) return;
      setLot(found);
      setObservations(obs);
      setRuns(srs);
    }

    load().catch(() => active && setMessage("โหลดรอบเก่าไม่สำเร็จ ลองรีเฟรชอีกครั้ง"));
    return () => {
      active = false;
    };
  }, [lots, ownerId, roundId, session.status, stepRuns]);

  return (
    <AuthGate>
      <GuideShell action={<ThemeToggle />}>
        <OnlineStatus />
        {message ? (
          <p className="pl-card" role="alert" style={{ background: "var(--pl-stop)" }}>{message}</p>
        ) : null}
        {!lot && !message ? <p className="pl-lede" role="status">กำลังโหลด…</p> : null}
        {lot ? <LegacyRoundView lot={lot} observations={observations} runs={runs} /> : null}
      </GuideShell>
    </AuthGate>
  );
}
