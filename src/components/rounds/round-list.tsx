import Link from "next/link";

export type RoundSummary = { lotId: string; slug: string; title: string; startedAt: string; passedCount: number; stepCount: number };
export type LegacyRoundSummary = { lotId: string; title: string; startedAt: string };

function EquipmentLink() {
  return <p className="cl-support-copy"><Link href="/my/equipment">ตั้งค่าของที่ฉันมี</Link> เพื่อให้ระบบจัดเส้นทางและคำนวณสารให้ตรงกับอุปกรณ์จริง</p>;
}

function LegacyRounds({ legacy }: { legacy: LegacyRoundSummary[] }) {
  if (legacy.length === 0) return null;
  return (
    <section className="cl-workspace-section">
      <header className="cl-section-heading"><h2>รอบที่เริ่มไว้ก่อนระบบคู่มือใหม่</h2><p>เปิดอ่านได้ ข้อมูลเดิมยังอยู่ครบ แต่ไม่มีค่าที่ล็อกด้วย workflow ใหม่</p></header>
      <ul className="cl-row-list cl-atlas-data-list">
        {legacy.map((item) => <li className="cl-data-row" key={item.lotId}><div><strong>{item.title}</strong><small>เริ่ม {item.startedAt} · ข้อมูล legacy</small></div><Link className="cl-button-secondary" href={`/my/rounds/legacy/${item.lotId}`}>เปิดอ่าน</Link></li>)}
      </ul>
    </section>
  );
}

export function RoundList({ rounds, legacy = [], onDelete }: { rounds: RoundSummary[]; legacy?: LegacyRoundSummary[]; onDelete?: (round: RoundSummary) => void | Promise<void> }) {
  if (rounds.length === 0) return (
    <div className="cl-workspace-stack">
      <section className="cl-empty-state"><h2>ยังไม่มีรอบเพาะ</h2><p>เลือกต้นที่อยากทำจากหน้าคู่มือ อ่านให้จบก่อนแล้วค่อยกดเริ่มรอบ ระบบจะจำไว้ให้ว่าทำถึงขั้นไหน</p><Link className="cl-button-primary" href="/">ไปเลือกต้น</Link></section>
      <EquipmentLink />
      <LegacyRounds legacy={legacy} />
    </div>
  );

  return (
    <div className="cl-workspace-stack">
      <ul className="cl-row-list cl-atlas-data-list">
        {rounds.map((round) => (
          <li className="cl-data-row" key={round.lotId}>
            <div className="cl-row-copy"><strong>{round.title}</strong><small>เริ่ม {round.startedAt}</small><span>ผ่านแล้ว {round.passedCount} จาก {round.stepCount} ขั้น</span></div>
            <div className="cl-row-actions"><Link className="cl-button-secondary" href={`/my/rounds/${round.lotId}`}>เปิดรอบ</Link>{onDelete ? <button type="button" className="cl-button-danger" aria-label={`ลบรอบ ${round.title}`} onClick={() => { if (window.confirm(`ลบรอบ “${round.title}” ออกจากรายการหรือไม่?`)) void onDelete(round); }}>ลบรอบนี้</button> : null}</div>
          </li>
        ))}
      </ul>
      <EquipmentLink />
      <LegacyRounds legacy={legacy} />
    </div>
  );
}
