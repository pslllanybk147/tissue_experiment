import type { GenusPack } from "./types";

export const alocasia: GenusPack = {
  id: "alocasia",
  growthFormId: "rosette-sheathed-node",
  scientificName: "Alocasia",
  commonNames: ["อโลคาเซีย", "บอนกระดาด", "หูช้าง"],
  deviations: {
    sterilize: {
      actions: [
        "แช่สารละลายโซเดียมไฮโปคลอไรต์ที่ความเข้มข้นสุดท้าย 3.0% v/v นาน 20 นาที",
        "ล้างด้วยน้ำปลอดเชื้อสามครั้ง ครั้งละไม่น้อยกว่า 2 นาที",
      ],
      safetyNotes: [
        "ทุกชนิดในวงศ์ Araceae มีผลึกแคลเซียมออกซาเลตรูปเข็มที่ระคายเคืองผิวและเยื่อบุ ต้องใส่ถุงมือและแว่นตา",
      ],
      evidence: {
        level: "adapted",
        sourceIds: ["source-alocasia-commercial"],
        note:
          "ตัวเลขมาจากเอกสารการผลิตเชิงพาณิชย์ของ Alocasia ซึ่งไม่ใช่งานที่ผ่านการทบทวน " +
          "และไม่ระบุว่าทดสอบกับชนิดใดบ้างในสกุล ความเข้มข้น 3.0% สูงกว่าช่วงปกติของ Araceae มาก " +
          "ถ้าชิ้นพืชซีดหรือเปื่อย ให้ลดลงก่อน อย่าเพิ่ม",
      },
    },
  },
  sourceIds: ["source-alocasia-commercial"],
};
