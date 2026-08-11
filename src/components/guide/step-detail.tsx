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
    <section className="cl-reading-section cl-guide-chapter">
      <h2>ถ้าเจออาการแบบนี้</h2>
      <div className="cl-guide-problem-list">
        {entries.map((entry) => (
          <article className="cl-guide-problem" key={entry.id}>
            <h3>{entry.symptom}</h3>
            <p>{entry.likelyCause}</p>
            {entry.distinguish ? (
              <p>
                <strong>วิธีแยกจากอาการที่คล้ายกัน</strong> {entry.distinguish}
              </p>
            ) : null}
            <h4>ทำอะไรต่อ</h4>
            <ol className="cl-instruction-list">
              {entry.actions.map((action) => <li key={action}><RichText source={action} /></li>)}
            </ol>
            <p><EvidenceBadge level={entry.evidence.level} /></p>
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
    <article className="cl-guide-article cl-atlas-reading">
      <header className="cl-guide-header">
        <p className="cl-chapter-kicker">
          <Link className="cl-inline-link" href={`/guide/${manual.slug}`}>{manual.commonName}</Link>
          {" · "}บทที่ {number} จาก {total}
        </p>
        <h1>{step.title}</h1>
        <p className="cl-guide-meta-row">
          <EvidenceBadge level={step.evidence.level} />
          {step.durationMinutes != null ? (
            <span>ใช้เวลาราว {formatDurationMinutes(step.durationMinutes)}</span>
          ) : null}
        </p>
      </header>
      <div className="cl-guide-chapters">
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
                <figure className="cl-guide-illustration">
                  <Illustration id={step.illustrationId} />
                  {illustrationCredits[step.illustrationId] ? (
                    <figcaption>{illustrationCredits[step.illustrationId]}</figcaption>
                  ) : null}
                </figure>
              ) : null}
            </>
          )}
        />
      </div>

      <Troubleshooting ids={step.troubleshootingIds ?? []} />

      {step.evidence.note || step.evidence.sourceIds.length > 0 ? (
        <aside className="cl-guide-evidence-aside" aria-labelledby="step-evidence-heading">
          <h2 id="step-evidence-heading">ที่มาของคำแนะนำนี้</h2>
          {step.evidence.note ? <p>{step.evidence.note}</p> : null}
          {step.evidence.sourceIds.length > 0 ? (
            <ul>
              {step.evidence.sourceIds.map((id) => {
                const source = sourceById(id);
                const page = step.evidence.sourcePages?.[id];
                return (
                  <li key={id}>
                    {source ? <a className="cl-inline-link" href={source.url}>{source.title}</a> : id}
                    {page ? ` — ${page}` : null}
                  </li>
                );
              })}
            </ul>
          ) : null}
        </aside>
      ) : null}

      {step.referenceImages && step.referenceImages.length > 0 ? (
        <section className="cl-reading-section cl-guide-chapter">
          <h2>ภาพอ้างอิงภายนอก (ดูลักษณะเท่านั้น)</h2>
          <p>
            ลิงก์ไปหน้าเว็บภายนอกเพื่อดูลักษณะเท่านั้น ไม่ใช่คำแนะนำตำแหน่งตัดหรือหลักฐานของขั้นนี้
          </p>
          <ul className="cl-guide-source-list">
            {step.referenceImages.map((image) => (
              <li key={image.url}>
                <a className="cl-inline-link" href={image.url}>{image.label}</a>
                <p>{image.note}</p>
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
