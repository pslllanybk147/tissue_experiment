import { describe, expect, test } from "vitest";
import {
  calculateNadccDose,
  nadccStockPpm,
  planNadccCleaningDose,
  planNadccWorkingDilution,
} from "./nadcc-calculations";

describe("nadccStockPpm", () => {
  test("แปลงเม็ด NaDCC เป็น ppm ของ stock ตามตัวอย่างจริงใน new_idea.md หัวข้อ 12", () => {
    // 1 เม็ด 2.97 g NaDCC ละลายใน 100 mL, available chlorine 60% → เอกสารคำนวณไว้ ~17,820 ppm
    expect(nadccStockPpm({ tabletMg: 2970, availableChlorinePercent: 60, stockVolumeMl: 100 })).toBe(17820);
  });

  test("ปฏิเสธค่าที่ไม่ใช่ตัวเลขบวก", () => {
    expect(() => nadccStockPpm({ tabletMg: 0, availableChlorinePercent: 60, stockVolumeMl: 100 })).toThrow("มากกว่า 0");
  });
});

describe("calculateNadccDose", () => {
  test("คำนวณปริมาตรต้นทางด้วย C1V1 = C2V2", () => {
    const result = calculateNadccDose({ stockPpm: 6000, targetPpm: 300, finalVolumeMl: 1000, minimumMeasurableMl: 1 });

    expect(result.sourceVolumeMl).toBe(50);
    expect(result.needsWorkingDilution).toBe(false);
    expect(result.formula).toContain("C1V1 = C2V2");
  });

  test("แนะนำ working dilution เมื่อปริมาตรที่ต้องตวงต่ำกว่าความละเอียดของเครื่องมือ", () => {
    const result = calculateNadccDose({ stockPpm: 6000, targetPpm: 300, finalVolumeMl: 10, minimumMeasurableMl: 1 });

    expect(result.sourceVolumeMl).toBe(0.5);
    expect(result.needsWorkingDilution).toBe(true);
    expect(result.warning).toContain("วัดไม่ได้อย่างน่าเชื่อถือ");
  });

  test("ปฏิเสธ target ppm ที่มากกว่าหรือเท่ากับ stock ppm", () => {
    expect(() =>
      calculateNadccDose({ stockPpm: 300, targetPpm: 300, finalVolumeMl: 100, minimumMeasurableMl: 1 }),
    ).toThrow("ต่ำกว่า stock");
  });
});

describe("planNadccWorkingDilution", () => {
  test("เจือจาง working stock ที่ตวงได้จริง", () => {
    const result = planNadccWorkingDilution({
      stockPpm: 6000,
      dilutionFactor: 10,
      workingVolumeMl: 100,
      targetPpm: 300,
      finalVolumeMl: 1000,
      minimumMeasurableMl: 1,
    });

    expect(result.workingPpm).toBe(600);
    expect(result.sourceVolumeMl).toBe(10);
    expect(result.diluentVolumeMl).toBe(90);
    expect(result.workingDoseMl).toBe(500);
    expect(result.isMeasurable).toBe(true);
  });

  test("working stock ที่อ่อนกว่าเป้าหมาย ต้องบอกตรง ๆ ว่าทำไม่ได้", () => {
    expect(() =>
      planNadccWorkingDilution({
        stockPpm: 6000,
        dilutionFactor: 100,
        workingVolumeMl: 100,
        targetPpm: 300,
        finalVolumeMl: 100,
        minimumMeasurableMl: 1,
      }),
    ).toThrow(/อ่อนกว่าเป้าหมาย/);
  });
});

describe("planNadccCleaningDose", () => {
  test("แยกค่าคำนวณจากค่าที่ตวงได้จริงตามความละเอียด 0.1 mL", () => {
    const result = planNadccCleaningDose({
      tabletMg: 2970,
      availableChlorinePercent: 60,
      stockVolumeMl: 100,
      targetPpm: 300,
      finalVolumeMl: 1000,
      minimumMeasurableMl: 0.1,
    });

    expect(result).toMatchObject({
      mode: "direct",
      calculatedVolumeMl: 16.835017,
      actionableVolumeMl: 16.8,
      actionableTargetPpm: 299.376,
      resolutionMl: 0.1,
      roundingDirection: "down",
    });
  });

  test("ตวงตรงจาก stock ได้อยู่แล้ว ไม่ต้องเจือจาง", () => {
    const result = planNadccCleaningDose({
      tabletMg: 2970,
      availableChlorinePercent: 60,
      stockVolumeMl: 100,
      targetPpm: 300,
      finalVolumeMl: 1000,
      minimumMeasurableMl: 1,
    });

    expect(result.mode).toBe("direct");
    if (result.mode === "direct") {
      expect(result.stockPpm).toBe(17820);
      expect(result.sourceVolumeMl).toBe(16.835017);
    }
  });

  test("ต้องเจือจางจริง เลือกอัตราเจือจางและปริมาตร working stock ให้เองโดยผู้ใช้ไม่ต้องกรอก", () => {
    const result = planNadccCleaningDose({
      tabletMg: 2970,
      availableChlorinePercent: 60,
      stockVolumeMl: 100,
      targetPpm: 300,
      finalVolumeMl: 10,
      minimumMeasurableMl: 1,
    });

    expect(result.mode).toBe("working-dilution");
    if (result.mode === "working-dilution") {
      expect(result.stockPpm).toBe(17820);
      expect(result.sourceVolumeMl).toBeGreaterThanOrEqual(1);
      expect(result.workingDoseMl).toBeLessThanOrEqual(result.workingVolumeMl);
    }
  });

  test("ไม่มีอัตราเจือจางไหนตวงได้จริงด้วยเครื่องมือนี้ ต้องบอกตรง ๆ ว่าทำไม่ได้", () => {
    expect(() =>
      planNadccCleaningDose({
        tabletMg: 2970,
        availableChlorinePercent: 60,
        stockVolumeMl: 100,
        targetPpm: 0.003,
        finalVolumeMl: 1,
        minimumMeasurableMl: 50,
      }),
    ).toThrow(/อุปกรณ์ตวงละเอียดไม่พอ/);
  });
});
