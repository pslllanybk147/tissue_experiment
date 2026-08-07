import type { PlantPack } from "../types";
import { standardSequence } from "./pink-princess";

/** พันธุ์แรกของสกุล Scindapsus ในระบบ ค้นหลักฐานเต็มตาม newplant_protocol.md เมื่อ 7 สิงหาคม 2026
 *  บันทึกการค้นทั้ง 11 ช่องทางอยู่ใน docs/superpowers/evidence/2026-08-07-scindapsus.md
 *
 *  ไม่มีงานตรงพันธุ์ 'Exotica' เลยสักชิ้น ต่างจาก Thai Constellation แผ่นนี้จึงบางกว่ามาก
 *  เกือบทุกอย่างพึ่งค่าระดับ `adapted` จากชั้นสกุล (genera/scindapsus.ts) ไม่มี override เพิ่ม
 *
 *  ลายด่างสีเงินของพันธุ์นี้ไม่ใช่ chimera จึงไม่ติด traitIds: ["variegated"]
 *  ดูเหตุผลเต็มในบันทึกการค้นหลักฐาน */
export const scindapsusExoticaPack: PlantPack = {
  slug: "scindapsus-exotica",
  scientificName: "Scindapsus pictus Hassk. ‘Exotica’",
  commonName: "พลูเงิน เอ็กโซติกา",
  method: "nodal",
  summary: "พลูเงินด่างเงินธรรมชาติ ยังไม่มีงานวิจัยตรงพันธุ์ ใช้ค่าประยุกต์จากสกุลเดียวกัน",
  durationLabel: "4 ถึง 8 เดือน",
  growthFormId: "climbing-vine-visible-node",
  genusId: "scindapsus",
  sequence: [...standardSequence],
  mediaRecipes: [
    {
      id: "establishment",
      title: "ระยะตั้งต้น",
      pH: "5.7 ถึง 5.8",
      ingredients: [
        { name: "MS basal salts", amountPerLiter: 1, unit: "×" },
        { name: "Sucrose", amountPerLiter: 30, unit: "g/L" },
        { name: "Agar", amountPerLiter: 7.5, unit: "g/L" },
      ],
      evidence: {
        level: "unsupported",
        sourceIds: [],
        searchedAt: "2026-08-07",
        searchQueries: [
          "Scindapsus pictus establishment medium MS sucrose agar concentration",
          "Scindapsus pictus micropropagation in vitro protocol nodal explant",
        ],
        note: "อาหารพื้นฐานที่ยังไม่ใส่ฮอร์โมน ไม่มีงานใดของสกุลนี้ระบุองค์ประกอบระยะตั้งต้นแยกจากระยะเพิ่มจำนวน",
      },
    },
    {
      id: "multiplication",
      title: "ระยะเพิ่มจำนวน",
      pH: "5.7 ถึง 5.8",
      ingredients: [
        { name: "MS basal salts", amountPerLiter: 1, unit: "×" },
        { name: "Sucrose", amountPerLiter: 30, unit: "g/L" },
        { name: "Agar", amountPerLiter: 7.5, unit: "g/L" },
        { name: "myo-Inositol", amountPerLiter: 100, unit: "mg/L" },
        { name: "Thiamine HCl", amountPerLiter: 0.4, unit: "mg/L" },
      ],
      evidence: {
        level: "adapted",
        sourceIds: ["source-miller-murashige-1976"],
        note:
          "องค์ประกอบมาจากงานปี 1976 ที่ทำกับ Scindapsus aureus สกุลเดียวกัน ไม่ใช่ pictus โดยตรง " +
          "เข้าถึงได้แค่บทคัดย่อ/สรุปทุติยภูมิ ยังตรวจไม่ได้ว่าใช้ n เท่าไรต่อทรีตเมนต์และมีกลุ่มควบคุมหรือไม่ " +
          "จึงเป็นระดับประยุกต์ที่มีข้อจำกัดด้านความเข้มงวดทางสถิติกำกับไว้",
      },
    },
  ],
  sourceIds: [
    "source-powo-scindapsus-pictus",
    "source-miller-murashige-1976",
    "source-epipremnum-organogenesis",
    "source-epipremnum-syngonium-invitro",
    "source-scindapsus-aureus-rooting-patent-cn",
  ],
};
