import { starterTaxa, type KnowledgeLibraryRecord } from "./knowledge-library";

/**
 * รายการตั้งต้นของคลังหลังบ้านมีแต่รายชื่อ taxon เท่านั้น ไม่ seed claim หรือ playbook
 *
 * เดิมระบบ seed claim จาก monograph ซึ่งทำให้มีข้อมูลหลักฐานสองชุดที่ไม่ตรงกัน
 * และชุดที่ seed ไว้ไม่ถูกกฎใด ๆ คุม ต่างจาก `src/lib/manual/` ที่มีเทสต์บังคับว่า
 * ข้ออ้างที่บอกว่ามีงานรองรับต้องระบุแหล่ง และข้ออ้างที่บอกว่าไม่มีต้องบันทึกการค้น
 *
 * ตอนนี้หลักฐานของคู่มือมีที่เดียวคือ `src/lib/manual/` ส่วนคลังหลังบ้านใช้เก็บ
 * แหล่งอ้างอิงและ claim ที่ผู้ใช้ลงทะเบียนเองแล้วรอเจ้าของระบบอนุมัติ
 */
export function starterKnowledgeRecords(): KnowledgeLibraryRecord[] {
  return starterTaxa.map((taxon) => ({ taxon, claims: [], playbooks: [] }));
}

export function hydrateKnowledgeRecord(record: KnowledgeLibraryRecord): KnowledgeLibraryRecord {
  return record;
}
