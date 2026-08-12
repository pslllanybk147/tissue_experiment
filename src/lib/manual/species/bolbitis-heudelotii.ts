import type { PlantPack } from "../types";
import { standardSequence } from "./pink-princess";

/** ไม่มีงานตีพิมพ์ที่ทำกับ Bolbitis heudelotii โดยตรงเลยแม้แต่ชิ้นเดียว ทุกอย่างในไฟล์นี้ยืมจาก
 *  Bolbitis costata (Mazumder et al. 2010) สกุลเดียวกันคนละชนิด หรือจากหลักปฏิบัติทั่วไปของ
 *  การเพาะเลี้ยงเฟิร์นด้วยสปอร์ที่ไม่เจาะจงพันธุ์ ไม่มีขั้นใดถึงระดับ species-direct เลยในแผ่นเสริมนี้
 *  ใช้ทรงเฟิร์น (fern-frond-or-spore) เส้นทางสปอร์ ต่างจาก Java fern ที่ใช้เส้นทาง GGB
 *  เพราะไม่มีงานรองรับ GGB กับสกุลนี้ */
export const bolbitisHeudelotiiPack: PlantPack = {
  slug: "bolbitis-heudelotii",
  scientificName: "Bolbitis heudelotii (Bory ex Fée) Alston",
  commonName: "เฟิร์นใบมะขามน้ำตก",
  method: "spore",
  summary: "ขยายพันธุ์จากสปอร์ ไม่ใช่ชิ้นใบแบบ Java fern เพราะไม่มีงานรองรับ GGB กับสกุลนี้ ทุกขั้นยืมจากญาติสกุลเดียวกัน",
  durationLabel: "6 ถึง 12 เดือน (สปอร์เฟิร์นใช้เวลานานกว่าเส้นทาง GGB มาก)",
  growthFormId: "fern-frond-or-spore",
  genusId: "bolbitis",
  sequence: [...standardSequence],
  mediaRecipeIdsByStep: {
    "prep-media": ["spore-germination"],
    multiply: ["gametophyte-growth", "sporophyte-development"],
    root: ["sporophyte-development"],
  },
  overrides: {
    "select-explant": {
      title: "เก็บกลุ่มอับสปอร์จากใบแก่",
      summary: "หาใบแก่ที่สุดของต้นที่มีกลุ่มอับสปอร์สีน้ำตาลเข้มเต็มที่แล้วที่หลังใบ",
      why: "สกุลนี้ไม่มีงานที่ชักนำ GGB ได้สำเร็จ เส้นทางเดียวที่มีหลักฐานรองรับคือการเพาะจากสปอร์",
      actions: [
        "เลือกใบที่แก่ที่สุดของต้น ซึ่งมักมีกลุ่มอับสปอร์เต็มที่แล้ว",
        "ตรวจว่ากลุ่มอับสปอร์เป็นสีน้ำตาลเข้มถึงดำ ไม่ใช่สีเขียวอ่อนซึ่งยังไม่สุก",
        "ตัดใบทั้งใบใส่ถุงกระดาษแห้งสะอาด แล้วเก็บไว้ในที่แห้งจนสปอร์ร่วง (มักใช้เวลา 2 ถึง 3 วัน)",
      ],
      passCriteria: ["มีสปอร์ร่วงลงในถุงเก็บเป็นผงละเอียดสีน้ำตาล"],
      stopConditions: ["ไม่มีใบที่มีกลุ่มอับสปอร์สุกเต็มที่บนต้น"],
      safetyNotes: [],
      evidence: {
        level: "adapted",
        sourceIds: ["source-bolbitis-costata-2010"],
        note: "ยืมหลักการเก็บสปอร์เฟิร์นทั่วไปมาที่ระดับชนิด ไม่มีงานที่ระบุขั้นตอนเก็บสปอร์ของสกุลนี้อย่างละเอียด",
      },
    },
    cut: {
      title: "ไม่มีขั้นตัดชิ้นพืชในเส้นทางนี้",
      summary: "เส้นทางสปอร์ไม่มีการตัดชิ้นพืชสด สปอร์ที่เก็บได้จากขั้นก่อนหน้าคือสิ่งที่นำไปฟอกโดยตรง",
      why: "ต่างจากการตัดข้อหรือชิ้นใบสด สปอร์เป็นผงแห้งที่เก็บสะสมไว้แล้ว ไม่ต้องพักในน้ำหรือกังวลเรื่องรอยตัดเปลี่ยนสี",
      actions: [
        "ตรวจว่าสปอร์ที่เก็บได้แห้งสนิทและไม่มีเชื้อราขึ้น",
        "แบ่งสปอร์ใส่ภาชนะสะอาดแห้งเตรียมเข้าขั้นฟอกทันที",
      ],
      passCriteria: ["สปอร์แห้งและไม่มีเชื้อราขึ้น"],
      stopConditions: ["สปอร์ขึ้นราหรือชื้นจับตัวเป็นก้อน ให้ทิ้งแล้วเก็บใหม่"],
      safetyNotes: [],
      measurements: [],
      evidence: {
        level: "adapted",
        sourceIds: ["source-bolbitis-costata-2010"],
        note: "ยืมหลักปฏิบัติทั่วไปของการเพาะสปอร์เฟิร์นมาที่ระดับชนิด",
      },
    },
    sterilize: {
      actions: [
        "ห่อสปอร์ในผ้ากรองสะอาดหรือถุงชาเปล่า",
        "แช่ในน้ำยาฟอกขาวเจือจาง 10% v/v (คลอรีนออกฤทธิ์ประมาณ 0.5%) ผสม[[surfactant|สารลดแรงตึงผิว]] 1 ถึง 2 หยดต่อ 100 มล. นาน 10 นาที",
        "ทางเลือกทดลอง (ยังไม่เคยทดสอบกับพันธุ์นี้มาก่อน): ใช้น้ำ rinse คลอรีนต่ำแทนน้ำปลอดเชื้อ 3 รอบตามค่าเริ่มต้น",
        "เตรียมน้ำ rinse ให้มีคลอรีนออกฤทธิ์ประมาณ 300 ppm เจือจางจาก[[nadcc|NaDCC]]หรือ NaOCl ก็ได้",
        "ล้างด้วยน้ำ rinse นี้ 3 รอบ รอบละประมาณหนึ่งนาที",
        "แนวคิดคือให้น้ำล้างฆ่าเชื้อที่หลุดจากผิวชิ้นพืชไปด้วย ไม่ใช่แค่ชะสารฟอกออก",
        "ถ้าไม่มั่นใจให้ใช้น้ำปลอดเชื้อธรรมดาตามค่าเริ่มต้นไปก่อน ข้ามทางเลือกทดลองนี้ได้",
        "ล้างด้วยน้ำปลอดเชื้อธรรมดา 3 รอบ (หรืออีกหนึ่งรอบสุดท้ายถ้าเลือกทางเลือกทดลอง) รอบละประมาณหนึ่งนาที",
        "จดเวลาและจำนวนรอบที่ทำจริง รวมถึงจดว่ารอบล้างใช้น้ำปลอดเชื้อธรรมดาหรือน้ำ rinse คลอรีนต่ำ",
      ],
      safetyNotes: [
        "ห้ามผสมสารฟอกกับกรด แอมโมเนีย หรือแอลกอฮอล์ เพราะเกิดแก๊สพิษ",
        "ทำในที่อากาศถ่ายเท และสวมแว่นตานิรภัย",
        "สปอร์บอบบางกว่าเนื้อเยื่อใบมาก ถ้าฟอกแรงหรือนานเกินไปสปอร์จะตายหมดโดยไม่มีสัญญาณเตือนก่อน",
        "ถ้าใช้เม็ดคลอรีน[[nadcc|NaDCC]]เชิงพาณิชย์เป็นน้ำ rinse ต้องรู้ว่าเม็ดพวกนี้ไม่ใช่ NaDCC ล้วนแบบ reagent-grade " +
          "มักผสมสารอื่นเพื่อให้เกิดฟองหรือกันจับตัวเป็นก้อน ยังไม่มีใครทดสอบว่าสารเหล่านั้นกระทบสปอร์ไหม",
      ],
      evidence: {
        level: "unsupported",
        sourceIds: ["source-nadcc-explant-sterilisation"],
        searchedAt: "2026-08-08",
        searchQueries: [
          "Bolbitis heudelotii spore surface sterilization protocol",
          "fern spore sterilization sodium hypochlorite concentration duration",
        ],
        note:
          "ไม่พบตัวเลขความเข้มข้นหรือเวลาฟอกสปอร์ที่เจาะจงสกุลนี้เลย ค่า 10% v/v นาน 10 นาทีในขั้นนี้เป็นค่าประมาณจากหลักปฏิบัติ " +
          "ทั่วไปของการฟอกสปอร์เฟิร์นที่ไม่มีแหล่งอ้างอิงเจาะจงพอจะยกระดับเป็น adapted ผู้ใช้ต้องทดสอบและปรับเองจากบันทึกผลจริง " +
          "ทางเลือกทดลองเรื่องน้ำ rinse คลอรีนต่ำ 300 ppm ยืมตัวเลขจาก Parkinson, Prendergast & Sayegh (1996) ที่ไม่ได้ทำกับเฟิร์นเลย",
      },
    },
    initiate: {
      title: "โรยสปอร์บนอาหารงอก",
      summary: "โรยสปอร์ที่ฟอกแล้วบนผิวอาหาร ไม่ต้องฝังหรือกดจม",
      why: "สปอร์งอกจากผิวที่สัมผัสแสง การฝังลงในวุ้นจะทำให้สปอร์ไม่งอก",
      actions: [
        "โรยสปอร์ที่ฟอกแล้วบนผิวอาหารให้กระจายสม่ำเสมอ ไม่ต้องกดหรือฝัง",
        "ปิดฝาทันทีหลังโรยแต่ละกระปุก",
        "เขียนวันที่และรหัสรอบบนกระปุก",
      ],
      passCriteria: ["สปอร์กระจายทั่วผิวอาหารไม่จับกันเป็นกระจุกหนา"],
      stopConditions: ["สปอร์จมลงในวุ้นทั้งหมด"],
      safetyNotes: ["เปิดภาชนะให้สั้นที่สุด"],
      measurements: [],
      evidence: {
        level: "adapted",
        sourceIds: ["source-bolbitis-costata-2010"],
        note: "หลักปฏิบัติทั่วไปของการเพาะสปอร์เฟิร์นบนผิวอาหาร ไม่ใช่ตัวเลขที่ทดสอบเจาะจงกับสกุลนี้",
      },
    },
    "check-contamination": {
      summary: "บ่มในที่มืดจนกว่า prothalli จะงอก แล้วจึงตรวจเชื้อผ่านผนังภาชนะเหมือนขั้นปกติ",
      why: "สปอร์เฟิร์นต้องการที่มืดในการงอกระยะแรก ต่างจากชิ้นพืชปกติที่บ่มในที่มีแสงตั้งแต่ต้น",
      evidence: {
        level: "adapted",
        sourceIds: ["source-bolbitis-costata-2010"],
        note: "หลักปฏิบัติทั่วไปของการงอกสปอร์เฟิร์นในที่มืด อุณหภูมิประมาณ 22°C จนกว่า prothalli จะงอก ใช้เวลาประมาณ 12 สัปดาห์",
      },
    },
    multiply: {
      summary: "ย้าย prothalli ที่งอกแล้วไปอาหารเพิ่มจำนวนที่มี IAA ความเข้มข้นสูงกว่าขั้นงอกสปอร์",
      why: "งานที่ทำกับ Bolbitis costata สกุลเดียวกันพบว่า IAA ความเข้มข้นสูงขึ้นช่วยให้ gametophyte โตดีที่สุด",
      actions: [
        "เมื่อ prothalli งอกจากสปอร์แล้ว ย้ายไปอาหาร MS ครึ่งสูตร ใส่ IAA 0.4 mg/L",
        "เมื่อ sporophyte เริ่มแตกออกจาก gametophyte ย้ายไปอาหาร MS ใส่ IAA 4 mg/L ร่วมกับ Kinetin 5 mg/L และ IBA 0.2 mg/L",
        "นับจำนวน sporophyte ใหม่ที่แตกออกมา",
      ],
      evidence: {
        level: "adapted",
        sourceIds: ["source-bolbitis-costata-2010"],
        note: "ตัวเลขทั้งหมดมาจากงานที่ทำกับ Bolbitis costata สกุลเดียวกันแต่คนละชนิด ไม่ใช่งานตรงพันธุ์",
      },
    },
    root: {
      evidence: {
        level: "unsupported",
        sourceIds: [],
        searchedAt: "2026-08-08",
        searchQueries: [
          "Bolbitis heudelotii rooting medium auxin concentration",
          "Bolbitis sporophyte rooting IBA NAA in vitro",
        ],
        note: "ไม่พบสูตรออกรากที่เจาะจงเฟิร์นสกุลนี้ อาหารเพิ่มจำนวนที่มี IBA ผสมอยู่แล้วอาจให้รากมาพร้อมกัน ผู้ใช้ต้องทดสอบและบันทึกผลจริง",
      },
    },
    acclimatize: {
      title: "ปรับสภาพสำหรับปลูกในตู้ปลาหรือน้ำตก",
      summary: "ล้างวุ้นออกให้หมดแล้วมัดติดกับวัสดุจม ไม่ปลูกลงดินแบบไม้ใบทั่วไป",
      why: "Bolbitis heudelotii เป็นเฟิร์นอิงอาศัยที่ปลูกโดยมัดเหง้าติดกับไม้หรือหินใต้น้ำหรือบริเวณน้ำตก ไม่ใช่ปลูกลงวัสดุปลูกในกระถาง",
      actions: [
        "นำต้นออกจากขวดแล้วล้างวุ้นที่ติดรากออกให้หมดด้วยน้ำสะอาดที่อุณหภูมิห้อง",
        "ค่อย ๆ ปรับให้ต้นชินกับอากาศนอกขวดในที่ชื้นสูงประมาณหนึ่งสัปดาห์ก่อนนำลงน้ำ",
        "มัดเหง้าติดกับไม้มอสหรือหินด้วยเชือกหรือหนังยางที่ย่อยสลายได้ อย่าฝังเหง้าลงในวัสดุปลูก",
        "จมลงน้ำหรือวางในบริเวณที่มีน้ำไหลผ่านเบา ๆ และมีแสงรำไร",
      ],
      passCriteria: ["ต้นไม่เน่าและมีใบใหม่แตกออกมาหลังจมน้ำ"],
      stopConditions: ["เหง้าเน่าดำ", "ต้นเหลืองซีดต่อเนื่องเกินสองสัปดาห์"],
      safetyNotes: ["ล้างวุ้นให้หมดจริง วุ้นที่ค้างอยู่ใต้น้ำจะทำให้เกิดตะไคร่และเชื้อราในตู้ปลา"],
      evidence: {
        level: "adapted",
        sourceIds: ["source-uf-shoot-cultures"],
        note: "ไม่มีงานที่รายงานขั้นปรับสภาพลงตู้ปลาโดยตรงสำหรับพันธุ์นี้ ใช้หลักการทั่วไปของเฟิร์นอิงอาศัยที่ปลูกแบบมัดติดวัสดุ",
      },
    },
  },
  mediaRecipes: [
    {
      id: "spore-germination",
      title: "อาหารงอกสปอร์",
      pH: "5.7 ถึง 5.8",
      ingredients: [
        { name: "MS basal salts", amountPerLiter: 0.5, unit: "×" },
        { name: "Sucrose", amountPerLiter: 20, unit: "g/L" },
        { name: "Agar", amountPerLiter: 8, unit: "g/L" },
        { name: "IAA", amountPerLiter: 0.2, unit: "mg/L" },
      ],
      evidence: {
        level: "adapted",
        sourceIds: ["source-bolbitis-costata-2010"],
        note: "ยืมจากงานที่ทำกับ Bolbitis costata สกุลเดียวกัน ให้ผลงอกสปอร์ดีที่สุดในงานนั้น",
      },
    },
    {
      id: "gametophyte-growth",
      title: "อาหารให้ gametophyte โต",
      pH: "5.7 ถึง 5.8",
      ingredients: [
        { name: "MS basal salts", amountPerLiter: 0.5, unit: "×" },
        { name: "Sucrose", amountPerLiter: 20, unit: "g/L" },
        { name: "Agar", amountPerLiter: 8, unit: "g/L" },
        { name: "IAA", amountPerLiter: 0.4, unit: "mg/L" },
      ],
      evidence: {
        level: "adapted",
        sourceIds: ["source-bolbitis-costata-2010"],
        note: "ยืมจากงานที่ทำกับ Bolbitis costata สกุลเดียวกัน ให้ gametophyte โตดีที่สุดในงานนั้น",
      },
    },
    {
      id: "sporophyte-development",
      title: "อาหารให้ sporophyte พัฒนา",
      pH: "5.7 ถึง 5.8",
      ingredients: [
        { name: "MS basal salts", amountPerLiter: 1, unit: "×" },
        { name: "Sucrose", amountPerLiter: 30, unit: "g/L" },
        { name: "Agar", amountPerLiter: 7.5, unit: "g/L" },
        { name: "IAA", amountPerLiter: 4, unit: "mg/L" },
        { name: "Kinetin", amountPerLiter: 5, unit: "mg/L" },
        { name: "IBA", amountPerLiter: 0.2, unit: "mg/L" },
      ],
      evidence: {
        level: "adapted",
        sourceIds: ["source-bolbitis-costata-2010"],
        note: "ยืมจากงานที่ทำกับ Bolbitis costata สกุลเดียวกัน ให้ sporophyte โตดีที่สุดในงานนั้น",
      },
    },
  ],
  sourceIds: ["source-bolbitis-costata-2010", "source-nadcc-explant-sterilisation", "source-uf-shoot-cultures"],
};
