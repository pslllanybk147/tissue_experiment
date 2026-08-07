import type { EvidenceRef } from "@/lib/manual/types";

/** สี่อย่างที่กระบวนการเพาะเลี้ยงเนื้อเยื่อต้องได้ ไม่ว่าจะได้มาด้วยอุปกรณ์อะไร */
export const capabilityIds = [
  "sterile-medium",
  "sterile-water",
  "sterile-vessel",
  "surface-decontam",
  "sterile-tools",
] as const;
export type CapabilityId = (typeof capabilityIds)[number];

export const capabilityLabel: Record<CapabilityId, string> = {
  "sterile-medium": "อาหารปลอดเชื้อ",
  "sterile-water": "น้ำปลอดเชื้อสำหรับล้าง",
  "sterile-vessel": "ภาชนะและฝาปลอดเชื้อ",
  "surface-decontam": "ผิวชิ้นพืชสะอาด",
  "sterile-tools": "คีมและใบมีดปลอดเชื้อ",
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
  "nadcc-tablet",
  "thermometer",
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
  "nadcc-tablet": "เม็ดคลอรีน NaDCC สำหรับทำน้ำดื่มสะอาด",
  thermometer: "เทอร์โมมิเตอร์ที่วัดได้ถึง 100 องศาเซลเซียส",
};

export const equipmentHint: Partial<Record<EquipmentId, string>> = {
  "pressure-cooker": "ถ้าถึง 15 psi จะได้ 121 องศาเซลเซียสเท่ากับหม้อนึ่งของแล็บ",
  "stove-pot": "ได้แค่ 100 องศาเซลเซียส ไม่ฆ่าสปอร์",
  "nadcc-tablet": "หาซื้อเป็นเม็ดทำน้ำดื่มสะอาดหรือเม็ดคลอรีนสระว่ายน้ำ ต้องเลือกชนิดที่ระบุว่าเป็น NaDCC ล้วน",
  thermometer: "จำเป็นเมื่อใช้วิธีเติมสารฆ่าเชื้อลงอาหาร เพราะต้องรู้ว่าอาหารเย็นพอหรือยัง",
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
      sourceIds: [
        "source-ruaysap-chemical-sterilization",
        "source-teng-nonautoclave-vessels",
        "source-sugarcane-nonautoclave-2019",
        "source-cmu-rose-home-tc",
      ],
      note:
        "มีงานตีพิมพ์รองรับหลายชิ้นและหลายพืช ทั้งกล้วย อ้อย และ Philodendron สกุลเดียวกับที่ระบบมีคู่มืออยู่ " +
        "แต่ตัวเลขที่แต่ละแหล่งใช้ห่างกันราวสิบห้าเท่า เมื่อแปลงเป็นความเข้มข้นของ NaOCl ในอาหารแล้ว " +
        "ตั้งแต่ 0.0008% ในงานอ้อย 0.002% ในงานกล้วย 0.003% ในคลิปสาธิตของ มช. ไปจนถึง 0.012% ในงาน Philodendron " +
        "จึงให้เป็นช่วงให้ทดสอบ ไม่ใช่ตัวเลขเดียวให้ทำตาม",
    },
    caution:
      "วิธีนี้ไม่เท่ากับการนึ่ง งานอ้อยรายงานการปนเปื้อน 34% ที่ความเข้มข้นที่ดีที่สุดของงานนั้น ไม่ใช่ศูนย์ " +
      "ต้องทำกระปุกเปล่าคุมทุกรอบและทำใจว่าจะเสียส่วนหนึ่งเสมอ " +
      "และจังหวะที่เติมยังไม่ลงตัว คลิปสาธิตให้รอจนอาหารเย็นต่ำกว่า 60 องศาก่อนเติม ซึ่งต้องมีเทอร์โมมิเตอร์ " +
      "ส่วนงานอ้อยเติมก่อนแล้วต้มต่ออีก 5 นาทีและยังได้ผล สองแหล่งนี้ขัดกัน เก็บไว้ทั้งคู่",
  },
  {
    id: "medium-nadcc",
    capability: "sterile-medium",
    title: "เติมเม็ดคลอรีน NaDCC ลงในอาหารแทนการนึ่ง",
    requires: ["nadcc-tablet"],
    evidence: {
      level: "adapted",
      sourceIds: ["source-nadcc-media-alternative-2021", "source-nadcc-vs-naocl-1985"],
      note:
        "ช่วงที่งานรายงานคือ 0.05 ถึง 1.0 กรัมต่อลิตร ข้อได้เปรียบเหนือไฮเตอร์ไม่ใช่ความแรง " +
        "เพราะที่คลอรีนออกฤทธิ์เท่ากันฤทธิ์ฆ่าเชื้อพอกัน แต่อยู่ที่ความแน่นอน คือเม็ดเก็บได้เป็นปีโดยไม่เสื่อม " +
        "ต่างจากน้ำยาฟอกขาวที่อ่อนลงตามเดือนโดยผู้ใช้ไม่รู้ตัว และชั่งผงได้แม่นกว่าตวงของเหลว",
    },
    caution:
      "เม็ดคลอรีนสระว่ายน้ำหลายยี่ห้อมีสารเสริม เช่นสารกันจับตัวเป็นก้อนหรือสารปรับความกระด้าง " +
      "ซึ่งยังไม่มีใครทดสอบว่ากระทบเนื้อเยื่อพืชไหม ต้องเลือกชนิดที่ระบุว่าเป็น NaDCC ล้วนสำหรับทำน้ำดื่ม",
  },
  {
    id: "water-bleach",
    capability: "sterile-water",
    title: "เติมไฮเตอร์ลงน้ำแล้วตั้งทิ้งไว้",
    requires: ["bleach"],
    evidence: {
      level: "adapted",
      sourceIds: ["source-teng-nonautoclave-vessels", "source-cmu-rose-home-tc"],
      note:
        "ใช้ความเข้มข้นเดียวกับที่เติมลงอาหาร แล้วตั้งทิ้งไว้อย่างน้อยหนึ่งชั่วโมงก่อนใช้ " +
        "เป็นทางเดียวที่ทำน้ำสำหรับล้างได้เองโดยไม่มีหม้อนึ่ง ต่างจากการต้มซึ่งไม่ฆ่าสปอร์",
    },
    caution:
      "คลอรีนที่ค้างในน้ำล้างจะตามเข้าไปกับชิ้นพืช ถ้าชิ้นซีดขาวหลังลงอาหาร ให้ลดความเข้มข้นของน้ำล้างก่อนอย่างอื่น",
  },
  {
    id: "tools-boil-alcohol",
    capability: "sterile-tools",
    title: "ต้มเครื่องมือก่อนเริ่ม แล้วจุ่มแอลกอฮอล์ระหว่างทำงาน",
    requires: ["stove-pot", "alcohol-70"],
    evidence: {
      level: "adapted",
      sourceIds: ["source-cmu-rose-home-tc", "source-sigma-explant-sterilization"],
      note:
        "ต้มในน้ำเดือด 20 นาทีก่อนเริ่มงาน แล้วระหว่างทำงานแช่คีมและใบมีดในแอลกอฮอล์ 70 เปอร์เซ็นต์ " +
        "หยิบขึ้นมาสะบัดให้แห้งก่อนใช้ทุกครั้ง คลิปสาธิตใช้วิธีนี้ล้วนโดยไม่จุดไฟเลย",
    },
    caution:
      "ต้องรอให้แอลกอฮอล์ระเหยหมดก่อนแตะชิ้นพืช ไม่งั้นแอลกอฮอล์จะฆ่าเนื้อเยื่อพร้อมกับเชื้อ",
  },
  {
    id: "tools-flame",
    capability: "sterile-tools",
    title: "เผาเครื่องมือด้วยเปลวไฟ",
    requires: ["alcohol-70"],
    evidence: {
      level: "adapted",
      sourceIds: ["source-sigma-explant-sterilization"],
      note: "วิธีมาตรฐานในห้องแล็บ ให้ผลเร็วและแน่นอนกว่าการจุ่มแอลกอฮอล์อย่างเดียว",
    },
    caution:
      "อันตรายมากในพื้นที่ปิดที่พ่นแอลกอฮอล์เป็นละออง เช่นตู้ทำงานหรือห้องที่คลุมด้วยแผ่นพลาสติก " +
      "ละอองแอลกอฮอล์ติดไฟได้และแผ่นพลาสติกจะละลายและลามเร็ว " +
      "ถ้าจะใช้วิธีนี้ต้องอยู่นอกพื้นที่คลุม และต้องหยุดพ่นแอลกอฮอล์ก่อนจุดไฟทุกครั้ง",
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
