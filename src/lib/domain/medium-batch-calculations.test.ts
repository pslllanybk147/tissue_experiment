import { describe, expect, it } from "vitest";
import { calculateMediumBatchPlan } from "./medium-batch-calculations";

describe("calculateMediumBatchPlan", () => {
  it("separates explants from culture, blank, spare, and loss allowance", () => {
    expect(calculateMediumBatchPlan({
      explantCount: 1,
      cultureJarCount: 1,
      blankJarCount: 1,
      spareJarCount: 2,
      mediumPerJarMl: 25,
      lossPercent: 10,
    })).toEqual({
      totalJarCount: 4,
      baseVolumeMl: 100,
      lossAllowanceMl: 10,
      totalVolumeMl: 110,
      warnings: [],
    });
  });

  it("warns when controls or containers are insufficient", () => {
    const plan = calculateMediumBatchPlan({
      explantCount: 3,
      cultureJarCount: 1,
      blankJarCount: 0,
      spareJarCount: 0,
      mediumPerJarMl: 20,
      lossPercent: 0,
    });
    expect(plan.warnings).toHaveLength(3);
  });
});
