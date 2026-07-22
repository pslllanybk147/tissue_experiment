"use client";

import Link from "next/link";
import type { ReactNode } from "react";

type LabShellProps = {
  children: ReactNode;
  section: "Overview" | "Experiments";
  sessionLabel: "DEMO" | "FIREBASE";
  onSignOut: () => void;
};

export function LabShell({ children, section, sessionLabel, onSignOut }: LabShellProps) {
  return (
    <div className="lab-route-shell">
      <aside className="lab-route-sidebar">
        <Link className="lab-route-brand" href="/"><span>PL</span><strong>Philodendron Lab</strong></Link>
        <nav aria-label="Main navigation" className="lab-route-nav">
          <Link className={section === "Overview" ? "active" : ""} href="/">Overview</Link>
          <Link className={section === "Experiments" ? "active" : ""} href="/experiments">Experiments</Link>
        </nav>
        <div className="lab-route-session"><span className={`session-chip ${sessionLabel === "DEMO" ? "demo" : "authenticated"}`}>{sessionLabel}</span><button type="button" onClick={onSignOut}>ออก</button></div>
      </aside>
      <div className="lab-route-workspace">
        <header className="lab-route-topbar">
          <Link className="lab-route-mobile-brand" href="/">PL <span>Philodendron Lab</span></Link>
          <span className={`session-chip ${sessionLabel === "DEMO" ? "demo" : "authenticated"}`}>{sessionLabel}</span>
          <button className="mobile-sign-out" type="button" onClick={onSignOut}>ออก</button>
        </header>
        <main className="lab-route-main">{children}</main>
      </div>
    </div>
  );
}
