import Link from "next/link";

type Door = {
  href: string;
  title: string;
  hint: string;
};

/** สี่สถานะตั้งต้นของมือใหม่ที่เปิดเว็บมาครั้งแรก แสดงขนาดเท่ากันทั้งสี่ ไม่ชี้นำ
 *  เพราะยังไม่มีข้อมูลว่าคนส่วนใหญ่มาจากประตูไหน */
const doors: Door[] = [
  { href: "/find", title: "มีต้นอยู่ แต่ไม่รู้ชื่อ", hint: "ตอบคำถามจากลักษณะต้น ไม่กี่ข้อก็รู้ว่าเพาะยังไง" },
  { href: "/search", title: "รู้ชื่อต้นแล้ว", hint: "ค้นหาคู่มือจากชื่อที่คุณรู้" },
  { href: "/start", title: "ยังไม่มีต้น", hint: "ดูว่าต้นแบบไหนเริ่มง่ายที่สุดสำหรับมือใหม่" },
  { href: "/problem", title: "ทำแล้วมีปัญหา", hint: "ขวดขุ่น ชิ้นดำ ไม่โต ต้นใส" },
];

export function Doors() {
  return (
    <>
      <h1 className="pl-h1">เริ่มต้นตรงไหนดี</h1>
      <p className="pl-lede" style={{ marginBottom: "22px" }}>
        เลือกข้อที่ตรงกับคุณตอนนี้ อ่านคู่มือได้เลย ไม่ต้องสมัครสมาชิก
      </p>
      <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "14px" }}>
        {doors.map((door) => (
          <li key={door.href}>
            <Link
              className="pl-card pl-link"
              href={door.href}
              style={{ display: "block", color: "inherit", textDecoration: "none" }}
            >
              <p className="pl-h2">{door.title}</p>
              <p className="pl-lede" style={{ marginTop: "6px" }}>{door.hint}</p>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
