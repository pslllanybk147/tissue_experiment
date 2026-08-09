"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { AuthGate } from "@/components/auth/auth-gate";
import { useAuth } from "@/components/auth/auth-provider";
import { GuideShell } from "@/components/guide/guide-shell";
import { ThemeToggle } from "@/components/guide/theme-toggle";
import type { Observation } from "@/lib/domain/models";
import { NADCC_VS_HAITER_TRIAL_CAVEAT } from "@/lib/trials/nadcc-vs-haiter-trial";
import { buildTrialOverview, type TrialArmSummary } from "@/lib/trials/trial-overview";
import { getExperimentRepository } from "@/lib/repositories/experiment-repository-factory";

function TrialArmCard({ arm }: { arm: TrialArmSummary }) {
  return (
    <li>
      <Link
        className="pl-card pl-link"
        href={`/my/rounds/${arm.lotId}`}
        style={{ display: "block", color: "inherit", textDecoration: "none" }}
      >
        <p className="pl-h2">{arm.armLabel}</p>
        <p className="pl-meta" style={{ marginTop: "4px" }}>{arm.methodLabel}</p>
        <p className="pl-mono" style={{ marginTop: "10px" }}>ขั้นปัจจุบัน: {arm.stage} · สถานะ: {arm.status}</p>
        {arm.latestObservationNote ? (
          <p className="pl-lede" style={{ marginTop: "8px" }}>
            บันทึกล่าสุด{arm.latestObservationAt ? ` (${arm.latestObservationAt.slice(0, 10)})` : ""}: {arm.latestObservationNote}
          </p>
        ) : (
          <p className="pl-meta" style={{ marginTop: "8px" }}>ยังไม่มีบันทึก</p>
        )}
      </Link>
    </li>
  );
}

function TrialOverview() {
  const { trialId } = useParams<{ trialId: string }>();
  const { session } = useAuth();
  const ownerId = session.user?.uid ?? "demo-owner";
  const authenticated = session.status === "authenticated";
  const repository = useMemo(() => getExperimentRepository(ownerId, authenticated), [ownerId, authenticated]);
  const [arms, setArms] = useState<TrialArmSummary[] | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!["demo", "authenticated"].includes(session.status)) return;
    let active = true;

    async function load() {
      const allLots = await repository.listLots(ownerId);
      const trialLots = allLots.filter((lot) => lot.trialId === trialId);
      if (trialLots.length === 0) {
        if (active) setMessage("ไม่พบชุดทดลองนี้ อาจถูกลบไปแล้ว");
        return;
      }
      const observationsByLotId = new Map<string, Observation[]>();
      await Promise.all(
        trialLots.map(async (lot) => {
          const observations = await repository.listObservations(ownerId, lot.id);
          observationsByLotId.set(lot.id, observations);
        }),
      );
      if (active) setArms(buildTrialOverview(trialLots, observationsByLotId));
    }

    load().catch(() => active && setMessage("โหลดชุดทดลองไม่สำเร็จ ลองรีเฟรชอีกครั้ง"));
    return () => {
      active = false;
    };
  }, [ownerId, repository, session.status, trialId]);

  return (
    <GuideShell action={<ThemeToggle />}>
      <h1 className="pl-h1">ชุดทดลอง NaDCC เทียบ Haiter</h1>
      <p className="pl-meta" style={{ marginTop: "10px" }}>{NADCC_VS_HAITER_TRIAL_CAVEAT}</p>

      {message ? (
        <p className="pl-card" role="alert" style={{ background: "var(--pl-stop)", marginTop: "14px" }}>{message}</p>
      ) : null}
      {arms === null && !message ? <p className="pl-lede" role="status" style={{ marginTop: "14px" }}>กำลังโหลด…</p> : null}

      {arms ? (
        <ul style={{ listStyle: "none", margin: "18px 0 0", padding: 0, display: "flex", flexDirection: "column", gap: "12px" }}>
          {arms.map((arm) => <TrialArmCard key={arm.lotId} arm={arm} />)}
        </ul>
      ) : null}
    </GuideShell>
  );
}

export default function TrialPage() {
  return (
    <AuthGate>
      <TrialOverview />
    </AuthGate>
  );
}
