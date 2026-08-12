import { EvidenceBadge } from "@/components/guide/evidence-badge";
import type { RoundView } from "@/lib/rounds/round-adapter";
import { measurementUnitLabel } from "@/lib/rounds/measurement-units";
import { roundCode, roundDisplayName } from "@/lib/rounds/round-code";

const statusLabel = {
  Pending: "ยังไม่ทำ",
  Passed: "ผ่านแล้ว",
  "Needs review": "ต้องทบทวน",
  Failed: "ติดปัญหา",
} as const;

/** ขั้นปิดรอบสั่งว่า "ทบทวนบันทึกทุกขั้น" และประกาศว่าจะ "รวมทุกอย่างที่บันทึกไว้เป็นข้อสรุปเดียว"
 *  แต่เดิมไม่มีหน้าไหนแสดงค่าที่บันทึกไว้ครบทุกขั้นพร้อมกันเลย ต้องไล่เปิดทีละหน้าเอง
 *  ตารางนี้จึงรวมทุกอย่างที่รอบนี้บันทึกไว้มาให้อ่านรวดเดียวก่อนเขียนข้อสรุป */
export function RoundRecordSummary({ view }: { view: RoundView }) {
  const rows = view.steps.map((step) => {
    const recorded = step.measurements
      .map((measurement) => {
        const value = step.state.responses?.[measurement.id] ?? step.state.measurements[measurement.id];
        if (value === null || value === undefined || value === "") return null;
        if (typeof value === "boolean") return value ? measurement.label : null;
        return `${measurement.label} ${value} ${measurementUnitLabel(measurement.unit)}`;
      })
      .filter((item): item is string => item !== null);
    return { step, recorded };
  });

  const withData = rows.filter((row) => row.recorded.length > 0 || row.step.state.note || row.step.state.status !== "Pending");

  return (
    <section className="cl-protocol-section">
      <h2>บันทึกทั้งรอบ {roundCode(view.lotId)}</h2>
      <p className="pl-lede" style={{ marginTop: "8px" }}>
        {roundDisplayName(view.title, view.trialArmLabel)} · เริ่ม {view.startedAt} ·
        ผ่านแล้ว {view.passedCount} จาก {view.steps.length} ขั้น
      </p>

      {withData.length === 0 ? (
        <p className="pl-lede" style={{ marginTop: "10px" }}>ยังไม่มีขั้นไหนบันทึกค่าไว้</p>
      ) : (
        <div style={{ overflowX: "auto", marginTop: "12px" }}>
          <table className="pl-table">
            <thead>
              <tr>
                <th scope="col">ขั้น</th>
                <th scope="col">สถานะ</th>
                <th scope="col">ค่าที่บันทึก</th>
                <th scope="col">บันทึกที่จดไว้</th>
              </tr>
            </thead>
            <tbody>
              {withData.map(({ step, recorded }) => (
                <tr key={step.id}>
                  <th scope="row">
                    {step.displayNumber}. {step.title}
                    <span style={{ display: "block", marginTop: "4px" }}><EvidenceBadge level={step.evidence.level} /></span>
                  </th>
                  <td>{statusLabel[step.state.status]}</td>
                  <td>{recorded.length > 0 ? recorded.join(" · ") : "—"}</td>
                  <td>{step.state.note || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
