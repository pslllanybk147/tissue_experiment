import Link from "next/link";
import { troubleshootingEntries } from "@/lib/manual/troubleshooting";
import { EvidenceBadge } from "./evidence-badge";
import { StatusNotice } from "@/components/common/status-notice";

export function ProblemList({ selected }: { selected: string | undefined }) {
  const entry = selected ? troubleshootingEntries[selected] : undefined;

  if (!entry) {
    return (
      <section className="cl-public-section cl-atlas-reading">
        <header className="cl-page-heading"><div><p className="cl-chapter-kicker">ช่วยวิเคราะห์ปัญหา</p><h1>ตอนนี้เห็นอาการอะไร</h1><p>
          เลือกอาการที่ตรงกับที่เห็นในขวดมากที่สุด อาการบางคู่หน้าตาคล้ายกันแต่แก้คนละทาง
          เราจะช่วยแยกให้หลังจากเลือกแล้ว
        </p></div></header>
        {selected ? (
          <StatusNotice tone="warning" title="ไม่พบอาการที่เลือกไว้">ลองเลือกใหม่จากรายการนี้</StatusNotice>
        ) : null}
        <ul className="cl-choice-list">
          {Object.values(troubleshootingEntries).map((item) => (
            <li key={item.id}>
              <Link
                className="cl-choice-row"
                href={`/problem?symptom=${item.id}`}
              >
                <strong>{item.symptom}</strong>
              </Link>
            </li>
          ))}
        </ul>
        <p className="cl-public-links">
          <Link className="cl-inline-link" href="/problem">เริ่มเลือกใหม่</Link> · <Link className="cl-inline-link" href="/">กลับหน้าแรก</Link>
        </p>
      </section>
    );
  }

  return (
    <article className="cl-guide-article cl-atlas-reading">
      <header className="cl-page-heading"><div><p className="cl-chapter-kicker">ช่วยวิเคราะห์ปัญหา</p><h1>{entry.symptom}</h1></div></header>

      <section className="cl-reading-section"><h2>น่าจะเกิดจาก</h2><p>{entry.likelyCause}</p></section>

      {entry.distinguish ? (
        <section className="cl-reading-section"><h2>แยกจากอาการที่คล้ายกันยังไง</h2><p>{entry.distinguish}</p></section>
      ) : null}

      <section className="cl-reading-section"><h2>สิ่งที่ต้องทำ</h2>
      <ol className="cl-instruction-list">
        {entry.actions.map((action) => (
          <li key={action}>{action}</li>
        ))}
      </ol>
      </section>

      <aside className="cl-guide-evidence-aside" aria-labelledby="problem-evidence-heading">
        <h2 id="problem-evidence-heading">ที่มาของคำแนะนำนี้</h2>
        <p><EvidenceBadge level={entry.evidence.level} /></p>
        {entry.evidence.note ? <p className="cl-support-copy">{entry.evidence.note}</p> : null}
      </aside>

      <p className="cl-support-copy">
        ไม่รู้จักสารที่เขียนไว้ข้างบน? <Link className="cl-inline-link" href="/substances">ดูว่าคืออะไรและซื้อที่ไหน</Link>
      </p>

      <p className="cl-support-copy">
        ไม่ตรงกับที่เห็น? <Link className="cl-inline-link" href="/problem">เลือกอาการใหม่</Link>
      </p>
    </article>
  );
}
