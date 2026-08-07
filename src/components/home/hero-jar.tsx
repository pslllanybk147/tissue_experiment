"use client";

export function HeroJar() {
  return (
    <section className="pl-hero" aria-label="ขวดเพาะเลี้ยงจำลอง">
      <div className="pl-hero-grid" aria-hidden="true" />
      <div className="pl-hero-stage">
        <div className="pl-hero-ring pl-hero-ring-a" aria-hidden="true" />
        <div className="pl-hero-ring pl-hero-ring-b" aria-hidden="true" />
        <span className="pl-hud-chip pl-hero-chip-top" aria-hidden="true">LAB:PLANTLOVER</span>
        <span className="pl-hud-chip pl-pulse pl-hero-chip-bottom" aria-hidden="true">READY ▲</span>
        <div className="pl-hero-scanline" aria-hidden="true" />
        <HeroPoster />
      </div>
      <p className="pl-hero-note">ภาพจำลองขวดเพาะเลี้ยง ไม่ใช่ภาพต้นจริง — ลากเพื่อหมุนได้เมื่อโหลดครบ</p>
    </section>
  );
}

function HeroPoster() {
  // ภาพนิ่ง: โหลแก้ว + วุ้น + ต้นอ่อน ใช้สีจาก currentColor/var() เพื่อตามธีม
  return (
    <svg className="pl-hero-poster" viewBox="0 0 200 260" role="img" aria-label="ขวดโหลแก้วมีต้นอ่อนบนวุ้นอาหาร">
      <defs>
        <linearGradient id="pl-jar-glass" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="var(--pl-ink)" stopOpacity="0.14" />
          <stop offset="0.5" stopColor="var(--pl-ink)" stopOpacity="0.02" />
          <stop offset="1" stopColor="var(--pl-ink)" stopOpacity="0.2" />
        </linearGradient>
      </defs>
      <ellipse cx="100" cy="150" rx="92" ry="80" fill="var(--pl-glow)" opacity="0.35" />
      <rect x="58" y="26" width="84" height="18" rx="6" fill="var(--pl-ink-3)" />
      <path d="M62 44 h76 v150 a38 26 0 0 1 -76 0 Z" fill="url(#pl-jar-glass)" stroke="var(--pl-neon)" strokeOpacity="0.55" strokeWidth="2" />
      <path d="M66 168 h68 v26 a34 22 0 0 1 -68 0 Z" fill="var(--pl-agar)" />
      <g stroke="var(--pl-leaf)" fill="none" strokeWidth="3" strokeLinecap="round">
        <path d="M100 176 V96" />
        <path d="M100 140 C78 132 68 112 70 92 C90 100 100 118 100 138 Z" fill="var(--pl-leaf)" fillOpacity="0.55" />
        <path d="M100 124 C122 116 132 96 130 76 C110 84 100 102 100 122 Z" fill="var(--pl-leaf)" fillOpacity="0.4" />
        <path d="M100 100 C96 82 100 66 112 56 C118 72 112 90 101 99 Z" fill="var(--pl-leaf)" fillOpacity="0.55" />
      </g>
    </svg>
  );
}
