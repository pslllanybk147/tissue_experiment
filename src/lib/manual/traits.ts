import type { EvidenceRef } from "./types";

/** ลักษณะที่ตัดข้ามสกุล เช่นความด่างซึ่งเจอทั้งใน Philodendron, Monstera และ Syngonium
 *  จึงไม่ควรอยู่ในชั้นใดชั้นหนึ่งของ cascade แต่เป็นตัวปรับที่ทาบทับลงไปทีหลัง */
export type Trait = {
  id: string;
  label: string;
  adjustments: {
    /** ชี้ค่าที่ถูกปรับ ใช้คีย์เดียวกับ GrowthForm.defaultDoses เช่น "sterilize.dose" */
    target: string;
    direction: "lower" | "shorter" | "add";
    why: string;
    evidence: EvidenceRef;
  }[];
};

export const traits: Trait[] = [
  {
    id: "variegated",
    label: "พันธุ์ด่าง",
    adjustments: [
      {
        target: "sterilize.dose",
        direction: "lower",
        why: "เนื้อส่วนที่ขาวไม่มีคลอโรฟิลล์ ฟื้นตัวช้ากว่าและตายง่ายกว่าเมื่อเจอสารฟอกเข้มข้นเท่ากัน",
        evidence: {
          level: "unsupported",
          sourceIds: [],
          searchedAt: "2026-08-05",
          searchQueries: [
            "variegated explant sensitivity sodium hypochlorite sterilization",
            "chimeral variegation in vitro establishment survival",
          ],
          note: "ต้องค้นเต็มตาม newplant_protocol.md ในเฟส 2",
        },
      },
      {
        target: "multiply.cytokinin",
        direction: "lower",
        why: "cytokinin สูงเกินไปทำให้ได้ยอดเขียวล้วนหรือขาวล้วน ลายด่างหาย ซึ่งทำลายเป้าหมายของการเพาะพันธุ์ด่าง",
        evidence: {
          level: "unsupported",
          sourceIds: [],
          searchedAt: "2026-08-05",
          searchQueries: [
            "cytokinin concentration variegation stability micropropagation",
            "loss of variegation in vitro shoot multiplication BA",
          ],
          note: "ต้องค้นเต็มตาม newplant_protocol.md ในเฟส 2",
        },
      },
    ],
  },
];

export function traitById(id: string): Trait | null {
  return traits.find((trait) => trait.id === id) ?? null;
}
