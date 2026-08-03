import type { EvidenceRef } from "@/lib/manual/types";

/** สี่อย่างที่กระบวนการเพาะเลี้ยงเนื้อเยื่อต้องได้ ไม่ว่าจะได้มาด้วยอุปกรณ์อะไร */
export const capabilityIds = ["sterile-medium", "sterile-water", "sterile-vessel", "surface-decontam"] as const;
export type CapabilityId = (typeof capabilityIds)[number];

export const capabilityLabel: Record<CapabilityId, string> = {
  "sterile-medium": "อาหารปลอดเชื้อ",
  "sterile-water": "น้ำปลอดเชื้อสำหรับล้าง",
  "sterile-vessel": "ภาชนะและฝาปลอดเชื้อ",
  "surface-decontam": "ผิวชิ้นพืชสะอาด",
};

/** ถามเป็นของที่หาซื้อได้จริง ไม่ใช่ศัพท์ห้องแล็บ */
export const equipmentIds = [
  "lab-autoclave",
  "pressure-cooker",
  "stove-pot",
  "bleach",
  "alcohol-70",
  "pharmacy-sterile-water",
  "heat-resistant-vessels",
] as const;
export type EquipmentId = (typeof equipmentIds)[number];

export const equipmentLabel: Record<EquipmentId, string> = {
  "lab-autoclave": "หม้อนึ่งความดันของแล็บ",
  "pressure-cooker": "หม้ออัดแรงดันทำอาหาร",
  "stove-pot": "เตาและหม้อต้มธรรมดา",
  bleach: "ไฮเตอร์หรือน้ำยาฟอกขาวที่ฉลากบอกเปอร์เซ็นต์",
  "alcohol-70": "แอลกอฮอล์ 70 เปอร์เซ็นต์",
  "pharmacy-sterile-water": "น้ำเกลือหรือน้ำปลอดเชื้อจากร้านขายยา",
  "heat-resistant-vessels": "ภาชนะและฝาที่ทนความร้อนได้",
};

export const equipmentHint: Partial<Record<EquipmentId, string>> = {
  "pressure-cooker": "ถ้าถึง 15 psi จะได้ 121 องศาเซลเซียสเท่ากับหม้อนึ่งของแล็บ",
  "stove-pot": "ได้แค่ 100 องศาเซลเซียส ไม่ฆ่าสปอร์",
};

export type CapabilityMethod = {
  id: string;
  capability: CapabilityId;
  title: string;
  /** ต้องมีอุปกรณ์ครบทุกชิ้นในรายการนี้จึงจะใช้วิธีนี้ได้ */
  requires: EquipmentId[];
  evidence: EvidenceRef;
  caution?: string;
};

const searchRecord = {
  searchedAt: "2026-08-03",
  searchQueries: [
    "sterile water without autoclave plant tissue culture boiling spores",
    "boiled water sterilization spores plant tissue culture",
    "น้ำปลอดเชื้อ เพาะเลี้ยงเนื้อเยื่อ ไม่มีหม้อนึ่ง",
  ],
};

export const capabilityMethods: CapabilityMethod[] = [
  {
    id: "medium-autoclave",
    capability: "sterile-medium",
    title: "นึ่งอาหารด้วยหม้อนึ่งความดัน",
    requires: ["lab-autoclave"],
    evidence: { level: "adapted", sourceIds: ["source-merck-media-sterilization"] },
  },
  {
    id: "medium-pressure-cooker",
    capability: "sterile-medium",
    title: "นึ่งอาหารด้วยหม้ออัดแรงดันทำอาหาร",
    requires: ["pressure-cooker"],
    evidence: {
      level: "adapted",
      sourceIds: ["source-merck-media-sterilization"],
      note: "ใช้เงื่อนไขเดียวกับหม้อนึ่งคือ 121 องศาเซลเซียส ซึ่งได้เมื่อแรงดันถึง 15 psi",
    },
    caution: "ต้องเลือกรุ่นที่ระบุแรงดันได้จริง ไม่ใช่หม้อความดันที่บอกแค่ระดับความแรง",
  },
  {
    id: "medium-bleach",
    capability: "sterile-medium",
    title: "เติมไฮเตอร์ลงในอาหารแทนการนึ่ง",
    requires: ["bleach"],
    evidence: {
      level: "adapted",
      sourceIds: ["source-ruaysap-chemical-sterilization"],
      note: "งานกับ Philodendron สกุลเดียวกันรายงานว่าเติมไฮเตอร์ 2 มล. ต่ออาหาร 1 ลิตร ยับยั้งจุลินทรีย์ได้และต้นรอดทั้งหมดหลังออกปลูก 30 วัน",
    },
    caution: "คลอรีนที่เหลือค้างทำให้เนื้อเยื่อตายได้ ต้องคุมปริมาณให้แม่น",
  },
  {
    id: "water-autoclave",
    capability: "sterile-water",
    title: "นึ่งน้ำด้วยหม้อนึ่งความดัน",
    requires: ["lab-autoclave"],
    evidence: { level: "adapted", sourceIds: ["source-merck-media-sterilization"] },
  },
  {
    id: "water-pressure-cooker",
    capability: "sterile-water",
    title: "นึ่งน้ำด้วยหม้ออัดแรงดันทำอาหาร",
    requires: ["pressure-cooker"],
    evidence: { level: "adapted", sourceIds: ["source-merck-media-sterilization"] },
  },
  {
    id: "water-pharmacy",
    capability: "sterile-water",
    title: "ซื้อน้ำเกลือปลอดเชื้อจากร้านขายยา",
    requires: ["pharmacy-sterile-water"],
    evidence: {
      level: "adapted",
      sourceIds: ["source-sigma-explant-sterilization"],
      note: "ผลิตและฆ่าเชื้อจากโรงงานมาแล้ว เป็นทางที่เสี่ยงต่ำที่สุดเมื่อทำเพียงไม่กี่กระปุก",
    },
  },
  {
    id: "water-boiled",
    capability: "sterile-water",
    title: "ต้มน้ำเดือดแล้วปล่อยให้เย็น",
    requires: ["stove-pot"],
    evidence: {
      level: "unsupported",
      sourceIds: [],
      note: "การต้มที่ 100 องศาเซลเซียสไม่ฆ่าสปอร์ของราและแบคทีเรีย จึงไม่นับเป็นน้ำปลอดเชื้อ",
      ...searchRecord,
    },
    caution: "ถ้าเลือกทางนี้ ต้องทำกระปุกเปล่าคุมทุกรอบและถือว่าผลที่ได้เป็นการทดลอง",
  },
  {
    id: "vessel-autoclave",
    capability: "sterile-vessel",
    title: "นึ่งภาชนะพร้อมฝา",
    requires: ["lab-autoclave", "heat-resistant-vessels"],
    evidence: { level: "adapted", sourceIds: ["source-merck-media-sterilization"] },
  },
  {
    id: "vessel-pressure-cooker",
    capability: "sterile-vessel",
    title: "นึ่งภาชนะด้วยหม้ออัดแรงดันทำอาหาร",
    requires: ["pressure-cooker", "heat-resistant-vessels"],
    evidence: { level: "adapted", sourceIds: ["source-merck-media-sterilization"] },
  },
  {
    id: "vessel-bleach",
    capability: "sterile-vessel",
    title: "แช่ภาชนะในไฮเตอร์เจือจางแล้วผึ่งให้แห้ง",
    requires: ["bleach"],
    evidence: {
      level: "adapted",
      sourceIds: ["source-ruaysap-chemical-sterilization"],
      note: "ใช้กับภาชนะที่ทนความร้อนไม่ได้",
    },
  },
  {
    id: "surface-bleach",
    capability: "surface-decontam",
    title: "ฟอกผิวด้วยไฮเตอร์เจือจาง",
    requires: ["bleach"],
    evidence: {
      level: "adapted",
      sourceIds: ["source-sigma-explant-sterilization", "source-anthurium-review-2010"],
      note: "จุดตั้งต้นคือคลอรีนออกฤทธิ์ 0.5 ถึง 1.0 เปอร์เซ็นต์",
    },
  },
  {
    id: "surface-alcohol-bleach",
    capability: "surface-decontam",
    title: "จุ่มแอลกอฮอล์สั้น ๆ แล้วตามด้วยไฮเตอร์",
    requires: ["alcohol-70", "bleach"],
    evidence: {
      level: "adapted",
      sourceIds: ["source-anthurium-review-2010"],
      note: "รูปแบบที่พบบ่อยในงานของวงศ์นี้คือแอลกอฮอล์ 70 เปอร์เซ็นต์ 1 นาที ตามด้วยสารฟอก",
    },
    caution: "ห้ามผสมแอลกอฮอล์กับสารฟอกในภาชนะเดียวกัน ต้องแยกขั้นและล้างระหว่างขั้น",
  },
];
