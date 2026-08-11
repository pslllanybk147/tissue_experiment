import Link from "next/link";
import { EvidenceBadge } from "@/components/guide/evidence-badge";
import type { RoundView } from "@/lib/rounds/round-adapter";

const statusLabel = {
  Pending: "ยังไม่ทำ",
  Passed: "ผ่านแล้ว",
  "Needs review": "ต้องทบทวน",
  Failed: "ติดปัญหา",
} as const;

function stateName(status: keyof typeof statusLabel, isCurrent: boolean): string {
  if (isCurrent) return "current";
  return status.toLowerCase().replace(" ", "-");
}

export function RoundProgress({ view }: { view: RoundView }) {
  return (
    <>
      <h1 className="pl-h1">{view.title}</h1>
      <p className="pl-meta" style={{ marginTop: "4px" }}>เริ่ม {view.startedAt}</p>
      <p className="pl-mono" style={{ marginTop: "10px" }}>
        ผ่านแล้ว {view.passedCount} จาก {view.steps.length} ขั้น
      </p>

      <ol className="cl-round-progress">
        {view.steps.map((step) => {
          const number = step.displayNumber;
          const isCurrent = number === view.currentStepNumber;
          // แสดงชื่อที่ผู้ใช้อ่านออก ไม่ใช่ id ภายในของช่องวัด
          const recorded = step.measurements
            .filter((measurement) => step.state.measurements[measurement.id] != null)
            .map((measurement) => `${measurement.label} ${step.state.measurements[measurement.id]} ${measurement.unit}`);
          return (
            <li key={step.id} data-state={stateName(step.state.status, isCurrent)}>
              <Link
                className="cl-round-progress-link"
                href={`/my/rounds/${view.lotId}/step/${number}`}
                aria-current={isCurrent ? "step" : undefined}
              >
                <p className="cl-round-progress-state">
                  ขั้นที่ {number} · {isCurrent ? "ทำต่อตรงนี้" : statusLabel[step.state.status]}
                </p>
                <p className="cl-round-progress-title">{step.title}</p>
                {step.state.note ? (
                  <p className="cl-round-progress-note">
                    {step.state.note}
                  </p>
                ) : null}
                {recorded.length > 0 ? (
                  <p className="cl-round-progress-values">
                    {recorded.join(" · ")}
                  </p>
                ) : null}
                {!isCurrent ? (
                  <p className="cl-round-progress-evidence"><EvidenceBadge level={step.evidence.level} /></p>
                ) : null}
              </Link>
            </li>
          );
        })}
      </ol>
    </>
  );
}
