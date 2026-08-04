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
            {action}
          </header>
          <main id="pl-main">{children}</main>
        </div>
        <CalculatorOverlay />
      </div>
    </CalculatorOverlayProvider>
  );
}
