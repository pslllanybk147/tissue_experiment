"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const HeroJarScene = dynamic(() => import("./hero-jar-scene"), { ssr: false });

export function shouldLoadScene(env: { reducedMotion: boolean; webgl: boolean }) {
  return !env.reducedMotion && env.webgl;
}

function detectEnv() {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let webgl = false;
  try {
    const canvas = document.createElement("canvas");
    webgl = Boolean(canvas.getContext("webgl2") ?? canvas.getContext("webgl"));
  } catch {
    webgl = false;
  }
  return { reducedMotion, webgl };
}

function readSceneColors() {
  const style = getComputedStyle(document.documentElement);
  return {
    neon: style.getPropertyValue("--cl-accent").trim() || "#287c86",
    neon2: style.getPropertyValue("--cl-action").trim() || "#1f6b52",
    leaf: style.getPropertyValue("--cl-success").trim() || "#236c49",
    agar: style.getPropertyValue("--cl-accent-subtle").trim() || "#dceff0",
  };
}

export function HeroJar() {
  const [scene, setScene] = useState<null | ReturnType<typeof readSceneColors>>(null);

  useEffect(() => {
    if (!shouldLoadScene(detectEnv())) return;
    // ตรวจ WebGL/reduced-motion ได้หลัง mount เท่านั้น (ต้องพึ่ง window) จึงตั้งค่าครั้งเดียวในเอฟเฟกต์นี้
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setScene(readSceneColors());
    // เปลี่ยนธีมแล้วให้แสง 3D เปลี่ยนตาม
    const observer = new MutationObserver(() => setScene(readSceneColors()));
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => observer.disconnect();
  }, []);

  return (
    <section className="pl-hero" aria-label="ขวดเพาะเลี้ยงจำลอง">
      <div className="pl-hero-stage">
        <HeroPoster hidden={Boolean(scene)} />
        {scene ? (
          <div className="pl-hero-canvas" aria-hidden="true">
            <HeroJarScene {...scene} />
          </div>
        ) : null}
      </div>
      <p className="pl-hero-note">ภาพจำลองขวดเพาะเลี้ยง ไม่ใช่ภาพต้นจริง — ลากเพื่อหมุนได้เมื่อโหลดครบ</p>
    </section>
  );
}

function HeroPoster({ hidden = false }: { hidden?: boolean }) {
  // ภาพนิ่ง: โหลแก้ว + วุ้น + ต้นอ่อน ใช้สีจาก currentColor/var() เพื่อตามธีม
  // อยู่ใน DOM เสมอ (fallback หลักเมื่อไม่มี WebGL/reduced-motion) — ซ่อนด้วย opacity เมื่อ 3D พร้อม
  return (
    <svg
      className={hidden ? "pl-hero-poster pl-hero-poster-hidden" : "pl-hero-poster"}
      viewBox="0 0 200 260"
      role="img"
      aria-label="ขวดโหลแก้วมีต้นอ่อนบนวุ้นอาหาร"
    >
      <defs>
        <linearGradient id="pl-jar-glass" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="var(--cl-text)" stopOpacity="0.14" />
          <stop offset="0.5" stopColor="var(--cl-text)" stopOpacity="0.02" />
          <stop offset="1" stopColor="var(--cl-text)" stopOpacity="0.2" />
        </linearGradient>
      </defs>
      <ellipse cx="100" cy="150" rx="92" ry="80" fill="var(--cl-surface-subtle)" opacity="0.65" />
      <rect x="58" y="26" width="84" height="18" rx="6" fill="var(--cl-text-muted)" />
      <path d="M62 44 h76 v150 a38 26 0 0 1 -76 0 Z" fill="url(#pl-jar-glass)" stroke="var(--cl-accent)" strokeOpacity="0.55" strokeWidth="2" />
      <path d="M66 168 h68 v26 a34 22 0 0 1 -68 0 Z" fill="var(--cl-accent-subtle)" />
      <g stroke="var(--cl-success)" fill="none" strokeWidth="3" strokeLinecap="round">
        <path d="M100 176 V96" />
        <path d="M100 140 C78 132 68 112 70 92 C90 100 100 118 100 138 Z" fill="var(--cl-success)" fillOpacity="0.55" />
        <path d="M100 124 C122 116 132 96 130 76 C110 84 100 102 100 122 Z" fill="var(--cl-success)" fillOpacity="0.4" />
        <path d="M100 100 C96 82 100 66 112 56 C118 72 112 90 101 99 Z" fill="var(--cl-success)" fillOpacity="0.55" />
      </g>
    </svg>
  );
}
