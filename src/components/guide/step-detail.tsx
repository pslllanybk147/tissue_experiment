import Link from "next/link";
import { sourceById } from "@/lib/manual/sources";
import type { ResolvedManual, ResolvedStep } from "@/lib/manual/types";
import { EvidenceBadge } from "./evidence-badge";
import { Illustration } from "./illustrations";

function List({ title, items }: { title: string; items: string[] }) {
  if (items.length === 0) return null;
  return (
    <section style={{ marginTop: "18px" }}>
      <h2 className="pl-h2">{title}</h2>
      <ul style={{ margin: "8px 0 0", paddingLeft: "20px", display: "flex", flexDirection: "column", gap: "6px" }}>
        {items.map((item) => <li key={item}>{item}</li>)}
      </ul>
    </section>
  );
}

export function StepDetail({ manual, step }: { manual: ResolvedManual; step: ResolvedStep }) {
  const number = step.order + 1;
  const total = manual.steps.length;
  const previous = number > 1 ? number - 1 : null;
  const next = number < total ? number + 1 : null;

  return (
    <>
      <p className="pl-mono">
        <Link className="pl-link" href={`/guide/${manual.slug}`} style={{ color: "inherit" }}>{manual.commonName}</Link>
        {" · "}ขั้นที่ {number} จาก {total}
      </p>
      <h1 className="pl-h1" style={{ marginTop: "8px" }}>{step.title}</h1>
      <p style={{ marginTop: "6px" }}><EvidenceBadge level={step.evidence.level} /></p>
      <p className="pl-lede" style={{ marginTop: "12px" }}>{step.summary}</p>
      <p className="pl-lede" style={{ marginTop: "8px" }}>{step.why}</p>

      {step.illustrationId ? (
        <div className="pl-card" style={{ marginTop: "18px", padding: 0, overflow: "hidden" }}>
          <Illustration id={step.illustrationId} />
        </div>
      ) : null}

      {step.safetyNotes.length > 0 ? (
        <div className="pl-card" style={{ background: "var(--pl-stop)", marginTop: "18px" }}>
          <p className="pl-mono" style={{ color: "var(--pl-ink-2)" }}>ความปลอดภัย</p>
          <ul style={{ margin: "8px 0 0", paddingLeft: "20px", display: "flex", flexDirection: "column", gap: "6px" }}>
            {step.safetyNotes.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </div>
      ) : null}

      <List title="ของที่ต้องเตรียม" items={step.materials} />

      <section style={{ marginTop: "18px" }}>
        <h2 className="pl-h2">ลงมือทำ</h2>
        <ol style={{ margin: "8px 0 0", paddingLeft: "20px", display: "flex", flexDirection: "column", gap: "8px" }}>
          {step.actions.map((action) => <li key={action}>{action}</li>)}
        </ol>
      </section>

      <List title="ผ่านเมื่อ" items={step.passCriteria} />
      <List title="หยุดทันทีถ้า" items={step.stopConditions} />

      {step.evidence.note ? (
        <section style={{ marginTop: "18px" }}>
          <h2 className="pl-h2">ที่มาของคำแนะนำนี้</h2>
          <p className="pl-lede" style={{ marginTop: "6px" }}>{step.evidence.note}</p>
        </section>
      ) : null}

      {step.evidence.sourceIds.length > 0 ? (
        <ul style={{ margin: "10px 0 0", paddingLeft: "20px", display: "flex", flexDirection: "column", gap: "6px" }}>
          {step.evidence.sourceIds.map((id) => {
            const source = sourceById(id);
            return (
              <li key={id}>
                {source ? <a className="pl-link" href={source.url}>{source.title}</a> : id}
              </li>
            );
          })}
        </ul>
      ) : null}

      <nav style={{ display: "flex", gap: "12px", marginTop: "28px" }}>
        {previous ? (
          <Link
            className="pl-card pl-link"
            href={`/guide/${manual.slug}/step/${previous}`}
            style={{ flex: 1, textAlign: "center", color: "inherit", textDecoration: "none", fontWeight: 700 }}
          >
            ‹ ขั้นที่ {previous}
          </Link>
        ) : null}
        {next ? (
          <Link
            className="pl-card pl-link"
            href={`/guide/${manual.slug}/step/${next}`}
            style={{ flex: 1, textAlign: "center", background: "var(--pl-yellow)", color: "var(--pl-chip-ink)", textDecoration: "none", fontWeight: 700 }}
          >
            ขั้นที่ {next} ›
          </Link>
        ) : null}
      </nav>
    </>
  );
}
