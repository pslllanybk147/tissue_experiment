"use client";

import { useParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AuthGate } from "@/components/auth/auth-gate";
import { useAuth } from "@/components/auth/auth-provider";
import { GuideShell } from "@/components/guide/guide-shell";
import { ThemeToggle } from "@/components/guide/theme-toggle";
import { StepRunner, type StepSaveInput } from "@/components/rounds/step-runner";
import { resolveBySlug } from "@/lib/manual/registry";
import { buildRoundView, MANUAL_VERSION_ID, type RoundView } from "@/lib/rounds/round-adapter";
import { getExperimentRepository } from "@/lib/repositories/experiment-repository-factory";
import { getStepRunRepository } from "@/lib/repositories/step-run-repository-factory";

export default function RoundStepPage() {
  const { roundId, step } = useParams<{ roundId: string; step: string }>();
  const { session } = useAuth();
  const ownerId = session.user?.uid ?? "demo-owner";
  const authenticated = session.status === "authenticated";
  const lots = useMemo(() => getExperimentRepository(ownerId, authenticated), [ownerId, authenticated]);
  const runs = useMemo(() => getStepRunRepository(ownerId, authenticated), [ownerId, authenticated]);
  const [view, setView] = useState<RoundView | null>(null);
  const [message, setMessage] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

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

    load().catch(() => active && setMessage("โหลดขั้นตอนไม่สำเร็จ ลองรีเฟรชอีกครั้ง"));
    return () => {
      active = false;
    };
  }, [lots, ownerId, reloadKey, roundId, runs, session.status]);

  const number = Number(step);
  const current = view && Number.isInteger(number) && number >= 1 && number <= view.steps.length
    ? view.steps[number - 1]
    : null;

  const save = useCallback(async (input: StepSaveInput) => {
    if (!view || !current) return;
    await runs.save(ownerId, {
      lotId: view.lotId,
      protocolId: view.slug,
      versionId: MANUAL_VERSION_ID,
      stepId: current.id,
      status: input.status,
      note: input.note,
      measurements: input.measurements,
      mediaIds: [],
      observedAt: new Date().toISOString(),
      completionMode: "live",
    });
    setReloadKey((key) => key + 1);
  }, [current, ownerId, runs, view]);

  return (
    <AuthGate>
      <GuideShell action={<ThemeToggle />}>
        {message ? (
          <p className="pl-card" role="alert" style={{ background: "var(--pl-stop)" }}>{message}</p>
        ) : null}
        {!view && !message ? <p className="pl-lede" role="status">กำลังโหลด…</p> : null}
        {view && !current ? (
          <p className="pl-card" role="alert" style={{ background: "var(--pl-stop)" }}>
            ไม่มีขั้นที่ {step} ในคู่มือนี้
          </p>
        ) : null}
        {view && current ? <StepRunner view={view} step={current} onSave={save} /> : null}
      </GuideShell>
    </AuthGate>
  );
}
