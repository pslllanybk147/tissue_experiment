import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const calmLabPath = path.join(process.cwd(), "src/app/calm-lab.css");
const globalsPath = path.join(process.cwd(), "src/app/globals.css");
const guidePath = path.join(process.cwd(), "src/app/guide.css");
const calmLabCss = fs.readFileSync(calmLabPath, "utf8");
const globalsCss = fs.readFileSync(globalsPath, "utf8");
const guideCss = fs.readFileSync(guidePath, "utf8");
const layoutSource = fs.readFileSync(path.join(process.cwd(), "src/app/layout.tsx"), "utf8");

function declarationBlock(source: string, selector: string) {
  const selectorStart = source.indexOf(selector);
  if (selectorStart < 0) throw new Error(`Missing selector: ${selector}`);
  const openBrace = source.indexOf("{", selectorStart + selector.length);
  let depth = 0;
  for (let index = openBrace; index < source.length; index += 1) {
    if (source[index] === "{") depth += 1;
    if (source[index] === "}") depth -= 1;
    if (depth === 0) return source.slice(openBrace + 1, index);
  }
  throw new Error(`Unclosed selector: ${selector}`);
}

describe("Calm Lab contract", () => {
  it.each([
    "--cl-canvas",
    "--cl-surface",
    "--cl-text",
    "--cl-border",
    "--cl-action",
    "--cl-focus",
  ])("defines %s in both explicit themes", (token) => {
    expect(calmLabCss.match(new RegExp(`${token}:`, "g"))).toHaveLength(2);
  });

  it("uses the approved Botanical Atlas palette in both themes", () => {
    const approvedTokens = [
      ["--cl-canvas", "#f7f3ea", "#1c1d1a"],
      ["--cl-surface", "#fffefa", "#262722"],
      ["--cl-surface-subtle", "#f2ead9", "#2e302a"],
      ["--cl-surface-hover", "#eee6d5", "#363831"],
      ["--cl-text", "#292d29", "#f7f4ed"],
      ["--cl-text-muted", "#646860", "#c2beb1"],
      ["--cl-text-faint", "#77786f", "#a6a398"],
      ["--cl-border", "#c8c3b7", "#5a5c55"],
      ["--cl-border-strong", "#8f8a7f", "#7c7f76"],
      ["--cl-action", "#293e63", "#9bb0d9"],
      ["--cl-action-hover", "#203552", "#b0c1e3"],
      ["--cl-on-action", "#ffffff", "#18223a"],
      ["--cl-accent", "#6c663d", "#c9bc7c"],
      ["--cl-focus", "#2e69a3", "#9bcaff"],
      ["--cl-success", "#35654a", "#8bc09a"],
      ["--cl-success-subtle", "#e6efe8", "#263b2d"],
      ["--cl-warning", "#8a5a19", "#e4ba75"],
      ["--cl-warning-subtle", "#fbefd9", "#433522"],
      ["--cl-danger", "#963d34", "#f09286"],
      ["--cl-danger-subtle", "#f8e7e4", "#482926"],
      ["--cl-disabled", "#dedcd3", "#3f413b"],
      ["--cl-on-disabled", "#77786f", "#999b92"],
    ] as const;

    const lightTheme = declarationBlock(calmLabCss, ':root[data-theme="light"]');
    const darkTheme = declarationBlock(calmLabCss, ':root[data-theme="dark"]');

    for (const [token, light, dark] of approvedTokens) {
      expect(lightTheme, `${token} must have its approved light value`).toContain(`${token}: ${light}`);
      expect(lightTheme, `${token} must not use its dark value in light mode`).not.toContain(`${token}: ${dark}`);
      expect(darkTheme, `${token} must have its approved dark value`).toContain(`${token}: ${dark}`);
      if (light !== dark) {
        expect(darkTheme, `${token} must not use its light value in dark mode`).not.toContain(`${token}: ${light}`);
      }
    }
  });

  it("uses the approved spacing and readable type floors", () => {
    expect(calmLabCss).toContain("--cl-space-4: 16px");
    expect(calmLabCss).toContain("--cl-text-body: 18px");
    expect(calmLabCss).toContain("--cl-text-meta: 14px");
    expect(calmLabCss).toContain("--cl-control-min: 48px");
  });

  it("applies every approved typography role consistently", () => {
    const roles = [
      ["display", "600", "1.25"],
      ["h2", "600", "1.35"],
      ["h3", "600", "1.4"],
      ["body", "400", "1.7"],
      ["compact", "500", "1.6"],
      ["label", "600", "1.45"],
      ["meta", "500", "1.5"],
      ["numeric", "600", "1.35"],
    ] as const;
    const rules = [...calmLabCss.matchAll(/([^{}]+)\{([^{}]*)\}/g)];
    const navigationLabelSelectors = [
      ".cl-primary-nav-item",
      ".cl-lab-navigation a",
      ".cl-lab-mobile-navigation a",
    ];

    for (const [role, weight, lineHeight] of roles) {
      const declarations = rules
        .filter(([, , body]) => body.includes(`font-size: var(--cl-text-${role})`))
        .map(([, selector, body]) => ({ selector: selector.trim(), body }));

      expect(declarations.length, `${role} role must be used`).toBeGreaterThan(0);
      for (const declaration of declarations) {
        const expectedWeight = role === "label" && declaration.selector.includes(".cl-button-primary") ? "700" : weight;
        const isNavigationLabel = role === "label"
          && navigationLabelSelectors.some((selector) => declaration.selector.includes(selector));
        const expectedLineHeight = isNavigationLabel ? "1.5" : lineHeight;
        expect(declaration.body, `${declaration.selector} must use ${role} weight`).toContain(`font-weight: ${expectedWeight}`);
        expect(declaration.body, `${declaration.selector} must use ${role} line height`).toContain(`line-height: ${expectedLineHeight}`);
      }
    }

    expect(calmLabCss).toContain("--cl-text-display: clamp(34px, 4vw, 44px)");
    expect(calmLabCss).toContain("--cl-text-numeric: clamp(20px, 2vw, 24px)");
  });

  it("raises only important mobile actions to a 52px minimum", () => {
    const mobileImportantActions = `@media (max-width: 767px) {
  :root { --cl-gutter: 16px; }
  .cl-button-primary,
  .cl-button-secondary[data-intent="photo"],
  .cl-action-primary > :where(button, a) {
    min-height: var(--cl-control-important);
  }
}`;

    expect(calmLabCss).toContain("--cl-control-important: 52px");
    expect(calmLabCss).toContain(mobileImportantActions);
    expect(calmLabCss).toContain(":where(button, input, select, textarea) {\n  min-height: var(--cl-control-min);\n}");
    expect(calmLabCss.indexOf(mobileImportantActions)).toBeGreaterThan(
      calmLabCss.lastIndexOf(".cl-action-primary > :where(button, a) { min-height: var(--cl-control-min); }"),
    );
  });

  it("keeps visible UI on the local Sarabun family", () => {
    expect(calmLabCss).toContain("font-family: var(--font-sarabun), Tahoma, sans-serif");
    expect(calmLabCss).not.toMatch(/font-chaeo-hon|torsilp/i);
  });

  it("keeps later runtime styles below the Botanical Atlas foundation cascade", () => {
    const calmImport = layoutSource.indexOf('import "./calm-lab.css"');
    const globalsImport = layoutSource.indexOf('import "./globals.css"');
    const guideImport = layoutSource.indexOf('import "./guide.css"');

    expect(calmImport).toBeGreaterThan(-1);
    expect(globalsImport).toBeGreaterThan(calmImport);
    expect(guideImport).toBeGreaterThan(globalsImport);
    expect(globalsCss.trimStart()).toMatch(/^@import "tailwindcss";\s*@layer legacy \{/);
    expect(globalsCss.trimEnd()).toMatch(/\}\s*$/);
    expect(guideCss.trimStart()).toMatch(/^@layer legacy \{/);
    expect(guideCss.trimEnd()).toMatch(/\}\s*$/);
    expect(guideCss).not.toContain(".pl-nav-mobile");
  });

  it("has no obsolete UI font or negative Thai tracking in imported runtime styles", () => {
    const runtimeSource = [layoutSource, calmLabCss, globalsCss, guideCss].join("\n");

    expect(runtimeSource).not.toMatch(/font-chaeo-hon|MNChaeoHon|torsilp/i);
    expect(runtimeSource).not.toMatch(/letter-spacing:\s*-\d/i);
    expect(runtimeSource).not.toMatch(/font(?:-family)?:\s*[^;}]*!important/i);
    expect(globalsCss).toContain("--font-thai-ui: var(--font-sarabun), Tahoma, sans-serif");
    expect(globalsCss).toContain("--font-metadata: var(--font-sarabun), Tahoma, sans-serif");
  });

  it("has no independent legacy theme blocks", () => {
    expect(fs.readFileSync(globalsPath, "utf8")).not.toMatch(/:root\[data-theme=/);
    expect(fs.readFileSync(guidePath, "utf8")).not.toMatch(/:root\[data-theme=/);
  });

  it("provides forced-color boundaries and focus", () => {
    const css = fs.readFileSync(calmLabPath, "utf8");
    expect(css).toContain("@media (forced-colors: active)");
    expect(css).toContain("Highlight");
    expect(css).toContain("CanvasText");
  });

  it("lets long field units wrap without shrinking or covering the input", () => {
    const sharedWrapBlock = declarationBlock(calmLabCss, ":where(h1, h2, h3, p, li, label, button, a, dd, dt, span)");
    const fieldControl = declarationBlock(calmLabCss, ".cl-field-control");
    const fieldUnit = declarationBlock(calmLabCss, ".cl-field-unit");

    expect(sharedWrapBlock).toContain("overflow-wrap: break-word");
    expect(sharedWrapBlock).toContain("word-break: normal");
    expect(fieldControl).toContain("grid-template-columns: minmax(0, 1fr) minmax(0, auto)");
    expect(fieldUnit).toContain("min-width: 0");
    expect(fieldUnit).toContain("max-width: min(40vw, 12rem)");
    expect(fieldUnit).toContain("overflow-wrap: break-word");
    expect(fieldUnit).toContain("word-break: normal");
  });

  it("keeps one shared field spacing rule and shrink-safe primitive wrappers", () => {
    expect(calmLabCss.match(/\.cl-field-group\s*\{/g)).toHaveLength(1);
    expect(declarationBlock(calmLabCss, ".cl-field-group")).toContain("gap: var(--cl-space-2)");

    for (const selector of [
      ".cl-page-heading > div",
      ".cl-page-heading-action",
      ".cl-action-secondary",
      ".cl-action-primary",
    ]) {
      expect(declarationBlock(calmLabCss, selector), `${selector} must shrink inside its flex/grid parent`).toContain("min-width: 0");
    }
  });

  it("keeps execution-card roles in the unlayered foundation", () => {
    expect(calmLabCss).toContain(`:where(.cl-protocol, .cl-guide-article) .execution-instruction-heading h3 {
  margin: 0;
  font-size: var(--cl-text-h2);
  font-weight: 600;
  line-height: 1.35;
}`);
    expect(calmLabCss).toContain(`:where(.cl-protocol, .cl-guide-article) .execution-instruction-action {
  margin-block-start: var(--cl-space-3);
  font-size: var(--cl-text-body);
  font-weight: 400;
  line-height: 1.7;
}`);
    expect(calmLabCss).toContain(":where(.cl-protocol, .cl-guide-article) .execution-instruction-details");
    expect(calmLabCss).toContain(":where(.cl-protocol, .cl-guide-article) .execution-instruction-completion");
    expect(guideCss).not.toContain(".cl-protocol .execution-instruction-heading h3");
  });
});
