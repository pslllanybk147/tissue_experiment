import type { PlantPack } from "../types";
import { standardSequence } from "./pink-princess";

/** Java moss เป็นแผ่นเสริมที่มีหลักฐานอ่อนที่สุดในห้าแผ่นใหม่ของรอบนี้ ไม่มีงานที่เข้าถึงเนื้อหาได้เลย
 *  สำหรับสกุลนี้โดยเฉพาะ งานเดียวที่ครอบคลุมชนิดนี้ (Anglana et al. 2024) ถูก ScienceDirect ปิดกั้น
 *  อ่านได้แค่บทคัดย่อ ทุกตัวเลขในไฟล์นี้จึงยืมจาก Vesicularia montagnei (species/christmas-moss.ts)
 *  ซึ่งอยู่วงศ์ Hypnaceae เดียวกันและใช้ทรงเดียวกัน แม้แต่ชื่อวิทยาศาสตร์ก็ยังไม่แน่นอน "Java moss"
 *  การค้าเกือบทั้งหมดขายภายใต้ Taxiphyllum barbieri แต่บันทึกพฤกษศาสตร์ทางการมีแค่จากเวียดนาม
 *  ขณะที่ชื่อ "Java" บอกเป็นนัยว่ามาจากอินโดนีเซีย น่าจะเป็น species complex ที่ขายภายใต้ชื่อเดียว
 *  ต้องถือว่าอัตลักษณ์ระดับสปีชีส์ของต้นในตลาดยังไม่แน่นอน จึงบอกข้อจำกัดนี้ตรง ๆ ในคู่มือ */
export const javaMossPack: PlantPack = {
  slug: "java-moss",
  scientificName: "Taxiphyllum barbieri (Schimp. ex Besch.) Z.Iwats.",
  commonName: "มอสจาวา",
  method: "fragment",
  summary:
    "ตัดชิ้นเล็กจากกอที่ยังเขียวสดเหมือนมอสคริสต์มาส แต่ไม่มีงานตรงพันธุ์ของสกุลนี้เข้าถึงได้เลย ตัวเลขทั้งหมดยืมจาก Vesicularia",
  durationLabel: "2 ถึง 3 เดือน",
  growthFormId: "fragment-mat-no-node",
  genusId: "taxiphyllum",
  sequence: [...standardSequence],
  mediaRecipeIdsByStep: {
    "prep-media": ["bcdat-modified"],
    multiply: ["bcdat-modified"],
    root: ["bcdat-modified"],
  },
  overrides: {
    "select-explant": {
      title: "เลือกส่วนที่เขียวสดที่สุดของกอ",
      summary: "ไม่มีข้อหรือตาให้เล็งเหมือนพืชมีท่อลำเลียง เลือกส่วนไหนของกอที่ยังเขียวสดก็ใช้ได้",
      why: "มอสไม่มีเนื้อเยื่อเจริญเฉพาะจุด ทุกเซลล์ของ gametophyte ที่ยังเขียวสดสามารถแตกยอดใหม่ได้ ต่างจากพืชมีข้อที่ต้องหาตาข้าง",
      actions: [
        "เลือกส่วนที่เขียวสดที่สุดของกอ",
        "หลีกเลี่ยงโคนกอที่จมอยู่ใต้กอนานและเริ่มมีสีคล้ำหรือมีตะไคร่เกาะ",
        "ไม่ต้องหาจุดตัดเฉพาะ ตัดจากตรงไหนของส่วนที่เขียวสดก็ได้",
      ],
      passCriteria: ["ได้ส่วนกอที่ยังเขียวสด ไม่มีตะไคร่หรือคราบเกาะหนา"],
      stopConditions: ["กอทั้งหมดมีแต่ส่วนที่คล้ำหรือมีตะไคร่เกาะหนา"],
      safetyNotes: [],
      evidence: { level: "botanical-fact", sourceIds: ["source-botany-moss-morphology"] },
    },
    cut: {
      title: "ตัดเป็นชิ้นเล็กขนาด 2 ถึง 3 มิลลิเมตร",
      summary: "ตัดกอที่เลือกไว้เป็นชิ้นเล็กมากด้วยกรรไกรปลายแหลม หย่อนลงน้ำสะอาดทันที",
      why: "ชิ้นเล็กเกินไปจะบอบช้ำจนไม่ฟื้น ชิ้นใหญ่เกินไปฟอกไม่ทั่วถึงแกนกลาง รายงานทั่วไปของมอสแนะนำไม่เกิน 3×3 มม.",
      actions: [
        "ตัดกอเป็นชิ้นเล็กขนาดประมาณ 2 ถึง 3 มิลลิเมตร ด้วยกรรไกรปลายแหลมที่ผ่านการฆ่าเชื้อ",
        "ตัดเสร็จชิ้นไหน หย่อนลงน้ำสะอาดทันที",
        "ตัดครบแล้วเข้าขั้นฟอกทันที อย่าพักค้างคืน",
      ],
      passCriteria: ["ได้ชิ้นเล็กหลายชิ้นที่ยังเขียวสด", "ทุกชิ้นอยู่ในน้ำ ไม่มีชิ้นไหนวางแห้งอยู่"],
      stopConditions: ["ชิ้นเริ่มเป็นสีน้ำตาลก่อนเข้าขั้นฟอก"],
      safetyNotes: ["ระวังของมีคม ชิ้นเล็กมากจับยาก ควรใช้ปากคีบปลายแหลมช่วย"],
      measurements: [{ id: "explant-length", label: "จำนวนชิ้นที่ได้", unit: "count", required: true, min: 1 }],
      evidence: {
        level: "adapted",
        sourceIds: ["source-vesicularia-montagnei-2023"],
        note: "ขนาดชิ้นยืมจากรายงานฟอกเชื้อมอสเขตร้อนทั่วไป เช่นเดียวกับที่ใช้กับ Christmas moss ไม่ใช่งานตรงพันธุ์ของสกุลนี้",
      },
    },
    sterilize: {
      actions: [
        "ล้างชิ้นมอสใต้น้ำไหลเบามาก 5 นาที เพื่อล้างตะไคร่และตะกอนออกก่อน",
        "แช่สารฟอกโซเดียมไฮโปคลอไรต์ความเข้มข้นคลอรีนออกฤทธิ์ต่ำมาก ประมาณ 0.1 ถึง 0.2% นาน 3 ถึง 5 นาที เขย่าเบามาก",
        "ทางเลือกทดลอง (ยังไม่เคยทดสอบกับพันธุ์นี้มาก่อน): ใช้น้ำ rinse คลอรีนต่ำแทนน้ำปลอดเชื้อ 3 รอบ",
        "น้ำ rinse ของมอสต้องเจือจางกว่า 300 ppm ที่งานอื่นในระบบนี้ใช้ เพราะชิ้นมอสบอบบางกว่ามาก",
        "เจือจางจาก[[nadcc|NaDCC]]หรือ NaOCl ก็ได้ แล้วล้างด้วยน้ำ rinse นี้ 3 รอบ รอบละสั้น ๆ ไม่ถึงหนึ่งนาที",
        "ถ้าไม่มั่นใจให้ใช้น้ำปลอดเชื้อธรรมดาตามค่าเริ่มต้นไปก่อน ข้ามทางเลือกทดลองนี้ได้",
        "ล้างด้วยน้ำปลอดเชื้อธรรมดา 3 รอบ (หรืออีกหนึ่งรอบสุดท้ายถ้าเลือกทางเลือกทดลอง) รอบสั้น ๆ โดยจับเบามือที่สุด",
        "จดเวลาและจำนวนรอบที่ทำจริง รวมถึงจดว่ารอบล้างใช้น้ำปลอดเชื้อธรรมดาหรือน้ำ rinse คลอรีนต่ำ",
      ],
      safetyNotes: [
        "ห้ามผสมสารฟอกกับกรด แอมโมเนีย หรือแอลกอฮอล์ เพราะเกิดแก๊สพิษ",
        "ทำในที่อากาศถ่ายเท และสวมแว่นตานิรภัย",
        "ชิ้นมอสบอบบางกว่าเนื้อเยื่อใบพืชมีท่อลำเลียงมาก ความเข้มข้นหรือเวลาที่ใช้กับพืชอื่นในระบบนี้แรงเกินไปสำหรับมอสแน่นอน",
        "ถ้าใช้เม็ดคลอรีน[[nadcc|NaDCC]]เชิงพาณิชย์เป็นน้ำ rinse ต้องรู้ว่าเม็ดพวกนี้ไม่ใช่ NaDCC ล้วนแบบ reagent-grade " +
          "มักผสมสารอื่นเพื่อให้เกิดฟองหรือกันจับตัวเป็นก้อน ยังไม่มีใครทดสอบว่าสารเหล่านั้นกระทบเนื้อเยื่อมอสไหม",
      ],
      evidence: {
        level: "unsupported",
        sourceIds: ["source-nadcc-explant-sterilisation"],
        searchedAt: "2026-08-08",
        searchQueries: [
          "Taxiphyllum barbieri Java moss sterilization protocol tissue culture",
          "Java moss aquarium gametophyte fragment axenic sterilization",
        ],
        note:
          "ไม่พบงานที่เข้าถึงเนื้อหาได้เลยสำหรับสกุลนี้โดยเฉพาะ งานเดียวที่ครอบคลุมชนิดนี้ (Anglana et al. 2024) " +
          "ถูก ScienceDirect ปิดกั้นเนื้อหาเต็ม ค่าที่ให้ในขั้นนี้ยืมมาจาก Vesicularia montagnei ในทรงเดียวกันทั้งหมด " +
          "ทางเลือกทดลองเรื่องน้ำ rinse คลอรีนต่ำยืมตัวอย่างจาก Parkinson, Prendergast & Sayegh (1996) ที่ไม่ได้ทำกับมอสเลย",
      },
    },
    initiate: {
      summary: "วางชิ้นมอสบนผิวอาหารเจือจาง ไม่ฝังลงในวุ้น",
      why: "มอสไม่มีรากจริงที่ต้องฝังลงอาหาร gametophyte เติบโตจากผิวสัมผัสอากาศและแสง",
      actions: [
        "วางชิ้นมอสบนผิวอาหาร ไม่ต้องฝังหรือกด",
        "ปิดฝาทันทีที่วางเสร็จแต่ละกระปุก",
        "เขียนวันที่และรหัสรอบบนกระปุก",
      ],
      evidence: { level: "botanical-fact", sourceIds: ["source-botany-moss-morphology"] },
    },
    multiply: {
      summary: "เลี้ยงบนอาหาร BCDAT ดัดแปลงเหมือน Christmas moss เพราะไม่มีงานตรงสกุลนี้เอง",
      why: "ไม่มีงานที่ทดสอบสูตรอาหารกับสกุลนี้เข้าถึงเนื้อหาได้เลย ยืมสูตรจาก Vesicularia montagnei วงศ์เดียวกันในทรงเดียวกัน",
      actions: [
        "เตรียมอาหาร BCDAT ดัดแปลง (ดูสูตรด้านล่าง)",
        "วางกระปุกในที่แสงประมาณ 60 ถึง 80 µmol m⁻²s⁻¹ ต่ำกว่าที่ใช้กับพืชเนื้อเยื่อทั่วไป",
        "ให้แสง 16 ชั่วโมงต่อวัน มืด 8 ชั่วโมง",
        "สังเกตยอดใหม่ที่แตกออกจากชิ้นตั้งต้น",
      ],
      evidence: {
        level: "unsupported",
        sourceIds: [],
        searchedAt: "2026-08-08",
        searchQueries: [
          "Taxiphyllum barbieri micropropagation medium BCD",
          "Java moss tissue culture growth medium formula",
        ],
        note:
          "ไม่พบสูตรอาหารที่เข้าถึงเนื้อหาได้เลยสำหรับสกุลนี้ ค่าที่แนะนำยืมจากงานตรงพันธุ์ของ Vesicularia montagnei " +
          "ซึ่งเป็นมอสตู้ปลาสกุลใกล้เคียงในวงศ์ Hypnaceae เดียวกัน ยังไม่มีการทดสอบจริงกับสกุลนี้",
      },
    },
    root: {
      title: "ไม่มีขั้นออกรากแบบพืชมีท่อลำเลียง",
      summary: "มอสไม่มีรากจริง มีแต่ rhizoid ซึ่งเกิดขึ้นเองจากกอที่แตกยอดแล้ว ไม่ต้องย้ายอาหารสูตรออกรากแยก",
      why: "rhizoid ทำหน้าที่ยึดเกาะเท่านั้น ไม่ได้ดูดน้ำหรือธาตุอาหารแบบรากพืชมีท่อลำเลียง จึงไม่มีสูตรออกรากเฉพาะให้ทำ",
      actions: [
        "เลี้ยงต่อบนอาหารเดิมจากขั้นเพิ่มจำนวนจนกอแผ่ขยายเป็นแผ่น",
        "สังเกต rhizoid สีน้ำตาลบาง ๆ ที่เกาะกับผิวอาหารหรือวัสดุรองรับ",
      ],
      evidence: { level: "botanical-fact", sourceIds: ["source-botany-moss-morphology"] },
    },
    acclimatize: {
      title: "ปรับสภาพสำหรับปลูกในตู้ปลา",
      summary: "ล้างวุ้นออกให้หมดแล้วมัดหรือติดกาวกับวัสดุจม ไม่ปลูกลงดินแบบไม้ใบทั่วไป",
      why: "Java moss ปลูกโดยเกาะติดกับไม้หรือหินใต้น้ำ หรือปล่อยลอยเป็นแพ ไม่ใช่ปลูกลงวัสดุปลูกในกระถางแบบพืชมีท่อลำเลียง",
      actions: [
        "นำกอออกจากขวดแล้วล้างวุ้นที่ติดออกให้หมดด้วยน้ำสะอาดที่อุณหภูมิห้อง",
        "มัดกอติดกับไม้มอสหรือหินด้วยเชือกหรือหนังยางที่ย่อยสลายได้ หรือใช้กาวสำหรับพืชน้ำโดยเฉพาะ",
        "จมลงน้ำทั้งกอในตู้ปลาหรือถังพักที่มีแสงรำไร",
        "รอ rhizoid เกาะติดวัสดุ ซึ่งมักใช้เวลาสองถึงสี่สัปดาห์ก่อนแกะเชือกออกได้",
      ],
      passCriteria: ["กอไม่หลุดร่วงและมียอดใหม่แตกออกมาหลังจมน้ำ"],
      stopConditions: ["กอเน่าดำเป็นหย่อม", "กอลอยหลุดจากวัสดุต่อเนื่องเกินหนึ่งเดือน"],
      safetyNotes: ["ล้างวุ้นให้หมดจริง วุ้นที่ค้างอยู่ใต้น้ำจะทำให้เกิดตะไคร่และเชื้อราในตู้ปลา"],
      evidence: {
        level: "adapted",
        sourceIds: ["source-uf-shoot-cultures"],
        note: "ไม่มีงานที่รายงานขั้นปรับสภาพลงตู้ปลาโดยตรงสำหรับพันธุ์นี้ ใช้หลักการทั่วไปของมอสตู้ปลาที่ปลูกแบบเกาะติดวัสดุ",
      },
    },
  },
  mediaRecipes: [
    {
      id: "bcdat-modified",
      title: "อาหาร BCDAT + sucrose 58 mM (ยืมจาก Vesicularia montagnei)",
      pH: "6.5",
      ingredients: [
        { name: "MgSO4", amountPerLiter: 1, unit: "mM", molecularWeightGPerMol: 120.37, note: "คำนวณแบบ anhydrous; ถ้าฉลากเป็น MgSO4·7H2O ต้องเปลี่ยนมวลโมเลกุลตามรูปสาร" },
        { name: "KNO3", amountPerLiter: 10, unit: "mM", molecularWeightGPerMol: 101.10 },
        { name: "FeSO4", amountPerLiter: 45, unit: "µM", molecularWeightGPerMol: 151.91, note: "รูป hydrate ให้ตรวจฉลากก่อนชั่ง" },
        { name: "KH2PO4", amountPerLiter: 1.8, unit: "mM", molecularWeightGPerMol: 136.09 },
        { name: "CuSO4", amountPerLiter: 0.22, unit: "µM", molecularWeightGPerMol: 159.61, note: "รูป hydrate ให้ตรวจฉลากก่อนชั่ง" },
        { name: "ZnSO4", amountPerLiter: 0.19, unit: "µM", molecularWeightGPerMol: 161.47, note: "รูป hydrate ให้ตรวจฉลากก่อนชั่ง" },
        { name: "H3BO3", amountPerLiter: 10, unit: "µM", molecularWeightGPerMol: 61.83 },
        { name: "Na2MoO4", amountPerLiter: 0.10, unit: "µM", molecularWeightGPerMol: 205.92, note: "รูป hydrate ให้ตรวจฉลากก่อนชั่ง" },
        { name: "MnCl2", amountPerLiter: 2, unit: "µM", molecularWeightGPerMol: 125.84, note: "รูป hydrate ให้ตรวจฉลากก่อนชั่ง" },
        { name: "CoCl2", amountPerLiter: 0.23, unit: "µM", molecularWeightGPerMol: 129.84, note: "รูป hydrate ให้ตรวจฉลากก่อนชั่ง" },
        { name: "KI", amountPerLiter: 0.17, unit: "µM", molecularWeightGPerMol: 166.00 },
        { name: "CaCl2", amountPerLiter: 1, unit: "mM", molecularWeightGPerMol: 110.98, note: "แหล่งต้นฉบับเติมจาก stock แยกก่อนเทอาหาร" },
        { name: "Diammonium tartrate", amountPerLiter: 5, unit: "mM", molecularWeightGPerMol: 184.15 },
        { name: "Sucrose", amountPerLiter: 58, unit: "mM", molecularWeightGPerMol: 342.30 },
        { name: "Agar", amountPerLiter: 8, unit: "g/L" },
      ],
      evidence: {
        level: "adapted",
        sourceIds: ["source-vesicularia-montagnei-2023"],
        searchedAt: "2026-08-08",
        searchQueries: ["Taxiphyllum barbieri micropropagation medium formula", "Vesicularia montagnei BCDAT sucrose 58 mM"],
        note: "ถอดองค์ประกอบ BCDAT และ sucrose 58 mM จากงาน Vesicularia montagnei ที่เข้าถึงวิธีทดลองได้ แต่ยังไม่มีการทดสอบกับ Taxiphyllum โดยตรง และต้องตรวจรูป hydrate ของสารก่อนชั่ง",
      },
    },
  ],
  sourceIds: [
    "source-vesicularia-montagnei-2023",
    "source-aquatic-moss-axenic-2024",
    "source-nadcc-explant-sterilisation",
    "source-uf-shoot-cultures",
  ],
};
