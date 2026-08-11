# Botanical Atlas Verification Results

## Revision

- Tested implementation commit: `cb953d6ef382ba45fa71ec0fc4877819417752c5`
- Planned implementation commits: `893f6ef`, `5d02efc`, `20c0804`, `cb953d6`
- Date: 2026-08-11 (Asia/Bangkok)

## Automated gates

| Command | Result | Evidence |
| --- | --- | --- |
| `npm test` | PASS | 164 files passed, 4 skipped; 881 tests passed, 10 skipped |
| `npm run lint` | PASS | ESLint exited 0 with no reported errors |
| `npm run build` | PASS | Next.js 16.2.11 compiled, TypeScript passed, 216 static pages generated |
| `npm run protocol:verify` | PASS | 3 protocol tuples × 2 viewports × 2 themes |
| `$env:UI_SERVER_MODE='production'; npm run atlas:verify` | PASS | protocol gate passed; UI gate passed 17 viewport profiles from 320–1920px |
| `npm run terms:report` | PASS/report | scanned 27 terms and listed 199 candidates for human review; this command is advisory, not a zero-findings gate |
| `git diff --check` | PASS | no whitespace errors before the evidence document was added |
| `npm run firebase:verify` | BLOCKED | firebase-tools stopped before tests: Java 21+ required; machine reports Java `1.8.0_501` |

The Firebase result is an environment blocker, not a passing gate and not an application-test failure. Re-run it after installing JDK 21 or newer.

## Render matrix

The automated browser gate covered Light and Dark themes at all of these profiles: 320, 360, 375, 390, 412, 428, 600, 744, 768×900, 768×1024, 820, 834, 1024×900, 1024×1366, 1280, 1440, and 1920px.

| Representative width | Light | Dark | 200% zoom | Notes |
| --- | --- | --- | --- | --- |
| 1440 | PASS | PASS | Reflow proxy only | Desktop top navigation and workspace screenshot inspected |
| 1024 | PASS | PASS | Reflow proxy only | Public top navigation and three-column plant grid inspected |
| 768 | PASS | PASS | Reflow proxy only | Bottom navigation used after the 899px breakpoint correction |
| 390 | PASS | PASS | Reflow proxy only | Round list, long Thai labels, empty/legacy rows, and fixed navigation inspected |
| 320 | PASS | PASS | Reflow proxy only | Form detail, contextual term control, evidence badge, and long Thai text inspected |

Browser zoom was not changed through the browser UI. The 744/768px profiles provide a 2× reflow proxy for a 1440–1536px desktop, but this is not claimed as a direct 200% zoom test.

Screenshots are in `work/ui-audit` and are verification artifacts, not user research.

## Routes and states inspected

- Public: `/`, `/guide/pink-princess`, `/guide/violin-variegated/step/8`, `/find`, `/start`, `/substances`, `/problem`, `/search`, and `/form/climbing-vine-visible-node`.
- Authenticated/demo: `/my`, `/my/equipment`, `/my/rounds`, `/my/rounds/new`, `/my/trials/new`, `/admin/knowledge`, `/admin/research`, `/admin/dataset-review`, `/admin/pin`, and `/admin/manual/pink-princess`.
- Protocol flow: round creation; pressure/Haiter/NaDCC method combinations; preparation save and reload persistence; prep-media and sterilize steps.
- Automated state checks: Light/Dark toggle, keyboard focus entry, reduced-motion hero fallback, main landmark, horizontal overflow, Thai navigation bounds, minimum target sizes, action contrast, disabled cursor, loading cursor, destructive boundary, and representative primitive stress.
- Visual samples opened manually: desktop workspace Light, 1024 public home Dark, 768 public home Light, 820 workspace Dark, 390 round list Dark, and 320 form detail Light.

## Defects found and fixed during verification

- Added missing browser inventory for round/trial creation and form-detail routes.
- Raised disabled-control contrast in both themes to at least 4.5:1.
- Removed the admin manual's inline system font and legacy border styling, and restored shared Botanical Atlas reading anatomy.
- Replaced invalid `<p><details>…</details></p>` nesting in the form detail, eliminating hydration console errors.
- Added a production-server mode to the shared browser runner after the dev server timed out under the full screenshot matrix.
- Moved shell navigation to the bottom-navigation layout through 899px after production verification found 2–17px Thai-label overflow at 768–834px.

## Remaining limitations

- Firebase emulator tests remain unexecuted until this machine has JDK 21+.
- Direct 200% browser zoom, screen-reader traversal, OS high-contrast interaction, and physical touch testing were not performed. Forced-color CSS and keyboard focus are covered only by automated contracts/browser checks.
- The tests establish rendering and interaction evidence only. They do not establish full WCAG conformance, usability with representative users, or scientific/chemical safety. Protocol content still requires qualified scientific review.
- The 199 `terms:report` candidates require editorial review; the report intentionally over-matches ordinary Thai uses of short terms such as “ข้อ” and “ลำ”.
