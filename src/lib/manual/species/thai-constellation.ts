import type { PlantPack } from "../types";
import { standardSequence } from "./pink-princess";

/** พันธุ์แรกของสกุล Monstera ในระบบ
 *  เลือกพันธุ์นี้เพราะเป็นพันธุ์เดียวในสกุลที่มีงานตีพิมพ์ตรงพันธุ์ถึงสองชิ้น
 *  ตัวเลขที่ผูกกับพันธุ์อยู่ในไฟล์นี้ ส่วนสิ่งที่จริงทั้งสกุลอยู่ที่ genera/monstera.ts */
export const thaiConstellationPack: PlantPack = {
  slug: "thai-constellation",
  scientificName: "Monstera deliciosa Liebm. ‘Thai Constellation’",
  commonName: "มอนสเตอร่าไทยคอนสเตลเลชัน",
  method: "nodal",
  summary: "มอนสเตอร่าด่างที่มีงานวิจัยตรงพันธุ์ ขยายจากข้อที่มีตาข้าง",
  durationLabel: "5 ถึง 9 เดือน",
  growthFormId: "climbing-vine-visible-node",
  genusId: "monstera",
  traitIds: ["variegated"],
  sequence: [...standardSequence],
  overrides: {
    cut: {
      summary: "ตัดข้อให้ได้ชิ้นยาวประมาณ 8 ถึง 10 มิลลิเมตร โดยให้ตาข้างอยู่กลางชิ้น",
      actions: [
        "วางชิ้นบนจานสะอาด ให้ตาข้างอยู่กลาง",
        "ตัดสองครั้ง บนและล่างของตา ให้เหลือชิ้นยาว 8 ถึง 10 มิลลิเมตร",
        "ถ้ามีก้านใบติดมา ตัดออกให้ชิดลำต้น เพราะก้านใบเน่าง่ายและลามเข้าชิ้น",
      ],
      evidence: {
        level: "species-direct",
        sourceIds: ["source-monstera-thai-constellation-2023"],
        note:
          "งานปี 2023 ระบุขนาดชิ้นข้อที่ใช้จริงคือ 0.8 ถึง 1.0 เซนติเมตร ทำกับพันธุ์นี้โดยตรง " +
          "สั้นกว่าค่าตั้งต้นของชั้นทรงซึ่งเป็นค่าโครงสร้างที่ยังไม่มีงานรองรับ",
      },
    },
    multiply: {
      summary: "ใช้ TDZ 4 ไมโครโมลาร์ ร่วมกับ NAA 2 ไมโครโมลาร์ บนอาหาร MS ที่อุณหภูมิราว 30 องศา",
      actions: [
        "เตรียมอาหาร MS ใส่ TDZ 4 µM และ NAA 2 µM",
        "ย้ายชิ้นที่รอดจากขั้นตั้งต้นลงอาหารนี้",
        "วางในที่อุณหภูมิราว 30 องศา แสงกระจาย",
        "เมื่อยอดยาวเกิน 2 เซนติเมตร ย้ายไปขั้นออกราก อย่าเลี้ยงค้างในสูตรนี้นานกว่าที่จำเป็น",
      ],
      passCriteria: ["ได้ยอดใหม่หลายยอดจากชิ้นเดียว โดยยอดตั้งตรงและเนื้อไม่ใส"],
      evidence: {
        level: "species-direct",
        sourceIds: ["source-monstera-thai-constellation-2023", "source-tdz-aroid-2018"],
        note:
          "งานปี 2023 รายงานว่าสูตรนี้ให้การเกิดยอด 100% และได้ 7.6 ยอดต่อชิ้น ซึ่งเป็นผลที่ดีที่สุดในงาน " +
          "ไม่ใช่หนึ่งในทรีตเมนต์ที่ทดสอบเฉย ๆ " +
          "งานเก่าปี 1980 ใช้ PBA 10 mg/L ร่วมกับ IAA 2 mg/L ซึ่งเป็นคนละสารและ PBA แทบไม่มีขายแล้ว จึงไม่ยกมาเป็นทางหลัก " +
          "ข้อจำกัดที่ต้องรู้ คือเข้าถึงได้แค่บทคัดย่อ จึงยังตรวจไม่ได้ว่าใช้ตัวอย่างกี่ชิ้นต่อทรีตเมนต์ " +
          "และมีกลุ่มควบคุมที่ไม่ใส่ฮอร์โมนหรือไม่ ตามเกณฑ์ข้อห้าและข้อหกของ newplant_protocol.md",
      },
    },
    root: {
      summary: "ใช้ IBA 8 ไมโครโมลาร์ บนอาหาร MS ที่ใส่ผงถ่าน 0.5 กรัมต่อลิตร",
      actions: [
        "เตรียมอาหาร MS ใส่ผงถ่านกัมมันต์ 0.5 g/L และ IBA 8 µM",
        "เลือกเฉพาะยอดที่ยาวเกิน 2 เซนติเมตร ยอดที่สั้นกว่านี้ให้เลี้ยงต่อก่อน",
      ],
      passCriteria: ["ยอดออกรากจริง ไม่ใช่แค่ปุ่มบวมที่โคน"],
      evidence: {
        level: "species-direct",
        sourceIds: ["source-monstera-thai-constellation-2023"],
        note:
          "งานปี 2023 รายงานการออกราก 100% และได้ 6.3 รากต่อยอด เป็นผลที่ดีที่สุดในงาน ทำกับพันธุ์นี้โดยตรง " +
          "งานปี 1980 ใช้ IAA 2 mg/L กับ Monstera deliciosa ทั่วไป ซึ่งเป็นคนละออกซินกัน เก็บไว้เป็นทางเลือก ไม่เลือกข้างเงียบ ๆ",
      },
    },
    acclimatize: {
      summary: "ขั้นนี้ไม่ต้องซื้อสารกระตุ้นการเจริญเติบโตมาช่วย เพราะมีงานที่ลองกับพันธุ์นี้แล้วพบว่าไม่ต่าง",
      why:
        "ร้านขายอุปกรณ์มักเสนอสารกระตุ้นสำหรับขั้นย้ายออกขวด " +
        "มีงานที่ทดสอบกับพันธุ์นี้โดยตรงแล้วพบว่าไม่ได้ช่วยให้โตดีขึ้นอย่างมีนัยสำคัญ",
      evidence: {
        level: "species-direct",
        sourceIds: ["source-monstera-tis-2024"],
        note:
          "งานปี 2024 ทดสอบสารกระตุ้นชีวภาพ IQ Forte ในขั้นย้ายออกขวดของพันธุ์นี้ " +
          "แล้วรายงานว่าไม่ให้ผลต่างอย่างมีนัยสำคัญ เป็นผลลบที่มีประโยชน์ คือช่วยไม่ให้เสียเงินเปล่า " +
          "งานเดียวกันใช้ระบบจุ่มชั่วคราวซึ่งคนทั่วไปไม่มี แต่มีชุดควบคุมที่เลี้ยงบนวุ้นแข็งแบบปกติด้วย " +
          "จึงไม่ใช่ว่าต้องมีเครื่องนั้นถึงจะทำได้ ยังตรวจรายละเอียดวิธีการไม่ได้ เพราะเว็บสำนักพิมพ์ปิดกั้นการเข้าถึงอัตโนมัติ",
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
        searchedAt: "2026-08-06",
        searchQueries: [
          "Monstera deliciosa establishment medium MS sucrose agar concentration",
          "Monstera deliciosa micropropagation in vitro protocol nodal explant",
        ],
        note: "อาหารพื้นฐานที่ยังไม่ใส่ฮอร์โมน งานทั้งสองชิ้นระบุว่าใช้ MS แต่ไม่ได้ระบุองค์ประกอบของระยะตั้งต้นแยกจากระยะเพิ่มจำนวน",
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
        { name: "Thidiazuron (TDZ)", amountPerLiter: 0.88, unit: "mg/L", note: "เท่ากับ 4 µM" },
        { name: "NAA", amountPerLiter: 0.37, unit: "mg/L", note: "เท่ากับ 2 µM" },
      ],
      evidence: {
        level: "species-direct",
        sourceIds: ["source-monstera-thai-constellation-2023"],
        note:
          "ความเข้มข้นของฮอร์โมนมาจากงานปี 2023 โดยตรง ส่วนน้ำตาล วุ้น และ pH เป็นค่ามาตรฐานของสูตร MS " +
          "ที่งานนั้นไม่ได้ระบุแยก ตัวเลข mg/L คำนวณจากค่าไมโครโมลาร์ด้วยมวลโมเลกุลของสารแต่ละตัว",
      },
    },
  ],
  sourceIds: [
    "source-powo-monstera-deliciosa",
    "source-monstera-thai-constellation-2023",
    "source-monstera-tis-2024",
    "source-monstera-fonnesbech-1980",
  ],
};
