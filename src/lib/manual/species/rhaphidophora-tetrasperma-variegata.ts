import type { PlantPack } from "../types";
import { standardSequence } from "./pink-princess";

/** พันธุ์ที่สองของสกุล Rhaphidophora ในระบบ ค้นหลักฐานเต็มตาม newplant_protocol.md เมื่อ 8 สิงหาคม 2026
 *  บันทึกการค้นทั้ง 11 ช่องทางอยู่ใน docs/superpowers/evidence/2026-08-08-rhaphidophora.md
 *
 *  แผ่นเสริมที่บางที่สุดในสามต้นบกของรอบนี้ ไม่มีขั้นใดถึง species-direct เลย
 *  แม้แต่ระดับสกุลก็แทบไม่มีหลักฐานเป็นของตัวเอง (ดู genera/rhaphidophora.ts) ขั้นออกราก
 *  ไม่พบหลักฐานจากที่ไหนเลยแม้แต่ระดับวงศ์ย่อย จึงต้องเขียน override เป็น unsupported ตรง ๆ
 *  ที่นี่ ไม่งั้นค่า unsupported ดิบจากแกนกลางจะไม่มี searchedAt กำกับและเทสต์จะจับได้
 *
 *  ด่างของพันธุ์นี้เป็น chimera จริง (ต่างจาก Scindapsus pictus ที่ลายเงินเป็นโครงสร้างเสถียร)
 *  จึงติด traitIds: ["variegated"] ดูเหตุผลเต็มในบันทึกการค้นหลักฐาน
 *
 *  ระหว่างค้นเจอเนื้อหาปลอมที่ดูเหมือนสร้างด้วย AI (ตัวเลขเปอร์เซ็นต์แม่นยำผิดปกติไม่มีแหล่งอ้างอิง)
 *  ปฏิเสธทิ้งไปแล้ว ไม่มีร่องรอยเหลืออยู่ในไฟล์นี้ */
export const rhaphidophoraTetraspermaVariegataPack: PlantPack = {
  slug: "rhaphidophora-tetrasperma-variegata",
  scientificName: "Rhaphidophora tetrasperma Hook.f. ‘Variegata’",
  commonName: "มินิมอนสเตอร่าด่าง",
  method: "nodal",
  summary: "มินิมอนสเตอร่าด่าง chimera ยังไม่มีงานวิจัยของสกุลหรือพันธุ์นี้โดยตรง ใช้ค่าประยุกต์จากวงศ์ย่อยเดียวกัน",
  durationLabel: "5 ถึง 10 เดือน",
  growthFormId: "climbing-vine-visible-node",
  genusId: "rhaphidophora",
  traitIds: ["variegated"],
  sequence: [...standardSequence],
  overrides: {
    root: {
      evidence: {
        level: "unsupported",
        sourceIds: [],
        searchedAt: "2026-08-08",
        searchQueries: [
          "Rhaphidophora tetrasperma rooting medium auxin IBA NAA in vitro",
          "Rhaphidophora OR Monstereae Araceae rooting micropropagation concentration",
        ],
        note:
          "ไม่พบสูตรออกรากจากที่ไหนเลย ทั้งงานของสกุลนี้เอง (Lin Dehui 1988 อ่านเนื้อหาไม่ได้) " +
          "วงศ์ย่อย Monstereae เดียวกัน หรือสิทธิบัตร ผู้ใช้ต้องทดสอบเองและบันทึกผลจริง",
      },
    },
  },
  mediaRecipes: [
    {
      id: "establishment",
      title: "ระยะตั้งต้น",
      pH: "5.7 ถึง 5.8",
      ingredients: [
        { name: "MS basal salts", amountPerLiter: 1, unit: "×" },
        { name: "Sucrose", amountPerLiter: 30, unit: "g/L" },
        { name: "Agar", amountPerLiter: 7.5, unit: "g/L" },
      ],
      evidence: {
        level: "unsupported",
        sourceIds: [],
        searchedAt: "2026-08-08",
        searchQueries: [
          "Rhaphidophora tetrasperma establishment medium MS sucrose agar concentration",
          "Rhaphidophora tetrasperma micropropagation in vitro protocol nodal explant",
        ],
        note: "อาหารพื้นฐานที่ยังไม่ใส่ฮอร์โมน ไม่มีงานใดของสกุลนี้ระบุองค์ประกอบระยะตั้งต้นแยกจากระยะเพิ่มจำนวน",
      },
    },
    {
      id: "multiplication",
      title: "ระยะเพิ่มจำนวน",
      pH: "5.7 ถึง 5.8",
      ingredients: [
        { name: "MS basal salts", amountPerLiter: 1, unit: "×" },
        { name: "Sucrose", amountPerLiter: 30, unit: "g/L" },
        { name: "Agar", amountPerLiter: 7.5, unit: "g/L" },
        { name: "6-BA (BAP)", amountPerLiter: 2.0, unit: "mg/L" },
        { name: "IBA", amountPerLiter: 0.5, unit: "mg/L" },
      ],
      evidence: {
        level: "adapted",
        sourceIds: ["source-chan-tan-chew-2003"],
        note:
          "องค์ประกอบมาจากงานปี 2003 ที่ทำกับ Araceae สี่ชนิด ไม่ระบุว่ารวมสกุลนี้หรือไม่ " +
          "ยืมมาที่ระดับวงศ์เพราะไม่มีงานที่ใกล้ชิดกว่านี้ ผู้ใช้ควรทดสอบช่วงก่อนเชื่อว่าได้ผลแน่นอน",
      },
    },
  ],
  sourceIds: [
    "source-chan-tan-chew-2003",
    "source-epipremnum-organogenesis",
    "source-epipremnum-syngonium-invitro",
    "source-monstera-fonnesbech-1980",
    "source-rhaphidophora-decursiva-1988",
  ],
};
