import type { TrainingReadinessReport } from "../../lib/domain/training-readiness";

export function TrainingReadinessPanel({
  report,
}: {
  report: TrainingReadinessReport;
}) {
  return (
    <section
      className={`training-readiness-panel ${report.ready ? "ready" : "blocked"}`}
      aria-labelledby="training-readiness-heading"
    >
      <div className="training-readiness-heading">
        <div>
          <p className="eyebrow">BASELINE MODEL GATE</p>
          <h2 id="training-readiness-heading">
            {report.ready ? "พร้อมเริ่มฝึกโมเดลทดลอง" : "ยังไม่พร้อมฝึกโมเดล"}
          </h2>
        </div>
        <strong>{report.itemCount} ภาพ · {Object.keys(report.classCounts).length} คลาส</strong>
      </div>
      {!report.ready && (
        <div className="training-blockers" role="alert">
          <h3>สิ่งที่ต้องเพิ่มหรือแก้ก่อน</h3>
          <ul>{report.blockers.map((blocker) => <li key={blocker}>{blocker}</li>)}</ul>
        </div>
      )}
      <div className="table-scroll" tabIndex={0} aria-label="จำนวนภาพแยกตามคลาส">
        <table className="training-class-table">
          <thead><tr><th>ชนิด/สายพันธุ์</th><th>Train</th><th>Validation</th><th>Test</th><th>Lot</th></tr></thead>
          <tbody>{Object.entries(report.classSplitCounts).map(([name, counts]) => (
            <tr key={name}><th scope="row">{name}</th><td>{counts.train}</td><td>{counts.validation}</td><td>{counts.test}</td><td>{counts.distinctLots}</td></tr>
          ))}</tbody>
        </table>
      </div>
      <p className="muted-copy">
        เกณฑ์ pilot ต่อคลาส: train {report.policy.minimumTrainPerClass},
        validation {report.policy.minimumValidationPerClass}, test {report.policy.minimumTestPerClass}
        และอย่างน้อย {report.policy.minimumDistinctLotsPerClass} Lot
      </p>
    </section>
  );
}
