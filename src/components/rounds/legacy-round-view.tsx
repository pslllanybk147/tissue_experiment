import type { ExperimentLot, Observation, ProtocolStepRun } from "@/lib/domain/models";

const statusLabel: Record<string, string> = {
  Pending: "ยังไม่ทำ",
  Passed: "ผ่านแล้ว",
  "Needs review": "ต้องทบทวน",
  Failed: "ติดปัญหา",
};

function Counts({ observation }: { observation: Observation }) {
  const parts = [
    observation.shootCount != null ? `ยอด ${observation.shootCount}` : null,
    observation.rootCount != null ? `ราก ${observation.rootCount}` : null,
    observation.contaminationCount != null ? `ปนเปื้อน ${observation.contaminationCount}` : null,
  ].filter(Boolean);
  if (parts.length === 0) return null;
  return <p className="pl-mono" style={{ marginTop: "6px" }}>{parts.join(" · ")}</p>;
}

export function LegacyRoundView({
  lot,
  observations,
  runs,
}: {
  lot: ExperimentLot;
  observations: Observation[];
  runs: ProtocolStepRun[];
}) {
  const visibleObservations = observations.filter((item) => !item.deletedAt && item.kind !== "protocol-step-evidence");
  const nothingRecorded = visibleObservations.length === 0 && runs.length === 0;

  return (
    <article className="cl-guide-article">
      <header className="cl-guide-header"><p>ข้อมูล legacy · รอบเก่า · อ่านอย่างเดียว</p><h1>{lot.plant || lot.protocolTitle}</h1><small>เริ่ม {lot.startedAt}</small><p>
        รอบนี้เริ่มไว้ก่อนระบบคู่มือใหม่ จึงเดินต่อในระบบใหม่ไม่ได้ แต่ข้อมูลที่บันทึกไว้ยังอยู่ครบและแสดงอยู่ด้านล่าง
        ถ้าจะทำต่อ ให้เริ่มรอบใหม่จากหน้าคู่มือ
      </p></header>
      <aside className="cl-status-notice" data-tone="warning"><div><strong>ไม่มีข้อมูลที่ล็อกไว้</strong><p className="cl-status-copy">รอบนี้ไม่มี method snapshot แบบระบบใหม่ จึงแสดงเฉพาะข้อมูลที่บันทึกจริงและไม่เติมค่าที่คาดเดา</p></div></aside>

      {nothingRecorded ? (
        <p className="pl-card" style={{ marginTop: "18px" }}>ไม่มีบันทึกในรอบนี้</p>
      ) : null}

      {visibleObservations.length > 0 ? (
        <section style={{ marginTop: "24px" }}>
          <h2 className="pl-h2">บันทึกการสังเกต</h2>
          <ul style={{ listStyle: "none", margin: "12px 0 0", padding: 0, display: "flex", flexDirection: "column", gap: "10px" }}>
            {visibleObservations.map((observation) => (
              <li className="pl-card" key={observation.id}>
                <p className="pl-mono">{observation.observedAt} · {observation.stage}</p>
                {observation.note ? <p style={{ margin: "6px 0 0" }}>{observation.note}</p> : null}
                <Counts observation={observation} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {runs.length > 0 ? (
        <section style={{ marginTop: "24px" }}>
          <h2 className="pl-h2">บันทึกรายขั้น</h2>
          <ul style={{ listStyle: "none", margin: "12px 0 0", padding: 0, display: "flex", flexDirection: "column", gap: "10px" }}>
            {runs.map((run) => (
              <li className="pl-card" key={run.id}>
                <p className="pl-mono">{run.stepId} · {statusLabel[run.status] ?? run.status}</p>
                {run.note ? <p style={{ margin: "6px 0 0" }}>{run.note}</p> : null}
                {Object.entries(run.measurements).filter(([, value]) => value != null).length > 0 ? (
                  <p className="pl-mono" style={{ marginTop: "6px" }}>
                    {Object.entries(run.measurements)
                      .filter(([, value]) => value != null)
                      .map(([id, value]) => `${id} ${value}`)
                      .join(" · ")}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </article>
  );
}
