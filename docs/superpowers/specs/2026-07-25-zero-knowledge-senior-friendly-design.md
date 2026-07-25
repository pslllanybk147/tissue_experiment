# Zero-Knowledge + Senior-Friendly Guided Lab Design

## Status

Approved visual direction: **Design B**

This specification changes Philodendron Lab from a research interface that assumes basic laboratory knowledge into a guided work system that can be followed by a first-time user with no prior knowledge of plants, tissue culture, laboratory equipment, scientific notation, or dilution calculations.

## Primary user assumption

The default user must be treated as knowing none of the following:

- plant anatomy;
- tissue-culture terminology;
- laboratory equipment names;
- sterile technique;
- medium preparation;
- concentration, dilution, or scientific equations;
- normal versus abnormal culture appearance;
- chemical safety beyond ordinary household-product knowledge.

Prior knowledge must never be required to complete a primary workflow.

## Core design rules

### Plain language first

- A technical term must be defined the first time it appears in the same sentence.
- The Thai description appears before the English or scientific term.
- Examples:
  - `ข้อของลำต้น ซึ่งเป็นจุดที่ใบหรือยอดแตกออก (node)`
  - `ชิ้นส่วนต้นไม้ที่จะนำไปเพาะ (explant)`
  - `อาหารวุ้นที่ให้ธาตุอาหารแก่ชิ้นพืช (culture medium)`
- Abbreviations such as MS, BA, BAP, NAA, IBA, NaOCl, ppm, and PLB must not appear alone in a primary instruction.

### The system calculates; the user supplies observable facts

- Equations must not be the primary instruction.
- The user enters only values that can be read directly from a label, measuring device, or approved protocol.
- The system calculates dilution, batch quantities, and required volumes.
- The result must be phrased as a physical action, for example:
  - `ใช้ปิเปตตวง working solution 0.50 mL`
  - not `ใช้ C1V1 = C2V2`
- Scientific equations may appear only inside an expandable `เหตุผลทางวิทยาศาสตร์` section.
- Missing values stop the workflow. The system must not guess a concentration, unit, duration, temperature, or dose.

### One task at a time

- A step may contain multiple ordered substeps, but each substep performs one observable action.
- Long paragraphs containing several actions must be converted into numbered instructions.
- The primary action and the most important prohibition must be visible before the user scrolls.

### Every uncertainty has an exit

Every applicable step must offer one or more explicit alternatives:

- `ฉันหาไม่เจอ`
- `ฉันไม่รู้ว่าค่านี้คืออะไร`
- `ฉันไม่มีอุปกรณ์นี้`
- `สิ่งที่เห็นไม่เหมือนตัวอย่าง`
- `หยุดขั้นตอนและบันทึกปัญหา`

Selecting an uncertainty path must provide a safe next action and must not silently mark the step as passed.

## Guided Protocol step anatomy

All 22 Guided Protocol steps must use the same information order:

1. **ตอนนี้กำลังทำอะไร** — one plain-language goal.
2. **ตอนนี้ยังห้ามทำอะไร** — prominent warning when order matters.
3. **สิ่งที่ต้องมองหา** — description or approved visual example.
4. **ของที่ต้องหยิบ** — common name, appearance, purpose, and acceptable substitute when one exists.
5. **ทำทีละข้อ** — numbered physical actions.
6. **หยุดทันทีถ้า** — visible fail/safety conditions.
7. **ต้องบันทึกอะไร** — measurements, note, and photo with examples.
8. **ตรวจว่าพร้อมไปต่อหรือยัง** — plain-language confirmation checklist.
9. **ถ้าไม่พร้อม** — a safe branch with recovery instructions.
10. **เหตุผลทางวิทยาศาสตร์** — expandable secondary information.

The runner must not use `objective`, `critical controls`, `pass criteria`, or similar research terminology as visible primary headings. Those concepts remain in the domain model but receive plain Thai interface labels.

## Required rewrite of the 22-step workflow

Each current step must be reviewed and rewritten against the zero-knowledge rules. At minimum, the content must cover:

1. Receiving the plant and recording its starting condition.
2. Checking plant health and separating it from other plants.
3. Confirming the reported plant name and uncertainty level.
4. Finding and marking the intended plant part without cutting.
5. Reading the active-chlorine value from a Haiter label, when applicable.
6. Determining the Haiter volume without requiring user calculation.
7. Preparing a measurable working dilution when direct volume is too small.
8. Preparing culture medium with a batch-specific ingredient list.
9. Running or explicitly skipping a blank-container check.
10. Preparing the clean workspace and tools.
11. Completing the readiness check before cutting.
12. Cutting the selected plant part.
13. Cleaning the outside of the plant piece.
14. Trimming and placing the plant piece into medium.
15. Checking contamination and initial survival.
16. Multiplying shoots.
17. Rooting.
18. Removing plants from culture vessels.
19. Acclimatizing plants to outside conditions.
20. Monitoring health and variegation.
21. Deciding what to do after failure or uncertainty.
22. Closing the Lot, recording evidence, and planning the next plant.

If composed profiles create a different final count, the user-visible workflow must still provide an explicit numbered journey and show why profile-specific steps were added. No step may disappear without a migration or version explanation.

## Dilution experience

The working-dilution workflow must:

- ask for the percentage printed on the product label;
- show where that value is normally found;
- ask for final medium volume;
- ask for the minimum volume the available tool can measure;
- calculate the direct product dose;
- state whether that dose is measurable;
- when it is not measurable, propose a working-dilution plan;
- state exactly how much source product and permitted diluent to measure;
- calculate the new volume to add to the medium;
- reject plans where any required measured volume remains below the tool limit;
- forbid drop counting;
- require a label containing solution name, concentration, preparation date/time, and preparer;
- allow the user to record `ไม่ต้องเจือจาง เพราะปริมาตรตรงวัดได้`;
- keep equations in the expandable science section only.

The system must not recommend a diluent unless the active protocol explicitly permits it. Chemical compatibility and storage stability must not be inferred.

## Accessible visual system

### Typography

- Thai instructional text must use a Thai-optimized, highly legible sans-serif font.
- Geist may remain for English identifiers, Lot IDs, numerical data, code-like values, and compact metadata.
- Primary body text: minimum `18px`.
- Form labels and helper text: minimum `16px`.
- Metadata: minimum `14px`.
- Page headings: `32px` minimum on desktop and `28px` minimum on mobile.
- Step headings: `24px` minimum.
- Body line height: minimum `1.5`.
- Instruction line length should target 45–75 characters on desktop.
- Text must remain usable at browser zoom `200%`.

### Color and contrast

- Normal text and controls must meet WCAG 2.2 AA contrast.
- Status must use text and an icon or shape in addition to color.
- Muted text must remain readable and must not be used for required instructions.
- Focus indicators must have at least a 2px visible outline and sufficient contrast.
- Error, warning, success, evidence state, and disabled state must each have distinct non-color cues.

### Touch and controls

- Minimum interactive target: `48 × 48px`.
- Primary workflow buttons: minimum height `56px`.
- Photo upload button: minimum height `60px`, full available width on mobile, with icon and explicit label.
- Adjacent touch targets must have at least `8px` separation.
- Destructive actions must not sit directly beside the primary continuation action.
- Disabled controls must explain what information or prior step is missing.

### Layout

- Mobile uses one column.
- The current action remains visually dominant.
- Safety and stop conditions appear before optional references.
- Desktop may retain a visible grid, but instructional content must not be compressed into narrow columns.
- A sticky action area may be used only if it does not cover instructions or browser controls.
- Horizontal scrolling is prohibited for primary instructions and forms.

## System-wide review scope

The accessibility and zero-knowledge review covers:

- authentication and first entry;
- Overview;
- navigation shell;
- Knowledge search and Taxon Detail;
- Plant creation and Plant Profile;
- Experiment creation Wizard;
- Guided Protocol Runner;
- step completion and measurement entry;
- Observation forms and timeline;
- media upload, preview, lightbox, soft delete, and restore;
- Protocol list, detail, authoring, publishing, and comparison;
- Research register and review;
- Image review and dataset labeling;
- loading, empty, missing, invalid-schema, migration, success, warning, and error states;
- desktop, tablet, and mobile navigation.

## Photo workflow

- `เพิ่มรูป` becomes an explicit action such as `ถ่ายรูปฉลากไฮเตอร์` or `เพิ่มรูปสภาพต้นไม้`.
- The button must state why the image is needed.
- File selection, camera use, upload progress, success, failure, retry, delete, and restore must each have a visible state.
- The user must be able to proceed without a photo only when the current step does not require photo evidence.
- Required photos must explain what must be visible in frame.

## Navigation and progress

- The first screen must provide one dominant action: `เริ่มจากต้นไม้ 1 ต้น`.
- Navigation labels must use user tasks rather than internal data-model language where possible.
- The runner shows `ขั้นที่ X จาก Y`, the current phase, and the next expected outcome.
- Locked steps explain why they are locked.
- Returning to an earlier step must not discard saved evidence.
- The system must clearly separate `บันทึกร่าง`, `ยืนยันผล`, and `ไปขั้นถัดไป`.

## Evidence and scientific integrity

- `Verified`, `Adapted`, `Experimental`, and `Pending review` remain visible, but each receives a plain-language explanation.
- An evidence badge must not interrupt the main instruction.
- Scientific claims, concentrations, times, and formulas retain their source links.
- AI-generated or inferred content may not be presented as verified.
- A beginner-friendly rewrite may simplify language but must not change the scientific meaning or evidence state.

## Error handling

Errors must answer:

1. What happened?
2. Was any information saved?
3. What should the user do now?

Raw Firebase, Cloudinary, JavaScript, HTTP, or stack-trace messages must not be shown to end users. Technical details may be recorded server-side or placed behind a diagnostic disclosure for authorized users.

## Beginner simulation protocol

The reviewer must deliberately assume no prior knowledge and must not fill gaps from memory.

For every step, the reviewer answers:

- Can I identify what object or plant part the instruction refers to?
- Do I know where to find the requested value?
- Do I know which tool to pick up?
- Does the system calculate any required derived value?
- Is each unit explained or physically actionable?
- Do I know what normal output looks like?
- Do I know when to stop?
- Is there a safe path when I do not know or lack equipment?
- Can I operate every control without precision pointing?
- Can I recover without losing prior data?

A step fails review if any answer is `no`.

## Verification matrix

Automated and browser verification must cover:

- zero-knowledge content contract for all 22 steps;
- no unexplained prohibited terms in primary instructions;
- equations absent from primary action text;
- dilution calculator and working-dilution branches;
- missing label value and inadequate measuring-tool branches;
- target size at least 48px;
- primary action height at least 56px;
- Thai body text at least 18px in the runner;
- WCAG AA color contrast for defined tokens;
- 200% zoom;
- 390px, 1024px, and 1440px viewports;
- keyboard-only navigation;
- visible focus;
- screen-reader names for controls;
- reduced motion;
- long Thai text;
- photo upload, progress, error, retry, delete, and restore;
- loading, empty, error, and migration states;
- Firebase Auth and Firestore emulator;
- `npm test`;
- `npm run lint`;
- `npm run build`;
- `npm run firebase:verify`;
- authenticated production smoke test after deployment.

## Acceptance criteria

The redesign is accepted only when:

- a user with no plant or tissue-culture knowledge can start from one plant and identify the next safe action;
- the user never needs to solve a formula;
- all required values state where they come from;
- each step has a safe uncertainty path;
- instructions remain readable for older users and at 200% zoom;
- important controls are easy to press on mobile;
- the complete Pink Princess Haiter workflow passes beginner simulation;
- the Pink Princess pressure-sterilization workflow passes beginner simulation;
- the Violin adapted workflow passes beginner simulation;
- no workflow publishes unsupported values as verified;
- all automated, emulator, responsive, keyboard, and production checks pass.

## Out of scope

- replacing scientific review with simplified copy;
- automatic species identification;
- recommending chemical values without an approved source;
- redesigning the machine-learning model;
- medical accessibility claims;
- guaranteeing suitability for every disability without user testing.

