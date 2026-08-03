import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { LabShell } from "./lab-shell";

describe("LabShell", () => {
  it("renders semantic navigation and a main content landmark", () => {
    const html = renderToStaticMarkup(
      <LabShell section="Knowledge" sessionLabel="FIREBASE" onSignOut={() => undefined}>
        <h1>Experiment lots</h1>
      </LabShell>,
    );

    expect(html).toContain('href="/"');
    expect(html).toContain('href="/admin/research"');
    expect(html).toContain('aria-label="Mobile navigation"');
    expect(html).toContain('aria-current="page"');
    expect(html).toContain("<main");
    expect(html).toContain("Experiment lots");
    expect(html).toContain("FIREBASE");
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
