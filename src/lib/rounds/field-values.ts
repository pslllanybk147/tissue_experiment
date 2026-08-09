export type StepResponseValue = number | string | boolean | null;
export type StepResponses = Record<string, StepResponseValue>;

export function decodeStepValues(run: {
  measurements?: Record<string, number | null>;
  responses?: StepResponses;
}): StepResponses {
  return { ...(run.measurements ?? {}), ...(run.responses ?? {}) };
}

export function encodeStepValues(values: StepResponses): {
  measurements: Record<string, number | null>;
  responses: StepResponses;
} {
  const measurements: Record<string, number | null> = {};
  for (const [key, value] of Object.entries(values)) {
    if (typeof value === "number") measurements[key] = value;
  }
  return { measurements, responses: { ...values } };
}
