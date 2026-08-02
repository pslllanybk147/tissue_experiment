import type { PlantPack } from "../types";

const fullSequence = [
  "receive",
  "quarantine",
  "identify",
  "select-explant",
  "cut",
  "prep-media",
  "sterilize",
  "initiate",
  "check-contamination",
  "multiply",
  "root",
  "acclimatize",
  "monitor",
  "close-round",
];

export const pinkPrincessPack: PlantPack = {
  slug: "pink-princess",
  scientificName: "Philodendron erubescens ‘Pink Princess’",
  commonName: "ฟิโลเดนดรอน พิงค์ปริ๊นเซส",
  method: "nodal",
  summary: "ขยายจากตาข้าง เน้นการรักษาลายด่างชมพูให้คงอยู่",
  durationLabel: "4 ถึง 8 เดือน",
  sequence: fullSequence,
  overrides: {
    sterilize: {
      evidence: {
        level: "unsupported",
        sourceIds: [],
        note: "งานปี 2023 เริ่มจาก protocorm-like bodies และงานปี 2025 เพิ่มจำนวนจากยอดที่อยู่ในขวด ทั้งสองงานจึงเริ่มจากเนื้อเยื่อที่ปลอดเชื้ออยู่แล้ว ไม่มีขั้นฟอกผิวจากต้นแม่ให้อ้างอิง",
      },
    },
    multiply: {
      evidence: {
        level: "species-direct",
        sourceIds: ["source-pp-2023"],
        note: "BAP 1.0 mg/L เดี่ยวให้ยอดมากที่สุด รายงาน 11.2 ยอดต่อชิ้นในอาหารเหลว",
      },
    },
    root: {
      evidence: {
        level: "species-direct",
        sourceIds: ["source-pp-2023"],
        note: "IBA 3.0 mg/L ให้ 3.2 รากต่อชิ้น และรากยาว 1.9 เซนติเมตร",
      },
    },
    monitor: {
      title: "ติดตามความคงตัวของลายด่าง",
      evidence: {
        level: "species-direct",
        sourceIds: ["source-pp-2025"],
        note: "งานปี 2025 ประเมินความคงตัวทางพันธุกรรมของต้นที่ได้ แต่การดูสีใบด้วยตาไม่ใช่หลักฐานความคงตัว",
      },
    },
  },
  mediaRecipes: [
    {
      id: "establishment",
      title: "ระยะตั้งต้น",
      pH: "5.7 ถึง 5.8",
      ingredients: [
        { name: "MS basal salts", amountPerLiter: 1, unit: "×" },
        { name: "Sucrose", amountPerLiter: 30, unit: "g/L" },
        { name: "Agar", amountPerLiter: 7.5, unit: "g/L" },
      ],
      evidence: {
        level: "unsupported",
        sourceIds: [],
        note: "งานต้นทางไม่ได้รายงานสูตรตั้งต้นจากต้นแม่ เพราะเริ่มจากเนื้อเยื่อที่อยู่ในขวดแล้ว สูตรนี้จึงเป็นอาหารพื้นฐานที่ยังไม่ใส่ฮอร์โมน",
      },
    },
    {
      id: "multiplication",
      title: "ระยะเพิ่มจำนวนยอด",
      pH: "5.7 ถึง 5.8",
      ingredients: [
        { name: "MS basal salts", amountPerLiter: 1, unit: "×" },
        { name: "Sucrose", amountPerLiter: 30, unit: "g/L" },
        { name: "Agar", amountPerLiter: 7.5, unit: "g/L" },
        { name: "BAP", amountPerLiter: 1, unit: "mg/L", note: "ใช้น้ำยาแม่ ห้ามชั่งผงโดยตรงเมื่อทำปริมาณน้อย" },
      ],
      evidence: { level: "species-direct", sourceIds: ["source-pp-2023"] },
    },
    {
      id: "rooting",
      title: "ระยะออกราก",
      pH: "5.7 ถึง 5.8",
      ingredients: [
        { name: "MS basal salts", amountPerLiter: 0.5, unit: "×" },
        { name: "Sucrose", amountPerLiter: 30, unit: "g/L" },
        { name: "Agar", amountPerLiter: 7.5, unit: "g/L" },
        { name: "IBA", amountPerLiter: 3, unit: "mg/L", note: "ใช้น้ำยาแม่" },
      ],
      evidence: { level: "species-direct", sourceIds: ["source-pp-2023"] },
    },
  ],
  sourceIds: ["source-pp-2023", "source-pp-2025", "source-kew-philodendron"],
};

export { fullSequence as standardSequence };
