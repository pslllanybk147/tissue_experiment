import { describe, expect, it } from "vitest";
import { calculateWorkingStock } from "./working-stock-calculator";

describe("calculateWorkingStock", () => {
  it("turns 0.0065 mg from 1 mg/mL into a measurable 1:100 working stock", () => {
    const result = calculateWorkingStock({
      requiredMassMg: 0.0065,
      sourceConcentrationMgPerMl: 1,
      minimumToolVolumeMl: 0.1,
      workingSolutionVolumeMl: 10,
    });
    expect(result.state).toBe("working-dilution");
    if (result.state !== "working-dilution") return;
    expect(result.dilutionFactor).toBe(100);
    expect(result.sourceVolumeMl).toBe(0.1);
    expect(result.diluentVolumeMl).toBe(9.9);
    expect(result.workingConcentrationMgPerMl).toBe(0.01);
    expect(result.workingDoseMl).toBe(0.65);
  });

  it("uses the original stock when the direct volume is measurable", () => {
    expect(calculateWorkingStock({
      requiredMassMg: 0.5,
      sourceConcentrationMgPerMl: 1,
      minimumToolVolumeMl: 0.1,
      workingSolutionVolumeMl: 10,
    })).toMatchObject({ state: "direct", directDoseMl: 0.5 });
  });

  it("blocks invalid input", () => {
    expect(calculateWorkingStock({
      requiredMassMg: 0,
      sourceConcentrationMgPerMl: 1,
      minimumToolVolumeMl: 0.1,
      workingSolutionVolumeMl: 10,
    }).state).toBe("blocked");
  });
});
