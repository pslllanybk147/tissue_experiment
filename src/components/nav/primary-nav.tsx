"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCalculatorOverlay } from "./calculator-overlay-context";
import { navLinkItems } from "./nav-items";

function HomeIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M4 11.5 12 4l8 7.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6 10v9h12v-9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function EquipmentIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M9 3v5L4 17a2 2 0 0 0 2 3h12a2 2 0 0 0 2-3l-5-9V3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 3h6" strokeLinecap="round" />
    </svg>
  );
}

function RoundsIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M7 4h10M8 4v3l-2 3v8a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-8l-2-3V4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7 10h10M9 14h6" strokeLinecap="round" />
    </svg>
  );
}

function ProblemIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M12 4 2.8 19.5h18.4L12 4Z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 10v4" strokeLinecap="round" />
      <path d="M12 17h.01" strokeLinecap="round" />
    </svg>
  );
}

function CalculatorIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <rect x="5" y="3" width="14" height="18" rx="2" />
      <path d="M8 7h8M8 11h.01M12 11h.01M16 11h.01M8 15h.01M12 15h.01M16 15h.01" strokeLinecap="round" />
    </svg>
  );
}

/** ทุก key ใน navLinkItems ต้องมีไอคอนที่นี่ ไม่งั้น React จะเรนเดอร์ undefined
 *  แล้วพังทั้งหน้าโดยไม่มีอะไรบอกว่าเพราะอะไร มีเทสต์บังคับใน nav-items.test.ts */
export const linkIcons: Record<string, () => React.JSX.Element> = {
  home: HomeIcon,
  rounds: RoundsIcon,
  problem: ProblemIcon,
  equipment: EquipmentIcon,
};

export function PrimaryNav({ variant = "both" }: { variant?: "desktop" | "mobile" | "both" }) {
  const pathname = usePathname();
  const { state, open } = useCalculatorOverlay();

  function renderItems() {
    return (
      <>
        {navLinkItems.map((item) => {
          const Icon = linkIcons[item.key];
          const active = pathname === item.href;
          return (
            <Link
              key={item.key}
              href={item.href}
              className="cl-primary-nav-item pl-nav-item"
              aria-current={active ? "page" : undefined}
            >
              <Icon />
              <span>{item.label}</span>
            </Link>
          );
        })}
        <button
          type="button"
          className="cl-primary-nav-item pl-nav-item"
          aria-current={state.isOpen ? "page" : undefined}
          onClick={open}
        >
          <CalculatorIcon />
          <span>เครื่องคำนวณ</span>
        </button>
      </>
    );
  }

  return (
    <>
      {variant !== "mobile" ? <nav className="cl-primary-nav-desktop pl-nav-desktop" aria-label="เมนูหลัก">{renderItems()}</nav> : null}
      {variant !== "desktop" ? <nav className="cl-primary-nav-mobile pl-nav-mobile" aria-label="เมนูหลักสำหรับมือถือ">{renderItems()}</nav> : null}
    </>
  );
}
