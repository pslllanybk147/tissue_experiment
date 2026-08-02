import type { ManualStepDef, PlantPack, ResolvedManual, ResolvedStep, StepOrigin } from "./types";

export function resolveManual(pack: PlantPack, library: Record<string, ManualStepDef>): ResolvedManual {
  const seen = new Set<string>();
  const steps: ResolvedStep[] = pack.sequence.map((stepId, index) => {
    if (seen.has(stepId)) throw new Error(`ขั้นตอน ${stepId} ถูกใส่ใน sequence ซ้ำ`);
    seen.add(stepId);

    const packStep = pack.steps?.[stepId];
    const override = pack.overrides?.[stepId];

    if (packStep && override) {
      throw new Error(`ขั้นตอน ${stepId} เป็นของแผ่นเสริมอยู่แล้ว ไม่ต้องใส่ override`);
    }

    const base = packStep ?? library[stepId];
    if (!base) throw new Error(`ไม่พบขั้นตอน ${stepId} ทั้งในแกนกลางและในแผ่นเสริม`);

    const origin: StepOrigin = packStep ? "pack" : override ? "override" : "core";
    return { ...structuredClone(base), ...(override ?? {}), id: stepId, order: index, origin };
  });

  return {
    slug: pack.slug,
    scientificName: pack.scientificName,
    commonName: pack.commonName,
    method: pack.method,
    summary: pack.summary,
    durationLabel: pack.durationLabel,
    steps,
    mediaRecipes: structuredClone(pack.mediaRecipes),
    sourceIds: [...pack.sourceIds],
  };
}
