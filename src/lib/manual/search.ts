import { growthForms } from "./forms/registry";
import { generaPacks } from "./genera/registry";
import { plantPacks } from "./registry";

export type SearchHit =
  | { kind: "species"; slug: string; title: string; subtitle: string }
  | { kind: "genus"; formId: string; title: string; subtitle: string }
  | { kind: "form"; formId: string; title: string; subtitle: string };

function matches(haystacks: string[], needle: string): boolean {
  return haystacks.some((text) => text.toLowerCase().includes(needle));
}

/** เรียงจากเจาะจงที่สุดไปกว้างที่สุด ชนิด → สกุล → ทรง
 *  เพราะยิ่งเจาะจง หลักฐานยิ่งตรงพันธุ์ ผู้ใช้ควรเห็นของที่ดีที่สุดก่อน */
export function searchPlants(query: string): SearchHit[] {
  const needle = query.trim().toLowerCase();
  if (needle.length === 0) return [];

  const hits: SearchHit[] = [];

  for (const pack of plantPacks) {
    if (!matches([pack.commonName, pack.scientificName], needle)) continue;
    hits.push({ kind: "species", slug: pack.slug, title: pack.commonName, subtitle: pack.scientificName });
  }

  for (const pack of generaPacks) {
    if (!matches([pack.scientificName, ...pack.commonNames], needle)) continue;
    hits.push({
      kind: "genus",
      formId: pack.growthFormId,
      title: `สกุล ${pack.scientificName}`,
      subtitle: pack.commonNames.join(" · "),
    });
  }

  for (const form of growthForms) {
    if (!matches([form.label, form.plainDescription], needle)) continue;
    hits.push({ kind: "form", formId: form.id, title: form.label, subtitle: form.plainDescription });
  }

  return hits;
}
