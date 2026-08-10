import type { ResolvedStep } from "@/lib/manual/types";
import type { DoseValue } from "@/lib/domain/models";
import { RichText } from "@/components/guide/rich-text";
import { StatusNotice } from "@/components/common/status-notice";
import { mediumInstructionOverride, type MediumExecutionContext } from "@/lib/rounds/medium-execution";

function TextList({ items }: { items: string[] }) {
  return <ul style={{ margin: "8px 0 0", paddingLeft: "20px", display: "flex", flexDirection: "column", gap: "6px" }}>{items.map((item) => <li key={item}><RichText source={item} /></li>)}</ul>;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="cl-protocol-section"><h2>{title}</h2>{children}</section>;
}

function ExecutionInstructions({
  step,
  mediumContext,
  chemicalDose,
}: {
  step: ResolvedStep;
  mediumContext?: MediumExecutionContext | null;
  chemicalDose?: DoseValue;
}) {
  if (!step.executionInstructions || step.executionInstructions.length === 0) return null;

  return (
    <Section title="ทำตามลำดับ">
      <ol className="execution-instructions">
        {step.executionInstructions.map((instruction, index) => (
          <li className={`execution-instruction execution-instruction-${instruction.tone ?? "normal"}`} key={`${instruction.label}-${index}`}>
            <div className="execution-instruction-heading">
              <span className="execution-instruction-number">{index + 1}</span>
              <h3>{instruction.label}</h3>
            </div>
            {(() => {
              const override = mediumContext ? mediumInstructionOverride(instruction.label, mediumContext) : null;
              const action = override?.action || instruction.action;
              const calculatedQuantity = chemicalDose && /ฆ่าเชื้ออาหารด้วย (?:Haiter|NaDCC)/.test(instruction.label)
                ? `${chemicalDose.value} ${chemicalDose.unit}`
                : undefined;
              const quantity = override?.quantity || instruction.quantity || calculatedQuantity;
              const completion = override?.completion || instruction.completion;
              const next = override?.next || instruction.next;
              return <>
                <div className="execution-instruction-action"><RichText source={action} /></div>
                {(instruction.materials?.length || quantity || instruction.container || instruction.durationMinutes != null || instruction.durationLabel) ? (
              <dl className="execution-instruction-details">
                {instruction.materials?.length ? <><dt>ใช้</dt><dd><TextList items={instruction.materials} /></dd></> : null}
                {quantity ? <><dt>ปริมาณ</dt><dd><RichText source={quantity} /></dd></> : null}
                {instruction.container ? <><dt>ภาชนะ</dt><dd className="execution-instruction-container"><RichText source={instruction.container} /></dd></> : null}
                {instruction.durationMinutes != null ? <><dt>เวลา</dt><dd>{instruction.durationMinutes} นาที</dd></> : null}
                {instruction.durationLabel ? <><dt>เวลา</dt><dd><RichText source={instruction.durationLabel} /></dd></> : null}
              </dl>
                ) : null}
                {completion ? <div className="execution-instruction-completion"><strong>เสร็จเมื่อ:</strong> <RichText source={completion} /></div> : null}
                {next ? <div className="execution-instruction-next"><strong>ต่อไป:</strong> <RichText source={next} /></div> : null}
              </>;
            })()}
          </li>
        ))}
      </ol>
    </Section>
  );
}

export function StepSections({
  step,
  actionPrelude,
  mediumContext,
  chemicalDose,
}: {
  step: ResolvedStep;
  actionPrelude?: React.ReactNode;
  mediumContext?: MediumExecutionContext | null;
  chemicalDose?: DoseValue;
}) {
  return (
    <>
      <Section title="ขั้นนี้ต้องได้อะไร">
        <div className="pl-lede" style={{ marginTop: "8px" }}><RichText source={step.summary} /></div>
      </Section>

      <Section title="เตรียมของ">
        {step.materials.length > 0 ? <TextList items={step.materials} /> : <p className="pl-lede" style={{ marginTop: "8px" }}>ขั้นนี้ไม่ต้องเตรียมของเพิ่ม</p>}
      </Section>

      {step.safetyNotes.length > 0 ? (
        <StatusNotice tone="blocked" title="อ่านก่อนลงมือ: ความปลอดภัย">
          <TextList items={step.safetyNotes} />
        </StatusNotice>
      ) : null}

      {actionPrelude}

      {step.executionInstructions?.length ? <ExecutionInstructions step={step} mediumContext={mediumContext} chemicalDose={chemicalDose} /> : (
        <Section title="ทำทีละข้อ">
          <ol style={{ margin: "8px 0 0", paddingLeft: "20px", display: "flex", flexDirection: "column", gap: "8px" }}>
            {step.actions.map((action) => <li key={action}><RichText source={action} /></li>)}
          </ol>
        </Section>
      )}

      <Section title="ทำไปทำไม">
        <div className="pl-lede" style={{ marginTop: "8px" }}><RichText source={step.why} /></div>
      </Section>

      <Section title="ผ่านเมื่อ">
        <TextList items={step.passCriteria} />
      </Section>

      <Section title="หยุดเมื่อ">
        <StatusNotice tone="blocked" title="เงื่อนไขให้หยุดทันที">
          <TextList items={step.stopConditions} />
        </StatusNotice>
      </Section>

    </>
  );
}
