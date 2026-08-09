// import แบบ type-only ทั้งคู่ จึงถูกลบทิ้งตอน compile ไม่เกิดวงจรพึ่งพาตอนรัน
// แม้ forms/types.ts จะ import กลับมาที่ไฟล์นี้เหมือนกัน
import type { Dose } from "./forms/types";

/** ระดับหลักฐานของเนื้อหาแต่ละชิ้น
 *  สามค่าแรกใช้กับ "ข้ออ้าง" คือข้อความที่สั่งให้ลงมือทำหรือมีตัวเลขที่ต้องทำตาม
 *  ส่วน botanical-fact ใช้กับ "คำนิยาม" เช่น "ข้อคือวงนูนที่ใบและรากงอกออกมา"
 *  ซึ่งตรวจได้จากตำราก่อนลงมือ จึงไม่เข้ากฎจุดอ่อนที่สุด (ดู evidence-level.ts)
 *  แต่ยังบังคับให้ระบุ sourceIds เหมือนเดิม */
export type EvidenceLevel = "species-direct" | "adapted" | "unsupported" | "botanical-fact";

export type MeasurementUnit = "mL" | "g" | "mg/L" | "%" | "min" | "°C" | "pH" | "count" | "ppm" | "hour" | "day" | "boolean" | "text" | "date";
export type MeasurementKind = "number" | "select" | "checkbox" | "text" | "date";

export type Measurement = {
  id: string;
  label: string;
  unit: MeasurementUnit;
  required: boolean;
  kind?: MeasurementKind;
  options?: Array<{ value: string; label: string }>;
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
  /** ตำแหน่งภายในแหล่งที่อ้าง คีย์คือ sourceId ค่าคือเลขหน้าหรือหัวข้อที่ระบุได้จริงเท่านั้น
   *  (เช่น "23–29" จากบรรณานุกรม หรือชื่อหัวข้อในสิทธิบัตรที่ไม่มีเลขหน้ากำกับ) ห้ามเดาเลขหน้า
   *  ที่ตรวจสอบไม่ได้ ใส่เฉพาะ sourceId ที่มีตำแหน่งชัดเจนพอจะช่วยผู้อ่านเปิดตรงจุดได้จริง */
  sourcePages?: Record<string, string>;
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

/** ลิงก์ภาพภายนอกไว้ "ดูลักษณะ" เท่านั้น เช่นรูปสินค้าจากร้านขายต้นไม้ที่แสดงลายด่างจริง
 *  ไม่ใช่หลักฐานของคำแนะนำและไม่ผ่านตารางใบอนุญาตในขั้นที่ 5 ของ newplant_protocol.md
 *  เพราะเป็นแค่ลิงก์ ไม่ใช่การก็อปรูปมาโฮสต์เอง — ต้องมี note กำกับข้อจำกัดเสมอ */
export type ReferenceImageLink = {
  url: string;
  label: string;
  note: string;
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
  /** หลักฐานขั้นต่ำก่อนบันทึกสถานะ Passed; ไม่กระทบการบันทึกว่าติดปัญหา */
  evidenceRequirement?: "none" | "one-photo" | "photo-with-caption";
  /** ค่าเชิงปริมาณเป็นช่วง คีย์เช่น "sterilize.dose" รวมมาจากชั้นทรงและชั้นสกุลตอน resolve
   *  ขั้นที่มีค่านี้และหลักฐานไม่ใช่ตรงพันธุ์ จะมีขั้นทดสอบช่วงกำกับ */
  doses?: Record<string, Dose>;
  evidence: EvidenceRef;
  illustrationId?: string;
  /** อ้างถึงคลังอาการกลาง resolve ตอน render เหมือนที่ sourceIds ทำ */
  troubleshootingIds?: string[];
  referenceImages?: ReferenceImageLink[];
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
  /** ผูกขึ้นชั้นทรง ถ้าไม่ระบุจะ resolve ได้เฉพาะจากแกนกลาง */
  growthFormId?: string;
  genusId?: string;
  /** อ้างทะเบียนใน traits.ts */
  traitIds?: string[];
  sequence: string[];
  overrides?: Record<string, StepOverride>;
  steps?: Record<string, ManualStepDef>;
  mediaRecipes: MediaRecipe[];
  sourceIds: string[];
};

export type StepOrigin = "core" | "form" | "genus" | "override" | "pack";

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
