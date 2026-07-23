import type { ProtocolDraftInput } from "./models";

export type ProtocolDraftErrors = { title?: string; plantScope?: string; steps?: string; stepFields?: Record<string, string> };

export function validateProtocolDraft(input: ProtocolDraftInput): ProtocolDraftErrors {
  const errors: ProtocolDraftErrors = {};
  if (!input.title.trim()) errors.title = "กรุณาระบุชื่อ Protocol";
  if (!input.plantScope.trim()) errors.plantScope = "กรุณาระบุขอบเขตพืช";
  if (!input.steps.length) errors.steps = "ต้องมีอย่างน้อย 1 ขั้นตอน";
  const ids = new Set<string>();
  const fieldErrors: Record<string, string> = {};
  for (const step of input.steps) {
    const messages: string[] = [];
    if (ids.has(step.id)) errors.steps = "รหัสขั้นตอนซ้ำ";
    ids.add(step.id);
    if (!step.title.trim()) messages.push("กรุณาระบุชื่อขั้นตอน");
    if (!step.instruction.trim()) messages.push("กรุณาระบุคำสั่ง");
    if (step.durationMinutes !== null && step.durationMinutes < 0) messages.push("ระยะเวลาต้องไม่ติดลบ");
    if (messages.length) fieldErrors[step.id] = messages.join(" · ");
  }
  if (Object.keys(fieldErrors).length) errors.stepFields = fieldErrors;
  return errors;
}
