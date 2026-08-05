import type { GenusPack } from "./types";

/** สกุลที่มีงานวิจัยเยอะ แต่เกือบทุกงานใช้เมอร์คิวริกคลอไรด์ซึ่งใช้ที่บ้านไม่ได้
 *  เป็นตัวอย่างชัดว่ามีหลักฐานไม่ได้แปลว่าทำตามได้ */
export const anthurium: GenusPack = {
  id: "anthurium",
  growthFormId: "rosette-sheathed-node",
  scientificName: "Anthurium",
  commonNames: ["หน้าวัว", "แอนทูเรียม"],
  deviations: {
    "select-explant": {
      actions: [
        "เลือกใบที่อ่อนที่สุดและใหม่ที่สุดของต้น พร้อมก้านใบของใบนั้น",
        "ห้ามใช้ใบแก่ เพราะงานที่รายงานผลดีใช้ใบอ่อนทั้งหมด",
      ],
      evidence: {
        level: "adapted",
        sourceIds: ["source-anthurium-lamina-petiole", "source-anthurium-review-2010"],
        note:
          "งานที่อ้างทำกับ Anthurium andraeanum เป็นหลัก ไม่ใช่ทุกชนิดในสกุล " +
          "ใช้ชิ้นแผ่นใบและก้านใบจากใบอ่อนของต้นโตเต็มวัย",
      },
    },
    sterilize: {
      safetyNotes: [
        "งานวิจัยของสกุลนี้เกือบทั้งหมดได้ผลดีที่สุดด้วยเมอร์คิวริกคลอไรด์ 0.1 ถึง 0.3% " +
          "ซึ่งเป็นสารปรอท มีพิษสะสม ดูดซึมผ่านผิวหนังได้ และกำจัดทิ้งตามบ้านไม่ได้ " +
          "ห้ามใช้ที่บ้านเด็ดขาด แม้จะเห็นตัวเลขในเปเปอร์ก็ตาม",
        "ทุกชนิดในวงศ์ Araceae มีผลึกแคลเซียมออกซาเลตรูปเข็มที่ระคายเคืองผิวและเยื่อบุ ต้องใส่ถุงมือและแว่นตา",
      ],
      evidence: {
        level: "unsupported",
        sourceIds: [],
        searchedAt: "2026-08-05",
        searchQueries: [
          "Anthurium surface sterilization sodium hypochlorite without mercuric chloride",
          "Anthurium andraeanum explant disinfection NaOCl protocol contamination",
        ],
        note:
          "ตัวเลขที่มีหลักฐานดีที่สุดของสกุลนี้ใช้เมอร์คิวริกคลอไรด์ ซึ่งเราไม่แนะนำให้ใช้ที่บ้าน " +
          "และยังไม่พบงานที่ให้ตัวเลขของเส้นทางน้ำยาซักผ้าขาวล้วนสำหรับสกุลนี้โดยเฉพาะ " +
          "จึงถือว่าขั้นนี้ยังไม่มีงานรองรับสำหรับวิธีที่ทำตามได้จริงที่บ้าน ให้ใช้ช่วงของทรงแล้วทดสอบช่วงก่อน",
      },
    },
  },
  sourceIds: ["source-anthurium-lamina-petiole", "source-anthurium-sterilization-jewel", "source-anthurium-review-2010"],
};
