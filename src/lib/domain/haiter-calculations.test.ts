import { describe, expect, test } from "vitest";
import {
  calculateHaiterDose,
  planHaiterCleaningDose,
  planHaiterWorkingDilution,
  toWeightPerVolumePercent,
} from "./haiter-calculations";

describe("calculateHaiterDose", () => {
  test("calculates source volume with C1V1 = C2V2", () => {
    const result = calculateHaiterDose({
      sourcePercent: 6,
      targetPercent: 0.003,
      finalVolumeMl: 1000,
      minimumMeasurableMl: 0.1,
    });

    expect(result.sourceVolumeMl).toBe(0.5);
    expect(result.needsWorkingDilution).toBe(false);
    expect(result.formula).toContain("C1V1 = C2V2");
  });

  test("recommends working dilution when dose is below tool capability", () => {
    const result = calculateHaiterDose({
      sourcePercent: 6,
      targetPercent: 0.003,
      finalVolumeMl: 100,
      minimumMeasurableMl: 0.1,
    });

    expect(result.sourceVolumeMl).toBe(0.05);
    expect(result.needsWorkingDilution).toBe(true);
    expect(result.warning).toContain("วัดไม่ได้อย่างน่าเชื่อถือ");
  });

  test("rejects a target concentration at or above source concentration", () => {
    expect(() => calculateHaiterDose({
      sourcePercent: 5,
      targetPercent: 5,
      finalVolumeMl: 100,
      minimumMeasurableMl: 0.1,
    })).toThrow("ต่ำกว่า source");
  });

  test("rejects non-positive values", () => {
    expect(() => calculateHaiterDose({
      sourcePercent: 0,
      targetPercent: 0.003,
      finalVolumeMl: 100,
      minimumMeasurableMl: 0.1,
    })).toThrow("มากกว่า 0");
  });
});

describe("planHaiterWorkingDilution", () => {
  test("creates a measurable 1 to 10 working dilution", () => {
    const result = planHaiterWorkingDilution({
      sourcePercent: 6,
      dilutionFactor: 10,
      workingVolumeMl: 10,
      targetPercent: 0.003,
      finalVolumeMl: 100,
      minimumMeasurableMl: 0.1,
    });

    expect(result.workingPercent).toBe(0.6);
    expect(result.sourceVolumeMl).toBe(1);
    expect(result.diluentVolumeMl).toBe(9);
    expect(result.workingDoseMl).toBe(0.5);
    expect(result.isMeasurable).toBe(true);
  });
});

describe("planHaiterWorkingDilution · กรณีที่ทำตามไม่ได้จริง", () => {
  // เจอจากการใช้งานจริงเมื่อ 7 สิงหาคม 2026 กรอกต้นทาง 6% เจือจาง 10 เท่า เป้าหมาย 1%
  // ระบบเคยตอบว่า "ตวง working stock ใส่จริง 166.666667 mL" ทั้งที่ปริมาตรสุดท้ายคือ 100 mL
  // ซึ่งเทลงไปไม่ได้ และ working stock 0.6% อ่อนกว่าเป้าหมาย 1% จึงไม่มีทางถึงเป้าอยู่แล้ว
  test("working stock ที่อ่อนกว่าเป้าหมาย ต้องไม่คืนตัวเลข แต่ต้องบอกว่าทำไม่ได้", () => {
    expect(() =>
      planHaiterWorkingDilution({
        sourcePercent: 6,
        dilutionFactor: 10,
        workingVolumeMl: 100,
        targetPercent: 1,
        finalVolumeMl: 100,
        minimumMeasurableMl: 0.1,
      }),
    ).toThrow(/อ่อนกว่าเป้าหมาย/);
  });

  test("เมื่อตวงตรงได้อยู่แล้ว ต้องบอกวิธีที่ใช้ได้จริง ไม่ใช่แค่บอกว่าผิด", () => {
    expect(() =>
      planHaiterWorkingDilution({
        sourcePercent: 6,
        dilutionFactor: 10,
        workingVolumeMl: 100,
        targetPercent: 1,
        finalVolumeMl: 100,
        minimumMeasurableMl: 0.1,
      }),
    ).toThrow(/16\.666667 mL/);
  });

  test("ปริมาตรที่ต้องตวง ต้องไม่เกินปริมาตรสุดท้ายในทุกกรณีที่คำนวณสำเร็จ", () => {
    const result = planHaiterWorkingDilution({
      sourcePercent: 6,
      dilutionFactor: 10,
      workingVolumeMl: 100,
      targetPercent: 0.3,
      finalVolumeMl: 100,
      minimumMeasurableMl: 0.1,
    });
    expect(result.workingDoseMl).toBeLessThanOrEqual(100);
  });

  test("working stock เท่ากับเป้าหมายพอดี ยังใช้ได้ คือใช้ทั้งหมดโดยไม่เติมน้ำอีก", () => {
    const result = planHaiterWorkingDilution({
      sourcePercent: 6,
      dilutionFactor: 10,
      workingVolumeMl: 200,
      targetPercent: 0.6,
      finalVolumeMl: 100,
      minimumMeasurableMl: 0.1,
    });
    expect(result.workingDoseMl).toBe(100);
  });
});

describe("toWeightPerVolumePercent", () => {
  test("ฉลากที่เป็น w/v อยู่แล้ว ใช้ค่าเดิมไม่แปลง", () => {
    expect(toWeightPerVolumePercent(6, "w/v")).toBe(6);
  });

  // ไฮเตอร์ที่เจ้าของมีจริงระบุ 6% w/w การกรอก 6 ลงไปตรง ๆ ทำให้คิดคลอรีนต่ำกว่าจริง
  test("ฉลากที่เป็น w/w ต้องคูณความหนาแน่นก่อน", () => {
    expect(toWeightPerVolumePercent(6, "w/w")).toBe(6.48);
  });

  test("ค่าที่ไม่ใช่ตัวเลขบวก ต้องไม่คืนตัวเลขเงียบ ๆ", () => {
    expect(() => toWeightPerVolumePercent(0, "w/w")).toThrow();
  });
});

describe("planHaiterCleaningDose", () => {
  test("ตวงตรงได้อยู่แล้ว ไม่ต้องเจือจาง", () => {
    const result = planHaiterCleaningDose({
      sourcePercent: 6,
      targetPercent: 1,
      finalVolumeMl: 100,
      minimumMeasurableMl: 1,
    });

    expect(result.mode).toBe("direct");
    if (result.mode === "direct") {
      expect(result.sourceVolumeMl).toBe(16.666667);
    }
  });

  // ภาพหน้าจอจริงจากผู้ใช้ 7 สิงหาคม 2026: กรอก 6% w/w (=6.48% w/v), เป้าหมาย 1%,
  // ปริมาตรสุดท้าย 100 mL, ตวงละเอียดสุด 0.1 mL แล้วเข้าใจผิดว่าต้องเจือจางก่อน
  // ทั้งที่ตวงตรงจากขวดต้นทางได้อยู่แล้ว (15.432099 mL > 0.1 mL) ฟอร์มเดียวต้องไม่พาไป
  // เจือจางเกินจำเป็นแบบนั้นอีก
  test("ตัวเลขจากภาพหน้าจอจริงของผู้ใช้ ต้องได้ตวงตรง ไม่ใช่ working dilution", () => {
    const result = planHaiterCleaningDose({
      sourcePercent: 6.48,
      targetPercent: 1,
      finalVolumeMl: 100,
      minimumMeasurableMl: 0.1,
    });

    expect(result.mode).toBe("direct");
    if (result.mode === "direct") {
      expect(result.sourceVolumeMl).toBe(15.432099);
    }
  });

  test("ต้องเจือจางจริง เลือกอัตราเจือจางและปริมาตร working stock ให้เองโดยผู้ใช้ไม่ต้องกรอก", () => {
    const result = planHaiterCleaningDose({
      sourcePercent: 6,
      targetPercent: 0.05,
      finalVolumeMl: 10,
      minimumMeasurableMl: 0.5,
    });

    expect(result.mode).toBe("working-dilution");
    if (result.mode === "working-dilution") {
      expect(result.dilutionFactor).toBe(6);
      expect(result.workingPercent).toBe(1);
      expect(result.workingVolumeMl).toBe(20);
      expect(result.sourceVolumeMl).toBe(3.333333);
      expect(result.diluentVolumeMl).toBe(16.666667);
      expect(result.workingDoseMl).toBe(0.5);
      // ต้องตวงได้จริงทั้งสองขั้น: ตวงต้นทางเข้า working stock ได้ไม่ต่ำกว่าเครื่องมือขั้นต่ำ
      expect(result.sourceVolumeMl).toBeGreaterThanOrEqual(0.5);
      // และตวงจาก working stock ได้ไม่เกินปริมาตรที่เตรียมไว้จริง
      expect(result.workingDoseMl).toBeLessThanOrEqual(result.workingVolumeMl);
    }
  });

  test("ไม่มีอัตราเจือจางไหนตวงได้จริงด้วยเครื่องมือนี้ ต้องบอกตรง ๆ ว่าทำไม่ได้", () => {
    expect(() =>
      planHaiterCleaningDose({
        sourcePercent: 6,
        targetPercent: 0.003,
        finalVolumeMl: 1,
        minimumMeasurableMl: 50,
      }),
    ).toThrow(/อุปกรณ์ตวงละเอียดไม่พอ/);
  });

  test("ปฏิเสธ target ที่มากกว่าหรือเท่ากับ source เหมือน calculateHaiterDose เดิม", () => {
    expect(() =>
      planHaiterCleaningDose({
        sourcePercent: 5,
        targetPercent: 5,
        finalVolumeMl: 100,
        minimumMeasurableMl: 0.1,
      }),
    ).toThrow("ต่ำกว่า source");
  });
});
