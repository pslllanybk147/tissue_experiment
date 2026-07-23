"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { AuthGate } from "@/components/auth/auth-gate";
import { useAuth } from "@/components/auth/auth-provider";
import { LotForm, type ProtocolOption } from "@/components/experiments/lot-form";
import { LabShell } from "@/components/lab/lab-shell";
import type { CreateLotInput } from "@/lib/domain/models";
import { getExperimentRepository } from "@/lib/repositories/experiment-repository-factory";
import { getProtocolRepository } from "@/lib/repositories/protocol-repository-factory";

export default function NewExperimentPage() {
  const router = useRouter();
  const { session, signOut } = useAuth();
  const ownerId = session.user?.uid ?? "demo-owner";
  const repository = useMemo(() => getExperimentRepository(ownerId, session.status === "authenticated"), [ownerId, session.status]);
  const protocolRepository = useMemo(() => getProtocolRepository(ownerId, session.status === "authenticated"), [ownerId, session.status]);
  const [protocolOptions, setProtocolOptions] = useState<ProtocolOption[]>([]);
  const [protocolsLoaded, setProtocolsLoaded] = useState(false);
  useEffect(() => {
    let active = true;
    protocolRepository.list(ownerId).then(async (records) => {
      const snapshots = await Promise.all(records.filter((record) => record.status === "Active").map((record) => protocolRepository.get(ownerId, record.id)));
      if (!active) return;
      setProtocolOptions(snapshots.flatMap((snapshot) => {
        if (!snapshot) return [];
        const version = snapshot.versions.find((item) => item.id === snapshot.protocol.currentVersionId);
        return version ? [{ id: snapshot.protocol.id, title: snapshot.protocol.title, versionId: version.id, version: version.version }] : [];
      }));
      setProtocolsLoaded(true);
    }).catch(() => { if (active) { setProtocolOptions([]); setProtocolsLoaded(true); } });
    return () => { active = false; };
  }, [ownerId, protocolRepository]);
  async function createLot(input: CreateLotInput) { const lot = await repository.createLot(ownerId, input); router.push(`/experiments/${lot.id}`); }

  return <AuthGate><LabShell onSignOut={() => void signOut()} section="Experiments" sessionLabel={session.status === "authenticated" ? "FIREBASE" : "DEMO"}>
    <Link className="route-back" href="/experiments">← กลับไป Experiment Lots</Link>
    {protocolsLoaded ? <LotForm onSubmit={createLot} protocolOptions={protocolOptions} /> : <p className="route-loading" role="status">กำลังโหลด Protocol…</p>}
  </LabShell></AuthGate>;
}
