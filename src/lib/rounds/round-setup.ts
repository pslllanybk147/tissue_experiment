import type {
  LotSterilizationSnapshot,
  MediumSterilizationMethod,
  RinseWaterMethod,
  RoundSetupChemistry,
  SterilizationMethod,
} from "@/lib/domain/models";
import {
  buildLowDoseRinseWaterSnapshot,
  buildNaDccRinseWaterSnapshot,
} from "@/lib/domain/rinse-water-planning";

export type RoundSetupSelection = {
  mediumMethod: MediumSterilizationMethod | null;
  surfaceMethod: Exclude<SterilizationMethod, "pressure-sterilization"> | null;
  rinseMethod: RinseWaterMethod | null;
};

export type RoundSetupInput = RoundSetupSelection & { chemistry: RoundSetupChemistry };

function requireSelection(value: string | null, message: string): asserts value is string {
  if (!value) throw new Error(message);
}

export function buildRoundSterilizationSnapshot(
  selection: RoundSetupSelection,
  chemistry: RoundSetupChemistry,
): LotSterilizationSnapshot {
  requireSelection(selection.mediumMethod, "ต้องเลือกวิธีทำให้อาหารและกระปุกปลอดเชื้อก่อนสร้างรอบ");
  requireSelection(selection.surfaceMethod, "ต้องเลือกวิธีฟอกผิวชิ้นพืชก่อนสร้างรอบ");
  requireSelection(selection.rinseMethod, "ต้องเลือกวิธีล้างชิ้นพืชก่อนสร้างรอบ");

  const rinseWater = selection.rinseMethod === "nadcc"
    ? buildNaDccRinseWaterSnapshot(50)
    : selection.rinseMethod === "low-dose-hypochlorite"
      ? buildLowDoseRinseWaterSnapshot(50)
      : undefined;

  return {
    profileId: selection.surfaceMethod === "nadcc-soak" ? "nadcc-soak-v1" : "haiter-chemical-v1",
    profileVersion: "1.0.0",
    method: selection.surfaceMethod,
    mediumSterilizationMethod: selection.mediumMethod,
    rinseMethod: selection.rinseMethod,
    chemistry: { ...chemistry },
    ...(selection.surfaceMethod === "nadcc-soak" ? { targetChlorinePercent: 0.03 } : { targetChlorinePercent: 1 }),
    ...(rinseWater ? { rinseWater } : {}),
  };
}
