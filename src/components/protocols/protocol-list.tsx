import Link from "next/link";
import type { ProtocolRecord } from "@/lib/domain/models";

export function ProtocolList({ protocols }: { protocols: ProtocolRecord[] }) {
  if (!protocols.length) return <div className="route-state">ยังไม่มี Protocol — เริ่มสร้างฉบับแรกได้เลย</div>;
  return <div className="protocol-list">{protocols.map(item => <Link className="protocol-row" href={`/protocols/${item.id}`} key={item.id}>
    <span><strong>{item.title}</strong><small>{item.plantScope}</small></span>
    <span className="badge">{item.evidenceState}</span><span className="badge">{item.status}</span>
  </Link>)}</div>;
}
