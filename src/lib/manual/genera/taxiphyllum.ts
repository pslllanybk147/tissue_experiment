import type { GenusPack } from "./types";

/** Java moss การค้าเกือบทั้งหมดขายภายใต้ Taxiphyllum barbieri แต่บันทึกพฤกษศาสตร์ทางการมีแค่จากเวียดนาม
 *  ขณะที่ "Java moss" บอกเป็นนัยว่ามาจากอินโดนีเซีย น่าจะเป็น species complex ที่ขายภายใต้ชื่อเดียว
 *  ไม่มีงานตรงพันธุ์ของสกุลนี้ที่เข้าถึงเนื้อหาได้เลย งานเดียวที่พบ (Anglana et al. 2024) ครอบคลุมชนิดนี้
 *  แต่ ScienceDirect ปิดกั้นเนื้อหาเต็ม อ่านได้แค่ว่าเกี่ยวข้อง ดึงตัวเลขจริงมาใช้ไม่ได้ ทุกอย่างในไฟล์นี้
 *  จึงยืมจากสกุล Vesicularia ในทรงเดียวกัน (วงศ์ Hypnaceae เหมือนกัน) ไม่ใช่งานตรงสกุลนี้เอง */
export const taxiphyllum: GenusPack = {
  id: "taxiphyllum",
  growthFormId: "fragment-mat-no-node",
  scientificName: "Taxiphyllum",
  commonNames: ["มอสจาวา", "มอสตู้ปลา"],
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
          "Taxiphyllum barbieri Java moss tissue culture sterilization protocol",
          "Java moss aquarium gametophyte fragment axenic culture",
        ],
        note:
          "ไม่พบงานที่เข้าถึงเนื้อหาได้เลยสำหรับสกุลนี้โดยเฉพาะ งานเดียวที่ครอบคลุมชนิดนี้ (Anglana et al. 2024) " +
          "ถูก ScienceDirect ปิดกั้นเนื้อหาเต็ม ผู้ใช้ต้องยืมค่าเริ่มต้นจากสกุล Vesicularia ในทรงเดียวกันไปก่อน " +
          "แล้วบันทึกผลจริงเพื่อปรับรอบถัดไป",
      },
    },
  },
  sourceIds: ["source-aquatic-moss-axenic-2024", "source-botany-moss-morphology"],
};
