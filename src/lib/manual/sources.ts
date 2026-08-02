export type ManualSourceKind = "taxonomy" | "peer-reviewed" | "technical-guide" | "research-gap";

export type ManualSourceRecord = {
  id: string;
  title: string;
  url: string;
  kind: ManualSourceKind;
  accessedAt: string;
};

export const manualSources: ManualSourceRecord[] = [
  {
    id: "source-pp-2023",
    title: "In Vitro Propagation of Philodendron erubescens ‘Pink Princess’ and Ex Vitro Acclimatization of the Plantlets",
    url: "https://doi.org/10.3390/horticulturae9060688",
    kind: "peer-reviewed",
    accessedAt: "2026-08-02",
  },
  {
    id: "source-pp-2025",
    title: "Development of an Efficient Micropropagation Protocol for Philodendron erubescens ‘Pink Princess’ Using a Temporary Immersion System and Assessment of Genetic Fidelity",
    url: "https://doi.org/10.3390/horticulturae11091085",
    kind: "peer-reviewed",
    accessedAt: "2026-08-02",
  },
  {
    id: "source-ruaysap-chemical-sterilization",
    title: "Chemical Sterilization in MS Culture Medium for In vitro Culture of Philodendron sp. “Ruaysap”",
    url: "https://li01.tci-thaijo.org/index.php/pnujr/article/view/246876",
    kind: "peer-reviewed",
    accessedAt: "2026-08-02",
  },
  {
    id: "source-white-knight-2025",
    title: "Micropropagation of Philodendron ‘White Knight’ via Shoot Regeneration from Petiole Explants",
    url: "https://doi.org/10.3390/plants14111714",
    kind: "peer-reviewed",
    accessedAt: "2026-08-02",
  },
  {
    id: "source-merck-media-sterilization",
    title: "Media Sterilization — Plant Tissue Culture Protocol",
    url: "https://www.merckmillipore.com/AL/en/technical-documents/protocol/cell-culture-and-cell-culture-analysis/cell-culture-media-preparation/media-sterilization",
    kind: "technical-guide",
    accessedAt: "2026-08-02",
  },
  {
    id: "source-uf-shoot-cultures",
    title: "Types of Tissue Culture — Shoot Cultures, University of Florida IFAS",
    url: "https://propg.ifas.ufl.edu/09-tissue-culture/01-types/08-tctypes-shootcultures.html",
    kind: "technical-guide",
    accessedAt: "2026-08-02",
  },
  {
    id: "source-kew-philodendron",
    title: "Plants of the World Online — Philodendron Schott",
    url: "https://powo.science.kew.org/taxon/urn%3Alsid%3Aipni.org%3Anames%3A326132-2",
    kind: "taxonomy",
    accessedAt: "2026-08-02",
  },
  {
    id: "source-kew-wcvp-v15",
    title: "World Checklist of Vascular Plants v15",
    url: "https://doi.org/10.15468/6h8ucr",
    kind: "taxonomy",
    accessedAt: "2026-08-02",
  },
  {
    id: "source-violin-gap",
    title: "Violin variegated evidence register — ยังไม่พบงานตรงพันธุ์",
    url: "https://powo.science.kew.org/taxon/urn%3Alsid%3Aipni.org%3Anames%3A326132-2",
    kind: "research-gap",
    accessedAt: "2026-08-02",
  },
];

export function sourceById(id: string): ManualSourceRecord | null {
  return manualSources.find((item) => item.id === id) ?? null;
}
