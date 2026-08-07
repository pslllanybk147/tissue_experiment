import type { GrowthForm } from "./types";

/** ใบบางที่เกิดตาใหม่ได้ตรงรอยตัดของเส้นใบ ต่างจากทรงใบหนาที่ต้องใช้ช่วงโคน
 *  ครอบ Begonia และไม้ใบบางที่ขยายด้วยการปักใบได้ */
export const leafVeinBud: GrowthForm = {
  id: "leaf-vein-bud",
  label: "ไม้ใบบาง แตกตาที่เส้นใบ",
  plainDescription:
    "ใบบางนุ่ม มีเส้นใบนูนเห็นชัดที่หลังใบ เป็นกลุ่มที่ปักใบลงดินแล้วแตกต้นใหม่ได้ตรงรอยตัดของเส้นใบ",
  landmarks: [
    {
      id: "midrib",
      term: "เส้นกลางใบ",
      aka: ["midrib", "เส้นแกนกลาง"],
      whatItIs: "เส้นหนาที่สุดที่พาดกลางใบจากโคนไปปลาย",
      howToFind: "พลิกดูหลังใบ เส้นที่นูนที่สุดและวิ่งจากโคนตรงไปปลายคือเส้นกลางใบ",
      evidence: { level: "botanical-fact", sourceIds: ["source-botany-leaf-anatomy"] },
    },
    {
      id: "lateral-vein",
      term: "เส้นแขนงใบ",
      aka: ["lateral vein", "เส้นใบย่อย"],
      whatItIs: "เส้นที่แตกออกจากเส้นกลางใบไปทางขอบใบ",
      howToFind: "จากเส้นกลางใบ มองหาเส้นที่แยกออกไปทั้งสองข้าง จุดที่เส้นแขนงแยกออกคือจุดที่มักเกิดตาใหม่",
      confusedWith: "ไม่ใช่เส้นกลางใบ เส้นแขนงบางกว่าและมีหลายเส้น ส่วนเส้นกลางใบมีเส้นเดียว",
      evidence: { level: "botanical-fact", sourceIds: ["source-botany-leaf-anatomy"] },
    },
    {
      id: "leaf-petiole-junction",
      term: "รอยต่อก้านใบกับแผ่นใบ",
      aka: ["blade base"],
      whatItIs: "จุดที่ก้านใบสิ้นสุดและแผ่นใบเริ่มแผ่ออก",
      howToFind: "ไล่จากก้านใบขึ้นไป จุดแรกที่เนื้อใบเริ่มกว้างออกคือรอยต่อนี้",
      evidence: { level: "botanical-fact", sourceIds: ["source-botany-leaf-anatomy"] },
    },
  ],
  defaultExplant: {
    landmarkId: "lateral-vein",
    offsetMm: 5,
    direction: "above",
    sizeMm: [8, 12],
    evidence: {
      level: "adapted",
      sourceIds: ["source-begonia-adventitious-1998"],
      note:
        "งานที่อ้างใช้ชิ้นแผ่นใบและชิ้นก้านใบของ Begonia ลูกผสมกลุ่มหัว ไม่ได้ระบุระยะห่างจากเส้นแขนงเป็นมิลลิเมตร " +
        "ระยะที่ให้เป็นค่าตั้งต้นระดับทรงเพื่อให้ชิ้นมีเส้นใบติดมาด้วย ต้องปรับตามผลจริง",
    },
  },
  beginnerDifficulty: 2,
  whyThisDifficulty:
    "ตัดง่ายและได้ชิ้นเยอะจากใบเดียว แต่ใบบางฟอกแรงไม่ได้ ต้องลดความเข้มข้นลงจากทรงอื่น และชิ้นต้องมีเส้นใบติดมาด้วย ไม่งั้นจะไม่แตกตา",
};
