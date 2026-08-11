import Link from "next/link";
import { plainText } from "@/lib/manual/terms";
import type { ResolvedManual } from "@/lib/manual/types";
import { StatusNotice } from "@/components/common/status-notice";
import { EvidenceBadge, evidenceLabel } from "./evidence-badge";

export function StepMap({ manual }: { manual: ResolvedManual }) {
  const unsupported = manual.steps.filter((step) => step.evidence.level === "unsupported");

  return (
    <article className="cl-guide-article cl-atlas-reading">
      <header className="cl-guide-header">
        <p className="cl-chapter-kicker cl-guide-scientific">คู่มือชนิดพืช · {manual.scientificName}</p>
        <h1>{manual.commonName}</h1>
        <p>{manual.summary}</p>
        <small>{manual.steps.length} ขั้น · {manual.durationLabel}</small>
      </header>

      {unsupported.length > 0 ? (
        <StatusNotice tone="warning" title={`มี ${unsupported.length} ขั้นที่ยังไม่มีงานรองรับ`}>
          <p>ขั้นเหล่านี้ยังไม่มีงานวิจัยที่ทำกับพันธุ์นี้โดยตรง ให้ทำกระปุกเปล่าคุมทุกรอบและบันทึกผลจริงไว้เสมอ</p>
        </StatusNotice>
      ) : null}

      <ol className="cl-step-map">
        {manual.steps.map((step) => (
          <li key={step.id}>
            <Link href={`/guide/${manual.slug}/step/${step.order + 1}`}>
              <span className="cl-step-number">{step.order + 1}</span>
              <span className="cl-step-copy">
                <strong>{step.title}</strong>
                <span>{plainText(step.summary)}</span>
              </span>
              <EvidenceBadge level={step.evidence.level} />
            </Link>
          </li>
        ))}
      </ol>

      <section className="cl-guide-start">
        <div><h2>พร้อมลงมือแล้วหรือยัง</h2><p>อ่านให้จบก่อนเริ่มจะดีที่สุด พอกดเริ่มแล้วระบบจะจำให้ว่าทำถึงขั้นไหนและบันทึกค่าที่วัดได้ไว้ให้</p></div>
        <Link className="cl-button-primary" href={`/my/rounds/new?slug=${manual.slug}`}>เริ่มรอบเพาะของฉัน</Link>
        <small>ต้องล็อกอินตอนกดปุ่มนี้ เพื่อเก็บบันทึกไว้ให้คุณ</small>
      </section>

      <p className="cl-support-copy">คำอธิบายระดับหลักฐาน · {evidenceLabel["species-direct"]} คือมีงานวิจัยที่ทำกับพันธุ์นี้โดยตรง · {evidenceLabel.adapted} คือมีงานรองรับแต่ทำกับพืชอื่น · {evidenceLabel.unsupported} คือยังไม่มีงานตีพิมพ์รองรับ</p>
    </article>
  );
}
