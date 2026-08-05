import type { GenusPack } from "./types";

/** สกุลแรก ตั้งไว้เป็นโครงให้ชนิดที่มีอยู่แล้วสามชุดผูกขึ้นมาได้
 *  ยังไม่ใส่ค่าเชิงปริมาณ เพราะการค้นหลักฐานเต็มเป็นงานเฟส 2 */
export const philodendron: GenusPack = {
  id: "philodendron",
  growthFormId: "climbing-vine-visible-node",
  scientificName: "Philodendron",
  commonNames: ["ฟิโลเดนดรอน", "ฟิโล"],
  deviations: {},
  sourceIds: ["source-ruaysap-chemical-sterilization"],
};
