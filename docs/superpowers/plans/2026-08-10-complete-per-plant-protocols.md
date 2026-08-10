# Complete Per-Plant Protocols Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:test-driven-development` and `superpowers:verification-before-completion` while implementing this plan.

**Goal:** Make every published plant guide render an actionable, beginner-readable execution protocol at every step, with the same explicit structure already demonstrated by the Variegated Violin guide.

**Architecture:** Keep species-specific scientific values in each plant pack and add a shared execution-materialization layer at manual resolution time. Explicit `executionInstructions` supplied by a plant pack remain authoritative. Missing instructions are generated from the resolved step's existing actions, materials, duration, pass criteria, stop conditions, and measurements, with step-aware labels and safe stop points. Media steps continue to use the existing exact batch calculator context so the displayed quantities are those for the user's selected batch, not vague references to a recipe. No unsupported concentration, duration, or dose will be invented.

**Tech Stack:** TypeScript, React/Next.js, Vitest, existing manual registry/resolver, in-app debugging browser.

## Global Constraints

- Every resolved published step must have at least one execution instruction.
- Each instruction must say what to do and, when known, the material, quantity, container, duration, completion condition, and next action.
- Do not render vague instructions such as “ตามสูตรที่เลือก”, “ตามค่าเริ่มต้น”, “ช่วงของสูตร”, or “เลือกวิธีใดวิธีหนึ่ง” when the system can render the actual selected value.
- Do not fabricate species-specific numbers. If the evidence or pack does not provide a safe value, the instruction must tell the user to stop, record the missing value, or run a clearly labelled experiment.
- Preserve existing explicit Violin instructions and improve them only where the shared beginner contract requires a missing field.
- Keep all 11 plant slugs covered: generic Philodendron, Bolbitis, Java fern, Christmas moss, Pink Princess, Variegated Violin, HC Cuba, Java moss, Variegated Rhaphidophora, Scindapsus Exotica, and Thai Constellation.

## Tasks

### 1. Map the current protocol surface

- Inspect the resolver, core steps, species packs, and existing manual audits.
- Record which steps already have explicit execution instructions and which rely on the generic action fallback.
- Confirm that the resolved output—not only source files—matches what the guide and round runner render.

### 2. Add a failing completeness contract (RED)

- Add a Vitest test over every registered plant.
- Assert every resolved step has non-empty execution instructions.
- Assert every instruction has a non-empty label and action, and all instructions expose a completion condition or an explicit stop/wait condition.
- Assert forbidden vague placeholder phrases do not appear in rendered instructions.
- Assert every media recipe can still be rendered through the exact batch instruction path.

### 3. Implement shared, step-aware instruction materialization

- Add a small pure module for generating instructions only when a pack did not provide them.
- Convert existing actions into meaningful labels based on the step title/id rather than opaque “ข้อ N”.
- Carry through known materials, durations, measurements, pass criteria, stop conditions, safety notes, and next-step guidance.
- For sterilization, make the sequence readable as preparation → treatment → timed movement → rinsing → record. Keep optional low-chlorine rinse visibly experimental and never silently replace the standard rinse.
- For media, retain the exact calculator-produced batch values, including MS, sugar, agar, hormone-stock volume, total volume, jar count, per-jar volume, and pH target.
- Add any missing per-pack overrides only where the shared template cannot express a species-specific value.

### 4. Update the authoring contract

- Update `docs/superpowers/newplant_protocol.md` to explain that a pack may provide explicit instructions and that the resolver materializes a complete common-step protocol for the remaining steps.
- State that authors must provide numeric values and evidence in the pack when they are species-specific; the resolver must not invent them.
- Add a checklist for verifying the user-facing instruction contains an action, exact known quantity, container, duration, completion, and next step.

### 5. Verify the implementation

- Run the new completeness test first, then the full Vitest suite, lint, build, manual verification, and diff checks.
- Start the local app and use the connected debugging browser, not a standalone browser automation tool.
- Visit all 11 plant guide flows, inspect the media step and sterilization/propagation steps, and confirm the visible text contains concrete instructions and no vague placeholders.
- Inspect the Variegated Violin sterilization step specifically for the numbered rinse sequence and timing.
- Finalize browser tabs and preserve any browser errors or blocked routes as explicit findings.

### 6. Publish after verification

- Commit the complete protocol changes on the current feature branch.
- Push the branch to origin.
- Create or update the pull request targeting `master`, merge it after checks pass, and verify the merged commit on `origin/master`.

## Self-review checklist

- [ ] The RED test failed before the materializer was implemented.
- [ ] No source-specific number was guessed to make the test pass.
- [ ] Explicit Violin instructions remain intact.
- [ ] All 11 slugs pass the resolved protocol contract.
- [ ] Browser inspection covers both a complete Violin flow and representative non-Violin flows.
- [ ] The final report distinguishes automated checks, browser checks, and any pre-existing verifier limitations.
