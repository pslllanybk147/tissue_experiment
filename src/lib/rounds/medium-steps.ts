import type { MediaRecipe, MediaRecipeIdsByStep, MediumStepId } from "@/lib/manual/types";
import { mediaRecipeIdsForStep } from "@/lib/manual/media-recipe-selection";

/** ขั้นที่ต้องทำอาหารจริง ๆ ไม่ใช่แค่ขั้นเตรียมตอนต้น มีสามขั้นตามธรรมเนียมสูตร
 *  establishment/multiplication/rooting ของ mediaRecipes (ดู species/*.ts)
 *  ก่อนหน้านี้เครื่องคำนวณโชว์แค่ขั้น prep-media ทำให้ผู้ใช้ที่มาถึงขั้นเพิ่มจำนวน/ออกราก
 *  หลายสัปดาห์ต่อมาไม่มีทางรู้ปริมาณอาหารที่ต้องทำเลย ต้องย้อนกลับไปขั้นแรกเอง
 *
 *  อยู่แยกจาก medium-calculator.tsx เพราะไฟล์นั้นมี "use client" การ import ค่าธรรมดา
 *  (ไม่ใช่คอมโพเนนต์) จากไฟล์ client เข้า server component อย่าง step-detail.tsx ใช้ไม่ได้
 *  ตอน build จะพังแบบเงียบจนกว่าจะ prerender จริง */
export const MEDIUM_CALCULATOR_STEP_IDS = new Set(["prep-media", "multiply", "root"]);

/** พันธุ์ที่ชื่อสูตรไม่ตรงธรรมเนียมประกาศ mapping ใน PlantPack; ถ้าไม่มีสูตรตรงขั้นจะคืนค่าว่างแทนการเดา */
export function initialRecipeIdForStep(
  stepId: string,
  recipes?: MediaRecipe[],
  declared?: MediaRecipeIdsByStep,
): string | undefined {
  if (recipes && (stepId === "prep-media" || stepId === "multiply" || stepId === "root")) {
    return mediaRecipeIdsForStep(recipes, stepId as MediumStepId, declared)[0];
  }
  if (stepId === "multiply") return "multiplication";
  if (stepId === "root") return "rooting";
  return undefined;
}

export function recipeIdsForStep(
  recipes: MediaRecipe[],
  stepId: string,
  declared?: MediaRecipeIdsByStep,
): string[] {
  if (stepId !== "prep-media" && stepId !== "multiply" && stepId !== "root") return [];
  return mediaRecipeIdsForStep(recipes, stepId, declared);
}
