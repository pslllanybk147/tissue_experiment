import type { GrowthForm } from "./forms/types";
import type { GenusPack } from "./genera/types";
import type { ManualStepDef, PlantPack, ResolvedManual, ResolvedStep, StepOrigin } from "./types";

export type ResolveContext = {
  library: Record<string, ManualStepDef>;
  form?: GrowthForm | null;
  genus?: GenusPack | null;
};

/** ประกอบคู่มือโดยทับค่าจากบนลงล่าง core → form → genus → species
 *  ชั้นล่างชนะเสมอ และฟิลด์ที่ชั้นล่างไม่พูดถึงจะตกทอดจากชั้นบนมาเอง
 *
 *  ขั้นที่แผ่นเสริมเขียนเองทั้งขั้น (pack.steps) ไม่รับการทับจากทรงหรือสกุล
 *  เพราะการเขียนขั้นใหม่แปลว่าตั้งใจไม่ใช้ของกลางแล้ว
 *
 *  origin บอกชั้นล่างสุดที่แตะขั้นนั้น ใช้ในหน้าตรวจทานเพื่อให้รู้ว่าค่ามาจากไหน */
export function resolveManual(pack: PlantPack, context: ResolveContext): ResolvedManual {
  const { library, form, genus } = context;
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

    const formLayer = packStep ? undefined : form?.stepOverrides?.[stepId];
    const genusLayer = packStep ? undefined : genus?.deviations[stepId];

    let origin: StepOrigin = "core";
    if (packStep) origin = "pack";
    else if (override) origin = "override";
    else if (genusLayer) origin = "genus";
    else if (formLayer) origin = "form";

    // ค่าช่วงรวมจากบนลงล่างทีละคีย์ ต่างจากฟิลด์อื่นที่ทับกันทั้งก้อน
    // เพราะทรงอาจให้ค่าหลายคีย์ แล้วสกุลทับเพียงคีย์เดียว ถ้าทับทั้งก้อนคีย์อื่นจะหาย
    //
    // ต้องรวมทั้งค่าระดับทรง/สกุล (defaultDoses, doses) และค่าที่ให้มากับขั้นนั้นโดยตรง
    // (stepOverrides, deviations) เพราะทั้งสองทางเป็นที่ที่คนเขียนใส่ค่าได้จริง
    // เรียงจากอ่อนไปแก่ตาม cascade คือ core → form → genus → species
    const doses = {
      ...(base.doses ?? {}),
      ...(packStep ? {} : form?.defaultDoses ?? {}),
      ...(formLayer?.doses ?? {}),
      ...(packStep ? {} : genus?.doses ?? {}),
      ...(genusLayer?.doses ?? {}),
      ...(override?.doses ?? {}),
    };

    return {
      ...structuredClone(base),
      ...(formLayer ?? {}),
      ...(genusLayer ?? {}),
      ...(override ?? {}),
      doses: Object.keys(doses).length > 0 ? doses : undefined,
      id: stepId,
      order: index,
      origin,
    };
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
