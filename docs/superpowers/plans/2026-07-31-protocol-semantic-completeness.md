# Protocol Semantic Completeness Implementation Plan

## Goal

Make every Pink Princess Haiter Protocol v2 step usable without outside knowledge. Eliminate generic material descriptions, bind quantities to the saved Lot, and block protocol readiness when instructions are semantically vague or attached to the wrong material.

## Root cause

`describeBeginnerMaterial()` currently uses broad keyword matching. Any name containing `ภาชนะ` receives the culture-jar quantity from the Wizard, so rinse vessels and quarantine containers are described incorrectly. The completeness validator only checks whether fields are non-empty; it does not reject generic or contextually wrong wording.

## Implementation

1. Add failing tests for rinse vessels, culture jars, exact Lot values, and prohibited generic phrases.
2. Allow guided steps to provide explicit `BeginnerMaterial` records instead of regenerating every material from a name.
3. Define contextual material records for all 14 guided steps, including exact quantities from `mediumBatch` where applicable.
4. Add semantic validation that rejects generic placeholders, Wizard references, vague quantities, and mismatched rinse/culture-container wording.
5. Extend browser verification to open the created v2 Lot and check rendered step content for prohibited phrases and expected exact quantities.
6. Run unit tests, lint, build, Firebase emulator verification, and all viewport UI checks.
7. Record the root cause, fixes, evidence, and deployment commit in `handoff.md`, then push directly to `master`.

## Completion evidence

- Every one of the 14 v2 steps passes semantic validation.
- Rinse water is explicitly three separately labelled containers and never tied to culture-jar count.
- Culture jars show the exact saved Lot split: culture, Blank, spare, and total.
- No ready v2 instruction contains `Wizard`, `เตรียม 1 รายการต่อ Lot`, `มองหาของที่มีชื่อว่า`, or other generic fallback copy.
- Full automated verification and sandbox UI verification pass before push.
