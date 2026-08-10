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

export type LegacyRoundSummary = { lotId: string; title: string; startedAt: string };

function LegacyRounds({ legacy }: { legacy: LegacyRoundSummary[] }) {
  if (legacy.length === 0) return null;
  return (
    <section style={{ marginTop: "26px" }}>
      <h2 className="pl-h2">รอบที่เริ่มไว้ก่อนระบบคู่มือใหม่</h2>
      <p className="pl-lede" style={{ marginTop: "6px" }}>
        รอบเหล่านี้เดินด้วยระบบเดิม จึงเปิดได้แบบอ่านอย่างเดียว ข้อมูลยังอยู่ครบและไม่ถูกลบ
      </p>
      <ul style={{ listStyle: "none", margin: "12px 0 0", padding: 0, display: "flex", flexDirection: "column", gap: "10px" }}>
        {legacy.map((item) => (
          <li key={item.lotId}>
            <Link
              className="pl-card pl-link"
              href={`/my/rounds/legacy/${item.lotId}`}
              style={{ display: "block", color: "inherit", textDecoration: "none", background: "var(--pl-sunk)" }}
            >
              <p style={{ margin: 0, fontWeight: 700 }}>{item.title}</p>
              <p className="pl-meta" style={{ marginTop: "4px" }}>เริ่ม {item.startedAt}</p>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function RoundList({
  rounds,
  legacy = [],
  onDelete,
}: {
  rounds: RoundSummary[];
  legacy?: LegacyRoundSummary[];
  onDelete?: (round: RoundSummary) => void | Promise<void>;
}) {
  if (rounds.length === 0) {
    return (
      <div className="pl-card">
        <p className="pl-h2">ยังไม่มีรอบเพาะ</p>
        <p className="pl-lede" style={{ marginTop: "8px" }}>
          เลือกต้นที่อยากทำจากหน้าคู่มือ อ่านให้จบก่อนแล้วค่อยกดเริ่มรอบ ระบบจะจำไว้ให้ว่าทำถึงขั้นไหน
        </p>
        <p style={{ marginTop: "14px" }}>
          <Link className="pl-action-primary pl-link" href="/" style={{ textDecoration: "none" }}>
            ไปเลือกต้น
          </Link>
        </p>
        <EquipmentLink />
        <LegacyRounds legacy={legacy} />
      </div>
    );
  }

  return (
    <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "14px" }}>
      {rounds.map((round) => (
        <li key={round.lotId}>
          <div className="pl-card" style={{ display: "flex", flexDirection: "column" }}>
            <Link
              className="pl-link"
              href={`/my/rounds/${round.lotId}`}
              style={{ display: "block", color: "inherit", textDecoration: "none" }}
            >
              <p className="pl-h2">{round.title}</p>
              <p className="pl-meta" style={{ marginTop: "4px" }}>เริ่ม {round.startedAt}</p>
              <p className="pl-mono" style={{ marginTop: "10px" }}>
                ผ่านแล้ว {round.passedCount} จาก {round.stepCount} ขั้น
              </p>
            </Link>
            {onDelete ? (
              <button
                type="button"
                className="pl-action-danger"
                aria-label={`ลบรอบ ${round.title}`}
                onClick={() => {
                  if (window.confirm(`ลบรอบ “${round.title}” ออกจากรายการหรือไม่?`)) {
                    void onDelete(round);
                  }
                }}
                style={{ alignSelf: "flex-start", marginTop: "14px", cursor: "pointer", fontSize: "14px", padding: "8px 14px" }}
              >
                ลบรอบนี้
              </button>
            ) : null}
          </div>
        </li>
      ))}
      <li><EquipmentLink /></li>
      <li><LegacyRounds legacy={legacy} /></li>
    </ul>
  );
}
