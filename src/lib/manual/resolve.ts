import type { GrowthForm } from "./forms/types";
import type { GenusPack } from "./genera/types";
import type { ManualStepDef, PlantPack, ResolvedManual, ResolvedStep, StepOrigin } from "./types";
import { ensureSterilizeOption, materializeExecutionInstructions } from "./execution-instructions";

export type ResolveContext = {
  library: Record<string, ManualStepDef>;
  form?: GrowthForm | null;
  genus?: GenusPack | null;
};

/** ข้อความทางเลือก rinse รุ่นเก่าเคยยัดเหตุผล คำสั่ง และทางถอยไว้ในบรรทัดเดียว
 * แบ่งที่หัวประโยคซึ่งมีความหมายชัด เพื่อให้หนึ่งรายการอ่านเป็นหนึ่งความคิดในทุก plant pack */
function beginnerActionLines(actions: string[]): string[] {
  return actions.flatMap((action) => action
    .split(/(?=แนวคิดคือ|ถ้าไม่มั่นใจ|หมายเหตุ:)/g)
    .map((part) => part.trim())
    .filter(Boolean));
}

function mediaExecutionInstructions(pack: PlantPack) {
  const recipeReference = pack.mediaRecipes
    .map((recipe) => `${recipe.title}: pH ${recipe.pH}`)
    .join(" · ");
  const recipeNames = pack.mediaRecipes.map((recipe) => recipe.title).join(" / ");
  const recipeIngredients = pack.mediaRecipes
    .map((recipe) => `${recipe.title}: ${recipe.ingredients.filter((ingredient) => ingredient.unit !== "mg/L" && !ingredient.name.toLowerCase().includes("agar")).map((ingredient) => `${ingredient.name} ${ingredient.amountPerLiter} ${ingredient.unit}${ingredient.unit === "×" ? " ตามอัตรา g/L บนฉลาก" : ""}`).join(" · ")}`)
    .join(" | ");

  return [
    {
      label: "เลือกสูตรและคำนวณ batch",
      action: "เลือกสูตรอาหารที่จะทำในเครื่องคำนวณด้านล่าง แล้วกรอกจำนวนกระปุก ปริมาตรต่อกระปุก และค่าความละเอียดของเครื่องชั่ง/การตวง",
      quantity: `สูตรที่เลือกได้: ${recipeNames}`,
      completion: "เครื่องคำนวณแสดงปริมาตรรวมและปริมาณส่วนผสมของสูตรที่เลือกแล้ว",
      next: "ใช้ตัวเลขจากผลคำนวณในข้อถัดไป ห้ามกะปริมาณเอง",
    },
    {
      label: "ตรวจ pH meter",
      action: "ตรวจวันคาลิเบรต pH meter ถ้าเกินหนึ่งเดือนหรือจำไม่ได้ ให้คาลิเบรตใหม่ก่อนวัด",
      materials: ["pH meter", "สารละลายคาลิเบรตตามคู่มือเครื่อง"],
      completion: "pH meter พร้อมใช้งานและอ่านค่าได้คงที่",
    },
    {
      label: "วัดน้ำก่อนผสม",
      action: "วัดค่า ppm ของน้ำที่จะใช้ แล้วจดค่าจริงไว้ในบันทึกรอบ",
      materials: ["น้ำที่จะใช้ผสมอาหาร", "เครื่องวัด ppm"],
      completion: "มีค่า ppm และวันที่วัดบันทึกไว้",
    },
    {
      label: "ละลายส่วนผสมหลัก",
      action: "ตวงน้ำตามปริมาตรรวมจากเครื่องคำนวณ ค่อย ๆ ละลาย MS basal salts แล้วน้ำตาลให้ใสก่อนเติมส่วนผสมถัดไป",
      quantity: recipeIngredients,
      completion: "สารละลายใส ไม่มีผง MS หรือน้ำตาลตกค้างที่ก้นภาชนะ",
    },
    {
      label: "เติมน้ำยาแม่",
      action: "ตวงฮอร์โมนจากน้ำยาแม่ตามผลคำนวณ แล้วเติมลงในสารละลาย ห้ามชั่งผงฮอร์โมนเอง",
      materials: ["น้ำยาแม่ฮอร์โมนที่มีฉลากความเข้มข้น", "syringe หรืออุปกรณ์ตวงที่ละเอียดพอ"],
      quantity: pack.mediaRecipes
        .map((recipe) => `${recipe.title}: ${recipe.ingredients.filter((ingredient) => ingredient.unit === "mg/L").map((ingredient) => `${ingredient.name} ${ingredient.amountPerLiter} mg/L ในน้ำยาแม่`).join(" · ") || "ไม่มีฮอร์โมนในสูตรนี้"}`)
        .join(" | "),
      completion: "เติมน้ำยาแม่ครบตามรายการและจด stock/ปริมาตรที่ใช้จริง",
    },
    {
      label: "ปรับ pH",
      action: "วัด pH ของสารละลาย แล้วปรับ pH ให้ตรงกับค่าเป้าหมายของสูตรที่เลือก",
      quantity: recipeReference,
      materials: ["pH meter", "สารละลาย pH up/down"],
      completion: `ค่า pH อยู่ตรงกับสูตรที่เลือก (${recipeReference}) ก่อนใส่วุ้น`,
      next: "เมื่อ pH ถึงเป้าหมายแล้วจึงใส่ผงวุ้น",
    },
    {
      label: "เติมผงวุ้น",
      action: "ชั่งผงวุ้นตามผลคำนวณ เติมหลังปรับ pH แล้วคนให้กระจายตัว",
      quantity: pack.mediaRecipes
        .map((recipe) => `${recipe.title}: ${recipe.ingredients.find((ingredient) => ingredient.name.toLowerCase().includes("agar"))?.name ?? "Agar"} ${recipe.ingredients.find((ingredient) => ingredient.name.toLowerCase().includes("agar"))?.amountPerLiter ?? "ไม่ระบุ"} g/L`)
        .join(" | "),
      completion: "ผงวุ้นกระจายทั่วสารละลาย ไม่มีผงจับเป็นก้อน",
    },
    {
      label: "แบ่งและติดป้าย",
      action: "แบ่งอาหารลงกระปุกตามปริมาตรต่อกระปุกที่กรอกไว้ แล้วติดป้ายรหัสรอบ/สูตรให้ครบทุกกระปุก",
      quantity: "จำนวนกระปุกและ mL ต่อกระปุกจะเปลี่ยนตาม batch ที่กรอกในเครื่องคำนวณ; เมื่ออยู่ในหน้ารอบเพาะ ระบบจะแสดงตัวเลขจริงของ batch นี้",
      completion: "กระปุกทุกใบมีป้ายอ่านได้และปริมาตรใกล้เคียงกัน",
    },
    {
      label: "ฆ่าเชื้ออาหารด้วยวิธีมาตรฐาน",
      action: "นึ่งกระปุกอาหารด้วยหม้อนึ่งที่ 121°C ความดัน 15 psi แล้วเริ่มจับเวลาเมื่อถึงอุณหภูมิ/ความดันเป้าหมาย",
      container: "หม้อนึ่ง",
      durationLabel: "15–20 นาที",
      completion: "ครบเวลาแล้ว ปล่อยความดันลงตามคู่มือหม้อนึ่งก่อนเปิด",
      next: "ปล่อยให้อาหารเย็นและเซ็ตตัวก่อนนำไปใช้",
    },
    {
      label: "ทางเลือก NaDCC",
      action: "หากจะทดลองใช้ NaDCC แทนการนึ่ง ให้หยุดที่การเตรียมอาหารหลักก่อน แล้วเปิดเครื่องคำนวณ NaDCC แยกต่างหากและบันทึกว่าเป็นแขนทดลอง ไม่ใช่ขั้นบังคับของสูตรหลัก",
      tone: "warning" as const,
      completion: "มีการระบุแขนทดลองและปริมาณที่คำนวณจากฉลากจริงก่อนใช้",
    },
  ];
}

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

    const resolved = {
      ...structuredClone(base),
      ...(formLayer ?? {}),
      ...(genusLayer ?? {}),
      ...(override ?? {}),
      doses: Object.keys(doses).length > 0 ? doses : undefined,
      id: stepId,
      order: index,
      origin,
    };
    const actions = beginnerActionLines(resolved.actions);
    const resolvedStep = { ...resolved, actions };
    const baseInstructions = resolved.executionInstructions
      ?? (stepId === "prep-media" || stepId === "multiply" || stepId === "root"
        ? mediaExecutionInstructions(pack)
        : materializeExecutionInstructions(resolvedStep));
    const executionInstructions = ensureSterilizeOption(baseInstructions, resolvedStep);
    return {
      ...resolved,
      actions,
      executionInstructions,
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
