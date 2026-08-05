import Link from "next/link";
import { troubleshootingEntries } from "@/lib/manual/troubleshooting";
import { EvidenceBadge } from "./evidence-badge";

export function ProblemList({ selected }: { selected: string | undefined }) {
  const entry = selected ? troubleshootingEntries[selected] : undefined;

  if (!entry) {
    return (
      <>
        <h1 className="pl-h1">ตอนนี้เห็นอาการอะไร</h1>
        <p className="pl-lede" style={{ marginBottom: "20px" }}>
          เลือกอาการที่ตรงกับที่เห็นในขวดมากที่สุด อาการบางคู่หน้าตาคล้ายกันแต่แก้คนละทาง
          เราจะช่วยแยกให้หลังจากเลือกแล้ว
        </p>
        {selected ? (
          <p className="pl-meta" style={{ marginBottom: "16px" }}>ไม่พบอาการที่เลือกไว้ ลองเลือกใหม่จากรายการนี้</p>
        ) : null}
        <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "14px" }}>
          {Object.values(troubleshootingEntries).map((item) => (
            <li key={item.id}>
              <Link
                className="pl-card pl-link"
                href={`/problem?symptom=${item.id}`}
                style={{ display: "block", color: "inherit", textDecoration: "none" }}
              >
                <p className="pl-lede">{item.symptom}</p>
              </Link>
            </li>
          ))}
        </ul>
        <p className="pl-meta" style={{ marginTop: "22px" }}>
          <Link className="pl-link" href="/problem">เริ่มเลือกใหม่</Link> · <Link className="pl-link" href="/">กลับหน้าแรก</Link>
        </p>
      </>
    );
  }

  return (
    <>
      <h1 className="pl-h1">{entry.symptom}</h1>

      <div className="pl-card" style={{ marginTop: "18px" }}>
        <p className="pl-h2">น่าจะเกิดจาก</p>
        <p className="pl-lede" style={{ marginTop: "8px" }}>{entry.likelyCause}</p>
      </div>

      {entry.distinguish ? (
        <div className="pl-card" style={{ marginTop: "14px", background: "var(--pl-sunk)" }}>
          <p className="pl-h2">แยกจากอาการที่คล้ายกันยังไง</p>
          <p className="pl-lede" style={{ marginTop: "8px" }}>{entry.distinguish}</p>
        </div>
      ) : null}

      <h2 className="pl-h2" style={{ marginTop: "26px" }}>สิ่งที่ต้องทำ</h2>
      <ol style={{ margin: "12px 0 0", paddingLeft: "22px", display: "flex", flexDirection: "column", gap: "10px" }}>
        {entry.actions.map((action) => (
          <li className="pl-lede" key={action}>{action}</li>
        ))}
      </ol>

      <p style={{ marginTop: "18px" }}>
        <EvidenceBadge level={entry.evidence.level} />
      </p>
      {entry.evidence.note ? <p className="pl-meta" style={{ marginTop: "8px" }}>{entry.evidence.note}</p> : null}

      <p className="pl-meta" style={{ marginTop: "22px" }}>
        ไม่ตรงกับที่เห็น? <Link className="pl-link" href="/problem">เลือกอาการใหม่</Link>
      </p>
    </>
  );
}
