import type { ProtocolVersion } from "@/lib/domain/models";

export function ProtocolHistory({ versions }: { versions: ProtocolVersion[] }) {
  const ordered = versions.slice().sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  const latest = ordered.at(-1);
  const previous = ordered.at(-2);
  const changedSteps = latest && previous ? latest.steps.filter((step, index) => { const prior = previous.steps[index]; return !prior || prior.title !== step.title || prior.instruction !== step.instruction || prior.evidenceState !== step.evidenceState || prior.referenceIds.join(",") !== step.referenceIds.join(","); }).length : 0;
  return <><ol className="protocol-history">{versions.map(version => <li key={version.id}><strong>{version.version}</strong><span>{version.publishedAt ? "เผยแพร่แล้ว · แก้ไขไม่ได้" : "ร่าง"}</span><small>{version.changeNote || "ไม่มีบันทึกการเปลี่ยนแปลง"}</small></li>)}</ol>{latest && previous && <section className="protocol-version-compare" aria-label="Version compare"><p className="eyebrow">VERSION COMPARE</p><h3>{previous.version} → {latest.version}</h3><p>{changedSteps} ขั้นเปลี่ยนแปลง · source {latest.sourceIds?.length ?? 0} รายการ · claim {latest.claimIds?.length ?? 0} รายการ</p>{changedSteps === 0 && <small>ไม่พบความแตกต่างในขั้นตอน</small>}</section>}</>;
}
