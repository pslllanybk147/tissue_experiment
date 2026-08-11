import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { LabShell } from "./lab-shell";

describe("LabShell", () => {
  it("renders the active Thai destination inside one Botanical Atlas main landmark", () => {
    const html = renderToStaticMarkup(
      <LabShell section="Knowledge" sessionLabel="FIREBASE" onSignOut={() => undefined}>
        <h1>Experiment lots</h1>
      </LabShell>,
    );

    expect(html).toContain('href="/"');
    expect(html).toContain('href="/admin/research"');
    expect(html).toContain('aria-label="เมนูหลักสำหรับมือถือ"');
    expect(html).toContain('aria-current="page"');
    expect((html.match(/aria-current="page"/g) ?? [])).toHaveLength(2);
    expect(html).toContain("cl-atlas-shell");
    expect(html).toContain('href="#main-content"');
    expect(html).toContain('id="main-content"');
    expect(html).toContain("<main");
    expect(html).toContain("Experiment lots");
    expect(html).toContain("FIREBASE");
    expect((html.match(/<main/g) ?? [])).toHaveLength(1);
    expect(html).toContain("cl-atlas-chapter");
    expect(html).toContain("cl-atlas-content");
  });

  it("uses plain Thai task labels in navigation", () => {
    const html = renderToStaticMarkup(
      <LabShell section="Knowledge" sessionLabel="DEMO" onSignOut={() => undefined}>
        <p>content</p>
      </LabShell>,
    );

    expect(html).toContain("เริ่มต้น");
    expect(html).toContain("คลังความรู้");
    expect(html).toContain('aria-label="เมนูหลัก"');
  });
});
