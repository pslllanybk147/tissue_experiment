import type { EvidenceState } from "./models";
import type { TaxonRank, TaxonRecord } from "./knowledge-library";
import generatedCatalog from "./philodendron-catalog.generated.json";

export type KnowledgeSectionId = "taxonomy" | "biology" | "identification" | "tissue-culture";
export type ManualSource = { id: string; title: string; url: string; sourceType: "taxonomy" | "peer-reviewed" | "research-gap"; accessedAt: string };
export type KnowledgeSection = { id: KnowledgeSectionId; title: string; summary: string; claims: KnowledgeClaim[] };
export type KnowledgeClaim = { id: string; statement: string; evidenceState: EvidenceState; sourceIds: string[]; note?: string };
export type ManualStep = {
  id: string; order: number; title: string; objective: string; instructions: string[];
  materials: string[]; criticalControls: string[]; safetyNotes: string[];
  expectedResult: string; passCriteria: string[]; failCriteria: string[];
  evidenceState: EvidenceState; sourceIds: string[]; measurements?: { label: string; unit: string; required: boolean }[];
};
export type MediaIngredient = { name: string; amountPerLiter: number; unit: "×" | "g/L" | "mg/L"; note?: string };
export type MediaRecipe = {
  id: string; title: string; evidenceState: EvidenceState; sourceIds: string[];
  pH: string; batchVolumes: number[]; ingredients: MediaIngredient[]; note: string;
};
export type SterilizationTrial = { id: string; activeChlorinePercent: number; exposureMinutes: number; sterileRinses: number; evidenceState: EvidenceState; note: string };
export type ExplantGuide = {
  target: string; evidenceState: EvidenceState; sourceIds: string[]; cutDiagram: string[];
  selectionNotes: string[]; preSterilizationSize: string; finalExplantSize: string;
  sterilizationTrials: SterilizationTrial[]; safetyNotes: string[];
};
export type TissueCultureManual = {
  method: "nodal"; disclaimer: string; steps: ManualStep[]; mediaNotes: string[]; mediaRecipes: MediaRecipe[]; explantGuide: ExplantGuide;
};
export type PhilodendronMonograph = {
  taxonId: string; title: string; subtitle: string; sections: KnowledgeSection[];
  tissueCulture: TissueCultureManual; sourceIds: string[]; lastReviewedAt: string;
};
export type TaxonomySnapshot = {
  backbone: "Kew POWO / WCVP"; acceptedSpeciesCount: number; acceptedGeneraInAraceae: number;
  accessedAt: string; sourceId: string; note: string;
};

export const philodendronSources: ManualSource[] = [
  { id: "source-kew-philodendron", title: "Plants of the World Online — Philodendron Schott", url: "https://powo.science.kew.org/taxon/urn%3Alsid%3Aipni.org%3Anames%3A326132-2", sourceType: "taxonomy", accessedAt: "2026-07-24" },
  { id: "source-kew-araceae", title: "Plants of the World Online — Araceae Juss.", url: "https://powo.science.kew.org/taxon/urn%3Alsid%3Aipni.org%3Anames%3A30000216-2", sourceType: "taxonomy", accessedAt: "2026-07-24" },
  { id: "source-pp-2023", title: "In Vitro Propagation of Philodendron erubescens ‘Pink Princess’", url: "https://doi.org/10.3390/horticulturae9060688", sourceType: "peer-reviewed", accessedAt: "2026-07-24" },
  { id: "source-pp-2025", title: "Pink Princess Micropropagation and Genetic Fidelity", url: "https://doi.org/10.3390/horticulturae11091085", sourceType: "peer-reviewed", accessedAt: "2026-07-24" },
  { id: "source-violin-gap", title: "Violin variegated evidence register", url: "https://powo.science.kew.org/taxon/urn%3Alsid%3Aipni.org%3Anames%3A326132-2", sourceType: "research-gap", accessedAt: "2026-07-24" },
  { id: "source-kew-wcvp-v15", title: "World Checklist of Vascular Plants v15", url: "https://doi.org/10.15468/6h8ucr", sourceType: "taxonomy", accessedAt: "2026-07-24" },
];

export const philodendronTaxonomySnapshot: TaxonomySnapshot = {
  backbone: "Kew POWO / WCVP", acceptedSpeciesCount: 629, acceptedGeneraInAraceae: 151,
  accessedAt: "2026-07-24", sourceId: "source-kew-philodendron",
  note: "POWO page snapshot แสดง 629 accepted species; WCVP v15 import ที่ commit นี้มี 628 records. จำนวนเป็น snapshot ไม่ใช่จำนวน cultivar/trade-name และอาจเปลี่ยนตาม taxonomic backbone",
};

const baseTaxa: TaxonRecord[] = [
  { id: "family-araceae", scientificName: "Araceae", displayName: "Araceae", rank: "family", parentId: null, synonyms: [], commonNames: ["วงศ์บอน"], confidence: "High", evidenceState: "Verified", sourceIds: ["source-kew-araceae"], createdAt: "", updatedAt: "" },
  { id: "genus-philodendron", scientificName: "Philodendron", displayName: "Philodendron", rank: "genus", parentId: "family-araceae", synonyms: [], commonNames: [], confidence: "High", evidenceState: "Verified", sourceIds: ["source-kew-philodendron"], createdAt: "", updatedAt: "" },
  { id: "species-philodendron-erubescens", scientificName: "Philodendron erubescens", displayName: "Philodendron erubescens", rank: "species", parentId: "genus-philodendron", synonyms: [], commonNames: ["blushing philodendron"], confidence: "High", evidenceState: "Verified", sourceIds: ["source-kew-philodendron"], createdAt: "", updatedAt: "" },
  { id: "cultivar-pink-princess", scientificName: "Philodendron erubescens", displayName: "Pink Princess", rank: "cultivar", parentId: "species-philodendron-erubescens", synonyms: ["Philodendron Pink Princess"], commonNames: ["PPP"], confidence: "Medium", evidenceState: "Adapted", sourceIds: ["source-pp-2023", "source-pp-2025"], createdAt: "", updatedAt: "" },
  { id: "species-philodendron-bipennifolium", scientificName: "Philodendron bipennifolium", displayName: "Philodendron bipennifolium", rank: "species", parentId: "genus-philodendron", synonyms: [], commonNames: ["horsehead philodendron"], confidence: "High", evidenceState: "Verified", sourceIds: ["source-kew-philodendron"], createdAt: "", updatedAt: "" },
  { id: "trade-name-violin-variegated", scientificName: "Philodendron bipennifolium", displayName: "Violin variegated", rank: "trade-name", parentId: "species-philodendron-bipennifolium", synonyms: ["Violin", "Philodendron Violin"], commonNames: [], confidence: "Low", evidenceState: "Experimental", sourceIds: ["source-violin-gap"], createdAt: "", updatedAt: "" },
];

const generatedSpecies = generatedCatalog as TaxonRecord[];
export const philodendronTaxa: TaxonRecord[] = [...baseTaxa, ...generatedSpecies.filter((record) => !baseTaxa.some((base) => base.rank === "species" && base.scientificName === record.scientificName))];

const step = (id: string, order: number, title: string, objective: string, instructions: string[], materials: string[], criticalControls: string[], safetyNotes: string[], expectedResult: string, passCriteria: string[], failCriteria: string[], evidenceState: EvidenceState, sourceIds: string[] = [], measurements?: ManualStep["measurements"]): ManualStep => ({ id, order, title, objective, instructions, materials, criticalControls, safetyNotes, expectedResult, passCriteria, failCriteria, evidenceState, sourceIds, measurements });

const mediaRecipes = (evidenceState: EvidenceState, sourceIds: string[], multiplicationBap: number, multiplicationNaa: number, note: string): MediaRecipe[] => [
  { id: "establishment", title: "Establishment · ตั้งต้น", evidenceState, sourceIds, pH: "5.7–5.8", batchVolumes: [100, 250, 500, 1000], ingredients: [{ name: "MS basal salts", amountPerLiter: 1, unit: "×" }, { name: "Sucrose", amountPerLiter: 30, unit: "g/L" }, { name: "Agar", amountPerLiter: 7.5, unit: "g/L" }, { name: "BAP", amountPerLiter: 0.5, unit: "mg/L", note: "ใช้ stock solution" }, { name: "NAA", amountPerLiter: 0.05, unit: "mg/L", note: "ใช้ stock solution" }], note },
  { id: "multiplication", title: "Multiplication · เพิ่มจำนวนยอด", evidenceState, sourceIds, pH: "5.7–5.8", batchVolumes: [100, 250, 500, 1000], ingredients: [{ name: "MS basal salts", amountPerLiter: 1, unit: "×" }, { name: "Sucrose", amountPerLiter: 30, unit: "g/L" }, { name: "Agar", amountPerLiter: 7.5, unit: "g/L" }, { name: "BAP", amountPerLiter: multiplicationBap, unit: "mg/L", note: "ค่าฮอร์โมนต้องใช้ stock solution" }, { name: "NAA", amountPerLiter: multiplicationNaa, unit: "mg/L", note: "ถ้าไม่ใช้ให้เป็น 0" }], note },
  { id: "rooting", title: "Rooting · ออกราก", evidenceState, sourceIds, pH: "5.7–5.8", batchVolumes: [100, 250, 500, 1000], ingredients: [{ name: "MS basal salts", amountPerLiter: 0.5, unit: "×" }, { name: "Sucrose", amountPerLiter: 30, unit: "g/L" }, { name: "Agar", amountPerLiter: 7.5, unit: "g/L" }, { name: "IBA", amountPerLiter: 3, unit: "mg/L", note: "ใช้ stock solution; ค่านี้เป็นจุดอ้างอิง ไม่ใช่การรับรองทุกห้อง" }], note },
];

const explantGuide = (title: string, evidenceState: EvidenceState, sourceIds: string[]): ExplantGuide => {
  const isPink = title.includes("Pink");
  return {
    target: isPink ? "ยอดอ่อนพร้อมข้อ/ตาข้างของ Pink Princess" : "ยอดอ่อนหรือข้อที่มีตาข้างของ Violin variegated",
    evidenceState,
    sourceIds,
    cutDiagram: isPink
      ? ["ยอดอ่อน", "ใบอ่อน/กาบยอด", "ข้อ + ตาข้างที่ต้องการเก็บ", "✂ ตัดใต้ข้อประมาณ 5–10 mm", "ส่วนล่างเหลือไว้เป็นข้อสำรองบนต้นแม่"]
      : ["ยอดอ่อน", "ใบอ่อน/กาบยอด", "ข้อ + ตาข้างที่เห็นชัด", "✂ ตัดใต้ข้อประมาณ 5–10 mm", "เก็บข้อโคนไว้ ไม่ตัดทั้งต้นในรอบแรก"],
    selectionNotes: isPink
      ? ["เลือกข้อที่มีลายก้าน/ลำต้นสอดคล้องกับต้นแม่และมีตาข้างสมบูรณ์", "ก่อนฟอกตัดเผื่อให้จับได้ประมาณ 40–60 mm; หลังฟอกตัดผิวรอบนอกทิ้ง เหลือยอดประมาณ 20–30 mm", "หนึ่ง explant ต่อหนึ่งภาชนะในรอบทดสอบแรก และเก็บภาพก่อน–หลังตัด"]
      : ["เลือกข้อที่มีตาข้างชัดและถ่ายภาพด้านข้างก่อนตัด เพราะชื่อ Violin เป็น trade-name", "ก่อนฟอกตัดเผื่อให้จับได้ประมาณ 40–60 mm; หลังฟอกตัดแต่งเหลือประมาณ 15–25 mm", "เริ่มเพียงหนึ่งข้อจากต้นแม่ราคาแพง และเก็บข้อสำรองไว้อย่างน้อยหนึ่งข้อ"],
    preSterilizationSize: isPink ? "ประมาณ 40–60 mm เพื่อให้จับและฟอกได้" : "ประมาณ 40–60 mm เพื่อให้จับและฟอกได้",
    finalExplantSize: isPink ? "ประมาณ 20–30 mm มีตายอดและข้อบนสุด" : "ประมาณ 15–25 mm มีตาข้างและข้อสมบูรณ์",
    sterilizationTrials: isPink
      ? [
          { id: "pink-naocl-low", activeChlorinePercent: 0.6, exposureMinutes: 8, sterileRinses: 3, evidenceState: "Experimental", note: "ชุดเริ่มต้นแบบอ่อน; ต้องตรวจเนื้อเยื่อไหม้และการปนเปื้อน" },
          { id: "pink-naocl-mid", activeChlorinePercent: 0.8, exposureMinutes: 10, sterileRinses: 4, evidenceState: "Experimental", note: "ใช้เปรียบเทียบเมื่อชุดอ่อนปนเปื้อนสูง; ไม่ใช่ค่าที่รับรองตรงพันธุ์" },
        ]
      : [
          { id: "violin-naocl-low", activeChlorinePercent: 0.4, exposureMinutes: 8, sterileRinses: 4, evidenceState: "Experimental", note: "เริ่มอ่อนเพื่อลดความเสียหายของกาบยอด; ต้องทำ blank control" },
          { id: "violin-naocl-mid", activeChlorinePercent: 0.6, exposureMinutes: 10, sterileRinses: 4, evidenceState: "Experimental", note: "ชุดเปรียบเทียบเมื่อการปนเปื้อนยังสูง; ยังไม่มีหลักฐานตรงพันธุ์" },
        ],
    safetyNotes: ["ค่าคลอรีนต้องหมายถึง active chlorine ของผลิตภัณฑ์ที่ตรวจสอบได้ ไม่ใช่ปริมาตรไฮเตอร์อย่างเดียว", "ห้ามผสมไฮเตอร์กับกรด แอมโมเนีย หรือแอลกอฮอล์ และต้องทำตามฉลาก/กฎความปลอดภัยของพื้นที่", "ล้างด้วยน้ำปลอดเชื้อตามจำนวนรอบใน trial และทิ้งสารใช้แล้วอย่างเหมาะสม"],
  };
};

const sharedSteps = (evidenceState: EvidenceState, sourceIds: string[]): ManualStep[] => [
  step("baseline", 1, "รับต้นไม้และบันทึก baseline", "เก็บสภาพต้นแม่ก่อนเริ่ม", ["ติดรหัสต้นไม้และ Lot ให้ตรงกัน", "ถ่ายรูปทั้งต้น ใบ ยอด ข้อ และรากที่เห็น", "บันทึกผู้ขาย วันที่ได้รับ แหล่งที่มา สุขภาพ และลายด่าง"], ["กล้องหรือโทรศัพท์", "ป้ายรหัส", "แบบบันทึก"], ["ห้ามเริ่มโดยไม่มีรูปอ้างอิง"], ["ล้างมือหลังจับต้นที่มีอาการผิดปกติ"], "มี baseline ที่ย้อนตรวจได้", ["มีรหัส", "มีรูปทั้งต้นและจุดที่จะเลือก"], ["ระบุต้นหรือจุดเริ่มต้นไม่ได้"], "Adapted"),
  step("quarantine", 2, "ตรวจสุขภาพและกักต้นแม่", "ลดเชื้อแฝงและความเสี่ยงจากต้นแม่", ["ตรวจแมลง โรค รอยเน่า น้ำยางผิดปกติ และราก", "แยกต้นจากต้นอื่นและบันทึกสถานะ", "ยังไม่ตัดหากพบโรคที่ควบคุมไม่ได้"], ["พื้นที่กัก", "ป้ายสถานะ", "แว่นขยาย"], ["ต้นที่มีโรคชัดเจนต้องไม่เข้ารอบทดลองแพง"], ["แยกอุปกรณ์ของต้นป่วย"], "มี health decision ที่อธิบายได้", ["ไม่พบความเสี่ยงหยุดทดลอง หรือมีแผนแก้ไข"], ["โรค/แมลงควบคุมไม่ได้"], "Adapted"),
  step("identify", 3, "ยืนยันชนิดและเลือกวิธีทดลอง", "ผูกต้นกับ taxon และวิธี nodal culture", ["เปรียบเทียบชื่อผู้ขายกับข้อมูลอนุกรมวิธาน", "บันทึก confidence และข้อจำกัดการระบุ", "ถ้าไม่แน่ใจให้ใช้ Generic หรือ Experimental"], ["รูปต้นไม้", "ชื่อวิทยาศาสตร์", "แหล่งอ้างอิง"], ["ห้ามเลื่อนชื่อการค้าเป็น species ที่ยืนยันแล้ว"], [], "มี taxon และ confidence ที่ตรวจสอบได้", ["มี taxon หรือ fallback", "มี note เหตุผล"], ["ไม่สามารถระบุหรือเลือก fallback ได้"], evidenceState, sourceIds),
  step("explant-selection", 4, "เลือกยอด/ข้อ/ตาข้าง", "เลือก explant ที่มีตาเดิมและลายที่ต้องการ", ["ดูข้อและตาข้างจากด้านข้าง ไม่ใช้รูปมุมบนอย่างเดียว", "ทำเครื่องหมายด้านบน/ล่างและหมายเลขข้อ", "เลือกเพียงหนึ่ง explant สำหรับรอบแรกของต้นราคาแพง"], ["รูปด้านข้าง", "ป้ายหมายเลขข้อ", "ไม้บรรทัด"], ["ต้องเหลือข้อสำรองบนต้นแม่", "หลีกเลี่ยงข้อที่ช้ำหรือใกล้วัสดุปลูกมาก"], ["ใช้ใบมีดอย่างปลอดภัย"], "ระบุตำแหน่งตัดบนภาพได้", ["มีรูปพร้อมหมายเลขข้อ", "มีตาชัด"], ["ไม่มีตาหรือชิ้นส่วนเสียหาย"], "Adapted", sourceIds),
  step("explant-cut-location", 5, "ตัดและเตรียม explant", "ตัดชิ้นพืชให้จับและฟอกได้โดยไม่ทำลายตา", ["ตัดเผื่อส่วนจับก่อนฟอก", "บันทึกขนาดและทิศทาง", "หลังฟอกค่อยตัดแต่งผิวที่เสียหายออก", "ห้ามตัดผ่านตาโดยตรง"], ["กรรไกร/มีด", "ไม้บรรทัด", "ภาชนะสะอาด"], ["ตาต้องอยู่กับชิ้นที่จะลงอาหาร", "ไม่ฝังยอดกลับด้าน"], ["ระวังของมีคมและน้ำยาง"], "ได้ explant ที่มีตาและข้อสมบูรณ์", ["ตายังเขียว", "ไม่ช้ำมาก", "ขนาดถูกบันทึก"], ["ไม่มีตา/ช้ำ/กลับด้าน"], evidenceState, sourceIds, [{ label: "ความยาว explant", unit: "mm", required: true }]),
  step("workspace", 6, "เตรียมพื้นที่ปลอดเชื้อและอุปกรณ์", "ลดการนำเชื้อเข้าสู่ภาชนะ", ["ทำความสะอาดพื้นที่ตาม SOP ของห้อง", "เตรียมอุปกรณ์ที่ผ่านวิธีฆ่าเชื้อของระบบ", "วางของสะอาดและของสกปรกแยกกัน", "เตรียมภาชนะและป้ายก่อนเปิดงาน"], ["พื้นที่/ตู้ปลอดเชื้อ", "คีม", "มีด", "ภาชนะ", "แอลกอฮอล์ตาม SOP"], ["ไม่เปิดภาชนะอาหารทิ้งไว้นาน", "ต้องมี blank control แยกจาก explant"], ["ห้ามผสมสารฆ่าเชื้อ"], "พื้นที่พร้อมและมีแผนควบคุมการปนเปื้อน", ["อุปกรณ์พร้อม", "ภาชนะติดรหัส", "มี blank control"], ["พื้นที่หรืออุปกรณ์ไม่พร้อม"], "Adapted"),
  step("medium-preparation", 7, "เตรียมอาหารและอุปกรณ์", "ทำอาหารให้ตรวจสอบ batch และค่าได้", ["เลือกสูตรตาม protocol version ไม่ใช้ค่าจากความจำ", "ชั่ง MS/sucrose/agar และเติม stock ตามปริมาตร", "ปรับ pH ก่อนทำให้วุ้นแข็งและติด batch id", "บันทึกสูตร ปริมาตร และผู้ทำ"], ["MS medium", "sucrose", "agar", "stock hormones", "pH meter", "ภาชนะ"], ["สูตรต้องมีหน่วยครบ", "ต้องมี pH และ batch id", "อาหารทดลองต้องแยกจาก blank"], ["สวม PPE ตามฉลากสารเคมี", "ห้ามผสมไฮเตอร์กับกรด แอมโมเนีย หรือแอลกอฮอล์"], "อาหารพร้อมและย้อนตรวจได้", ["สูตรครบ", "pH ถูกบันทึก", "ภาชนะปิดและติดฉลาก"], ["สูตร/หน่วย/pH ไม่ชัด"], evidenceState, sourceIds, [{ label: "ปริมาตร batch", unit: "mL", required: true }, { label: "pH", unit: "pH", required: true }]),
  step("surface-sterilization", 8, "ฟอกฆ่าเชื้อผิว explant", "ลดเชื้อผิวโดยไม่ทำลายตา", ["เตรียมสารตามฉลากและ protocol version", "เริ่มจับเวลาหลังชิ้นสุดท้ายลงสาร", "เขย่าเบาตามวิธีที่กำหนด", "ล้างด้วยน้ำปลอดเชื้อครบจำนวนรอบ", "ทิ้งสารใช้แล้วตามความปลอดภัย"], ["สารฟอก", "น้ำปลอดเชื้อ", "ตัวจับเวลา", "ภาชนะ"], ["ต้องบันทึก active ingredient/ความเข้มข้น เวลา และรอบล้าง", "ห้ามใช้สารฟอกซ้ำโดยไม่อนุมัติ SOP"], ["สวม PPE และทำในพื้นที่ถ่ายเท", "ห้ามผสมสารต่างชนิด"], "explant สะอาดและยังมีสีเขียว", ["ล้างครบ", "ไม่มีเนื้อเยื่อไหม้ชัด"], ["ชิ้นขาว ใส หรือไหม้มาก"], evidenceState, sourceIds, [{ label: "เวลาฟอก", unit: "min", required: true }, { label: "ความเข้มข้นสารฟอก", unit: "%", required: true }, { label: "จำนวนรอบล้าง", unit: "count", required: true }]),
  step("initiation", 9, "ตัดแต่งและลงอาหารระยะเริ่มต้น", "ให้ explant ตั้งตัวในภาชนะปิด", ["ตัดส่วนผิวที่เสียหายออกด้วยเครื่องมือสะอาด", "วางด้านโคนแตะอาหารและให้ยอดอยู่เหนือวุ้น", "ปิดภาชนะทันทีและบันทึกตำแหน่ง"], ["คีม", "มีด", "อาหาร establishment", "ภาชนะ"], ["ต้องไม่ฝังยอด", "หนึ่ง explant ต่อภาชนะในรอบประเมินแรก"], ["ลดเวลาภาชนะเปิด"], "explant ตั้งตรงและมีรหัส", ["ปิดสนิท", "วางถูกด้าน", "มีรูปหลังลงอาหาร"], ["ยอดจม/กลับด้าน/ภาชนะรั่ว"], evidenceState, sourceIds),
  step("contamination", 10, "ตรวจ contamination และการตั้งตัว", "แยกเชื้อออกจากการตายของเนื้อเยื่อ", ["ตรวจโดยไม่เปิดภาชนะตามตารางสังเกต", "ถ่ายรูปเมื่อพบรา เมือก หรือสีน้ำตาล", "แยกภาชนะปนเปื้อนและไม่เปิดในพื้นที่สะอาด", "บันทึกวันที่และสาเหตุที่คาด"], ["กล้อง", "แบบบันทึก", "พื้นที่กัก"], ["ภาชนะปนเปื้อนต้องไม่กลับเข้า clean area"], ["ไม่เปิดภาชนะปนเปื้อนโดยไม่จำเป็น"], "มีสถานะผ่าน/ตรวจเพิ่ม/หยุด", ["ไม่มีเชื้อที่เห็นและตายังฟื้น"], ["มีรา เมือก หรือเนื้อตายต่อเนื่อง"], "Adapted", sourceIds, [{ label: "วันที่ตรวจ", unit: "date", required: true }, { label: "จำนวนภาชนะปนเปื้อน", unit: "count", required: true }]),
  step("multiplication", 11, "เพิ่มจำนวนยอด", "ขยายยอดที่ตั้งตัวโดยคุมความแปรปรวน", ["ย้ายเฉพาะยอดที่ผ่าน contamination gate", "บันทึกสูตร multiplication และ protocol version", "แยกยอดที่ลายดี/ผิดปกติ", "ลดฮอร์โมนหรือย้อนแก้เมื่อเกิด callus/ยอดผิดรูป"], ["อาหาร multiplication", "ภาชนะใหม่", "คีม", "ป้าย"], ["อย่าขยายจำนวนก่อนยืนยันว่าต้นปลอดเชื้อ", "คงสาย traceability ของ explant"], ["ใช้เครื่องมือสะอาด"], "มียอดใหม่แข็งแรงหรือมีผลทดลองที่อธิบายได้", ["ยอดเพิ่ม/ขยาย", "บันทึกจำนวนและลักษณะ"], ["callus มาก/ยอดผิดรูป/หยุดโต"], evidenceState, sourceIds, [{ label: "จำนวนยอด", unit: "count", required: true }]),
  step("rooting", 12, "ออกราก", "สร้างต้นที่พร้อมปรับสภาพ", ["เลือกยอดมีใบและไม่ผิดรูป", "ย้ายไปสูตร rooting ที่ระบุใน version", "บันทึกจำนวนรากและความยาวโดยประมาณ", "แยกยอดที่เน่าหรือไม่ตอบสนอง"], ["อาหาร rooting", "ภาชนะใหม่", "ไม้บรรทัด"], ["รากต้องไม่ถูกบังคับให้ใช้สูตรเดียวกับ multiplication"], ["รักษาความสะอาดและไม่ให้อาหารแฉะผิดปกติ"], "มีรากใช้งานได้และยอดไม่ทรุด", ["มีรากอย่างน้อยหนึ่งราก", "ยอดยังแข็งแรง"], ["ยอดเน่าหรือไม่สร้างราก"], evidenceState, sourceIds, [{ label: "จำนวนราก", unit: "count", required: true }, { label: "ความยาวราก", unit: "mm", required: false }]),
  step("acclimatization", 13, "ปรับสภาพออกขวด", "ลดการสูญเสียเมื่อนำออกสู่สภาพภายนอก", ["นำต้นออกและล้างวุ้นโดยไม่ทำลายราก", "ใช้วัสดุโปร่งและควบคุมความชื้น", "ค่อย ๆ เปิดฝา/ลดความชื้น", "บันทึกวัสดุ แสง และอัตรารอด"], ["วัสดุปลูกโปร่ง", "ภาชนะ", "ฝาครอบความชื้น", "ป้าย"], ["ห้ามลดความชื้นรวดเดียว", "หลีกเลี่ยงแดดตรง"], ["ล้างมือและอุปกรณ์ก่อนย้าย"], "ต้นไม่เหี่ยวต่อเนื่องและเริ่มปรับตัว", ["ไม่เหี่ยวต่อเนื่อง", "มีใบใหม่หรือยอดแข็งแรง"], ["เหี่ยวหรือเน่าต่อเนื่อง"], "Adapted", sourceIds),
  step("variegation-follow-up", 14, "ติดตามความแข็งแรงและลายด่าง", "เปรียบเทียบต้นลูกกับ baseline", ["ถ่ายรูปใบใหม่ในแสงสม่ำเสมอ", "บันทึกสีเขียว ขาว ชมพู และความแข็งแรงแยกกัน", "ไม่สรุป genetic fidelity จากสีใบเพียงอย่างเดียว", "ส่งตรวจเพิ่มเติมเมื่อจำเป็น"], ["กล้อง", "แบบบันทึก", "เงื่อนไขแสงคงที่"], ["เก็บภาพตามวันและต้นเดียวกัน", "แยก observation จากข้อสรุปทางพันธุกรรม"], [], "มี timeline เปรียบเทียบที่ไม่กล่าวเกินหลักฐาน", ["มีภาพและ note ต่อเนื่อง"], ["ข้อมูลไม่พอหรือสีเปลี่ยนโดยไม่ทราบเงื่อนไข"], "Adapted", sourceIds),
  step("troubleshooting", 15, "ตัดสินใจเมื่อไม่ผ่าน", "เลือกแก้ที่สาเหตุก่อนเริ่มรอบใหม่", ["จัดประเภทเป็น contamination, browning, necrosis, no response หรือ abnormal growth", "ตรวจ batch, เวลา, operator และภาพก่อนปรับสูตร", "เปลี่ยนตัวแปรทีละกลุ่มและบันทึกเป็น Experimental"], ["record sheet", "รูปถ่าย", "ประวัติ batch"], ["ห้ามแก้หลายตัวแปรพร้อมกันโดยไม่บันทึก"], ["ทิ้งวัสดุปนเปื้อนอย่างปลอดภัย"], "มีสาเหตุและแผนรอบถัดไป", ["มี failure category", "มี next action"], ["ไม่สามารถหาสาเหตุหรือความเสี่ยงสูง"], "Adapted"),
  step("evidence-review", 16, "ทบทวนหลักฐาน", "แยกผลทดลองจริงจากคำแนะนำที่ประยุกต์", ["เชื่อม claim/source กับสูตรและผลลัพธ์", "ระบุว่าเป็น direct evidence หรือ adaptation", "ไม่ยกระดับสถานะจน reviewer อนุมัติ"], ["source register", "claim review", "protocol version"], ["ทุก Verified claim ต้องมี source และ evidence location"], [], "สถานะหลักฐานสอดคล้องกับข้อมูล", ["มี source/claim หรือระบุ Experimental"], ["ไม่มีหลักฐานรองรับ"], "Adapted"),
  step("record-export", 17, "สรุป Lot และ export", "เก็บผลที่ทำซ้ำและย้อนตรวจได้", ["สรุปสูตร batch, explant, contamination, shoot/root และภาพ", "export protocol/ผลเป็น versioned record", "เก็บ reference และผู้ทำ"], ["timeline", "export JSON/Markdown", "ที่เก็บงานวิจัย"], ["ห้าม export เป็น Verified หากยังไม่ผ่าน review"], [], "มี record พร้อมใช้เทียบรอบถัดไป", ["มี Lot summary", "มี version และ audit"], ["ข้อมูลขาดจนทำซ้ำไม่ได้"], "Adapted"),
  step("closeout", 18, "ปิดรอบและวางแผนต้นถัดไป", "ใช้ข้อมูลรอบแรกพัฒนารอบถัดไปโดยไม่ปะปนต้น", ["ปิด Lot ด้วย outcome และข้อจำกัด", "ต้นถัดไปต้องสร้าง Plant Record/Lot ใหม่", "ใช้ template เดิมเป็นฐานแต่บันทึก protocol version ใหม่เมื่อปรับ", "ไม่รวมผลของคนละ genotype โดยอัตโนมัติ"], ["Lot record", "change log", "protocol version"], ["ห้ามแก้ published version ตรง ๆ", "ต้องรักษา parent/source traceability"], [], "ต้นที่สองเริ่มจากข้อมูลที่อ่านย้อนกลับได้", ["มี closeout", "มี next experiment"], ["ผลยังไม่ชัดหรือข้อมูลไม่ครบ"], "Adapted"),
];

const monograph = (taxonId: string, title: string, subtitle: string, evidenceState: EvidenceState, sourceIds: string[], extraClaims: KnowledgeClaim[]): PhilodendronMonograph => ({
  taxonId, title, subtitle, sourceIds, lastReviewedAt: "2026-07-24",
  sections: [
    { id: "taxonomy", title: "Taxonomy", summary: "ชื่อวิทยาศาสตร์ ชื่อการค้า และสถานะการยืนยันต้องแยกจากกัน", claims: extraClaims.filter((claim) => claim.id.includes("taxonomy")) },
    { id: "biology", title: "Biology", summary: "ลักษณะการเจริญและส่วนที่ใช้ระบุชนิด โดยไม่สรุปเกินแหล่งอ้างอิง", claims: extraClaims.filter((claim) => claim.id.includes("biology")) },
    { id: "identification", title: "Identification", summary: "ใช้หลายจุดสังเกตร่วมกัน และระบุความไม่แน่นอนของต้นขายจริง", claims: extraClaims.filter((claim) => claim.id.includes("identification")) },
    { id: "tissue-culture", title: "Tissue culture", summary: "คู่มือ guided workflow 18 ขั้น พร้อม evidence state ต่อขั้น", claims: extraClaims.filter((claim) => claim.id.includes("culture")) },
  ],
  tissueCulture: { method: "nodal", disclaimer: "คู่มือนี้เป็น research-assisted workflow ไม่ใช่การรับประกันผล สูตรหรือเวลาที่ไม่มีหลักฐานตรงพันธุ์ต้องบันทึกเป็น Adapted/Experimental และทดสอบกับระบบของผู้ใช้เอง", steps: sharedSteps(evidenceState, sourceIds), mediaNotes: ["ตารางสูตรเป็นจุดตั้งต้นสำหรับ batch เล็ก; ปริมาณต่อ batch คำนวณจากค่าต่อลิตรและต้องใช้ stock solution สำหรับฮอร์โมน", "ค่าฮอร์โมนหรือวิธีฟอกที่มีหลักฐานตรงเฉพาะบางขั้นต้องไม่ถูกตีความว่าเป็น Verified ทั้งสูตร"] , mediaRecipes: mediaRecipes(evidenceState, sourceIds, title.includes("Pink") ? 1 : 0.5, title.includes("Pink") ? 0 : 0.05, title.includes("Pink") ? "งาน Pink Princess รองรับ BAP 1.0 mg/L และ IBA 3.0 mg/L ในระบบที่ศึกษา แต่ตารางเต็มนี้เป็น Adapted สำหรับการเริ่มจาก nodal explant" : "Violin ยังไม่มีหลักฐานตรงพันธุ์ จึงถือสูตรทั้งหมดเป็น Experimental/Adapted และต้องบันทึกผลทุก batch"), explantGuide: explantGuide(title, evidenceState, sourceIds) },
});

export const philodendronMonographs: PhilodendronMonograph[] = [
  monograph("cultivar-pink-princess", "Philodendron erubescens ‘Pink Princess’", "Pink Princess · nodal culture manual", "Adapted", ["source-kew-philodendron", "source-pp-2023", "source-pp-2025"], [
    { id: "pink-taxonomy", statement: "Pink Princess ถูกบันทึกในระบบเป็น cultivar/trade identity ภายใต้ Philodendron erubescens ไม่ใช่ species ใหม่", evidenceState: "Adapted", sourceIds: ["source-kew-philodendron"] },
    { id: "pink-biology", statement: "การคงลักษณะไม้ด่างต้องติดตามทั้ง phenotype และ traceability ของ explant; สีใบเพียงอย่างเดียวไม่ใช่การยืนยัน genetic fidelity", evidenceState: "Verified", sourceIds: ["source-pp-2025"] },
    { id: "pink-identification", statement: "การระบุ Pink Princess จากภาพควรบันทึกเป็น cultivar confidence และเก็บรูปข้อ/ก้าน/ใบ ไม่ใช้ชื่อผู้ขายเป็นหลักฐานเดียว", evidenceState: "Adapted", sourceIds: ["source-kew-philodendron", "source-pp-2023"] },
    { id: "pink-culture", statement: "งานปี 2023 รายงาน MS + BAP 1.0 mg/L สำหรับ shoot proliferation และ solid MS + IBA 3.0 mg/L สำหรับ rooting ในระบบที่ศึกษา", evidenceState: "Verified", sourceIds: ["source-pp-2023"] },
    { id: "pink-culture-2", statement: "งานปี 2025 รายงาน temporary immersion และประเมิน genetic fidelity; ไม่ควรย้ายเงื่อนไข TIB ไปใช้กับ home lab โดยตรง", evidenceState: "Verified", sourceIds: ["source-pp-2025"] },
  ]),
  monograph("trade-name-violin-variegated", "Philodendron bipennifolium ‘Violin’ variegated", "Violin variegated · nodal culture manual", "Experimental", ["source-kew-philodendron", "source-violin-gap"], [
    { id: "violin-taxonomy", statement: "Violin variegated ถูกแยกเป็น trade-name/cultivar record ใต้ Philodendron bipennifolium และไม่ถูกนับเป็น species แยก", evidenceState: "Adapted", sourceIds: ["source-kew-philodendron"] },
    { id: "violin-biology", statement: "ข้อมูลสัณฐานของต้นขายจริงอาจเปลี่ยนตามระยะใบและสภาพเลี้ยง จึงต้องเก็บภาพหลายมุมก่อนระบุชนิด", evidenceState: "Adapted", sourceIds: ["source-kew-philodendron"] },
    { id: "violin-identification", statement: "ชื่อ Violin จากผู้ขายยังไม่ใช่หลักฐานยืนยัน species หรือความคงตัวของลายด่าง", evidenceState: "Experimental", sourceIds: ["source-violin-gap"] },
    { id: "violin-culture", statement: "ยังไม่มี protocol tissue culture ตรงพันธุ์ที่ยืนยันในฐานข้อมูลนี้; สูตรทั้งหมดต้องเริ่มเป็น Experimental หรือ Adapted จาก Philodendron ใกล้เคียง", evidenceState: "Experimental", sourceIds: ["source-violin-gap"] },
  ]),
];

export function validateKnowledgeContent(items: Array<Pick<KnowledgeClaim, "evidenceState" | "sourceIds">>): string[] {
  return items.filter((item) => item.evidenceState === "Verified" && item.sourceIds.length === 0).map(() => "Verified content requires at least one source");
}

export function monographForTaxon(taxonId: string): PhilodendronMonograph | null {
  return philodendronMonographs.find((item) => item.taxonId === taxonId) ?? null;
}

export function plantPrefillForTaxon(taxonId: string): { taxonId: string; suspectedSpecies: string; identificationConfidence: "Low" | "Medium" | "High" } | null {
  const taxon = philodendronTaxa.find((item) => item.id === taxonId);
  if (!taxon) return null;
  return { taxonId: taxon.id, suspectedSpecies: taxon.displayName, identificationConfidence: taxon.rank === "species" ? "High" : taxon.confidence === "High" ? "Medium" : taxon.confidence === "Medium" ? "Medium" : "Low" };
}

export type { TaxonRank };
