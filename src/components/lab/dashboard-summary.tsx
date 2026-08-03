import Link from "next/link";
import type { LabSnapshot } from "../../lib/repositories/lab-repository";

// หน้าสรุปของพื้นที่หลังบ้าน ลิงก์ที่ชี้ไปเส้นทางเดิมถูกเปลี่ยนให้ตรงกับโครงใหม่แล้ว
export function DashboardSummary({ snapshot }: { snapshot: LabSnapshot }) {
  const pending = snapshot.research.filter((item) => item.evidence === "Pending review").length;
  return (
    <div className="dashboard-summary">
      <section className="dashboard-lead">
        <p className="eyebrow">CURRENT WORKSPACE</p>
        <h1>Plantlover Lab · หลังบ้าน</h1>
        <p>พื้นที่ตรวจทานคู่มือและหลักฐานวิจัย ส่วนการใช้งานจริงอยู่ที่คู่มือและรอบเพาะ</p>
        <div className="route-actions">
          <Link className="primary-button" href="/">เปิดคู่มือฉบับผู้ใช้</Link>
          <Link className="quiet-button" href="/my/rounds">รอบเพาะของฉัน</Link>
        </div>
      </section>
      <div className="dashboard-metrics">
        <Link href="/my/rounds"><strong>{snapshot.lots.length}</strong><span>รอบเพาะ</span></Link>
        <Link href="/admin/manual"><strong>{snapshot.protocol.stepCount}</strong><span>ขั้นในคู่มือ</span></Link>
        <Link href="/admin/research"><strong>{pending}</strong><span>งานวิจัยรอตรวจ</span></Link>
      </div>
    </div>
  );
}
