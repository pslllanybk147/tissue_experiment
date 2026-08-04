import type { PlantPack } from "../types";
import { standardSequence } from "./pink-princess";

// ค้นตามขั้นที่ 1 ของ docs/superpowers/newplant_protocol.md เมื่อ 2026-08-04 ครอบคลุมชื่อวิทยาศาสตร์
// + micropropagation, ชื่อพ้อง (ยืนยันว่า "Philodendron panduriforme" ไม่ใช่ชื่อพ้องของพันธุ์นี้
// ตามที่เข้าใจผิดกันทั่วไป), พันธุ์พี่น้อง/สกุลเดียวกัน, ชื่อไทย, และสิทธิบัตร ยังไม่ได้ค้น
// วิทยานิพนธ์ (OATD/ThaiLIS) และฟอรัมนักปลูกอย่างเป็นระบบ — ดูบันทึกเต็มใน
// docs/superpowers/search-logs/violin-variegated.md
const searchLog = {
  searchedAt: "2026-08-04",
  searchQueries: [
    "Philodendron bipennifolium micropropagation in vitro tissue culture",
    "Philodendron bipennifolium POWO Plants of the World Online accepted name",
    '"Philodendron bipennifolium" synonym "Philodendron panduriforme" OR "Philodendron williamsii"',
    'ฟิโลเดนดรอน ไวโอลิน เพาะเลี้ยงเนื้อเยื่อ OR "Philodendron bipennifolium" การเพาะเลี้ยงเนื้อเยื่อ',
    "Micropropagation of self-heading Philodendron via direct shoot regeneration node explant BA",
    "US Patent plant tissue culture propagation Philodendron explant preparation",
  ],
};

export const violinVariegatedPack: PlantPack = {
  slug: "violin-variegated",
  scientificName: "Philodendron bipennifolium ‘Violin’ variegated",
  commonName: "ฟิโลเดนดรอน ไวโอลิน ด่าง",
  method: "nodal",
  summary:
    "ยังไม่มีงานตรงพันธุ์ ใช้ค่าระดับสกุลจากพันธุ์พี่น้องแบบ self-heading และสิทธิบัตรอุตสาหกรรมเป็นจุดตั้งต้น " +
    "โดยต้องระวังว่าพันธุ์นี้เป็นไม้เลื้อย ต่างจากพันธุ์ที่มีงานรองรับซึ่งเป็นทรงพุ่มตั้ง (self-heading)",
  durationLabel: "4 ถึง 8 เดือน",
  sequence: [...standardSequence],
  overrides: {
    sterilize: {
      evidence: {
        level: "adapted",
        sourceIds: ["source-us-patent-4855236"],
        note:
          "สิทธิบัตรอุตสาหกรรมของพันธุ์พี่น้อง Philodendron 'Burgundy' (ทรงพุ่มตั้ง ไม่ใช่ไม้เลื้อยแบบ Violin) " +
          "ตัดยอดอ่อนยาว 4 ถึง 5 ซม. จากต้นแม่ แล้วฟอกสามขั้นต่อเนื่อง: Proceptil 1.0% 30 นาที, " +
          "สารผสม Captan 0.2% กับ Benlate 0.1% 30 นาที, และปิดท้ายด้วย NaOCl ออกฤทธิ์ 1.0% 20 นาที " +
          "ก่อนล้างและตัดแต่งเหลือ 3 ถึง 5 มม. เป็นสิทธิบัตร ไม่ใช่งานตีพิมพ์ที่ผ่านการทบทวน จึงให้ระดับ adapted " +
          "สูงสุดตามกฎเพดานของแหล่งประเภทนี้ และเป็นสูตรฟอกที่ซับซ้อนกว่า NaOCl เดี่ยวที่ใช้ในคู่มืออื่น " +
          "ผู้ใช้ที่บ้านอาจเข้าถึงแค่ NaOCl ให้เริ่มจากช่วงคลอรีนออกฤทธิ์ 0.5 ถึง 1.0% ตามส่วนที่ 2 ของโปรโตคอลแทน",
      },
    },
    multiply: {
      evidence: {
        level: "adapted",
        sourceIds: ["source-selfheading-philodendron-2012"],
        note:
          "งานทดสอบ Philodendron แบบทรงพุ่มตั้งหลายพันธุ์จากต้นแม่จริง พบว่าชิ้นส่วนข้อลำต้นตอบสนองดีที่สุด " +
          "เมื่อเทียบกับแผ่นใบและก้านใบ และ BA 0.5 ถึง 1 mg/L ให้ยอดที่ความถี่ 55.6 ถึง 80.6% เฉลี่ย 40.8 ถึง 50.4 ยอดต่อชิ้น " +
          "แล้วแต่พันธุ์ที่ทดสอบ พันธุ์ในงานนี้เป็นทรงพุ่มตั้งทั้งหมด ต่างจาก Violin ที่เป็นไม้เลื้อย " +
          "อัตราตอบสนองจริงของ Violin อาจต่างจากนี้ ให้ถือเป็นจุดตั้งต้นเท่านั้น",
      },
    },
    root: {
      evidence: {
        level: "adapted",
        sourceIds: ["source-selfheading-philodendron-2012"],
        note:
          "งานเดียวกับขั้นเพิ่มจำนวน ยอดที่ได้จากอาหาร BA 0.5 mg/L นำไปออกรากด้วย IBA 0.1 ถึง 1 mg/L " +
          "บ่มหนึ่งเดือน ต้นที่ออกรากรอดหลังปรับสภาพในโรงเรือน 100%",
      },
    },
    acclimatize: {
      evidence: { level: "adapted", sourceIds: ["source-kew-philodendron"], note: "ใช้หลักการปรับสภาพทั่วไปของสกุล" },
    },
    monitor: {
      evidence: {
        level: "unsupported",
        sourceIds: [],
        searchedAt: searchLog.searchedAt,
        searchQueries: searchLog.searchQueries,
        note: "ยังไม่มีงานประเมินความคงตัวของลายด่างพันธุ์นี้ ต่างจาก Pink Princess ที่มีงานปี 2025 ประเมินไว้",
      },
    },
  },
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
        searchedAt: searchLog.searchedAt,
        searchQueries: searchLog.searchQueries,
        note: "ไม่มีงานตรงพันธุ์รายงานสูตรตั้งต้นก่อนใส่ฮอร์โมน สูตรนี้เป็นอาหารพื้นฐานทั่วไป",
      },
    },
    {
      id: "multiplication",
      title: "ระยะเพิ่มจำนวนยอด",
      pH: "5.7 ถึง 5.8",
      ingredients: [
        { name: "MS basal salts", amountPerLiter: 1, unit: "×" },
        { name: "Sucrose", amountPerLiter: 30, unit: "g/L" },
        { name: "Agar", amountPerLiter: 7.5, unit: "g/L" },
        { name: "BA", amountPerLiter: 0.5, unit: "mg/L", note: "ใช้น้ำยาแม่ ห้ามชั่งผงโดยตรงเมื่อทำปริมาณน้อย จุดเริ่มของช่วงที่งานทดสอบ 0.5 ถึง 1 mg/L" },
      ],
      evidence: { level: "adapted", sourceIds: ["source-selfheading-philodendron-2012"] },
    },
    {
      id: "rooting",
      title: "ระยะออกราก",
      pH: "5.7 ถึง 5.8",
      ingredients: [
        { name: "MS basal salts", amountPerLiter: 0.5, unit: "×" },
        { name: "Sucrose", amountPerLiter: 30, unit: "g/L" },
        { name: "Agar", amountPerLiter: 7.5, unit: "g/L" },
        { name: "IBA", amountPerLiter: 0.5, unit: "mg/L", note: "ใช้น้ำยาแม่ กึ่งกลางของช่วงที่งานทดสอบ 0.1 ถึง 1 mg/L" },
      ],
      evidence: { level: "adapted", sourceIds: ["source-selfheading-philodendron-2012"] },
    },
  ],
  sourceIds: [
    "source-violin-gap",
    "source-kew-bipennifolium",
    "source-kew-philodendron",
    "source-selfheading-philodendron-2012",
    "source-us-patent-4855236",
  ],
};
