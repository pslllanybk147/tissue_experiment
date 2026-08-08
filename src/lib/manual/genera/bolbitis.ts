import type { GenusPack } from "./types";

/** ไม่มีงานตีพิมพ์ที่ทำกับ Bolbitis heudelotii โดยตรงเลย งานเดียวในสกุลเดียวกันคือ Mazumder et al. 2010
 *  ซึ่งทำกับ Bolbitis costata คนละชนิด ทุกอย่างในไฟล์นี้จึงยืมมาจากญาติสกุลเดียวกัน ไม่ใช่ตรงพันธุ์
 *  เส้นทางขยายพันธุ์ของสกุลนี้คือสปอร์ ไม่ใช่ GGB แบบ Microsorum เพราะไม่มีงานรองรับ GGB กับสกุลนี้เลย */
export const bolbitis: GenusPack = {
  id: "bolbitis",
  growthFormId: "fern-frond-or-spore",
  scientificName: "Bolbitis",
  commonNames: ["เฟิร์นใบมะขาม", "เฟิร์นน้ำตก"],
  deviations: {
    "select-explant": {
      title: "เก็บกลุ่มอับสปอร์จากใบแก่",
      summary: "หาใบแก่ที่สุดของต้นที่มีกลุ่มอับสปอร์สีน้ำตาลเข้มเต็มที่แล้วที่หลังใบ",
      why: "สกุลนี้ไม่มีงานที่ชักนำ GGB ได้สำเร็จ เส้นทางเดียวที่มีหลักฐานรองรับคือการเพาะจากสปอร์",
      actions: [
        "เลือกใบที่แก่ที่สุดของต้น ซึ่งมักมีกลุ่มอับสปอร์เต็มที่แล้ว",
        "ตรวจว่ากลุ่มอับสปอร์เป็นสีน้ำตาลเข้มถึงดำ ไม่ใช่สีเขียวอ่อนซึ่งยังไม่สุก",
        "ตัดใบทั้งใบใส่ถุงกระดาษแห้งสะอาด แล้วเก็บไว้ในที่แห้งจนสปอร์ร่วง",
      ],
      passCriteria: ["มีสปอร์ร่วงลงในถุงเก็บ"],
      stopConditions: ["ไม่มีใบที่มีกลุ่มอับสปอร์สุกเต็มที่บนต้น"],
      safetyNotes: [],
      evidence: {
        level: "adapted",
        sourceIds: ["source-bolbitis-costata-2010"],
        note:
          "ยืมหลักการทั่วไปของการเก็บสปอร์เฟิร์นมาที่ระดับสกุล งานอ้างอิงทำกับ Bolbitis costata ไม่ใช่ B. heudelotii " +
          "และไม่ได้ระบุขั้นตอนเก็บสปอร์อย่างละเอียด เป็นหลักปฏิบัติทั่วไปของเฟิร์นที่ขยายพันธุ์ด้วยสปอร์",
      },
    },
    sterilize: {
      evidence: {
        level: "unsupported",
        sourceIds: [],
        searchedAt: "2026-08-08",
        searchQueries: [
          "Bolbitis heudelotii spore surface sterilization protocol",
          "fern spore sterilization sodium hypochlorite concentration duration",
        ],
        note:
          "ไม่พบตัวเลขความเข้มข้นหรือเวลาฟอกสปอร์ที่เจาะจงสกุลนี้หรือแม้แต่วงศ์เดียวกันที่เข้าถึงได้เต็ม " +
          "ผู้ใช้ต้องเริ่มจากค่าฟอกมาตรฐานของแกนกลางแล้วลดความเข้มข้นและเวลาลง เพราะสปอร์บอบบางกว่าเนื้อเยื่อใบมาก " +
          "และบันทึกผลจริงเพื่อปรับรอบถัดไป",
      },
    },
    multiply: {
      summary: "เพาะสปอร์บนอาหาร MS ครึ่งสูตรใส่ IAA ต่ำในที่มืด แล้วย้าย prothalli ไปอาหารเพิ่มจำนวน",
      why: "งานที่ทำกับ Bolbitis costata สกุลเดียวกันพบว่า IAA ความเข้มข้นต่ำช่วยให้สปอร์งอกและ gametophyte โตดีที่สุด",
      actions: [
        "โรยสปอร์บนอาหาร MS ครึ่งสูตร ใส่ IAA 0.2 mg/L สำหรับงอกสปอร์",
        "บ่มในที่มืด อุณหภูมิประมาณ 22°C จนกว่า prothalli จะงอก",
        "ย้าย prothalli ไปอาหาร MS ครึ่งสูตร ใส่ IAA 0.4 mg/L เพื่อให้ gametophyte โตต่อ",
        "เมื่อ sporophyte เริ่มแตกออกจาก gametophyte ย้ายไปอาหาร MS ใส่ IAA 4 mg/L ร่วมกับ Kinetin 5 mg/L และ IBA 0.2 mg/L",
      ],
      evidence: {
        level: "adapted",
        sourceIds: ["source-bolbitis-costata-2010"],
        note:
          "ตัวเลขทั้งหมดมาจากงานที่ทำกับ Bolbitis costata สกุลเดียวกันแต่คนละชนิด ยืมมาที่ระดับสกุลเพราะไม่มีงานที่ใกล้ชิดกว่านี้",
      },
    },
  },
  sourceIds: ["source-bolbitis-costata-2010"],
};
