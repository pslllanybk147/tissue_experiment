"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { AppShell } from "@/components/common/app-shell";

type LabShellProps = {
  children: ReactNode;
  section: LabSection;
  sessionLabel: "DEMO" | "FIREBASE";
  onSignOut: () => void;
};

export type LabSection = "Overview" | "Manual review" | "Research" | "Knowledge" | "Image review";

const destinations: { label: LabSection; text: string; href: string }[] = [
  { label: "Overview", text: "เริ่มต้น", href: "/my" },
  { label: "Manual review", text: "ตรวจคู่มือ", href: "/admin/manual" },
  { label: "Knowledge", text: "คลังความรู้", href: "/admin/knowledge" },
  { label: "Research", text: "ตรวจงานวิจัย", href: "/admin/research" },
  { label: "Image review", text: "ตรวจรูปภาพ", href: "/admin/dataset-review" },
];

export function LabShell({ children, section, sessionLabel, onSignOut }: LabShellProps) {
  const navigation = (
    <nav aria-label="เมนูหลัก" className="cl-lab-navigation">
      {destinations.map((item) => <Link aria-current={section === item.label ? "page" : undefined} className={section === item.label ? "active" : ""} href={item.href} key={item.href}>{item.text}</Link>)}
    </nav>
  );
  const mobileNavigation = (
    <nav aria-label="Mobile navigation" className="cl-lab-mobile-navigation">
      {destinations.map((item) => <Link aria-current={section === item.label ? "page" : undefined} className={section === item.label ? "active" : ""} href={item.href} key={item.href}>{item.text}</Link>)}
    </nav>
  );
  return (
    <AppShell
      navigation={navigation}
      mobileNavigation={mobileNavigation}
      utility={(
        <div className="cl-session-actions">
          <span className={`session-chip ${sessionLabel === "DEMO" ? "demo" : "authenticated"}`}>{sessionLabel}</span>
          <button className="mobile-sign-out" type="button" onClick={onSignOut}>ออกจากระบบ</button>
        </div>
      )}
    >
      <div className="lab-route-main">{children}</div>
    </AppShell>
  );
}
