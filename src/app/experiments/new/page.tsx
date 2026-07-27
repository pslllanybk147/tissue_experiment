"use client";

import Link from "next/link";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { AuthGate } from "@/components/auth/auth-gate";
import { useAuth } from "@/components/auth/auth-provider";
import { LotForm, type ProtocolOption } from "@/components/experiments/lot-form";
import { BeginnerLotWizard } from "@/components/experiments/beginner-lot-wizard";
import { LabShell } from "@/components/lab/lab-shell";
import type { CreateLotInput } from "@/lib/domain/models";
import { getExperimentRepository } from "@/lib/repositories/experiment-repository-factory";
import { getProtocolRepository } from "@/lib/repositories/protocol-repository-factory";
import { getPlantRepository } from "@/lib/repositories/plant-repository-factory";
import { protocolTemplates, stepsForTemplate, templateIdForTaxon } from "@/lib/domain/protocol-templates";
import { sterilizationProfiles } from "@/lib/domain/sterilization-profiles";
import { isBeginnerCompleteProtocol } from "@/lib/domain/protocol-validation";

function NewExperimentPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { session, signOut } = useAuth();
  const ownerId = session.user?.uid ?? "demo-owner";
  const repository = useMemo(() => getExperimentRepository(ownerId, session.status === "authenticated"), [ownerId, session.status]);
  const protocolRepository = useMemo(() => getProtocolRepository(ownerId, session.status === "authenticated"), [ownerId, session.status]);
  const plantRepository = useMemo(() => getPlantRepository(ownerId, session.status === "authenticated"), [ownerId, session.status]);
  const [protocolOptions, setProtocolOptions] = useState<ProtocolOption[]>([]);
  const initialPlantId = searchParams.get("plantId") ?? undefined;
  const [initialPlantName, setInitialPlantName] = useState<string | undefined>(() => searchParams.get("plant") ?? undefined);
  const [initialTaxonId, setInitialTaxonId] = useState<string | undefined>(() => searchParams.get("taxon") ?? undefined);
  const [initialTemplateId, setInitialTemplateId] = useState<string | undefined>(() => templateIdForTaxon(searchParams.get("taxon") ?? undefined));
  const [protocolsLoaded, setProtocolsLoaded] = useState(false);
  const [plantLoaded, setPlantLoaded] = useState(() => !initialPlantId);
  const [advancedMode, setAdvancedMode] = useState(false);
  useEffect(() => {
    let active = true;
    protocolRepository.list(ownerId).then(async (records) => {
      const snapshots = await Promise.all(records.filter((record) => record.status === "Active").map((record) => protocolRepository.get(ownerId, record.id)));
      if (!active) return;
      setProtocolOptions(snapshots.flatMap((snapshot) => {
        if (!snapshot) return [];
        const version = snapshot.versions.find((item) => item.id === snapshot.protocol.currentVersionId);
        return version && isBeginnerCompleteProtocol(version.steps)
          ? [{ id: snapshot.protocol.id, title: snapshot.protocol.title, versionId: version.id, version: version.version }]
          : [];
      }));
      setProtocolsLoaded(true);
    }).catch(() => { if (active) { setProtocolOptions([]); setProtocolsLoaded(true); } });
    return () => { active = false; };
  }, [ownerId, protocolRepository]);
  useEffect(() => {
    if (!initialPlantId) return;
    plantRepository.get(ownerId, initialPlantId).then((plant) => {
      if (plant) {
        setInitialPlantName(plant.suspectedSpecies || undefined);
        setInitialTaxonId(plant.taxonId);
        setInitialTemplateId(plant.taxonId ? templateIdForTaxon(plant.taxonId) : plant.suspectedSpecies.toLowerCase().includes("pink") ? "template-pink-princess-nodal" : plant.suspectedSpecies.toLowerCase().includes("violin") ? "template-violin-nodal" : "template-generic-philodendron");
      }
      setPlantLoaded(true);
    }).catch(() => setPlantLoaded(true));
  }, [initialPlantId, ownerId, plantRepository]);
  async function createLot(input: CreateLotInput) {
    let nextInput = input;
    if (input.templateId) {
      const template = protocolTemplates.find((item) => item.id === input.templateId);
      if (template) {
        const draft = await protocolRepository.createDraft(ownerId, { title: template.title, plantScope: template.plantScope, evidenceState: template.evidenceState, summary: template.description, changeNote: "สร้างจาก guided template", steps: stepsForTemplate(template.id) });
        const snapshot = await protocolRepository.get(ownerId, draft.id);
        const version = snapshot?.versions.find((item) => item.id === draft.currentVersionId);
        const active = version ? await protocolRepository.activateVersion(ownerId, draft.id, version.id) : draft;
        nextInput = { ...input, protocolId: active.id, protocolTitle: active.title, protocolVersionId: version?.id, templateId: template.id, method: template.method };
      }
    }
    const lot = await repository.createLot(ownerId, nextInput); router.push(`/experiments/${lot.id}`);
  }

  return <AuthGate><LabShell onSignOut={() => void signOut()} section="Experiments" sessionLabel={session.status === "authenticated" ? "FIREBASE" : "DEMO"}>
    <Link className="route-back" href="/experiments">← กลับไป Experiment Lots</Link>
    {protocolsLoaded && plantLoaded ? advancedMode
      ? <LotForm onSubmit={createLot} protocolOptions={protocolOptions} templates={protocolTemplates} sterilizationProfiles={sterilizationProfiles} initialPlantId={initialPlantId} initialPlantName={initialPlantName} initialTaxonId={initialTaxonId} initialTemplateId={initialTemplateId} />
      : <BeginnerLotWizard onAdvancedMode={() => setAdvancedMode(true)} onSubmit={createLot} protocolOptions={protocolOptions} profiles={sterilizationProfiles} templates={protocolTemplates} initialPlantId={initialPlantId} initialPlantName={initialPlantName} initialTaxonId={initialTaxonId} initialTemplateId={initialTemplateId} />
      : <p className="route-loading" role="status">กำลังเตรียม Plant Record และ Protocol…</p>}
  </LabShell></AuthGate>;
}

export default function NewExperimentPage() {
  return <Suspense fallback={<p className="route-loading" role="status">กำลังอ่านข้อมูลต้นไม้…</p>}><NewExperimentPageContent /></Suspense>;
}
