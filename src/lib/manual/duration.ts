/** ทุกขั้นมี durationMinutes อยู่แล้วในข้อมูล (core-steps.ts) แต่ไม่เคยถูกแสดงที่ไหนเลยในหน้าเว็บ
 *  ผู้ใช้จึงไม่มีทางรู้ "นานแค่ไหน" จากหน้าขั้นตอนโดยตรง ต้องเดาหรือไปเจอในย่อหน้าหลักฐานเอาเอง
 *  ฟังก์ชันนี้แปลงเป็นข้อความอ่านง่าย ให้แสดงติดกับหัวขั้นทุกที่ */
export function formatDurationMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes} นาที`;
  if (minutes % 1440 === 0) {
    const days = minutes / 1440;
    return `${days} วัน`;
  }
  if (minutes % 60 === 0) {
    const hours = minutes / 60;
    return `${hours} ชั่วโมง`;
  }
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return `${hours} ชั่วโมง ${rest} นาที`;
}
