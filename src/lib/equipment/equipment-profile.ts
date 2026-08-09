import { defaultKit, type EquipmentKit } from "./resolve-path";

export const equipmentItemIds = [
  "forceps",
  "scissors",
  "scalpel-narrow",
  "scalpel-wide",
  "alcohol-lamp",
  "picnic-gas-stove",
  "aluminium-cup-1l",
  "stirring-rod",
  "cutter",
  "plastic-culture-jar-50ml",
  "glass-jar-250ml",
  "foggy-bottle",
  "pp-beaker",
  "glass-beaker-1l",
  "measuring-cup-100ml",
  "syringe-5ml",
  "syringe-1ml",
  "large-tissue",
  "yellow-label",
  "jewelry-scale",
  "food-scale",
  "ph-meter",
  "phone-s24fe",
  "sab",
  "plastic-room-2x2m",
] as const;

export type EquipmentItemId = (typeof equipmentItemIds)[number];
export type InventoryUnit = "piece" | "bottle" | "pack" | "set";

export type EquipmentProfileV2 = EquipmentKit & {
  schemaVersion: 2;
  chemicals: {
    nadcc: {
      form: "effervescent-tablet";
      availableChlorinePercent: number;
      tabletMassG: number;
      nadccMassGPerTablet: number;
      tabletCount: number;
      labelText: string;
    };
    bleach: { productName: string; percentWw: number };
    alcohol: { percent: number };
  };
  water: { sourcePpm: number; sterile: boolean; sterilizationMethod: string | null };
  instruments: {
    balanceResolutionG: number;
    foodScaleResolutionG: number;
    syringeResolutionMl: number;
    phMeter: boolean;
  };
  containers: { cultureJar50Ml: number; glassJar250Ml: number };
  workspace: { sab: boolean; plasticRoom: boolean; openFlameFuelAvailable: boolean };
  medium: {
    msRateGPerL: number;
    whiteSugarFoodGrade: boolean;
    phUpDown: boolean;
    naaMgPerMl: number;
    baMgPerMl: number;
    ibaMgPerMl: number;
    agarBrand: string;
    sterilizationMethod: "haiter-chemical" | "nadcc-chemical" | null;
  };
  phone: { model: string; available: boolean };
  inventory: Array<{ id: EquipmentItemId; quantity: number; unit: InventoryUnit; note: string }>;
  /** ชื่อใหม่ที่ตรงกับฉลากมากกว่า เก็บ alias เดิมไว้ให้ calculator และ lot เก่าอ่านต่อได้ */
  msRateGPerL: number;
};

function blankV2(legacy: EquipmentKit): EquipmentProfileV2 {
  return {
    ...legacy,
    schemaVersion: 2,
    chemicals: {
      nadcc: {
        form: "effervescent-tablet",
        availableChlorinePercent: 0,
        tabletMassG: 0,
        nadccMassGPerTablet: 0,
        tabletCount: 0,
        labelText: "ยังไม่ได้บันทึกฉลาก",
      },
      bleach: { productName: "ยังไม่ได้บันทึก", percentWw: 0 },
      alcohol: { percent: 0 },
    },
    water: { sourcePpm: 0, sterile: false, sterilizationMethod: null },
    instruments: {
      balanceResolutionG: legacy.scaleMinimumMg / 1000,
      foodScaleResolutionG: 0.1,
      syringeResolutionMl: legacy.pipetteMinimumMl,
      phMeter: false,
    },
    containers: { cultureJar50Ml: 0, glassJar250Ml: 0 },
    workspace: { sab: false, plasticRoom: false, openFlameFuelAvailable: false },
    medium: {
      msRateGPerL: legacy.msLabelRateGPerL,
      whiteSugarFoodGrade: false,
      phUpDown: false,
      naaMgPerMl: 0,
      baMgPerMl: 0,
      ibaMgPerMl: 0,
      agarBrand: "ยังไม่ได้บันทึก",
      sterilizationMethod: null,
    },
    phone: { model: "ยังไม่ได้บันทึก", available: false },
    inventory: [],
    msRateGPerL: legacy.msLabelRateGPerL,
  };
}

export function normalizeEquipmentProfile(value: EquipmentKit | EquipmentProfileV2 | null | undefined): EquipmentProfileV2 {
  if (value && "schemaVersion" in value && value.schemaVersion === 2) {
    const defaults = blankV2(value);
    return structuredClone({
      ...value,
      medium: { ...defaults.medium, ...value.medium, sterilizationMethod: value.medium.sterilizationMethod ?? null },
      msLabelRateGPerL: value.msRateGPerL,
      scaleMinimumMg: value.instruments.balanceResolutionG * 1000,
      pipetteMinimumMl: value.instruments.syringeResolutionMl,
    });
  }
  return blankV2(structuredClone(value ?? defaultKit));
}

const item = (id: EquipmentItemId, quantity = 1, unit: InventoryUnit = "piece", note = "ผู้ใช้รายงานว่ามี") => ({
  id,
  quantity,
  unit,
  note,
});

export const USER_REPORTED_PROFILE: EquipmentProfileV2 = {
  schemaVersion: 2,
  owned: ["stove-pot", "bleach", "nadcc-tablet"],
  scaleMinimumMg: 10,
  pipetteMinimumMl: 0.1,
  msLabelRateGPerL: 4.43,
  msRateGPerL: 4.43,
  chemicals: {
    nadcc: {
      form: "effervescent-tablet",
      availableChlorinePercent: 60,
      tabletMassG: 5.4,
      nadccMassGPerTablet: 2.97,
      tabletCount: 15,
      labelText: "NaDCC เม็ดฟู่ คลอรีน 60%; 1 เม็ด 5.4 g มี sodium dichloroisocyanurate 2.97 g",
    },
    bleach: { productName: "Haiter", percentWw: 6 },
    alcohol: { percent: 75 },
  },
  water: { sourcePpm: 15, sterile: false, sterilizationMethod: null },
  instruments: { balanceResolutionG: 0.01, foodScaleResolutionG: 0.1, syringeResolutionMl: 0.1, phMeter: true },
  containers: { cultureJar50Ml: 46, glassJar250Ml: 4 },
  workspace: { sab: true, plasticRoom: true, openFlameFuelAvailable: false },
  medium: {
    msRateGPerL: 4.43,
    whiteSugarFoodGrade: true,
    phUpDown: true,
    naaMgPerMl: 1,
    baMgPerMl: 1,
    ibaMgPerMl: 1,
    agarBrand: "ตราโทรศัพท์",
    sterilizationMethod: null,
  },
  phone: { model: "Samsung Galaxy S24 FE", available: true },
  inventory: [
    item("forceps"), item("scissors"), item("scalpel-narrow"), item("scalpel-wide"),
    item("alcohol-lamp", 1, "piece", "มีตะเกียง แต่ยังไม่มีเชื้อเพลิง"), item("picnic-gas-stove"),
    item("aluminium-cup-1l"), item("stirring-rod"), item("cutter"), item("plastic-culture-jar-50ml", 46),
    item("glass-jar-250ml", 4), item("foggy-bottle", 3, "bottle"), item("pp-beaker"),
    item("glass-beaker-1l"), item("measuring-cup-100ml"), item("syringe-5ml", 1), item("syringe-1ml", 3),
    item("large-tissue", 1, "pack"), item("yellow-label", 1, "pack"), item("jewelry-scale"), item("food-scale"),
    item("ph-meter"), item("phone-s24fe"), item("sab"), item("plastic-room-2x2m", 1, "set", "ห้องคลุมพลาสติกใส 2 × 2 m โครงท่อ PVC"),
  ],
};
