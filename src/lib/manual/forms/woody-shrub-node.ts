import type { GrowthForm } from "./types";

/** ไม้เนื้อแข็งที่ข้อเห็นได้แต่เนื้อไม้แก่ตอบสนองแย่ ต้องเลือกกิ่งอ่อนเท่านั้น
 *  ครอบ กุหลาบ ชวนชม และไม้พุ่มประดับอื่น */
export const woodyShrubNode: GrowthForm = {
  id: "woody-shrub-node",
  label: "ไม้พุ่มเนื้อแข็ง",
  plainDescription:
    "ลำต้นตั้งและแตกกิ่งเป็นพุ่ม เนื้อกิ่งแก่แข็งเป็นไม้ ผิวออกสีน้ำตาล ส่วนกิ่งที่แตกใหม่ยังเขียวและอ่อนอยู่",
  landmarks: [
    {
      id: "shoot-tip",
      term: "ยอดอ่อน",
      aka: ["shoot tip", "ยอด"],
      whatItIs: "ช่วงปลายกิ่งที่ยังเขียว อ่อน และหักงอได้โดยไม่แตก",
      howToFind: "ไล่จากปลายกิ่งลงมา ช่วงที่ยังเขียวทั้งท่อนและงอได้คือยอดอ่อน มักยาว 5 ถึง 15 ซม.",
      confusedWith: "ไม่ใช่กิ่งแก่ กิ่งแก่ผิวออกน้ำตาล แข็ง และหักดังเมื่อพยายามงอ",
      evidence: { level: "botanical-fact", sourceIds: ["source-botany-plant-morphology"] },
    },
    {
      id: "woody-node",
      term: "ข้อบนกิ่ง",
      aka: ["node", "ข้อ"],
      whatItIs: "จุดที่ใบหรือกิ่งแขนงงอกออกจากลำกิ่ง",
      howToFind: "มองหาจุดที่ก้านใบต่อกับกิ่ง หรือรอยแผลเป็นวงตรงที่ใบเคยหลุดไป",
      evidence: { level: "botanical-fact", sourceIds: ["source-botany-plant-morphology"] },
    },
    {
      id: "woody-axillary-bud",
      term: "ตาข้างบนกิ่ง",
      aka: ["axillary bud", "ตา"],
      whatItIs: "ปุ่มเล็กที่ซอกระหว่างก้านใบกับกิ่ง ซึ่งจะแตกเป็นกิ่งใหม่",
      howToFind: "มองที่มุมบนของจุดที่ก้านใบต่อกับกิ่ง จะเห็นปุ่มเล็กนูนขึ้นมา",
      evidence: { level: "botanical-fact", sourceIds: ["source-botany-plant-morphology"] },
    },
  ],
  defaultExplant: {
    landmarkId: "woody-node",
    offsetMm: 10,
    direction: "below",
    sizeMm: [15, 25],
    evidence: {
      level: "adapted",
      sourceIds: ["source-rose-nodal", "source-adenium-invitro"],
      note:
        "งานกุหลาบใช้ชิ้นข้อที่มีตาเดียว ส่วนงาน Adenium obesum รายงานตรงกันข้ามว่า " +
        "ชิ้นข้อเกิดสีน้ำตาลที่รอยตัดภายในสองสัปดาห์ ขณะที่ยอดอ่อนและชิ้นใบตอบสนองดีกว่า " +
        "สองแหล่งนี้ขัดกัน จึงเก็บไว้ทั้งคู่ตามกฎในโปรโตคอล ถ้าพืชของคุณมียางมาก ให้เริ่มจากยอดอ่อนแทนชิ้นข้อ",
    },
  },
  beginnerDifficulty: 3,
  whyThisDifficulty:
    "ข้อเห็นชัดไม่ต่างจากเถาเลื้อย แต่เนื้อไม้แก่มีฟีนอลิกสูงจึงดำเร็วที่รอยตัด และกิ่งที่ใช้ได้จริงมีแค่ช่วงยอดอ่อนซึ่งมีจำนวนจำกัดในแต่ละต้น",
};
