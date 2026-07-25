import { describe, expect, it } from "vitest";

import { stepsForTemplate } from "./protocol-templates";
import {
  composeGuidedSteps,
  profileById,
} from "./sterilization-profiles";
import { isBeginnerReadyStep } from "./zero-knowledge-protocol";

const templateIds = [
  "template-pink-princess-nodal",
  "template-violin-nodal",
  "template-generic-philodendron",
];

const profileIds = [
  "haiter-chemical-v1",
  "pressure-sterilization-v1",
];

describe("beginner journey simulation", () => {
  it.each(templateIds)("gives every base step complete physical guidance: %s", (templateId) => {
    const steps = stepsForTemplate(templateId);

    expect(steps.length).toBeGreaterThan(0);
    expect(steps.filter(isBeginnerReadyStep).map((step) => step.id)).toEqual(
      steps.map((step) => step.id),
    );
  });

  it.each(profileIds)("gives every sterilization step complete physical guidance: %s", (profileId) => {
    const profile = profileById(profileId);
    expect(profile.steps.filter(isBeginnerReadyStep).map((step) => step.id)).toEqual(
      profile.steps.map((step) => step.id),
    );
  });

  it.each(templateIds)("builds a stable 22-position guided journey: %s", (templateId) => {
    const journey = composeGuidedSteps(
      stepsForTemplate(templateId),
      profileById("haiter-chemical-v1"),
    );

    expect(journey).toHaveLength(22);
    expect(journey.map((step) => step.order)).toEqual(
      Array.from({ length: 22 }, (_, index) => index),
    );
    expect(journey.filter(isBeginnerReadyStep)).toHaveLength(22);
  });

  it("keeps marking before cutting and medium readiness before cutting", () => {
    const journey = composeGuidedSteps(
      stepsForTemplate("template-pink-princess-nodal"),
      profileById("haiter-chemical-v1"),
    );
    const mark = journey.findIndex((step) => step.workflowPhase === "mark-explant");
    const ready = journey.findIndex((step) => step.workflowPhase === "readiness");
    const cut = journey.findIndex((step) => step.workflowPhase === "explant-cut");

    expect(mark).toBeLessThan(ready);
    expect(ready).toBeLessThan(cut);
  });

  it("does not expose an unexplained dilution equation in primary actions", () => {
    const journey = composeGuidedSteps(
      stepsForTemplate("template-pink-princess-nodal"),
      profileById("haiter-chemical-v1"),
    );
    const primaryCopy = journey.flatMap((step) => step.beginner?.actions ?? []).join(" ");

    expect(primaryCopy).not.toMatch(/C1V1|C2V2|Cworking|V1/);
  });
});
