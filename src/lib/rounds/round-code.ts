/** โปรโตคอลสั่งให้ "เขียนวันที่และรหัสรอบบนกระปุก" ตั้งแต่ขั้นแรก แต่ระบบไม่เคยแสดงรหัสรอบที่ไหนเลย
 *  ผู้ใช้จึงไม่มีทางรู้ว่าต้องเขียนอะไร รหัสจริงคือ lotId ซึ่งซ่อนอยู่ใน URL เท่านั้น
 *
 *  ฟังก์ชันนี้ตัดคำนำหน้าที่เป็นรายละเอียดภายในออก เหลือส่วนที่สั้นพอเขียนด้วยปากกาบนฝากระปุกได้
 *  โดยยังชี้กลับไปที่รอบเดิมได้ตรงตัว */
export function roundCode(lotId: string): string {
  const trimmed = lotId.replace(/^round-/, "").replace(/^trial-/, "");
  return trimmed.toUpperCase();
}

/** ชื่อที่ใช้แยกรอบในรายการ ต้องบอกได้ว่าเป็นแขนไหนของชุดทดลอง ไม่ใช่ชื่อพืชซ้ำกันทุกใบ */
export function roundDisplayName(title: string, armLabel?: string): string {
  return armLabel ? `${title} · ${armLabel}` : title;
}
