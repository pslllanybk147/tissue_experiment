import type { PlantPack } from "../types";
import { standardSequence } from "./pink-princess";

export const genericPhilodendronPack: PlantPack = {
  slug: "generic-philodendron",
  scientificName: "Philodendron sp.",
  commonName: "ฟิโลเดนดรอนที่ยังไม่ยืนยันชนิด",
  method: "nodal",
  summary: "เส้นทางกลางสำหรับต้นที่ยังระบุชนิดไม่ได้",
  durationLabel: "4 ถึง 8 เดือน",
  sequence: [...standardSequence],
  overrides: {
    identify: {
      summary: "ยืนยันเท่าที่ยืนยันได้ แล้วบันทึกว่ายังไม่ทราบชนิด",
      evidence: { level: "adapted", sourceIds: ["source-kew-wcvp-v15"], note: "ใช้เส้นทางกลางเมื่อยังระบุชนิดไม่ได้" },
    },
    sterilize: {
      evidence: { level: "unsupported", sourceIds: [], searchedAt: "2026-08-02", searchQueries: ["Philodendron micropropagation nodal explant surface sterilization", "Araceae explant sterilization sodium hypochlorite concentration", "การเพาะเลี้ยงเนื้อเยื่อ ฟิโลเดนดรอน ฟอกฆ่าเชื้อ"], note: "ยังไม่ทราบชนิด จึงไม่มีงานตรงพันธุ์ให้อ้างอิง" },
    },
    multiply: {
      evidence: { level: "unsupported", sourceIds: [], searchedAt: "2026-08-02", searchQueries: ["Philodendron micropropagation nodal explant surface sterilization", "Araceae explant sterilization sodium hypochlorite concentration", "การเพาะเลี้ยงเนื้อเยื่อ ฟิโลเดนดรอน ฟอกฆ่าเชื้อ"], note: "ยังไม่ทราบชนิด ให้เริ่มจากค่าต่ำแล้วเพิ่มทีละขั้น" },
    },
    root: {
      evidence: { level: "unsupported", sourceIds: [], searchedAt: "2026-08-02", searchQueries: ["Philodendron micropropagation nodal explant surface sterilization", "Araceae explant sterilization sodium hypochlorite concentration", "การเพาะเลี้ยงเนื้อเยื่อ ฟิโลเดนดรอน ฟอกฆ่าเชื้อ"], note: "ยังไม่ทราบชนิด" },
    },
    acclimatize: {
      evidence: { level: "adapted", sourceIds: ["source-kew-philodendron"], note: "ใช้หลักการปรับสภาพทั่วไปของสกุล" },
    },
    monitor: {
      evidence: { level: "adapted", sourceIds: ["source-kew-philodendron"] },
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
      evidence: { level: "unsupported", sourceIds: [], searchedAt: "2026-08-02", searchQueries: ["Philodendron micropropagation nodal explant surface sterilization", "Araceae explant sterilization sodium hypochlorite concentration", "การเพาะเลี้ยงเนื้อเยื่อ ฟิโลเดนดรอน ฟอกฆ่าเชื้อ"], note: "อาหารพื้นฐานที่ยังไม่ใส่ฮอร์โมน" },
    },
  ],
  sourceIds: ["source-kew-philodendron", "source-kew-wcvp-v15"],
};
