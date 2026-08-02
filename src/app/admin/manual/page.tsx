import Link from "next/link";
import { plantPacks } from "@/lib/manual/registry";
import { manualSummary } from "@/lib/manual/summary";

export default function AdminManualIndexPage() {
  return (
    <main style={{ padding: "32px", fontFamily: "system-ui, sans-serif", maxWidth: "820px" }}>
      <h1>คู่มือที่ merge แล้ว</h1>
      <p>หน้านี้สำหรับตรวจทานเนื้อหา ไม่ใช่หน้าที่ผู้ใช้เห็น</p>
      <ul>
        {plantPacks.map((pack) => {
          const summary = manualSummary(pack.slug);
          return (
            <li key={pack.slug} style={{ marginBottom: "12px" }}>
              <Link href={`/admin/manual/${pack.slug}`}>{pack.scientificName}</Link>
              <div>
                {summary?.stepCount} ขั้น · ยังไม่มีงานรองรับ {summary?.byEvidence.unsupported} ขั้น
              </div>
            </li>
          );
        })}
      </ul>
    </main>
  );
}
