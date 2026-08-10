import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { HeroJar, shouldLoadScene } from "./hero-jar";

describe("hero ขวดเพาะเลี้ยงหน้าแรก", () => {
  const html = renderToStaticMarkup(<HeroJar />);

  it("มี poster ภาพนิ่งเสมอ (fallback ของ 3D)", () => {
    expect(html).toContain("pl-hero-poster");
  });

  it("does not render legacy HUD decoration", () => {
    expect(html).not.toMatch(/pl-hero-grid|pl-hero-ring|pl-hero-scanline|pl-hud-chip/);
  });

  it("ระบุว่าเป็นภาพจำลอง ไม่ใช่ภาพต้นจริง", () => {
    expect(html).toContain("ภาพจำลอง");
  });

  it("gives the authentic illustration an accessible name", () => {
    expect(html).toContain('role="img"');
    expect(html).toContain('aria-label="ขวดโหลแก้วมีต้นอ่อนบนวุ้นอาหาร"');
  });
});

describe("เงื่อนไขโหลดฉาก 3D", () => {
  it("ไม่โหลดเมื่อผู้ใช้ขอลดการเคลื่อนไหว", () => {
    expect(shouldLoadScene({ reducedMotion: true, webgl: true })).toBe(false);
  });
  it("ไม่โหลดเมื่อไม่มี WebGL", () => {
    expect(shouldLoadScene({ reducedMotion: false, webgl: false })).toBe(false);
  });
  it("โหลดเมื่อพร้อมทั้งคู่", () => {
    expect(shouldLoadScene({ reducedMotion: false, webgl: true })).toBe(true);
  });
});
