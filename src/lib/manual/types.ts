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
  /** บังคับเมื่อ level เป็น unsupported เพื่อให้ตรวจย้อนได้ว่าช่องว่างนั้นจริง
   *  หรือแค่ค้นไม่พอ และเพื่อให้รู้ว่าควรกลับไปค้นใหม่เมื่อไหร่ */
  searchedAt?: string;
  searchQueries?: string[];
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

/** อาการที่ผู้ใช้อาจเจอในขั้นหนึ่ง พร้อมวิธีแยกสาเหตุและสิ่งที่ต้องทำต่อ
 *  เก็บในคลังกลางเพราะอาการส่วนใหญ่ไม่ผูกกับชนิดพืช */
export type TroubleshootingEntry = {
  id: string;
  symptom: string;
  likelyCause: string;
  /** วิธีแยกจากอาการอื่นที่หน้าตาคล้ายกันแต่วิธีแก้ต่างกัน */
  distinguish?: string;
  actions: string[];
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
  /** อ้างถึงคลังอาการกลาง resolve ตอน render เหมือนที่ sourceIds ทำ */
  troubleshootingIds?: string[];
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
