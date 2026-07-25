type BaselineRun = {
  id: string;
  sourceJobId: string;
  status: string;
  createdAt: string;
  schemaVersion: string;
  evaluation: {
    validation: { total: number; correct: number; accuracy: number | null } | null;
    test: { total: number; correct: number; accuracy: number | null } | null;
    warnings: string[];
  } | null;
};

function accuracy(value: number | null | undefined) {
  return value == null ? "ยังไม่มีข้อมูล" : `${Math.round(value * 100)}%`;
}

export function BaselineTrainingRuns({ runs }: { runs: BaselineRun[] }) {
  return <section className="baseline-training-runs" aria-labelledby="baseline-training-runs-heading">
    <div className="preprocessing-heading"><div><p className="eyebrow">IMAGE PROCESSING / EVALUATION</p><h2 id="baseline-training-runs-heading">ประวัติ baseline training</h2><p>ผลนี้ใช้ตรวจ pipeline และเปรียบเทียบรอบทดลอง ยังไม่ใช่คำยืนยันชนิดพืชอัตโนมัติ</p></div></div>
    {!runs.length ? <div className="dataset-empty"><h3>ยังไม่มี training run</h3><p>เมื่อ dataset ผ่าน readiness gate แล้วจึงเริ่ม baseline training ได้</p></div> : <div className="baseline-training-run-list">{runs.map((run) => <article className="baseline-training-run" key={run.id}>
      <header><div><code>{run.id}</code><small>จาก {run.sourceJobId} · {new Intl.DateTimeFormat("th-TH", { dateStyle: "medium", timeStyle: "short" }).format(new Date(run.createdAt))}</small></div><span className="dataset-status approved">{run.status}</span></header>
      <div className="baseline-metrics"><div><span>Validation</span><strong>{accuracy(run.evaluation?.validation?.accuracy)}</strong><small>{run.evaluation?.validation?.correct ?? 0}/{run.evaluation?.validation?.total ?? 0} ภาพ</small></div><div><span>Test</span><strong>{accuracy(run.evaluation?.test?.accuracy)}</strong><small>{run.evaluation?.test?.correct ?? 0}/{run.evaluation?.test?.total ?? 0} ภาพ</small></div></div>
      {run.evaluation?.warnings?.map((warning) => <p className="baseline-warning" key={warning}>{warning}</p>)}
    </article>)}</div>}
  </section>;
}
