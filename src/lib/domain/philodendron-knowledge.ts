// เหลือเฉพาะรายชื่อ taxon ที่คลังหลังบ้านใช้ค้นหา ส่วนเนื้อหาคู่มือ สูตรอาหาร
// และหลักฐานย้ายไปอยู่ที่ src/lib/manual/ ซึ่งมีเทสต์บังคับกฎหลักฐานคุมอยู่
import type { TaxonRank, TaxonRecord } from "./knowledge-library";
import generatedCatalog from "./philodendron-catalog.generated.json";

const baseTaxa: TaxonRecord[] = [
  { id: "family-araceae", scientificName: "Araceae", displayName: "Araceae", rank: "family", parentId: null, synonyms: [], commonNames: ["วงศ์บอน"], confidence: "High", evidenceState: "Verified", sourceIds: ["source-kew-araceae"], createdAt: "", updatedAt: "" },
  { id: "genus-philodendron", scientificName: "Philodendron", displayName: "Philodendron", rank: "genus", parentId: "family-araceae", synonyms: [], commonNames: [], confidence: "High", evidenceState: "Verified", sourceIds: ["source-kew-philodendron"], createdAt: "", updatedAt: "" },
  { id: "species-philodendron-erubescens", scientificName: "Philodendron erubescens", displayName: "Philodendron erubescens", rank: "species", parentId: "genus-philodendron", synonyms: [], commonNames: ["blushing philodendron"], confidence: "High", evidenceState: "Verified", sourceIds: ["source-kew-philodendron"], createdAt: "", updatedAt: "" },
  { id: "cultivar-pink-princess", scientificName: "Philodendron erubescens", displayName: "Pink Princess", rank: "cultivar", parentId: "species-philodendron-erubescens", synonyms: ["Philodendron Pink Princess"], commonNames: ["PPP"], confidence: "Medium", evidenceState: "Adapted", sourceIds: ["source-pp-2023", "source-pp-2025"], createdAt: "", updatedAt: "" },
  { id: "species-philodendron-bipennifolium", scientificName: "Philodendron bipennifolium", displayName: "Philodendron bipennifolium", rank: "species", parentId: "genus-philodendron", synonyms: [], commonNames: ["horsehead philodendron"], confidence: "High", evidenceState: "Verified", sourceIds: ["source-kew-philodendron"], createdAt: "", updatedAt: "" },
  { id: "trade-name-violin-variegated", scientificName: "Philodendron bipennifolium", displayName: "Violin variegated", rank: "trade-name", parentId: "species-philodendron-bipennifolium", synonyms: ["Violin", "Philodendron Violin"], commonNames: [], confidence: "Low", evidenceState: "Experimental", sourceIds: ["source-violin-gap"], createdAt: "", updatedAt: "" },
];

const generatedSpecies = generatedCatalog as TaxonRecord[];
export const philodendronTaxa: TaxonRecord[] = [...baseTaxa, ...generatedSpecies.filter((record) => !baseTaxa.some((base) => base.rank === "species" && base.scientificName === record.scientificName))];

export type { TaxonRank };
