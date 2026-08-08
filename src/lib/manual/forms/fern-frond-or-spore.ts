import type { GrowthForm } from "./types";

/** เฟิร์นไม่มีข้อหรือตาข้างเลย ต่างจากทุกทรงอื่นในระบบนี้ที่ยังมีจุดตัดอิงข้อได้
 *  ขยายพันธุ์ได้สองทางที่ไม่เกี่ยวกันเลย คือ (1) ชักนำ green globular body (GGB) จากชิ้นใบ
 *  แล้วให้ GGB งอกเป็นต้นใหม่ หรือ (2) เพาะจากสปอร์ใต้ใบ แผ่นเสริมแต่ละชนิดจะเลือกทางที่มีหลักฐาน
 *  รองรับและทับค่าขั้น select-explant/cut/sterilize/initiate/multiply/root ใหม่ทั้งหมด
 *  ทรงนี้จึงให้แค่คำนิยามโครงสร้างและความยาก ไม่มี stepOverrides ระดับทรง เหมือนทรงเถาเลื้อย */
export const fernFrondOrSpore: GrowthForm = {
  id: "fern-frond-or-spore",
  label: "เฟิร์น ไม่มีข้อ ขยายจากใบหรือสปอร์",
  plainDescription:
    "ไม่มีลำต้นหรือข้อให้เห็นเลย ใบ (ใบเฟิร์นเรียกว่าฟรอนด์) แตกออกจากเหง้าโดยตรง บางชนิดมีจุดสีน้ำตาลเรียงเป็นแถวที่หลังใบ ซึ่งเป็นกลุ่มสปอร์",
  landmarks: [
    {
      id: "frond-blade",
      term: "ฟรอนด์",
      aka: ["frond", "ใบเฟิร์น"],
      whatItIs: "ใบเฟิร์นทั้งใบ นับตั้งแต่โคนที่ติดกับเหง้าจนถึงปลายใบ",
      howToFind: "คือใบทั้งแผ่นที่คุณจับอยู่ ไม่มีก้านใบแยกจากตัวใบชัดเจนแบบไม้ใบทั่วไป",
      confusedWith: "ไม่ใช่เหง้า เหง้าเป็นแกนที่ใบทุกใบแตกออกมา ไม่ใช่ตัวใบเอง",
      evidence: { level: "botanical-fact", sourceIds: ["source-botany-fern-morphology"] },
    },
    {
      id: "sorus",
      term: "กลุ่มอับสปอร์",
      aka: ["sorus", "sori", "จุดสปอร์"],
      whatItIs: "จุดหรือแถบสีน้ำตาลถึงดำที่ผิวด้านล่างของใบแก่ เป็นที่เก็บสปอร์",
      howToFind: "พลิกใบแก่ที่สุดของต้นขึ้นดู ถ้าเห็นจุดหรือเส้นสีน้ำตาลเรียงเป็นแถวตามแนวเส้นใบ นั่นคือกลุ่มอับสปอร์",
      confusedWith: "ไม่ใช่ราหรือแมลงเกล็ด กลุ่มอับสปอร์เรียงเป็นแถวมีระเบียบตามแนวเส้นใบเสมอ ราหรือแมลงเกล็ดกระจายไม่เป็นระเบียบ",
      evidence: { level: "botanical-fact", sourceIds: ["source-botany-fern-morphology"] },
    },
  ],
  defaultExplant: {
    landmarkId: "frond-blade",
    offsetMm: 0,
    direction: "below",
    sizeMm: [5, 10],
    evidence: {
      level: "unsupported",
      sourceIds: [],
      searchedAt: "2026-08-08",
      searchQueries: [
        "fern leaf segment size green globular body induction explant",
        "fern frond piece size tissue culture explant",
      ],
      note:
        "ขนาดชิ้นใบเริ่มต้นยังไม่มีงานที่ระบุตัวเลขชัดเจนในระดับทรง ตัวเลขจริงต้องดูจากแผ่นเสริมรายชนิด " +
        "เพราะทางสปอร์ไม่ตัดชิ้นใบเลย แต่เก็บกลุ่มอับสปอร์แทน ค่านี้ใช้ได้เฉพาะแนวทาง GGB เท่านั้น",
    },
  },
  beginnerDifficulty: 3,
  whyThisDifficulty:
    "ไม่มีข้อหรือตาให้ตัดเลย ต้องเลือกว่าจะชักนำเนื้อเยื่อใบให้กลายเป็น green globular body หรือเพาะจากสปอร์ " +
    "ทั้งสองทางใช้เวลานานกว่าไม้มีข้อมาก และการฟอกสปอร์ต้องระวังไม่ให้สปอร์เองตายไปพร้อมกับเชื้อ",
};
