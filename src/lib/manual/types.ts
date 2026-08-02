export type EvidenceLevel = "species-direct" | "adapted" | "unsupported";

export type MeasurementUnit = "mL" | "g" | "mg/L" | "%" | "min" | "°C" | "pH" | "count";

export type Measurement = {
  id: string;
  label: string;
  unit: MeasurementUnit;
  required: boolean;
  min?: number;
  max?: number;
};

export type EvidenceRef = {
  level: EvidenceLevel;
  sourceIds: string[];
  note?: string;
};

export type MediaIngredient = {
  name: string;
  amountPerLiter: number;
  unit: "×" | "g/L" | "mg/L";
  note?: string;
};

export type MediaRecipe = {
  id: string;
  title: string;
  pH: string;
  ingredients: MediaIngredient[];
  evidence: EvidenceRef;
};

export type ManualStepDef = {
  id: string;
  title: string;
  summary: string;
  why: string;
  materials: string[];
  actions: string[];
  passCriteria: string[];
  stopConditions: string[];
  safetyNotes: string[];
  measurements: Measurement[];
  evidence: EvidenceRef;
  illustrationId?: string;
  durationMinutes: number | null;
};

export type StepOverride = Partial<Omit<ManualStepDef, "id">>;

export type PlantPack = {
  slug: string;
  scientificName: string;
  commonName: string;
  method: string;
  summary: string;
  durationLabel: string;
  sequence: string[];
  overrides?: Record<string, StepOverride>;
  steps?: Record<string, ManualStepDef>;
  mediaRecipes: MediaRecipe[];
  sourceIds: string[];
};

export type StepOrigin = "core" | "override" | "pack";

export type ResolvedStep = ManualStepDef & { order: number; origin: StepOrigin };

export type ResolvedManual = {
  slug: string;
  scientificName: string;
  commonName: string;
  method: string;
  summary: string;
  durationLabel: string;
  steps: ResolvedStep[];
  mediaRecipes: MediaRecipe[];
  sourceIds: string[];
};
