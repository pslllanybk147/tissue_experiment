export type NavItem = {
  key: string;
  label: string;
  href: string;
};

export const navLinkItems: NavItem[] = [
  { key: "home", label: "หน้าแรก", href: "/" },
  { key: "rounds", label: "รอบเพาะของฉัน", href: "/my/rounds" },
  { key: "equipment", label: "อุปกรณ์ของฉัน", href: "/my/equipment" },
];
