import Link from "next/link";
import type { LabSnapshot } from "../../lib/repositories/lab-repository";

// หน้าสรุปของพื้นที่หลังบ้าน ลิงก์ที่ชี้ไปเส้นทางเดิมถูกเปลี่ยนให้ตรงกับโครงใหม่แล้ว
export function DashboardSummary({ snapshot }: { snapshot: LabSnapshot }) {
  const pending = snapshot.research.filter((item) => item.evidence === "Pending review").length;
  return (
    <div className="cl-atlas-dashboard">
      <header className="cl-atlas-chapter cl-atlas-dashboard-header">
        <p className="cl-meta">พื้นที่ทำงานปัจจุบัน</p>
        <h1>Plantlover Lab · หลังบ้าน</h1>
        <p>พื้นที่ตรวจทานคู่มือและหลักฐานวิจัย ส่วนการใช้งานจริงอยู่ที่คู่มือและรอบเพาะ</p>
        <div className="cl-atlas-dashboard-actions">
          <Link className="cl-button-primary" href="/">เปิดคู่มือฉบับผู้ใช้</Link>
          <Link className="cl-button-secondary" href="/my/rounds">รอบเพาะของฉัน</Link>
        </div>
      </header>
      <section className="cl-atlas-dashboard-summary" aria-labelledby="dashboard-summary-heading">
        <h2 id="dashboard-summary-heading">สรุปงานที่เกี่ยวข้อง</h2>
        <ul className="cl-atlas-summary-list">
          <li><Link href="/my/rounds"><strong className="cl-numeric-value">{snapshot.lots.length}</strong><span>รอบเพาะ</span></Link></li>
          <li><Link href="/admin/manual"><strong className="cl-numeric-value">{snapshot.protocol.stepCount}</strong><span>ขั้นในคู่มือ</span></Link></li>
          <li><Link href="/admin/research"><strong className="cl-numeric-value">{pending}</strong><span>งานวิจัยรอตรวจ</span></Link></li>
        </ul>
      </section>
    </div>
  );
}
