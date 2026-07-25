"use client";

import Link from "next/link";
import type { ReactNode } from "react";

type LabShellProps = {
  children: ReactNode;
  section: LabSection;
  sessionLabel: "DEMO" | "FIREBASE";
  onSignOut: () => void;
};

export type LabSection = "Overview" | "Plants" | "Protocols" | "Experiments" | "Research" | "Knowledge" | "Image review";

const destinations: { label: LabSection; text: string; href: string }[] = [
  { label: "Overview", text: "เริ่มต้น", href: "/" },
  { label: "Plants", text: "ต้นไม้ของฉัน", href: "/plants" },
  { label: "Experiments", text: "การทดลอง", href: "/experiments" },
  { label: "Protocols", text: "คู่มือและ Protocol", href: "/protocols" },
  { label: "Knowledge", text: "คลังความรู้", href: "/knowledge" },
  { label: "Research", text: "ตรวจงานวิจัย", href: "/research" },
  { label: "Image review", text: "ตรวจรูปภาพ", href: "/dataset-review" },
];

export function LabShell({ children, section, sessionLabel, onSignOut }: LabShellProps) {
  return (
    <div className="lab-route-shell">
      <aside className="lab-route-sidebar">
        <Link className="lab-route-brand" href="/"><span>PL</span><strong>Philodendron Lab</strong></Link>
        <nav aria-label="เมนูหลัก" className="lab-route-nav">
          {destinations.map((item) => <Link aria-current={section === item.label ? "page" : undefined} className={section === item.label ? "active" : ""} href={item.href} key={item.href}>{item.text}</Link>)}
        </nav>
        <div className="lab-route-session"><span className={`session-chip ${sessionLabel === "DEMO" ? "demo" : "authenticated"}`}>{sessionLabel}</span><button type="button" onClick={onSignOut}>ออก</button></div>
      </aside>
      <div className="lab-route-workspace">
        <header className="lab-route-topbar">
          <Link className="lab-route-mobile-brand" href="/">PL <span>Philodendron Lab</span></Link>
          <span className={`session-chip ${sessionLabel === "DEMO" ? "demo" : "authenticated"}`}>{sessionLabel}</span>
          <button className="mobile-sign-out" type="button" onClick={onSignOut}>ออก</button>
        </header>
        <nav aria-label="Mobile navigation" className="lab-route-mobile-nav">
          {destinations.map((item) => <Link aria-current={section === item.label ? "page" : undefined} className={section === item.label ? "active" : ""} href={item.href} key={item.href}>{item.text}</Link>)}
        </nav>
        <main className="lab-route-main">{children}</main>
      </div>
    </div>
  );
}
