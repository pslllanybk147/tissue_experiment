"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
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
import { StepSections } from "@/components/rounds/step-section";
import { HaiterCalculator } from "@/components/calculators/haiter-calculator";
import { defaultMediumExecutionContext, type MediumExecutionContext } from "@/lib/rounds/medium-execution";

function SterilizationCalculator() {
  return (
    <section className="pl-card" style={{ marginTop: "18px" }}>
      <p className="pl-mono" style={{ margin: 0 }}>คำนวณก่อนลงมือ</p>
      <p className="pl-lede" style={{ marginTop: "6px" }}>
        กรอกค่าจากฉลากและปริมาตรรวมที่รอบนี้ต้องใช้ ปริมาณที่ต้องใช้จะแสดงในเครื่องคำนวณ แล้วจึงตวงตามผลที่แสดง
      </p>
      <HaiterCalculator initialInput={{ sourcePercent: 6, targetPercent: 1, finalVolumeMl: 100, minimumMeasurableMl: 1 }} initialLabelBasis="w/w" />
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
  const [mediumContext, setMediumContext] = useState<MediumExecutionContext | null>(() => (
    MEDIUM_CALCULATOR_STEP_IDS.has(step.id)
      ? defaultMediumExecutionContext(manual.mediaRecipes, initialRecipeIdForStep(step.id))
      : null
  ));
  const onMediumPlanChange = useCallback((context: MediumExecutionContext | null) => setMediumContext(context), []);

  return (
    <article className="cl-guide-article">
      <header className="cl-guide-header">
      <p>
        <Link href={`/guide/${manual.slug}`}>{manual.commonName}</Link>
        {" · "}ขั้นที่ {number} จาก {total}
      </p>
      <h1>{step.title}</h1>
      <p>
        <EvidenceBadge level={step.evidence.level} />
        {step.durationMinutes != null ? (
          <>{" "}<span>ใช้เวลาราว {formatDurationMinutes(step.durationMinutes)}</span></>
        ) : null}
      </p>
      </header>
      <StepSections
        step={step}
        mediumContext={mediumContext}
        actionPrelude={(
          <>
            {step.id === "sterilize" ? <SterilizationCalculator /> : null}
            <BracketNotice step={step} />
            {MEDIUM_CALCULATOR_STEP_IDS.has(step.id) ? (
              <MediumCalculator recipes={manual.mediaRecipes} initialRecipeId={initialRecipeIdForStep(step.id)} onPlanChange={onMediumPlanChange} />
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
          </>
        )}
      />

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

      <nav className="cl-step-navigation" aria-label="เปลี่ยนขั้นคู่มือ">
        {previous ? (
          <Link
            className="cl-button-secondary"
            href={`/guide/${manual.slug}/step/${previous}`}
          >
            ‹ ขั้นที่ {previous}
          </Link>
        ) : null}
        {next ? (
          <Link
            className="cl-button-primary"
            href={`/guide/${manual.slug}/step/${next}`}
          >
            ขั้นที่ {next} ›
          </Link>
        ) : null}
      </nav>
    </article>
  );
}
