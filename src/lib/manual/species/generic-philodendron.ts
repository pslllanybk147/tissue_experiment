import type { PlantPack } from "../types";
import { standardSequence } from "./pink-princess";

export const genericPhilodendronPack: PlantPack = {
  slug: "generic-philodendron",
  scientificName: "Philodendron sp.",
  commonName: "ฟิโลเดนดรอนที่ยังไม่ยืนยันชนิด",
  method: "nodal",
  summary: "เส้นทางกลางสำหรับต้นที่ยังระบุชนิดไม่ได้",
  durationLabel: "4 ถึง 8 เดือน",
  growthFormId: "climbing-vine-visible-node",
  genusId: "philodendron",
  sequence: [...standardSequence],
  mediaRecipeIdsByStep: {
    "prep-media": ["establishment", "establishment-ba", "establishment-bap-iba"],
    multiply: [],
    root: [],
  },
  overrides: {
    identify: {
      summary: "ยืนยันเท่าที่ยืนยันได้ แล้วบันทึกว่ายังไม่ทราบชนิด",
      evidence: { level: "adapted", sourceIds: ["source-kew-wcvp-v15"], note: "ใช้เส้นทางกลางเมื่อยังระบุชนิดไม่ได้" },
    },
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
        "ทางเลือกทดลอง (ยังไม่เคยทดสอบเลยแม้แต่ครั้งเดียว): ใช้น้ำ rinse คลอรีนต่ำแทนน้ำปลอดเชื้อ 3 รอบตามค่าเริ่มต้น",
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
        "ทำในที่อากาศถ่ายเท และสวมแว่นตานิรภัย",
        "ถ้าใช้เม็ดคลอรีน[[nadcc|NaDCC]]เชิงพาณิชย์ (เม็ดฟู่สำหรับทำน้ำดื่มหรือสระว่ายน้ำ) เป็นน้ำ rinse ต้องรู้ว่าเม็ดพวกนี้ " +
          "ไม่ใช่ NaDCC ล้วนแบบ reagent-grade มักผสมสารอื่นเพื่อให้เกิดฟองหรือกันจับตัวเป็นก้อน ยังไม่มีใครทดสอบว่า " +
          "สารเหล่านั้นกระทบเนื้อเยื่อพืชไหม",
      ],
      evidence: {
        level: "unsupported",
        sourceIds: ["source-nadcc-explant-sterilisation"],
        searchedAt: "2026-08-02",
        searchQueries: ["Philodendron micropropagation nodal explant surface sterilization", "Araceae explant sterilization sodium hypochlorite concentration", "การเพาะเลี้ยงเนื้อเยื่อ ฟิโลเดนดรอน ฟอกฆ่าเชื้อ"],
        note:
          "ยังไม่ทราบชนิด จึงไม่มีงานตรงพันธุ์ให้อ้างอิง ทางเลือกทดลองเรื่องน้ำ rinse คลอรีนต่ำ 300 ppm ยืมตัวเลขจาก " +
          "Parkinson, Prendergast & Sayegh (1996) ที่ใช้ NaDCC 300 ppm นาน 24 ถึง 48 ชั่วโมงฆ่าเชื้อ shoot explant " +
          "จากภาคสนามโดยตรง ไม่ใช่แค่ rinse สั้น ๆ หลังฟอกด้วยสารอื่นแบบที่เสนอที่นี่ เป็นการประยุกต์ของเจ้าของระบบเอง " +
          "ทั้งหมด ห้ามยกระดับความมั่นใจของทางเลือกนี้จนกว่าจะมีผลทดลองจริงมายืนยัน",
      },
    },
    multiply: {
      evidence: { level: "unsupported", sourceIds: [], searchedAt: "2026-08-02", searchQueries: ["Philodendron micropropagation nodal explant surface sterilization", "Araceae explant sterilization sodium hypochlorite concentration", "การเพาะเลี้ยงเนื้อเยื่อ ฟิโลเดนดรอน ฟอกฆ่าเชื้อ"], note: "ยังไม่ทราบชนิด ให้เริ่มจากค่าต่ำแล้วเพิ่มทีละขั้น" },
    },
    root: {
      evidence: { level: "unsupported", sourceIds: [], searchedAt: "2026-08-02", searchQueries: ["Philodendron micropropagation nodal explant surface sterilization", "Araceae explant sterilization sodium hypochlorite concentration", "การเพาะเลี้ยงเนื้อเยื่อ ฟิโลเดนดรอน ฟอกฆ่าเชื้อ"], note: "ยังไม่ทราบชนิด" },
    },
    acclimatize: {
      evidence: { level: "adapted", sourceIds: ["source-kew-philodendron"], note: "ใช้หลักการปรับสภาพทั่วไปของสกุล" },
    },
    monitor: {
      evidence: { level: "adapted", sourceIds: ["source-kew-philodendron"] },
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
      evidence: { level: "unsupported", sourceIds: [], searchedAt: "2026-08-02", searchQueries: ["Philodendron micropropagation nodal explant surface sterilization", "Araceae explant sterilization sodium hypochlorite concentration", "การเพาะเลี้ยงเนื้อเยื่อ ฟิโลเดนดรอน ฟอกฆ่าเชื้อ"], note: "อาหารพื้นฐานที่ยังไม่ใส่ฮอร์โมน" },
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
        sourceIds: ["source-selfheading-philodendron-2012"],
        note: "ค่าความเข้มข้นยืมจากงาน Philodendron กลุ่มใกล้เคียงที่รายงานการเพิ่มยอด ไม่ใช่หลักฐานตรงระยะตั้งต้น; ใช้เป็นจุดเริ่มคัดกรองเท่านั้น",
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
        sourceIds: ["source-selfheading-philodendron-2012"],
        note: "ค่าความเข้มข้นยืมจากงาน Philodendron กลุ่มใกล้เคียงที่รายงานการเพิ่มยอด ไม่ใช่หลักฐานตรงระยะตั้งต้น; ใช้เป็นจุดเริ่มคัดกรองเท่านั้น",
      },
    },
  ],
  sourceIds: ["source-kew-philodendron", "source-kew-wcvp-v15", "source-nadcc-explant-sterilisation", "source-selfheading-philodendron-2012"],
};
