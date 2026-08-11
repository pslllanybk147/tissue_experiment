import Link from "next/link";
import type { ReactNode } from "react";

export type AppShellProps = {
  navigation: ReactNode;
  utility?: ReactNode;
  mobileNavigation: ReactNode;
  children: ReactNode;
};

export function AppShell({ navigation, utility, mobileNavigation, children }: AppShellProps) {
  return (
    <div className="cl-app-shell cl-atlas-shell">
      <a className="cl-skip-link" href="#main-content">ข้ามไปเนื้อหาหลัก</a>
      <header className="cl-topbar">
        <Link className="cl-brand" href="/" aria-label="Plantlover Lab หน้าแรก">
          <span aria-hidden="true">PL</span>
          <strong>Plantlover Lab</strong>
        </Link>
        <div className="cl-topbar-navigation">{navigation}</div>
        {utility ? <div className="cl-topbar-utility">{utility}</div> : null}
      </header>
      <main id="main-content" className="cl-main cl-atlas-wide">{children}</main>
      <div className="cl-mobile-nav">{mobileNavigation}</div>
    </div>
  );
}
