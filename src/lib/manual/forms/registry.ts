import { climbingVineVisibleNode } from "./climbing-vine-visible-node";
import type { GrowthForm } from "./types";

export const growthForms: GrowthForm[] = [climbingVineVisibleNode];

export function formById(id: string): GrowthForm | null {
  return growthForms.find((form) => form.id === id) ?? null;
}
