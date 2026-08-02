import type { PlantPack } from "../types";
import { standardSequence } from "./pink-princess";

export const violinVariegatedPack: PlantPack = {
  slug: "violin-variegated",
  scientificName: "Philodendron bipennifolium ‘Violin’ variegated",
  commonName: "ฟิโลเดนดรอน ไวโอลิน ด่าง",
  method: "nodal",
  summary: "เส้นทางทดลอง ยังไม่มีงานวิจัยตรงพันธุ์ให้อ้างอิง",
  durationLabel: "4 ถึง 8 เดือน",
  sequence: [...standardSequence],
  overrides: {
    sterilize: {
      evidence: { level: "unsupported", sourceIds: [], note: "ยังไม่มีงานฟอกผิวตรงพันธุ์นี้" },
    },
    multiply: {
      evidence: { level: "unsupported", sourceIds: [], note: "ยังไม่มีงานเพิ่มจำนวนตรงพันธุ์นี้ ให้เริ่มจากค่ากลางของสกุลแล้วเปลี่ยนทีละตัวแปร" },
    },
    root: {
      evidence: { level: "unsupported", sourceIds: [], note: "ยังไม่มีงานออกรากตรงพันธุ์นี้" },
    },
    acclimatize: {
      evidence: { level: "adapted", sourceIds: ["source-kew-philodendron"], note: "ใช้หลักการปรับสภาพทั่วไปของสกุล" },
    },
    monitor: {
      evidence: { level: "adapted", sourceIds: ["source-violin-gap"], note: "ยังไม่มีงานประเมินความคงตัวของพันธุ์นี้" },
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
      evidence: { level: "unsupported", sourceIds: [], note: "อาหารพื้นฐานที่ยังไม่ใส่ฮอร์โมน" },
    },
  ],
  sourceIds: ["source-violin-gap", "source-kew-philodendron"],
};
