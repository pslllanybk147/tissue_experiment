export type AntiBrowningOption = {
  id: string;
  name: string;
  lowPerLiter: number;
  highPerLiter: number;
  unit: "mg/L" | "g/L";
  use: string;
  note: string;
};

/**
 * ช่วงค่าที่ระบบเดิมอ้างไว้สำหรับอาการ phenolic browning
 * เป็นช่วงจากงานต่างชนิดพืช ไม่ใช่สูตรที่ยืนยันตรงกับ Violin จึงแสดงเป็น
 * ทางเลือกทดลองและไม่แอบใส่ลงในสูตรอาหารหลัก
 */
export const antiBrowningOptions: AntiBrowningOption[] = [
  {
    id: "ascorbic-acid",
    name: "กรดแอสคอร์บิก (วิตามินซี)",
    lowPerLiter: 20,
    highPerLiter: 100,
    unit: "mg/L",
    use: "สารละลายจุ่มสั้น ๆ หลังล้างสารฟอก ก่อนวางลงอาหาร",
    note: "เริ่มจากค่าต่ำ; ยังไม่มีเวลาแช่และค่าที่ทดสอบตรงกับ Violin",
  },
  {
    id: "citric-acid",
    name: "กรดซิตริก",
    lowPerLiter: 10,
    highPerLiter: 100,
    unit: "mg/L",
    use: "ใช้ร่วมกับวิตามินซีในสารละลายจุ่ม",
    note: "เป็นกรด ห้ามให้สัมผัสสารฟอกที่ยังค้าง เพราะอาจเกิดแก๊สคลอรีน",
  },
  {
    id: "activated-charcoal",
    name: "ผงถ่านกัมมันต์",
    lowPerLiter: 0.5,
    highPerLiter: 2,
    unit: "g/L",
    use: "ผสมลงในอาหารก่อนเท",
    note: "อาจดูดซับฮอร์โมนและทำให้ผลสูตรเปลี่ยน จึงไม่ใส่เป็นค่าเริ่มต้นอัตโนมัติ",
  },
  {
    id: "pvp",
    name: "PVP",
    lowPerLiter: 0.2,
    highPerLiter: 0.5,
    unit: "g/L",
    use: "ผสมลงในอาหารก่อนเท",
    note: "เป็นทางเลือกแทนผงถ่าน ไม่ใช่ให้ใส่พร้อมกันโดยอัตโนมัติ",
  },
];

export function batchRange(option: AntiBrowningOption, volumeMl: number): [number, number] {
  const litres = volumeMl / 1000;
  return [option.lowPerLiter * litres, option.highPerLiter * litres];
}
