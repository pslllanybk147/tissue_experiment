import type { CalibrationEntry } from "@/lib/domain/calibration";
import { bracketKey, jarsPerArmKey, type BracketPlan } from "@/lib/rounds/bracket";

const armLabel = { a: "A", b: "B", c: "C" } as const;
const fieldLabel = { clean: "ไม่ติดเชื้อ", alive: "ชิ้นยังเขียว", usable: "ใช้ได้จริง" } as const;

/** ไม่ใช่ client component ของตัวเอง มันถูกวางอยู่ในฟอร์มของ step-runner ที่เป็น client อยู่แล้ว
 *  ช่องทั้งหมดใช้ name ที่มาจากฟังก์ชันสร้างคีย์ ทำให้ตัวบันทึกเดิมเก็บค่าได้โดยไม่ต้องรู้จักตารางนี้ */
export function BracketTable({
  plan,
  saved,
  remembered,
}: {
  plan: BracketPlan;
  saved: Record<string, number | null>;
  remembered: CalibrationEntry | null;
}) {
  const value = (key: string) => {
    const found = saved[key];
    return found === null || found === undefined ? "" : String(found);
  };

  return (
    <section style={{ marginTop: "24px" }}>
      <h2 className="pl-h2">ผลการทดสอบช่วง</h2>

      {remembered ? (
        <div className="pl-card" style={{ marginTop: "10px", background: "var(--pl-sunk)" }}>
          <p style={{ margin: 0, fontWeight: 700 }}>
            ค่าที่คุณเคยทดสอบได้คือ {remembered.value}{remembered.unit}
          </p>
          <p className="pl-meta" style={{ marginTop: "6px" }}>
            จากรอบ {remembered.lotId} เมื่อ {remembered.decidedAt} · ใช้ได้ {remembered.usable} จาก{" "}
            {remembered.jarsPerArm} กระปุก · จากการทดสอบ 3 กระปุกต่อชุดในรอบเดียว
            ใช้เป็นจุดตั้งต้นที่ดีกว่าเดา ไม่ใช่ข้อพิสูจน์
          </p>
        </div>
      ) : null}

      <p className="pl-lede" style={{ marginTop: "12px" }}>
        นับกระปุกในแต่ละชุดหลังครบ 14 วัน แล้วกรอกสามช่องต่อชุด
      </p>
      <ul className="pl-meta" style={{ margin: "8px 0 0", paddingLeft: "20px" }}>
        <li>ไม่ติดเชื้อ คือกระปุกที่ไม่มีเมือก ไม่มีขนฟู วุ้นยังใส</li>
        <li>ชิ้นยังเขียว คือชิ้นพืชไม่ดำและไม่เปื่อย ไม่ว่าจะติดเชื้อหรือไม่</li>
        <li>ใช้ได้จริง คือกระปุกที่เข้าทั้งสองข้อพร้อมกัน</li>
      </ul>

      <p style={{ marginTop: "14px" }}>
        <label>
          กระปุกต่อชุด{" "}
          <input
            className="pl-input"
            style={{ maxWidth: "90px" }}
            type="number"
            min={1}
            name={jarsPerArmKey()}
            defaultValue={value(jarsPerArmKey()) || "3"}
          />
        </label>
      </p>

      <div style={{ overflowX: "auto", marginTop: "12px" }}>
        <table className="pl-table">
          <thead>
            <tr>
              <th>ชุด</th>
              <th>ความเข้มข้น</th>
              <th>{fieldLabel.clean}</th>
              <th>{fieldLabel.alive}</th>
              <th>{fieldLabel.usable}</th>
            </tr>
          </thead>
          <tbody>
            {plan.arms.map((arm) => (
              <tr key={arm.armId}>
                <th scope="row">{armLabel[arm.armId]}</th>
                <td>{arm.dose}{plan.dose.unit}</td>
                {(["clean", "alive", "usable"] as const).map((field) => (
                  <td key={field}>
                    <input
                      className="pl-input"
                      style={{ maxWidth: "80px" }}
                      type="number"
                      min={0}
                      name={bracketKey(arm.armId, field)}
                      defaultValue={value(bracketKey(arm.armId, field))}
                      aria-label={`ชุด ${armLabel[arm.armId]} ${fieldLabel[field]}`}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
