import type { GenusPack } from "./types";

/** สกุลที่ยังไม่มีงานตรงพันธุ์เลยสักชิ้น ค้นหลักฐานเต็มตาม newplant_protocol.md เมื่อ 7 สิงหาคม 2026
 *  บันทึกการค้นทั้ง 11 ช่องทางอยู่ใน docs/superpowers/evidence/2026-08-07-scindapsus.md
 *
 *  จุดสำคัญที่ทำให้ยืมข้อมูลจากสกุล Epipremnum ได้อย่างมีเหตุผล คือ `Epipremnum pictum`
 *  เป็นชื่อพ้องเก่าของ Scindapsus pictus (ยืนยันจาก POWO) จึงใกล้ชิดทางอนุกรมวิธานกว่า
 *  สกุลอื่นในวงศ์เดียวกันทั่วไป ใช้ทรงเดียวกับ Philodendron/Monstera/Epipremnum
 *  (เถาเลื้อยเห็นข้อชัด) จึงไม่ต้องเขียนเรื่องข้อกับตาข้างซ้ำ */
export const scindapsus: GenusPack = {
  id: "scindapsus",
  growthFormId: "climbing-vine-visible-node",
  scientificName: "Scindapsus",
  commonNames: ["พลูเงิน", "สคินแดปซัส"],
  deviations: {
    "select-explant": {
      summary: "เลือกข้อที่มีตาข้างจากท่อนเถาที่ยังไม่แก่จัด เหมือนวิธีเลือกของ Epipremnum",
      why:
        "ยังไม่มีงานที่ทำกับ Scindapsus pictus โดยตรง แต่ Epipremnum pictum เคยเป็นชื่อพ้องเก่า " +
        "ของพันธุ์นี้ จึงยืมหลักการเลือกชิ้นส่วนจากงานที่ทำกับ Epipremnum aureum ได้",
      evidence: {
        level: "adapted",
        sourceIds: ["source-epipremnum-organogenesis", "source-miller-murashige-1976"],
        note:
          "งาน Epipremnum aureum ใช้ single nodal segment พร้อมตาข้างหนึ่งตา " +
          "งานปี 1976 ของ Miller & Murashige ใช้ตาข้าง (lateral bud) กับ Scindapsus aureus โดยตรง " +
          "ซึ่งเป็นสกุลเดียวกัน (ปัจจุบันจัดใหม่เป็น Epipremnum aureum) ทั้งสองแหล่งชี้ทางเดียวกัน " +
          "แต่เป็นระดับประยุกต์ ไม่ใช่ตรงพันธุ์ เพราะไม่มีงานที่ทำกับ pictus โดยตรง",
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
          "ยืมเส้นทางฟอกเดียวกับสกุล Epipremnum ทั้งหมด ด้วยเหตุผลความใกล้ชิดทางอนุกรมวิธานเดียวกับขั้นเลือกชิ้นส่วน " +
          "ยังไม่มีงานของ Scindapsus pictus โดยตรงมายืนยันความเข้มข้นหรือเวลาที่เหมาะกับพันธุ์นี้เอง",
      },
    },
    multiply: {
      summary: "เลี้ยงบนอาหาร MS มาตรฐาน ไม่ต้องใส่ฮอร์โมนความเข้มข้นสูง",
      why:
        "งานคลาสสิกปี 1976 รายงานว่า Scindapsus aureus เพิ่มจำนวนได้ดีบนอาหาร MS พื้นฐานที่เติม " +
        "inositol และ thiamine เท่านั้น โดยไม่ต้องพึ่งไซโตไคนินเข้มข้น",
      actions: [
        "เตรียมอาหาร MS ใส่ sucrose 30 g/L, myo-inositol 100 mg/L, thiamine·HCl 0.4 mg/L",
        "ย้ายชิ้นที่รอดจากขั้นตั้งต้นลงอาหารนี้",
      ],
      evidence: {
        level: "adapted",
        sourceIds: ["source-miller-murashige-1976"],
        note:
          "งานปี 1976 ทำกับ Scindapsus aureus (สกุลเดียวกัน ไม่ใช่ pictus) รายงานอัตราเพิ่มจำนวนสูงมาก " +
          "แต่เข้าถึงได้แค่บทคัดย่อ/สรุปทุติยภูมิ ยังตรวจไม่ได้ว่าใช้ n เท่าไรต่อทรีตเมนต์และมีกลุ่มควบคุม " +
          "ที่ไม่ใส่สารอะไรเลยหรือไม่ ตามเกณฑ์ข้อห้าและข้อหกของ newplant_protocol.md " +
          "จึงเป็นระดับประยุกต์ที่มีข้อจำกัดด้านความเข้มงวดทางสถิติกำกับไว้ ไม่ใช่ตัวเลขที่ยืนยันแน่นอน",
      },
    },
    root: {
      summary: "ใช้อาหาร MS ที่ใส่ NAA ร่วมกับ IAA และมันฝรั่งบด",
      why: "สิทธิบัตรจีนรายงานอัตราออกรากสูงมากด้วยสูตรนี้กับ Scindapsus aureus สกุลเดียวกัน",
      actions: ["เตรียมอาหาร MS ใส่ NAA, IAA, มันฝรั่งบด, ซูโครส และวุ้นตามอัตราส่วนของสิทธิบัตร"],
      evidence: {
        level: "adapted",
        sourceIds: ["source-scindapsus-aureus-rooting-patent-cn"],
        note:
          "มาจากสิทธิบัตรวิธีการ (ไม่ใช่สิทธิบัตรพันธุ์) รายงานอัตราออกราก 96% ขึ้นไปกับ Scindapsus aureus " +
          "ตามเกณฑ์ข้อ 9 ของขั้นที่ 1 สิทธิบัตรให้ระดับหลักฐานได้ไม่เกิน `adapted` เพราะไม่ผ่าน peer review " +
          "และยังไม่มีความเข้มข้นที่ระบุแยกเป็นตัวเลข mg/L หรือ mM ชัดเจนพอจะเขียนเป็นสูตรที่ทำตามได้ตรง ๆ " +
          "ต้องดึงเอกสารสิทธิบัตรฉบับเต็มมาอ่านตัวเลขก่อนเผยแพร่จริง",
      },
    },
  },
  sourceIds: [
    "source-powo-scindapsus-pictus",
    "source-epipremnum-organogenesis",
    "source-epipremnum-syngonium-invitro",
    "source-miller-murashige-1976",
    "source-scindapsus-aureus-rooting-patent-cn",
  ],
};
