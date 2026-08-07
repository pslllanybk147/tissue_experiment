import type { GrowthForm } from "./types";

/** ทรงที่มือใหม่พลาดบ่อยที่สุด เพราะมองไม่เห็นข้อเลยจากภายนอก
 *  ลำต้นสั้นมากและถูกกาบใบที่ซ้อนกันหุ้มไว้จนดูเหมือนไม่มีลำต้น
 *  ครอบ Anthurium, Alocasia, Spathiphyllum และ Philodendron ทรงพุ่มตั้ง */
export const rosetteSheathedNode: GrowthForm = {
  id: "rosette-sheathed-node",
  label: "กุหลาบซ้อน ข้อซ่อนใต้กาบ",
  plainDescription:
    "ก้านใบหลายก้านออกจากจุดเดียวกันที่โคน ซ้อนกันเป็นวงคล้ายดอกกุหลาบ มองจากข้างนอกแทบไม่เห็นลำต้น เพราะลำต้นสั้นมากและถูกโคนก้านใบหุ้มไว้",
  landmarks: [
    {
      id: "petiole",
      term: "ก้านใบ",
      aka: ["petiole", "ก้าน"],
      whatItIs: "ส่วนที่ยาวเรียวเชื่อมระหว่างแผ่นใบกับโคนต้น",
      howToFind: "ไล่จากแผ่นใบลงมาทางโคน ส่วนที่เรียวและไม่มีเนื้อใบคือก้านใบ",
      evidence: { level: "botanical-fact", sourceIds: ["source-botany-leaf-anatomy"] },
    },
    {
      id: "petiole-sheath",
      term: "กาบใบ",
      aka: ["sheath", "โคนกาบ"],
      whatItIs: "ส่วนโคนของก้านใบที่แผ่ออกและโอบรอบต้น ทำให้ก้านใบหลายก้านซ้อนกันแน่น",
      howToFind: "ไล่ก้านใบลงไปจนสุด ช่วงที่แบนออกและแนบกับต้นคือกาบใบ ลองใช้เล็บแหวกกาบชั้นนอกออกเบา ๆ",
      confusedWith: "ไม่ใช่ก้านใบ กาบใบคือช่วงโคนที่แผ่ออก ส่วนก้านใบคือช่วงกลมเรียวเหนือขึ้นไป",
      evidence: { level: "botanical-fact", sourceIds: ["source-araceae-mayo-1997"] },
    },
    {
      id: "crown",
      term: "โคนต้น",
      aka: ["crown", "จุดเจริญ"],
      whatItIs: "จุดกลางที่ก้านใบทุกก้านออกมารวมกัน และเป็นที่ที่ใบใหม่แทงขึ้น",
      howToFind: "มองลงไปตรงกลางวงก้านใบ จุดที่ใบอ่อนม้วนอยู่คือโคนต้น",
      confusedWith: "ไม่ใช่ราก โคนต้นอยู่เหนือผิวดินหรือระดับผิวดิน ส่วนรากอยู่ใต้ลงไป",
      evidence: { level: "botanical-fact", sourceIds: ["source-araceae-mayo-1997"] },
    },
  ],
  defaultExplant: {
    landmarkId: "petiole",
    offsetMm: 10,
    direction: "above",
    sizeMm: [10, 15],
    evidence: {
      level: "adapted",
      sourceIds: ["source-white-knight-2025", "source-anthurium-review-2010"],
      note:
        "ใช้ชิ้นก้านใบเพราะข้อของทรงนี้ซ่อนอยู่จนตัดข้อโดยตรงไม่ได้ในทางปฏิบัติ " +
        "งานที่ยืนยันชิ้นก้านใบทำกับ Philodendron 'White Knight' ไม่ใช่ Anthurium หรือ Alocasia โดยตรง " +
        "จึงเป็นค่าประยุกต์ระดับทรง ไม่ใช่ค่าตรงพันธุ์ของพืชใดในทรงนี้",
    },
  },
  beginnerDifficulty: 3,
  whyThisDifficulty:
    "มองไม่เห็นข้อจากภายนอก ต้องแหวกกาบใบออกจึงจะเข้าถึงเนื้อเยื่อเจริญ ทำให้เสี่ยงตัดโดนจุดเจริญจนต้นตาย และเนื้อในกาบมักมียางที่ทำให้ชิ้นพืชดำเร็ว",
};
