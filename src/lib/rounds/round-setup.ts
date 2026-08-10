import type {
  ChemicalPreparationSnapshot,
  LotSterilizationSnapshot,
  MediumSterilizationMethod,
  RinseWaterMethod,
  RoundSetupChemistry,
  SterilizationMethod,
} from "@/lib/domain/models";
import type { EquipmentProfileV2 } from "@/lib/equipment/equipment-profile";
import {
  buildLowDoseRinseWaterSnapshot,
  buildNaDccRinseWaterSnapshot,
} from "@/lib/domain/rinse-water-planning";

export type RoundSetupSelection = {
  mediumMethod: MediumSterilizationMethod | null;
  surfaceMethod: Exclude<SterilizationMethod, "pressure-sterilization"> | null;
  rinseMethod: RinseWaterMethod | null;
};

export type RoundSetupInput = {
  mediumMethod: MediumSterilizationMethod;
  surfaceMethod: Exclude<SterilizationMethod, "pressure-sterilization">;
  rinseMethod: RinseWaterMethod;
  chemistry: RoundSetupChemistry;
  lockedAt: string;
  mediumPreparation: ChemicalPreparationSnapshot;
  surfacePreparation: ChemicalPreparationSnapshot;
  rinseWater?: LotSterilizationSnapshot["rinseWater"];
};

function requireSelection(value: string | null, message: string): asserts value is string {
  if (!value) throw new Error(message);
}

function chemistryFromProfile(profile: EquipmentProfileV2): RoundSetupChemistry {
  return {
    bleachPercentWw: profile.chemicals.bleach.percentWw,
    nadccAvailableChlorinePercent: profile.chemicals.nadcc.availableChlorinePercent,
    nadccTabletMassG: profile.chemicals.nadcc.tabletMassG,
    nadccMassGPerTablet: profile.chemicals.nadcc.nadccMassGPerTablet,
  };
}

function mediumPreparationFromProfile(
  method: MediumSterilizationMethod,
  profile: EquipmentProfileV2,
  lockedAt: string,
): ChemicalPreparationSnapshot {
  if (method === "pressure-sterilization") {
    return { method, protocolVersion: "pressure-medium-v1", status: "planned", lockedAt };
  }
  if (method === "nadcc-chemical") {
    return {
      method,
      protocolVersion: "nadcc-medium-v1",
      status: "planned",
      productName: profile.chemicals.nadcc.labelText,
      batchOrLot: profile.chemicals.nadcc.batchOrLot,
      labelConcentration: profile.chemicals.nadcc.availableChlorinePercent,
      labelBasis: "available-chlorine",
      lockedAt,
    };
  }
  return {
    method,
    protocolVersion: "haiter-medium-v1",
    status: "planned",
    productName: profile.chemicals.bleach.productName,
    batchOrLot: profile.chemicals.bleach.batchOrLot,
    labelConcentration: profile.chemicals.bleach.percentWw,
    labelBasis: "w/w",
    lockedAt,
  };
}

function surfacePreparationFromProfile(
  method: Exclude<SterilizationMethod, "pressure-sterilization">,
  profile: EquipmentProfileV2,
  lockedAt: string,
): ChemicalPreparationSnapshot {
  if (method === "nadcc-soak") {
    return {
      method,
      protocolVersion: "nadcc-soak-v1",
      status: "planned",
      productName: profile.chemicals.nadcc.labelText,
      batchOrLot: profile.chemicals.nadcc.batchOrLot,
      labelConcentration: profile.chemicals.nadcc.availableChlorinePercent,
      labelBasis: "available-chlorine",
      targetPpm: 300,
      lockedAt,
    };
  }
  return {
    method,
    protocolVersion: "haiter-surface-v1",
    status: "planned",
    productName: profile.chemicals.bleach.productName,
    batchOrLot: profile.chemicals.bleach.batchOrLot,
    labelConcentration: profile.chemicals.bleach.percentWw,
    labelBasis: "w/w",
    lockedAt,
  };
}

export function buildRoundSetupInput(
  selection: RoundSetupSelection,
  profile: EquipmentProfileV2,
  lockedAt: string,
): RoundSetupInput {
  requireSelection(selection.mediumMethod, "ต้องเลือกวิธีทำให้อาหารและกระปุกปลอดเชื้อก่อนสร้างรอบ");
  requireSelection(selection.surfaceMethod, "ต้องเลือกวิธีฟอกผิวชิ้นพืชก่อนสร้างรอบ");
  requireSelection(selection.rinseMethod, "ต้องเลือกวิธีล้างชิ้นพืชก่อนสร้างรอบ");
  if (selection.surfaceMethod === "nadcc-soak" && ["nadcc", "low-dose-hypochlorite"].includes(selection.rinseMethod)) {
    throw new Error("NaDCC soak ต้องล้างด้วยน้ำปลอดเชื้อ ไม่ใช้ chlorinated rinse ต่อ");
  }

  const preparedRinse = selection.rinseMethod === "nadcc"
    ? profile.rinseWater.nadcc
    : selection.rinseMethod === "low-dose-hypochlorite"
      ? profile.rinseWater.lowDoseHypochlorite
      : undefined;
  const plannedRinse = selection.rinseMethod === "nadcc"
    ? buildNaDccRinseWaterSnapshot(50)
    : selection.rinseMethod === "low-dose-hypochlorite"
      ? buildLowDoseRinseWaterSnapshot(50)
      : undefined;
  const rinseWater = preparedRinse ?? plannedRinse;

  return {
    mediumMethod: selection.mediumMethod,
    surfaceMethod: selection.surfaceMethod,
    rinseMethod: selection.rinseMethod,
    chemistry: chemistryFromProfile(profile),
    lockedAt,
    mediumPreparation: mediumPreparationFromProfile(selection.mediumMethod, profile, lockedAt),
    surfacePreparation: surfacePreparationFromProfile(selection.surfaceMethod, profile, lockedAt),
    ...(rinseWater
      ? {
          rinseWater: {
            ...structuredClone(rinseWater),
            protocolVersion: selection.rinseMethod === "nadcc" ? "nadcc-rinse-v1" : "naocl-rinse-v1",
            lockedAt,
          },
        }
      : {}),
  };
}

export function buildRoundSterilizationSnapshot(input: RoundSetupInput): LotSterilizationSnapshot {
  return {
    profileId: input.surfaceMethod === "nadcc-soak" ? "nadcc-soak-v1" : "haiter-chemical-v1",
    profileVersion: "1.0.0",
    method: input.surfaceMethod,
    mediumSterilizationMethod: input.mediumMethod,
    rinseMethod: input.rinseMethod,
    chemistry: structuredClone(input.chemistry),
    lockedAt: input.lockedAt,
    mediumPreparation: structuredClone(input.mediumPreparation),
    surfacePreparation: structuredClone(input.surfacePreparation),
    ...(input.surfaceMethod === "nadcc-soak" ? { targetChlorinePercent: 0.03 } : { targetChlorinePercent: 1 }),
    ...(input.rinseWater ? { rinseWater: structuredClone(input.rinseWater) } : {}),
  };
}
