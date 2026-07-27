"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { AuthGate } from "@/components/auth/auth-gate";
import { useAuth } from "@/components/auth/auth-provider";
import { LabShell } from "@/components/lab/lab-shell";
import { CopyProtocolButton } from "@/components/protocols/copy-protocol-button";
import { ProtocolHistory } from "@/components/protocols/protocol-history";
import type { ProtocolRecord, ProtocolVersion } from "@/lib/domain/models";
import { protocolCompletenessIssues } from "@/lib/domain/protocol-validation";
import { getProtocolRepository } from "@/lib/repositories/protocol-repository-factory";

export default function ProtocolDetailPage() {
  const { protocolId } = useParams<{ protocolId: string }>();
  const { session, signOut } = useAuth();
  const ownerId = session.user?.uid ?? "demo-owner";
  const authenticated = session.status === "authenticated";
  const repository = useMemo(() => getProtocolRepository(ownerId, authenticated), [ownerId, authenticated]);
  const [data, setData] = useState<{ protocol: ProtocolRecord; versions: ProtocolVersion[] } | null>(null);
  const [missing, setMissing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!["demo", "authenticated"].includes(session.status)) return;
    let active = true;
    repository.get(ownerId, protocolId).then((value) => {
      if (!active) return;
      if (!value) setMissing(true);
      else setData(value);
    });
    return () => { active = false; };
  }, [session.status, protocolId, repository, ownerId]);

  const current = data?.versions.find((version) => version.id === data.protocol.currentVersionId);
  const completeness = current ? protocolCompletenessIssues(current.steps) : {};
  const complete = current ? current.steps.length > 0 && Object.keys(completeness).length === 0 : false;

  async function activate() {
    if (!current) return;
    setError("");
    try {
      await repository.activateVersion(ownerId, protocolId, current.id);
      const value = await repository.get(ownerId, protocolId);
      if (value) setData(value);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "เผยแพร่ Protocol ไม่สำเร็จ");
    }
  }

  return (
    <AuthGate>
      <LabShell section="Protocols" sessionLabel={authenticated ? "FIREBASE" : "DEMO"} onSignOut={() => void signOut()}>
        <Link className="route-back" href="/protocols">← Protocols</Link>
        {missing && <div className="route-state">ไม่พบ Protocol</div>}
        {data && current && (
          <>
            <header className="route-heading">
              <div>
                <p className="eyebrow">{data.protocol.status} · {current.version}</p>
                <h1>{data.protocol.title}</h1>
                <p>{data.protocol.plantScope} · {data.protocol.evidenceState}</p>
              </div>
              <div className="route-actions">
                <CopyProtocolButton ownerId={ownerId} authenticated={authenticated} protocol={data.protocol} version={current} />
                <Link className="quiet-button" href={`/protocols/${protocolId}/edit`}>แก้ไข</Link>
                {!current.publishedAt && <button className="primary-button" disabled={!complete} onClick={() => void activate()}>เผยแพร่เวอร์ชัน</button>}
              </div>
            </header>
            {!complete && (
              <section className="protocol-incomplete-warning" role="alert">
                <strong>คู่มือยังไม่สมบูรณ์</strong>
                <p>เวอร์ชันนี้เปิดดูประวัติได้ แต่ห้าม publish หรือใช้เริ่ม Lot ใหม่จนกว่าทุกขั้นจะผ่าน Beginner-Complete Standard</p>
                <ul>
                  {Object.entries(completeness).slice(0, 5).map(([stepId, messages]) => <li key={stepId}>{stepId}: {messages.join(" · ")}</li>)}
                </ul>
              </section>
            )}
            {error && <p className="form-alert" role="alert">{error}</p>}
            <div className="protocol-detail-grid">
              <section className="experiment-surface">
                <p>{current.summary}</p>
                <p className="muted-copy">Sources: {(current.sourceIds ?? []).join(", ") || "ยังไม่มี"} · Claims: {(current.claimIds ?? []).join(", ") || "ยังไม่มี"}</p>
                {current.steps.map((step, index) => (
                  <article className="protocol-reading-step" key={step.id}>
                    <span>{index + 1}</span>
                    <div><h2>{step.title}</h2><p>{step.instruction}</p><small>{step.evidenceState} · refs: {step.referenceIds.join(", ") || "ไม่มี"}</small></div>
                  </article>
                ))}
              </section>
              <aside className="experiment-surface"><h2>Version history</h2><ProtocolHistory versions={data.versions} /></aside>
            </div>
          </>
        )}
      </LabShell>
    </AuthGate>
  );
}
