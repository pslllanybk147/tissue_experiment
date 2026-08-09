import Link from "next/link";
import { sourceById } from "@/lib/manual/sources";
import { RichText } from "./rich-text";
import { troubleshootingById } from "@/lib/manual/troubleshooting";
import type { ResolvedManual, ResolvedStep } from "@/lib/manual/types";
import { MediumCalculator } from "@/components/rounds/medium-calculator";
import { formatDurationMinutes } from "@/lib/manual/duration";
import { MEDIUM_CALCULATOR_STEP_IDS, initialRecipeIdForStep } from "@/lib/rounds/medium-steps";
import { BracketNotice } from "./bracket-notice";
import { EvidenceBadge } from "./evidence-badge";
import { Illustration, illustrationCredits } from "./illustrations";

function List({ title, items }: { title: string; items: string[] }) {
  if (items.length === 0) return null;
  return (
    <section style={{ marginTop: "18px" }}>
      <h2 className="pl-h2">{title}</h2>
      <ul style={{ margin: "8px 0 0", paddingLeft: "20px", display: "flex", flexDirection: "column", gap: "6px" }}>
        {items.map((item) => <li key={item}><RichText source={item} /></li>)}
      </ul>
    </section>
  );
}

function Troubleshooting({ ids }: { ids: string[] }) {
  const entries = ids.map((id) => troubleshootingById(id)).filter((entry) => entry !== null);
  if (entries.length === 0) return null;

  return (
    <section style={{ marginTop: "26px" }}>
      <h2 className="pl-h2">ถ้าเจออาการแบบนี้</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "10px" }}>
        {entries.map((entry) => (
          <article className="pl-card" key={entry.id} style={{ background: "var(--pl-sunk)" }}>
            <p style={{ margin: 0, fontWeight: 700 }}>{entry.symptom}</p>
            <p className="pl-lede" style={{ marginTop: "8px" }}>{entry.likelyCause}</p>
            {entry.distinguish ? (
              <p className="pl-lede" style={{ marginTop: "8px" }}>
                <strong>วิธีแยกจากอาการที่คล้ายกัน</strong> {entry.distinguish}
              </p>
            ) : null}
            <h3 className="pl-mono" style={{ marginTop: "12px" }}>ทำอะไรต่อ</h3>
            <ol style={{ margin: "6px 0 0", paddingLeft: "20px", display: "flex", flexDirection: "column", gap: "6px" }}>
              {entry.actions.map((action) => <li key={action}><RichText source={action} /></li>)}
            </ol>
            <p style={{ marginTop: "12px" }}><EvidenceBadge level={entry.evidence.level} /></p>
          </article>
        ))}
      </div>
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
      <p style={{ marginTop: "6px" }}>
        <EvidenceBadge level={step.evidence.level} />
        {step.durationMinutes != null ? (
          <>{" "}<span className="pl-mono">ใช้เวลาราว {formatDurationMinutes(step.durationMinutes)}</span></>
        ) : null}
      </p>
      <p className="pl-lede" style={{ marginTop: "12px" }}><RichText source={step.summary} /></p>

      <BracketNotice step={step} />
      <p className="pl-lede" style={{ marginTop: "8px" }}><RichText source={step.why} /></p>

      {MEDIUM_CALCULATOR_STEP_IDS.has(step.id) ? (
        // อยู่ก่อนคำสั่งลงมือทำตั้งใจ เพราะขั้นตอนด้านล่างอ้างถึง "ตามสูตร"/"ตามที่คำนวณ" อยู่หลายจุด
        // ผู้ใช้ต้องเห็นตัวเลขจริงก่อนจะอ่านคำสั่งที่อ้างถึงมัน ไม่ใช่ไล่หาทีหลัง
        <MediumCalculator recipes={manual.mediaRecipes} initialRecipeId={initialRecipeIdForStep(step.id)} />
      ) : null}

      {step.illustrationId ? (
        <div className="pl-card" style={{ marginTop: "18px", padding: 0, overflow: "hidden" }}>
          <Illustration id={step.illustrationId} />
        </div>
      ) : null}
      {step.illustrationId && illustrationCredits[step.illustrationId] ? (
        <p className="pl-lede" style={{ marginTop: "6px", fontSize: "13px" }}>
          {illustrationCredits[step.illustrationId]}
        </p>
      ) : null}

      {step.safetyNotes.length > 0 ? (
        <div className="pl-card" style={{ background: "var(--pl-stop)", marginTop: "18px" }}>
          <p className="pl-mono" style={{ color: "var(--pl-ink-2)" }}>ความปลอดภัย</p>
          <ul style={{ margin: "8px 0 0", paddingLeft: "20px", display: "flex", flexDirection: "column", gap: "6px" }}>
            {step.safetyNotes.map((item) => <li key={item}><RichText source={item} /></li>)}
          </ul>
        </div>
      ) : null}

      <List title="ของที่ต้องเตรียม" items={step.materials} />

      <section style={{ marginTop: "18px" }}>
        <h2 className="pl-h2">ลงมือทำ</h2>
        <ol style={{ margin: "8px 0 0", paddingLeft: "20px", display: "flex", flexDirection: "column", gap: "8px" }}>
          {step.actions.map((action) => <li key={action}><RichText source={action} /></li>)}
        </ol>
      </section>

      <List title="ผ่านเมื่อ" items={step.passCriteria} />
      <List title="หยุดทันทีถ้า" items={step.stopConditions} />

      <Troubleshooting ids={step.troubleshootingIds ?? []} />

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
            const page = step.evidence.sourcePages?.[id];
            return (
              <li key={id}>
                {source ? <a className="pl-link" href={source.url}>{source.title}</a> : id}
                {page ? ` — ${page}` : null}
              </li>
            );
          })}
        </ul>
      ) : null}

      {step.referenceImages && step.referenceImages.length > 0 ? (
        <section style={{ marginTop: "18px" }}>
          <h2 className="pl-h2">ภาพอ้างอิงภายนอก (ดูลักษณะเท่านั้น)</h2>
          <p className="pl-lede" style={{ marginTop: "6px" }}>
            ลิงก์ไปหน้าเว็บภายนอกเพื่อดูลักษณะเท่านั้น ไม่ใช่คำแนะนำตำแหน่งตัดหรือหลักฐานของขั้นนี้
          </p>
          <ul style={{ margin: "10px 0 0", paddingLeft: "20px", display: "flex", flexDirection: "column", gap: "8px" }}>
            {step.referenceImages.map((image) => (
              <li key={image.url}>
                <a className="pl-link" href={image.url}>{image.label}</a>
                <p className="pl-lede" style={{ marginTop: "2px" }}>{image.note}</p>
              </li>
            ))}
          </ul>
        </section>
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
