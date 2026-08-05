import type { GenusPack } from "./types";

/** สกุลที่มีหลักฐานดีที่สุดในบรรดาเถาเลื้อยทั้งหมด เพราะงานที่พบเริ่มจากต้นแม่จริง
 *  ไม่ใช่จากเนื้อเยื่อที่ปลอดเชื้ออยู่ก่อน จึงครอบขั้นตัดและฟอกด้วย */
export const monstera: GenusPack = {
  id: "monstera",
  growthFormId: "climbing-vine-visible-node",
  scientificName: "Monstera",
  commonNames: ["มอนสเตอร่า", "พลูฉีก", "มอนสเตอร่า ไทยคอนส์"],
  deviations: {
    cut: {
      actions: [
        "ตัดให้ได้ชิ้นข้อยาว 8 ถึง 10 มม. โดยให้ตาข้างอยู่กลางชิ้น",
        "ปล้องของสกุลนี้ยาวกว่าฟิโลเดนดรอน อย่าตัดยาวตามปล้อง ให้ตัดสั้นตามขนาดข้างบนแทน",
      ],
      evidence: {
        level: "adapted",
        sourceIds: ["source-monstera-thai-constellation"],
        note:
          "ขนาดชิ้น 0.8 ถึง 1.0 ซม. มาจากงานที่ทำกับ Monstera deliciosa 'Thai Constellation' พันธุ์เดียว " +
          "ไม่ใช่ทั้งสกุล จึงเป็นค่าประยุกต์ระดับสกุล ถ้าคุณเพาะพันธุ์นี้พอดี ให้ถือว่าตรงพันธุ์",
      },
    },
    sterilize: {
      actions: [
        "จุ่มแอลกอฮอล์ 70% นาน 90 วินาที",
        "แช่สารละลายโซเดียมไฮโปคลอไรต์ที่ความเข้มข้นสุดท้าย 1.0% v/v นาน 10 นาที คนเบา ๆ ตลอด",
        "ล้างด้วยน้ำปลอดเชื้อสามครั้ง ครั้งละไม่น้อยกว่า 2 นาที",
      ],
      evidence: {
        level: "adapted",
        sourceIds: ["source-monstera-thai-constellation", "source-monstera-sterilization"],
        note:
          "ตัวเลขมาจากงานที่ทำกับ Monstera deliciosa 'Thai Constellation' และงานปรับสูตรฟอกของ M. deliciosa " +
          "ไม่ใช่ทั้งสกุล งานที่สองใช้การไล่ความเข้มข้นลงเป็นขั้น (10% แล้ว 5% แล้ว 2%) ซึ่งได้ชิ้นรอด 80.5% " +
          "และเกิดสีน้ำตาลน้อย ถ้าชิ้นของคุณดำเร็ว ให้ลองแบบไล่ขั้นแทนการแช่รอบเดียว",
      },
    },
  },
  sourceIds: ["source-monstera-thai-constellation", "source-monstera-sterilization"],
};
