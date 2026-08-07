import type { GrowthForm } from "./types";

/** ทรงที่ไม่มีข้อให้ตัดเลย ต้องอาศัยการชักนำให้เกิดตาใหม่บนแผ่นใบแทน
 *  ครอบ Sansevieria (ลิ้นมังกร) และไม้ใบหนาที่แตกกอจากโคน */
export const thickLeafNoStem: GrowthForm = {
  id: "thick-leaf-no-stem",
  label: "ใบหนาตั้งตรง ไม่มีลำต้น",
  plainDescription:
    "ใบหนาแข็งตั้งขึ้นตรงจากดินเป็นกอ ไม่มีลำต้นให้เห็นและไม่มีข้อตามใบ ต้นใหม่แตกจากโคนกอใต้ดิน",
  landmarks: [
    {
      id: "leaf-blade",
      term: "แผ่นใบ",
      aka: ["leaf blade", "lamina", "ตัวใบ"],
      whatItIs: "ส่วนแบนกว้างของใบทั้งแผ่น",
      howToFind: "คือทั้งใบที่คุณจับอยู่ ตั้งแต่โคนที่โผล่จากดินจนถึงปลาย",
      evidence: { level: "botanical-fact", sourceIds: ["source-botany-leaf-anatomy"] },
    },
    {
      id: "leaf-base",
      term: "โคนใบ",
      aka: ["leaf base", "ฐานใบ"],
      whatItIs: "ส่วนล่างสุดของใบที่ต่อกับกอใต้ดิน เป็นส่วนที่มีโอกาสเกิดตาใหม่สูงที่สุด",
      howToFind: "ไล่จากปลายใบลงมาจนถึงระดับผิวดิน ช่วง 5 ถึง 10 ซม. สุดท้ายคือโคนใบ",
      confusedWith: "ไม่ใช่ราก โคนใบยังเป็นเนื้อใบสีเขียวหรือขาวอมเขียว ส่วนรากเป็นเส้นสีน้ำตาล",
      evidence: { level: "botanical-fact", sourceIds: ["source-botany-leaf-anatomy"] },
    },
    {
      id: "leaf-polarity",
      term: "ด้านบนด้านล่างของชิ้นใบ",
      aka: ["polarity", "ทิศของชิ้น"],
      whatItIs: "ทิศทางของชิ้นใบที่ตัดมา โดยด้านที่เคยอยู่ใกล้โคนต้นคือด้านล่าง",
      howToFind: "ทำเครื่องหมายที่ด้านใกล้โคนทันทีที่ตัด เช่นตัดเฉียงด้านบนให้ต่างจากด้านล่าง",
      confusedWith:
        "ถ้าวางกลับด้านลงอาหาร ชิ้นจะไม่แตกตา เพราะทิศของเนื้อเยื่อกำหนดว่าด้านไหนจะเกิดรากและด้านไหนจะเกิดยอด",
      evidence: { level: "botanical-fact", sourceIds: ["source-botany-leaf-anatomy"] },
    },
  ],
  defaultExplant: {
    landmarkId: "leaf-base",
    offsetMm: 0,
    direction: "above",
    sizeMm: [10, 20],
    evidence: {
      level: "adapted",
      sourceIds: ["source-sansevieria-leaf-disc"],
      note:
        "งานที่อ้างทำกับ Sansevieria cylindrica ด้วยชิ้นใบเป็นแผ่นกลม ไม่ใช่ S. trifasciata ที่คนไทยปลูกมากที่สุด " +
        "จึงเป็นค่าประยุกต์ระดับทรง ค่าที่ให้คือชิ้นจากช่วงโคนใบซึ่งเป็นช่วงที่มีรายงานว่าเกิดตาได้ดีที่สุด",
    },
  },
  beginnerDifficulty: 2,
  whyThisDifficulty:
    "หาชิ้นง่ายเพราะตัดใบมาได้เลย ใบหนาทนการฟอกได้ดีกว่าใบบาง แต่ต้องรอนานกว่าทรงที่มีตาอยู่แล้ว เพราะชิ้นใบต้องสร้างตาขึ้นใหม่ทั้งหมด และถ้าวางกลับด้านจะไม่แตกตาเลย",
};
