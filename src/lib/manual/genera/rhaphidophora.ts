import type { GenusPack } from "./types";

/** สกุลที่มีหลักฐานเป็นของตัวเองน้อยที่สุดในสามสกุลไม้บกที่ทำรอบนี้ (Monstera, Scindapsus, สกุลนี้)
 *  ค้นหลักฐานเต็มตาม newplant_protocol.md เมื่อ 8 สิงหาคม 2026
 *  บันทึกการค้นทั้ง 11 ช่องทางอยู่ใน docs/superpowers/evidence/2026-08-08-rhaphidophora.md
 *
 *  งานเดียวที่ทำกับสกุลนี้โดยตรง (Lin Dehui 1988, Rhaphidophora decursiva) เข้าถึงได้แค่หัวเรื่อง
 *  ผ่าน FAO AGRIS ดึงตัวเลขมาใช้ไม่ได้เลย ทุกอย่างในไฟล์นี้จึงยืมจากวงศ์ย่อย Monsteroideae
 *  เผ่า Monstereae เดียวกัน (Monstera, Epipremnum) ที่มีอยู่แล้วในระบบ ไม่ใช่แค่วงศ์เดียวกันทั่วไป
 *  ใช้ทรงเดียวกับ Philodendron/Monstera/Epipremnum (เถาเลื้อยเห็นข้อชัด) */
export const rhaphidophora: GenusPack = {
  id: "rhaphidophora",
  growthFormId: "climbing-vine-visible-node",
  scientificName: "Rhaphidophora",
  commonNames: ["มินิมอนสเตอร่า", "กระดาดพัด"],
  deviations: {
    "select-explant": {
      summary: "เลือกข้อที่มีตาข้างจากท่อนเถาที่ยังไม่แก่จัด เหมือนหลักการของ Monstera/Epipremnum",
      // รายละเอียดว่างานชิ้นเดียวของสกุลนี้ (Lin Dehui 1988) เข้าถึงได้แค่หัวเรื่อง
      // อยู่ในหมายเหตุของ evidence ด้านล่างแล้ว ไม่ต้องเล่าซ้ำในช่องเหตุผล
      why:
        "ยังไม่มีงานที่ทำกับ Rhaphidophora tetrasperma โดยตรง จึงยืมหลักการจากวงศ์ย่อยเดียวกัน " +
        "(Monsteroideae เผ่า Monstereae) ซึ่งใกล้ชิดกว่าการยืมแค่ระดับวงศ์ Araceae ทั่วไป",
      evidence: {
        level: "adapted",
        sourceIds: ["source-chan-tan-chew-2003", "source-monstera-fonnesbech-1980"],
        note:
          "งานปี 2003 ทำกับ Araceae สี่ชนิดใช้ตาข้างเป็น explant งานปี 1980 ทำกับ Monstera deliciosa " +
          "ซึ่งอยู่เผ่า Monstereae เดียวกับ Rhaphidophora ทั้งสองแหล่งไม่ได้ทำกับสกุลนี้โดยตรง " +
          "จึงเป็นระดับประยุกต์ที่ยืมมาจากญาติใกล้ชิด ไม่ใช่ตรงพันธุ์",
      },
    },
    sterilize: {
      actions: [
        "ล้างใต้น้ำไหล 15 ถึง 20 นาที",
        "แช่น้ำสบู่อ่อน 1% นาน 10 นาที แล้วล้างออกให้หมด",
        "จุ่มแอลกอฮอล์ 70% นาน 30 วินาที",
        "แช่น้ำยาซักผ้าขาวเชิงพาณิชย์เจือจาง 20% v/v นาน 10 นาที",
        "ล้างด้วยน้ำปลอดเชื้อสามครั้ง",
      ],
      evidence: {
        level: "adapted",
        sourceIds: ["source-epipremnum-organogenesis", "source-epipremnum-syngonium-invitro"],
        note:
          "ยืมเส้นทางฟอกเดียวกับสกุล Epipremnum ทั้งหมด ด้วยเหตุผลความใกล้ชิดในเผ่า Monstereae เดียวกัน " +
          "ยังไม่มีงานของ Rhaphidophora tetrasperma โดยตรงมายืนยันความเข้มข้นหรือเวลาที่เหมาะกับพันธุ์นี้เอง",
      },
    },
    multiply: {
      summary: "เลี้ยงบนอาหาร MS ที่ใส่ 6-BA ร่วมกับ IBA ความเข้มข้นต่ำ",
      why: "งานที่ทำกับ Araceae สี่ชนิดใช้สูตรนี้แล้วเพิ่มจำนวนยอดได้จากตาข้าง",
      actions: ["เตรียมอาหาร MS ใส่ 6-BA 2.0 mg/L และ IBA 0.5 mg/L", "ย้ายชิ้นที่รอดจากขั้นตั้งต้นลงอาหารนี้"],
      evidence: {
        level: "adapted",
        sourceIds: ["source-chan-tan-chew-2003"],
        note:
          "งานปี 2003 ทำกับ Araceae สี่ชนิด ไม่ระบุว่ารวม Rhaphidophora หรือไม่ ใช้เป็นแนวทางระดับวงศ์ " +
          "ยังไม่มีงานที่ทำกับสกุลนี้โดยตรงมายืนยันตัวเลขเดียวกัน",
      },
    },
  },
  sourceIds: [
    "source-chan-tan-chew-2003",
    "source-epipremnum-organogenesis",
    "source-epipremnum-syngonium-invitro",
    "source-monstera-fonnesbech-1980",
    "source-rhaphidophora-decursiva-1988",
  ],
};
