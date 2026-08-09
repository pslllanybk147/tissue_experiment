import Link from "next/link";
import { EvidenceBadge } from "@/components/guide/evidence-badge";
import type { RoundView } from "@/lib/rounds/round-adapter";

const statusLabel = {
  Pending: "ยังไม่ทำ",
  Passed: "ผ่านแล้ว",
  "Needs review": "ต้องทบทวน",
  Failed: "ติดปัญหา",
} as const;

function background(status: keyof typeof statusLabel, isCurrent: boolean): string {
  if (isCurrent) return "var(--pl-yellow)";
  if (status === "Passed") return "var(--pl-card)";
  if (status === "Failed" || status === "Needs review") return "var(--pl-stop)";
  return "var(--pl-sunk)";
}

export function RoundProgress({ view }: { view: RoundView }) {
  return (
    <>
      <h1 className="pl-h1">{view.title}</h1>
      <p className="pl-meta" style={{ marginTop: "4px" }}>เริ่ม {view.startedAt}</p>
      <p className="pl-mono" style={{ marginTop: "10px" }}>
        ผ่านแล้ว {view.passedCount} จาก {view.steps.length} ขั้น
      </p>

      <ol style={{ listStyle: "none", margin: "22px 0 0", padding: 0, display: "flex", flexDirection: "column", gap: "12px" }}>
        {view.steps.map((step) => {
          const number = step.displayNumber;
          const isCurrent = number === view.currentStepNumber;
          // แสดงชื่อที่ผู้ใช้อ่านออก ไม่ใช่ id ภายในของช่องวัด
          const recorded = step.measurements
            .filter((measurement) => step.state.measurements[measurement.id] != null)
            .map((measurement) => `${measurement.label} ${step.state.measurements[measurement.id]} ${measurement.unit}`);
          return (
            <li key={step.id}>
              <Link
                className="pl-card pl-link"
                href={`/my/rounds/${view.lotId}/step/${number}`}
                style={{
                  display: "block",
                  color: isCurrent ? "var(--pl-chip-ink)" : "inherit",
                  textDecoration: "none",
                  background: background(step.state.status, isCurrent),
                }}
              >
                <p className="pl-mono" style={{ color: isCurrent ? "var(--pl-chip-ink)" : undefined }}>
                  ขั้นที่ {number} · {isCurrent ? "ทำต่อตรงนี้" : statusLabel[step.state.status]}
                </p>
                <p className="pl-h2" style={{ marginTop: "4px" }}>{step.title}</p>
                {step.state.note ? (
                  <p className="pl-lede" style={{ marginTop: "6px", color: isCurrent ? "var(--pl-chip-ink)" : undefined }}>
                    {step.state.note}
                  </p>
                ) : null}
                {recorded.length > 0 ? (
                  <p className="pl-mono" style={{ marginTop: "6px", color: isCurrent ? "var(--pl-chip-ink)" : undefined }}>
                    {recorded.join(" · ")}
                  </p>
                ) : null}
                {!isCurrent ? (
                  <p style={{ marginTop: "10px" }}><EvidenceBadge level={step.evidence.level} /></p>
                ) : null}
              </Link>
            </li>
          );
        })}
      </ol>
    </>
  );
}
