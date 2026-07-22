import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { LabShell } from "./lab-shell";

describe("LabShell", () => {
  it("renders semantic navigation and a main content landmark", () => {
    const html = renderToStaticMarkup(
      <LabShell section="Experiments" sessionLabel="FIREBASE" onSignOut={() => undefined}>
        <h1>Experiment lots</h1>
      </LabShell>,
    );

    expect(html).toContain('href="/"');
    expect(html).toContain('href="/experiments"');
    expect(html).toContain("<main");
    expect(html).toContain("Experiment lots");
    expect(html).toContain("FIREBASE");
  });
});
