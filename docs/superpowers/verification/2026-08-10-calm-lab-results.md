# Calm Lab verification results — 2026-08-10

## Observed command results

- `npm test`: 156 files passed, 4 skipped; 791 tests passed, 10 skipped.
- `npm run lint`: passed with no reported ESLint errors.
- `npm run build`: passed on Next.js 16.2.11; TypeScript passed and 216 static pages were generated.
- `npm run protocol:verify`: passed 3 protocol tuples × 2 viewports × 2 themes.
- `npm run ui:verify`: passed at 360, 375, 390, 412, 428, 600, 744, 768, 820, 834, 1024, 1280, 1440, and 1920 px.
- `npm run calm-lab:verify`: passed the combined protocol and responsive browser gates.
- `npm test -- src/app/calm-lab-contract.test.ts`: 10 tests passed.
- `git diff --check`: passed before the final verification commit.

## Browser evidence covered

- Public discovery, finder, search, troubleshooting, substances, guide overview, and guide step reading.
- Demo entry, round setup, pressure/Haiter/NaDCC selection, review, round creation, preparation save, and reload persistence.
- Workspace round, equipment, admin knowledge, research, and dataset routes included in the responsive UI matrix.
- Light/dark themes, Torsilp computed font, main landmark, horizontal overflow, control size, navigation visibility, mobile bottom navigation, and removal of legacy HUD selectors.

## Corrected during verification

- Migrated legacy shell and setup selectors in the protocol verifier to the new semantic shell, staged workflow, and native radio controls.
- Fixed an invalid legacy font variable chain that caused the browser to fall back to the system font.
- Added forced-color focus and boundary rules using `Highlight` and `CanvasText`.

## Claims not established by automation

These checks provide observed rendering and interaction evidence only. They do not establish scientific safety, full accessibility conformance, or user usability. Protocol content and chemical procedures still require qualified scientific review, and the redesigned flows still require testing with representative users and assistive technologies.
