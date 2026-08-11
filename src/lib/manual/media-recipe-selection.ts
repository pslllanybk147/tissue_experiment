import type { MediaRecipe, MediaRecipeIdsByStep, MediumStepId } from "./types";

const conventionalRecipeId: Partial<Record<MediumStepId, string>> = {
  multiply: "multiplication",
  root: "rooting",
};

/**
 * คืนสูตรที่แผ่นเสริมประกาศว่าใช้ในขั้นนั้นจริง ๆ
 * ไม่มี fallback ไปสูตรแรก เพราะสูตรแรกอาจเป็นคนละช่วงหรือคนละวงจรชีวิต
 */
export function mediaRecipeIdsForStep(
  recipes: MediaRecipe[],
  stepId: MediumStepId,
  declared?: MediaRecipeIdsByStep,
): string[] {
  const declaredIds = declared?.[stepId];
  if (declaredIds) return declaredIds.filter((id) => recipes.some((recipe) => recipe.id === id));

  const conventional = conventionalRecipeId[stepId];
  if (conventional && recipes.some((recipe) => recipe.id === conventional)) return [conventional];
  if (stepId === "prep-media" && recipes[0]) return [recipes[0].id];
  return [];
}
