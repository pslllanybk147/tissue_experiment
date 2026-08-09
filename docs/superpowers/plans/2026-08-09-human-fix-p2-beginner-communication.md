# Human Fix P2 Beginner Communication Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make every plant guide and trial step understandable to a first-time user through consistent Thai copy, contextual glossary help, labeled instructional diagrams, and responsive accessible layout.

**Architecture:** Build reusable copy validation, term-help, step-section, and illustration metadata primitives, then migrate every registered plant through automated semantic checks. Generated assets live locally with provenance metadata and can never substitute for real cultivar evidence.

**Tech Stack:** Next.js 16.2.11, React 19.2.4, TypeScript, Vitest, Playwright/browser verification, local static images.

## Global Constraints

- Start only after P1 full-suite verification passes.
- Preserve Cyber Greenhouse visual language; improve hierarchy rather than redesigning the brand.
- Use short Thai sentences, one action per numbered line, explicit units, and no unexplained English abbreviation.
- Generated diagrams must visibly say `ภาพประกอบ ไม่ใช่ภาพตัวอย่างผลทดลองจริง`.
- Actual cultivar/result evidence remains real, licensed, linked, or user-provided imagery.
- Verify all slugs returned by `src/lib/manual/registry.ts`, not only Violin.

---

## File Structure

- Create `src/lib/manual/beginner-copy.ts` for automated language rules.
- Create `src/components/guide/term-help.tsx` for contextual glossary access.
- Create `src/components/rounds/step-section.tsx` for consistent action/why/check/stop structure.
- Create `src/lib/manual/illustration-metadata.ts` and `public/illustrations/metadata.json` for asset provenance.
- Modify shared guide/runner renderers and plant/form data only where audit tests identify violations.

### Task 1: Beginner-copy validator across every plant

**Files:**
- Create: `src/lib/manual/beginner-copy.ts`
- Test: `src/lib/manual/beginner-copy.test.ts`
- Modify: `src/lib/manual/registry.test.ts`

**Interfaces:**
- Produces `auditBeginnerCopy(manual): CopyIssue[]` with issue codes `long-action | multiple-actions | unexplained-term | vague-unit | conflicting-instruction`.

- [ ] **Step 1: Write failing tests over every registered manual and a fixture containing two actions in one line.**

```ts
for (const pack of registry) {
  const issues = auditBeginnerCopy(resolveBySlug(pack.slug)!);
  expect(issues, pack.slug).toEqual([]);
}
```

- [ ] **Step 2: Run copy audit tests; expect FAIL and capture exact slug/step/field issues.**

- [ ] **Step 3: Implement deterministic checks for sentence length, conjunction-heavy action lines, raw abbreviations, missing units, and arm contradictions.**

```ts
export type CopyIssue = { slug: string; stepId: string; field: string; code: CopyIssueCode; text: string };
```

- [ ] **Step 4: Fix only reported shared core/form/genus/pack strings, preferring the highest shared layer that is semantically correct for every consumer.**

- [ ] **Step 5: Re-run copy, term-integrity, evidence, duration, form, genus, and registry tests; expect PASS for every plant.**

- [ ] **Step 6: Commit with `git commit -m "fix: make all manual copy beginner-readable"`.**

### Task 2: Contextual glossary help

**Files:**
- Create: `src/components/guide/term-help.tsx`
- Test: `src/components/guide/term-help.test.tsx`
- Modify: `src/lib/manual/terms.ts`
- Test: `src/lib/manual/terms.test.ts`
- Modify: `src/components/guide/step-detail.tsx`
- Modify: `src/components/rounds/step-runner.tsx`

**Interfaces:**
- Produces `TermHelp({ termId, children })` with Thai definition, practical cue, and keyboard-accessible disclosure.

- [ ] **Step 1: Write failing keyboard and copy tests for explant, node, stock, working dilution, ppm, sterile water, blank control, and browning.**

```tsx
await user.tab();
await user.keyboard("{Enter}");
expect(screen.getByRole("definition")).toHaveTextContent(/หมายถึง/);
```

- [ ] **Step 2: Run term-help and terms tests; expect FAIL because contextual disclosure does not exist.**

- [ ] **Step 3: Add concise Thai definitions plus “ดูจากของจริงอย่างไร” cues to the central term registry.**

- [ ] **Step 4: Implement native button/disclosure semantics, focus return, `aria-expanded`, and non-hover mobile behavior.**

- [ ] **Step 5: Wrap terms through the existing term-aware rendering path; do not hard-code replacements inside plant data.**

- [ ] **Step 6: Run component, term-integrity, step-detail, and runner tests; expect PASS.**

- [ ] **Step 7: Commit with `git commit -m "feat: explain technical terms in context"`.**

### Task 3: Consistent beginner step composition

**Files:**
- Create: `src/components/rounds/step-section.tsx`
- Test: `src/components/rounds/step-section.test.tsx`
- Modify: `src/components/rounds/step-runner.tsx`
- Modify: `src/components/guide/step-detail.tsx`
- Test: corresponding runner and detail tests.

**Interfaces:**
- Produces sections in this order: outcome, materials, numbered actions, why, pass criteria, stop conditions, safety, record fields, evidence.

- [ ] **Step 1: Write failing heading-order and one-action-per-list-item tests.**

```ts
expect(screen.getAllByRole("heading", { level: 2 }).map((node) => node.textContent)).toEqual([
  "ขั้นนี้ต้องได้อะไร", "เตรียมของ", "ทำทีละข้อ", "ทำไปทำไม",
  "ผ่านเมื่อ", "หยุดเมื่อ", "บันทึกผล",
]);
```

- [ ] **Step 2: Run step-section tests; expect FAIL because existing hierarchy differs between public detail and runner.**

- [ ] **Step 3: Implement one shared semantic section component using ordered lists for actions and alert styling only for stop/safety content.**

- [ ] **Step 4: Replace duplicated layout in runner/detail while preserving forms, timers, photos, routes, and CSS tokens.**

- [ ] **Step 5: Run runner, detail, evidence badge, illustrations, and route tests; expect PASS.**

- [ ] **Step 6: Commit with `git commit -m "refactor: unify beginner step presentation"`.**

### Task 4: Instructional illustration provenance and rendering

**Files:**
- Create: `src/lib/manual/illustration-metadata.ts`
- Test: `src/lib/manual/illustration-metadata.test.ts`
- Create: `public/illustrations/metadata.json`
- Modify: `src/components/guide/illustrations.tsx`
- Test: `src/components/guide/illustrations.test.tsx`
- Create assets under: `public/illustrations/`

**Interfaces:**
- Metadata fields: `id`, `file`, `altTh`, `purpose`, `sourceType`, `createdAt`, `prompt`, `disclaimer`.
- `sourceType` is `generated-diagram | licensed-reference | user-evidence`.

- [ ] **Step 1: Write failing metadata tests requiring existing files, Thai alt text, provenance, and the exact disclaimer for every generated diagram.**

```ts
expect(meta.disclaimer).toBe("ภาพประกอบ ไม่ใช่ภาพตัวอย่างผลทดลองจริง");
expect(existsSync(join("public", "illustrations", meta.file))).toBe(true);
```

- [ ] **Step 2: Run metadata/illustration tests; expect FAIL for missing metadata and assets.**

- [ ] **Step 3: Reuse suitable existing assets after visual inspection; generate only missing educational diagrams for node/bud, cut positions, apical/basal orientation, blank versus explant, contamination/browning/chlorine injury, and Haiter versus NaDCC sequence.**

Every generated prompt must request a clean botanical teaching diagram, no photorealistic claim, no readable text baked into the bitmap, and a composition that remains clear at 390 px width.

- [ ] **Step 4: Save generated files and metadata together; the UI renders the disclaimer as live text below the image.**

```tsx
<figure>
  <Image src={`/illustrations/${meta.file}`} alt={meta.altTh} width={960} height={640} />
  {meta.sourceType === "generated-diagram" ? <figcaption>{meta.disclaimer}</figcaption> : null}
</figure>
```

- [ ] **Step 5: Run metadata, illustration, Next image, and accessibility tests; expect PASS.**

- [ ] **Step 6: Commit with `git commit -m "feat: add labeled beginner protocol diagrams"`.**

### Task 5: All-plant semantic and visual matrix

**Files:**
- Test: `src/lib/manual/all-manuals-human.test.ts`
- Modify: `package.json` to add `manuals:verify`.

**Interfaces:**
- Produces a nonzero exit when any registered slug fails resolution, copy audit, term wrapping, image metadata, sequence, or required-field integrity.

- [ ] **Step 1: Write a failing all-manual test that reports `slug > stepId > issue code`.**

```ts
expect(issues.map((issue) => `${issue.slug} > ${issue.stepId} > ${issue.code}`)).toEqual([]);
```

- [ ] **Step 2: Run the test; expect FAIL until all migrations from Tasks 1–4 are complete.**

- [ ] **Step 3: Add a package script that runs the same registry and pure validators through Vitest, which already transpiles the TypeScript path aliases.**

```json
"manuals:verify": "vitest run src/lib/manual/all-manuals-human.test.ts"
```

- [ ] **Step 4: Run `npm run manuals:verify`; expect each slug to print PASS and exit 0.**

- [ ] **Step 5: Commit with `git commit -m "test: verify beginner integrity for every plant"`.**

### Task 6: Responsive and accessibility polish

**Files:**
- Modify: shared CSS/component files identified by live browser overflow or contrast failures.
- Test: nearest component test for each changed behavior.

**Interfaces:**
- Produces stable layouts at 1440×900, 768×1024, and 390×844 in light/dark themes.

- [ ] **Step 1: Run the built app and capture baseline screenshots for guide list, every plant's first step, every Violin trial arm, equipment, calculator, and trial overview.**
- [ ] **Step 2: Record concrete failures by route, viewport, element, and expected behavior before changing CSS.**
- [ ] **Step 3: Add a failing component or Playwright assertion for each reproducible overflow, focus, contrast, reduced-motion, or touch-target failure.**
- [ ] **Step 4: Apply the smallest token/component CSS fix and rerun its focused test.**
- [ ] **Step 5: Repeat screenshots in both themes and confirm no horizontal page overflow, clipped controls, hidden focus, or diagram text below readable size.**
- [ ] **Step 6: Commit each independent visual fix with a message naming the component and behavior.**

### Task 7: P2 and release verification gate

- [ ] **Step 1: Run `npm test`, `npm run lint`, `npm run build`, `npm run ui:verify`, `npm run terms:report`, and `npm run manuals:verify`; all exit 0.**
- [ ] **Step 2: Verify every registered plant route at desktop, tablet, and Samsung-sized mobile; read every heading, action, label, error, and navigation control in order.**
- [ ] **Step 3: Verify all five Violin arms including Control-B and T3 states, all equipment/readiness branches, typed fields, NaDCC rounding, and 46-jar allocation.**
- [ ] **Step 4: Confirm generated diagrams display the disclaimer and no generated asset appears in evidence/result galleries.**
- [ ] **Step 5: Compare the deployed commit SHA with local before evaluating production; do not treat an older deployment as current behavior.**
- [ ] **Step 6: Report exact command outputs, routes, viewports, remaining known limitations, and whether deployment was requested; do not deploy without explicit user authorization.**
