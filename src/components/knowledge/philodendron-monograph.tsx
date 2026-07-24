import Link from "next/link";
import type { PhilodendronMonograph as Monograph } from "@/lib/domain/philodendron-knowledge";

function evidenceClass(value: string) { return `evidence-label evidence-${value.toLowerCase().replaceAll(" ", "-")}`; }

export function PhilodendronMonograph({ monograph }: { monograph: Monograph }) {
  return <div className="monograph-layout">
    <header className="route-heading">
      <div><p className="eyebrow">PHILODENDRON MONOGRAPH</p><h1>{monograph.title}</h1><p>{monograph.subtitle}</p></div>
      <div className="route-actions"><span className={evidenceClass(monograph.tissueCulture.steps[0].evidenceState)}>{monograph.tissueCulture.steps[0].evidenceState}</span><Link className="primary-button" href={`/plants/new?taxon=${encodeURIComponent(monograph.taxonId)}`}>เริ่ม Plant Record</Link></div>
    </header>
    <div className="experiment-surface form-alert"><strong>ขอบเขตหลักฐาน:</strong> {monograph.tissueCulture.disclaimer}</div>
    <div className="monograph-sections">
      {monograph.sections.map((section) => <section className="experiment-surface" key={section.id} id={section.id}>
        <div className="knowledge-detail-heading"><div><p className="eyebrow">KNOWLEDGE SECTION</p><h2>{section.title}</h2></div><span className={evidenceClass(section.claims[0]?.evidenceState ?? "Pending review")}>{section.claims[0]?.evidenceState ?? "Pending review"}</span></div>
        <p>{section.summary}</p>
        {section.claims.length ? <ul>{section.claims.map((claim) => <li key={claim.id}>{claim.statement} <span className={evidenceClass(claim.evidenceState)}>{claim.evidenceState}</span>{claim.note && <small className="knowledge-claim-source">{claim.note}</small>}</li>)}</ul> : <p className="muted-copy">ยังไม่มี claim ที่ผ่านการตรวจ</p>}
      </section>)}
    </div>
    <section className="experiment-surface" id="tissue-culture">
      <div className="knowledge-detail-heading"><div><p className="eyebrow">GUIDED TISSUE-CULTURE MANUAL</p><h2>คู่มือ 18 ขั้น</h2></div><span>{monograph.tissueCulture.steps.length} steps</span></div>
      <p>{monograph.tissueCulture.mediaNotes.join(" ")}</p>
      <div className="monograph-step-list">{monograph.tissueCulture.steps.map((step) => <article className="protocol-reading-step monograph-step" key={step.id}>
        <span>{step.order}</span><div><div className="knowledge-detail-heading"><h3>{step.title}</h3><span className={evidenceClass(step.evidenceState)}>{step.evidenceState}</span></div><p><strong>ทำเพื่อ:</strong> {step.objective}</p><h4>วิธีทำ</h4><ol>{step.instructions.map((instruction) => <li key={instruction}>{instruction}</li>)}</ol><h4>เตรียมอะไร</h4><p>{step.materials.join(" · ")}</p><h4>จุดควบคุมและความปลอดภัย</h4><ul>{[...step.criticalControls, ...step.safetyNotes].map((item) => <li key={item}>{item}</li>)}</ul><p><strong>ผลที่ควรเห็น:</strong> {step.expectedResult}</p><p><strong>ผ่านเมื่อ:</strong> {step.passCriteria.join("; ")}</p><p><strong>ไม่ผ่านเมื่อ:</strong> {step.failCriteria.join("; ")}</p>{step.measurements && <p><strong>ค่าที่ต้องบันทึก:</strong> {step.measurements.map((measurement) => `${measurement.label} (${measurement.unit})`).join(" · ")}</p>}</div>
      </article>)}</div>
    </section>
  </div>;
}
