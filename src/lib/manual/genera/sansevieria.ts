import type { GenusPack } from "./types";

export const sansevieria: GenusPack = {
  id: "sansevieria",
  growthFormId: "thick-leaf-no-stem",
  scientificName: "Sansevieria",
  commonNames: ["ลิ้นมังกร", "หอกพระอินทร์", "snake plant"],
  deviations: {
    multiply: {
      actions: [
        "คาดหวังว่าจะได้แคลลัสก่อน แล้วยอดจึงงอกจากแคลลัสอีกที ไม่ใช่ยอดงอกตรงจากชิ้นใบ",
        "เพราะเป็นเส้นทางผ่านแคลลัส ให้เทียบลายด่างของต้นที่ได้กับต้นแม่ทุกครั้งก่อนขยายต่อ",
      ],
      evidence: {
        level: "adapted",
        sourceIds: ["source-sansevieria-trifasciata-2022", "source-sansevieria-leaf-disc"],
        note:
          "งานกับ Sansevieria trifasciata สองพันธุ์ใช้เส้นทางแคลลัส (indirect organogenesis) " +
          "ส่วนงานกับ S. cylindrica ได้ยอดตรงจากชิ้นใบ สองเส้นทางนี้ต่างกันจริงและยังไม่มีงานเปรียบเทียบโดยตรง " +
          "เส้นทางแคลลัสมีความเสี่ยงกลายพันธุ์สูงกว่า ซึ่งสำคัญมากถ้าคุณเพาะพันธุ์ด่าง",
      },
    },
  },
  sourceIds: ["source-sansevieria-trifasciata-2022", "source-sansevieria-leaf-disc"],
};
