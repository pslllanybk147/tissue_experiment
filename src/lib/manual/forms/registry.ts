import { climbingVineVisibleNode } from "./climbing-vine-visible-node";
import { culmNode } from "./culm-node";
import { leafVeinBud } from "./leaf-vein-bud";
import { pseudobulbNode } from "./pseudobulb-node";
import { rhizomeBud } from "./rhizome-bud";
import { rosetteSheathedNode } from "./rosette-sheathed-node";
import { thickLeafNoStem } from "./thick-leaf-no-stem";
import { woodyShrubNode } from "./woody-shrub-node";
import type { GrowthForm } from "./types";

/** เรียงตามความยากสำหรับมือใหม่ เพื่อให้ลำดับในไฟล์ตรงกับลำดับที่ผู้ใช้เห็นที่ /start */
export const growthForms: GrowthForm[] = [
  climbingVineVisibleNode,
  rhizomeBud,
  thickLeafNoStem,
  leafVeinBud,
  culmNode,
  rosetteSheathedNode,
  pseudobulbNode,
  woodyShrubNode,
];

export function formById(id: string): GrowthForm | null {
  return growthForms.find((form) => form.id === id) ?? null;
}
