import type { GrowthForm } from "./types";

/** ทรงที่ง่ายที่สุดสำหรับมือใหม่ เพราะข้อเห็นด้วยตาเปล่า ตัดผิดตำแหน่งได้ยาก
 *  ครอบ Philodendron, Monstera, Epipremnum, Scindapsus, Syngonium
 *  และเถาเลื้อยอื่นที่มีข้อชัด */
export const climbingVineVisibleNode: GrowthForm = {
  id: "climbing-vine-visible-node",
  label: "เถาเลื้อย ข้อเห็นชัด",
  plainDescription:
    "ลำต้นทอดยาวเลื้อยไปตามพื้นหรือพาดขึ้นหลัก มีวงนูนเป็นระยะ ๆ ตามลำต้น และมักมีรากเล็ก ๆ งอกออกจากวงนูนนั้น",
  landmarks: [
    {
      id: "node",
      term: "ข้อ",
      aka: ["node", "ปม", "ปุ่ม"],
      whatItIs: "วงนูนรอบลำต้นที่ใบและรากงอกออกมา",
      howToFind: "ไล่นิ้วไปตามลำต้น จะสะดุดเป็นปุ่มเป็นระยะ ๆ ปุ่มนั้นคือข้อ",
      confusedWith: "ไม่ใช่ปล้อง ปล้องคือช่วงเรียบยาวระหว่างข้อสองข้อ",
      evidence: { level: "botanical-fact", sourceIds: ["source-botany-plant-morphology"] },
    },
    {
      id: "internode",
      term: "ปล้อง",
      aka: ["internode"],
      whatItIs: "ช่วงลำต้นที่เรียบยาวระหว่างข้อสองข้อ",
      howToFind: "หาข้อสองข้อที่อยู่ติดกัน ช่วงเรียบตรงกลางคือปล้อง",
      confusedWith: "ปล้องไม่มีตา ต่างจากข้อที่มีตาข้างอยู่",
      evidence: { level: "botanical-fact", sourceIds: ["source-botany-plant-morphology"] },
    },
    {
      id: "axillary-bud",
      term: "ตาข้าง",
      aka: ["axillary bud", "ตา"],
      whatItIs: "ปุ่มเล็กที่ซอกระหว่างก้านใบกับลำต้น ซึ่งจะแตกเป็นยอดใหม่ได้",
      howToFind: "มองที่มุมระหว่างก้านใบกับลำต้น จะเห็นปุ่มเล็กสีอ่อนกว่าลำต้น",
      evidence: { level: "botanical-fact", sourceIds: ["source-botany-plant-morphology"] },
    },
  ],
  defaultExplant: {
    landmarkId: "node",
    offsetMm: 10,
    direction: "below",
    sizeMm: [15, 20],
    evidence: {
      level: "unsupported",
      sourceIds: [],
      searchedAt: "2026-08-05",
      searchQueries: [
        "explant size nodal segment aroid micropropagation",
        "nodal cutting length in vitro Araceae",
      ],
      note: "ค่าโครงสร้างตั้งต้นของเฟส 0 ยังไม่ผ่านการค้นหลักฐานเต็มตาม newplant_protocol.md ต้องเติมในเฟส 2",
    },
  },
  beginnerDifficulty: 1,
  whyThisDifficulty:
    "ข้อเห็นด้วยตาเปล่า ตัดผิดตำแหน่งได้ยาก ยางน้อยจึงไม่ค่อยดำ และหาต้นแม่ได้ตามร้านต้นไม้ทั่วไป",
};
