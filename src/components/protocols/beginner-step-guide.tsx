"use client";

import { useState } from "react";

import type {
  BeginnerInstruction,
  UncertaintyPath,
} from "@/lib/domain/models";
import { AccessibleAction } from "../common/accessible-action";
import { ProtocolReferenceVisual } from "./protocol-reference-visual";

type BeginnerStepGuideProps = {
  instruction: BeginnerInstruction;
  onReadinessChange: (ready: boolean) => void;
  onUncertainty: (path: UncertaintyPath) => void;
};

export function BeginnerStepGuide({
  instruction,
  onReadinessChange,
  onUncertainty,
}: BeginnerStepGuideProps) {
  const [checked, setChecked] = useState<boolean[]>(
    instruction.readyChecklist.map(() => false),
  );

  function updateCheck(index: number, value: boolean) {
    const next = checked.map((item, itemIndex) => (
      itemIndex === index ? value : item
    ));
    setChecked(next);
    onReadinessChange(next.length > 0 && next.every(Boolean));
  }

  return (
    <div className="beginner-step-guide">
      <GuideSection title="เป้าหมายของขั้นนี้">
        <p className="beginner-current-action">{instruction.currentAction}</p>
      </GuideSection>

      <GuideSection tone="warning" title="ก่อนเริ่ม">
        <BulletList items={instruction.doNotDoYet} />
      </GuideSection>

      <GuideSection title="ข้อมูลหรือผลที่ต้องตรวจ">
        <BulletList items={instruction.whatToFind} />
      </GuideSection>

      {instruction.visualAids?.length ? (
        <GuideSection title="ภาพประกอบของขั้นนี้">
          <p className="protocol-visual-disclaimer">
            ภาพต่อไปนี้เป็นภาพจำลองเพื่อช่วยหาตำแหน่ง ไม่ใช่ภาพต้นจริงของคุณ
          </p>
          <div className="protocol-visual-list">
            {instruction.visualAids.map((visual) => (
              <ProtocolReferenceVisual key={visual.id} visual={visual} />
            ))}
          </div>
        </GuideSection>
      ) : null}

      <GuideSection title="อุปกรณ์และสารที่ใช้">
        <ul className="beginner-materials">
          {instruction.materials.map((material) => (
            <li key={material.name}>
              <strong>{material.name}</strong>
            </li>
          ))}
        </ul>
        <p className="beginner-material-note">ตรวจชื่อบนฉลากหรือรายการอุปกรณ์ให้ตรงกับชื่อนี้ หากไม่แน่ใจอย่าใช้ของที่ดูคล้ายกันแทน</p>
      </GuideSection>

      <GuideSection title="วิธีทำ">
        <ol className="beginner-actions">
          {instruction.actions.map((action) => <li key={action}>{action}</li>)}
        </ol>
      </GuideSection>

      <GuideSection tone="danger" title="หยุดและตรวจสอบใหม่เมื่อ">
        <BulletList items={instruction.stopConditions} />
      </GuideSection>

      <GuideSection title="หลักฐานที่ควรบันทึก">
        <BulletList items={instruction.evidencePrompt} />
      </GuideSection>

      <GuideSection title="ตรวจว่าพร้อมไปต่อหรือยัง">
        <div className="beginner-readiness">
          {instruction.readyChecklist.map((item, index) => (
            <label key={item}>
              <input
                checked={checked[index] ?? false}
                onChange={(event) => updateCheck(index, event.target.checked)}
                type="checkbox"
              />
              <span>{item}</span>
            </label>
          ))}
        </div>
      </GuideSection>

      <GuideSection title="ถ้ายังไม่แน่ใจ">
        <div className="beginner-uncertainty-actions">
          {instruction.uncertaintyPaths.map((path) => (
            <AccessibleAction
              key={path.id}
              onClick={() => onUncertainty(path)}
            >
              {path.label}
            </AccessibleAction>
          ))}
        </div>
      </GuideSection>

      <details className="beginner-science">
        <summary>เหตุผลทางวิทยาศาสตร์</summary>
        <p>{instruction.scienceNote}</p>
      </details>
    </div>
  );
}

function GuideSection({
  children,
  title,
  tone = "normal",
}: {
  children: React.ReactNode;
  title: string;
  tone?: "normal" | "warning" | "danger";
}) {
  return (
    <section className={`beginner-guide-section beginner-guide-${tone}`}>
      <h4>{title}</h4>
      {children}
    </section>
  );
}

function BulletList({ items }: { items: string[] }) {
  return <ul>{items.map((item) => <li key={item}>{item}</li>)}</ul>;
}
