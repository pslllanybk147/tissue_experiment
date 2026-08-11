import { substances } from "@/lib/manual/substances";
import { StatusNotice } from "@/components/common/status-notice";

/** หน้ารวมสารที่ระบบเอ่ยชื่อ ตอบสามคำถามที่ผู้ใช้ต้องออกไปค้นเองทุกครั้ง
 *  คือมันคืออะไร ซื้อที่ไหน และถ้าไม่มีจะใช้อะไรแทน
 *
 *  เป็น Server Component ล้วนเหมือนหน้าสาธารณะอื่น ไม่มี state ไม่ต้องใช้ JavaScript */
export function SubstanceList() {
  return (
    <section className="cl-public-section cl-atlas-reading">
      <header className="cl-page-heading"><div><p className="cl-chapter-kicker">ภาคผนวกคู่มือ</p><h1>สารที่ต้องใช้ และของที่ใช้แทนได้</h1><p>
        ทุกตัวที่คู่มือเอ่ยชื่อ อยู่ที่นี่หมด พร้อมบอกว่าซื้อที่ไหนและถ้าไม่มีจะทำยังไงต่อ
        ถ้าตัวไหนไม่มีของแทนที่ยอมรับได้ หน้านี้จะบอกตรง ๆ แทนที่จะเสนอของที่ยังไม่มีใครทดสอบ
      </p></div></header>

      <ul className="cl-reference-list">
        {substances.map((item) => (
          <li key={item.id}>
            <h2>
              {item.name}
            </h2>
            <p className="cl-support-copy">
              เรียกอีกอย่างว่า {item.aka.join(" · ")}
            </p>

            <p>{item.whatItIs}</p>

            <p>
              <strong>ใช้ตอนไหน</strong> {item.usedFor}
            </p>

            <p>
              <strong>ซื้อที่ไหน</strong> {item.whereToBuy}
            </p>

            <p>
              <strong>ถ้าไม่มี</strong>{" "}
              {item.substitute ?? "ยังไม่มีของแทนที่ยอมรับได้ ถ้าไม่มีตัวนี้ ให้ข้ามสูตรที่ต้องใช้มันไปก่อน"}
            </p>

            {item.caution ? (
              <StatusNotice tone="warning" title="ต้องระวัง">{item.caution}</StatusNotice>
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  );
}
