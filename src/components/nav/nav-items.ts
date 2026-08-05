export type NavItem = {
  key: string;
  label: string;
  href: string;
};

/** สี่ช่องคือขีดจำกัดของ bottom tab bar บนจอ 360px (รวมปุ่มเครื่องคำนวณที่ไม่ได้อยู่ในลิสต์นี้)
 *  "รอบเพาะของฉัน" ถูกสลับออกไปให้ "แก้ปัญหา" เพราะคนที่ขวดมีปัญหาต้องเข้าถึงเร็วที่สุด
 *  ส่วนรอบเพาะเข้าจากปุ่ม "เริ่มรอบเพาะของฉัน" ท้ายหน้าคู่มือแทน */
export const navLinkItems: NavItem[] = [
  { key: "home", label: "หน้าแรก", href: "/" },
  { key: "problem", label: "แก้ปัญหา", href: "/problem" },
  { key: "equipment", label: "อุปกรณ์ของฉัน", href: "/my/equipment" },
];
