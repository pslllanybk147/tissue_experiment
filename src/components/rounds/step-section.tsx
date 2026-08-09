import type { ResolvedStep } from "@/lib/manual/types";
import { RichText } from "@/components/guide/rich-text";

function TextList({ items }: { items: string[] }) {
  return <ul style={{ margin: "8px 0 0", paddingLeft: "20px", display: "flex", flexDirection: "column", gap: "6px" }}>{items.map((item) => <li key={item}><RichText source={item} /></li>)}</ul>;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <section style={{ marginTop: "18px" }}><h2 className="pl-h2">{title}</h2>{children}</section>;
}

export function StepSections({ step, actionPrelude }: { step: ResolvedStep; actionPrelude?: React.ReactNode }) {
  return (
    <>
      <Section title="ขั้นนี้ต้องได้อะไร">
        <p className="pl-lede" style={{ marginTop: "8px" }}><RichText source={step.summary} /></p>
      </Section>

      <Section title="เตรียมของ">
        {step.materials.length > 0 ? <TextList items={step.materials} /> : <p className="pl-lede" style={{ marginTop: "8px" }}>ขั้นนี้ไม่ต้องเตรียมของเพิ่ม</p>}
      </Section>

      {step.safetyNotes.length > 0 ? (
        <div className="pl-card" role="alert" style={{ background: "var(--pl-stop)", marginTop: "18px" }}>
          <p className="pl-mono" style={{ color: "var(--pl-ink-2)" }}>อ่านก่อนลงมือ: ความปลอดภัย</p>
          <TextList items={step.safetyNotes} />
        </div>
      ) : null}

      {actionPrelude}

      <Section title="ทำทีละข้อ">
        <ol style={{ margin: "8px 0 0", paddingLeft: "20px", display: "flex", flexDirection: "column", gap: "8px" }}>
          {step.actions.map((action) => <li key={action}><RichText source={action} /></li>)}
        </ol>
      </Section>

      <Section title="ทำไปทำไม">
        <p className="pl-lede" style={{ marginTop: "8px" }}><RichText source={step.why} /></p>
      </Section>

      <Section title="ผ่านเมื่อ">
        <TextList items={step.passCriteria} />
      </Section>

      <Section title="หยุดเมื่อ">
        <div className="pl-soft-card" role="alert" style={{ marginTop: "8px", background: "var(--pl-stop)" }}>
          <TextList items={step.stopConditions} />
        </div>
      </Section>

    </>
  );
}
