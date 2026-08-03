import type { Observation, ObservationInput } from "@/lib/domain/models";

/**
 * รูปของแต่ละขั้นแขวนไว้กับ observation หนึ่งรายการต่อขั้น เพราะโครงข้อมูลเดิม
 * ผูกสื่อไว้กับ observation ไม่ใช่กับ step run โดยตรง observation ตัวนี้ทำหน้าที่
 * เป็นที่แขวนเท่านั้น จึงไม่ใส่ค่านับใด ๆ เพื่อไม่ให้ไปปนกับผลสังเกตที่ผู้ใช้จดเอง
 */
export function evidenceObservationInput(stepId: string, observedAt: string): ObservationInput {
  return {
    observedAt,
    status: "Healthy",
    stage: stepId,
    note: "",
    shootCount: null,
    rootCount: null,
    contaminationCount: null,
    kind: "protocol-step-evidence",
    protocolStepId: stepId,
  };
}

export function findEvidenceObservation(observations: Observation[], stepId: string): Observation | null {
  return observations.find((item) =>
    item.kind === "protocol-step-evidence"
    && item.protocolStepId === stepId
    && !item.deletedAt) ?? null;
}
