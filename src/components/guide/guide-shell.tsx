import Link from "next/link";
import type { ReactNode } from "react";
import { CalculatorOverlay } from "@/components/calculators/calculator-overlay";
import { CalculatorOverlayProvider } from "@/components/nav/calculator-overlay-context";
import { PrimaryNav } from "@/components/nav/primary-nav";

export function GuideShell({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <CalculatorOverlayProvider>
      <div className="pl-root">
        <a className="pl-skip" href="#pl-main">ข้ามไปเนื้อหาหลัก</a>
        <div className="pl-wrap">
          <header className="pl-bar">
            <Link className="pl-brand pl-link" href="/">Plantlover Lab</Link>
            <PrimaryNav />
            <span className="pl-bar-spacer" />
            {/* อยู่นอก PrimaryNav ตั้งใจ เพราะ bottom tab bar บนจอ 360px รับได้แค่สี่ช่อง
                (สามรายการใน navLinkItems บวกปุ่มเครื่องคำนวณ) เพิ่มอีกไม่ได้ ดู nav-items.test.ts
                ส่วนแถบบนของ pl-bar ไม่ถูกจำกัดแบบนั้นและแสดงทุกขนาดจอ จึงใส่ที่นี่แทน */}
            <Link className="pl-link" href="/substances" style={{ fontSize: "13px", fontWeight: 600 }}>
              คลังสาร
            </Link>
            {action}
          </header>
          <main id="pl-main">{children}</main>
        </div>
        <CalculatorOverlay />
      </div>
    </CalculatorOverlayProvider>
  );
}
