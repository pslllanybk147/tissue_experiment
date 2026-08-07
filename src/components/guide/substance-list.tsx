import { substances } from "@/lib/manual/substances";

/** หน้ารวมสารที่ระบบเอ่ยชื่อ ตอบสามคำถามที่ผู้ใช้ต้องออกไปค้นเองทุกครั้ง
 *  คือมันคืออะไร ซื้อที่ไหน และถ้าไม่มีจะใช้อะไรแทน
 *
 *  เป็น Server Component ล้วนเหมือนหน้าสาธารณะอื่น ไม่มี state ไม่ต้องใช้ JavaScript */
export function SubstanceList() {
  return (
    <div className="pl-root">
      <h1 className="pl-h1">สารที่ต้องใช้ และของที่ใช้แทนได้</h1>

      <p className="pl-lede">
        ทุกตัวที่คู่มือเอ่ยชื่อ อยู่ที่นี่หมด พร้อมบอกว่าซื้อที่ไหนและถ้าไม่มีจะทำยังไงต่อ
        ถ้าตัวไหนไม่มีของแทนที่ยอมรับได้ หน้านี้จะบอกตรง ๆ แทนที่จะเสนอของที่ยังไม่มีใครทดสอบ
      </p>

      <ul style={{ listStyle: "none", margin: "18px 0 0", padding: 0, display: "flex", flexDirection: "column", gap: "16px" }}>
        {substances.map((item) => (
          <li key={item.id} className="pl-soft-card">
            <h2 className="pl-h2" style={{ margin: 0 }}>
              {item.name}
            </h2>
            <p className="pl-mono" style={{ margin: "4px 0 0" }}>
              เรียกอีกอย่างว่า {item.aka.join(" · ")}
            </p>

            <p style={{ margin: "10px 0 0" }}>{item.whatItIs}</p>

            <p style={{ margin: "10px 0 0" }}>
              <strong>ใช้ตอนไหน</strong> {item.usedFor}
            </p>

            <p style={{ margin: "6px 0 0" }}>
              <strong>ซื้อที่ไหน</strong> {item.whereToBuy}
            </p>

            <p style={{ margin: "6px 0 0" }}>
              <strong>ถ้าไม่มี</strong>{" "}
              {item.substitute ?? "ยังไม่มีของแทนที่ยอมรับได้ ถ้าไม่มีตัวนี้ ให้ข้ามสูตรที่ต้องใช้มันไปก่อน"}
            </p>

            {item.caution ? (
              <p className="pl-soft-card" style={{ margin: "10px 0 0", background: "var(--pl-stop)" }} role="note">
                <strong>ต้องระวัง</strong> {item.caution}
              </p>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
