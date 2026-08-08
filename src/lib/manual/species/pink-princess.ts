import type { PlantPack } from "../types";

/** ทำอาหารต้องมาก่อนตัด ไม่ใช่หลังตัด
 *
 *  ลำดับเดิมให้ตัดก่อนแล้วค่อยทำอาหาร ซึ่งบังคับให้ชิ้นพืชรออย่างน้อยหนึ่งชั่วโมง
 *  ตามเวลาของขั้นทำอาหาร และจริง ๆ นานกว่านั้นมากเพราะยังต้องนึ่งและรอวุ้นเย็นและเซ็ตตัว
 *  ช่วงรอนั้นคือช่วงที่ฟีนอลิกทำงาน ซึ่งขัดกับคลังอาการของระบบเองที่เขียนไว้ว่า
 *  "ตัดแล้วใส่ลงสารละลายทันที" ดู troubleshooting.ts รายการ browning-phenolic */
const fullSequence = [
  "receive",
  "quarantine",
  "identify",
  "prep-media",
  "prep-tools",
  "select-explant",
  "cut",
  "sterilize",
  "initiate",
  "check-contamination",
  "multiply",
  "root",
  "acclimatize",
  "monitor",
  "close-round",
];

export const pinkPrincessPack: PlantPack = {
  slug: "pink-princess",
  scientificName: "Philodendron erubescens ‘Pink Princess’",
  commonName: "ฟิโลเดนดรอน พิงค์ปริ๊นเซส",
  method: "nodal",
  summary: "ขยายจากตาข้าง เน้นการรักษาลายด่างชมพูให้คงอยู่",
  durationLabel: "4 ถึง 8 เดือน",
  growthFormId: "climbing-vine-visible-node",
  genusId: "philodendron",
  traitIds: ["variegated"],
  sequence: fullSequence,
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
          "(เจือจาก[[nadcc|NaDCC]]หรือ NaOCl เจือจางมาก ๆ ก็ได้) แล้วล้างด้วยน้ำนี้แทน 3 รอบ รอบละประมาณหนึ่งนาทีก็ได้ " +
          "แนวคิดคือให้น้ำล้างมีฤทธิ์ฆ่าเชื้อที่หลุดออกมาจากผิวชิ้นพืชไปด้วย ไม่ใช่แค่ชะสารฟอกออก ถ้าไม่มั่นใจให้ใช้ " +
          "น้ำปลอดเชื้อธรรมดาตามค่าเริ่มต้นไปก่อน",
        "ถ้าเลือกทางเลือกทดลอง ให้ล้างด้วยน้ำปลอดเชื้อธรรมดาอีกหนึ่งรอบสุดท้ายก่อนตัดแต่งและวางลงอาหาร " +
          "เพื่อไม่ให้มีคลอรีนตกค้างสัมผัสรอยตัดสด",
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
        level: "unsupported",
        sourceIds: ["source-nadcc-explant-sterilisation"], searchedAt: "2026-08-02", searchQueries: ["Philodendron erubescens Pink Princess micropropagation explant nodal", "Philodendron erubescens synonyms POWO accepted name", "Philodendron erubescens sibling cultivars Red Emerald Burgundy micropropagation", "การขยายพันธุ์ ฟิโลเดนดรอน พิงค์ปริ๊นเซส เพาะเลี้ยงเนื้อเยื่อ"],
        note: "งานปี 2023 เริ่มจาก protocorm-like bodies และงานปี 2025 เพิ่มจำนวนจากยอดที่อยู่ในขวด ทั้งสองงานจึงเริ่มจากเนื้อเยื่อที่ปลอดเชื้ออยู่แล้ว ไม่มีขั้นฟอกผิวจากต้นแม่ให้อ้างอิง " +
          "ทางเลือกทดลองเรื่องน้ำ rinse คลอรีนต่ำ 300 ppm ยืมตัวเลขจาก Parkinson, Prendergast & Sayegh (1996) ที่ใช้ NaDCC 300 ppm นาน 24 ถึง 48 ชั่วโมงฆ่าเชื้อ shoot explant จากภาคสนามโดยตรง ไม่ใช่แค่ rinse สั้น ๆ หลังฟอกด้วยสารอื่นแบบที่เสนอที่นี่ และไม่ได้ทำกับ Araceae เลย จึงเป็นการประยุกต์ของเจ้าของระบบเองทั้งหมด ยังไม่เคยทดลองจริงกับพันธุ์นี้แม้แต่ครั้งเดียว ห้ามยกระดับความมั่นใจของทางเลือกนี้จนกว่าจะมีผลทดลองจริงมายืนยัน",
      },
    },
    multiply: {
      evidence: {
        level: "species-direct",
        sourceIds: ["source-pp-2023", "source-pp-thai-2023"],
        note: "งานปี 2023 รายงานว่า BAP 1.0 mg/L เดี่ยวให้ยอดมากที่สุด คือ 11.2 ยอดต่อชิ้นในอาหารเหลว และงานไทยได้ผลไปทางเดียวกันคือ BA 1 ถึง 2 mg/L ให้ยอดมากที่สุด สองงานนี้จึงยืนยันกันเอง",
      },
    },
    root: {
      evidence: {
        level: "species-direct",
        sourceIds: ["source-pp-2023", "source-pp-thai-2023"],
        note: "สองงานใช้ออกซินคนละตัว งานปี 2023 ใช้ IBA 3.0 mg/L ได้ 3.2 รากต่อชิ้น รากยาว 1.9 เซนติเมตร ส่วนงานไทยใช้ NAA 4.0 mg/L ระบบเก็บไว้ทั้งสองสูตรและยังไม่ตัดสินว่าอันไหนดีกว่า ให้เลือกตามสารที่มีแล้วบันทึกผลจริง",
      },
    },
    monitor: {
      title: "ติดตามความคงตัวของลายด่าง",
      evidence: {
        level: "species-direct",
        sourceIds: ["source-pp-2025"],
        note: "งานปี 2025 ประเมินความคงตัวทางพันธุกรรมของต้นที่ได้ แต่การดูสีใบด้วยตาไม่ใช่หลักฐานความคงตัว",
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
        sourceIds: [], searchedAt: "2026-08-02", searchQueries: ["Philodendron erubescens Pink Princess micropropagation explant nodal", "Philodendron erubescens synonyms POWO accepted name", "Philodendron erubescens sibling cultivars Red Emerald Burgundy micropropagation", "การขยายพันธุ์ ฟิโลเดนดรอน พิงค์ปริ๊นเซส เพาะเลี้ยงเนื้อเยื่อ"],
        note: "งานต้นทางไม่ได้รายงานสูตรตั้งต้นจากต้นแม่ เพราะเริ่มจากเนื้อเยื่อที่อยู่ในขวดแล้ว สูตรนี้จึงเป็นอาหารพื้นฐานที่ยังไม่ใส่ฮอร์โมน",
      },
    },
    {
      id: "multiplication",
      title: "ระยะเพิ่มจำนวนยอด",
      pH: "5.7 ถึง 5.8",
      ingredients: [
        { name: "MS basal salts", amountPerLiter: 1, unit: "×" },
        { name: "Sucrose", amountPerLiter: 30, unit: "g/L" },
        { name: "Agar", amountPerLiter: 7.5, unit: "g/L" },
        { name: "BAP", amountPerLiter: 1, unit: "mg/L", note: "ใช้น้ำยาแม่ ห้ามชั่งผงโดยตรงเมื่อทำปริมาณน้อย" },
      ],
      evidence: { level: "species-direct", sourceIds: ["source-pp-2023"] },
    },
    {
      id: "rooting",
      title: "ระยะออกราก",
      pH: "5.7 ถึง 5.8",
      ingredients: [
        { name: "MS basal salts", amountPerLiter: 0.5, unit: "×" },
        { name: "Sucrose", amountPerLiter: 30, unit: "g/L" },
        { name: "Agar", amountPerLiter: 7.5, unit: "g/L" },
        { name: "IBA", amountPerLiter: 3, unit: "mg/L", note: "ใช้น้ำยาแม่" },
      ],
      evidence: { level: "species-direct", sourceIds: ["source-pp-2023"] },
    },
    {
      id: "rooting-naa",
      title: "ระยะออกราก ทางเลือกที่ใช้ NAA",
      pH: "5.7 ถึง 5.8",
      ingredients: [
        { name: "MS basal salts", amountPerLiter: 1, unit: "×" },
        { name: "Sucrose", amountPerLiter: 30, unit: "g/L" },
        { name: "Agar", amountPerLiter: 7.5, unit: "g/L" },
        { name: "NAA", amountPerLiter: 4, unit: "mg/L", note: "ใช้น้ำยาแม่" },
      ],
      evidence: {
        level: "species-direct",
        sourceIds: ["source-pp-thai-2023"],
        note: "งานไทยพบว่า NAA 4 mg/L ให้จำนวนรากมากที่สุดในการทดสอบของเขา เป็นคนละสารกับ IBA ที่งานปี 2023 ใช้ ยังไม่มีงานใดเปรียบเทียบสองสารนี้โดยตรง",
      },
    },
  ],
  sourceIds: ["source-pp-2023", "source-pp-2025", "source-pp-thai-2023", "source-kew-erubescens", "source-nadcc-explant-sterilisation"],
};

export { fullSequence as standardSequence };
