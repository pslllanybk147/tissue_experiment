import type { GrowthForm } from "./types";

/** กล้วยไม้กลุ่มที่มีลำสะสมอาหารอ้วนเป็นท่อน ๆ และมีตาข้างอยู่ตามข้อของลำนั้น
 *  ครอบ Dendrobium และกล้วยไม้อื่นที่มีลำลูกกล้วย */
export const pseudobulbNode: GrowthForm = {
  id: "pseudobulb-node",
  label: "กล้วยไม้มีลำลูกกล้วย",
  plainDescription:
    "มีลำอ้วนเป็นท่อนตั้งขึ้นจากโคนกอ แต่ละท่อนมีข้อเป็นปล้องและมีเกล็ดบาง ๆ หุ้ม รากออกจากโคนกอไม่ใช่จากดิน",
  landmarks: [
    {
      id: "pseudobulb",
      term: "ลำลูกกล้วย",
      aka: ["pseudobulb", "ลำ", "ลำต้นสะสมอาหาร"],
      whatItIs: "ลำอ้วนที่ทำหน้าที่สะสมน้ำและอาหาร และมีตาข้างอยู่ตามข้อของมัน",
      howToFind: "มองหาส่วนที่อ้วนกว่าช่วงอื่นของต้น ตั้งขึ้นจากโคนกอ บีบดูจะแน่นและมีน้ำ",
      confusedWith: "ไม่ใช่หัวใต้ดิน ลำลูกกล้วยอยู่เหนือเครื่องปลูกและมองเห็นได้",
      evidence: { level: "botanical-fact", sourceIds: ["source-dendrobium-pseudobulb-2020"] },
    },
    {
      id: "pseudobulb-node",
      term: "ข้อบนลำลูกกล้วย",
      aka: ["node", "ปล้องลำ"],
      whatItIs: "รอยคอดเป็นระยะตามความยาวของลำ แต่ละรอยคือหนึ่งข้อ",
      howToFind: "ลอกเกล็ดแห้งที่หุ้มลำออกเบา ๆ จะเห็นรอยคอดเป็นวงรอบลำเป็นระยะ",
      evidence: { level: "botanical-fact", sourceIds: ["source-dendrobium-pseudobulb-2020"] },
    },
    {
      id: "pseudobulb-eye",
      term: "ตาข้างบนลำ",
      aka: ["axillary bud", "ตา"],
      whatItIs: "ปุ่มเล็กที่อยู่ตรงข้อของลำ ซึ่งจะแตกเป็นลำใหม่หรือหน่อได้",
      howToFind: "หลังลอกเกล็ดออกแล้ว มองที่ข้อจะเห็นปุ่มนูนสีเขียวอ่อนหรือขาว",
      confusedWith: "ไม่ใช่ตาดอก ตาดอกมักอยู่ใกล้ปลายลำและแบนกว่า ส่วนตาที่ใช้เพาะอยู่ตามข้อกลางลำ",
      evidence: { level: "botanical-fact", sourceIds: ["source-dendrobium-pseudobulb-2020"] },
    },
  ],
  defaultExplant: {
    landmarkId: "pseudobulb-node",
    offsetMm: 10,
    direction: "below",
    sizeMm: [15, 25],
    evidence: {
      level: "unsupported",
      sourceIds: [],
      searchedAt: "2026-08-05",
      searchQueries: [
        "Dendrobium pseudobulb node explant micropropagation from field grown plants",
        "orchid axillary bud explant surface sterilization mother plant",
      ],
      note:
        "งานที่พบทั้งหมดใช้ลำลูกกล้วยที่เพาะขึ้นในขวดอยู่แล้ว หรือใช้ตาข้างจากต้นที่ปลอดเชื้อแล้ว " +
        "ตามเกณฑ์คัดกรองข้อหนึ่งของ newplant_protocol.md แปลว่าขั้นเลือกชิ้น ตัด และฟอกจากต้นแม่จริง " +
        "ยังไม่มีหลักฐานรองรับ ค่าที่แสดงเป็นค่าตั้งต้นเชิงโครงสร้างเท่านั้น ต้องทดสอบช่วงก่อนใช้จริง",
    },
  },
  beginnerDifficulty: 3,
  whyThisDifficulty:
    "ตาข้างเห็นได้หลังลอกเกล็ด แต่กล้วยไม้ปลูกในเครื่องปลูกที่ชื้นและมีเชื้อรามาก ทำให้ปนเปื้อนง่ายกว่าทรงอื่น และงานวิจัยส่วนใหญ่เริ่มจากเนื้อเยื่อที่ปลอดเชื้ออยู่แล้ว จึงไม่มีตัวเลขของขั้นฟอกให้ยึด",
};
