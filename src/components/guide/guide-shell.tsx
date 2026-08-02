import Link from "next/link";
import type { ReactNode } from "react";

export function GuideShell({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="pl-root">
      <a className="pl-skip" href="#pl-main">ข้ามไปเนื้อหาหลัก</a>
      <div className="pl-wrap">
        <header className="pl-bar">
          <Link className="pl-brand pl-link" href="/">Plantlover Lab</Link>
          <span className="pl-bar-spacer" />
          {action}
        </header>
        <main id="pl-main">{children}</main>
      </div>
    </div>
  );
}
