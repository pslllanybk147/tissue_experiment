import type { ProtocolVersion } from "@/lib/domain/models";

export function ProtocolHistory({ versions }: { versions: ProtocolVersion[] }) {
  return <ol className="protocol-history">{versions.map(version => <li key={version.id}><strong>{version.version}</strong><span>{version.publishedAt ? "เผยแพร่แล้ว · แก้ไขไม่ได้" : "ร่าง"}</span><small>{version.changeNote || "ไม่มีบันทึกการเปลี่ยนแปลง"}</small></li>)}</ol>;
}
