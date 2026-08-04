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

function CalculatorIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <rect x="5" y="3" width="14" height="18" rx="2" />
      <path d="M8 7h8M8 11h.01M12 11h.01M16 11h.01M8 15h.01M12 15h.01M16 15h.01" strokeLinecap="round" />
    </svg>
  );
}

const linkIcons: Record<string, () => React.JSX.Element> = {
  home: HomeIcon,
  equipment: EquipmentIcon,
};

export function PrimaryNav() {
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
              className="pl-nav-item"
              aria-current={active ? "page" : undefined}
            >
              <Icon />
              <span>{item.label}</span>
            </Link>
          );
        })}
        <button
          type="button"
          className="pl-nav-item"
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
      <nav className="pl-nav-desktop" aria-label="เมนูหลัก">
        {renderItems()}
      </nav>
      <nav className="pl-nav-mobile" aria-label="เมนูหลัก">
        {renderItems()}
      </nav>
    </>
  );
}
