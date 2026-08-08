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
    id: "source-glabra-browning-2016",
    title: "Remedial effect of ascorbic acid and citric acid on oxidative browning of Glycyrrhiza glabra callus cultures",
    url: "https://doi.org/10.5114/bta.2016.62355",
    kind: "peer-reviewed",
    accessedAt: "2026-08-05",
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
  {
    id: "source-botany-plant-morphology",
    title: "Stem (plant) — node, internode, axillary bud",
    url: "https://www.britannica.com/science/stem-plant",
    kind: "technical-guide",
    accessedAt: "2026-08-05",
  },
  {
    id: "source-powo-monstera-deliciosa",
    title: "Monstera deliciosa Liebm. — Plants of the World Online (ชื่อพ้องรวม Philodendron pertusum และ Monstera borsigiana)",
    url: "https://powo.science.kew.org/taxon/urn:lsid:ipni.org:names:87478-1",
    kind: "taxonomy",
    accessedAt: "2026-08-06",
  },
  {
    id: "source-monstera-thai-constellation-2023",
    title:
      "Sivanesan I., Lee Y.K., Kang K.W., Park H.Y. (2023). Micropropagation of Monstera deliciosa Liebm. ‘Thai Constellation’. Propagation of Ornamental Plants 23(2): 31–38",
    url: "https://sejong.elsevierpure.com/en/publications/micropropagation-of-monstera-deliciosa-liebm-thai-constellation/",
    kind: "peer-reviewed",
    accessedAt: "2026-08-06",
  },
  {
    id: "source-monstera-tis-2024",
    title:
      "Micropropagation and Acclimatization of Monstera deliciosa Liebm. ‘Thai Constellation’. Horticulturae 10(1): 1 (2024)",
    url: "https://doi.org/10.3390/horticulturae10010001",
    kind: "peer-reviewed",
    accessedAt: "2026-08-06",
  },
  {
    id: "source-monstera-fonnesbech-1980",
    title:
      "Fonnesbech A., Fonnesbech M. (1980). In Vitro Propagation of Monstera deliciosa. HortScience 15(6): 740–741",
    url: "https://journals.ashs.org/hortsci/view/journals/hortsci/15/6/article-p740.xml",
    kind: "peer-reviewed",
    accessedAt: "2026-08-06",
  },
  {
    id: "source-tdz-aroid-2018",
    title:
      "Chen J., Wei X. (2018). Thidiazuron in Micropropagation of Aroid Plants. In: Thidiazuron: From Urea Derivative to Plant Growth Regulator. Springer: 95–113",
    url: "https://link.springer.com/chapter/10.1007/978-981-10-8004-3_4",
    kind: "peer-reviewed",
    accessedAt: "2026-08-06",
  },
  {
    id: "source-umn-monstera-propagation",
    title: "Propagating Monstera deliciosa — University of Minnesota Extension",
    url: "https://extension.umn.edu/houseplants/propagating-monstera-deliciosa",
    kind: "technical-guide",
    accessedAt: "2026-08-06",
  },
  {
    id: "source-botany-leaf-anatomy",
    title: "Leaf — plant anatomy (blade, petiole, midrib, veins)",
    url: "https://www.britannica.com/science/leaf-plant-anatomy",
    kind: "technical-guide",
    accessedAt: "2026-08-05",
  },
  {
    id: "source-araceae-mayo-1997",
    title: "Araceae — Mayo, Bogner & Boyce, in The Families and Genera of Vascular Plants (leaf divided into blade, petiole and petiole sheath)",
    url: "https://www.researchgate.net/profile/Peter-Boyce-2/publication/279395413_Araceae",
    kind: "technical-guide",
    accessedAt: "2026-08-05",
  },
  {
    id: "source-banana-planting-material-tnau",
    title: "Banana Expert System — planting material and shoot-tip explants (TNAU Agritech Portal)",
    url: "https://www.agritech.tnau.ac.in/expert_system/banana/plantingmaterial.html",
    kind: "technical-guide",
    accessedAt: "2026-08-05",
  },
  {
    id: "source-ginger-micropropagation-2016",
    title: "Micropropagation of ginger (Zingiber officinale var. rubrum) — rhizome buds and shoot tips as responsive explants",
    url: "https://www.pakbs.org/pjbot/PDFs/48(3)/37.pdf",
    kind: "peer-reviewed",
    accessedAt: "2026-08-05",
  },
  {
    id: "source-sansevieria-leaf-disc",
    title: "Micropropagation of Sansevieria cylindrica through leaf disc culture",
    url: "https://www.researchgate.net/publication/235988477",
    kind: "peer-reviewed",
    accessedAt: "2026-08-05",
  },
  {
    id: "source-begonia-adventitious-1998",
    title: "Adventitious shoot regeneration and micropropagation of hybrid tuberous begonia from leaf and petiole segments",
    url: "https://www.sciencedirect.com/science/article/abs/pii/S0304423898001988",
    kind: "peer-reviewed",
    accessedAt: "2026-08-05",
  },
  {
    id: "source-dendrobium-pseudobulb-2020",
    title: "Micropropagation of Dendrobium palpebrae through in vitro developed pseudobulb culture",
    url: "https://www.bsmiab.org/jabet/178-1590167174-micropropagation-of-commercially-important-orchid-dendrobium-palpebrae-lindl-through-in-vitro-developed-pseudobulb-culture",
    kind: "peer-reviewed",
    accessedAt: "2026-08-05",
  },
  {
    id: "source-bamboo-nodal-2014",
    title: "An Effective Protocol for Micropropagation of Edible Bamboo Species (Bambusa tulda and Melocanna baccifera) through Nodal Culture",
    url: "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC4055385/",
    kind: "peer-reviewed",
    accessedAt: "2026-08-05",
  },
  {
    id: "source-adenium-invitro",
    title: "In vitro Propagation of Adenium obesum — nodal segments browned after two weeks, shoot tip and leaf explants responded better",
    url: "https://www.researchgate.net/publication/49591533",
    kind: "peer-reviewed",
    accessedAt: "2026-08-05",
  },
  {
    id: "source-rose-nodal",
    title: "Micropropagation from cultured nodal explants of rose — single-bud nodal stem segments",
    url: "https://www.researchgate.net/profile/Seied-Mehdi-Miri/post/Do_anyone_has_a_micropropagation_protocol_for_strawberry/attachment/5a5d9503b53d2f0bba4b8d10/AS:583306166181890@1516082435426/download/Micropropagation+from+cultured+nodal+explants+of+rose.pdf",
    kind: "peer-reviewed",
    accessedAt: "2026-08-05",
  },
  {
    id: "source-monstera-thai-constellation",
    title: "Micropropagation of Monstera deliciosa Liebm. 'Thai Constellation' — nodal segments 0.8–1.0 cm from mother plants",
    url: "https://sejong.elsevierpure.com/en/publications/micropropagation-of-monstera-deliciosa-liebm-thai-constellation/",
    kind: "peer-reviewed",
    accessedAt: "2026-08-05",
  },
  {
    id: "source-monstera-sterilization",
    title: "Optimization of Surface Sterilization and Organogenesis of Monstera deliciosa — stepped sodium hypochlorite series (บทความในงานประชุมวิชาการ ไม่ใช่วารสารที่ผ่านการทบทวน)",
    url: "https://conference.um.ac.id/index.php/LAS/article/download/7854/2307",
    kind: "technical-guide",
    accessedAt: "2026-08-05",
  },
  {
    id: "source-epipremnum-syngonium-invitro",
    title: "In vitro culture of Epipremnum aureum, Syngonium podophyllum and Lonicera macranthodes",
    url: "https://www.researchgate.net/publication/283888240",
    kind: "peer-reviewed",
    accessedAt: "2026-08-05",
  },
  {
    id: "source-epipremnum-organogenesis",
    title: "Direct Organogenesis of Epipremnum aureum G.S. Bunting for Mass Propagation — single nodal segments with axillary bud",
    url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC12608126/",
    kind: "peer-reviewed",
    accessedAt: "2026-08-05",
  },
  {
    id: "source-anthurium-lamina-petiole",
    title: "In vitro Propagation of Anthurium andraeanum Linn. (White) via Indirect Organogenesis through Leaf Lamina and Petiole Explants",
    url: "https://www.researchgate.net/publication/348844674",
    kind: "peer-reviewed",
    accessedAt: "2026-08-05",
  },
  {
    id: "source-anthurium-sterilization-jewel",
    title: "Standardization of Surface Sterilization Technique for In-vitro Propagation of Anthurium cv. Jewel — best results used mercuric chloride",
    url: "https://www.academia.edu/22728372",
    kind: "peer-reviewed",
    accessedAt: "2026-08-05",
  },
  {
    id: "source-alocasia-commercial",
    title: "Commercial Micropropagation of Alocasia species — disinfection with 3.0% sodium hypochlorite for 20 minutes",
    url: "https://www.academia.edu/37716492",
    kind: "technical-guide",
    accessedAt: "2026-08-05",
  },
  {
    id: "source-sansevieria-trifasciata-2022",
    title: "Indirect organogenesis for high frequency shoot regeneration of two cultivars of Sansevieria trifasciata Prain",
    url: "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC9122912/",
    kind: "peer-reviewed",
    accessedAt: "2026-08-05",
  },
  {
    id: "source-dendrobium-sterilant-2024",
    title:
      "Kajol K. et al. (2024). Efficient Surface Sterilant for Establishment of Dendrobium in vitro Culture. Agricultural Science Digest — เทียบเมอร์คิวริกคลอไรด์กับโซเดียมไฮโปคลอไรต์จากต้นแม่ในโรงเรือนจริง",
    url: "https://doi.org/10.18805/ag.D-6004",
    kind: "peer-reviewed",
    accessedAt: "2026-08-06",
  },
  {
    id: "source-bamboo-tulda-2014",
    title:
      "Waikhom S.D., Louis B. (2014). An Effective Protocol for Micropropagation of Edible Bamboo Species (Bambusa tulda and Melocanna baccifera) through Nodal Culture. The Scientific World Journal",
    url: "https://doi.org/10.1155/2014/345794",
    kind: "peer-reviewed",
    accessedAt: "2026-08-06",
  },
  {
    id: "source-bambusa-balcooa-nodal",
    title:
      "Micropropagation of Bambusa balcooa Roxb. through axillary shoot proliferation — nodal explants from field-grown culms. In Vitro Cellular & Developmental Biology - Plant",
    url: "https://doi.org/10.1007/s11627-011-9403-2",
    kind: "peer-reviewed",
    accessedAt: "2026-08-06",
  },
  {
    id: "source-adenium-invitro-2010",
    title:
      "In vitro Propagation of Adenium obesum (Forssk.) Roem. and Schult. — ยอดจากต้นกล้า Notulae Botanicae Horti Agrobotanici Cluj-Napoca",
    url: "https://www.notulaebotanicae.ro/index.php/nbha/article/view/4604",
    kind: "peer-reviewed",
    accessedAt: "2026-08-06",
  },
  {
    id: "source-ginger-bentong-2021",
    title:
      "Micropropagation of Ginger (Zingiber officinale Roscoe) ‘Bentong’ — ตาเหง้าฟอกด้วยคลอร็อกซ์ 70% นาน 30 นาที",
    url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC8066238/",
    kind: "peer-reviewed",
    accessedAt: "2026-08-06",
  },
  {
    id: "source-begonia-rex-ba-naa",
    title: "Micropropagation of Begonia rex Putz. by 6-benzyladenine (BA) and α-naphthalene acetic acid (NAA)",
    url: "https://www.academia.edu/129044073/Micropropagation_of_Begonia_rex_Putz_by_6_benzyladenine_BA_and_%CE%B1_naphthalene_acetic_acid_NAA_",
    kind: "peer-reviewed",
    accessedAt: "2026-08-06",
  },
  {
    id: "source-teng-nonautoclave-vessels",
    title:
      "Teng W.L. Sterilization of Non-autoclavable Vessels and Culture Media by Sodium Hypochlorite for In Vitro Culture. Acta Horticulturae 839 — อาหารเติม NaOCl 0.002% ภาชนะ 0.01% ที่ pH 5.4 ทำสำเร็จกับกล้วย",
    url: "https://www.actahort.org/books/839/839_42.htm",
    kind: "peer-reviewed",
    accessedAt: "2026-08-07",
  },
  {
    id: "source-sugarcane-nonautoclave-2019",
    title:
      "Suaib S., Suaib N.F. (2019). Non-autoclaved Sterilization Procedures of Sugarcane Tissue in vitro Culture. Journal of Applied Sciences 19(5): 434–440 — น้ำยาฟอกขาว 5.25% ปริมาณ 50 ถึง 200 µL/L ในอาหาร",
    url: "https://doi.org/10.3923/jas.2019.434.440",
    kind: "peer-reviewed",
    accessedAt: "2026-08-07",
  },
  {
    id: "source-nadcc-explant-sterilisation",
    title:
      "Sterilisation of explants and cultures with sodium dichloroisocyanurate. Plant Growth Regulation — NaDCC 300 ppm นาน 24 ถึง 48 ชม. ได้ผลอย่างน้อยเท่าเมอร์คิวริกคลอไรด์ผสมแคลเซียมไฮโปคลอไรต์",
    url: "https://doi.org/10.1007/BF00024060",
    kind: "peer-reviewed",
    accessedAt: "2026-08-07",
  },
  {
    id: "source-nadcc-media-alternative-2021",
    title:
      "Sodium Dichloroisocyanurate: An eco-friendly chemical alternative for media autoclaving and explant sterilisation in plant tissue culture. Int. J. Research in Pharmaceutical Sciences — ช่วงใช้งาน 0.05 ถึง 1.0 g/L",
    url: "https://pharmascope.org/index.php/ijrps/article/view/3943",
    kind: "peer-reviewed",
    accessedAt: "2026-08-07",
  },
  {
    id: "source-nadcc-vs-naocl-1985",
    title:
      "Bloomfield S.F., Miles G.A. A comparison of sodium hypochlorite and sodium dichloroisocyanurate products. Journal of Hospital Infection — ฤทธิ์ฆ่าเชื้อพอกันที่คลอรีนเท่ากัน แต่ NaDCC ทนสารอินทรีย์ได้ดีกว่ามาก",
    url: "https://pubmed.ncbi.nlm.nih.gov/2859320/",
    kind: "peer-reviewed",
    accessedAt: "2026-08-07",
  },
  {
    id: "source-cmu-rose-home-tc",
    title:
      "การเพาะเลี้ยงเนื้อเยื่อกุหลาบอย่างง่าย ๆ — ศูนย์ความเป็นเลิศด้านเทคโนโลยีชีวภาพพืช มหาวิทยาลัยเชียงใหม่ (คลิปสาธิต ไม่ใช่บทความที่ผ่านการทบทวน)",
    url: "https://www.youtube.com/watch?v=QI9bWN1IkOs",
    kind: "technical-guide",
    accessedAt: "2026-08-07",
  },
  {
    id: "source-powo-scindapsus-pictus",
    title: "Scindapsus pictus Hassk. — Plants of the World Online (ชื่อพ้องรวม Epipremnum pictum)",
    url: "https://powo.science.kew.org/taxon/urn:lsid:ipni.org:names:88905-1",
    kind: "taxonomy",
    accessedAt: "2026-08-07",
  },
  {
    id: "source-miller-murashige-1976",
    title:
      "Miller L.R., Murashige T. (1976). Tissue culture propagation of tropical foliage plants. In Vitro 12: 797–813 (Scindapsus aureus — lateral bud explants)",
    url: "https://link.springer.com/article/10.1007/BF02796365",
    kind: "peer-reviewed",
    accessedAt: "2026-08-07",
  },
  {
    id: "source-scindapsus-aureus-rooting-patent-cn",
    title: "CN106613974A — Scindapsus aureus rooting medium and scindapsus aureus rooting culture method",
    url: "https://patents.google.com/patent/CN106613974A/en",
    kind: "patent",
    accessedAt: "2026-08-07",
  },
  {
    id: "source-chan-tan-chew-2003",
    title:
      "Chan L.K., Tan C.M., Chew G.S. (2003). Micropropagation of the Araceae Ornamental Plants. Acta Horticulturae 616: 58 (ISHS) — axillary buds of four Araceae species, MS + 6-BA 2.0 mg/L + IBA 0.5 mg/L",
    url: "https://www.actahort.org/books/616/616_58.htm",
    kind: "peer-reviewed",
    accessedAt: "2026-08-08",
  },
  {
    id: "source-rhaphidophora-decursiva-1988",
    title:
      "Lin Dehui (1988). Tissue culture of Rhaphidophora decursiva shoot tips and stem nodes in vitro. Acta Botanica Yunnanica 10(4): 499–500 (เข้าถึงได้แค่หัวเรื่อง/บรรณานุกรมผ่าน FAO AGRIS ไม่มีเนื้อหาให้ตรวจ ดึงตัวเลขมาใช้ไม่ได้)",
    url: "https://agris.fao.org/agris-search/search.do?recordID=CN8901836",
    kind: "peer-reviewed",
    accessedAt: "2026-08-08",
  },
  {
    id: "source-java-fern-ggb-2024",
    title:
      "Suwannamali W., Wang K.-T., Su C.-C., Kantha P., Tzean Y., Wu T.-M. (2024). Optimizing Green Globular Body Induction for Micropropagation of Microsorum pteropus 'Windeløv'. Horticulturae 10(7): 673",
    url: "https://doi.org/10.3390/horticulturae10070673",
    kind: "peer-reviewed",
    accessedAt: "2026-08-08",
  },
  {
    id: "source-bolbitis-costata-2010",
    title:
      "Mazumder B., Choudhury M.D., Mazumder P.B. (2010). Effect of growth regulators on in vitro propagation of Bolbitis costata. Assam University Journal of Science & Technology 5: 23–33 (ทำกับ Bolbitis costata ไม่ใช่ B. heudelotii แต่เป็นสกุลเดียวกัน)",
    url: "https://www.researchgate.net/publication/265207682",
    kind: "peer-reviewed",
    accessedAt: "2026-08-08",
  },
  {
    id: "source-marsilea-rhizome-2015",
    title:
      "Shekhawat M.S. et al. (2015). In Vitro Regeneration of Shoots and Genetic Fidelity Assessment of Marsilea quadrifolia — rhizome explant organogenesis. Advances in Biology, Article 639678",
    url: "https://doi.org/10.1155/2015/639678",
    kind: "peer-reviewed",
    accessedAt: "2026-08-08",
  },
  {
    id: "source-botany-fern-morphology",
    title: "Fern — frond, rhizome, and sorus morphology",
    url: "https://www.britannica.com/plant/fern-plant",
    kind: "technical-guide",
    accessedAt: "2026-08-08",
  },
  {
    id: "source-hc-barpete-2015",
    title:
      "Barpete S., Özcan S.F., Aasim M., Özcan S. (2015). In vitro high frequency regeneration through apical shoot proliferation of Hemianthus callitrichoides 'Cuba'. Turkish Journal of Biology 39: 493–500",
    url: "https://journals.tubitak.gov.tr/biology/vol39/iss3/17/",
    kind: "peer-reviewed",
    accessedAt: "2026-08-08",
  },
  {
    id: "source-hc-ozcan-2023",
    title:
      "Özcan E., Atar H.H., Ali S.A., Aasim M. (2023). Artificial neural network and decision tree-based models for prediction and validation of in vitro organogenesis of two hydrophytes — Hemianthus callitrichoides and Riccia fluitans. In Vitro Cellular & Developmental Biology – Plant 59(5): 547–562",
    url: "https://doi.org/10.1007/s11627-023-10367-z",
    kind: "peer-reviewed",
    accessedAt: "2026-08-08",
  },
  {
    id: "source-hc-ng-pome-2016",
    title:
      "Ng Y.S., Lim C.R., Chan D.J.C. (2016). Development of treated palm oil mill effluent (POME) culture medium for plant tissue culture of Hemianthus callitrichoides. Journal of Environmental Chemical Engineering 4: 4890–4896",
    url: "https://doi.org/10.1016/j.jece.2016.05.004",
    kind: "peer-reviewed",
    accessedAt: "2026-08-08",
  },
  {
    id: "source-micranthemum-nematode-2025",
    title:
      "Wu T.-M. et al. (2025). From nematode identification to sustainable solution: developing tissue culture propagation for Micranthemum and Cryptocoryne ornamental aquatic plants. BMC Plant Biology 25: 886",
    url: "https://doi.org/10.1186/s12870-025-06894-z",
    kind: "peer-reviewed",
    accessedAt: "2026-08-08",
  },
];

export function sourceById(id: string): ManualSourceRecord | null {
  return manualSources.find((item) => item.id === id) ?? null;
}
