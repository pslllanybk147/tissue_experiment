"use client";

import { useEffect, useMemo, useState } from "react";
import { AuthGate } from "@/components/auth/auth-gate";
import { useAuth } from "@/components/auth/auth-provider";
import type { EvidenceState, ExperimentLot } from "@/lib/domain/models";
import { lotAgeDays } from "@/lib/domain/experiment-query";
import { createFirestoreLabRepository } from "@/lib/firebase/firestore-lab-repository";
import { createDemoLabRepository, createDemoSnapshot } from "@/lib/repositories/demo-lab-repository";

const initialSnapshot = createDemoSnapshot("demo-owner");

function formatStartedAt(value: string) {
  return new Intl.DateTimeFormat("th-TH", { dateStyle: "medium" }).format(new Date(`${value}T00:00:00`));
}

const protocolSteps = [
  { number: "01", title: "เตรียมระบบปลอดเชื้อ", meta: "อุปกรณ์ · blank control", state: "done" },
  { number: "02", title: "เลือกและบันทึกต้นแม่", meta: "Plant profile · รูปถ่าย", state: "done" },
  { number: "03", title: "เตรียมอาหารตั้งต้น", meta: "MS · BAP · NAA · pH", state: "active" },
  { number: "04", title: "ฟอก nodal explant", meta: "Ethanol · NaOCl · rinse", state: "next" },
  { number: "05", title: "ลงอาหารและเริ่ม Lot", meta: "หนึ่งข้อ / หนึ่งกระปุก", state: "next" },
  { number: "06", title: "ตรวจและบันทึกผล", meta: "วันที่ 3 · 7 · 14", state: "next" },
];

function Badge({ children }: { children: EvidenceState | ExperimentLot["status"] }) {
  const tone = children.toLowerCase().replaceAll(" ", "-");
  return <span className={`badge badge-${tone}`}>{children}</span>;
}

function Icon({ name }: { name: "grid" | "leaf" | "flask" | "book" | "search" | "plus" | "arrow" | "check" | "camera" }) {
  const paths: Record<string, string> = {
    grid: "M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z",
    leaf: "M20 4C11 4 5 8 5 15c0 2.8 2.2 5 5 5 7 0 10-7 10-16ZM5 20c3-5 7-8 12-10",
    flask: "M9 3h6M10 3v6l-5.4 9.1A2 2 0 0 0 6.3 21h11.4a2 2 0 0 0 1.7-2.9L14 9V3M8 15h8",
    book: "M5 4.5A2.5 2.5 0 0 1 7.5 2H20v17H7.5A2.5 2.5 0 0 0 5 21.5v-17ZM5 4.5v17M8 6h8M8 10h8",
    search: "m21 21-4.4-4.4M10.8 18a7.2 7.2 0 1 1 0-14.4 7.2 7.2 0 0 1 0 14.4Z",
    plus: "M12 5v14M5 12h14",
    arrow: "M5 12h14m-6-6 6 6-6 6",
    check: "m5 12 4 4L19 6",
    camera: "M4 7h3l1.5-2h7L17 7h3v11H4V7Zm8 3.2a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z",
  };
  return <svg aria-hidden="true" className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d={paths[name]} /></svg>;
}

export default function Home() {
  const { session, signOut } = useAuth();
  const ownerId = session.user?.uid ?? "demo-owner";
  const repository = useMemo(
    () => session.status === "authenticated" ? createFirestoreLabRepository(ownerId) : createDemoLabRepository(),
    [ownerId, session.status],
  );
  const [activeNav, setActiveNav] = useState("Overview");
  const [lots, setLots] = useState(initialSnapshot.lots);
  const [research, setResearch] = useState(initialSnapshot.research);
  const [activeStep, setActiveStep] = useState(initialSnapshot.protocol.activeStepIndex);
  const [selectedLot, setSelectedLot] = useState(initialSnapshot.lots[0].id);
  const [showNewLot, setShowNewLot] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    if (session.status !== "authenticated" && session.status !== "demo") return;
    let active = true;
    repository.getSnapshot(ownerId).then((snapshot) => {
      if (!active) return;
      setLots(snapshot.lots);
      setResearch(snapshot.research);
      setActiveStep(snapshot.protocol.activeStepIndex);
      setSelectedLot((current) => snapshot.lots.some((lot) => lot.id === current) ? current : snapshot.lots[0]?.id ?? "");
    }).catch(() => active && setNotice("ไม่สามารถโหลด Firestore workspace ได้"));
    return () => { active = false; };
  }, [ownerId, repository, session.status]);

  const selected = useMemo(() => lots.find((lot) => lot.id === selectedLot) ?? lots[0] ?? initialSnapshot.lots[0], [lots, selectedLot]);

  async function completeStep() {
    try {
      const protocol = await repository.completeProtocolStep(ownerId, "protocol-nodal-v01", activeStep);
      setActiveStep(protocol.activeStepIndex);
      setNotice(`บันทึกขั้นตอน ${String(protocol.activeStepIndex + 1).padStart(2, "0")} แล้ว`);
    } catch {
      setNotice("บันทึกขั้นตอนไม่สำเร็จ กรุณาตรวจ Firebase connection");
    }
    window.setTimeout(() => setNotice(""), 2600);
  }

  return (
    <AuthGate><main className="app-shell">
      <aside className="sidebar">
        <div className="brand-lockup">
          <div className="brand-mark"><span>PL</span></div>
          <div><p className="brand-name">Philodendron Lab</p><p className="brand-caption">evidence workspace</p></div>
        </div>

        <div className="project-switcher">
          <span className="eyebrow">PROJECT</span>
          <div className="project-row"><span className="project-dot" /><span>Variegated Philodendron</span><span className="chevron">⌄</span></div>
        </div>

        <nav className="nav-list" aria-label="Main navigation">
          {[{ label: "Overview", icon: "grid" as const }, { label: "Protocols", icon: "book" as const }, { label: "Experiments", icon: "flask" as const }, { label: "Plants", icon: "leaf" as const }].map((item) => (
            <button key={item.label} className={`nav-item ${activeNav === item.label ? "nav-item-active" : ""}`} onClick={() => setActiveNav(item.label)}>
              <Icon name={item.icon} /><span>{item.label}</span>{item.label === "Experiments" && <span className="nav-count">3</span>}
            </button>
          ))}
        </nav>

        <div className="sidebar-divider" />
        <nav className="nav-list" aria-label="Research navigation">
          <button className={`nav-item ${activeNav === "Research" ? "nav-item-active" : ""}`} onClick={() => setActiveNav("Research")}><Icon name="book" /><span>Research library</span><span className="nav-count warm">3</span></button>
          <button className={`nav-item ${activeNav === "Review queue" ? "nav-item-active" : ""}`} onClick={() => setActiveNav("Review queue")}><span className="review-dot" /><span>Review queue</span><span className="nav-count warm">2</span></button>
        </nav>

        <div className="sidebar-footer"><div className="user-avatar">{session.user?.displayName?.slice(0, 1) ?? "O"}</div><div><p className="user-name">{session.user?.displayName ?? "Owner"}</p><p className="user-role">{session.status === "demo" ? "Demo · memory only" : "Owner · Firebase"}</p></div><button className="sign-out-button" onClick={() => void signOut()}>ออก</button></div>
      </aside>

      <section className="workspace">
        <header className="topbar">
          <div className="mobile-brand"><div className="brand-mark small"><span>PL</span></div><span>Philodendron Lab</span></div>
          <div className="breadcrumbs"><span>Project</span><span className="slash">/</span><strong>{activeNav}</strong></div>
          <div className="topbar-actions"><span className={`session-chip ${session.status}`}>{session.status === "demo" ? "DEMO" : "FIREBASE"}</span><label className="search-box"><Icon name="search" /><input placeholder="Search lots, protocols..." aria-label="Search" /></label><button className="icon-button mobile-only" aria-label="Search"><Icon name="search" /></button><button className="mobile-sign-out mobile-only" aria-label="ออกจากระบบ" onClick={() => void signOut()}>ออก</button><div className="online-dot" title="All systems operational" /></div>
        </header>

        <div className="content">
          <section className="page-intro"><div><p className="eyebrow">WEDNESDAY · 22 JULY 2026</p><h1>Good afternoon, Ohm.</h1><p className="intro-copy">Your lab is quiet today. Three lots are active and one step is ready for your review.</p></div><button className="primary-button" onClick={() => setShowNewLot(true)}><Icon name="plus" /> New experiment</button></section>

          {notice && <div className="toast" role="status"><span className="toast-check"><Icon name="check" /></span>{notice}</div>}

          <section className="hero-grid">
            <div className="hero-panel panel-accent">
              <div className="panel-kicker"><span className="pulse-dot" /> ACTIVE PROTOCOL</div>
              <div className="hero-copy"><div><h2>Nodal establishment</h2><p>Variegated Philodendron · v0.1</p></div><span className="progress-number">{String(activeStep + 1).padStart(2, "0")}<span>/06</span></span></div>
              <div className="progress-track"><span style={{ width: `${((activeStep + 1) / protocolSteps.length) * 100}%` }} /></div>
              <div className="hero-footer"><span>Next: {protocolSteps[activeStep]?.title}</span><div className="hero-actions"><button className="text-button" onClick={() => void completeStep()}>Complete step <Icon name="check" /></button><button className="text-button" onClick={() => setActiveNav("Protocols")}>Open protocol <Icon name="arrow" /></button></div></div>
            </div>
            <div className="metric-panel"><p className="eyebrow">ACTIVE LOTS</p><div className="metric-row"><span className="metric-value">{String(lots.length).padStart(2, "0")}</span><span className="metric-delta">owner scoped</span></div><div className="mini-bars"><span style={{ height: "42%" }} /><span style={{ height: "64%" }} /><span style={{ height: "55%" }} /><span style={{ height: "82%" }} /><span style={{ height: "72%" }} /><span className="bar-current" style={{ height: "100%" }} /></div><p className="metric-foot">Loaded from {session.status === "demo" ? "demo repository" : "Firestore"}</p></div>
            <div className="metric-panel warm-panel"><p className="eyebrow">REVIEW QUEUE</p><div className="metric-row"><span className="metric-value">02</span><span className="queue-mark">needs attention</span></div><p className="metric-foot">Research claims waiting for approval</p><button className="text-button warm-link" onClick={() => setActiveNav("Review queue")}>Review queue <Icon name="arrow" /></button></div>
          </section>

          <section className="section-grid">
            <div className="section-block lots-block"><div className="section-heading"><div><p className="eyebrow">LIVE WORK</p><h2>Experiment lots</h2></div><button className="quiet-button" onClick={() => setActiveNav("Experiments")}>View all <Icon name="arrow" /></button></div><div className="lot-list">{lots.map((lot) => <button key={lot.id} className={`lot-row ${selectedLot === lot.id ? "lot-row-selected" : ""}`} onClick={() => setSelectedLot(lot.id)}><span className={`lot-status status-${lot.status.toLowerCase().replace(" ", "-")}`} /><span className="lot-id">{lot.id}</span><span className="lot-plant">{lot.plant}</span><span className="lot-stage">{lot.stage}</span><span className="lot-day">D+{lotAgeDays(lot.startedAt)}</span><Badge>{lot.status}</Badge><span className="row-arrow">↗</span></button>)}</div></div>
            <div className="section-block next-block"><div className="section-heading"><div><p className="eyebrow">UP NEXT</p><h2>Protocol steps</h2></div><button className="quiet-button" onClick={() => setActiveNav("Protocols")}>Open <Icon name="arrow" /></button></div><div className="step-list">{protocolSteps.slice(0, 4).map((step, index) => <button key={step.number} className={`step-row ${index === activeStep ? "step-row-active" : ""}`} onClick={() => setActiveStep(index)}><span className={`step-index ${step.state}`} >{step.state === "done" ? <Icon name="check" /> : step.number}</span><span className="step-text"><strong>{step.title}</strong><small>{step.meta}</small></span>{index === activeStep && <span className="step-now">NOW</span>}</button>)}</div></div>
          </section>

          <section className="lower-grid">
            <div className="section-block research-block"><div className="section-heading"><div><p className="eyebrow">EVIDENCE BASE</p><h2>Research to review</h2></div><button className="quiet-button" onClick={() => setActiveNav("Research")}>Library <Icon name="arrow" /></button></div><div className="research-list">{research.map((item) => <div className="research-row" key={item.id}><div className="source-icon"><Icon name="book" /></div><div className="research-copy"><div className="research-title-row"><strong>{item.title}</strong><Badge>{item.evidence}</Badge></div><p>{item.source}</p><small>{item.note}</small></div></div>)}</div></div>
            <div className="section-block selected-block"><div className="section-heading"><div><p className="eyebrow">SELECTED LOT</p><h2>{selected.id}</h2></div><span className="selected-status"><span className="lot-status status-healthy" /> {selected.status}</span></div><div className="selected-profile"><div className="plant-placeholder"><Icon name="leaf" /><span>{selected.plant.slice(0, 2).toUpperCase()}</span></div><div><p className="selected-name">{selected.plant}</p><p className="selected-protocol">{selected.protocolTitle}</p><p className="selected-date">Started {formatStartedAt(selected.startedAt)} · Day {lotAgeDays(selected.startedAt)}</p></div></div><div className="selected-actions"><button className="secondary-button" onClick={() => setNotice("เปิดหน้าบันทึก observation ของ " + selected.id)}>Add observation</button><button className="square-button" aria-label="Add photo" onClick={() => setNotice("พร้อมอัปโหลดรูปสำหรับ " + selected.id)}><Icon name="camera" /></button></div></div>
          </section>

          <footer className="page-footer"><span><span className="footer-dot" /> Private workspace</span><span>Protocol data is evidence-labeled before publication.</span><span className="mono">v0.1 · local preview</span></footer>
        </div>
      </section>

      {showNewLot && <div className="modal-backdrop" role="presentation" onClick={() => setShowNewLot(false)}><div className="modal" role="dialog" aria-modal="true" aria-labelledby="new-lot-title" onClick={(event) => event.stopPropagation()}><div className="modal-header"><div><p className="eyebrow">NEW RECORD</p><h2 id="new-lot-title">Start an experiment</h2></div><button className="close-button" onClick={() => setShowNewLot(false)} aria-label="Close">×</button></div><label>Plant profile<select defaultValue="Pink Princess"><option>Pink Princess</option><option>Violin variegated</option><option>Philodendron green control</option></select></label><label>Protocol<select defaultValue="Nodal establishment v0.1"><option>Nodal establishment v0.1</option><option>Sterility blank test</option></select></label><div className="modal-note">This creates a local preview record. Firebase connection will replace this mock action in the next phase.</div><div className="modal-actions"><button className="quiet-button" onClick={() => setShowNewLot(false)}>Cancel</button><button className="primary-button" onClick={() => { setShowNewLot(false); setNotice("สร้างร่าง experiment lot แล้ว"); }}>Create lot <Icon name="arrow" /></button></div></div></div>}
    </main></AuthGate>
  );
}
