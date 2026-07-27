import type { ProtocolDraftInput, ProtocolStep, ProtocolVersion } from "./models";
import { beginnerInstructionIssues, containsProhibitedEscalation } from "./zero-knowledge-protocol";

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
    if (step.beginner) {
      const beginnerIssues = beginnerInstructionIssues(step.beginner);
      if (beginnerIssues.length) {
        messages.push(`คู่มือมือใหม่ยังไม่ครบ: ${beginnerIssues.join(", ")}`);
      }
    }
    if (messages.length) fieldErrors[step.id] = messages.join(" · ");
  }
  if (Object.keys(fieldErrors).length) errors.stepFields = fieldErrors;
  return errors;
}

export function beginnerCompleteStepIssues(step: ProtocolStep): string[] {
  const issues: string[] = [];
  if (!step.objective?.trim()) issues.push("ไม่มีเป้าหมาย");
  if (!step.whyItMatters?.trim()) issues.push("ไม่มีเหตุผลว่าทำไมขั้นนี้สำคัญ");
  if (!step.materials?.length) issues.push("ไม่มีรายการอุปกรณ์หรือสาร");
  if (!step.expectedResult?.trim()) issues.push("ไม่มีผลที่ควรเห็น");
  if (!step.passCriteria?.length) issues.push("ไม่มีเกณฑ์ผ่าน");
  if (!step.failCriteria?.length) issues.push("ไม่มีเกณฑ์ไม่ผ่าน");
  if (!step.nextActionOnPass?.trim()) issues.push("ไม่มีขั้นถัดไปเมื่อผ่าน");
  if (!step.nextActionOnFail?.trim()) issues.push("ไม่มีวิธีแก้เมื่อไม่ผ่าน");
  if (!step.requiredEvidence?.length) issues.push("ไม่ระบุหลักฐานที่ต้องบันทึก");
  if (step.requiredEvidence?.includes("measurement") && !step.measurements?.some((item) => item.required)) issues.push("ต้องบันทึกค่าแต่ไม่มี measurement ที่บังคับ");
  if (step.requiredEvidence?.includes("photo") && !step.allowPhoto) issues.push("ต้องมีรูปแต่ปิดการอัปโหลดรูป");
  if (step.requiredEvidence?.includes("note") && !step.allowNote) issues.push("ต้องมี note แต่ปิดช่องบันทึก");
  if (step.evidenceState === "Verified" && !step.referenceIds.length) issues.push("Verified step ต้องมีแหล่งอ้างอิง");
  if (!step.beginner) issues.push("ไม่มีคู่มือสำหรับมือใหม่");
  else issues.push(...beginnerInstructionIssues(step.beginner));
  if (containsProhibitedEscalation(JSON.stringify(step))) issues.push("มีข้อความส่งผู้ใช้ไปหาผู้มีประสบการณ์หรือผู้เชี่ยวชาญ");
  return [...new Set(issues)];
}

export function protocolCompletenessIssues(steps: ProtocolStep[]): Record<string, string[]> {
  return Object.fromEntries(steps.map((step) => [step.id, beginnerCompleteStepIssues(step)] as const).filter(([, issues]) => issues.length));
}

export function isBeginnerCompleteProtocol(steps: ProtocolStep[]): boolean {
  return steps.length > 0 && Object.keys(protocolCompletenessIssues(steps)).length === 0;
}

export function validateProtocolForPublish(version: Pick<ProtocolVersion, "steps">): void {
  const issues = protocolCompletenessIssues(version.steps);
  if (Object.keys(issues).length) {
    const summary = Object.entries(issues).slice(0, 3).map(([stepId, messages]) => `${stepId}: ${messages.join(", ")}`).join(" · ");
    throw new Error(`คู่มือยังไม่สมบูรณ์และเผยแพร่ไม่ได้ · ${summary}`);
  }
}
