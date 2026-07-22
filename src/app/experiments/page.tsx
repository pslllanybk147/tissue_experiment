"use client";

import { useEffect, useMemo, useState } from "react";

import { AuthGate } from "@/components/auth/auth-gate";
import { useAuth } from "@/components/auth/auth-provider";
import { ExperimentList } from "@/components/experiments/experiment-list";
import { LabShell } from "@/components/lab/lab-shell";
import type { ExperimentLot } from "@/lib/domain/models";
import { getExperimentRepository } from "@/lib/repositories/experiment-repository-factory";

export default function ExperimentsPage() {
  const { session, signOut } = useAuth();
  const ownerId = session.user?.uid ?? "demo-owner";
  const repository = useMemo(() => getExperimentRepository(ownerId, session.status === "authenticated"), [ownerId, session.status]);
  const [lots, setLots] = useState<ExperimentLot[]>([]);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    if (session.status !== "authenticated" && session.status !== "demo") return;
    let active = true;
    repository.listLots(ownerId).then((items) => { if (active) { setLots(items); setState("ready"); } }).catch(() => active && setState("error"));
    return () => { active = false; };
  }, [ownerId, repository, session.status]);

  return <AuthGate><LabShell onSignOut={() => void signOut()} section="Experiments" sessionLabel={session.status === "authenticated" ? "FIREBASE" : "DEMO"}>
    <header className="route-heading"><div><p className="eyebrow">RESEARCH OPERATIONS</p><h1>Experiments</h1><p>ติดตามล็อต ขั้นตอน และสถานะการเพาะเลี้ยงในพื้นที่เดียว</p></div></header>
    {state === "loading" && <div className="route-state" role="status">กำลังโหลด Experiment Lots…</div>}
    {state === "error" && <div className="route-state error" role="alert">โหลดข้อมูลไม่ได้ กรุณาตรวจการเชื่อมต่อ Firestore</div>}
    {state === "ready" && <ExperimentList lots={lots} />}
  </LabShell></AuthGate>;
}
