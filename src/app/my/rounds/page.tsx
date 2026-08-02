"use client";

import { useEffect, useMemo, useState } from "react";
import { AuthGate } from "@/components/auth/auth-gate";
import { useAuth } from "@/components/auth/auth-provider";
import { GuideShell } from "@/components/guide/guide-shell";
import { ThemeToggle } from "@/components/guide/theme-toggle";
import { OnlineStatus } from "@/components/rounds/online-status";
import { RoundList, type RoundSummary } from "@/components/rounds/round-list";
import { resolveBySlug } from "@/lib/manual/registry";
import { getExperimentRepository } from "@/lib/repositories/experiment-repository-factory";
import { getStepRunRepository } from "@/lib/repositories/step-run-repository-factory";

export default function MyRoundsPage() {
  const { session } = useAuth();
  const ownerId = session.user?.uid ?? "demo-owner";
  const authenticated = session.status === "authenticated";
  const repository = useMemo(() => getExperimentRepository(ownerId, authenticated), [ownerId, authenticated]);
  const stepRuns = useMemo(() => getStepRunRepository(ownerId, authenticated), [ownerId, authenticated]);
  const [rounds, setRounds] = useState<RoundSummary[] | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!["demo", "authenticated"].includes(session.status)) return;
    let active = true;

    async function load() {
      const lots = (await repository.listLots(ownerId)).filter((lot) => resolveBySlug(lot.protocolId) !== null);
      const summaries = await Promise.all(lots.map(async (lot) => {
        const manual = resolveBySlug(lot.protocolId)!;
        const runs = await stepRuns.list(ownerId, lot.id);
        const known = new Set(manual.steps.map((step) => step.id));
        return {
          lotId: lot.id,
          slug: lot.protocolId,
          title: lot.plant,
          startedAt: lot.startedAt,
          passedCount: runs.filter((run) => run.status === "Passed" && known.has(run.stepId)).length,
          stepCount: manual.steps.length,
        };
      }));
      if (active) setRounds(summaries);
    }

    load().catch(() => active && setFailed(true));
    return () => {
      active = false;
    };
  }, [ownerId, repository, stepRuns, session.status]);

  return (
    <AuthGate>
      <GuideShell action={<ThemeToggle />}>
        <OnlineStatus />
        <h1 className="pl-h1">รอบเพาะของฉัน</h1>
        <p className="pl-lede" style={{ marginBottom: "22px" }}>ทุกรอบที่เริ่มไว้ พร้อมความคืบหน้าของแต่ละรอบ</p>
        {failed ? (
          <p className="pl-card" role="alert" style={{ background: "var(--pl-stop)" }}>
            โหลดรายการรอบไม่สำเร็จ ลองรีเฟรชหน้านี้อีกครั้ง
          </p>
        ) : null}
        {rounds === null && !failed ? <p className="pl-lede" role="status">กำลังโหลด…</p> : null}
        {rounds !== null ? <RoundList rounds={rounds} /> : null}
      </GuideShell>
    </AuthGate>
  );
}
