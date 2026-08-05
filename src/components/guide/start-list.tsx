import Link from "next/link";
import { growthForms } from "@/lib/manual/forms/registry";

const difficultyLabel: Record<1 | 2 | 3, string> = {
  1: "ง่ายสุดสำหรับมือใหม่",
  2: "ปานกลาง",
  3: "ยาก ควรผ่านทรงง่ายมาก่อน",
};

export function StartList() {
  const sorted = [...growthForms].sort((a, b) => a.beginnerDifficulty - b.beginnerDifficulty);

  return (
    <>
      <h1 className="pl-h1">เริ่มจากต้นแบบไหนดี</h1>
      <p className="pl-lede" style={{ marginBottom: "20px" }}>
        ความยากไม่ได้อยู่ที่ชนิดพืช แต่อยู่ที่ทรงของมัน เพราะทรงเป็นตัวกำหนดว่าหาจุดตัดยากแค่ไหน
      </p>

      <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "14px" }}>
        {sorted.map((form) => (
          <li key={form.id}>
            <Link
              className="pl-card pl-link"
              href={`/form/${form.id}`}
              style={{ display: "block", color: "inherit", textDecoration: "none" }}
            >
              <p className="pl-mono">{difficultyLabel[form.beginnerDifficulty]}</p>
              <p className="pl-h2" style={{ marginTop: "4px" }}>{form.label}</p>
              <p className="pl-lede" style={{ marginTop: "6px" }}>{form.whyThisDifficulty}</p>
            </Link>
          </li>
        ))}
      </ul>

      <p className="pl-meta" style={{ marginTop: "22px" }}>
        รายการนี้ยังไม่ครบทุกทรง เรากำลังทยอยเขียนเพิ่ม ถ้ามีต้นอยู่แล้วและไม่รู้ว่าทรงไหน
        ลอง <Link className="pl-link" href="/find">ไล่ดูจากลักษณะต้น</Link>
      </p>
    </>
  );
}
