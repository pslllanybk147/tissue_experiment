import Link from "next/link";

export type RoundSummary = {
  lotId: string;
  slug: string;
  title: string;
  startedAt: string;
  passedCount: number;
  stepCount: number;
};

function EquipmentLink() {
  return (
    <p className="pl-meta" style={{ marginTop: "16px" }}>
      <Link className="pl-link" href="/my/equipment">ตั้งค่าของที่ฉันมี</Link>
      {" "}เพื่อให้ระบบจัดเส้นทางและคำนวณสารให้ตรงกับอุปกรณ์จริง
    </p>
  );
}

export function RoundList({ rounds }: { rounds: RoundSummary[] }) {
  if (rounds.length === 0) {
    return (
      <div className="pl-card">
        <p className="pl-h2">ยังไม่มีรอบเพาะ</p>
        <p className="pl-lede" style={{ marginTop: "8px" }}>
          เลือกต้นที่อยากทำจากหน้าคู่มือ อ่านให้จบก่อนแล้วค่อยกดเริ่มรอบ ระบบจะจำไว้ให้ว่าทำถึงขั้นไหน
        </p>
        <p style={{ marginTop: "14px" }}>
          <Link className="pl-chip pl-link" href="/" style={{ background: "var(--pl-yellow)", textDecoration: "none" }}>
            ไปเลือกต้น
          </Link>
        </p>
        <EquipmentLink />
      </div>
    );
  }

  return (
    <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "14px" }}>
      {rounds.map((round) => (
        <li key={round.lotId}>
          <Link
            className="pl-card pl-link"
            href={`/my/rounds/${round.lotId}`}
            style={{ display: "block", color: "inherit", textDecoration: "none" }}
          >
            <p className="pl-h2">{round.title}</p>
            <p className="pl-meta" style={{ marginTop: "4px" }}>เริ่ม {round.startedAt}</p>
            <p className="pl-mono" style={{ marginTop: "10px" }}>
              ผ่านแล้ว {round.passedCount} จาก {round.stepCount} ขั้น
            </p>
          </Link>
        </li>
      ))}
      <li><EquipmentLink /></li>
    </ul>
  );
}
