import type { GenusPack } from "./types";

export const musa: GenusPack = {
  id: "musa",
  growthFormId: "rhizome-bud",
  scientificName: "Musa",
  commonNames: ["กล้วย", "banana"],
  deviations: {
    "select-explant": {
      actions: [
        "ใช้หน่อดาบ คือหน่อที่ใบยังแคบเรียวคล้ายดาบ ไม่ใช่หน่อใบกว้าง",
        "ลอกกาบชั้นนอกออกทีละชั้นจนเห็นเนื้อเยื่อเจริญตรงกลาง แล้วจึงตัดชิ้น",
      ],
      evidence: {
        level: "adapted",
        sourceIds: ["source-banana-planting-material-tnau"],
        note:
          "มาจากเอกสารส่งเสริมการเกษตรของ TNAU ซึ่งเป็นหลักการปฏิบัติ ไม่ใช่ผลการทดลองที่ผ่านการทบทวน " +
          "และไม่ระบุพันธุ์กล้วยที่ทดสอบ",
      },
    },
  },
  sourceIds: ["source-banana-planting-material-tnau"],
};
