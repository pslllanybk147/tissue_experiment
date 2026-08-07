import type { GrowthForm } from "./types";

/** ส่วนที่ใช้เพาะอยู่ใต้ดิน จึงต้องขุดขึ้นมาก่อนถึงจะเห็นจุดตัด
 *  ครอบ ขิง ข่า ขมิ้น กระชาย และกล้วย */
export const rhizomeBud: GrowthForm = {
  id: "rhizome-bud",
  label: "ต้นเดี่ยวมีเหง้าใต้ดิน",
  plainDescription:
    "ส่วนที่โผล่พ้นดินเป็นกอใบหรือลำต้นเทียม ส่วนที่ใช้ขยายพันธุ์จริงคือแง่งหรือหัวที่ทอดขวางอยู่ใต้ดิน ต้องขุดขึ้นมาดูก่อน",
  landmarks: [
    {
      id: "rhizome",
      term: "เหง้า",
      aka: ["rhizome", "แง่ง", "หัว"],
      whatItIs: "ลำต้นที่ทอดขวางอยู่ใต้ดิน ทำหน้าที่สะสมอาหารและแตกต้นใหม่",
      howToFind: "ขุดดินรอบกอออกเบา ๆ จะเจอส่วนอ้วนแข็งทอดขวาง มีข้อปล้องเหมือนลำต้น ไม่ใช่รากฝอย",
      confusedWith: "ไม่ใช่ราก รากเรียวยาวและไม่มีข้อ ส่วนเหง้าอ้วนและมีข้อเป็นปล้อง",
      evidence: { level: "botanical-fact", sourceIds: ["source-botany-plant-morphology"] },
    },
    {
      id: "rhizome-bud",
      term: "ตาเหง้า",
      aka: ["rhizome bud", "ตา", "eye"],
      whatItIs: "ปุ่มนูนบนเหง้าที่จะแตกเป็นหน่อใหม่",
      howToFind: "ล้างดินออกแล้วมองตามผิวเหง้า จะเห็นปุ่มสีอ่อนกว่าเนื้อรอบข้าง บางปุ่มมีเกล็ดบาง ๆ คลุม",
      evidence: { level: "botanical-fact", sourceIds: ["source-botany-plant-morphology"] },
    },
    {
      id: "pseudostem",
      term: "ลำต้นเทียม",
      aka: ["pseudostem", "กาบซ้อน"],
      whatItIs: "ส่วนที่ตั้งขึ้นเหนือดินซึ่งเกิดจากกาบใบซ้อนกันแน่น ไม่ใช่ลำต้นจริง",
      howToFind: "จับส่วนที่ตั้งขึ้นเหนือดินแล้วบีบ จะรู้สึกเป็นชั้น ๆ ลอกออกได้ทีละชั้น",
      confusedWith: "ไม่ใช่เหง้า ลำต้นเทียมอยู่เหนือดินและลอกเป็นชั้นได้ ส่วนเหง้าอยู่ใต้ดินและเนื้อตัน",
      evidence: { level: "botanical-fact", sourceIds: ["source-banana-planting-material-tnau"] },
    },
  ],
  defaultExplant: {
    landmarkId: "rhizome-bud",
    offsetMm: 5,
    direction: "below",
    sizeMm: [10, 20],
    evidence: {
      level: "adapted",
      sourceIds: ["source-ginger-micropropagation-2016", "source-banana-planting-material-tnau"],
      note:
        "ตาเหง้าและยอดอ่อนเป็นชิ้นที่มีรายงานว่าตอบสนองดีในขิง ส่วนกล้วยใช้หน่อดาบและตาบนเหง้า " +
        "ค่าที่ให้เป็นค่าระดับทรงที่รวมสองกลุ่มนี้เข้าด้วยกัน ไม่ใช่ค่าตรงพันธุ์ของพืชใดพืชหนึ่ง",
    },
  },
  beginnerDifficulty: 2,
  whyThisDifficulty:
    "ตาเหง้าเห็นชัดและหาไม่ยากเมื่อล้างดินออกแล้ว แต่เหง้าอยู่ใต้ดินจึงมีเชื้อติดมามากกว่าส่วนที่อยู่เหนือดิน ต้องล้างและฟอกหนักกว่าทรงอื่น",
};
