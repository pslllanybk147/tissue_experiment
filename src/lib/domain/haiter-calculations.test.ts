import { describe, expect, test } from "vitest";
import {
  calculateHaiterDose,
  planHaiterWorkingDilution,
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
