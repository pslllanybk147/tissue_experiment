import type { GenusPack } from "./types";

/** สกุลมอสตู้ปลาสกุลแรกในระบบ ใช้ทรงใหม่ fragment-mat-no-node เพราะมอสไม่มีข้อหรือลำต้นจริง
 *  มีงานตรงพันธุ์จริงหนึ่งชิ้น (Hu et al. 2023) ที่ทำกับ Vesicularia montagnei (Christmas moss)
 *  แต่ฟอกกลุ่มอับสปอร์ ไม่ใช่ชิ้นส่วนต้นแบบที่ใช้ขยายพันธุ์เชิงพืชทั่วไป ต้องระวังไม่ยกระดับความมั่นใจ
 *  เกินตัวตอนใช้ตัวเลขนี้กับการตัดชิ้น gametophyte จริง */
export const vesicularia: GenusPack = {
  id: "vesicularia",
  growthFormId: "fragment-mat-no-node",
  scientificName: "Vesicularia",
  commonNames: ["มอสคริสต์มาส", "มอสตู้ปลา"],
  deviations: {
    "select-explant": {
      title: "ตัดชิ้นเล็กจากยอดสีเขียวสด",
      summary: "ตัดชิ้นกอมอสขนาดเล็กมากจากส่วนที่ยังเขียวสดที่สุดของกอ ไม่ต้องเล็งตำแหน่งเฉพาะ",
      why: "มอสไม่มีข้อหรือเนื้อเยื่อเจริญเฉพาะจุด ทุกจุดของกอที่ยังเขียวสดมีศักยภาพแตกยอดใหม่เท่ากัน",
      actions: [
        "เลือกส่วนที่เขียวสดที่สุดของกอ หลีกเลี่ยงโคนกอที่จมอยู่ใต้กอนานและเริ่มมีสีคล้ำ",
        "ตัดเป็นชิ้นเล็กขนาดประมาณ 2 ถึง 3 มิลลิเมตร ด้วยกรรไกรปลายแหลมที่ผ่านการฆ่าเชื้อ",
        "หย่อนชิ้นที่ตัดแล้วลงน้ำสะอาดทันที อย่าปล่อยให้แห้ง",
      ],
      passCriteria: ["ได้ชิ้นกอที่ยังเขียวสดหลายชิ้น"],
      stopConditions: ["กอทั้งหมดมีแต่ส่วนที่คล้ำหรือมีตะไคร่เกาะหนา"],
      safetyNotes: [],
      evidence: { level: "botanical-fact", sourceIds: ["source-botany-moss-morphology"] },
    },
    sterilize: {
      evidence: {
        level: "unsupported",
        sourceIds: [],
        searchedAt: "2026-08-08",
        searchQueries: [
          "aquarium moss gametophyte fragment surface sterilization protocol",
          "Vesicularia Taxiphyllum vegetative fragment tissue culture sterilization",
        ],
        note:
          "ไม่พบงานที่ฟอกชิ้น gametophyte (ส่วนที่ใช้ตัดขยายพันธุ์จริง) โดยตรง งานตรงพันธุ์ที่มี (Hu et al. 2023) " +
          "ฟอกกลุ่มอับสปอร์ซึ่งเป็นโครงสร้างคนละแบบ นำมาใช้ตรง ๆ กับชิ้นกอไม่ได้ ผู้ใช้ต้องเริ่มจากค่าฟอกที่เจือจาง " +
          "กว่าค่าเริ่มต้นของแกนกลางมากเพราะชิ้นเล็กและบอบบางกว่าไม้ใบทั่วไปมาก แล้วบันทึกผลจริงเพื่อปรับรอบถัดไป",
      },
    },
  },
  sourceIds: ["source-vesicularia-montagnei-2023", "source-botany-moss-morphology"],
};
