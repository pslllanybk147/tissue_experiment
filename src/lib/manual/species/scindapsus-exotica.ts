import type { PlantPack } from "../types";
import { standardSequence } from "./pink-princess";

/** พันธุ์แรกของสกุล Scindapsus ในระบบ ค้นหลักฐานเต็มตาม newplant_protocol.md เมื่อ 7 สิงหาคม 2026
 *  บันทึกการค้นทั้ง 11 ช่องทางอยู่ใน docs/superpowers/evidence/2026-08-07-scindapsus.md
 *
 *  ไม่มีงานตรงพันธุ์ 'Exotica' เลยสักชิ้น ต่างจาก Thai Constellation แผ่นนี้จึงบางกว่ามาก
 *  เกือบทุกอย่างพึ่งค่าระดับ `adapted` จากชั้นสกุล (genera/scindapsus.ts) ไม่มี override เพิ่ม
 *
 *  ลายด่างสีเงินของพันธุ์นี้ไม่ใช่ chimera จึงไม่ติด traitIds: ["variegated"]
 *  ดูเหตุผลเต็มในบันทึกการค้นหลักฐาน */
export const scindapsusExoticaPack: PlantPack = {
  slug: "scindapsus-exotica",
  scientificName: "Scindapsus pictus Hassk. ‘Exotica’",
  commonName: "พลูเงิน เอ็กโซติกา",
  method: "nodal",
  summary: "พลูเงินด่างเงินธรรมชาติ ยังไม่มีงานวิจัยตรงพันธุ์ ใช้ค่าประยุกต์จากสกุลเดียวกัน",
  durationLabel: "4 ถึง 8 เดือน",
  growthFormId: "climbing-vine-visible-node",
  genusId: "scindapsus",
  sequence: [...standardSequence],
  overrides: {
    sterilize: {
      actions: [
        "อ่านฉลากว่าน้ำยามีโซเดียมไฮโปคลอไรต์กี่เปอร์เซ็นต์ แล้วคำนวณให้ได้คลอรีนออกฤทธิ์ 0.5 ถึง 1.0 เปอร์เซ็นต์",
        "ตวงสารฟอกด้วย syringe ไม่ใช่ถ้วยตวงทรงกรวย เพราะช่วงล่างของกรวยแคบและขีดถี่จนอ่านคลาดเคลื่อนได้หลายสิบเปอร์เซ็นต์",
        "หยดน้ำยาล้างจาน 1 ถึง 2 หยดต่อสารฟอก 100 มิลลิลิตร แล้วคนเบา ๆ อย่าให้เป็นฟองมาก",
        "เทสารฟอกที่เจือจางแล้วลงภาชนะ ใส่ชิ้นพืชให้จมทั้งหมด",
        "เริ่มจับเวลาหลังใส่ชิ้นสุดท้ายลงไปแล้วเท่านั้น",
        "เขย่าหรือคนเบา ๆ ตลอดเวลาที่แช่ อย่าปล่อยให้ชิ้นนิ่ง",
        "ทางเลือกทดลอง (ยังไม่เคยทดสอบกับพันธุ์นี้มาก่อนแม้แต่ครั้งเดียว): แทนที่จะล้างด้วยน้ำปลอดเชื้อเฉย ๆ " +
          "3 รอบตามค่าเริ่มต้น จะเตรียมน้ำ rinse ที่มีคลอรีนออกฤทธิ์ต่ำ ๆ ประมาณ 300 ppm แยกต่างหาก " +
          "(เจือจาก NaDCC หรือ NaOCl เจือจางมาก ๆ ก็ได้) แล้วล้างด้วยน้ำนี้แทน 3 รอบ รอบละประมาณหนึ่งนาทีก็ได้ " +
          "แนวคิดคือให้น้ำล้างมีฤทธิ์ฆ่าเชื้อที่หลุดออกมาจากผิวชิ้นพืชไปด้วย ไม่ใช่แค่ชะสารฟอกออก ถ้าไม่มั่นใจให้ใช้ " +
          "น้ำปลอดเชื้อธรรมดาตามค่าเริ่มต้นไปก่อน",
        "ถ้าเลือกทางเลือกทดลอง ให้ล้างด้วยน้ำปลอดเชื้อธรรมดาอีกหนึ่งรอบสุดท้ายก่อนตัดแต่งและวางลงอาหาร " +
          "เพื่อไม่ให้มีคลอรีนตกค้างสัมผัสรอยตัดสด",
        "จดเวลาและจำนวนรอบที่ทำจริง ไม่ใช่ที่ตั้งใจจะทำ รวมถึงจดด้วยว่ารอบล้างใช้น้ำปลอดเชื้อธรรมดาหรือน้ำ rinse คลอรีนต่ำ",
      ],
      safetyNotes: [
        "ห้ามผสมสารฟอกกับกรด แอมโมเนีย หรือแอลกอฮอล์ เพราะเกิดแก๊สพิษ",
        "ถ้าจะใช้สารต้านการเกิดสีน้ำตาลต่อ เช่น สารละลายกรดแอสคอร์บิก (วิตามินซี) หรือกรดซิตริก " +
          "ต้องล้างสารฟอกออกให้หมดก่อน เพราะสารเหล่านั้นเป็นกรดและจะทำปฏิกิริยากับสารฟอกที่ค้างอยู่",
        "ทำในที่อากาศถ่ายเท และสวมแว่นตานิรภัย",
        "ถ้าใช้เม็ดคลอรีน NaDCC เชิงพาณิชย์ (เม็ดฟู่สำหรับทำน้ำดื่มหรือสระว่ายน้ำ) เป็นน้ำ rinse ต้องรู้ว่าเม็ดพวกนี้ " +
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
          "rinse สั้น ๆ หลังฟอกด้วยสารอื่นแบบที่เสนอที่นี่ และไม่ได้ทำกับ Scindapsus หรือ Araceae เลย จึงเป็นการประยุกต์ " +
          "ของเจ้าของระบบเองทั้งหมด ยังไม่เคยทดลองจริงกับพันธุ์นี้แม้แต่ครั้งเดียว ห้ามยกระดับความมั่นใจของทางเลือกนี้ " +
          "จนกว่าจะมีผลทดลองจริงมายืนยัน",
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
        searchedAt: "2026-08-07",
        searchQueries: [
          "Scindapsus pictus establishment medium MS sucrose agar concentration",
          "Scindapsus pictus micropropagation in vitro protocol nodal explant",
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
        { name: "myo-Inositol", amountPerLiter: 100, unit: "mg/L" },
        { name: "Thiamine HCl", amountPerLiter: 0.4, unit: "mg/L" },
      ],
      evidence: {
        level: "adapted",
        sourceIds: ["source-miller-murashige-1976"],
        note:
          "องค์ประกอบมาจากงานปี 1976 ที่ทำกับ Scindapsus aureus สกุลเดียวกัน ไม่ใช่ pictus โดยตรง " +
          "เข้าถึงได้แค่บทคัดย่อ/สรุปทุติยภูมิ ยังตรวจไม่ได้ว่าใช้ n เท่าไรต่อทรีตเมนต์และมีกลุ่มควบคุมหรือไม่ " +
          "จึงเป็นระดับประยุกต์ที่มีข้อจำกัดด้านความเข้มงวดทางสถิติกำกับไว้",
      },
    },
  ],
  sourceIds: [
    "source-powo-scindapsus-pictus",
    "source-miller-murashige-1976",
    "source-epipremnum-organogenesis",
    "source-epipremnum-syngonium-invitro",
    "source-scindapsus-aureus-rooting-patent-cn",
    "source-sigma-explant-sterilization",
    "source-anthurium-review-2010",
    "source-nadcc-explant-sterilisation",
  ],
};
