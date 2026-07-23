import type { KnowledgeSource, SourceClaim } from "@/lib/domain/knowledge-sources";

type Props = { sources: KnowledgeSource[]; claims: SourceClaim[] };
type TimelineItem = { id: string; at: string; title: string; detail: string; state: string };

export function KnowledgeResearchTimeline({ sources, claims }: Props) {
  const items: TimelineItem[] = sources.flatMap(source => [
    { id: `${source.id}-created`, at: source.createdAt, title: "ลงทะเบียน source", detail: source.title, state: "Source" },
    ...(source.updatedAt !== source.createdAt ? [{ id: `${source.id}-updated`, at: source.updatedAt, title: "แก้ไข source metadata", detail: source.title, state: "Source" }] : []),
  ]).concat(claims.flatMap(claim => [
    { id: `${claim.id}-created`, at: claim.createdAt, title: "สร้าง claim draft", detail: claim.statement, state: claim.reviewState },
    ...(claim.reviewedAt ? [{ id: `${claim.id}-reviewed`, at: claim.reviewedAt, title: `ทบทวน claim: ${claim.reviewState}`, detail: claim.statement, state: claim.evidenceState }] : []),
  ])).sort((a, b) => b.at.localeCompare(a.at)).slice(0, 12);

  return <section className="knowledge-timeline" aria-label="Research activity timeline"><div className="knowledge-section-heading"><div><p className="eyebrow">RESEARCH ACTIVITY</p><h2>ประวัติ source และ claim</h2><p>รวมการลงทะเบียน แก้ metadata สร้าง draft และ review ไว้ใน feed เดียว</p></div></div>{!items.length ? <p className="muted-copy">ยังไม่มี activity</p> : <ol>{items.map(item => <li key={item.id}><span className="knowledge-timeline-mark" aria-hidden="true" /><div><div className="knowledge-timeline-top"><strong>{item.title}</strong><span className="badge">{item.state}</span></div><p>{item.detail}</p><time dateTime={item.at}>{new Date(item.at).toLocaleString("th-TH")}</time></div></li>)}</ol>}</section>;
}
