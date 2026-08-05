import type { GenusPack } from "./types";

export const syngonium: GenusPack = {
  id: "syngonium",
  growthFormId: "climbing-vine-visible-node",
  scientificName: "Syngonium",
  commonNames: ["ซิงโกเนียม", "เงินไหลมา", "arrowhead plant"],
  deviations: {
    "select-explant": {
      actions: [
        "เลือกยอดข้างที่เพิ่งแตกใหม่ ไม่ใช่ข้อแก่ตามลำต้นเดิม",
        "ยอดข้างของสกุลนี้เป็นชิ้นที่มีรายงานว่าให้จำนวนยอดมากที่สุด",
      ],
      evidence: {
        level: "adapted",
        sourceIds: ["source-epipremnum-syngonium-invitro"],
        note:
          "งานที่อ้างทำกับ Syngonium podophyllum ชนิดเดียว ไม่ใช่ทั้งสกุล " +
          "รายงานว่าใช้ยอดข้างเป็นชิ้นตั้งต้นและได้ยอดเฉลี่ย 17.33 ยอดต่อชิ้น",
      },
    },
  },
  sourceIds: ["source-epipremnum-syngonium-invitro"],
};
