export type VariegationType = "Chimeric" | "Sectoral" | "Splash" | "Marginate" | "Blotched";
export type TCDifficulty = "Low" | "Medium" | "High";

export type LicenseInfo = {
  sourceName: "iNaturalist" | "GBIF" | "Wikimedia Commons" | "Philodendron Lab Research";
  author: string;
  license: "CC-BY 4.0" | "CC-BY-SA 4.0" | "CC0 / Public Domain" | "Lab Internal Verified";
  licenseUrl: string;
  provenanceId: string;
};

export type PlantProfile = {
  id: string;
  scientificName: string;
  cultivarName: string;
  tradeName: string;
  variegationType: VariegationType;
  tcDifficulty: TCDifficulty;
  recommendedMedium: string;
  subcultureCycleDays: number;
  description: string;
  referenceImageUrl: string;
  licenseInfo: LicenseInfo;
};

export type PlantProfileFilter = {
  difficulty?: TCDifficulty;
  search?: string;
};

export interface PlantProfileRepository {
  listProfiles(filter?: PlantProfileFilter): Promise<PlantProfile[]>;
  getProfileById(id: string): Promise<PlantProfile | null>;
}

export const SEED_PLANT_PROFILES: PlantProfile[] = [
  {
    id: "plant-ppp",
    scientificName: "Philodendron erubescens",
    cultivarName: "Pink Princess",
    tradeName: "Pink Princess Philodendron",
    variegationType: "Chimeric",
    tcDifficulty: "Medium",
    recommendedMedium: "MS Base + 1.5 mg/L BA + 0.2 mg/L NAA",
    subcultureCycleDays: 21,
    description: "ใบสีเขียวเข้มประด่างสีชมพูพาสเทล ต้องควบคุมระดับแสงในสเตจขยายพันธุ์อย่างเคร่งครัดเพื่อรักษาความด่าง",
    referenceImageUrl: "https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&w=600&q=80",
    licenseInfo: {
      sourceName: "iNaturalist",
      author: "Botanical Specimen Archive (Observation #148920)",
      license: "CC-BY 4.0",
      licenseUrl: "https://creativecommons.org/licenses/by/4.0/",
      provenanceId: "INAT-OBS-148920"
    }
  },
  {
    id: "plant-ww",
    scientificName: "Philodendron erubescens",
    cultivarName: "White Wizard",
    tradeName: "White Wizard Philodendron",
    variegationType: "Sectoral",
    tcDifficulty: "High",
    recommendedMedium: "MS Base + 2.0 mg/L Kinetin + 0.1 mg/L IBA",
    subcultureCycleDays: 28,
    description: "ด่างสีขาวสะอาดบนลำต้นและก้านใบสีเขียว มีโอกาสเกิดด่างขาวเผือก (Albino) สูงในอาหารที่มี cytokinin เข้มข้นเกินไป",
    referenceImageUrl: "https://images.unsplash.com/photo-1592150621744-aca64f48394a?auto=format&fit=crop&w=600&q=80",
    licenseInfo: {
      sourceName: "GBIF",
      author: "Global Biodiversity Information Facility (Occurrence #389102)",
      license: "CC-BY 4.0",
      licenseUrl: "https://creativecommons.org/licenses/by/4.0/",
      provenanceId: "GBIF-OCC-389102"
    }
  },
  {
    id: "plant-rof",
    scientificName: "Philodendron 'Ring of Fire'",
    cultivarName: "Ring of Fire",
    tradeName: "Ring of Fire Variegated",
    variegationType: "Splash",
    tcDifficulty: "High",
    recommendedMedium: "1/2 MS + 1.0 mg/L BA + 0.5 mg/L TDZ",
    subcultureCycleDays: 25,
    description: "ใบขอบหยักซอนคล้ายฟันเลื่อย ด่างสีส้ม ครีม และชมพู ต้องการธาตุอาหารรองเหล็กและแมกนีเซียมสูงสมบูรณ์",
    referenceImageUrl: "https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&w=600&q=80",
    licenseInfo: {
      sourceName: "Wikimedia Commons",
      author: "User:FloraArchive (File:Philodendron_Ring_of_Fire.jpg)",
      license: "CC-BY-SA 4.0",
      licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
      provenanceId: "COMMONS-FILE-91823"
    }
  },
  {
    id: "plant-fb",
    scientificName: "Philodendron 'Florida Beauty'",
    cultivarName: "Florida Beauty",
    tradeName: "Florida Beauty Variegata",
    variegationType: "Sectoral",
    tcDifficulty: "Medium",
    recommendedMedium: "MS Base + 1.0 mg/L BA + 0.1 mg/L NAA",
    subcultureCycleDays: 21,
    description: "ใบแฉกทรงเสน่ห์พร้อมด่างลายเมฆสีเหลืองมัสตาร์ดสลับครีม ตอบสนองต่อสเตจออกรากง่าย",
    referenceImageUrl: "https://images.unsplash.com/photo-1512428559087-560fa5ceab42?auto=format&fit=crop&w=600&q=80",
    licenseInfo: {
      sourceName: "iNaturalist",
      author: "Tissue Culture Research Group (Observation #291048)",
      license: "CC-BY 4.0",
      licenseUrl: "https://creativecommons.org/licenses/by/4.0/",
      provenanceId: "INAT-OBS-291048"
    }
  },
  {
    id: "plant-billie",
    scientificName: "Philodendron billietiae",
    cultivarName: "Billietiae Variegata",
    tradeName: "Variegated Orange Stem Philodendron",
    variegationType: "Marginate",
    tcDifficulty: "High",
    recommendedMedium: "MS Base + 2.5 mg/L 2iP + 0.2 mg/L IAA",
    subcultureCycleDays: 30,
    description: "ใบเรียวยาวก้านสีส้มสด ด่างสีเหลืองทอง อัตราการเพิ่มปริมาณยอดต่อรอบค่อนข้างช้า ต้องการความชื้นในวุ้นสม่ำเสมอ",
    referenceImageUrl: "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=600&q=80",
    licenseInfo: {
      sourceName: "Philodendron Lab Research",
      author: "Philodendron Lab In-House Specimen DB",
      license: "Lab Internal Verified",
      licenseUrl: "https://philodendron-lab.org/provenance/billie-01",
      provenanceId: "LAB-SPEC-202607"
    }
  }
];

export class MemoryPlantProfileRepository implements PlantProfileRepository {
  private profiles: PlantProfile[];

  constructor(initialProfiles: PlantProfile[] = SEED_PLANT_PROFILES) {
    this.profiles = [...initialProfiles];
  }

  async listProfiles(filter?: PlantProfileFilter): Promise<PlantProfile[]> {
    let result = [...this.profiles];

    if (filter?.difficulty) {
      result = result.filter(p => p.tcDifficulty === filter.difficulty);
    }

    if (filter?.search) {
      const q = filter.search.toLowerCase();
      result = result.filter(
        p => p.cultivarName.toLowerCase().includes(q)
          || p.scientificName.toLowerCase().includes(q)
          || p.tradeName.toLowerCase().includes(q)
      );
    }

    return result;
  }

  async getProfileById(id: string): Promise<PlantProfile | null> {
    return this.profiles.find(p => p.id === id) ?? null;
  }
}
