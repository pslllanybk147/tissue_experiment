import { coreSteps } from "./core-steps";
import { resolveManual } from "./resolve";
import { genericPhilodendronPack } from "./species/generic-philodendron";
import { pinkPrincessPack } from "./species/pink-princess";
import { violinVariegatedPack } from "./species/violin-variegated";
import type { PlantPack, ResolvedManual } from "./types";

export const plantPacks: PlantPack[] = [pinkPrincessPack, violinVariegatedPack, genericPhilodendronPack];

export function allSlugs(): string[] {
  return plantPacks.map((pack) => pack.slug);
}

export function packBySlug(slug: string): PlantPack | null {
  return plantPacks.find((pack) => pack.slug === slug) ?? null;
}

export function resolveBySlug(slug: string): ResolvedManual | null {
  const pack = packBySlug(slug);
  return pack ? resolveManual(pack, coreSteps) : null;
}
