/** ตรรกะของเครื่องมือปักหมุด แยกออกจาก React เพื่อให้เทสต์ได้
 *  โปรเจกต์นี้ไม่มี jsdom เทสต์คลิกจริงไม่ได้ ตรรกะที่พลาดแล้วเงียบจึงต้องอยู่ตรงนี้ */

export type Picked = { landmarkId: string; x: number; y: number };

/** แปลงพิกัดพิกเซลบนภาพเป็นสัดส่วน 0 ถึง 1 ปัดสามตำแหน่ง
 *  เก็บเป็นสัดส่วนเพราะภาพย่อขยายตามความกว้างจอ หมุดจึงต้องไม่ผูกกับพิกเซล */
export function toFraction(offset: number, size: number): number {
  if (size <= 0) return 0;
  return Number((offset / size).toFixed(3));
}

/** เพิ่มหมุดถัดไปตามลำดับจุดสังเกตของทรงนั้น
 *
 *  ต้องรับ current เข้ามาเป็นอาร์กิวเมนต์ ไม่ใช่อ่านจาก state ใน closure
 *  เพราะสองคลิกที่เกิดในจังหวะเดียวกัน (ดับเบิลคลิก หรือแตะรัวบนมือถือ)
 *  จะเห็น state ชุดเดียวกันทั้งคู่ แล้วปักทับจุดเดิม ทำให้หมุดหายไปหนึ่งจุด
 *  และจุดที่เหลือถูกผูกกับ landmark ผิดตัวโดยไม่มีอะไรฟ้อง
 *
 *  คืนอาร์เรย์เดิมเมื่อปักครบแล้ว เพื่อให้ React ข้าม render ที่ไม่จำเป็น */
export function appendPin(
  current: Picked[],
  landmarks: { id: string }[],
  x: number,
  y: number,
): Picked[] {
  const next = landmarks[current.length];
  if (!next) return current;
  return [...current, { landmarkId: next.id, x, y }];
}

/** โค้ดที่ผู้ใช้คัดลอกไปวางในไฟล์ทรง */
export function pinSnippet(picked: Picked[]): string {
  return picked
    .map((item) => `// ${item.landmarkId}\n  point: { x: ${item.x}, y: ${item.y} },`)
    .join("\n");
}
