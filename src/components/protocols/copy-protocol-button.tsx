"use client";

import { useRouter } from "next/navigation";
import type { ProtocolRecord, ProtocolVersion } from "@/lib/domain/models";
import { getProtocolRepository } from "@/lib/repositories/protocol-repository-factory";

export function CopyProtocolButton({ ownerId, authenticated, protocol, version }: { ownerId: string; authenticated: boolean; protocol: ProtocolRecord; version: ProtocolVersion }) {
  const router = useRouter();
  async function copy() {
    const repository = getProtocolRepository(ownerId, authenticated);
    const draft = await repository.createDraft(ownerId, { title: `${protocol.title} · Copy`, plantScope: protocol.plantScope, evidenceState: "Pending review", summary: version.summary, changeNote: `คัดลอกจาก ${version.version}`, steps: structuredClone(version.steps), claimIds: structuredClone(version.claimIds), sourceIds: structuredClone(version.sourceIds) });
    router.push(`/protocols/${draft.id}/edit`);
  }
  return <button className="quiet-button" onClick={() => void copy()} type="button">คัดลอกเป็น Draft</button>;
}
