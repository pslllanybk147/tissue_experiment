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
  mediaRecipeIdsByStep: {
    "prep-media": ["establishment", "establishment-ba", "establishment-bap-iba"],
    multiply: ["multiplication"],
    root: [],
  },
  overrides: {
    sterilize: {
      actions: [
        "กรอกเปอร์เซ็นต์โซเดียมไฮโปคลอไรต์จากฉลากขวดลงเครื่องคำนวณด้านบนของขั้นนี้",
        "ตั้งเป้าคลอรีนออกฤทธิ์ 0.5 ถึง 1.0 เปอร์เซ็นต์ แล้วให้เครื่องคำนวณหาปริมาตรให้",
        "อ่านปริมาตรที่ต้องตวงจากช่อง \"ค่าคำนวณล่าสุด\" ห้ามคำนวณคลอรีนออกฤทธิ์เอง",
        "ดูให้ชัดว่าค่านั้นบอกให้ตวงจากขวดเดิมหรือจากน้ำยาเจือจางที่เพิ่งทำ แล้วตวงจากอันที่ระบุ",
        "ตวงสารฟอกด้วย syringe ไม่ใช่ถ้วยตวงทรงกรวย เพราะขีดช่วงล่างของกรวยถี่จนอ่านคลาดเคลื่อนมาก",
        "หยดน้ำยาล้างจาน 1 ถึง 2 หยดต่อสารฟอก 100 มิลลิลิตร แล้วคนเบา ๆ อย่าให้เป็นฟองมาก",
        "เทสารฟอกที่เจือจางแล้วลงภาชนะ ใส่ชิ้นพืชให้จมทั้งหมด",
        "เริ่มจับเวลาหลังใส่ชิ้นสุดท้ายลงไปแล้วเท่านั้น",
        "เขย่าหรือคนเบา ๆ ตลอดเวลาที่แช่ อย่าปล่อยให้ชิ้นนิ่ง",
        "ทางเลือกทดลอง (ยังไม่เคยทดสอบกับพันธุ์นี้มาก่อนแม้แต่ครั้งเดียว): ใช้น้ำ rinse คลอรีนต่ำแทนน้ำปลอดเชื้อ 3 รอบตามค่าเริ่มต้น",
        "เตรียมน้ำ rinse ให้มีคลอรีนออกฤทธิ์ประมาณ 300 ppm เจือจางจาก[[nadcc|NaDCC]]หรือ NaOCl ก็ได้",
        "ล้างด้วยน้ำ rinse นี้ 3 รอบ รอบละประมาณหนึ่งนาที",
        "แนวคิดคือให้น้ำล้างฆ่าเชื้อที่หลุดจากผิวชิ้นพืชไปด้วย ไม่ใช่แค่ชะสารฟอกออก",
        "ถ้าไม่มั่นใจให้ใช้น้ำปลอดเชื้อธรรมดาตามค่าเริ่มต้นไปก่อน ข้ามทางเลือกทดลองนี้ได้",
        "ถ้าเลือกทางเลือกทดลอง ให้ล้างน้ำปลอดเชื้อธรรมดาอีกหนึ่งรอบสุดท้ายก่อนตัดแต่งและวางลงอาหาร",
        "รอบสุดท้ายนั้นกันคลอรีนตกค้างไม่ให้สัมผัสรอยตัดสด ทำเฉพาะเมื่อเลือกทางเลือกทดลอง",
        "จดเวลาและจำนวนรอบที่ทำจริง ไม่ใช่ที่ตั้งใจจะทำ รวมถึงจดด้วยว่ารอบล้างใช้น้ำปลอดเชื้อธรรมดาหรือน้ำ rinse คลอรีนต่ำ",
      ],
      safetyNotes: [
        "ห้ามผสมสารฟอกกับกรด แอมโมเนีย หรือแอลกอฮอล์ เพราะเกิดแก๊สพิษ",
        "ถ้าจะใช้สารต้านการเกิดสีน้ำตาลต่อ เช่น สารละลาย[[ascorbic-acid|กรดแอสคอร์บิก (วิตามินซี)]] หรือ[[citric-acid|กรดซิตริก]] " +
          "ต้องล้างสารฟอกออกให้หมดก่อน เพราะสารเหล่านั้นเป็นกรดและจะทำปฏิกิริยากับสารฟอกที่ค้างอยู่",
        "ทำในที่อากาศถ่ายเท และสวมแว่นตานิรภัย",
        "ถ้าใช้เม็ดคลอรีน[[nadcc|NaDCC]]เชิงพาณิชย์ (เม็ดฟู่สำหรับทำน้ำดื่มหรือสระว่ายน้ำ) เป็นน้ำ rinse ต้องรู้ว่าเม็ดพวกนี้ " +
          "ไม่ใช่ NaDCC ล้วนแบบ reagent-grade มักผสมสารอื่นเพื่อให้เกิดฟองหรือกันจับตัวเป็นก้อน ยังไม่มีใครทดสอบว่า " +
          "สารเหล่านั้นกระทบเนื้อเยื่อพืชไหม",
      ],
      evidence: {
        level: "adapted",
        sourceIds: ["source-sigma-explant-sterilization", "source-anthurium-review-2010", "source-nadcc-explant-sterilisation"],
        note:
          "ขั้นฟอกหลักยังไม่มีงานตรงพันธุ์ ใช้ค่าตั้งต้นของแกนกลาง (คลอรีนออกฤทธิ์ 0.5 ถึง 1.0 เปอร์เซ็นต์ จากคู่มือมาตรฐาน " +
          "และงานวงศ์ Araceae) ทางเลือกทดลองเรื่องน้ำ rinse คลอรีนต่ำ 300 ppm ยืมตัวเลขจาก Parkinson, Prendergast & " +
          "Sayegh (1996) ที่ใช้ NaDCC 300 ppm นาน 24 ถึง 48 ชั่วโมงฆ่าเชื้อ shoot explant จากภาคสนามโดยตรง ไม่ใช่แค่ " +
          "rinse สั้น ๆ หลังฟอกด้วยสารอื่นแบบที่เสนอที่นี่ และไม่ได้ทำกับ Rhaphidophora หรือ Araceae เลย จึงเป็นการ " +
          "ประยุกต์ของเจ้าของระบบเองทั้งหมด ยังไม่เคยทดลองจริงกับพันธุ์นี้แม้แต่ครั้งเดียว ห้ามยกระดับความมั่นใจของ " +
          "ทางเลือกนี้จนกว่าจะมีผลทดลองจริงมายืนยัน",
      },
    },
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
      id: "establishment-ba",
      title: "ระยะตั้งต้น · MS + BA (ชุดทดลอง)",
      pH: "5.7 ถึง 5.8",
      ingredients: [
        { name: "MS basal salts", amountPerLiter: 1, unit: "×" },
        { name: "Sucrose", amountPerLiter: 30, unit: "g/L" },
        { name: "Agar", amountPerLiter: 7.5, unit: "g/L" },
        { name: "BA", amountPerLiter: 0.5, unit: "mg/L", note: "ใช้น้ำยาแม่; ค่าตั้งต้นสำหรับคัดกรอง ไม่ใช่หลักฐานตรงระยะตั้งต้น" },
      ],
      evidence: {
        level: "adapted",
        sourceIds: ["source-chan-tan-chew-2003"],
        note: "ค่าความเข้มข้นยืมจากงาน Araceae ที่รายงานการเพาะเลี้ยง ไม่ใช่หลักฐานตรงระยะตั้งต้น; ใช้เป็นจุดเริ่มคัดกรองเท่านั้น",
      },
    },
    {
      id: "establishment-bap-iba",
      title: "ระยะตั้งต้น · MS + 6-BA (BAP) + IBA (ชุดทดลอง)",
      pH: "5.7 ถึง 5.8",
      ingredients: [
        { name: "MS basal salts", amountPerLiter: 1, unit: "×" },
        { name: "Sucrose", amountPerLiter: 30, unit: "g/L" },
        { name: "Agar", amountPerLiter: 7.5, unit: "g/L" },
        { name: "6-BA (BAP)", amountPerLiter: 1, unit: "mg/L", note: "ใช้น้ำยาแม่; ค่าตั้งต้นสำหรับคัดกรอง ไม่ใช่หลักฐานตรงระยะตั้งต้น" },
        { name: "IBA", amountPerLiter: 0.5, unit: "mg/L", note: "ใช้น้ำยาแม่; ค่าตั้งต้นสำหรับคัดกรอง ไม่ใช่หลักฐานตรงระยะตั้งต้น" },
      ],
      evidence: {
        level: "adapted",
        sourceIds: ["source-chan-tan-chew-2003"],
        note: "ค่าความเข้มข้นยืมจากงาน Araceae ที่รายงานการเพาะเลี้ยง ไม่ใช่หลักฐานตรงระยะตั้งต้น; ใช้เป็นจุดเริ่มคัดกรองเท่านั้น",
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
    "source-sigma-explant-sterilization",
    "source-anthurium-review-2010",
    "source-nadcc-explant-sterilisation",
  ],
};
