import { describe, expect, it } from "vitest";
import type { ExperimentLot, TrialArmRole } from "@/lib/domain/models";
import { resolveBySlug } from "@/lib/manual/registry";
import { projectTrialSteps } from "./project-trial-steps";

const manual = resolveBySlug("violin-variegated")!;

function trialLot(armRole: TrialArmRole): ExperimentLot {
  return {
    id: `lot-${armRole}`,
    ownerId: "owner-1",
    plant: manual.commonName,
    protocolId: manual.slug,
    protocolTitle: manual.scientificName,
    stage: "receive",
    status: "Healthy",
    startedAt: "2026-08-09",
    createdAt: "2026-08-09T00:00:00.000Z",
    updatedAt: "2026-08-09T00:00:00.000Z",
    workflowVersion: "v2",
    trialId: "trial-1",
    armRole,
    isBlank: armRole === "control-b",
  };
}

function sterilizationText(armRole: TrialArmRole): string {
  const step = projectTrialSteps(manual.steps, trialLot(armRole)).find((item) => item.id === "sterilize");
  return JSON.stringify(step);
}

describe("projectTrialSteps", () => {
  it("ไม่แก้ shared manual และคืนสำเนาสำหรับรอบปกติ", () => {
    const ordinaryLot = { ...trialLot("control-a"), armRole: undefined, trialId: undefined };
    const projected = projectTrialSteps(manual.steps, ordinaryLot);

    expect(projected).toEqual(manual.steps);
    expect(projected).not.toBe(manual.steps);
    expect(projected[0]).not.toBe(manual.steps[0]);
  });

  it("T1 แสดง Haiter กับ NaClO 300 ppm เท่านั้นและไม่มี bracket", () => {
    const text = sterilizationText("t1");

    expect(text).toMatch(/Haiter|ไฮเตอร์/);
    expect(text).toContain("NaClO");
    expect(text).toContain("300 ppm");
    expect(text).not.toContain("NaDCC");
    expect(text).not.toMatch(/150|450/);
  });

  it("T2 แสดง Haiter กับ NaDCC rinse 300 ppm เท่านั้นและไม่มี bracket", () => {
    const text = sterilizationText("t2");

    expect(text).toMatch(/Haiter|ไฮเตอร์/);
    expect(text).toContain("NaDCC");
    expect(text).toContain("300 ppm");
    expect(text).not.toContain("NaClO");
    expect(text).not.toMatch(/150|450|24 ถึง 48 ชั่วโมง/);
  });

  it("T3 แสดง NaDCC soak 300 ppm 24–48 ชั่วโมงโดยไม่มี Haiter, NaOCl หรือ rinse เสริม", () => {
    const text = sterilizationText("t3");

    expect(text).toContain("NaDCC");
    expect(text).toContain("300 ppm");
    expect(text).toMatch(/24 ถึง 48 ชั่วโมง/);
    expect(text).not.toMatch(/Haiter|ไฮเตอร์|NaOCl|NaClO|rinse|150|450/);
  });

  it.each(["t1", "t2"] as const)("%s มีช่องผลปนเปื้อนที่ใช้ปลดล็อก T3", (role) => {
    const step = projectTrialSteps(manual.steps, trialLot(role)).find((item) => item.id === "check-contamination")!;

    expect(step.measurements.map((measurement) => measurement.id)).toEqual(expect.arrayContaining([
      "container-total",
      "container-clean",
      "container-usable",
    ]));
  });

  it("Control-B เป็น blank workflow เจ็ดขั้นโดยไม่มีภาษาที่สั่งจัดการ explant", () => {
    const projected = projectTrialSteps(manual.steps, trialLot("control-b"));

    expect(projected.map((step) => step.id)).toEqual([
      "blank-prepare",
      "blank-medium",
      "blank-container",
      "blank-pour",
      "blank-seal",
      "blank-incubate",
      "blank-observe",
    ]);
    expect(JSON.stringify(projected)).not.toMatch(/explant|ชิ้นพืช|ตัดข้อ|ฟอกผิว|วางชิ้น/);
  });
});

describe("ค่าที่ต้องบันทึกจริงของแขน NaDCC", () => {
  it("ภาพเปรียบเทียบ Haiter กับ NaDCC แสดงเฉพาะ T2 ที่ใช้ทั้งสองสาร", () => {
    for (const role of ["control-a", "t1", "t2", "t3"] as const) {
      const sterilize = projectTrialSteps(manual.steps, trialLot(role)).find((step) => step.id === "sterilize")!;
      expect(sterilize.illustrationId, role).toBe(role === "t2" ? "sterilant-sequence" : "sterilize-timer");
    }
  });

  it("T2 เก็บ product, batch, actual ppm, volume และ rinse count โดยไม่บังคับ final sterile rinse", () => {
    const sterilize = projectTrialSteps(manual.steps, trialLot("t2")).find((step) => step.id === "sterilize")!;
    const ids = sterilize.measurements.map((field) => field.id);

    expect(ids).toEqual(expect.arrayContaining([
      "stock-product", "stock-batch", "rinse-product", "rinse-batch", "rinse-actual-ppm",
      "rinse-stock-volume-ml", "rinse-final-volume-ml", "sterile-rinses",
    ]));
    expect(sterilize.measurements.find((field) => field.id === "final-rinse")).toBeUndefined();
  });

  it.each(["t1", "t2"] as const)("%s ใช้ chlorinated rinse 3 รอบโดยไม่ต้องใช้น้ำปลอดเชื้อในแขนนี้", (role) => {
    const text = sterilizationText(role);
    expect(text).toContain("3 รอบ");
    expect(text).not.toContain("ล้างสารฟอกออกด้วยน้ำปลอดเชื้อ");
    expect(text).not.toContain("ล้างครั้งสุดท้ายด้วยน้ำปลอดเชื้อ");
  });

  it("Control-A และ T3 ยังใช้น้ำปลอดเชื้อคนละ protocol", () => {
    expect(sterilizationText("control-a")).toContain("น้ำปลอดเชื้อ 3 รอบ");
    expect(sterilizationText("t3")).toContain("น้ำปลอดเชื้อ 3 รอบ");
  });

  it("T3 เก็บ actual ppm, volume, ชั่วโมงแช่ และจำนวนรอบล้าง", () => {
    const sterilize = projectTrialSteps(manual.steps, trialLot("t3")).find((step) => step.id === "sterilize")!;
    expect(sterilize.measurements.map((field) => field.id)).toEqual(expect.arrayContaining([
      "stock-product", "stock-batch", "nadcc-actual-ppm", "stock-volume-ml", "final-volume-ml", "soak-hours", "sterile-washes",
    ]));
  });
});
