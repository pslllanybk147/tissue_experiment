"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { AuthGate } from "@/components/auth/auth-gate";
import { useAuth } from "@/components/auth/auth-provider";
import { LabShell } from "@/components/lab/lab-shell";
import { PhilodendronMonograph } from "@/components/knowledge/philodendron-monograph";
import { monographForTaxon } from "@/lib/domain/philodendron-knowledge";
import type { KnowledgeLibraryRecord } from "@/lib/domain/knowledge-library";
import { getKnowledgeLibraryRepository } from "@/lib/repositories/knowledge-library-repository-factory";

export default function TaxonDetailPage() {
  const { taxonId } = useParams<{ taxonId: string }>();
  const { session, signOut } = useAuth();
  const ownerId = session.user?.uid ?? "demo-owner";
  const authenticated = session.status === "authenticated";
  const repository = useMemo(() => getKnowledgeLibraryRepository(ownerId, authenticated), [authenticated, ownerId]);
  const [record, setRecord] = useState<KnowledgeLibraryRecord | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "missing" | "error">("loading");
  useEffect(() => { if (session.status !== "authenticated" && session.status !== "demo") return; let active = true; repository.get(ownerId, taxonId).then((next) => { if (!active) return; setRecord(next); setState(next ? "ready" : "missing"); }).catch(() => { if (active) setState("error"); }); return () => { active = false; }; }, [ownerId, repository, session.status, taxonId]);
  const monograph = monographForTaxon(taxonId);
  return <AuthGate><LabShell section="Knowledge" sessionLabel={authenticated ? "FIREBASE" : "DEMO"} onSignOut={() => void signOut()}><Link className="route-back" href="/knowledge">← Knowledge Library</Link>{state === "loading" && <p className="route-state" role="status">กำลังโหลด taxon…</p>}{state === "error" && <p className="route-state error" role="alert">โหลด taxon ไม่สำเร็จ</p>}{state === "missing" && <p className="route-state">ไม่พบ taxon นี้</p>}{state === "ready" && record && (monograph ? <PhilodendronMonograph monograph={monograph} /> : <section className="experiment-surface"><p className="eyebrow">TAXON RECORD</p><h1>{record.taxon.displayName}</h1><p>ยังไม่มี monograph ละเอียดสำหรับรายการนี้ แต่สามารถสร้าง Plant Record และใช้ Generic Philodendron fallback ได้</p><Link className="primary-button" href={`/plants/new?taxon=${encodeURIComponent(record.taxon.id)}`}>เริ่ม Plant Record</Link></section>)}</LabShell></AuthGate>;
}
