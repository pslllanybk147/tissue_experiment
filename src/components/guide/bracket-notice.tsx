"use client";

import { useCalculatorOverlay } from "@/components/nav/calculator-overlay-context";
import type { ResolvedStep } from "@/lib/manual/types";
import { buildBracketPlan, formatDurationMinRange } from "@/lib/rounds/bracket";

const armLabel = { a: "A", b: "B", c: "C" } as const;
const armWhen = { a: "ปลายต่ำ", b: "กลาง", c: "ปลายสูง" } as const;
const methodLabel = { haiter: "Haiter", nadcc: "NaDCC" } as const;

/** กล่องนี้เป็นข้อความล้วนเดิม ไม่มีช่องกรอกและไม่มีข้อมูลเฉพาะบุคคล เพราะหน้าคู่มือสาธารณะ prerender
 *  ตอน build และอ่านได้โดยไม่ต้องล็อกอิน การกรอกจริงอยู่ในรอบเพาะ ดู bracket-table.tsx
 *
 *  ปุ่ม "เปิดเครื่องคำนวณ" ที่เพิ่มมาไม่ขัดกับข้อนี้ เพราะไม่ได้กรอกหรือแสดงข้อมูลเฉพาะบุคคลใด ๆ
 *  แค่เปลี่ยนจอเครื่องคำนวณที่ mount อยู่แล้วทั้งระบบ (ดู calculator-overlay.tsx) ให้ตรงกับ
 *  dose.method ของขั้นนี้ ผู้ใช้ยังต้องกรอกตัวเลขเองในเครื่องคำนวณเหมือนเดิมทุกประการ */
export function BracketNotice({ step }: { step: ResolvedStep }) {
  const { open, select } = useCalculatorOverlay();
  const plan = buildBracketPlan(step);
  if (!plan) return null;

  const { dose } = plan;

  return (
    <div className="pl-card" style={{ marginTop: "18px", background: "var(--pl-sunk)" }}>
      <p style={{ margin: 0, fontWeight: 700 }}>ชุดทดลองเสริม — ไม่ใช่เส้นทางหลัก</p>
      <p className="pl-lede" style={{ marginTop: "8px" }}>
        ยังไม่มีงานตรงพันธุ์ของต้นนี้ จึงใช้เฉพาะเมื่อกำลังทำรอบทดลองเปรียบเทียบ แบ่งชิ้นพืชเป็น 3 ชุด ชุดละ 3 กระปุก
        ใช้{dose.form} แช่นาน {formatDurationMinRange(dose.durationMin)} นาทีเท่ากันทุกชุด ต่างกันแค่ความเข้มข้น
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
      {dose.method ? (
        <>
          <div className="pl-soft-card" style={{ marginTop: "10px" }}>
            <p style={{ margin: 0, fontWeight: 700 }}>หลังฟอก: เตรียมน้ำล้างทดลอง</p>
            <p className="pl-lede" style={{ marginTop: "6px" }}>
              เตรียมภาชนะ R1–R3 ภาชนะละ 50 mL แล้วล้างชิ้นพืชรอบละ 1 นาที น้ำนี้ไม่ใช่น้ำปลอดเชื้อ และใช้เฉพาะแขนทดลองนี้
            </p>
          </div>
          <button
            type="button"
            className="pl-soft-card pl-link"
            style={{ marginTop: "10px", fontWeight: 700, cursor: "pointer" }}
            onClick={() => {
              open();
              select(dose.method!);
            }}
          >
            เปิดเครื่องคำนวณ{methodLabel[dose.method]}
          </button>
        </>
      ) : null}
      <p className="pl-lede" style={{ marginTop: "10px" }}>
        ดูผลใน 14 วัน แล้วบันทึกลงรอบเพาะ ชุดที่ไม่ติดเชื้อและชิ้นยังเขียว คือค่าของต้นคุณ
      </p>
    </div>
  );
}
