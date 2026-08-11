import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { createDemoSnapshot } from "../../lib/repositories/demo-lab-repository";
import { DashboardSummary } from "./dashboard-summary";

describe("DashboardSummary", () => {
  it("keeps the real workflow destinations in one editorial page hierarchy", () => {
    const html = renderToStaticMarkup(<DashboardSummary snapshot={createDemoSnapshot("o1")} />);

    expect(html).toContain('href="/admin/manual"');
    expect(html).toContain('href="/my/rounds"');
    expect(html).toContain('href="/admin/research"');
    expect(html).toContain("cl-atlas-chapter");
    expect(html).toContain("cl-atlas-summary-list");
    expect(html.indexOf("พื้นที่ทำงานปัจจุบัน")).toBeLessThan(html.indexOf("<h1"));
    expect(html.indexOf("<h1")).toBeLessThan(html.indexOf("cl-atlas-summary-list"));
    expect(html).not.toMatch(/dashboard-lead|dashboard-metrics|local preview/);
  });

  it("offers one obvious beginner starting action without exposing design captions", () => {
    const html = renderToStaticMarkup(<DashboardSummary snapshot={createDemoSnapshot("o1")} />);

    expect(html).toContain('href="/my/rounds"');
    expect(html).toContain("เปิดคู่มือฉบับผู้ใช้");
    expect(html).not.toMatch(/Primary|Keyboard focus|Destructive|Disabled/);
  });
});
