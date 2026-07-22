import type { ResearchSource } from "@/lib/domain/models";

export function ResearchRegister({ sources }: { sources: ResearchSource[] }) {
  if (!sources.length) return <div className="route-state">ยังไม่มีแหล่งงานวิจัย</div>;
  return <div className="research-list">{sources.map((source) => <article className="research-row" key={source.id}>
    <div className="research-copy"><div className="research-title-row"><strong>{source.title}</strong><span className="badge">{source.evidence}</span></div>
      <p>{source.source}</p><small>{source.note}</small></div>
  </article>)}</div>;
}
