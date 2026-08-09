import { plainText } from "./terms";
import type { ResolvedManual } from "./types";

export type CopyIssueCode = "long-action" | "multiple-actions" | "unexplained-term" | "vague-unit" | "conflicting-instruction";
export type CopyIssue = {
  slug: string;
  stepId: string;
  field: string;
  code: CopyIssueCode;
  text: string;
};

const rawTechnicalTerm = /\b(?:explant|working dilution)\b/i;
const vagueNumber = /\b\d+(?:\.\d+)?\s*(?:หน่วย|นิดหน่อย)\b/;
const contradiction = /(?:ห้าม|ไม่ต้อง)[^。.!?]{0,60}(?:แต่)?\s*(?:ให้|ต้อง)ทำสิ่งเดียวกัน/;

function inspectText(manual: ResolvedManual, stepId: string, field: string, source: string, action: boolean): CopyIssue[] {
  const text = plainText(source).trim();
  const issues: CopyIssue[] = [];
  if (action && text.length > 320) issues.push({ slug: manual.slug, stepId, field, code: "long-action", text });
  if (action) {
    const connectors = text.match(/แล้ว|จากนั้น|ต่อด้วย/g)?.length ?? 0;
    if (connectors >= 3) issues.push({ slug: manual.slug, stepId, field, code: "multiple-actions", text });
  }
  if (rawTechnicalTerm.test(text)) issues.push({ slug: manual.slug, stepId, field, code: "unexplained-term", text });
  if (vagueNumber.test(text)) issues.push({ slug: manual.slug, stepId, field, code: "vague-unit", text });
  if (contradiction.test(text)) issues.push({ slug: manual.slug, stepId, field, code: "conflicting-instruction", text });
  return issues;
}

export function auditBeginnerCopy(manual: ResolvedManual): CopyIssue[] {
  return manual.steps.flatMap((step) => [
    ...inspectText(manual, step.id, "title", step.title, false),
    ...inspectText(manual, step.id, "summary", step.summary, false),
    ...step.materials.flatMap((text, index) => inspectText(manual, step.id, `materials[${index}]`, text, false)),
    ...step.actions.flatMap((text, index) => inspectText(manual, step.id, `actions[${index}]`, text, true)),
    ...step.passCriteria.flatMap((text, index) => inspectText(manual, step.id, `passCriteria[${index}]`, text, false)),
    ...step.stopConditions.flatMap((text, index) => inspectText(manual, step.id, `stopConditions[${index}]`, text, false)),
  ]);
}
