"use client";

import { useEffect, useMemo, useState } from "react";
import { AuthGate } from "@/components/auth/auth-gate";
import { useAuth } from "@/components/auth/auth-provider";
import { KnowledgeLibrary } from "@/components/knowledge/knowledge-library";
import { LabShell } from "@/components/lab/lab-shell";
import type { KnowledgeLibraryRecord } from "@/lib/domain/knowledge-library";
import { getKnowledgeLibraryRepository } from "@/lib/repositories/knowledge-library-repository-factory";

export default function KnowledgePage() {
  const { session, signOut } = useAuth();
  const ownerId = session.user?.uid ?? "demo-owner";
  const authenticated = session.status === "authenticated";
  const repository = useMemo(() => getKnowledgeLibraryRepository(ownerId, authenticated), [authenticated, ownerId]);
  const [records, setRecords] = useState<KnowledgeLibraryRecord[]>([]);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  useEffect(() => { if (session.status !== "authenticated" && session.status !== "demo") return; let active = true; repository.list(ownerId).then(value => { if (active) { setRecords(value); setState("ready"); } }).catch(() => { if (active) setState("error"); }); return () => { active = false; }; }, [ownerId, repository, session.status]);
  return <AuthGate><LabShell section="Knowledge" sessionLabel={authenticated ? "FIREBASE" : "DEMO"} onSignOut={() => void signOut()}><header className="route-heading"><div><p className="eyebrow">PLANT KNOWLEDGE LIBRARY</p><h1>Knowledge Library</h1><p>ค้น taxonomy, evidence และ tissue-culture playbook จากชนิดพืชที่ยืนยันแล้ว</p></div></header>{state === "loading" && <p className="route-state" role="status">กำลังโหลด taxonomy…</p>}{state === "error" && <p className="route-state error" role="alert">โหลด Knowledge Library ไม่สำเร็จ</p>}{state === "ready" && <KnowledgeLibrary records={records} />}</LabShell></AuthGate>;
}
