import type { ResearchSource } from "@/lib/domain/models";

export function ResearchRegister({ sources }: { sources: ResearchSource[] }) {
  if (!sources.length) return <div className="cl-empty-state">ยังไม่มีแหล่งงานวิจัย</div>;
  return <div className="cl-reference-list cl-atlas-data-list">{sources.map((source) => <article className="cl-readiness-item" key={source.id}>
    <div className="research-copy"><div className="research-title-row"><strong>{source.title}</strong><span className="badge">{source.evidence}</span></div>
      <p>{source.source}</p><small>{source.note}</small>
      {source.url
        ? <a className="research-source-link" href={source.url} rel="noreferrer" target="_blank">เปิดแหล่งอ้างอิง ↗</a>
        : <span className="muted-copy">ยังไม่มี URL ในทะเบียน — ต้องตรวจ source เพิ่ม</span>}
    </div>
  </article>)}</div>;
}
