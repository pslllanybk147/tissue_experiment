"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { AuthGate } from "@/components/auth/auth-gate";
import { useAuth } from "@/components/auth/auth-provider";
import { KnowledgeSourceDetail } from "@/components/knowledge/knowledge-source-detail";
import { LabShell } from "@/components/lab/lab-shell";
import type { KnowledgeSource, SourceClaim } from "@/lib/domain/knowledge-sources";
import type { KnowledgeSourceInput } from "@/lib/repositories/knowledge-source-repository";
import { getKnowledgeSourceRepository } from "@/lib/repositories/knowledge-source-repository-factory";

export default function KnowledgeSourceDetailPage() {
  const { sourceId } = useParams<{ sourceId: string }>();
  const { session, signOut } = useAuth();
  const ownerId = session.user?.uid ?? "demo-owner";
  const authenticated = session.status === "authenticated";
  const repository = useMemo(() => getKnowledgeSourceRepository(ownerId, authenticated), [authenticated, ownerId]);
  const [source, setSource] = useState<KnowledgeSource | null>(null);
  const [claims, setClaims] = useState<SourceClaim[]>([]);
  const [audits, setAudits] = useState<import("@/lib/domain/knowledge-sources").KnowledgeSourceAuditEvent[]>([]);
  const [state, setState] = useState<"loading" | "ready" | "missing" | "error">("loading");
  const reportLoadError = useCallback(() => setState("error"), []);

  const load = useCallback(async () => {
    const [sources, nextClaims, nextAudits] = await Promise.all([repository.listSources(ownerId), repository.listClaims(ownerId), repository.listSourceAuditEvents(ownerId, sourceId)]);
    const current = sources.find(item => item.id === sourceId) ?? null;
    setSource(current);
    setClaims(nextClaims.filter(item => item.sourceId === sourceId));
    setAudits(nextAudits);
    setState(current ? "ready" : "missing");
  }, [ownerId, repository, sourceId]);

  // The effect synchronizes the async repository result into the page state; the cleanup prevents stale requests from updating the view.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { if (session.status !== "authenticated" && session.status !== "demo") return; let active = true; load().catch(() => { if (active) reportLoadError(); }); return () => { active = false; }; }, [load, reportLoadError, session.status]);

  async function updateSource(input: KnowledgeSourceInput) {
    await repository.updateSource(ownerId, sourceId, input);
    await load();
  }

  return <AuthGate><LabShell section="Knowledge" sessionLabel={authenticated ? "FIREBASE" : "DEMO"} onSignOut={() => void signOut()}><header className="route-heading"><div><p className="eyebrow">KNOWLEDGE LIBRARY / SOURCE</p><h1>Source detail</h1><p>ตรวจ metadata และย้อนดู claim ที่อ้างอิง source เดียวกัน</p></div></header>{state === "loading" && <p className="route-state" role="status">กำลังโหลด source…</p>}{state === "missing" && <p className="route-state" role="alert">ไม่พบ source นี้ หรือ source ไม่อยู่ในบัญชีของคุณ</p>}{state === "error" && <p className="route-state error" role="alert">โหลด source ไม่สำเร็จ</p>}{state === "ready" && source && <KnowledgeSourceDetail source={source} claims={claims} audits={audits} updateSource={updateSource} />}</LabShell></AuthGate>;
}
