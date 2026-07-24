import { describe, expect, it } from "vitest";
import { calculateIntermediateStockDilution } from "./medium-calculations";

describe("intermediate hormone stock dilution", () => {
  it("calculates a 1 mg/mL source diluted to 0.1 mg/mL and the final dose", () => {
    const result = calculateIntermediateStockDilution({
      sourceStockMgPerMl: 1,
      workingStockMgPerMl: 0.1,
      workingStockVolumeMl: 10,
      targetMgPerL: 0.5,
      finalMediumVolumeMl: 100,
    });

    expect(result.sourceStockVolumeMl).toBe(1);
    expect(result.diluentVolumeMl).toBe(9);
    expect(result.workingStockVolumeMl).toBe(0.5);
    expect(result.workingStockVolumeUl).toBe(500);
    expect(result.warning).toBeUndefined();
  });

  it("warns when direct stock dosing is too small for a practical pipette", () => {
    const result = calculateIntermediateStockDilution({
      sourceStockMgPerMl: 1,
      workingStockMgPerMl: 1,
      workingStockVolumeMl: 1,
      targetMgPerL: 0.05,
      finalMediumVolumeMl: 100,
      minimumPipetteUl: 10,
    });

    expect(result.workingStockVolumeUl).toBe(5);
    expect(result.warning).toContain("เล็กกว่า");
  });
});
