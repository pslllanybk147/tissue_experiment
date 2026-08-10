import Link from "next/link";
import type { ReactNode } from "react";
import { CalculatorOverlay } from "@/components/calculators/calculator-overlay";
import { AppShell } from "@/components/common/app-shell";
import { CalculatorOverlayProvider } from "@/components/nav/calculator-overlay-context";
import { PrimaryNav } from "@/components/nav/primary-nav";

export function GuideShell({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <CalculatorOverlayProvider>
      <div className="pl-root">
        <AppShell
          navigation={<PrimaryNav variant="desktop" />}
          mobileNavigation={<PrimaryNav variant="mobile" />}
          utility={(
            <>
              <Link className="pl-link cl-utility-link" href="/substances">
              คลังสาร
              </Link>
              {action}
            </>
          )}
        >
          <div className="pl-wrap">{children}</div>
        </AppShell>
        <CalculatorOverlay />
      </div>
    </CalculatorOverlayProvider>
  );
}
