import { coreSteps } from "./core-steps";
import { formById } from "./forms/registry";
import { genusById } from "./genera/registry";
import { resolveManual } from "./resolve";
import { genericPhilodendronPack } from "./species/generic-philodendron";
import { pinkPrincessPack } from "./species/pink-princess";
import { rhaphidophoraTetraspermaVariegataPack } from "./species/rhaphidophora-tetrasperma-variegata";
import { scindapsusExoticaPack } from "./species/scindapsus-exotica";
import { thaiConstellationPack } from "./species/thai-constellation";
import { violinVariegatedPack } from "./species/violin-variegated";
import type { PlantPack, ResolvedManual } from "./types";

export const plantPacks: PlantPack[] = [
  pinkPrincessPack,
  violinVariegatedPack,
  thaiConstellationPack,
  scindapsusExoticaPack,
  rhaphidophoraTetraspermaVariegataPack,
  genericPhilodendronPack,
];

export function allSlugs(): string[] {
  return plantPacks.map((pack) => pack.slug);
}

export function packBySlug(slug: string): PlantPack | null {
  return plantPacks.find((pack) => pack.slug === slug) ?? null;
}

export function resolveBySlug(slug: string): ResolvedManual | null {
  const pack = packBySlug(slug);
  if (!pack) return null;
  return resolveManual(pack, {
    library: coreSteps,
    form: pack.growthFormId ? formById(pack.growthFormId) : null,
    genus: pack.genusId ? genusById(pack.genusId) : null,
  });
}
