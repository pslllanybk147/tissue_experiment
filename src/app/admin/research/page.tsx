"use client";

import { useEffect, useMemo, useState } from "react";
import { AuthGate } from "@/components/auth/auth-gate";
import { useAuth } from "@/components/auth/auth-provider";
import { LabShell } from "@/components/lab/lab-shell";
import { ResearchRegister } from "@/components/research/research-register";
import type { ResearchSource } from "@/lib/domain/models";
import { createDemoLabRepository } from "@/lib/repositories/demo-lab-repository";
import { createFirestoreLabRepository } from "@/lib/firebase/firestore-lab-repository";

export default function ResearchPage() {
  const { session, signOut } = useAuth();
  const ownerId = session.user?.uid ?? "demo-owner";
  const repository = useMemo(() => session.status === "authenticated" ? createFirestoreLabRepository(ownerId) : createDemoLabRepository(), [ownerId, session.status]);
  const [sources, setSources] = useState<ResearchSource[]>([]);
  const [error, setError] = useState(false);
  useEffect(() => { if (session.status !== "authenticated" && session.status !== "demo") return; repository.getSnapshot(ownerId).then(value => setSources(value.research)).catch(() => setError(true)); }, [ownerId, repository, session.status]);
  return <AuthGate><LabShell section="Research" sessionLabel={session.status === "authenticated" ? "FIREBASE" : "DEMO"} onSignOut={() => void signOut()}>
    <header className="route-heading"><div><p className="eyebrow">EVIDENCE BASE</p><h1>Research</h1><p>ทะเบียนหลักฐานแบบอ่านอย่างเดียวสำหรับ release นี้</p></div></header>
    {error ? <div className="route-state error" role="alert">โหลดงานวิจัยไม่ได้</div> : <ResearchRegister sources={sources} />}
  </LabShell></AuthGate>;
}
