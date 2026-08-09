export type NavItem = {
  key: string;
  label: string;
  href: string;
};

/** รายการนี้แสดงทั้งบนแถบเมนูด้านบนและ bottom tab bar บนมือถือ
 *  จึงต้องให้ผู้ใช้เข้าถึงรอบเพาะของตัวเองได้โดยตรงจากทุกหน้า */
export const navLinkItems: NavItem[] = [
  { key: "home", label: "หน้าแรก", href: "/" },
  { key: "rounds", label: "รอบเพาะ", href: "/my/rounds" },
  { key: "problem", label: "แก้ปัญหา", href: "/problem" },
  { key: "equipment", label: "อุปกรณ์ของฉัน", href: "/my/equipment" },
];
