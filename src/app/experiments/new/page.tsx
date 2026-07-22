"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useRouter } from "next/navigation";

import { AuthGate } from "@/components/auth/auth-gate";
import { useAuth } from "@/components/auth/auth-provider";
import { LotForm } from "@/components/experiments/lot-form";
import { LabShell } from "@/components/lab/lab-shell";
import type { CreateLotInput } from "@/lib/domain/models";
import { getExperimentRepository } from "@/lib/repositories/experiment-repository-factory";

export default function NewExperimentPage() {
  const router = useRouter();
  const { session, signOut } = useAuth();
  const ownerId = session.user?.uid ?? "demo-owner";
  const repository = useMemo(() => getExperimentRepository(ownerId, session.status === "authenticated"), [ownerId, session.status]);
  async function createLot(input: CreateLotInput) { const lot = await repository.createLot(ownerId, input); router.push(`/experiments/${lot.id}`); }

  return <AuthGate><LabShell onSignOut={() => void signOut()} section="Experiments" sessionLabel={session.status === "authenticated" ? "FIREBASE" : "DEMO"}>
    <Link className="route-back" href="/experiments">← กลับไป Experiment Lots</Link>
    <LotForm onSubmit={createLot} />
  </LabShell></AuthGate>;
}
