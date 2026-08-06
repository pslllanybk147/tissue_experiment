import type { ResolvedStep } from "@/lib/manual/types";
import { buildBracketPlan } from "@/lib/rounds/bracket";

const armLabel = { a: "A", b: "B", c: "C" } as const;
const armWhen = { a: "ปลายต่ำ", b: "กลาง", c: "ปลายสูง" } as const;

/** กล่องนี้เป็นข้อความอย่างเดียว ไม่มีช่องกรอกและไม่มีข้อมูลเฉพาะบุคคล
 *  เพราะหน้าคู่มือสาธารณะ prerender ตอน build และอ่านได้โดยไม่ต้องล็อกอิน
 *  การกรอกจริงอยู่ในรอบเพาะ ดู bracket-table.tsx */
export function BracketNotice({ step }: { step: ResolvedStep }) {
  const plan = buildBracketPlan(step);
  if (!plan) return null;

  const { dose } = plan;

  return (
    <div className="pl-card" style={{ marginTop: "18px", background: "var(--pl-sunk)" }}>
      <p style={{ margin: 0, fontWeight: 700 }}>ยังไม่มีงานตรงพันธุ์ของต้นนี้ — อย่าเดา ให้ต้นบอกเอง</p>
      <p className="pl-lede" style={{ marginTop: "8px" }}>
        แบ่งชิ้นพืชเป็น 3 ชุด ชุดละ 3 กระปุก ใช้{dose.form} แช่นาน {dose.durationMin[0]} ถึง{" "}
        {dose.durationMin[1]} นาทีเท่ากันทุกชุด ต่างกันแค่ความเข้มข้น
      </p>
      <ul style={{ margin: "10px 0 0", paddingLeft: "20px", display: "flex", flexDirection: "column", gap: "4px" }}>
        {plan.arms.map((arm) => (
          <li key={arm.armId}>
            ชุด {armLabel[arm.armId]} {armWhen[arm.armId]} {arm.dose}{dose.unit}
          </li>
        ))}
      </ul>
      {dose.movesLowerWhen.length > 0 ? (
        <p className="pl-meta" style={{ marginTop: "10px" }}>
          เริ่มจากปลายต่ำถ้า {dose.movesLowerWhen.join(" · ")}
        </p>
      ) : null}
      {dose.movesHigherWhen.length > 0 ? (
        <p className="pl-meta" style={{ marginTop: "4px" }}>
          เริ่มจากปลายสูงถ้า {dose.movesHigherWhen.join(" · ")}
        </p>
      ) : null}
      <p className="pl-lede" style={{ marginTop: "10px" }}>
        ดูผลใน 14 วัน แล้วบันทึกลงรอบเพาะ ชุดที่ไม่ติดเชื้อและชิ้นยังเขียว คือค่าของต้นคุณ
      </p>
    </div>
  );
}
