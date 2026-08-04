export type ManualSourceKind = "taxonomy" | "peer-reviewed" | "technical-guide" | "research-gap" | "patent" | "anecdotal";

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
    title: "Plants of the World Online — Philodendron Schott (ระดับสกุล)",
    url: "https://powo.science.kew.org/taxon/urn%3Alsid%3Aipni.org%3Anames%3A326132-2",
    kind: "taxonomy",
    accessedAt: "2026-08-02",
  },
  {
    id: "source-kew-erubescens",
    title: "Plants of the World Online — Philodendron erubescens K.Koch & Augustin (ระดับสปีชีส์)",
    url: "https://powo.science.kew.org/taxon/urn%3Alsid%3Aipni.org%3Anames%3A87759-1",
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
    id: "source-pp-thai-2023",
    title: "การขยายพันธุ์ต้นฟิโลเดรนดรอนพิงค์ปริ้นเซส (Philodendron erubescens) โดยเทคนิคการเพาะเลี้ยงเนื้อเยื่อ",
    url: "https://li04.tci-thaijo.org/index.php/VRU_AFJ/article/view/7384",
    kind: "peer-reviewed",
    accessedAt: "2026-08-02",
  },
  {
    id: "source-anthurium-review-2010",
    title: "Tissue Culture of Anthurium andreanum: A Significant Review and Future Prospective",
    url: "https://scialert.net/fulltext/?doi=ijb.2010.207.219",
    kind: "peer-reviewed",
    accessedAt: "2026-08-02",
  },
  {
    id: "source-browning-review-2024",
    title: "Traditional and next-generation methods for browning control in plant tissue culture",
    url: "https://www.sciencedirect.com/science/article/pii/S2214662824000215",
    kind: "peer-reviewed",
    accessedAt: "2026-08-02",
  },
  {
    id: "source-sigma-explant-sterilization",
    title: "Explant Sterilization — Plant Tissue Culture Protocol",
    url: "https://www.sigmaaldrich.com/US/en/technical-documents/protocol/cell-culture-and-cell-culture-analysis/plant-tissue-culture/explant-sterilization",
    kind: "technical-guide",
    accessedAt: "2026-08-02",
  },
  {
    id: "source-naocl-viability",
    title: "The Effect of Sodium Hypochlorite Solutions on the Viability and In Vitro Regeneration Capacity of the Tissue",
    url: "https://www.eurekaselect.com/article/46843",
    kind: "peer-reviewed",
    accessedAt: "2026-08-02",
  },
  {
    id: "source-violin-gap",
    title: "Violin variegated evidence register — ยังไม่พบงานตรงพันธุ์ (species-direct)",
    url: "https://powo.science.kew.org/taxon/urn:lsid:ipni.org:names:87662-1",
    kind: "research-gap",
    accessedAt: "2026-08-04",
  },
  {
    id: "source-kew-bipennifolium",
    title: "Plants of the World Online — Philodendron bipennifolium Schott (ระดับสปีชีส์)",
    url: "https://powo.science.kew.org/taxon/urn:lsid:ipni.org:names:87662-1",
    kind: "taxonomy",
    accessedAt: "2026-08-04",
  },
  {
    id: "source-selfheading-philodendron-2012",
    title: "Micropropagation of self-heading Philodendron via direct shoot regeneration",
    url: "https://www.sciencedirect.com/science/article/abs/pii/S030442381200177X",
    kind: "peer-reviewed",
    accessedAt: "2026-08-04",
  },
  {
    id: "source-us-patent-4855236",
    title: "US4855236A — Process for plant tissue culture propagation (Philodendron ‘Burgundy’, Example 1)",
    url: "https://patents.google.com/patent/US4855236A/en",
    kind: "patent",
    accessedAt: "2026-08-04",
  },
  {
    id: "source-cannifolium-2008",
    title: "In vitro micropropagation of Philodendron cannifolium",
    url: "https://koreascience.or.kr/article/JAKO200835054214957.page",
    kind: "peer-reviewed",
    accessedAt: "2026-08-04",
  },
  {
    id: "source-birkin-thai-2023",
    title: "Effects of BA, TDZ, and NAA on Growth of Philodendron ‘Birkin’ In Vitro",
    url: "https://ph01.tci-thaijo.org/index.php/Scipsru/article/view/250932",
    kind: "peer-reviewed",
    accessedAt: "2026-08-04",
  },
  {
    id: "source-violin-anecdotal-cutting",
    title: "Grower propagation notes for Philodendron bipennifolium (soil cutting, not tissue culture — anecdotal only)",
    url: "https://plantophiles.com/plant-care/philodendron-bipennifolium/",
    kind: "anecdotal",
    accessedAt: "2026-08-04",
  },
];

export function sourceById(id: string): ManualSourceRecord | null {
  return manualSources.find((item) => item.id === id) ?? null;
}
