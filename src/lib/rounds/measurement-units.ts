/** หน่วยของช่องบันทึกถูกเก็บเป็นคำภาษาอังกฤษที่เป็นชื่อชนิดข้อมูล ไม่ใช่หน่วยที่คนอ่านออก
 *  ผลคือหน้าจอไทยขึ้นว่า "ความยาวชิ้นพืช (count)" หรือ "เวลาฟอกที่ใช้จริง (min)"
 *  แปลงตรงจุดแสดงผลจุดเดียว จะได้ไม่ต้องแก้ id หรือข้อมูลที่บันทึกไว้แล้ว */
const unitLabels: Record<string, string> = {
  count: "จำนวน",
  min: "นาที",
  minute: "นาที",
  hour: "ชั่วโมง",
  day: "วัน",
  week: "สัปดาห์",
  percent: "%",
};

export function measurementUnitLabel(unit: string): string {
  return unitLabels[unit] ?? unit;
}
