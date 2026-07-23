"use client";

import { useEffect, useMemo, useState } from "react";
import { AuthGate } from "@/components/auth/auth-gate";
import { useAuth } from "@/components/auth/auth-provider";
import { KnowledgeLibrary } from "@/components/knowledge/knowledge-library";
import { KnowledgeSourceRegister } from "@/components/knowledge/knowledge-source-register";
import { LabShell } from "@/components/lab/lab-shell";
import type { KnowledgeLibraryRecord } from "@/lib/domain/knowledge-library";
import type { KnowledgeSource, SourceClaim } from "@/lib/domain/knowledge-sources";
import { getKnowledgeLibraryRepository } from "@/lib/repositories/knowledge-library-repository-factory";
import { getKnowledgeSourceRepository } from "@/lib/repositories/knowledge-source-repository-factory";

export default function KnowledgePage() {
  const { session, signOut } = useAuth();
  const ownerId = session.user?.uid ?? "demo-owner";
  const authenticated = session.status === "authenticated";
  const repository = useMemo(() => getKnowledgeLibraryRepository(ownerId, authenticated), [authenticated, ownerId]);
  const sourceRepository = useMemo(() => getKnowledgeSourceRepository(ownerId, authenticated), [authenticated, ownerId]);
  const [records, setRecords] = useState<KnowledgeLibraryRecord[]>([]);
  const [sources, setSources] = useState<KnowledgeSource[]>([]);
  const [claims, setClaims] = useState<SourceClaim[]>([]);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  useEffect(() => { if (session.status !== "authenticated" && session.status !== "demo") return; let active = true; Promise.all([repository.list(ownerId), sourceRepository.listSources(ownerId), sourceRepository.listClaims(ownerId)]).then(([nextRecords, nextSources, nextClaims]) => { if (active) { setRecords(nextRecords); setSources(nextSources); setClaims(nextClaims); setState("ready"); } }).catch(() => { if (active) setState("error"); }); return () => { active = false; }; }, [ownerId, repository, session.status, sourceRepository]);
  async function refreshSources() { setSources(await sourceRepository.listSources(ownerId)); setClaims(await sourceRepository.listClaims(ownerId)); }
  async function createSource(input: Omit<KnowledgeSource, "id" | "ownerId" | "createdAt" | "updatedAt">) { await sourceRepository.createSource(ownerId, input); await refreshSources(); }
  async function createClaim(input: Omit<SourceClaim, "id" | "ownerId" | "createdAt" | "updatedAt" | "reviewState" | "reviewerNote" | "reviewedBy" | "reviewedAt">) { await sourceRepository.createClaim(ownerId, input); await refreshSources(); }
  async function reviewClaim(id: string, reviewState: "Approved" | "Rejected", note: string) { await sourceRepository.reviewClaim(ownerId, id, reviewState, note); await refreshSources(); }
  return <AuthGate><LabShell section="Knowledge" sessionLabel={authenticated ? "FIREBASE" : "DEMO"} onSignOut={() => void signOut()}><header className="route-heading"><div><p className="eyebrow">PLANT KNOWLEDGE LIBRARY</p><h1>Knowledge Library</h1><p>ค้น taxonomy, evidence และ tissue-culture playbook จากชนิดพืชที่ยืนยันแล้ว</p></div></header>{state === "loading" && <p className="route-state" role="status">กำลังโหลด taxonomy…</p>}{state === "error" && <p className="route-state error" role="alert">โหลด Knowledge Library ไม่สำเร็จ</p>}{state === "ready" && <><KnowledgeLibrary records={records} /><KnowledgeSourceRegister records={records} sources={sources} claims={claims} onCreateSource={createSource} onCreateClaim={createClaim} onReviewClaim={reviewClaim} /></>}</LabShell></AuthGate>;
}
