"use client";

import { useState } from "react";

import type {
  BeginnerInstruction,
  UncertaintyPath,
} from "@/lib/domain/models";
import { AccessibleAction } from "../common/accessible-action";

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
      <GuideSection title="ตอนนี้กำลังทำอะไร">
        <p className="beginner-current-action">{instruction.currentAction}</p>
      </GuideSection>

      <GuideSection tone="warning" title="ตอนนี้ยังห้ามทำอะไร">
        <BulletList items={instruction.doNotDoYet} />
      </GuideSection>

      <GuideSection title="สิ่งที่ต้องมองหา">
        <BulletList items={instruction.whatToFind} />
      </GuideSection>

      <GuideSection title="ของที่ต้องหยิบ">
        <ul className="beginner-materials">
          {instruction.materials.map((material) => (
            <li key={material.name}>
              <strong>{material.name}</strong>
              <span>หน้าตา: {material.appearance}</span>
              <span>ใช้เพื่อ: {material.purpose}</span>
            </li>
          ))}
        </ul>
      </GuideSection>

      <GuideSection title="ทำทีละข้อ">
        <ol className="beginner-actions">
          {instruction.actions.map((action) => <li key={action}>{action}</li>)}
        </ol>
      </GuideSection>

      <GuideSection tone="danger" title="หยุดทันทีถ้า">
        <BulletList items={instruction.stopConditions} />
      </GuideSection>

      <GuideSection title="บันทึกอะไรไว้">
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
